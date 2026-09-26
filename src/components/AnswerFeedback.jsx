import { useEffect, useRef } from "react";

export default function AnswerFeedback({
  correct,
  message,
  phenomenon,
  answer,
  score,
  onContinue,
}) {
  const dialog = useRef(null);
  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);
  return (
    <dialog
      ref={dialog}
      className={`answer-feedback ${correct ? "is-correct" : "is-incorrect"}`}
      aria-labelledby="answer-feedback-title"
      aria-describedby="answer-feedback-description"
      onCancel={(event) => {
        event.preventDefault();
        onContinue();
      }}
    >
      <div className="feedback-icon" aria-hidden="true">
        {correct ? "✓" : "✕"}
      </div>
      <p className="feedback-verdict">
        {correct ? "Respuesta correcta" : "Respuesta incorrecta"}
      </p>
      <h2 id="answer-feedback-title">{message}</h2>
      <div id="answer-feedback-description">
        {!correct && (
          <p>
            Tu respuesta: <strong>{answer}</strong>
          </p>
        )}
        <p>
          {correct ? "Identificaste" : "La respuesta correcta es"}
          <br />
          <strong className="feedback-phenomenon">{phenomenon}</strong>
        </p>
        <p className="feedback-points">
          {correct ? `+${score} puntos` : "0 puntos en este turno"}
        </p>
      </div>
      <button autoFocus className="feedback-continue" onClick={onContinue}>
        Ver reconstrucción científica →
      </button>
    </dialog>
  );
}
