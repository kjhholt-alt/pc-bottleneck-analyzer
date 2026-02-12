#!/usr/bin/env python3
"""
PC Bottleneck Analyzer - System Scanner
========================================
Detects hardware configuration and produces structured JSON for bottleneck analysis.

Usage:
    python scanner.py              # Scan and save to system_scan.json
    python scanner.py --upload     # Scan, save, and POST to localhost:3000/api/scan
    python scanner.py --output X   # Scan and save to custom path X

Requirements:
    pip install -r requirements.txt

Works on Windows 10 and 11. Does NOT require admin for basic info.
Some features (temps, SMART health, detailed power) may need elevated access.
"""

import argparse
import json
import os
import platform
import re
import socket
import struct
import subprocess
import sys
import time
import uuid
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# Safe imports — every optional library is wrapped so the scanner never crashes
# ---------------------------------------------------------------------------

try:
    import psutil
except ImportError:
    psutil = None
    print("[WARN] psutil not installed — some system info will be unavailable.")

try:
    import GPUtil
except ImportError:
    GPUtil = None

try:
    import wmi as wmi_module

    _WMI_AVAILABLE = True
except ImportError:
    wmi_module = None
    _WMI_AVAILABLE = False

try:
    import cpuinfo as cpuinfo_module
except ImportError:
    cpuinfo_module = None


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _safe_float(val, default=None):
    """Convert to float, returning *default* on failure."""
    try:
        return float(val)
    except (TypeError, ValueError):
        return default


def _safe_int(val, default=None):
    try:
        return int(val)
    except (TypeError, ValueError):
        return default


def _bytes_to_gb(b, decimals=2):
    if b is None:
        return None
    return round(b / (1024 ** 3), decimals)


def _run_cmd(cmd: str, timeout: int = 10, shell: bool = True) -> str:
    """Run a shell command and return stripped stdout, or empty string on failure."""
    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, shell=shell
        )
        return result.stdout.strip()
    except Exception:
        return ""


def _run_powershell(script: str, timeout: int = 15) -> str:
    """Execute a PowerShell snippet and return stdout."""
    cmd = ["powershell", "-NoProfile", "-NonInteractive", "-Command", script]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
        return result.stdout.strip()
    except Exception:
        return ""


def _wmic(path: str, fields: str, timeout: int = 10) -> list[dict]:
    """
    Query wmic and return a list of dicts.
    Example: _wmic("cpu", "Name,NumberOfCores")
    """
    raw = _run_cmd(f"wmic {path} get {fields} /format:list", timeout=timeout)
    if not raw:
        return []
    entries: list[dict] = []
    current: dict = {}
    for line in raw.splitlines():
        line = line.strip()
        if "=" in line:
            key, _, value = line.partition("=")
            current[key.strip()] = value.strip()
        elif not line and current:
            entries.append(current)
            current = {}
    if current:
        entries.append(current)
    return entries


def _get_wmi_conn():
    """Return a WMI connection object, or None."""
    if not _WMI_AVAILABLE:
        return None
    try:
        return wmi_module.WMI()
    except Exception:
        return None


def _get_wmi_conn_ms():
    """Return a WMI connection to MSAcpi_ThermalZoneTemperature (needs admin)."""
    if not _WMI_AVAILABLE:
        return None
    try:
        return wmi_module.WMI(namespace="root\\wmi")
    except Exception:
        return None


# ---------------------------------------------------------------------------
# CPU Detection
# ---------------------------------------------------------------------------

def scan_cpu() -> dict:
    """Collect CPU information from multiple sources."""
    cpu = {
        "model_name": "unavailable",
        "architecture": platform.machine() or "unavailable",
        "physical_cores": None,
        "logical_cores": None,
        "base_clock_ghz": None,
        "max_boost_clock_ghz": None,
        "current_clock_ghz": None,
        "cache_l1_bytes": None,
        "cache_l2_bytes": None,
        "cache_l3_bytes": None,
        "current_temp_c": None,
        "usage_per_core": [],
        "power_draw_w": None,
    }

    # --- py-cpuinfo ---
    try:
        if cpuinfo_module:
            info = cpuinfo_module.get_cpu_info()
            cpu["model_name"] = info.get("brand_raw", cpu["model_name"])
            cpu["architecture"] = info.get("arch_string_raw", cpu["architecture"])
            hz_actual = info.get("hz_actual_friendly", "")
            if hz_actual:
                ghz_match = re.search(r"([\d.]+)\s*GHz", hz_actual, re.IGNORECASE)
                if ghz_match:
                    cpu["current_clock_ghz"] = _safe_float(ghz_match.group(1))
            hz_advertised = info.get("hz_advertised_friendly", "")
            if hz_advertised:
                ghz_match = re.search(r"([\d.]+)\s*GHz", hz_advertised, re.IGNORECASE)
                if ghz_match:
                    cpu["base_clock_ghz"] = _safe_float(ghz_match.group(1))
            # Cache sizes from cpuinfo
            l1_data = info.get("l1_data_cache_size")
            l1_inst = info.get("l1_instruction_cache_size")
            l2 = info.get("l2_cache_size")
            l3 = info.get("l3_cache_size")

            def _parse_cache(val):
                if val is None:
                    return None
                if isinstance(val, int):
                    return val
                s = str(val).upper().replace(",", "")
                m = re.search(r"([\d.]+)\s*(KB|MB|GB|B)?", s)
                if not m:
                    return None
                num = float(m.group(1))
                unit = m.group(2) or "B"
                mult = {"B": 1, "KB": 1024, "MB": 1024**2, "GB": 1024**3}
                return int(num * mult.get(unit, 1))

            if l1_data or l1_inst:
                l1d = _parse_cache(l1_data) or 0
                l1i = _parse_cache(l1_inst) or 0
                cpu["cache_l1_bytes"] = (l1d + l1i) if (l1d or l1i) else None
            cpu["cache_l2_bytes"] = _parse_cache(l2)
            cpu["cache_l3_bytes"] = _parse_cache(l3)
    except Exception:
        pass

    # --- psutil ---
    try:
        if psutil:
            cpu["physical_cores"] = psutil.cpu_count(logical=False)
            cpu["logical_cores"] = psutil.cpu_count(logical=True)
            freqs = psutil.cpu_freq(percpu=False)
            if freqs:
                if freqs.max and freqs.max > 0:
                    cpu["max_boost_clock_ghz"] = round(freqs.max / 1000, 2)
                if freqs.current and freqs.current > 0:
                    cpu["current_clock_ghz"] = round(freqs.current / 1000, 2)
                if cpu["base_clock_ghz"] is None and freqs.min and freqs.min > 0:
                    cpu["base_clock_ghz"] = round(freqs.min / 1000, 2)
            per_core = psutil.cpu_percent(interval=0.5, percpu=True)
            cpu["usage_per_core"] = per_core if per_core else []
    except Exception:
        pass

    # --- WMI for base clock ---
    try:
        w = _get_wmi_conn()
        if w:
            for proc in w.Win32_Processor():
                if cpu["model_name"] == "unavailable":
                    cpu["model_name"] = getattr(proc, "Name", cpu["model_name"]).strip()
                max_mhz = _safe_int(getattr(proc, "MaxClockSpeed", None))
                if max_mhz and cpu["base_clock_ghz"] is None:
                    cpu["base_clock_ghz"] = round(max_mhz / 1000, 2)
                if cpu["cache_l2_bytes"] is None:
                    l2_kb = _safe_int(getattr(proc, "L2CacheSize", None))
                    if l2_kb:
                        cpu["cache_l2_bytes"] = l2_kb * 1024
                if cpu["cache_l3_bytes"] is None:
                    l3_kb = _safe_int(getattr(proc, "L3CacheSize", None))
                    if l3_kb:
                        cpu["cache_l3_bytes"] = l3_kb * 1024
                break
    except Exception:
        pass

    # --- wmic fallback for model ---
    if cpu["model_name"] == "unavailable":
        try:
            rows = _wmic("cpu", "Name,MaxClockSpeed,NumberOfCores,NumberOfLogicalProcessors,L2CacheSize,L3CacheSize")
            if rows:
                r = rows[0]
                cpu["model_name"] = r.get("Name", cpu["model_name"])
                if cpu["physical_cores"] is None:
                    cpu["physical_cores"] = _safe_int(r.get("NumberOfCores"))
                if cpu["logical_cores"] is None:
                    cpu["logical_cores"] = _safe_int(r.get("NumberOfLogicalProcessors"))
                if cpu["base_clock_ghz"] is None:
                    mhz = _safe_int(r.get("MaxClockSpeed"))
                    if mhz:
                        cpu["base_clock_ghz"] = round(mhz / 1000, 2)
        except Exception:
            pass

    # --- Temperature (needs admin usually) ---
    try:
        if psutil and hasattr(psutil, "sensors_temperatures"):
            temps = psutil.sensors_temperatures()
            if temps:
                for name in ("coretemp", "k10temp", "cpu_thermal", "acpitz"):
                    if name in temps and temps[name]:
                        cpu["current_temp_c"] = temps[name][0].current
                        break
    except Exception:
        pass

    # WMI thermal fallback (admin required)
    if cpu["current_temp_c"] is None:
        try:
            wmi_ms = _get_wmi_conn_ms()
            if wmi_ms:
                for tz in wmi_ms.MSAcpi_ThermalZoneTemperature():
                    kelvin_tenths = _safe_float(tz.CurrentTemperature)
                    if kelvin_tenths:
                        celsius = (kelvin_tenths / 10.0) - 273.15
                        if 0 < celsius < 120:
                            cpu["current_temp_c"] = round(celsius, 1)
                            break
        except Exception:
            pass

    # --- CPU Power draw via LibreHardwareMonitor / OpenHardwareMonitor WMI (if running) ---
    try:
        if _WMI_AVAILABLE:
            ohm = wmi_module.WMI(namespace="root\\OpenHardwareMonitor")
            for sensor in ohm.Sensor():
                if sensor.SensorType == "Power" and "CPU" in sensor.Name:
                    cpu["power_draw_w"] = round(float(sensor.Value), 1)
                    break
    except Exception:
        pass

    if cpu["power_draw_w"] is None:
        try:
            if _WMI_AVAILABLE:
                lhm = wmi_module.WMI(namespace="root\\LibreHardwareMonitor")
                for sensor in lhm.Sensor():
                    if sensor.SensorType == "Power" and "CPU" in sensor.Name:
                        cpu["power_draw_w"] = round(float(sensor.Value), 1)
                        break
        except Exception:
            pass

    return cpu


# ---------------------------------------------------------------------------
# GPU Detection
# ---------------------------------------------------------------------------

def scan_gpu() -> dict:
    gpu = {
        "model_name": "unavailable",
        "vram_total_gb": None,
        "vram_used_gb": None,
        "gpu_clock_mhz": None,
        "memory_clock_mhz": None,
        "current_temp_c": None,
        "fan_speed_pct": None,
        "driver_version": None,
        "gpu_utilization_pct": None,
        "pcie_generation": None,
        "pcie_link_width": None,
    }

    # --- GPUtil ---
    try:
        if GPUtil:
            gpus = GPUtil.getGPUs()
            if gpus:
                g = gpus[0]
                gpu["model_name"] = g.name or gpu["model_name"]
                gpu["vram_total_gb"] = round(g.memoryTotal / 1024, 2) if g.memoryTotal else None
                gpu["vram_used_gb"] = round(g.memoryUsed / 1024, 2) if g.memoryUsed else None
                gpu["current_temp_c"] = g.temperature
                gpu["gpu_utilization_pct"] = g.load * 100 if g.load is not None else None
                gpu["driver_version"] = g.driver
    except Exception:
        pass

    # --- nvidia-smi fallback / augment ---
    try:
        smi_query = (
            "nvidia-smi --query-gpu="
            "name,memory.total,memory.used,clocks.current.graphics,clocks.current.memory,"
            "temperature.gpu,fan.speed,driver_version,utilization.gpu,pcie.link.gen.current,"
            "pcie.link.width.current"
            " --format=csv,noheader,nounits"
        )
        raw = _run_cmd(smi_query, timeout=10)
        if raw:
            parts = [p.strip() for p in raw.split(",")]
            if len(parts) >= 11:
                if gpu["model_name"] == "unavailable":
                    gpu["model_name"] = parts[0]
                if gpu["vram_total_gb"] is None:
                    vram_mb = _safe_float(parts[1])
                    if vram_mb:
                        gpu["vram_total_gb"] = round(vram_mb / 1024, 2)
                if gpu["vram_used_gb"] is None:
                    vused_mb = _safe_float(parts[2])
                    if vused_mb:
                        gpu["vram_used_gb"] = round(vused_mb / 1024, 2)
                if gpu["gpu_clock_mhz"] is None:
                    gpu["gpu_clock_mhz"] = _safe_float(parts[3])
                if gpu["memory_clock_mhz"] is None:
                    gpu["memory_clock_mhz"] = _safe_float(parts[4])
                if gpu["current_temp_c"] is None:
                    gpu["current_temp_c"] = _safe_float(parts[5])
                if gpu["fan_speed_pct"] is None:
                    fan = _safe_float(parts[6])
                    gpu["fan_speed_pct"] = fan
                if gpu["driver_version"] is None:
                    gpu["driver_version"] = parts[7] if parts[7] and parts[7] != "[N/A]" else None
                if gpu["gpu_utilization_pct"] is None:
                    gpu["gpu_utilization_pct"] = _safe_float(parts[8])
                gen = parts[9] if len(parts) > 9 else None
                width = parts[10] if len(parts) > 10 else None
                gpu["pcie_generation"] = _safe_int(gen)
                gpu["pcie_link_width"] = _safe_int(width)
    except Exception:
        pass

    # --- WMI fallback for model/VRAM ---
    if gpu["model_name"] == "unavailable":
        try:
            w = _get_wmi_conn()
            if w:
                for vc in w.Win32_VideoController():
                    name = getattr(vc, "Name", "")
                    # Prefer discrete GPU over integrated
                    if any(k in name.upper() for k in ("NVIDIA", "AMD", "RADEON", "GEFORCE", "RTX", "GTX", "RX ")):
                        gpu["model_name"] = name.strip()
                        ram_bytes = _safe_int(getattr(vc, "AdapterRAM", None))
                        if ram_bytes and gpu["vram_total_gb"] is None:
                            gpu["vram_total_gb"] = round(ram_bytes / (1024 ** 3), 2)
                        drv = getattr(vc, "DriverVersion", None)
                        if drv and gpu["driver_version"] is None:
                            gpu["driver_version"] = drv
                        break
                else:
                    # No discrete found; take the first one
                    for vc in w.Win32_VideoController():
                        gpu["model_name"] = getattr(vc, "Name", gpu["model_name"]).strip()
                        ram_bytes = _safe_int(getattr(vc, "AdapterRAM", None))
                        if ram_bytes and gpu["vram_total_gb"] is None:
                            gpu["vram_total_gb"] = round(ram_bytes / (1024 ** 3), 2)
                        drv = getattr(vc, "DriverVersion", None)
                        if drv and gpu["driver_version"] is None:
                            gpu["driver_version"] = drv
                        break
        except Exception:
            pass

    # wmic fallback
    if gpu["model_name"] == "unavailable":
        try:
            rows = _wmic("path win32_videocontroller", "Name,AdapterRAM,DriverVersion")
            if rows:
                r = rows[0]
                gpu["model_name"] = r.get("Name", gpu["model_name"])
                ram = _safe_int(r.get("AdapterRAM"))
                if ram and gpu["vram_total_gb"] is None:
                    gpu["vram_total_gb"] = round(ram / (1024 ** 3), 2)
                if gpu["driver_version"] is None:
                    gpu["driver_version"] = r.get("DriverVersion")
        except Exception:
            pass

    return gpu


# ---------------------------------------------------------------------------
# RAM Detection
# ---------------------------------------------------------------------------

def scan_ram() -> dict:
    ram = {
        "total_gb": None,
        "speed_mhz": None,
        "rated_speed_mhz": None,
        "num_sticks": None,
        "num_slots": None,
        "channel_mode": None,
        "form_factor": None,
        "timings": {
            "cl": None,
            "trcd": None,
            "trp": None,
            "tras": None,
        },
        "current_used_gb": None,
        "usage_percent": None,
    }

    # --- psutil for totals ---
    try:
        if psutil:
            mem = psutil.virtual_memory()
            ram["total_gb"] = round(mem.total / (1024 ** 3), 2)
            ram["current_used_gb"] = round(mem.used / (1024 ** 3), 2)
            ram["usage_percent"] = mem.percent
    except Exception:
        pass

    # --- WMI: PhysicalMemory ---
    sticks_detected = []
    try:
        w = _get_wmi_conn()
        if w:
            for stick in w.Win32_PhysicalMemory():
                info = {}
                speed = _safe_int(getattr(stick, "ConfiguredClockSpeed", None))
                if speed is None:
                    speed = _safe_int(getattr(stick, "Speed", None))
                info["actual_speed"] = speed
                info["rated_speed"] = _safe_int(getattr(stick, "Speed", None))
                cap = _safe_int(getattr(stick, "Capacity", None))
                info["capacity_bytes"] = cap
                ff_code = _safe_int(getattr(stick, "FormFactor", None))
                form_map = {8: "DIMM", 12: "SODIMM"}
                info["form_factor"] = form_map.get(ff_code, f"code_{ff_code}" if ff_code else "unavailable")
                sticks_detected.append(info)

            ram["num_sticks"] = len(sticks_detected)
            if sticks_detected:
                speeds = [s["actual_speed"] for s in sticks_detected if s["actual_speed"]]
                if speeds:
                    ram["speed_mhz"] = min(speeds)
                rated = [s["rated_speed"] for s in sticks_detected if s["rated_speed"]]
                if rated:
                    ram["rated_speed_mhz"] = max(rated)
                ffs = [s["form_factor"] for s in sticks_detected if s["form_factor"] != "unavailable"]
                if ffs:
                    ram["form_factor"] = ffs[0]

            # Slot count
            try:
                arrays = w.Win32_PhysicalMemoryArray()
                if arrays:
                    total_slots = sum(_safe_int(getattr(a, "MemoryDevices", 0)) or 0 for a in arrays)
                    ram["num_slots"] = total_slots if total_slots > 0 else None
            except Exception:
                pass
    except Exception:
        pass

    # --- wmic fallback for sticks ---
    if not sticks_detected:
        try:
            rows = _wmic("memorychip", "Capacity,ConfiguredClockSpeed,Speed,FormFactor")
            if rows:
                ram["num_sticks"] = len(rows)
                speeds = []
                rated_speeds = []
                for r in rows:
                    s = _safe_int(r.get("ConfiguredClockSpeed")) or _safe_int(r.get("Speed"))
                    if s:
                        speeds.append(s)
                    rs = _safe_int(r.get("Speed"))
                    if rs:
                        rated_speeds.append(rs)
                if speeds:
                    ram["speed_mhz"] = min(speeds)
                if rated_speeds:
                    ram["rated_speed_mhz"] = max(rated_speeds)
        except Exception:
            pass

    # --- Channel mode heuristic ---
    if ram["num_sticks"]:
        n = ram["num_sticks"]
        if n == 1:
            ram["channel_mode"] = "single"
        elif n == 2:
            ram["channel_mode"] = "dual"
        elif n in (3, 6):
            ram["channel_mode"] = "triple"
        elif n >= 4:
            ram["channel_mode"] = "quad"

    # --- Total fallback ---
    if ram["total_gb"] is None:
        try:
            raw = _run_cmd("wmic computersystem get TotalPhysicalMemory /format:list")
            for line in raw.splitlines():
                if "TotalPhysicalMemory" in line:
                    val = _safe_int(line.split("=")[-1].strip())
                    if val:
                        ram["total_gb"] = round(val / (1024 ** 3), 2)
        except Exception:
            pass

    # --- Timings via PowerShell (rare but worth trying) ---
    try:
        # Try reading from SMBIOS via WMI — timings not standard in Win32_PhysicalMemory
        # but some vendors expose them. This is best-effort.
        pass
    except Exception:
        pass

    return ram


# ---------------------------------------------------------------------------
# Storage Detection
# ---------------------------------------------------------------------------

def scan_storage() -> list[dict]:
    drives = []

    # --- psutil disk partitions + usage ---
    partition_map: dict[str, dict] = {}
    try:
        if psutil:
            for part in psutil.disk_partitions(all=False):
                try:
                    usage = psutil.disk_usage(part.mountpoint)
                    partition_map[part.device] = {
                        "mountpoint": part.mountpoint,
                        "fstype": part.fstype,
                        "capacity_gb": round(usage.total / (1024 ** 3), 2),
                        "used_gb": round(usage.used / (1024 ** 3), 2),
                        "free_gb": round(usage.free / (1024 ** 3), 2),
                    }
                except Exception:
                    pass
    except Exception:
        pass

    # --- WMI: Win32_DiskDrive ---
    try:
        w = _get_wmi_conn()
        if w:
            boot_disk_index = None
            # Find boot disk
            try:
                for part in w.Win32_DiskPartition():
                    if getattr(part, "BootPartition", False):
                        boot_disk_index = _safe_int(getattr(part, "DiskIndex", None))
                        break
            except Exception:
                pass

            for disk in w.Win32_DiskDrive():
                d = {
                    "model": "unavailable",
                    "type": "unavailable",
                    "capacity_gb": None,
                    "used_gb": None,
                    "free_gb": None,
                    "interface": "unavailable",
                    "health_status": None,
                    "is_boot_drive": False,
                }
                d["model"] = getattr(disk, "Model", "unavailable").strip()
                size_bytes = _safe_int(getattr(disk, "Size", None))
                if size_bytes:
                    d["capacity_gb"] = round(size_bytes / (1024 ** 3), 2)

                iface = getattr(disk, "InterfaceType", "") or ""
                media = (getattr(disk, "MediaType", "") or "").upper()
                model_upper = d["model"].upper()

                # Determine interface and type
                if "NVME" in model_upper or "NVME" in iface.upper():
                    d["interface"] = "NVMe"
                    d["type"] = "NVMe SSD"
                elif "SATA" in iface.upper() or "IDE" in iface.upper() or "SCSI" in iface.upper():
                    d["interface"] = "SATA"
                    if "SSD" in model_upper or "SOLID" in media:
                        d["type"] = "SATA SSD"
                    elif "FIXED" in media:
                        # Could be SSD or HDD; heuristic: if no "HDD" or rotation keyword
                        if any(k in model_upper for k in ("HDD", "BARRACUDA", "CAVIAR", "IRONWOLF", "WD BLUE WD10", "WD BLACK WD")):
                            d["type"] = "HDD"
                        else:
                            d["type"] = "SATA SSD"
                    else:
                        d["type"] = "HDD"
                else:
                    d["interface"] = iface if iface else "unavailable"

                # Check if boot
                idx = _safe_int(getattr(disk, "Index", None))
                if idx is not None and idx == boot_disk_index:
                    d["is_boot_drive"] = True

                # Map partitions for usage data
                try:
                    for assoc in disk.associators(wmi_result_class="Win32_DiskPartition"):
                        for logical in assoc.associators(wmi_result_class="Win32_LogicalDisk"):
                            device_id = getattr(logical, "DeviceID", "")
                            for pdev, pinfo in partition_map.items():
                                if device_id and pdev.startswith(device_id):
                                    d["used_gb"] = pinfo.get("used_gb")
                                    d["free_gb"] = pinfo.get("free_gb")
                                    if d["capacity_gb"] is None:
                                        d["capacity_gb"] = pinfo.get("capacity_gb")
                except Exception:
                    pass

                drives.append(d)
    except Exception:
        pass

    # --- wmic fallback ---
    if not drives:
        try:
            rows = _wmic("diskdrive", "Model,Size,InterfaceType,Index,MediaType")
            for r in rows:
                d = {
                    "model": r.get("Model", "unavailable"),
                    "type": "unavailable",
                    "capacity_gb": None,
                    "used_gb": None,
                    "free_gb": None,
                    "interface": r.get("InterfaceType", "unavailable"),
                    "health_status": None,
                    "is_boot_drive": False,
                }
                size = _safe_int(r.get("Size"))
                if size:
                    d["capacity_gb"] = round(size / (1024 ** 3), 2)
                drives.append(d)
        except Exception:
            pass

    # --- Health via PowerShell Get-PhysicalDisk ---
    try:
        raw = _run_powershell(
            "Get-PhysicalDisk | Select-Object FriendlyName,HealthStatus,MediaType,BusType | ConvertTo-Json"
        )
        if raw:
            pdata = json.loads(raw)
            if isinstance(pdata, dict):
                pdata = [pdata]
            for pd in pdata:
                fname = (pd.get("FriendlyName") or "").strip().upper()
                health = pd.get("HealthStatus", "")
                media_type = pd.get("MediaType", "")
                bus_type = pd.get("BusType", "")
                for d in drives:
                    if d["model"].upper().strip() in fname or fname in d["model"].upper().strip():
                        d["health_status"] = health if health else None
                        # Refine type using PowerShell MediaType
                        if media_type:
                            mt = str(media_type).upper()
                            bt = str(bus_type).upper()
                            if "SSD" in mt or mt == "4":
                                if "NVME" in bt or bt == "17":
                                    d["type"] = "NVMe SSD"
                                    d["interface"] = "NVMe"
                                else:
                                    d["type"] = "SATA SSD"
                            elif "HDD" in mt or mt == "3":
                                d["type"] = "HDD"
                        break
    except Exception:
        pass

    # If we still have no usage data, try filling from partition_map
    if drives and partition_map:
        # Simple: assign first partition to first drive if only one drive
        if len(drives) == 1 and partition_map:
            first_part = list(partition_map.values())[0]
            if drives[0]["used_gb"] is None:
                drives[0]["used_gb"] = first_part.get("used_gb")
                drives[0]["free_gb"] = first_part.get("free_gb")

    return drives


# ---------------------------------------------------------------------------
# Motherboard Detection
# ---------------------------------------------------------------------------

def scan_motherboard() -> dict:
    mb = {
        "model": "unavailable",
        "chipset": None,
        "bios_version": "unavailable",
        "bios_date": None,
    }

    # --- WMI ---
    try:
        w = _get_wmi_conn()
        if w:
            for board in w.Win32_BaseBoard():
                mfr = (getattr(board, "Manufacturer", "") or "").strip()
                prod = (getattr(board, "Product", "") or "").strip()
                mb["model"] = f"{mfr} {prod}".strip() if (mfr or prod) else "unavailable"
                break
            for bios in w.Win32_BIOS():
                mb["bios_version"] = (getattr(bios, "SMBIOSBIOSVersion", "") or getattr(bios, "Version", "") or "").strip()
                date_raw = getattr(bios, "ReleaseDate", "")
                if date_raw:
                    # WMI date format: 20230101000000.000000+000
                    m = re.match(r"(\d{4})(\d{2})(\d{2})", str(date_raw))
                    if m:
                        mb["bios_date"] = f"{m.group(1)}-{m.group(2)}-{m.group(3)}"
                break
    except Exception:
        pass

    # --- wmic fallback ---
    if mb["model"] == "unavailable":
        try:
            rows = _wmic("baseboard", "Manufacturer,Product")
            if rows:
                mfr = rows[0].get("Manufacturer", "")
                prod = rows[0].get("Product", "")
                mb["model"] = f"{mfr} {prod}".strip()
        except Exception:
            pass

    if mb["bios_version"] == "unavailable":
        try:
            rows = _wmic("bios", "SMBIOSBIOSVersion,ReleaseDate")
            if rows:
                mb["bios_version"] = rows[0].get("SMBIOSBIOSVersion", "unavailable")
        except Exception:
            pass

    # --- Chipset via registry or WMI ---
    try:
        raw = _run_powershell(
            "(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Enum\\PCI\\*\\*' -Name DeviceDesc -ErrorAction SilentlyContinue | "
            "Where-Object { $_.DeviceDesc -match 'chipset|ISA|LPC|SMBus' } | Select-Object -First 1).DeviceDesc"
        )
        if raw:
            # Format: @...; description or just description
            chipset = raw.split(";")[-1].strip() if ";" in raw else raw.strip()
            if chipset:
                mb["chipset"] = chipset
    except Exception:
        pass

    return mb


# ---------------------------------------------------------------------------
# OS Detection
# ---------------------------------------------------------------------------

def scan_os() -> dict:
    os_info = {
        "windows_version": "unavailable",
        "build_number": None,
        "is_up_to_date": None,
        "power_plan": None,
        "game_mode": None,
        "hw_accelerated_gpu_scheduling": None,
        "virtual_memory_gb": None,
    }

    # --- Basic version ---
    try:
        ver = platform.version()
        release = platform.release()
        edition = platform.win32_edition() if hasattr(platform, "win32_edition") else ""
        os_info["windows_version"] = f"Windows {release}" + (f" {edition}" if edition else "")
        os_info["build_number"] = ver
    except Exception:
        pass

    # Refine: detect W11 vs W10 via build
    try:
        build_str = os_info["build_number"] or ""
        build_num = _safe_int(build_str.split(".")[0])
        if build_num and build_num >= 22000 and "11" not in os_info["windows_version"]:
            os_info["windows_version"] = os_info["windows_version"].replace("Windows 10", "Windows 11")
    except Exception:
        pass

    # Display version (23H2 etc)
    try:
        dv = _run_powershell(
            "(Get-ItemProperty -Path 'HKLM:\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' -Name DisplayVersion -ErrorAction SilentlyContinue).DisplayVersion"
        )
        if dv:
            os_info["windows_version"] += f" {dv}"
    except Exception:
        pass

    # --- Power plan ---
    try:
        raw = _run_cmd("powercfg /getactivescheme")
        if raw:
            # Format: Power Scheme GUID: ... (Plan Name)
            m = re.search(r"\((.+)\)", raw)
            if m:
                os_info["power_plan"] = m.group(1)
    except Exception:
        pass

    # --- Game Mode ---
    try:
        gm = _run_powershell(
            "(Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\GameBar' -Name AllowAutoGameMode -ErrorAction SilentlyContinue).AllowAutoGameMode"
        )
        if gm == "1" or gm == "":
            os_info["game_mode"] = True
        elif gm == "0":
            os_info["game_mode"] = False
        else:
            # Default is ON if key doesn't exist
            auto = _run_powershell(
                "(Get-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\GameBar' -Name AutoGameModeEnabled -ErrorAction SilentlyContinue).AutoGameModeEnabled"
            )
            if auto == "1" or auto == "":
                os_info["game_mode"] = True
            elif auto == "0":
                os_info["game_mode"] = False
            else:
                os_info["game_mode"] = True  # Default on in modern Windows
    except Exception:
        pass

    # --- HW-accelerated GPU scheduling ---
    try:
        hags = _run_powershell(
            "(Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\GraphicsDrivers' -Name HwSchMode -ErrorAction SilentlyContinue).HwSchMode"
        )
        if hags == "2":
            os_info["hw_accelerated_gpu_scheduling"] = True
        elif hags in ("1", "0"):
            os_info["hw_accelerated_gpu_scheduling"] = False
    except Exception:
        pass

    # --- Virtual memory (pagefile) ---
    try:
        if psutil:
            swap = psutil.swap_memory()
            os_info["virtual_memory_gb"] = round(swap.total / (1024 ** 3), 2)
    except Exception:
        pass

    return os_info


# ---------------------------------------------------------------------------
# Network Detection
# ---------------------------------------------------------------------------

def scan_network() -> dict:
    net = {
        "connection_type": "unavailable",
        "speed_mbps": None,
        "latency_ms": None,
    }

    # --- Connection type & speed ---
    try:
        w = _get_wmi_conn()
        if w:
            for adapter in w.Win32_NetworkAdapter():
                connected = getattr(adapter, "NetConnectionStatus", None)
                if connected == 2:  # Connected
                    name = (getattr(adapter, "Name", "") or "").upper()
                    speed = _safe_int(getattr(adapter, "Speed", None))
                    adapter_type = getattr(adapter, "AdapterType", "") or ""

                    if any(k in name for k in ("WI-FI", "WIFI", "WIRELESS", "WLAN", "802.11")):
                        net["connection_type"] = "WiFi"
                    elif any(k in name for k in ("ETHERNET", "LAN", "REALTEK", "INTEL I", "KILLER")):
                        net["connection_type"] = "Ethernet"
                    elif "802.3" in adapter_type:
                        net["connection_type"] = "Ethernet"
                    else:
                        net["connection_type"] = adapter_type if adapter_type else "Wired"

                    if speed:
                        net["speed_mbps"] = round(speed / 1_000_000)
                    break
    except Exception:
        pass

    # psutil fallback
    if net["connection_type"] == "unavailable":
        try:
            if psutil:
                stats = psutil.net_if_stats()
                for iface, snic in stats.items():
                    if snic.isup and snic.speed > 0:
                        upper = iface.upper()
                        if any(k in upper for k in ("WI-FI", "WIFI", "WIRELESS", "WLAN")):
                            net["connection_type"] = "WiFi"
                        elif any(k in upper for k in ("ETH", "LAN", "REALTEK", "INTEL")):
                            net["connection_type"] = "Ethernet"
                        else:
                            net["connection_type"] = "Connected"
                        net["speed_mbps"] = snic.speed
                        break
        except Exception:
            pass

    # --- Latency (ping 8.8.8.8) ---
    try:
        raw = _run_cmd("ping -n 1 -w 3000 8.8.8.8", timeout=8)
        if raw:
            m = re.search(r"Average\s*=\s*(\d+)", raw)
            if m:
                net["latency_ms"] = _safe_float(m.group(1))
            else:
                # Try "time=XXms" or "time<1ms"
                m2 = re.search(r"time[=<](\d+)", raw)
                if m2:
                    net["latency_ms"] = _safe_float(m2.group(1))
    except Exception:
        pass

    return net


# ---------------------------------------------------------------------------
# BIOS Settings Detection
# ---------------------------------------------------------------------------

def scan_bios_settings(ram_info: dict) -> dict:
    bios = {
        "xmp_enabled": None,
        "resizable_bar": None,
        "tpm_status": None,
        "virtualization": None,
        "secure_boot": None,
    }

    # --- XMP detection heuristic ---
    actual = ram_info.get("speed_mhz")
    rated = ram_info.get("rated_speed_mhz")
    if actual and rated:
        # If actual speed is significantly lower than rated, XMP is likely off
        # JEDEC defaults: DDR4=2133/2400, DDR5=4800
        if actual >= rated * 0.95:
            bios["xmp_enabled"] = True
        elif actual < rated * 0.8:
            bios["xmp_enabled"] = False
        else:
            bios["xmp_enabled"] = None  # Ambiguous

    # --- Resizable BAR ---
    try:
        rebar = _run_powershell(
            "Get-ItemProperty -Path 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Class\\{4d36e968-e325-11ce-bfc1-08002be10318}\\0*' "
            "-Name 'ReBarState' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty ReBarState"
        )
        if rebar:
            bios["resizable_bar"] = True
    except Exception:
        pass

    if bios["resizable_bar"] is None:
        try:
            smi = _run_cmd("nvidia-smi --query-gpu=pci.sub_device_id --format=csv,noheader", timeout=5)
            # Check for rebar via nvidia-smi BAR1 memory
            bar1_raw = _run_cmd(
                "nvidia-smi --query-gpu=bar1.total --format=csv,noheader,nounits", timeout=5
            )
            bar1 = _safe_float(bar1_raw)
            if bar1 and bar1 > 256:
                bios["resizable_bar"] = True
            elif bar1:
                bios["resizable_bar"] = False
        except Exception:
            pass

    # --- TPM ---
    try:
        tpm = _run_powershell(
            "(Get-Tpm -ErrorAction SilentlyContinue).TpmPresent"
        )
        if tpm.upper() == "TRUE":
            bios["tpm_status"] = "enabled"
        elif tpm.upper() == "FALSE":
            bios["tpm_status"] = "not present"
    except Exception:
        pass

    if bios["tpm_status"] is None:
        try:
            tpm_wmi = _run_powershell(
                "Get-CimInstance -Namespace 'root\\cimv2\\Security\\MicrosoftTpm' -ClassName Win32_Tpm -ErrorAction SilentlyContinue | "
                "Select-Object -ExpandProperty IsEnabled_InitialValue"
            )
            if tpm_wmi.upper() == "TRUE":
                bios["tpm_status"] = "enabled"
        except Exception:
            pass

    # --- Virtualization ---
    try:
        virt = _run_powershell(
            "(Get-CimInstance -ClassName Win32_Processor -ErrorAction SilentlyContinue).VirtualizationFirmwareEnabled"
        )
        if virt.upper() == "TRUE":
            bios["virtualization"] = True
        elif virt.upper() == "FALSE":
            bios["virtualization"] = False
    except Exception:
        pass

    # --- Secure Boot ---
    try:
        sb = _run_powershell("Confirm-SecureBootUEFI -ErrorAction SilentlyContinue")
        if sb.upper() == "TRUE":
            bios["secure_boot"] = True
        elif sb.upper() == "FALSE":
            bios["secure_boot"] = False
    except Exception:
        pass

    return bios


# ---------------------------------------------------------------------------
# Issues Detection
# ---------------------------------------------------------------------------

def detect_issues(cpu, gpu, ram, storage, os_info, bios_settings) -> list[str]:
    """Analyze collected data and return a list of potential issues / warnings."""
    issues = []

    # 1. XMP not enabled
    actual_speed = ram.get("speed_mhz")
    rated_speed = ram.get("rated_speed_mhz")
    if actual_speed and rated_speed and actual_speed < rated_speed * 0.9:
        issues.append(
            f"RAM running at {actual_speed}MHz but rated for {rated_speed}MHz "
            f"-- XMP may not be enabled in BIOS"
        )

    # 2. Power plan not High Performance
    power_plan = os_info.get("power_plan", "") or ""
    if power_plan and "high performance" not in power_plan.lower() and "ultimate" not in power_plan.lower():
        issues.append(
            f'Power plan set to "{power_plan}" -- switch to "High Performance" for gaming'
        )

    # 3. Single channel RAM
    if ram.get("channel_mode") == "single":
        issues.append(
            "RAM running in single-channel mode -- dual-channel provides significantly better performance"
        )

    # 4. High CPU temperature
    cpu_temp = cpu.get("current_temp_c")
    if cpu_temp and cpu_temp > 85:
        issues.append(
            f"CPU temperature is {cpu_temp} C -- this is quite high, check cooling solution"
        )

    # 5. High GPU temperature
    gpu_temp = gpu.get("current_temp_c")
    if gpu_temp and gpu_temp > 85:
        issues.append(
            f"GPU temperature is {gpu_temp} C -- this is high, check case airflow and fan curve"
        )

    # 6. Low VRAM
    vram = gpu.get("vram_total_gb")
    if vram and vram < 4:
        issues.append(
            f"GPU only has {vram}GB VRAM -- modern games may struggle at higher settings"
        )

    # 7. Boot drive nearly full
    for d in storage:
        if d.get("is_boot_drive") and d.get("capacity_gb") and d.get("free_gb"):
            pct_free = (d["free_gb"] / d["capacity_gb"]) * 100
            if pct_free < 10:
                issues.append(
                    f"Boot drive has only {d['free_gb']:.1f}GB free ({pct_free:.0f}%) -- "
                    f"low disk space can hurt performance"
                )

    # 8. Boot drive is HDD
    for d in storage:
        if d.get("is_boot_drive") and d.get("type") == "HDD":
            issues.append(
                "Boot drive is a mechanical HDD -- upgrading to an SSD will dramatically improve load times"
            )

    # 9. Game Mode disabled
    if os_info.get("game_mode") is False:
        issues.append("Windows Game Mode is disabled -- enable it for better gaming performance")

    # 10. HAGS disabled
    if os_info.get("hw_accelerated_gpu_scheduling") is False:
        issues.append(
            "Hardware-accelerated GPU scheduling is disabled -- enabling it may improve performance"
        )

    # 11. High RAM usage
    if ram.get("usage_percent") and ram["usage_percent"] > 90:
        issues.append(
            f"RAM usage is at {ram['usage_percent']}% -- consider closing background apps or upgrading RAM"
        )

    # 12. Resizable BAR disabled with supported GPU
    if bios_settings.get("resizable_bar") is False:
        gpu_name = (gpu.get("model_name") or "").upper()
        if any(k in gpu_name for k in ("RTX 30", "RTX 40", "RTX 50", "RX 6", "RX 7")):
            issues.append(
                "Resizable BAR (ReBAR/SAM) is disabled -- enable in BIOS for potential FPS gains"
            )

    return issues


# ---------------------------------------------------------------------------
# Console Summary
# ---------------------------------------------------------------------------

def print_summary(cpu, gpu, ram, storage, os_info, bios_settings, issues):
    print()
    print("=" * 55)
    print("  PC Bottleneck Analyzer -- System Scan")
    print("=" * 55)
    print()

    # CPU line
    cores = cpu.get("physical_cores", "?")
    threads = cpu.get("logical_cores", "?")
    base = cpu.get("base_clock_ghz")
    current = cpu.get("current_clock_ghz")
    temp = cpu.get("current_temp_c")
    cpu_line = f"  CPU: {cpu.get('model_name', 'Unknown')} ({cores}C/{threads}T"
    if base:
        cpu_line += f", {base}GHz base"
    if current:
        cpu_line += f", currently at {current}GHz"
    if temp:
        cpu_line += f", {temp} C"
    cpu_line += ")"
    print(cpu_line)

    # GPU line
    vram = gpu.get("vram_total_gb")
    driver = gpu.get("driver_version")
    gtemp = gpu.get("current_temp_c")
    pcie_gen = gpu.get("pcie_generation")
    pcie_w = gpu.get("pcie_link_width")
    gpu_line = f"  GPU: {gpu.get('model_name', 'Unknown')}"
    details = []
    if vram:
        details.append(f"{vram}GB VRAM")
    if driver:
        details.append(f"driver {driver}")
    if gtemp:
        details.append(f"{gtemp} C")
    if pcie_gen and pcie_w:
        details.append(f"PCIe Gen{pcie_gen} x{pcie_w}")
    if details:
        gpu_line += f" ({', '.join(details)})"
    print(gpu_line)

    # RAM line
    total = ram.get("total_gb")
    speed = ram.get("speed_mhz")
    channel = ram.get("channel_mode", "")
    xmp = bios_settings.get("xmp_enabled")
    ram_line = f"  RAM: {total}GB" if total else "  RAM: Unknown"
    if speed:
        # Rough DDR generation detection
        if speed >= 4800:
            ram_line += f" DDR5-{speed}"
        else:
            ram_line += f" DDR4-{speed}"
    channel_str = channel.title() if channel else ""
    if channel_str:
        ram_line += f" ({channel_str} Channel"
    else:
        ram_line += " ("
    if xmp is True:
        ram_line += ", XMP ENABLED)"
    elif xmp is False:
        ram_line += ", XMP DISABLED!)"
    else:
        ram_line += ")"
    print(ram_line)

    # Storage lines
    for d in storage:
        model = d.get("model", "Unknown")
        dtype = d.get("type", "")
        cap = d.get("capacity_gb")
        used = d.get("used_gb")
        health = d.get("health_status")
        iface = d.get("interface", "")

        s_line = f"  Storage: {model}"
        if cap:
            cap_display = f"{cap:.0f}GB" if cap < 1000 else f"{cap/1000:.1f}TB"
            s_line += f" {cap_display}"
        if dtype:
            s_line += f" {dtype}"

        details = []
        if iface and iface != "unavailable":
            details.append(iface)
        if cap and used:
            pct = round((used / cap) * 100)
            details.append(f"{pct}% used")
        if health:
            details.append(health.lower())
        if d.get("is_boot_drive"):
            details.append("boot")
        if details:
            s_line += f" ({', '.join(details)})"
        print(s_line)

    # OS line
    win_ver = os_info.get("windows_version", "Unknown")
    power = os_info.get("power_plan")
    os_line = f"  OS: {win_ver}"
    os_details = []
    if power:
        os_details.append(f"{power} power plan")
    if os_details:
        os_line += f" ({', '.join(os_details)})"
    print(os_line)

    # Issues
    print()
    if issues:
        print(f"  !! POTENTIAL ISSUES DETECTED: {len(issues)}")
        for i, issue in enumerate(issues, 1):
            print(f"  {i}. {issue}")
    else:
        print("  No obvious issues detected. System looks well-configured!")
    print()


# ---------------------------------------------------------------------------
# Upload
# ---------------------------------------------------------------------------

def upload_scan(data: dict, url: str = "http://localhost:3000/api/scan"):
    """POST the scan JSON to the given URL."""
    import urllib.request
    import urllib.error

    payload = json.dumps(data).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            status = resp.status
            body = resp.read().decode("utf-8", errors="replace")
            print(f"[UPLOAD] Success ({status}): {body[:200]}")
    except urllib.error.HTTPError as e:
        print(f"[UPLOAD] HTTP Error {e.code}: {e.reason}")
    except urllib.error.URLError as e:
        print(f"[UPLOAD] Connection failed: {e.reason}")
    except Exception as e:
        print(f"[UPLOAD] Error: {e}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(
        description="PC Bottleneck Analyzer - System Scanner"
    )
    parser.add_argument(
        "--upload",
        action="store_true",
        help="POST scan results to http://localhost:3000/api/scan",
    )
    parser.add_argument(
        "--output",
        type=str,
        default="system_scan.json",
        help="Output JSON file path (default: system_scan.json)",
    )
    parser.add_argument(
        "--upload-url",
        type=str,
        default="http://localhost:3000/api/scan",
        help="Custom upload URL (default: http://localhost:3000/api/scan)",
    )
    args = parser.parse_args()

    print("Scanning system hardware... please wait.\n")
    start = time.time()

    scan_id = str(uuid.uuid4())
    timestamp = datetime.now(timezone.utc).isoformat()

    # --- Run all scans ---
    print("  [1/7] Scanning CPU...")
    cpu = scan_cpu()

    print("  [2/7] Scanning GPU...")
    gpu = scan_gpu()

    print("  [3/7] Scanning RAM...")
    ram = scan_ram()

    print("  [4/7] Scanning storage...")
    storage = scan_storage()

    print("  [5/7] Scanning motherboard...")
    motherboard = scan_motherboard()

    print("  [6/7] Scanning OS settings...")
    os_info = scan_os()

    print("  [7/7] Scanning network & BIOS settings...")
    network = scan_network()
    bios_settings = scan_bios_settings(ram)

    duration = round(time.time() - start, 2)

    # --- Detect issues ---
    issues = detect_issues(cpu, gpu, ram, storage, os_info, bios_settings)

    # --- Build output ---
    result = {
        "scan_id": scan_id,
        "timestamp": timestamp,
        "scan_duration_seconds": duration,
        "cpu": cpu,
        "gpu": gpu,
        "ram": ram,
        "storage": storage,
        "motherboard": motherboard,
        "os": os_info,
        "network": network,
        "bios_settings": bios_settings,
        "issues": issues,
    }

    # --- Save JSON ---
    try:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"\nScan saved to: {os.path.abspath(args.output)}")
    except Exception as e:
        print(f"\n[ERROR] Failed to save JSON: {e}")

    # --- Print summary ---
    print_summary(cpu, gpu, ram, storage, os_info, bios_settings, issues)

    print(f"  Scan completed in {duration}s (ID: {scan_id})")
    print()

    # --- Upload if requested ---
    if args.upload:
        print("Uploading scan results...")
        upload_scan(result, url=args.upload_url)


if __name__ == "__main__":
    main()
