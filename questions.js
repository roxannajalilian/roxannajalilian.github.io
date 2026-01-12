// Scale: 0..4 (Never, Rarely, Sometimes, Often, Always)
export const SCALE = [
  { label: "Never", value: 0 },
  { label: "Rarely", value: 1 },
  { label: "Sometimes", value: 2 },
  { label: "Often", value: 3 },
  { label: "Always", value: 4 },
];

function q(id, text, help, weight = 1, tag = "mind") {
  return { id, text, help, weight, tag };
}

// Tags used to build “insights” metrics
// mind = overthinking, evidence = reality-check, boundaries = self-respect,
// signals = mixed signals, self = confidence
export const TEEN_QUESTIONS = [
  q("t1", "I reread messages a lot to find hidden meaning.", "This often increases anxiety.", 1, "mind"),
  q("t2", "If someone replies late, I assume it means they don’t care.", "Late replies can have many reasons.", 1, "mind"),
  q("t3", "I overthink punctuation, emojis, or short replies.", "Tone guessing can be inaccurate.", 1, "mind"),
  q("t4", "I can list real evidence, not just feelings, for what I believe.", "Evidence = facts you can point to.", 1, "evidence"),
  q("t5", "I ask myself: what would I tell my friend in this situation?", "This reduces spirals.", 1, "evidence"),
  q("t6", "I can stop myself from double-texting when I’m anxious.", "Pause tactics matter.", 1, "boundaries"),
  q("t7", "I feel like my mood depends on their reply.", "This is a common trap.", 1, "mind"),
  q("t8", "They give mixed signals (hot/cold).", "Mixed signals = inconsistent actions.", 1, "signals"),
  q("t9", "I communicate calmly instead of testing them.", "Tests usually create drama.", 1, "boundaries"),
  q("t10", "I feel confident even if they don’t respond quickly.", "Self-confidence stabilizes you.", 1, "self"),
  q("t11", "I can accept uncertainty without spiraling.", "Uncertainty tolerance is key.", 1, "self"),
  q("t12", "I assume the worst before checking the simplest explanation.", "Worst-case thinking grows delulu.", 1, "mind"),
  q("t13", "I notice red flags and don’t ignore them.", "Being realistic protects you.", 1, "evidence"),
  q("t14", "I set boundaries if something makes me uncomfortable.", "Boundaries are self-respect.", 1, "boundaries"),
  q("t15", "I do my own thing instead of waiting on their texts.", "Balance prevents obsession.", 1, "self"),
  q("t16", "I feel pressure to reply instantly.", "It’s okay to breathe.", 1, "mind"),
  q("t17", "I can directly ask for clarity instead of guessing.", "Clarity beats assumptions.", 1, "evidence"),
  q("t18", "I compare their actions vs their words.", "Actions matter more.", 1, "evidence"),
  q("t19", "I find myself stalking their socials for clues.", "This usually fuels spirals.", 1, "mind"),
  q("t20", "I can keep my dignity even if I like them a lot.", "Dignity is power.", 1, "boundaries"),
];

export const ADULT_QUESTIONS = [
  q("a1", "I feel anxious when they don’t text back quickly.", "Attachment triggers can show up.", 1, "mind"),
  q("a2", "I interpret short replies as rejection.", "Short replies can be neutral.", 1, "mind"),
  q("a3", "I can describe what I want clearly (without hints).", "Directness reduces confusion.", 1, "boundaries"),
  q("a4", "Their consistency matches what they say.", "Consistency reduces delulu.", 1, "evidence"),
  q("a5", "I tolerate uncertainty without chasing reassurance.", "This is emotional control.", 1, "self"),
  q("a6", "I avoid “testing” them (jealousy games, etc.).", "Tests create mess.", 1, "boundaries"),
  q("a7", "I know my standards and enforce them.", "Standards protect your time.", 1, "boundaries"),
  q("a8", "I don’t romanticize potential over reality.", "Potential is not a relationship.", 1, "evidence"),
  q("a9", "I don’t over-invest before they show effort.", "Match energy, don’t chase.", 1, "boundaries"),
  q("a10", "I keep my life full even while dating.", "Balance prevents obsession.", 1, "self"),
  q("a11", "I ask clarifying questions instead of guessing tone.", "Clarity > spiraling.", 1, "evidence"),
  q("a12", "I recognize mixed signals and respond calmly.", "Hot/cold = information.", 1, "signals"),
  q("a13", "I can walk away if it’s not respectful.", "Self-respect is key.", 1, "self"),
  q("a14", "I can tell the difference between chemistry and compatibility.", "Compatibility is long-term.", 1, "evidence"),
  q("a15", "I don’t read deep meaning into punctuation/emojis.", "Micro-signals can mislead.", 1, "mind"),
  q("a16", "I don’t stalk socials for ‘proof’.", "This usually increases anxiety.", 1, "mind"),
  q("a17", "I can wait before responding when I’m emotional.", "Pause = power.", 1, "self"),
  q("a18", "I choose calm communication over dramatic messages.", "Drama lowers outcomes.", 1, "boundaries"),
  q("a19", "I focus on behavior patterns, not one message.", "Patterns matter more.", 1, "evidence"),
  q("a20", "I feel grounded in my own worth.", "Your worth is not a text.", 1, "self"),
];

export function getQuestions(mode) {
  return mode === "adult" ? ADULT_QUESTIONS : TEEN_QUESTIONS;
}
