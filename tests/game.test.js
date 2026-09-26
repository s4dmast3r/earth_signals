import { describe, it, expect } from "vitest";
import {
  scoreAnswer,
  createSchedule,
  optionsFor,
  makePlayers,
  updatePlayer,
  HINT_CAPS,
  sceneAt,
} from "../src/engine/game";
import { scenarios } from "../src/data/scenarios";
import { phenomena } from "../src/data/phenomena";
describe("puntuación", () => {
  it("aplica cada nivel de pista y separa bonus", () =>
    HINT_CAPS.forEach((cap, h) =>
      expect(scoreAnswer(true, h, 4)).toEqual({
        base: cap,
        bonus: 200,
        total: cap + 200,
      }),
    ));
  it("respeta límites de tiempo", () => {
    expect(scoreAnswer(true, 0, 9.999).bonus).toBe(200);
    expect(scoreAnswer(true, 0, 10).bonus).toBe(100);
    expect(scoreAnswer(true, 0, 20).bonus).toBe(0);
  });
  it("no premia respuestas incorrectas", () =>
    expect(scoreAnswer(false, 0, 1).total).toBe(0));
});
describe("equidad", () => {
  for (const count of [2, 3, 4])
    for (const rounds of [5, 8, 10])
      it(`${count} personas, ${rounds} rondas`, () => {
        const schedule = createSchedule(count, rounds);
        expect(schedule).toHaveLength(count * rounds);
        for (let p = 0; p < count; p++) {
          const turns = schedule.filter((t) => t.player === p);
          expect(turns).toHaveLength(rounds);
          expect(new Set(turns.map((t) => t.scenario.phenomenon)).size).toBe(
            rounds,
          );
        }
        for (let r = 0; r < rounds; r++)
          expect(
            new Set(
              schedule
                .filter((t) => t.round === r)
                .map((t) => t.scenario.difficulty),
            ).size,
          ).toBe(1);
        for (let i = 1; i < schedule.length; i++)
          expect(schedule[i].scenario.id).not.toBe(schedule[i - 1].scenario.id);
      });
});
it("actualiza puntuación y categorías sin mutar", () => {
  const p = makePlayers(["Ana"])[0];
  const next = updatePlayer(p, "el-nino", true, 2, 850);
  expect(p.score).toBe(0);
  expect(next).toMatchObject({ score: 850, correctAnswers: 1, hintsUsed: 2 });
  expect(next.categoryPerformance.ENSO).toEqual({ correct: 1, total: 1 });
});
it("treinta escenarios, opciones únicas, respuesta y distractor conceptual", () => {
  expect(scenarios).toHaveLength(30);
  for (const s of scenarios) {
    const options = optionsFor(s);
    expect(options).toContain(s.phenomenon);
    expect(new Set(options).size).toBe(s.difficulty === "easy" ? 4 : 6);
    if (s.phenomenon === "halocline") expect(options).toContain("thermocline");
    for (let step = 0; step < 6; step++)
      expect(["planet", "regional", "section"]).toContain(
        sceneAt(s, step).view,
      );
  }
});
it("todos los fenómenos tienen seis pasos y tres pistas", () =>
  phenomena.forEach((p) => {
    expect(p.steps).toHaveLength(6);
    expect(p.hints).toHaveLength(3);
  }));
