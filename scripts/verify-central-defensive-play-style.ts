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
simulation.setFormation("4-3-3");
simulation.autoLineup();
for (const [playerId, slotId] of [["p6", "lcm"], ["p8", "cm"]] as const) {
  simulation.selectPlayer(playerId);
  if (!simulation.assignSelected(slotId)) throw new Error(`${playerId} could not be assigned to ${slotId}`);
}
simulation.setPlayingStyle("press");
const before = simulation.score().tactics;
const cm = simulation.setCmPlayStyle("p6", "deep-playmaker");
const dm = simulation.setDmPlayStyle("p8", "anchor");
const invalidCm = simulation.setCmPlayStyle("p11", "mezzala");
const invalidDm = simulation.setDmPlayStyle("p11", "regista");
const after = simulation.score().tactics;
const centralMidfielder = simulation.rosterPlayers.find((player) => player.id === "p6");
const defensiveMidfielder = simulation.rosterPlayers.find((player) => player.id === "p8");
if (!centralMidfielder || !defensiveMidfielder) throw new Error("Role test players are missing.");
centralMidfielder.attack = 99;
defensiveMidfielder.attack = 98;
const forcedFlow = (simulation as unknown as { createMatchFlow: (playerGoals: number, opponentGoals: number, opponentName: string, tactics: typeof after, matchWeek: number) => { highlights: Array<{ text: string }> } }).createMatchFlow(2, 0, "検証FC", after, 15);
const stored = storage.data.get("touchline-tactics-save-v1");
const restored = new ClubSimulation();
const restoredCm = restored.rosterPlayers.find((player) => player.id === "p6");
const restoredDm = restored.rosterPlayers.find((player) => player.id === "p8");

const report = {
  cm,
  dm,
  invalidCm,
  invalidDm,
  tactics: {
    before: { attack: before.cmRoleAttack + before.dmRoleAttack, defense: before.cmRoleDefense + before.dmRoleDefense, summary: `${before.cmRoleSummary} / ${before.dmRoleSummary}` },
    after: { attack: after.cmRoleAttack + after.dmRoleAttack, defense: after.cmRoleDefense + after.dmRoleDefense, summary: `${after.cmRoleSummary} / ${after.dmRoleSummary}` },
  },
  highlights: forcedFlow.highlights.map((highlight) => highlight.text),
  persistence: { saved: Boolean(stored), cmPlayStyle: restoredCm?.cmPlayStyle, dmPlayStyle: restoredDm?.dmPlayStyle },
};

if (!cm.ok || !dm.ok || invalidCm.ok || invalidDm.ok || after.cmRoleAttack + after.dmRoleAttack >= before.cmRoleAttack + before.dmRoleAttack || !after.cmRoleSummary.includes("ディープ・プレーメーカー") || !after.dmRoleSummary.includes("アンカー") || !report.highlights.some((text) => text.includes("ディープ・プレーメーカーとして")) || !report.highlights.some((text) => text.includes("アンカーとして")) || !stored || restoredCm?.cmPlayStyle !== "deep-playmaker" || restoredDm?.dmPlayStyle !== "anchor") throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
