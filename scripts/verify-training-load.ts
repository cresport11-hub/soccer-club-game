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

const standard = new ClubSimulation();
standard.autoLineup();
const standardTarget = standard.rosterPlayers.find((player) => player.id === "p3");
if (!standardTarget) throw new Error("基準選手が見つかりません。");
const standardBefore = { attack: standardTarget.attack, fatigue: standardTarget.fatigue };
const standardResult = standard.train("attacking");
const standardGrowth = standardTarget.attack - standardBefore.attack;
const standardFatigue = standardTarget.fatigue - standardBefore.fatigue;

storage.data.clear();
const high = new ClubSimulation();
high.autoLineup();
const highTarget = high.rosterPlayers.find((player) => player.id === "p3");
if (!highTarget) throw new Error("高負荷選手が見つかりません。");
const update = high.setTrainingLoad("p3", "high");
const before = { attack: highTarget.attack, fatigue: highTarget.fatigue };
const riskBefore = high.trainingRiskReport("attacking").chance;
const train = high.train("attacking");
const highGrowth = highTarget.attack - before.attack;
const highFatigue = highTarget.fatigue - before.fatigue;
const stored = storage.data.get("touchline-tactics-save-v1");
const restored = new ClubSimulation();
const restoredTarget = restored.rosterPlayers.find((player) => player.id === "p3");

const report = {
  standard: { ok: standardResult.ok, growth: standardGrowth, fatigue: standardFatigue },
  high: { updateOk: update.ok, trainOk: train.ok, growth: highGrowth, fatigue: highFatigue, risk: riskBefore },
  persistence: { saved: Boolean(stored), load: restoredTarget?.trainingLoad },
};

if (!standardResult.ok || !update.ok || !train.ok || highGrowth <= standardGrowth || highFatigue <= standardFatigue || riskBefore <= 0 || restoredTarget?.trainingLoad !== "high") throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
