// ─── Latest GPU Driver Versions ──────────────────────────────────────────────
//
// Hardcoded latest stable driver versions for NVIDIA, AMD, and Intel GPUs.
// Updated periodically — these represent the latest stable (non-beta) releases
// as of February 2026.

export interface DriverInfo {
  vendor: "nvidia" | "amd" | "intel";
  latestVersion: string;
  releaseDate: string;
  downloadUrl: string;
  releaseName: string;
}

// Latest stable NVIDIA Game Ready driver
export const NVIDIA_LATEST: DriverInfo = {
  vendor: "nvidia",
  latestVersion: "572.83",
  releaseDate: "2026-02-18",
  downloadUrl: "https://www.nvidia.com/Download/index.aspx",
  releaseName: "Game Ready Driver 572.83",
};

// Latest stable AMD Adrenalin driver
export const AMD_LATEST: DriverInfo = {
  vendor: "amd",
  latestVersion: "25.1.1",
  releaseDate: "2026-01-28",
  downloadUrl: "https://www.amd.com/en/support",
  releaseName: "Adrenalin Edition 25.1.1",
};

// Latest stable Intel Arc driver
export const INTEL_LATEST: DriverInfo = {
  vendor: "intel",
  latestVersion: "32.0.101.6314",
  releaseDate: "2026-01-15",
  downloadUrl: "https://www.intel.com/content/www/us/en/download-center/home.html",
  releaseName: "Arc Graphics Driver 32.0.101.6314",
};

export type DriverStatus = "up_to_date" | "outdated" | "very_outdated" | "unknown";

export interface DriverCheckResult {
  status: DriverStatus;
  currentVersion: string;
  latestInfo: DriverInfo;
  versionsBehind: number | null;
  message: string;
}

/**
 * Detect GPU vendor from model name.
 */
function detectVendor(gpuModel: string): "nvidia" | "amd" | "intel" | null {
  const lower = gpuModel.toLowerCase();
  if (lower.includes("nvidia") || lower.includes("geforce") || lower.includes("rtx") || lower.includes("gtx")) {
    return "nvidia";
  }
  if (lower.includes("amd") || lower.includes("radeon") || lower.includes("rx ")) {
    return "amd";
  }
  if (lower.includes("intel") || lower.includes("arc")) {
    return "intel";
  }
  return null;
}

/**
 * Parse a driver version string into comparable numeric segments.
 */
function parseVersion(version: string): number[] {
  return version.split(/[.\-]/).map((s) => parseInt(s, 10) || 0);
}

/**
 * Compare two version arrays. Returns:
 *  -1 if a < b
 *   0 if a == b
 *   1 if a > b
 */
function compareVersions(a: number[], b: number[]): number {
  const len = Math.max(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av < bv) return -1;
    if (av > bv) return 1;
  }
  return 0;
}

/**
 * Estimate how many major versions behind the user's driver is.
 * For NVIDIA: major version difference (e.g., 566 vs 572 = 6 versions behind)
 * For AMD: uses the first two segments (year.release)
 */
function estimateVersionsBehind(current: number[], latest: number[], vendor: string): number {
  if (vendor === "nvidia") {
    return Math.max(0, (latest[0] ?? 0) - (current[0] ?? 0));
  }
  // AMD/Intel: just count major segment diff
  return Math.max(0, (latest[0] ?? 0) - (current[0] ?? 0));
}

/**
 * Check if the user's GPU driver is up to date.
 */
export function checkDriverStatus(
  gpuModel: string,
  driverVersion: string,
): DriverCheckResult {
  const vendor = detectVendor(gpuModel);

  if (!vendor) {
    return {
      status: "unknown",
      currentVersion: driverVersion,
      latestInfo: NVIDIA_LATEST,
      versionsBehind: null,
      message: "Unable to detect GPU vendor. Check your driver manually.",
    };
  }

  const latestInfo =
    vendor === "nvidia"
      ? NVIDIA_LATEST
      : vendor === "amd"
        ? AMD_LATEST
        : INTEL_LATEST;

  const currentParsed = parseVersion(driverVersion);
  const latestParsed = parseVersion(latestInfo.latestVersion);

  const cmp = compareVersions(currentParsed, latestParsed);

  if (cmp >= 0) {
    return {
      status: "up_to_date",
      currentVersion: driverVersion,
      latestInfo,
      versionsBehind: 0,
      message: `Your ${latestInfo.vendor.toUpperCase()} driver is up to date.`,
    };
  }

  const behind = estimateVersionsBehind(currentParsed, latestParsed, vendor);

  if (behind > 10 || (vendor === "amd" && behind >= 2)) {
    return {
      status: "very_outdated",
      currentVersion: driverVersion,
      latestInfo,
      versionsBehind: behind,
      message: `Your driver is significantly outdated. Update to ${latestInfo.releaseName} for best performance and stability.`,
    };
  }

  return {
    status: "outdated",
    currentVersion: driverVersion,
    latestInfo,
    versionsBehind: behind,
    message: `A newer driver is available: ${latestInfo.releaseName}. Updating can improve performance and fix bugs.`,
  };
}
