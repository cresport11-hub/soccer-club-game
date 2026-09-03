import { ClubSimulation } from "../client/src/game/ClubSimulation";

type BrowserStorage = {
  data: Map<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const storage: BrowserStorage = {
  data: new Map(),
  getItem(key) { return this.data.get(key) ?? null; },
  setItem(key, value) { this.data.set(key, value); },
  removeItem(key) { this.data.delete(key); },
};
Object.assign(globalThis, { localStorage: storage });

const simulation = new ClubSimulation();
simulation.setFormation("3-6-1");
simulation.setPlayingStyle("possession");
const waiting = simulation.score().tactics;
if (waiting.midfieldPressDetail.active || waiting.midfieldPressDetail.grade !== "準備中" || waiting.midfieldPressAttack !== 0 || waiting.midfieldPressDefense !== 0) {
  throw new Error(JSON.stringify({ phase: "waiting", midfieldPress: waiting.midfieldPressDetail }));
}

simulation.setPlayingStyle("press");
const active = simulation.score().tactics;
if (!active.midfieldPressDetail.active || !["中盤封鎖", "一斉奪回"].includes(active.midfieldPressDetail.grade) || active.midfieldPressDetail.fitted < 5 || active.midfieldPressDetail.ballWinners < 3 || active.midfieldPressAttack < 1 || active.midfieldPressDefense < 3) {
  throw new Error(JSON.stringify({ phase: "active", midfieldPress: active.midfieldPressDetail }));
}

const result = simulation.advanceWeek();
if (!result.tactics.midfieldPressDetail.active || !result.highlights.some((item) => item.minute === 41 && item.text.includes("中盤プレス")) || !result.halfTime.tacticalNote.includes("中盤プレス")) {
  throw new Error(JSON.stringify({ phase: "match", highlights: result.highlights, tacticalNote: result.halfTime.tacticalNote }));
}

const restored = new ClubSimulation();
const restoredTactics = restored.score().tactics;
if (restored.formation.id !== "3-6-1" || restored.currentPlayingStyle !== "press" || !restoredTactics.midfieldPressSummary.includes("中盤プレス")) {
  throw new Error(JSON.stringify({ phase: "restore", formation: restored.formation.id, style: restored.currentPlayingStyle, summary: restoredTactics.midfieldPressSummary }));
}

const misaligned = new ClubSimulation();
misaligned.setFormation("3-6-1");
misaligned.setPlayingStyle("press");
misaligned.lineupState.lwb = null;
misaligned.lineupState.lm = null;
const unfit = misaligned.score().tactics;
if (unfit.midfieldPressDetail.active || unfit.midfieldPressDetail.fitted >= 5 || unfit.midfieldPressDetail.grade !== "準備中") {
  throw new Error(JSON.stringify({ phase: "unfit", midfieldPress: unfit.midfieldPressDetail }));
}
misaligned.setFormation("4-3-3");
const outsideFormation = misaligned.score().tactics;
if (outsideFormation.midfieldPressDetail.active || outsideFormation.midfieldPressDetail.grade !== "対象外") {
  throw new Error(JSON.stringify({ phase: "outside-361", midfieldPress: outsideFormation.midfieldPressDetail }));
}

console.log(JSON.stringify({ grade: active.midfieldPressDetail.grade, boost: `攻+${active.midfieldPressAttack}/守+${active.midfieldPressDefense}`, pressers: active.midfieldPressDetail.ballWinners, highlight: result.highlights.find((item) => item.minute === 41)?.text }));
