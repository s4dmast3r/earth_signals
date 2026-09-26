# Earth Signals

Videojuego educativo de observación climática para 2–4 personas en un mismo dispositivo. El objetivo es reconocer procesos a partir de direcciones, gradientes, localizaciones y cambios temporales, y comprenderlos mediante una reconstrucción científica.

## Ejecutar

Requiere Node.js 20.19+ o 22.12+.

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Vite sirve la aplicación en http://localhost:5173. Para Vercel, importar este directorio, elegir Vite, usar `npm run build` y publicar `dist`. No requiere variables de entorno, backend, autenticación ni servicios externos. El build usa recursos locales y puede hospedarse como sitio estático.

## Cómo jugar

1. Iniciar expedición, elegir 2–4 observadores y 5, 8 o 10 rondas (10 por defecto).
2. Visitar Aprende el planeta. Sus diez lecciones comparten las visualizaciones con las rondas. Se puede explorar o iniciar la partida directamente después de entrar.
3. Pasar el dispositivo al observador indicado; nadie ve su escenario hasta pulsar «Estoy listo».
4. Observar una secuencia de 18 segundos. Después se habilitan cuatro opciones en fácil o seis en otras dificultades.
5. Responder o solicitar hasta tres señales. El costo se anuncia antes: la base máxima baja de 1000 a 850, 650 y 400 puntos.
6. El bonus empieza cuando se habilitan las respuestas: menos de 10 segundos = 200; desde 10 y antes de 20 = 100; desde 20 = 0. Una respuesta incorrecta recibe cero base y cero bonus.
7. Revisar la reconstrucción de seis pasos, con reproducción automática lenta, pausa, repetición y navegación manual. El último paso incluye señal clave, matices y desglose de puntos.
8. Todos juegan una vez por ronda. El ranking incluye empates, aciertos, pistas, desempeño por categoría y conceptos recomendados para repasar.

El progreso vive en memoria: recargar la página reinicia la expedición. Hay confirmación al salir mediante el logotipo durante una partida. Las métricas son feedback del juego, no evaluación científica formal.

## Contenido

El Niño, La Niña, surgencia costera, Corriente de Humboldt, Corriente del Golfo, termoclina, haloclina, ciclón tropical, circulación termohalina y cambio climático. Cada concepto contiene ubicación, definición, mecanismo, seis pasos, tres pistas, señal clave y distinciones científicas.

Hay 30 configuraciones (tres por fenómeno). Cambian énfasis, profundidad de los perfiles, encuadre o intensidad visual; comparten el mecanismo científico. La dificultad progresa por ronda. Un orden aleatorio y desplazamientos por jugador dan igual número de turnos, igual dificultad en cada ronda y, hasta diez rondas, ningún fenómeno repetido para una misma persona. Los distractores incluyen conceptos relacionados.

## Arquitectura

- `src/App.jsx`: estados de pantalla, configuración y coordinación de la partida.
- `src/components/`: tutorial, turno (observación, respuesta y reconstrucción), resultados y contenedor visual.
- `src/data/phenomena.js`: contenido pedagógico en español.
- `src/data/scenarios.js`: 30 escenarios configurables, capas, cámara, intensidad y perfiles.
- `src/engine/game.js`: selector justo, puntuación, actualización inmutable de jugadores, opciones y resolución visual de la secuencia.
- `src/three/Planet.jsx`: globo WebGL, textura cartográfica local, atmósfera, cámara esférica interpolada con GSAP, flujos y señales superficiales.
- `src/three/OceanSection.jsx`: perfiles y región costera SVG con perspectiva conceptual.
- `src/three/Storm.jsx`: bandas, ojo y precipitación de un ciclón del hemisferio norte.
- `src/styles.css`: diseño adaptable, estados interactivos y movimiento reducido.
- `public/land.geojson`: cartografía local de Natural Earth.
- `tests/game.test.js`: pruebas de lógica.

Dependencias de ejecución: React, React DOM, Three.js, React Three Fiber, drei y GSAP. Desarrollo: Vite, plugin React y Vitest. JavaScript, sin TypeScript. `package-lock.json` fija las versiones instaladas.

### Agregar un fenómeno

Añadir un registro a `phenomena.js` con ID único, nombre, categoría, región, vista, cámara, seis pasos, tres pistas, definición y señal clave. Implementar su lenguaje visual reutilizando las capas del planeta o las vistas de sección. Añadir un distractor relacionado en `optionsFor` y revisar el selector si se cambia el tamaño del catálogo. Las tres configuraciones se generan automáticamente.

### Agregar un escenario

Agregar o extender los objetos de `scenarios.js` con ID único, fenómeno existente, dificultad, variante, cámara y parámetros visuales. El selector actual elige una configuración por fenómeno y dificultad; para varias configuraciones en esa combinación, cambiar su búsqueda por selección aleatoria entre candidatos. `sceneAt` decide las vistas durante la secuencia. Mantener seis pasos sincronizados y probar que exista evidencia suficiente antes de habilitar respuestas.

## Ciencia, fuentes y simplificaciones

> Earth Signals utiliza representaciones educativas simplificadas de procesos climáticos y oceanográficos. No pretende sustituir modelos climáticos numéricos.

No hay simulación de fluidos ni pronóstico. Las profundidades, velocidades, colores, escalas de tiempo y trayectorias son conceptuales, no datos medidos. El océano y las costas regionales usan SVG pseudo-3D por claridad y rendimiento. La geometría del planeta usa cartografía simplificada y una textura generada localmente; no es fotografía satelital. ENSO presenta cambios acoplados, no una cadena universal exhaustiva. La haloclina muestra un ejemplo con salinidad creciente hacia abajo; el gradiente puede tener otra dirección. La circulación profunda no es una cinta rígida. El ciclón representa el hemisferio norte. El cambio climático es una tendencia multidecenal, no tiempo meteorológico diario.

Fuentes para revisión y ampliación:

- NOAA, [El Niño y La Niña](https://oceanservice.noaa.gov/facts/ninonina.html).
- NOAA PMEL, [What is El Niño?](https://www.pmel.noaa.gov/elnino/what-is-el-nino).
- NOAA, [Thermohaline Circulation](https://oceanservice.noaa.gov/education/tutorial_currents/05conveyor1.html).
- NOAA Ocean Exploration, [How does the ocean affect hurricanes?](https://oceanexplorer.noaa.gov/ocean-fact/hurricanes/).
- Natural Earth, [condiciones de uso: dominio público](https://www.naturalearthdata.com/about/terms-of-use/). Geometría 1:110m obtenida del repositorio `nvkelso/natural-earth-vector`, archivo `ne_110m_land.geojson`.

## Accesibilidad y rendimiento

Leyendas textuales, dirección de flechas, etiquetas además del color, botones accesibles por teclado, `aria-live` para explicaciones, nombres limitados a 24 caracteres y diseño móvil. `prefers-reduced-motion` detiene animaciones decorativas y representa flechas en posiciones estáticas. Canvas limitado a DPR 1.5; el motor 3D se carga de forma diferida. Los recursos se liberan al desmontar. Si WebGL falla, aparece un aviso y las lecciones SVG continúan disponibles; para la experiencia completa se requiere WebGL.

## Validación

`npm test`: 15 pruebas, incluyendo penalizaciones por pistas, límites del bonus, respuestas incorrectas, actualización inmutable, opciones únicas, cobertura del catálogo y las nueve combinaciones de personas/rondas. `npm run build` genera la aplicación de producción.

Las pruebas automatizadas cubren la lógica, no constituyen validación exhaustiva de WebGL en todos los dispositivos. No se incluyen sonido (opcional), persistencia de partidas ni despliegue público automático.
