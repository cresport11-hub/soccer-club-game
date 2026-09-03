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

type Internals = { lineup: Record<string, string>; persist(): void };
const simulation = new ClubSimulation();
simulation.setFormation("4-4-2");
const internals = simulation as unknown as Internals;
const sideHalf = simulation.rosterPlayers.find((player) => player.position === "SH");
const winger = simulation.rosterPlayers.find((player) => player.position === "WG");
const fullback = simulation.rosterPlayers.find((player) => player.position === "SB");
if (!sideHalf || !winger || !fullback) throw new Error("サイド連動に必要なSH・WG・SBを確認できません。");

const place = (slotId: string, playerId: string) => {
  Object.keys(internals.lineup).forEach((id) => { if (internals.lineup[id] === playerId) delete internals.lineup[id]; });
  internals.lineup[slotId] = playerId;
};
place("lm", sideHalf.id);
place("lb", fullback.id);
simulation.setWgPlayStyle(sideHalf.id, "touchline");
simulation.setSbPlayStyle(fullback.id, "overlap");

const sideHalfTactics = simulation.score().tactics;
const sideHalfLink = sideHalfTactics.sideLinkDetails.find((item) => item.side === "左");
const expectedAttack = sideHalfTactics.formationAttack + sideHalfTactics.mentalityAttack + sideHalfTactics.styleAttack + sideHalfTactics.chemistryBonus + sideHalfTactics.cfRoleAttack + sideHalfTactics.wgRoleAttack + sideHalfTactics.amRoleAttack + sideHalfTactics.cmRoleAttack + sideHalfTactics.dmRoleAttack + sideHalfTactics.cbRoleAttack + sideHalfTactics.sbRoleAttack + sideHalfTactics.gkRoleAttack + sideHalfTactics.roleFitAttack + sideHalfTactics.sideLinkAttack;
internals.persist();
const restored = new ClubSimulation();
const restoredTactics = restored.score().tactics;

place("lm", winger.id);
simulation.setWgPlayStyle(winger.id, "touchline");
const wingerLink = simulation.score().tactics.sideLinkDetails.find((item) => item.side === "左");
place("lm", sideHalf.id);
delete internals.lineup.lb;
const noLink = simulation.score().tactics.sideLinkDetails.find((item) => item.side === "左");
place("lb", fullback.id);
const match = simulation.advanceWeek();

const report = {
  sideHalfLink,
  wingerLink,
  noLink,
  sideAttack: sideHalfTactics.sideLinkAttack,
  expectedAttack,
  actualAttack: sideHalfTactics.attackModifier,
  restoredSideAttack: restoredTactics.sideLinkAttack,
  restoredUsable: typeof restoredTactics.sideLinkSummary === "string",
  matchSideAttack: match.tactics.sideLinkAttack,
  sideHighlight: match.highlights.some((item) => item.text.includes("サイド連動")),
};
if (!sideHalfLink || sideHalfLink.widePosition !== "SH" || sideHalfLink.attackBoost !== 2 || sideHalfLink.defenseBoost !== 0 || !wingerLink || wingerLink.widePosition !== "WG" || noLink || sideHalfTactics.attackModifier !== expectedAttack || !report.restoredUsable || match.tactics.sideLinkAttack < 2 || !report.sideHighlight) throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
