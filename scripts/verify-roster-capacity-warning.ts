import { ClubSimulation, ROSTER_LIMIT } from "../client/src/game/ClubSimulation";
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
const normal = simulation.rosterCapacityStatus;
const uiMethods = GameUI.prototype as unknown as { pageHeading: (this: unknown, kicker: string, title: string, copy: string) => string; teamPage: (this: { simulation: ClubSimulation; pageHeading: (kicker: string, title: string, copy: string) => string }) => string; marketPage: (this: { simulation: ClubSimulation; pageHeading: (kicker: string, title: string, copy: string) => string }) => string; };
const uiContext = { simulation, pageHeading: uiMethods.pageHeading };
const normalTeam = uiMethods.teamPage.call(uiContext);
const template = simulation.rosterPlayers[0];

while (simulation.rosterPlayers.length < 30) {
  const index = simulation.rosterPlayers.length;
  simulation.rosterPlayers.push({ ...template, id: `warning-${index}`, name: `警告検証 ${index}`, fatigue: 0 });
}
const thirty = simulation.rosterCapacityStatus;
const warningTeam = uiMethods.teamPage.call(uiContext);
const warningMarket = uiMethods.marketPage.call(uiContext);
simulation.rosterPlayers.push({ ...template, id: "warning-31", name: "警告検証 31", fatigue: 0 });
const thirtyOne = simulation.rosterCapacityStatus;
simulation.rosterPlayers.push({ ...template, id: "warning-32", name: "警告検証 32", fatigue: 0 });
const full = simulation.rosterCapacityStatus;
const fullTeam = uiMethods.teamPage.call(uiContext);
const fullMarket = uiMethods.marketPage.call(uiContext);
const report = { normal, thirty, thirtyOne, full };

if (normal.warning || normal.full || normal.remaining !== 12 || normalTeam.includes("SQUAD CAPACITY ALERT") || !thirty.warning || thirty.full || thirty.remaining !== 2 || !warningTeam.includes("SQUAD CAPACITY ALERT") || !warningTeam.includes("保有枠の残りは 2 人です") || !warningMarket.includes("SQUAD CAPACITY ALERT") || !warningMarket.includes("チームで整理") || !thirtyOne.warning || thirtyOne.full || thirtyOne.remaining !== 1 || !full.warning || !full.full || full.remaining !== 0 || full.limit !== ROSTER_LIMIT || !fullTeam.includes("登録上限に到達しています") || !fullMarket.includes("市場との契約はできません")) {
  throw new Error(JSON.stringify(report));
}

console.log(JSON.stringify(report));
