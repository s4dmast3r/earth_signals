import { useEffect, useMemo, useRef, useState } from "react";
import Visualization from "./Visualization";
import AnswerFeedback from "./AnswerFeedback";
import { nextFeedback } from "../data/answerFeedback";
import { byId, stepTitles } from "../data/phenomena";
import {
  HINT_CAPS,
  OBSERVATION_SECONDS,
  optionsFor,
  scoreAnswer,
  timelineStep,
} from "../engine/game";
export default function Turn({ entry, player, rounds, onComplete }) {
  const s = entry.scenario,
    p = byId[s.phenomenon];
  const [mode, setMode] = useState("observation"),
    [elapsed, setElapsed] = useState(0),
    [hints, setHints] = useState(0),
    [answer, setAnswer] = useState(null),
    [replayStep, setReplayStep] = useState(0),
    [playing, setPlaying] = useState(true),
    [score, setScore] = useState(null),
    [feedbackMessage, setFeedbackMessage] = useState("");
  const started = useRef(performance.now()),
    readyAt = useRef(null),
    locked = useRef(false);
  const options = useMemo(() => optionsFor(s), [s]);
  useEffect(() => {
    if (mode !== "observation") return;
    const timer = setInterval(() => {
      const value = (performance.now() - started.current) / 1000;
      setElapsed(value);
      if (value >= OBSERVATION_SECONDS) {
        readyAt.current = performance.now();
        setMode("guessing");
      }
    }, 100);
    return () => clearInterval(timer);
  }, [mode]);
  useEffect(() => {
    if (mode !== "reconstruction" || !playing) return;
    const timer = setInterval(
      () =>
        setReplayStep((v) => {
          if (v === 5) {
            setPlaying(false);
            return v;
          }
          return v + 1;
        }),
      4000,
    );
    return () => clearInterval(timer);
  }, [mode, playing]);
  function guess(id) {
    if (locked.current) return;
    locked.current = true;
    setAnswer(id);
    setScore(
      scoreAnswer(
        id === p.id,
        hints,
        (performance.now() - readyAt.current) / 1000,
      ),
    );
    setReplayStep(0);
    setFeedbackMessage(nextFeedback(id === p.id));
    setMode("feedback");
  }
  const step =
    mode === "reconstruction" ? replayStep : timelineStep(s, elapsed);
  return (
    <main className="turn">
      <div className="turn-heading">
        <div>
          <span className="eyebrow">
            RONDA {String(entry.round + 1).padStart(2, "0")} / {rounds}
          </span>
          <h2>
            {player.name}
            <small>
              {" "}
              ·{" "}
              {s.difficulty === "easy"
                ? "Exploración"
                : s.difficulty === "medium"
                  ? "Análisis"
                  : "Interpretación"}
            </small>
          </h2>
        </div>
        <div className="max-score">
          <small>{score ? "PUNTOS DEL TURNO" : "BASE MÁXIMA ACTUAL"}</small>
          <strong>{score ? score.total : HINT_CAPS[hints]}</strong>
        </div>
      </div>
      <div className="turn-stage">
        <Visualization phenomenon={p} scenario={s} step={step} />
        <aside className="turn-panel">
          {mode === "observation" && (
            <>
              <span className="eyebrow">ADQUIRIENDO EVIDENCIA</span>
              <h1>
                Observa.
                <br />
                Conecta.
                <br />
                <span>Descubre.</span>
              </h1>
              <p>
                Sigue las direcciones, las capas y los cambios. La respuesta se
                habilita al terminar la secuencia.
              </p>
              <progress max={OBSERVATION_SECONDS} value={elapsed} />
              <small>
                {Math.min(18, Math.floor(elapsed))} / 18 s · El bonus aún no
                corre
              </small>
            </>
          )}
          {mode === "guessing" && (
            <>
              <span className="eyebrow">TU INTERPRETACIÓN</span>
              <h2>Identifica el fenómeno</h2>
              <p className="muted">
                Tómate el tiempo que necesites. No hay penalización por
                reflexionar.
              </p>
              <div className="answers">
                {options.map((id) => (
                  <button key={id} onClick={() => guess(id)}>
                    {byId[id].name}
                    <span>↗</span>
                  </button>
                ))}
              </div>
              <div className="hint">
                <button
                  disabled={hints === 3}
                  onClick={() => setHints(hints + 1)}
                >
                  {hints === 3
                    ? "Todas las señales recibidas"
                    : `Solicitar señal ${hints + 1} →`}
                  <small>
                    {hints < 3
                      ? `La base máxima bajará a ${HINT_CAPS[hints + 1]} pts`
                      : "Base máxima: 400 pts"}
                  </small>
                </button>
                <div aria-live="polite">
                  {p.hints.slice(0, hints).map((hint, i) => (
                    <p key={hint}>
                      <b>0{i + 1}</b> {hint}
                    </p>
                  ))}
                </div>
              </div>
              <small>Bonus: &lt;10 s +200 · 10–20 s +100 · ≥20 s +0</small>
            </>
          )}
          {mode === "reconstruction" && (
            <>
              <span
                className={`answer-result-label ${answer === p.id ? "is-correct" : "is-incorrect"}`}
              >
                {answer === p.id
                  ? "✓ RESPUESTA CORRECTA"
                  : "✕ RESPUESTA INCORRECTA"}
              </span>
              <h2>{p.name}</h2>
              {answer !== p.id && (
                <small>Tu interpretación: {byId[answer].name}</small>
              )}
              <h3>Reconstrucción del sistema</h3>
              <div className="step-dots">
                {stepTitles.map((title, i) => (
                  <button
                    key={title}
                    aria-label={title}
                    className={i === replayStep ? "active" : ""}
                    onClick={() => {
                      setPlaying(false);
                      setReplayStep(i);
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <p className="reconstruction-copy" aria-live="polite">
                {p.steps[replayStep]}
              </p>
              <div className="button-row">
                <button onClick={() => setPlaying(!playing)}>
                  {playing ? "Pausar" : "Reproducir"}
                </button>
                <button
                  onClick={() => {
                    setReplayStep(0);
                    setPlaying(true);
                  }}
                >
                  Repetir ↻
                </button>
              </div>
              {replayStep === 5 && (
                <>
                  <blockquote>{p.key}</blockquote>
                  <p className="note">{p.distinction}</p>
                  <div className="score-breakdown">
                    <span>
                      Base <b>{score.base}</b>
                    </span>
                    <span>
                      Bonus temporal <b>{score.bonus}</b>
                    </span>
                    <span>
                      Total <b>{score.total}</b>
                    </span>
                  </div>
                  <button
                    className="primary full"
                    onClick={() =>
                      onComplete({
                        correct: answer === p.id,
                        hints,
                        score: score.total,
                        phenomenon: p.id,
                      })
                    }
                  >
                    Continuar →
                  </button>
                </>
              )}
            </>
          )}
        </aside>
      </div>
      {mode === "feedback" && (
        <AnswerFeedback
          correct={answer === p.id}
          message={feedbackMessage}
          phenomenon={p.name}
          answer={byId[answer].name}
          score={score.total}
          onContinue={() => setMode("reconstruction")}
        />
      )}
    </main>
  );
}
