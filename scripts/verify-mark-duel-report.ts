import { ClubSimulation } from "../client/src/game/ClubSimulation";

const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const simulation = new ClubSimulation();
simulation.setFormation("3-6-1");
simulation.setPlayingStyle("press");
const preMatchScore = simulation.score();
const clamp = (value: number) => Math.max(0, Math.min(99, value));
const result = simulation.advanceWeek();
const duels = result.markDuels;

const initialAttack = clamp(preMatchScore.attack + result.tacticalMatchup.playerAttackModifier + result.markingImpact.attackModifier);
const initialDefense = clamp(preMatchScore.defense + result.tacticalMatchup.playerDefenseModifier + result.markingImpact.defenseModifier);
if (duels.length !== 11 || new Set(duels.map((duel) => duel.playerId)).size !== 11 || duels.some((duel) => !duel.opponent || duel.engagements < 5 || duel.activity < 35 || duel.activity > 95 || !["勝利", "拮抗", "苦戦"].includes(duel.outcome)) || Math.abs(result.markingImpact.attackModifier) > 1 || Math.abs(result.markingImpact.defenseModifier) > 1 || result.matchAttack !== initialAttack || result.matchDefense !== initialDefense || !result.highlights.some((item) => item.minute === 18 && item.text.includes("MARKING IMPACT"))) {
  throw new Error(JSON.stringify({ phase: "initial-report", duels, impact: result.markingImpact, initialAttack, initialDefense, matchAttack: result.matchAttack, matchDefense: result.matchDefense, highlights: result.highlights }));
}

const before = duels.map((duel) => `${duel.playerId}:${duel.differential}`).join("/");
const starterIds = new Set(Object.values(simulation.lineupState).filter((playerId): playerId is string => Boolean(playerId)));
const plannedChange = Object.entries(simulation.lineupState).map(([slotId, outPlayerId]) => {
  const incoming = simulation.rosterPlayers.find((player) => !starterIds.has(player.id) && simulation.playerIsFit(player, slotId));
  return outPlayerId && incoming ? { outPlayerId, inPlayerId: incoming.id } : null;
}).find((change): change is { outPlayerId: string; inPlayerId: string } => Boolean(change));
if (!plannedChange) throw new Error(JSON.stringify({ phase: "find-substitution", lineup: simulation.lineupState }));
const revised = simulation.applyHalfTimePlan("attacking", "direct", [plannedChange]);
const revisedResult = simulation.lastResult;
const revisedDuels = revisedResult?.markDuels ?? [];
const after = revisedDuels.map((duel) => `${duel.playerId}:${duel.differential}`).join("/");
const revisedScore = simulation.score();
const revisedAttack = revisedResult ? clamp(revisedScore.attack + revisedResult.tacticalMatchup.playerAttackModifier + revisedResult.markingImpact.attackModifier) : -1;
const revisedDefense = revisedResult ? clamp(revisedScore.defense + revisedResult.tacticalMatchup.playerDefenseModifier + revisedResult.markingImpact.defenseModifier) : -1;
if (!revised.ok || !revisedResult || revisedDuels.length !== 11 || new Set(revisedDuels.map((duel) => duel.playerId)).size !== 11 || before === after || revisedDuels.some((duel) => !duel.summary || !duel.activityGrade) || revisedResult.matchAttack !== revisedAttack || revisedResult.matchDefense !== revisedDefense) {
  throw new Error(JSON.stringify({ phase: "half-time-recalculation", revised, plannedChange, before, after, duels: revisedDuels, impact: revisedResult?.markingImpact, revisedAttack, revisedDefense, matchAttack: revisedResult?.matchAttack, matchDefense: revisedResult?.matchDefense }));
}

const restored = new ClubSimulation();
if (restored.formation.id !== "3-6-1" || restored.playingStyle !== "direct") {
  throw new Error(JSON.stringify({ phase: "save-restore", formation: restored.formation.id, playingStyle: restored.playingStyle }));
}

console.log(JSON.stringify({ duels: revisedDuels.length, outcomes: revisedDuels.reduce<Record<string, number>>((counts, duel) => ({ ...counts, [duel.outcome]: (counts[duel.outcome] ?? 0) + 1 }), {}), initialImpact: result.markingImpact, revisedImpact: revisedResult.markingImpact, standout: revisedDuels[0] }));
