import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { playerSkillCatalog, playerSkillGrowthFocus, type PlayerSkillId } from "../client/src/game/data";

const storageKey = "touchline-tactics-save-v1";
const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const simulation = new ClubSimulation();
simulation.autoLineup();
const player = simulation.rosterPlayers.find((item) => item.id === "p2") ?? simulation.rosterPlayers.find((item) => simulation.skillProgressFor(item).some((skill) => !skill.learned));
if (!player) throw new Error("progression player was not found");

const candidate = simulation.skillProgressFor(player).find((skill) => !skill.learned);
if (!candidate) throw new Error(JSON.stringify({ phase: "candidate-discovery", player, progress: simulation.skillProgressFor(player) }));
const targetId = candidate.skillId as PlayerSkillId;
const slot = simulation.formation.slots.find((item) => item.allowed.includes(player.position));
if (!slot) throw new Error(JSON.stringify({ phase: "player-slot", player, formation: simulation.formation }));
Object.entries(simulation.lineupState).forEach(([slotId, playerId]) => { if (playerId === player.id) simulation.lineupState[slotId] = null; });
simulation.lineupState[slot.id] = player.id;

const targetSet = simulation.setSkillTrainingTarget(player.id, targetId);
if (!targetSet.ok || simulation.skillTrainingTargetFor(player)?.skillId !== targetId) throw new Error(JSON.stringify({ phase: "target-selection", targetSet, target: simulation.skillTrainingTargetFor(player) }));

player.skillXp = { ...(player.skillXp ?? {}), [targetId]: 96 };
const focus = playerSkillGrowthFocus[targetId][0];
const training = simulation.train(focus);
const learned = simulation.skillProgressFor(player).find((skill) => skill.skillId === targetId);
if (!training.ok || !learned?.learned || !player.skills?.includes(targetId) || learned.xp < 100) {
  throw new Error(JSON.stringify({ phase: "skill-learning", training, player, learned }));
}

const facilityUpgrade = simulation.upgradeTrainingFacility();
player.skillXp = { ...(player.skillXp ?? {}), [targetId]: 112 };
const masteryTraining = simulation.train(focus);
const mastered = simulation.skillProgressFor(player).find((skill) => skill.skillId === targetId);
if (!facilityUpgrade.ok || !masteryTraining.ok || !mastered || mastered.level < 2 || mastered.xp < 115) {
  throw new Error(JSON.stringify({ phase: "mastery-level", facilityUpgrade, masteryTraining, mastered }));
}

const xpBeforeMatch = player.skillXp?.[targetId] ?? 0;
const result = simulation.advanceWeek();
const playerMatchGrant = result.skillXpGrants.find((grant) => grant.playerId === player.id && grant.skillId === targetId);
if (!playerMatchGrant || playerMatchGrant.source !== "試合" || (player.skillXp?.[targetId] ?? 0) !== xpBeforeMatch + playerMatchGrant.xp) {
  throw new Error(JSON.stringify({ phase: "match-xp", xpBeforeMatch, result, currentXp: player.skillXp?.[targetId] }));
}

const replan = simulation.applyHalfTimePlan("attacking", "direct", []);
const replanned = simulation.lastResult;
const replannedGrant = replanned?.skillXpGrants.find((grant) => grant.playerId === player.id && grant.skillId === targetId);
if (!replan.ok || !replanned || !replannedGrant || (player.skillXp?.[targetId] ?? 0) !== xpBeforeMatch + replannedGrant.xp) {
  throw new Error(JSON.stringify({ phase: "halftime-xp-recalculation", replan, xpBeforeMatch, replanned, currentXp: player.skillXp?.[targetId] }));
}

const restored = new ClubSimulation();
const restoredPlayer = restored.rosterPlayers.find((item) => item.id === player.id);
if (!restoredPlayer?.skills?.includes(targetId) || restoredPlayer.skillXp?.[targetId] !== player.skillXp?.[targetId] || restoredPlayer.skillTrainingTarget !== targetId) {
  throw new Error(JSON.stringify({ phase: "save-restore", restoredPlayer, expected: { skillXp: player.skillXp, targetId } }));
}

const legacySave = JSON.parse(store.get(storageKey) ?? "{}");
legacySave.players = legacySave.players.map(({ skillXp: _xp, skillTrainingTarget: _target, ...saved }: Record<string, unknown>) => saved);
store.set(storageKey, JSON.stringify(legacySave));
const legacyRestored = new ClubSimulation();
if (legacyRestored.rosterPlayers.some((item) => !item.skillXp || !item.skillTrainingTarget || !playerSkillCatalog[item.skillTrainingTarget])) {
  throw new Error(JSON.stringify({ phase: "legacy-fallback", roster: legacyRestored.rosterPlayers.map((item) => ({ id: item.id, xp: item.skillXp, target: item.skillTrainingTarget })) }));
}

console.log(JSON.stringify({ player: player.name, learned: learned.label, mastery: mastered.level, trainingFocus: focus, matchXp: playerMatchGrant.xp, replannedXp: replannedGrant.xp, restoredXp: restoredPlayer.skillXp?.[targetId], legacyPlayers: legacyRestored.rosterPlayers.length }));
