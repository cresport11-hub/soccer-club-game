import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { youthIntakes, youthProspects } from "../client/src/game/data";

const storageKey = "touchline-tactics-save-v1";
const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const simulation = new ClubSimulation();
if (simulation.assignedScout.id !== "scout-forward" || simulation.scoutStaffMembers.length !== 4) throw new Error(JSON.stringify({ phase: "default-deployment", assigned: simulation.assignedScout, count: simulation.scoutStaffMembers.length }));
const defensiveAssignment = simulation.assignScoutStaff("scout-defense");
if (!defensiveAssignment.ok || simulation.scoutDeployment.staff.id !== "scout-defense" || !simulation.scoutDeployment.summary.includes("CB / SB / DM")) throw new Error(JSON.stringify({ phase: "defensive-deployment", defensiveAssignment, deployment: simulation.scoutDeployment }));

const cbIntake = youthIntakes.find((player) => player.position === "CB");
const gkIntake = youthIntakes.find((player) => player.position === "GK");
if (!cbIntake || !gkIntake) throw new Error("required youth intakes unavailable");
const scoutInternals = simulation as unknown as { scoutYouthProspect: (player: typeof cbIntake) => typeof cbIntake; youthPlayers: typeof cbIntake[] };
const defensiveProspect = scoutInternals.scoutYouthProspect(cbIntake);
if (defensiveProspect.youthScoutStaffId !== "scout-defense" || defensiveProspect.youthScoutStaffName !== "相馬 剛" || !defensiveProspect.skills?.includes("interceptor") || defensiveProspect.skillTrainingTarget !== "interceptor" || (defensiveProspect.skillXp?.interceptor ?? 0) < 14 || defensiveProspect.youthScoutStaffSessionXpBonus !== 1 || defensiveProspect.youthSkillTendency?.developmentSkill !== "interceptor") {
  throw new Error(JSON.stringify({ phase: "defensive-prospect", defensiveProspect }));
}
const unmatchedKeeper = scoutInternals.scoutYouthProspect(gkIntake);
if (unmatchedKeeper.youthScoutStaffId || unmatchedKeeper.youthScoutStaffEntryXpBonus || unmatchedKeeper.youthScoutStaffSessionXpBonus) throw new Error(JSON.stringify({ phase: "position-filter", unmatchedKeeper }));

scoutInternals.youthPlayers = [defensiveProspect];
const xpBefore = defensiveProspect.skillXp?.interceptor ?? 0;
const youthSession = simulation.developYouth();
const xpAfter = defensiveProspect.skillXp?.interceptor ?? 0;
const paceBonus = defensiveProspect.youthSkillTendency?.growthPace === "早熟" ? 2 : defensiveProspect.youthSkillTendency?.growthPace === "標準" ? 1 : 0;
const expectedGrant = 10 + paceBonus + (defensiveProspect.youthScoutXpBonus ?? 0) + 1;
if (!youthSession.ok || xpAfter !== xpBefore + expectedGrant) throw new Error(JSON.stringify({ phase: "staff-session-xp", youthSession, xpBefore, xpAfter, expectedGrant }));

const persisted = JSON.parse(store.get(storageKey) ?? "{}");
if (persisted.assignedScoutId !== "scout-defense") throw new Error(JSON.stringify({ phase: "persist-assignment", persisted: persisted.assignedScoutId }));
const reloaded = new ClubSimulation();
if (reloaded.assignedScout.id !== "scout-defense") throw new Error(JSON.stringify({ phase: "reload-assignment", assigned: reloaded.assignedScout }));
const midfielderAssignment = reloaded.assignScoutStaff("scout-midfield");
const cmProspect = youthProspects.find((player) => player.position === "CM");
if (!cmProspect) throw new Error("required midfield youth prospect unavailable");
const midfieldProspect = (reloaded as unknown as { scoutYouthProspect: (player: typeof cmProspect) => typeof cmProspect }).scoutYouthProspect(cmProspect);
if (!midfielderAssignment.ok || midfieldProspect.youthScoutStaffId !== "scout-midfield" || !midfieldProspect.skills?.includes("vision") || midfieldProspect.skillTrainingTarget !== "vision") throw new Error(JSON.stringify({ phase: "midfield-prospect", midfielderAssignment, midfieldProspect }));

console.log(JSON.stringify({ assigned: simulation.assignedScout.name, defensive: { player: defensiveProspect.name, skill: "interceptor", xpGain: xpAfter - xpBefore }, unmatched: unmatchedKeeper.name, reloaded: reloaded.assignedScout.name, midfield: { player: midfieldProspect.name, skill: "vision" } }));
