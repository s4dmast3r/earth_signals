import { byId } from "../data/phenomena";
export default function Results({ players, rounds, onAgain, onLearn, onHome }) {
  const ranking = [...players].sort((a, b) => b.score - a.score);
  return (
    <main className="results">
      <span className="eyebrow">EXPEDICIÓN COMPLETADA</span>
      <h1>
        Cada señal cuenta<span>.</span>
      </h1>
      <p>Resultados de la misión · {rounds} observaciones por persona</p>
      <div className="ranking">
        {ranking.map((p, i) => (
          <div className={`rank ${i === 0 ? "winner" : ""}`} key={p.id}>
            <span>
              {ranking.findIndex((x) => x.score === p.score) + 1 < 10
                ? "0"
                : ""}
              {ranking.findIndex((x) => x.score === p.score) + 1}
            </span>
            <h2>{p.name}</h2>
            <strong>
              {p.score.toLocaleString("es")} <small>PTS</small>
            </strong>
          </div>
        ))}
      </div>
      <div className="report-grid">
        {players.map((p) => {
          const cats = Object.entries(p.categoryPerformance).sort(
            (a, b) => b[1].correct / b[1].total - a[1].correct / a[1].total,
          );
          return (
            <article className="panel" key={p.id}>
              <h2>{p.name}</h2>
              <div className="stats">
                <div>
                  <strong>
                    {p.correctAnswers}/{rounds}
                  </strong>
                  <small>ACIERTOS</small>
                </div>
                <div>
                  <strong>{p.hintsUsed}</strong>
                  <small>SEÑALES</small>
                </div>
              </div>
              {cats.map(([name, v]) => (
                <div className="category" key={name}>
                  <div>
                    {name}
                    <b>{Math.round((v.correct / v.total) * 100)}%</b>
                  </div>
                  <progress value={v.correct} max={v.total} />
                </div>
              ))}
              <p>
                <small>CATEGORÍA MÁS FUERTE</small>
                <br />
                {cats[0]?.[1].correct ? cats[0][0] : "Aún por descubrir"}
              </p>
              <p>
                <small>REPASO RECOMENDADO</small>
                <br />
                {p.missed.length
                  ? p.missed.map((id) => byId[id].name).join(", ")
                  : "¡Explora nuevas variantes!"}
              </p>
            </article>
          );
        })}
      </div>
      <p className="note">
        Feedback del juego basado en los turnos observados; no es una evaluación
        científica formal. Las categorías no observadas no se puntúan.
      </p>
      <div className="button-row">
        <button className="primary" onClick={onAgain}>
          Nueva expedición
        </button>
        <button onClick={onLearn}>Aprende el planeta</button>
        <button onClick={onHome}>Menú principal</button>
      </div>
    </main>
  );
}
