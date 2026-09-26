import { phenomena } from "../data/phenomena";
import { scenarios } from "../data/scenarios";
export const HINT_CAPS = [1000, 850, 650, 400];
export const OBSERVATION_SECONDS = 18;
export function scoreAnswer(correct, hints, seconds) {
  if (!correct) return { base: 0, bonus: 0, total: 0 };
  const base = HINT_CAPS[Math.min(3, Math.max(0, hints))];
  const bonus = seconds < 10 ? 200 : seconds < 20 ? 100 : 0;
  return { base, bonus, total: base + bonus };
}
export function shuffle(items, rng = Math.random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function difficultyAt(round, total) {
  return round < Math.ceil(total * 0.3)
    ? "easy"
    : round < Math.ceil(total * 0.7)
      ? "medium"
      : "hard";
}
export function createSchedule(playerCount, rounds, rng = Math.random) {
  const order = shuffle(
    phenomena.map((p) => p.id),
    rng,
  );
  const schedule = [];
  for (let r = 0; r < rounds; r++)
    for (let p = 0; p < playerCount; p++) {
      const id = order[(r + p * 3) % order.length];
      schedule.push({
        player: p,
        round: r,
        scenario: scenarios.find(
          (s) =>
            s.phenomenon === id && s.difficulty === difficultyAt(r, rounds),
        ),
      });
    }
  return schedule;
}
export function optionsFor(s, rng = Math.random) {
  const related = {
    thermocline: "halocline",
    halocline: "thermocline",
    "el-nino": "la-nina",
    "la-nina": "el-nino",
    humboldt: "upwelling",
    upwelling: "humboldt",
    "gulf-stream": "overturning",
    overturning: "gulf-stream",
    cyclone: "climate-change",
    "climate-change": "el-nino",
  };
  const pair = related[s.phenomenon];
  return shuffle(
    [
      s.phenomenon,
      pair,
      ...shuffle(
        phenomena
          .map((p) => p.id)
          .filter((id) => id !== s.phenomenon && id !== pair),
        rng,
      ).slice(0, s.difficulty === "easy" ? 2 : 4),
    ],
    rng,
  );
}
export function updatePlayer(player, phenomenon, correct, hints, score) {
  const category = phenomena.find((p) => p.id === phenomenon).category;
  const old = player.categoryPerformance[category] || { correct: 0, total: 0 };
  return {
    ...player,
    score: player.score + score,
    correctAnswers: player.correctAnswers + Number(correct),
    hintsUsed: player.hintsUsed + hints,
    missed: correct
      ? player.missed
      : [...new Set([...player.missed, phenomenon])],
    categoryPerformance: {
      ...player.categoryPerformance,
      [category]: {
        correct: old.correct + Number(correct),
        total: old.total + 1,
      },
    },
  };
}
export function makePlayers(names) {
  return names.map((name, id) => ({
    id,
    name: name.trim() || `Observador ${id + 1}`,
    score: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    categoryPerformance: {},
    missed: [],
  }));
}
export function sceneAt(s, step) {
  const p = phenomena.find((p) => p.id === s.phenomenon);
  let view = p.view;
  if (
    ["el-nino", "la-nina", "overturning"].includes(p.id) &&
    ((step >= 4 && step < 5) || (s.variant === 1 && step >= 3))
  )
    view = "section";
  if (p.id === "upwelling" && step >= 3) view = "section";
  return {
    view,
    phase: Math.max(0, Math.min(1, (step - 1) / 3)),
    focus: s.focus,
    layers: s.layers,
  };
}

export function timelineStep(scenario, seconds) {
  const times = scenario.timeline;
  for (let i = 0; i < times.length - 1; i++) {
    if (seconds < times[i + 1])
      return i + Math.max(0, (seconds - times[i]) / (times[i + 1] - times[i]));
  }
  return times.length - 1;
}
