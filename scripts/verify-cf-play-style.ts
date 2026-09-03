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
simulation.autoLineup();
simulation.setPlayingStyle("direct");
const before = simulation.score().tactics;
const target = simulation.setCfPlayStyle("p2", "target");
const targetTactics = simulation.score().tactics;
const invalid = simulation.setCfPlayStyle("p8", "runner");
const result = simulation.advanceWeek();
const forcedFlow = (simulation as unknown as { createMatchFlow: (playerGoals: number, opponentGoals: number, opponentName: string, tactics: typeof targetTactics, matchWeek: number) => { highlights: Array<{ text: string }> } }).createMatchFlow(2, 0, "検証FC", targetTactics, 11);
const stored = storage.data.get("touchline-tactics-save-v1");
const restored = new ClubSimulation();
const restoredPlayer = restored.rosterPlayers.find((player) => player.id === "p2");

const report = {
  target,
  invalid,
  tactics: {
    before: { attack: before.cfRoleAttack, summary: before.cfRoleSummary },
    target: { attack: targetTactics.cfRoleAttack, summary: targetTactics.cfRoleSummary },
  },
  match: { attack: result.matchAttack, roleInLeagueLog: result.highlights.some((highlight) => highlight.text.includes("ターゲットマンとして")), roleInForcedHighlight: forcedFlow.highlights.some((highlight) => highlight.text.includes("ターゲットマンとして")) },
  persistence: { saved: Boolean(stored), cfPlayStyle: restoredPlayer?.cfPlayStyle },
};

if (!target.ok || invalid.ok || targetTactics.cfRoleAttack <= before.cfRoleAttack || !targetTactics.cfRoleSummary.includes("ターゲットマン") || !report.match.roleInForcedHighlight || !stored || restoredPlayer?.cfPlayStyle !== "target") throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
