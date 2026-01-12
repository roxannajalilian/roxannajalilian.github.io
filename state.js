import { nowISO } from "./utils.js";

export const DEFAULT_STATE = () => ({
  version: 1,
  age: null,
  mode: "teen", // teen | adult
  acceptedPolicy: false,

  situation: "",
  messages: "",

  qSet: "teen", // teen | adult
  qIndex: 0,
  answers: {}, // { [questionId]: value 0..4 }

  lastAnalysis: null, // analyzer output
  lastScore: null,    // { score, tier, metrics, advice }
  lastPlan: null,     // coach output

  createdAt: nowISO()
});

export const appState = DEFAULT_STATE();

export function resetState() {
  const fresh = DEFAULT_STATE();
  Object.keys(appState).forEach(k => delete appState[k]);
  Object.assign(appState, fresh);
}
