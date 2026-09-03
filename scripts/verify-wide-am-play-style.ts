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
for (const [playerId, slotId] of [["p3", "lw"], ["p5", "lcm"]] as const) {
  simulation.selectPlayer(playerId);
  if (!simulation.assignSelected(slotId)) throw new Error(`${playerId} could not be assigned to ${slotId}`);
}
simulation.setPlayingStyle("press");
const before = simulation.score().tactics;
const wg = simulation.setWgPlayStyle("p3", "wide-worker");
const am = simulation.setAmPlayStyle("p5", "pressing-ten");
const invalidWg = simulation.setWgPlayStyle("p6", "touchline");
const invalidAm = simulation.setAmPlayStyle("p6", "playmaker");
const after = simulation.score().tactics;
const widePlayer = simulation.rosterPlayers.find((player) => player.id === "p3");
const attackingMidfielder = simulation.rosterPlayers.find((player) => player.id === "p5");
if (!widePlayer || !attackingMidfielder) throw new Error("Role test players are missing.");
widePlayer.attack = 99;
attackingMidfielder.attack = 98;
const forcedFlow = (simulation as unknown as { createMatchFlow: (playerGoals: number, opponentGoals: number, opponentName: string, tactics: typeof after, matchWeek: number) => { highlights: Array<{ text: string }> } }).createMatchFlow(2, 0, "検証FC", after, 12);
const stored = storage.data.get("touchline-tactics-save-v1");
const restored = new ClubSimulation();
const restoredWg = restored.rosterPlayers.find((player) => player.id === "p3");
const restoredAm = restored.rosterPlayers.find((player) => player.id === "p5");

const report = {
  wg,
  am,
  invalidWg,
  invalidAm,
  tactics: {
    before: { attack: before.wgRoleAttack + before.amRoleAttack, defense: before.wgRoleDefense + before.amRoleDefense, summary: `${before.wgRoleSummary} / ${before.amRoleSummary}` },
    after: { attack: after.wgRoleAttack + after.amRoleAttack, defense: after.wgRoleDefense + after.amRoleDefense, summary: `${after.wgRoleSummary} / ${after.amRoleSummary}` },
  },
  highlights: forcedFlow.highlights.map((highlight) => highlight.text),
  persistence: { saved: Boolean(stored), wgPlayStyle: restoredWg?.wgPlayStyle, amPlayStyle: restoredAm?.amPlayStyle },
};

if (!wg.ok || !am.ok || invalidWg.ok || invalidAm.ok || after.wgRoleDefense + after.amRoleDefense <= before.wgRoleDefense + before.amRoleDefense || !after.wgRoleSummary.includes("ワイド・ワーカー") || !after.amRoleSummary.includes("プレッシング10") || !report.highlights.some((text) => text.includes("ワイド・ワーカーとして")) || !report.highlights.some((text) => text.includes("プレッシング10として")) || !stored || restoredWg?.wgPlayStyle !== "wide-worker" || restoredAm?.amPlayStyle !== "pressing-ten") throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
