import { useState } from "react";
import Visualization from "./components/Visualization";
import Tutorial from "./components/Tutorial";
import Turn from "./components/Turn";
import Results from "./components/Results";
import { createSchedule, makePlayers, updatePlayer } from "./engine/game";
export default function App() {
  const [screen, setScreen] = useState("landing"),
    [count, setCount] = useState(2),
    [names, setNames] = useState(["", "", "", ""]),
    [rounds, setRounds] = useState(10),
    [players, setPlayers] = useState([]),
    [schedule, setSchedule] = useState([]),
    [cursor, setCursor] = useState(0),
    [learnReturn, setLearnReturn] = useState("landing"),
    [confirmExit, setConfirmExit] = useState(false);
  const entry = schedule[cursor];
  function startSetup(e) {
    e.preventDefault();
    setPlayers(makePlayers(names.slice(0, count)));
    setSchedule(createSchedule(count, rounds));
    setCursor(0);
    setLearnReturn("handoff");
    setScreen("tutorial");
  }
  function complete(result) {
    setPlayers((ps) =>
      ps.map((p, i) =>
        i === entry.player
          ? updatePlayer(
              p,
              result.phenomenon,
              result.correct,
              result.hints,
              result.score,
            )
          : p,
      ),
    );
    if (cursor + 1 === schedule.length) setScreen("results");
    else {
      setCursor(cursor + 1);
      setScreen("handoff");
    }
  }
  function learn(back) {
    setLearnReturn(back);
    setScreen("tutorial");
  }
  return (
    <div className="app">
      <header>
        <button
          className="brand"
          onClick={() =>
            ["turn", "handoff"].includes(screen)
              ? setConfirmExit(true)
              : setScreen("landing")
          }
        >
          <span className="brand-icon">◎</span> EARTH SIGNALS
          <span className="brand-beta">OBSERVATORY / 01</span>
        </button>
        <nav>
          <span className="system-status">
            <i /> SISTEMA EN LÍNEA
          </span>
          {["landing", "results"].includes(screen) && (
            <button className="text-button" onClick={() => learn(screen)}>
              Aprende el planeta ↗
            </button>
          )}
        </nav>
      </header>
      {screen === "landing" && (
        <main className="landing">
          <div className="hero-copy">
            <span className="eyebrow">
              <i className="tiny-line" /> UNA EXPEDICIÓN AL SISTEMA TIERRA
            </span>
            <h1>
              El planeta
              <br />
              envía <em>señales.</em>
              <br />
              ¿Puedes leerlas?
            </h1>
            <p>
              Observa el océano. Sigue los vientos.
              <br />
              Descubre los procesos que conectan nuestro mundo.
            </p>
            <div className="button-row">
              <button className="primary" onClick={() => setScreen("setup")}>
                Iniciar expedición <span>↗</span>
              </button>
              <button className="text-button" onClick={() => learn("landing")}>
                Explorar el planeta →
              </button>
            </div>
            <div className="hero-facts">
              <div>
                <strong>02—04</strong>
                <small>OBSERVADORES</small>
              </div>
              <div>
                <strong>10</strong>
                <small>FENÓMENOS</small>
              </div>
              <div>
                <strong>01</strong>
                <small>PLANETA CONECTADO</small>
              </div>
            </div>
          </div>
          <Visualization landing />
          <div className="planet-coordinate">
            TIERRA / SOL III <span>ATMÓSFERA ↔ HIDRÓSFERA</span>
          </div>
          <div className="landing-bottom">
            <span>01 / OBSERVA</span>
            <span>02 / INTERPRETA</span>
            <span>03 / DESCUBRE</span>
            <small>Observe the planet. Identify the phenomenon.</small>
          </div>
        </main>
      )}
      {screen === "setup" && (
        <main className="setup">
          <span className="eyebrow">PREPARA LA MISIÓN</span>
          <h1>
            Tu equipo de observación<span>.</span>
          </h1>
          <p>
            Un dispositivo, varias perspectivas. Cada persona juega una vez por
            ronda.
          </p>
          <form className="panel" onSubmit={startSetup}>
            <label>Número de observadores</label>
            <div className="segmented">
              {[2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={count === n}
                  className={count === n ? "selected" : ""}
                  onClick={() => setCount(n)}
                >
                  {n} jugadores
                </button>
              ))}
            </div>
            <div className="name-grid">
              {names.slice(0, count).map((name, i) => (
                <label key={i}>
                  OBSERVADOR 0{i + 1}
                  <input
                    maxLength={24}
                    placeholder={`Observador ${i + 1}`}
                    value={name}
                    onChange={(e) =>
                      setNames((ns) =>
                        ns.map((v, j) => (i === j ? e.target.value : v)),
                      )
                    }
                  />
                </label>
              ))}
            </div>
            <label>Duración de la expedición</label>
            <div className="segmented">
              {[5, 8, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={rounds === n}
                  className={rounds === n ? "selected" : ""}
                  onClick={() => setRounds(n)}
                >
                  {n} rondas
                </button>
              ))}
            </div>
            <p className="note">
              {count * rounds} turnos en total · Dificultad progresiva y
              comparable en cada ronda.
            </p>
            <button className="primary full">Entrar al observatorio →</button>
          </form>
        </main>
      )}
      {screen === "tutorial" && (
        <Tutorial
          onExit={() => setScreen(learnReturn)}
          hasGame={learnReturn === "handoff"}
          onStart={() => setScreen("handoff")}
        />
      )}
      {screen === "handoff" && (
        <main className="handoff">
          <span className="eyebrow">
            RONDA {entry.round + 1} / {rounds} · SIGUIENTE OBSERVADOR
          </span>
          <div className="handoff-orbit">◎</div>
          <h1>{players[entry.player].name}</h1>
          <p>
            Pasa el dispositivo a {players[entry.player].name}.<br />
            La evidencia aparecerá cuando esté listo.
          </p>
          <button className="primary" onClick={() => setScreen("turn")}>
            Estoy listo para observar →
          </button>
          <button className="text-button" onClick={() => learn("handoff")}>
            Repasar el planeta
          </button>
          <div className="mini-scores">
            {players.map((p) => (
              <span key={p.id}>
                {p.name} <b>{p.score}</b>
              </span>
            ))}
          </div>
        </main>
      )}
      {screen === "turn" && (
        <Turn
          key={cursor}
          entry={entry}
          player={players[entry.player]}
          rounds={rounds}
          onComplete={complete}
        />
      )}
      {screen === "results" && (
        <Results
          players={players}
          rounds={rounds}
          onAgain={() => setScreen("setup")}
          onLearn={() => learn("results")}
          onHome={() => setScreen("landing")}
        />
      )}
      <footer>
        <span>
          EARTH SIGNALS <b> / </b> CIENCIA A TRAVÉS DE LA OBSERVACIÓN
        </span>
        <span>
          Representación educativa conceptual de procesos climáticos y
          oceanográficos.
        </span>
      </footer>
      {confirmExit && (
        <div className="modal-backdrop">
          <section
            className="panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
          >
            <h2 id="exit-title">¿Salir de la expedición?</h2>
            <p>Se perderá el progreso de esta partida.</p>
            <div className="button-row">
              <button autoFocus onClick={() => setConfirmExit(false)}>
                Seguir jugando
              </button>
              <button
                onClick={() => {
                  setConfirmExit(false);
                  setScreen("landing");
                }}
              >
                Salir al menú
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
