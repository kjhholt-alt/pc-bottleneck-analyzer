// ─── Game Benchmark Database ─────────────────────────────────────────────────
//
// baseFps: Calibrated for RTX 4070 (gaming_score=75) @ 1080p Ultra settings.
// These are approximate values based on widely-published benchmark reviews.

export type GameGenre = "AAA" | "Shooter" | "Esports" | "Open World" | "Racing" | "Coop" | "Sandbox";

export interface GameBenchmark {
  id: string;
  title: string;
  genre: GameGenre;
  baseFps: number;
  year: number;
  cpuHeavy?: boolean; // Games that lean harder on CPU
}

export const gameBenchmarks: GameBenchmark[] = [
  // ── AAA / Story ──
  { id: "cyberpunk", title: "Cyberpunk 2077", genre: "AAA", baseFps: 85, year: 2020 },
  { id: "hogwarts", title: "Hogwarts Legacy", genre: "AAA", baseFps: 75, year: 2023 },
  { id: "elden-ring", title: "Elden Ring", genre: "AAA", baseFps: 60, year: 2022 },
  { id: "bg3", title: "Baldur's Gate 3", genre: "AAA", baseFps: 80, year: 2023, cpuHeavy: true },
  { id: "starfield", title: "Starfield", genre: "AAA", baseFps: 65, year: 2023, cpuHeavy: true },
  { id: "rdr2", title: "Red Dead Redemption 2", genre: "Open World", baseFps: 80, year: 2019 },
  { id: "alan-wake-2", title: "Alan Wake 2", genre: "AAA", baseFps: 55, year: 2023 },
  { id: "wukong", title: "Black Myth: Wukong", genre: "AAA", baseFps: 70, year: 2024 },
  { id: "gow-ragnarok", title: "God of War: Ragnarok", genre: "AAA", baseFps: 80, year: 2024 },
  { id: "spiderman2", title: "Spider-Man 2", genre: "AAA", baseFps: 85, year: 2025 },

  // ── Shooters ──
  { id: "cod-mw3", title: "Call of Duty: MW3", genre: "Shooter", baseFps: 130, year: 2023 },
  { id: "apex", title: "Apex Legends", genre: "Shooter", baseFps: 165, year: 2019 },
  { id: "fortnite", title: "Fortnite", genre: "Shooter", baseFps: 160, year: 2017 },
  { id: "helldivers2", title: "Helldivers 2", genre: "Coop", baseFps: 95, year: 2024 },

  // ── Esports (CPU-heavy, high FPS) ──
  { id: "valorant", title: "Valorant", genre: "Esports", baseFps: 300, year: 2020, cpuHeavy: true },
  { id: "cs2", title: "Counter-Strike 2", genre: "Esports", baseFps: 250, year: 2023, cpuHeavy: true },
  { id: "league", title: "League of Legends", genre: "Esports", baseFps: 250, year: 2009, cpuHeavy: true },

  // ── Other ──
  { id: "minecraft", title: "Minecraft (Modded)", genre: "Sandbox", baseFps: 120, year: 2011, cpuHeavy: true },
  { id: "gta5", title: "GTA V", genre: "Open World", baseFps: 110, year: 2015 },
  { id: "forza5", title: "Forza Horizon 5", genre: "Racing", baseFps: 100, year: 2021 },
];

export type Resolution = "1080p" | "1440p" | "4K";
export type QualityPreset = "Low" | "Medium" | "High" | "Ultra";

export const RESOLUTION_MULTIPLIERS: Record<Resolution, number> = {
  "1080p": 1.0,
  "1440p": 0.72,
  "4K": 0.42,
};

export const QUALITY_MULTIPLIERS: Record<QualityPreset, number> = {
  Low: 1.6,
  Medium: 1.25,
  High: 1.0,
  Ultra: 0.85,
};
