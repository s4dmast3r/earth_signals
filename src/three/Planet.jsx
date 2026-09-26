import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Line, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
const rad = Math.PI / 180;
export function point(lon, lat, r = 2.025) {
  return new THREE.Vector3(
    r * Math.cos(lat * rad) * Math.sin(lon * rad),
    r * Math.sin(lat * rad),
    r * Math.cos(lat * rad) * Math.cos(lon * rad),
  );
}
function useMap() {
  const [map, setMap] = useState(null);
  useEffect(() => {
    let alive = true,
      texture;
    fetch("/land.geojson")
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        const c = document.createElement("canvas");
        c.width = 2048;
        c.height = 1024;
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#0a2940";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.strokeStyle = "#164258";
        ctx.lineWidth = 1;
        for (let x = 0; x < 2048; x += 2048 / 24) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
        }
        for (let y = 0; y < 1024; y += 1024 / 12) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(2048, y);
          ctx.stroke();
        }
        ctx.fillStyle = "#47716f";
        ctx.strokeStyle = "#83a89a";
        for (const f of data.features) {
          const polys =
            f.geometry.type === "Polygon"
              ? [f.geometry.coordinates]
              : f.geometry.coordinates;
          for (const poly of polys) {
            ctx.beginPath();
            for (const ring of poly)
              ring.forEach(([lon, lat], i) => {
                const x = ((lon + 180) / 360) * 2048,
                  y = ((90 - lat) / 180) * 1024;
                i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
              });
            ctx.closePath();
            ctx.fill("evenodd");
            ctx.stroke();
          }
        }
        texture = new THREE.CanvasTexture(c);
        texture.colorSpace = THREE.SRGBColorSpace;
        setMap(texture);
      })
      .catch(() => {});
    return () => {
      alive = false;
      texture?.dispose();
    };
  }, []);
  return map;
}
function Camera({ lon, lat, reduced }) {
  const { camera } = useThree();
  useEffect(() => {
    const spherical = new THREE.Spherical().setFromVector3(camera.position);
    const target = new THREE.Spherical().setFromVector3(point(lon, lat, 6.1));
    let delta = target.theta - spherical.theta;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const tween = gsap.to(spherical, {
      theta: spherical.theta + delta,
      phi: target.phi,
      radius: 6.1,
      duration: reduced ? 0 : 1.5,
      onUpdate: () => {
        camera.position.setFromSpherical(spherical);
        camera.lookAt(0, 0, 0);
      },
    });
    return () => tween.kill();
  }, [lon, lat, camera, reduced]);
  return null;
}
function Flow({ coords, color, speed = 1, reduced }) {
  const marker = useRef();
  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        coords.map(([lon, lat]) => point(lon, lat, 2.06)),
      ),
    [JSON.stringify(coords)],
  );
  const points = useMemo(() => curve.getPoints(65), [curve]);
  useFrame(({ clock }) => {
    const t = reduced ? 0.65 : (clock.elapsedTime * speed * 0.12) % 1;
    const pos = curve.getPoint(t);
    marker.current.position.copy(pos);
    marker.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      curve.getTangent(t).normalize(),
    );
  });
  return (
    <>
      <Line
        points={points}
        color={color}
        lineWidth={1.8}
        transparent
        opacity={0.65}
      />
      <mesh ref={marker}>
        <coneGeometry args={[0.045, 0.16, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}
function Patch({ lon, lat, color, size = 1, opacity = 0.5 }) {
  const pos = point(lon, lat, 2.035);
  const q = new THREE.Quaternion().setFromUnitVectors(
    new THREE.Vector3(0, 0, 1),
    pos.clone().normalize(),
  );
  return (
    <mesh position={pos} quaternion={q} scale={[size, 0.22, 1]}>
      <circleGeometry args={[0.38, 32]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}
function Layers({ id, phase, reduced, focus, strength, layers }) {
  const enso = ["el-nino", "la-nina"].includes(id),
    warm = id === "el-nino";
  const global = id === "climate-change";
  return (
    <>
      {enso && (
        <>
          {layers.temperature &&
            [-165, -145, -125, -105, -85].map((lon, i) => (
              <Patch
                key={lon}
                lon={lon}
                lat={0}
                color={
                  i < 2
                    ? "#fb923c"
                    : phase > 0.25
                      ? warm
                        ? "#f77c40"
                        : "#22bbee"
                      : "#42c8e2"
                }
                size={1.6}
                opacity={0.25 + phase * 0.45}
              />
            ))}
          {layers.winds &&
            [-8, 8].flatMap((lat) =>
              [-100, -135, -170].map((lon) => (
                <Flow
                  key={`${lat}${lon}`}
                  coords={[
                    [lon, lat],
                    [lon - 10, lat],
                    [lon - 23, lat],
                  ]}
                  color="#d9f8ff"
                  speed={warm ? 1 - phase * 0.75 : 1 + phase}
                  reduced={reduced}
                />
              )),
            )}
          {phase > 0.35 && (
            <Flow
              coords={
                warm
                  ? [
                      [-170, 1],
                      [-140, 1],
                      [-100, 1],
                    ]
                  : [
                      [-100, 1],
                      [-140, 1],
                      [-170, 1],
                    ]
              }
              color={warm ? "#ffb36b" : "#37d9ee"}
              speed={0.9}
              reduced={reduced}
            />
          )}
        </>
      )}
      {layers.currents && id === "humboldt" && (
        <Flow
          coords={[
            [-77, -43],
            [-77, -30],
            [-81, -17],
            [-84, -5],
          ]}
          color="#38d4ff"
          speed={strength}
          reduced={reduced}
        />
      )}
      {layers.currents && id === "gulf-stream" && (
        <Flow
          coords={[
            [-80, 24],
            [-78, 32],
            [-65, 39],
            [-45, 46],
            [-23, 51],
          ]}
          color="#ffac5c"
          speed={strength}
          reduced={reduced}
        />
      )}
      {layers.currents && id === "overturning" && (
        <>
          {[0, 8].map((d) => (
            <Flow
              key={d}
              coords={[
                [-65 + d, 15],
                [-40 + d, 45],
                [-25 + d, 65],
              ]}
              color="#ffa75f"
              reduced={reduced}
            />
          ))}
          <Flow
            coords={[
              [-28, 64],
              [-43, 40],
              [-35, 0],
              [-18, -30],
            ]}
            color="#42c7eb"
            reduced={reduced}
          />
        </>
      )}
      {global && (
        <>
          <mesh>
            <sphereGeometry args={[2.012, 48, 32]} />
            <meshBasicMaterial
              color="#f99a4e"
              transparent
              opacity={phase * 0.24}
              depthWrite={false}
            />
          </mesh>
          {[80, -80].map((lat) => (
            <mesh
              key={lat}
              position={point(0, lat, 1.92)}
              scale={[1 - phase * 0.45, 0.12, 1 - phase * 0.45]}
            >
              <sphereGeometry args={[0.57, 32, 16]} />
              <meshBasicMaterial color="#d5f7ff" />
            </mesh>
          ))}
        </>
      )}
      {enso && (
        <>
          {[0, 1, 2].map((i) => (
            <Patch
              key={i}
              lon={-170 + (warm ? phase * 40 : -phase * 5) + i * 7}
              lat={4}
              color="#eefaff"
              size={0.65}
              opacity={0.6}
            />
          ))}
        </>
      )}
    </>
  );
}
function World({ phenomenon, scenario, phase, landing, reduced, focus }) {
  const map = useMap();
  const globe = useRef();
  useFrame((_, dt) => {
    if (landing && !reduced) globe.current.rotation.y += dt * 0.025;
  });
  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[3, 4, 5]} intensity={1.7} color="#d5f8ff" />
      <group ref={globe}>
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <sphereGeometry args={[2, 80, 48]} />
          <meshStandardMaterial
            key={map?.uuid || "fallback"}
            map={map}
            color={map ? "#ffffff" : "#245867"}
            roughness={0.88}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[2.08, 64, 40]} />
          <meshBasicMaterial
            color="#37bad3"
            side={THREE.BackSide}
            transparent
            opacity={0.1}
          />
        </mesh>
        {!landing && (
          <Layers
            id={phenomenon.id}
            phase={phase}
            reduced={reduced}
            focus={focus}
            strength={scenario?.strength || 1}
            layers={scenario.layers}
          />
        )}
      </group>
      <Stars
        radius={70}
        depth={40}
        count={700}
        factor={2}
        saturation={0}
        fade
        speed={0}
      />
      <Camera
        lon={landing ? -35 : (scenario?.camera.lon ?? phenomenon.lon)}
        lat={landing ? 18 : phenomenon.lat}
        reduced={reduced}
      />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enableRotate={landing}
        autoRotate={false}
      />
    </>
  );
}
export default function Planet(props) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 1, 6.1], fov: 43 }}
      gl={{ antialias: true, alpha: true }}
    >
      <World {...props} />
    </Canvas>
  );
}
