import { useState } from "react";
import { phenomena, stepTitles } from "../data/phenomena";
import { scenarios } from "../data/scenarios";
import Visualization from "./Visualization";
export default function Tutorial({ onExit, onStart, hasGame }) {
  const [selected, setSelected] = useState(null),
    [step, setStep] = useState(0);
  const p = phenomena.find((p) => p.id === selected);
  return (
    <main className="learning">
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMIA DEL OBSERVATORIO</span>
          <h1>
            Aprende el planeta<span>.</span>
          </h1>
          <p>Explora las señales antes de poner a prueba tu observación.</p>
        </div>
        <button className="primary" onClick={hasGame ? onStart : onExit}>
          {hasGame ? "Iniciar partida →" : "Volver al menú"}
        </button>
      </div>
      {!p ? (
        <div className="lesson-grid">
          {phenomena.map((p, i) => (
            <button
              className="lesson"
              key={p.id}
              onClick={() => {
                setSelected(p.id);
                setStep(0);
              }}
            >
              <span className="lesson-number">
                {String(i + 1).padStart(2, "0")} ↗
              </span>
              <small>{p.category}</small>
              <h2>{p.name}</h2>
              <p>{p.region}</p>
              <span className="lesson-footer">
                6 pasos · exploración guiada →
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="lesson-stage">
          <Visualization
            phenomenon={p}
            scenario={scenarios.find((s) => s.phenomenon === p.id)}
            step={step}
          />
          <aside className="lesson-info">
            <button className="text-button" onClick={() => setSelected(null)}>
              ← Volver al planeta
            </button>
            <span className="eyebrow">{p.category}</span>
            <h2>{p.name}</h2>
            <div className="step-dots">
              {stepTitles.map((t, i) => (
                <button
                  key={t}
                  aria-label={`Paso ${i + 1}: ${t}`}
                  className={i === step ? "active" : ""}
                  onClick={() => setStep(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <small>PASO {step + 1} / 6</small>
            <h3>{stepTitles[step]}</h3>
            <p aria-live="polite">{p.steps[step]}</p>
            {step === 5 && <p className="note">{p.distinction}</p>}
            <div className="button-row">
              <button disabled={step === 0} onClick={() => setStep(step - 1)}>
                Anterior
              </button>
              <button
                className="primary"
                onClick={() => setStep(step === 5 ? 0 : step + 1)}
              >
                {step === 5 ? "Repetir ↻" : "Siguiente →"}
              </button>
            </div>
            <button className="text-button" onClick={() => setStep(0)}>
              Reproducir desde el inicio
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
