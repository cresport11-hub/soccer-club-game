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
simulation.setFormation("4-5-1");
simulation.autoLineup();
simulation.selectPlayer("p6");
if (!simulation.assignSelected("lcm")) throw new Error("八雲琉生を4-5-1のCMへ配置できません。");
const configured = simulation.setCmPlayStyle("p6", "deep-playmaker");
const yakumo = simulation.rosterPlayers.find((player) => player.id === "p6");
if (!yakumo) throw new Error("検証対象の八雲琉生が見つかりません。");
const option = simulation.cmPlayStyleFor(yakumo);
if (!option) throw new Error("ディープ・プレーメーカー設定を取得できません。");
const centralFit = simulation.rolePlayStyleFit(yakumo, "cm", option);
const centralTactics = simulation.score().tactics;

simulation.setFormation("4-3-3");
simulation.autoLineup();
simulation.selectPlayer("p6");
if (!simulation.assignSelected("lcm")) throw new Error("八雲琉生を4-3-3のCMへ配置できません。");
const wideFit = simulation.rolePlayStyleFit(yakumo, "cm", option);

yakumo.pass = 12;
simulation.setPlayingStyle("possession");
const lowAbilityFit = simulation.rolePlayStyleFit(yakumo, "cm", option);
const stored = storage.data.get("touchline-tactics-save-v1");
const restored = new ClubSimulation();
const restoredYakumo = restored.rosterPlayers.find((player) => player.id === "p6");
const restoredOption = restoredYakumo ? restored.cmPlayStyleFor(restoredYakumo) : null;
const restoredFit = restoredYakumo && restoredOption ? restored.rolePlayStyleFit(restoredYakumo, "cm", restoredOption) : null;

const report = { configured, centralFit, centralTactics: { roleFitAttack: centralTactics.roleFitAttack, roleFitDefense: centralTactics.roleFitDefense, attackModifier: centralTactics.attackModifier, defenseModifier: centralTactics.defenseModifier }, wideFit, lowAbilityFit, persistence: { saved: Boolean(stored), style: restoredYakumo?.cmPlayStyle, pass: restoredYakumo?.pass, restoredFit } };

if (!configured.ok || centralFit.formationBonus !== 1 || wideFit.formationBonus !== 0 || centralFit.abilityBonus < 1 || centralTactics.roleFitDetails.find((item) => item.playerId === "p6")?.totalBoost !== centralFit.totalBoost || centralTactics.roleFitAttack < centralFit.attackBoost || centralTactics.roleFitDefense < centralFit.defenseBoost || lowAbilityFit.abilityBonus !== 0 || lowAbilityFit.abilityScore >= centralFit.abilityScore || !stored || restoredYakumo?.cmPlayStyle !== "deep-playmaker" || restoredYakumo.pass !== 12 || restoredFit?.abilityBonus !== 0) {
  throw new Error(JSON.stringify(report));
}

console.log(JSON.stringify(report));
