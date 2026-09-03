import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { GameUI } from "../client/src/game/ui";

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
simulation.rosterPlayers[0].salary = 24000000;
simulation.rosterPlayers[0].contractYears = 1;
simulation.rosterPlayers[1].salary = 18000000;
simulation.rosterPlayers[1].contractYears = 3;
simulation.rosterPlayers[2].salary = 4200000;
simulation.rosterPlayers[2].contractYears = 2;

const methods = GameUI.prototype as unknown as {
  pageHeading: (this: unknown, kicker: string, title: string, copy: string) => string;
  organizedRosterPlayers: (this: RosterContext) => typeof simulation.rosterPlayers;
  teamPage: (this: RosterContext) => string;
};
type RosterContext = {
  simulation: ClubSimulation;
  rosterSort: "ability" | "salary-high" | "salary-low" | "contract-short" | "contract-long";
  rosterSalaryFilter: "all" | "high" | "low";
  rosterContractFilter: "all" | "due" | "short" | "long";
  pageHeading: (kicker: string, title: string, copy: string) => string;
  organizedRosterPlayers: () => typeof simulation.rosterPlayers;
};
const context: RosterContext = {
  simulation,
  rosterSort: "ability",
  rosterSalaryFilter: "all",
  rosterContractFilter: "all",
  pageHeading: methods.pageHeading,
  organizedRosterPlayers() { return methods.organizedRosterPlayers.call(this); },
};

context.rosterSort = "salary-high";
const highSalaryOrder = context.organizedRosterPlayers().map((player) => player.id);
context.rosterSort = "contract-short";
const shortContractOrder = context.organizedRosterPlayers().map((player) => player.id);
context.rosterSalaryFilter = "high";
const highSalaryOnly = context.organizedRosterPlayers();
context.rosterSalaryFilter = "all";
context.rosterContractFilter = "due";
const dueOnly = context.organizedRosterPlayers();
context.rosterSalaryFilter = "high";
const highSalaryDueOnly = context.organizedRosterPlayers();
const html = methods.teamPage.call(context);

if (highSalaryOrder[0] !== simulation.rosterPlayers[0].id || shortContractOrder[0] !== simulation.rosterPlayers[0].id || highSalaryOnly.some((player) => player.salary < 10000000) || dueOnly.some((player) => (player.contractYears ?? 1) > 1) || !highSalaryDueOnly.some((player) => player.id === simulation.rosterPlayers[0].id) || highSalaryDueOnly.some((player) => player.salary < 10000000 || (player.contractYears ?? 1) > 1) || !html.includes("CONTRACT ORGANIZER") || !html.includes("年俸 高い順") || !html.includes("残り 1年 / 更新優先")) {
  throw new Error("契約整理の並び替え・絞り込み検証に失敗しました。");
}

console.log(JSON.stringify({ highSalaryOrder: highSalaryOrder.slice(0, 3), shortContractOrder: shortContractOrder.slice(0, 3), highSalary: highSalaryOnly.length, due: dueOnly.length, combined: highSalaryDueOnly.length }));
