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

const simulation = new ClubSimulation();
const sideHalf = simulation.rosterPlayers.find((player) => player.id === "p19");
if (!sideHalf) throw new Error("初期SH選手を確認できません。");

simulation.setFormation("4-4-2");
simulation.selectPlayer(sideHalf.id);
const assigned = simulation.assignSelected("lm");
const wideRole = simulation.wgPlayStyleFor(sideHalf);
const activeFit = wideRole ? simulation.rolePlayStyleFit(sideHalf, "wg", wideRole) : null;

const sideMidfieldSystems = ["4-4-2", "4-5-1", "3-4-3", "5-4-1"];
const labelledSideHalf = sideMidfieldSystems.every((id) => formations.find((formation) => formation.id === id)?.slots.some((slot) => slot.label === "SH"));
const wideForwardFit = formations.find((formation) => formation.id === "4-3-3")?.slots.filter((slot) => slot.label === "WG").every((slot) => slot.allowed.includes("SH"));
const wingBackFit = formations.find((formation) => formation.id === "3-5-2")?.slots.filter((slot) => slot.id === "lwb" || slot.id === "rwb").every((slot) => slot.allowed.includes("SH"));

const saved = storage.data.get("touchline-tactics-save-v1");
if (!saved) throw new Error("開幕セーブを作成できません。");
const legacyOpening = JSON.parse(saved) as { players: Array<{ id: string; position: string; secondary?: string }> };
const savedSideHalf = legacyOpening.players.find((player) => player.id === "p19");
if (savedSideHalf) { savedSideHalf.position = "AM"; savedSideHalf.secondary = "WG"; }
storage.setItem("touchline-tactics-save-v1", JSON.stringify(legacyOpening));
const restored = new ClubSimulation();
const migratedSideHalf = restored.rosterPlayers.find((player) => player.id === "p19");

const report = { position: sideHalf.position, assigned, active: activeFit?.active, sideMidfieldSystems: labelledSideHalf, wideForwardFit, wingBackFit, migratedPosition: migratedSideHalf?.position };
if (sideHalf.position !== "SH" || !assigned || !wideRole || !activeFit?.active || !labelledSideHalf || !wideForwardFit || !wingBackFit || migratedSideHalf?.position !== "SH") throw new Error(JSON.stringify(report));
console.log(JSON.stringify(report));
