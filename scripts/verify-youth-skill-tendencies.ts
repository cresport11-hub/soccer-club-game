import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { playerSkillCatalog, playerSkillGrowthFocus, youthIntakes, youthProspects, type PlayerSkillId } from "../client/src/game/data";

const storageKey = "touchline-tactics-save-v1";
const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const simulation = new ClubSimulation();
const prospects = simulation.youthAcademyPlayers;
if (prospects.length !== youthProspects.length) throw new Error(JSON.stringify({ phase: "initial-youth-count", prospects: prospects.length }));

prospects.forEach((player) => {
  const tendency = player.youthSkillTendency;
  if (!tendency || !player.skills?.includes(tendency.primarySkill) || player.skillTrainingTarget !== tendency.developmentSkill || !playerSkillCatalog[tendency.developmentSkill] || !playerSkillGrowthFocus[tendency.developmentSkill].includes(tendency.recommendedFocus) || (player.skillXp?.[tendency.developmentSkill] ?? 0) <= 0) {
    throw new Error(JSON.stringify({ phase: "initial-tendency", player: player.name, tendency, skills: player.skills, target: player.skillTrainingTarget, xp: player.skillXp }));
  }
});

const prospect = prospects[0];
const tendency = prospect.youthSkillTendency;
if (!tendency) throw new Error("initial prospect tendency missing");
const targetId = tendency.developmentSkill;
const primaryTarget = simulation.setYouthSkillTrainingTarget(prospect.id, tendency.primarySkill);
const focusTarget = simulation.setYouthSkillTrainingTarget(prospect.id, targetId);
if (!primaryTarget.ok || !focusTarget.ok || prospect.skillTrainingTarget !== targetId) throw new Error(JSON.stringify({ phase: "target-change", primaryTarget, focusTarget, target: prospect.skillTrainingTarget }));

const xpBeforeSession = prospect.skillXp?.[targetId] ?? 0;
const session = simulation.developYouth();
const xpAfterSession = prospect.skillXp?.[targetId] ?? 0;
if (!session.ok || xpAfterSession !== xpBeforeSession + 12) throw new Error(JSON.stringify({ phase: "academy-xp", session, xpBeforeSession, xpAfterSession }));

prospect.academyWeeks = 2;
const finalSession = simulation.developYouth();
if (!finalSession.ok || prospect.academyWeeks !== 3) throw new Error(JSON.stringify({ phase: "promotion-readiness", finalSession, academyWeeks: prospect.academyWeeks }));
const promotionXp = prospect.skillXp?.[targetId];
const promotion = simulation.promoteYouth(prospect.id);
const promoted = simulation.rosterPlayers.find((player) => player.id === prospect.id);
if (!promotion.ok || !promoted || promoted.youthSkillTendency?.developmentSkill !== targetId || promoted.skillTrainingTarget !== targetId || promoted.skillXp?.[targetId] !== promotionXp || !promoted.skills?.includes(tendency.primarySkill)) {
  throw new Error(JSON.stringify({ phase: "promotion-handoff", promotion, promoted, expected: { targetId, promotionXp, primary: tendency.primarySkill } }));
}

const legacySave = JSON.parse(store.get(storageKey) ?? "{}");
legacySave.youthPlayers = youthIntakes.slice(0, 1).map(({ skillXp: _xp, skillTrainingTarget: _target, youthSkillTendency: _tendency, skills: _skills, ...player }) => ({ ...player, academyWeeks: 1 }));
store.set(storageKey, JSON.stringify(legacySave));
const restored = new ClubSimulation();
const intake = restored.youthAcademyPlayers[0];
const intakeReference = youthIntakes[0];
if (!intake || intake.id !== intakeReference.id || !intake.youthSkillTendency || intake.skillTrainingTarget !== intakeReference.skillTrainingTarget || (intake.skillXp?.[intakeReference.skillTrainingTarget as PlayerSkillId] ?? 0) <= 0 || !intake.skills?.includes(intakeReference.youthSkillTendency!.primarySkill)) {
  throw new Error(JSON.stringify({ phase: "legacy-intake-hydration", intake, intakeReference }));
}

console.log(JSON.stringify({ prospects: prospects.length, archetypes: prospects.map((player) => player.youthSkillTendency?.archetype), youthXp: xpAfterSession - xpBeforeSession, promoted: promoted.name, intake: intake.name, intakeFocus: intake.youthSkillTendency.archetype }));
