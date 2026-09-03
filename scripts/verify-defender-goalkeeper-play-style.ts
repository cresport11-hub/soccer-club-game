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
for (const [playerId, slotId] of [["p11", "lcb"], ["p9", "lb"], ["p13", "gk"]] as const) {
  simulation.selectPlayer(playerId);
  if (!simulation.assignSelected(slotId)) throw new Error(`${playerId} could not be assigned to ${slotId}`);
}
simulation.setPlayingStyle("press");
const before = simulation.score().tactics;
const cb = simulation.setCbPlayStyle("p11", "stopper");
const sb = simulation.setSbPlayStyle("p9", "defensive-fullback");
const gk = simulation.setGkPlayStyle("p13", "shot-stopper");
const invalidCb = simulation.setCbPlayStyle("p1", "cover");
const invalidSb = simulation.setSbPlayStyle("p1", "overlap");
const invalidGk = simulation.setGkPlayStyle("p1", "distributor");
const after = simulation.score().tactics;
const centreBack = simulation.rosterPlayers.find((player) => player.id === "p11");
const fullback = simulation.rosterPlayers.find((player) => player.id === "p9");
if (!centreBack || !fullback) throw new Error("Defensive role test players are missing.");
centreBack.attack = 99;
fullback.attack = 98;
const forcedFlow = (simulation as unknown as { createMatchFlow: (playerGoals: number, opponentGoals: number, opponentName: string, tactics: typeof after, matchWeek: number) => { highlights: Array<{ text: string }> } }).createMatchFlow(2, 0, "検証FC", after, 17);
const stored = storage.data.get("touchline-tactics-save-v1");
const restored = new ClubSimulation();
const restoredCb = restored.rosterPlayers.find((player) => player.id === "p11");
const restoredSb = restored.rosterPlayers.find((player) => player.id === "p9");
const restoredGk = restored.rosterPlayers.find((player) => player.id === "p13");

const report = {
  cb,
  sb,
  gk,
  invalidCb,
  invalidSb,
  invalidGk,
  tactics: {
    before: { attack: before.cbRoleAttack + before.sbRoleAttack + before.gkRoleAttack, defense: before.cbRoleDefense + before.sbRoleDefense + before.gkRoleDefense, summary: `${before.cbRoleSummary} / ${before.sbRoleSummary} / ${before.gkRoleSummary}` },
    after: { attack: after.cbRoleAttack + after.sbRoleAttack + after.gkRoleAttack, defense: after.cbRoleDefense + after.sbRoleDefense + after.gkRoleDefense, summary: `${after.cbRoleSummary} / ${after.sbRoleSummary} / ${after.gkRoleSummary}` },
  },
  highlights: forcedFlow.highlights.map((highlight) => highlight.text),
  persistence: { saved: Boolean(stored), cbPlayStyle: restoredCb?.cbPlayStyle, sbPlayStyle: restoredSb?.sbPlayStyle, gkPlayStyle: restoredGk?.gkPlayStyle },
};

if (!cb.ok || !sb.ok || !gk.ok || invalidCb.ok || invalidSb.ok || invalidGk.ok || after.cbRoleDefense + after.sbRoleDefense + after.gkRoleDefense <= before.cbRoleDefense + before.sbRoleDefense + before.gkRoleDefense || !after.cbRoleSummary.includes("ストッパー") || !after.sbRoleSummary.includes("守備的SB") || !after.gkRoleSummary.includes("ショットストッパー") || !report.highlights.some((text) => text.includes("ストッパーとして")) || !report.highlights.some((text) => text.includes("守備的SBとして")) || !report.highlights.some((text) => text.includes("GK役割") && text.includes("ショットストッパー")) || !stored || restoredCb?.cbPlayStyle !== "stopper" || restoredSb?.sbPlayStyle !== "defensive-fullback" || restoredGk?.gkPlayStyle !== "shot-stopper") throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
