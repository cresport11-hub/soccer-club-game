import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { playerSkillCatalog, type Player, type PlayerSkillDefinition } from "../client/src/game/data";

const storageKey = "touchline-tactics-save-v1";
const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const simulation = new ClubSimulation();
const roster = simulation.rosterPlayers;
if (roster.length !== 20 || roster.some((player) => !player.skills?.length || player.skills.some((skill) => !playerSkillCatalog[skill]))) {
  throw new Error(JSON.stringify({ phase: "opening-roster", roster: roster.map((player) => ({ id: player.id, skills: player.skills })) }));
}

simulation.setPlayingStyle("possession");
simulation.autoLineup();
const possession = simulation.score().tactics;
if (!possession.skillDetails.length || !possession.skillDetails.some((skill) => skill.active) || possession.skillAttack < 0 || possession.skillDefense < 0 || possession.attackModifier < possession.skillAttack || possession.defenseModifier < possession.skillDefense) {
  throw new Error(JSON.stringify({ phase: "player-skill-assessment", tactics: possession }));
}

type StyleCase = { player: Player; definition: PlayerSkillDefinition; matchingStyle: "possession" | "direct" | "press"; standbyStyle: "possession" | "direct" | "press" };
const linkPlayer = roster.find((player) => player.skills?.includes("linkman"));
const linkDefinition = playerSkillCatalog.linkman;
const linkSlot = simulation.formation.slots.find((slot) => slot.allowed.includes("CF"));
if (!linkPlayer || !linkSlot) throw new Error(JSON.stringify({ phase: "style-case-discovery", formation: simulation.formation, roster: roster.map((player) => ({ name: player.name, skills: player.skills })) }));
linkPlayer.pass = 99;
Object.entries(simulation.lineupState).forEach(([slotId, playerId]) => { if (playerId === linkPlayer.id) simulation.lineupState[slotId] = null; });
simulation.lineupState[linkSlot.id] = linkPlayer.id;
simulation.setPlayingStyle("possession");
const styleCase: StyleCase = { player: linkPlayer, definition: linkDefinition, matchingStyle: "possession", standbyStyle: "direct" };
if (!simulation.playerSkillStatus(styleCase.player).some((skill) => skill.skillId === styleCase.definition.id && skill.active)) {
  throw new Error(JSON.stringify({ phase: "style-activation", styleCase, status: simulation.playerSkillStatus(styleCase.player), lineup: simulation.lineupState }));
}
simulation.setPlayingStyle(styleCase.standbyStyle);
const standby = simulation.playerSkillStatus(styleCase.player).find((skill) => skill.skillId === styleCase.definition.id);
if (!standby || standby.active || standby.attackBoost || standby.defenseBoost || !standby.reason.includes("ポゼッションで発動")) {
  throw new Error(JSON.stringify({ phase: "style-standby", styleCase, standby }));
}

simulation.setPlayingStyle(styleCase.matchingStyle);
const opponent = simulation.currentOpponentTactics;
if (opponent.lineup.length !== 11 || opponent.lineup.some((player) => !player.skills.length || player.skills.some((skill) => !playerSkillCatalog[skill])) || opponent.skillDetails.length !== 11 || opponent.skillAttack < 0 || opponent.skillDefense < 0) {
  throw new Error(JSON.stringify({ phase: "opponent-skills", opponent }));
}

const result = simulation.advanceWeek();
if (!result.highlights.some((item) => item.minute === 33 && item.text.includes("スキル連動")) || result.tactics.skillDetails.length < 1 || result.opponentTactics.skillDetails.length !== 11 || !result.halfTime.tacticalNote.includes("スキル連動")) {
  throw new Error(JSON.stringify({ phase: "match-flow", highlights: result.highlights, tactics: result.tactics, opponent: result.opponentTactics, halfTime: result.halfTime }));
}

const replan = simulation.applyHalfTimePlan("attacking", "direct", []);
const replannedResult = simulation.lastResult;
if (!replan.ok || !replannedResult || replannedResult.tactics.playingStyle !== "direct" || !replannedResult.tactics.skillDetails.length || !replannedResult.halfTime.tacticalNote.includes("スキル連動")) {
  throw new Error(JSON.stringify({ phase: "half-time-recalculation", replan, result: replannedResult }));
}

const restored = new ClubSimulation();
if (restored.rosterPlayers.some((player) => !player.skills?.length)) {
  throw new Error(JSON.stringify({ phase: "save-restore", roster: restored.rosterPlayers.map((player) => ({ id: player.id, skills: player.skills })) }));
}

const legacySave = JSON.parse(store.get(storageKey) ?? "{}");
legacySave.players = Array.isArray(legacySave.players) ? legacySave.players.map(({ skills: _skills, ...player }: Player) => player) : [];
store.set(storageKey, JSON.stringify(legacySave));
const legacyRestored = new ClubSimulation();
if (legacyRestored.rosterPlayers.some((player) => !player.skills?.length || player.skills.some((skill) => !playerSkillCatalog[skill]))) {
  throw new Error(JSON.stringify({ phase: "legacy-save-fallback", roster: legacyRestored.rosterPlayers.map((player) => ({ id: player.id, skills: player.skills })) }));
}

console.log(JSON.stringify({ activeSkills: possession.skillDetails.filter((skill) => skill.active).length, playerSkillEffect: { attack: possession.skillAttack, defense: possession.skillDefense }, opponentSkillEffect: { attack: opponent.skillAttack, defense: opponent.skillDefense }, styleCase: { player: styleCase.player.name, skill: styleCase.definition.label, matchingStyle: styleCase.matchingStyle, standbyStyle: styleCase.standbyStyle }, score: `${result.playerGoals}-${result.opponentGoals}`, legacyPlayers: legacyRestored.rosterPlayers.length }));
