import { clamp } from "./utils.js";

export function createSpeechController({ onText, onStatus }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return {
      supported: false,
      start: () => onStatus?.("Voice input not supported in this browser."),
      stop: () => {}
    };
  }

  const recog = new SpeechRecognition();
  recog.continuous = true;
  recog.interimResults = true;
  recog.lang = "en-US";

  let running = false;
  let finalText = "";

  recog.onstart = () => {
    running = true;
    onStatus?.("Listening… speak normally.");
  };

  recog.onerror = (e) => {
    onStatus?.("Voice error: " + (e.error || "unknown"));
  };

  recog.onend = () => {
    running = false;
    onStatus?.("Stopped listening.");
  };

  recog.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const t = event.results[i][0].transcript;
      if (event.results[i].isFinal) finalText += t + " ";
      else interim += t;
    }
    const combined = (finalText + interim).trim();
    onText?.(combined.slice(0, clamp(combined.length, 0, 5000)));
  };

  return {
    supported: true,
    start: () => { if (!running) { finalText = ""; recog.start(); } },
    stop: () => { if (running) recog.stop(); },
    toggle: () => { running ? recog.stop() : (finalText="", recog.start()); },
    isRunning: () => running
  };
}
