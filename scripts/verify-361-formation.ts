import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { formations } from "../client/src/game/data";

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

const formation = formations.find((item) => item.id === "3-6-1");
if (!formation) throw new Error("3-6-1がフォーメーション定義に存在しません。");

const expectedSlots = ["gk", "lcb", "cb", "rcb", "lwb", "lm", "lcm", "rcm", "rm", "rwb", "st"];
const actualSlots = formation.slots.map((slot) => slot.id);
if (formation.slots.length !== 11 || expectedSlots.some((id) => !actualSlots.includes(id))) {
  throw new Error(`3-6-1の枠構成が不正です: ${actualSlots.join(",")}`);
}
if (!formation.slots.find((slot) => slot.id === "lm")?.allowed.includes("SH") || !formation.slots.find((slot) => slot.id === "lwb")?.allowed.includes("SB")) {
  throw new Error("3-6-1のサイド連動に必要なSH/SB枠が不正です。");
}

const simulation = new ClubSimulation();
simulation.setFormation("3-6-1");
const sh = simulation.rosterPlayers.find((player) => player.id === "p19");
const sb = simulation.rosterPlayers.find((player) => player.id === "p9");
if (!sh || !sb) throw new Error("サイド連動の検証選手を取得できません。");

simulation.selectPlayer(sh.id);
const assignedSh = simulation.assignSelected("lm");
simulation.selectPlayer(sb.id);
const assignedSb = simulation.assignSelected("lwb");
const active = simulation.score().tactics;
if (!assignedSh || !assignedSb || active.formationLabel !== "3-6-1" || active.formationTrait !== "六枚の中盤" || active.sideLinkAttack < 1 || !active.sideLinkDetails.some((detail) => detail.side === "左" && detail.totalBoost > 0)) {
  throw new Error(JSON.stringify({ assignedSh, assignedSb, tactics: active }));
}

const restored = new ClubSimulation();
const restoredTactics = restored.score().tactics;
if (restored.formation.id !== "3-6-1" || restoredTactics.formationTrait !== "六枚の中盤") {
  throw new Error(JSON.stringify({ formation: restored.formation.id, tactics: restoredTactics }));
}

console.log(JSON.stringify({ formation: formation.label, slots: formation.slots.length, sideLink: `攻+${active.sideLinkAttack}/守+${active.sideLinkDefense}`, restored: restored.formation.id }));
