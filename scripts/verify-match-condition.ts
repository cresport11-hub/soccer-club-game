import { ClubSimulation } from "../client/src/game/ClubSimulation";

const storageKey = "touchline-tactics-save-v1";
const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const simulation = new ClubSimulation();
simulation.autoLineup();
const firstCondition = simulation.nextMatchCondition;
if (!firstCondition.isHome || firstCondition.homeDefense !== 1 || firstCondition.homeAttack !== 0 || firstCondition.morale !== 58 || firstCondition.momentum !== 0) throw new Error(JSON.stringify({ phase: "opening-condition", firstCondition }));

const preScore = simulation.score();
const preOpponent = simulation.currentOpponentTactics;
const preMatchup = simulation.currentTacticalMatchup;
const expectedAttack = clamp(preScore.attack + preMatchup.playerAttackModifier + firstCondition.homeAttack + firstCondition.moraleAttack + firstCondition.momentumAttack, 0, 99);
const expectedDefense = clamp(preScore.defense + preMatchup.playerDefenseModifier + firstCondition.homeDefense + firstCondition.moraleDefense + firstCondition.momentumDefense, 0, 99);
const firstResult = simulation.advanceWeek();
if (firstResult.matchAttack !== expectedAttack || firstResult.matchDefense !== expectedDefense || firstResult.matchCondition.summary !== firstCondition.summary || !firstResult.highlights.some((item) => item.minute === 9 && item.text.includes("MORALE"))) {
  throw new Error(JSON.stringify({ phase: "league-condition", expectedAttack, expectedDefense, result: firstResult.matchCondition, actual: [firstResult.matchAttack, firstResult.matchDefense], highlights: firstResult.highlights }));
}
const expectedMorale = clamp(58 + (firstResult.won ? 8 : firstResult.playerGoals === firstResult.opponentGoals ? 2 : -6) + (firstResult.won && firstResult.playerGoals - firstResult.opponentGoals >= 3 ? 1 : !firstResult.won && firstResult.playerGoals !== firstResult.opponentGoals && firstResult.playerGoals - firstResult.opponentGoals <= -3 ? -1 : 0), 0, 100);
if (firstResult.conditionAfter.morale !== expectedMorale || firstResult.conditionAfter.form[0]?.outcome !== (firstResult.won ? "W" : firstResult.playerGoals === firstResult.opponentGoals ? "D" : "L")) throw new Error(JSON.stringify({ phase: "condition-update", expectedMorale, after: firstResult.conditionAfter, score: [firstResult.playerGoals, firstResult.opponentGoals] }));

const halftime = simulation.applyHalfTimePlan("attacking", "direct", []);
const replanned = simulation.lastResult;
if (!halftime.ok || !replanned || replanned.matchCondition.morale !== 58 || !replanned.halfTime.tacticalNote.includes("MORALE") || !replanned.highlights.some((item) => item.minute === 9 && item.text.includes("FORM"))) {
  throw new Error(JSON.stringify({ phase: "halftime-condition", halftime, replanned }));
}

const secondResult = simulation.advanceWeek();
if (secondResult.matchCondition.isHome || secondResult.matchCondition.opponentHomeDefense !== 1 || secondResult.matchCondition.form.length < 1) throw new Error(JSON.stringify({ phase: "away-condition", condition: secondResult.matchCondition }));
const persisted = JSON.parse(store.get(storageKey) ?? "{}");
if (!Number.isFinite(persisted.teamMorale) || !Array.isArray(persisted.recentMatchForm) || !persisted.recentMatchForm.length) throw new Error(JSON.stringify({ phase: "condition-save", persisted }));
const reloaded = new ClubSimulation();
if (reloaded.teamMoraleValue !== simulation.teamMoraleValue || reloaded.recentForm.length !== simulation.recentForm.length) throw new Error(JSON.stringify({ phase: "condition-reload", before: { morale: simulation.teamMoraleValue, form: simulation.recentForm }, after: { morale: reloaded.teamMoraleValue, form: reloaded.recentForm } }));

console.log(JSON.stringify({ first: { score: `${firstResult.playerGoals}-${firstResult.opponentGoals}`, matchAttack: firstResult.matchAttack, matchDefense: firstResult.matchDefense, moraleAfter: firstResult.conditionAfter.morale }, replanned: { score: `${replanned.playerGoals}-${replanned.opponentGoals}`, moraleAfter: replanned.conditionAfter.morale }, away: { venueDefense: secondResult.matchCondition.opponentHomeDefense, momentum: secondResult.matchCondition.momentum }, reloaded: { morale: reloaded.teamMoraleValue, recent: reloaded.recentForm.map((entry) => entry.outcome).join("") } }));
