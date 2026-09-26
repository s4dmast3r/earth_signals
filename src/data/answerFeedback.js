const messages = {
  correct: [
    "¡Muy buen trabajo!",
    "¡Tienes una gran mirada científica!",
    "¡Gran trabajo!",
    "¡Excelente observación!",
    "¡Interpretaste muy bien las señales!",
    "¡Tu espíritu científico brilla!",
    "¡Conectaste las pistas del planeta!",
    "¡Qué buen análisis!",
  ],
  incorrect: [
    "¡Puedes mejorar!",
    "¡La próxima señal puede ser la tuya!",
    "¡Cada intento te ayuda a aprender!",
    "¡No te rindas, sigue explorando!",
    "¡Un repaso y estarás más cerca!",
    "¡La ciencia también avanza aprendiendo de los errores!",
    "¡Ánimo, vuelve a mirar las pistas!",
    "¡Suerte con la próxima observación!",
  ],
};
const remaining = { correct: [], incorrect: [] };
const previous = { correct: null, incorrect: null };

// Consume every phrase before replenishing; avoid a repeat across bag boundaries.
export function nextFeedback(correct) {
  const kind = correct ? "correct" : "incorrect";
  if (!remaining[kind].length) remaining[kind] = [...messages[kind]];
  const candidates = remaining[kind].filter(
    (message) => message !== previous[kind],
  );
  const message = candidates[Math.floor(Math.random() * candidates.length)];
  remaining[kind].splice(remaining[kind].indexOf(message), 1);
  previous[kind] = message;
  return message;
}
