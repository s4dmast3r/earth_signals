import { Component, lazy, Suspense, useEffect, useState } from "react";
import OceanSection from "../three/OceanSection";
import Storm from "../three/Storm";
import { sceneAt } from "../engine/game";
const Planet = lazy(() => import("../three/Planet"));
class Boundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="fallback">
        WebGL no está disponible. Prueba un navegador con aceleración gráfica.
        <br />
        Las vistas regionales y los perfiles siguen disponibles.
      </div>
    ) : (
      this.props.children
    );
  }
}
export default function Visualization({
  phenomenon,
  scenario,
  step = 0,
  landing = false,
}) {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const q = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(q.matches);
    update();
    q.addEventListener("change", update);
    return () => q.removeEventListener("change", update);
  }, []);
  const scene = landing
    ? { view: "planet", phase: 0 }
    : sceneAt(scenario, step);
  return (
    <div className={`visualization ${landing ? "hero-planet" : ""}`}>
      <div className="orbit orbit-one" />
      <div className="orbit orbit-two" />
      {scene.view === "planet" ? (
        <Boundary>
          <Suspense
            fallback={<div className="fallback">Conectando observatorio…</div>}
          >
            <Planet
              phenomenon={phenomenon}
              scenario={scenario}
              phase={scene.phase}
              focus={scene.focus}
              landing={landing}
              reduced={reduced}
            />
          </Suspense>
        </Boundary>
      ) : phenomenon.id === "cyclone" ? (
        <Storm phase={scene.phase} strength={scenario.strength} />
      ) : (
        <OceanSection
          id={phenomenon.id}
          profileDepth={scenario.profileDepth}
          phase={scene.phase}
          regional={scene.view === "regional"}
        />
      )}
      {!landing && (
        <>
          <div className="view-label">
            <span className="live-dot" />{" "}
            {scene.view === "planet"
              ? "TELEMETRÍA PLANETARIA"
              : scene.view === "section"
                ? "PERFIL OCEÁNICO"
                : "OBSERVACIÓN REGIONAL"}
            <small>{phenomenon.region}</small>
          </div>
          <div className="legend">
            <span>
              {phenomenon.id === "halocline"
                ? "SALINIDAD · concentración relativa"
                : "TEMPERATURA · escala relativa"}
            </span>
            <div
              className={
                phenomenon.id === "halocline" ? "gradient salt" : "gradient"
              }
            />
            <div className="legend-ends">
              <span>{phenomenon.id === "halocline" ? "Menor ··" : "Fría"}</span>
              <span>
                {phenomenon.id === "halocline" ? "Mayor ·····" : "Cálida"}
              </span>
            </div>
            <small>
              {phenomenon.id === "halocline" || phenomenon.id === "thermocline"
                ? "Perfil lateral = cambio con profundidad"
                : "Flechas = dirección · velocidad = intensidad"}
              {phenomenon.category === "ENSO" && (
                <>
                  <br />
                  Blanco = viento / nubes · naranja = agua cálida
                </>
              )}
              {phenomenon.id === "upwelling" && (
                <>
                  <br />
                  Puntos verdes = productividad biológica
                </>
              )}
              <br />
              {phenomenon.id === "climate-change"
                ? `Tiempo conceptual: ${Math.round(scene.phase * 80)} años`
                : "Animación conceptual · magnitudes no cuantitativas"}
            </small>
          </div>
        </>
      )}
    </div>
  );
}
