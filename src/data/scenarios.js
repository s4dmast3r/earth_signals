import { phenomena } from "./phenomena";
export const scenarios = phenomena.flatMap((p) =>
  ["easy", "medium", "hard"].map((difficulty, variant) => ({
    id: `${p.id}-${variant}`,
    phenomenon: p.id,
    difficulty,
    variant,
    camera: { lon: p.lon + [0, 8, -8][variant], lat: p.lat },
    strength: [1, 0.8, 1.2][variant],
    profileDepth: [210, 250, 175][variant],
    timeline: [0, 3, 6, 9, 12, 15],
    focus: ["surface", "section", "pattern"][variant],
    layers: {
      temperature: p.id !== "halocline",
      winds: ["el-nino", "la-nina", "upwelling"].includes(p.id),
      currents: ["humboldt", "gulf-stream", "overturning"].includes(p.id),
      storm: p.id === "cyclone",
      ice: p.id === "climate-change",
    },
  })),
);
