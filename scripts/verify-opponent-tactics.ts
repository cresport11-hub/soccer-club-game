import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { formations, opponentSeeds, opponentSquadFor, opponentTactics } from "../client/src/game/data";

const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

for (const club of opponentSeeds) {
  const plan = opponentTactics[club.id];
  const squad = opponentSquadFor(club.id);
  if (!plan || !formations.some((formation) => formation.id === plan.formationId) || squad.length !== 11 || squad.some((player) => !player.role)) {
    throw new Error(JSON.stringify({ phase: "opponent-data", club: club.id, plan, squadSize: squad.length }));
  }
}

const allOpponentPlayers = opponentSeeds.flatMap((club) => opponentSquadFor(club.id));
const uniqueOpponentNames = new Set(allOpponentPlayers.map((player) => player.name));
const uniqueSurnames = new Set(allOpponentPlayers.map((player) => player.name.split(" ")[0]));
const uniqueGivenNames = new Set(allOpponentPlayers.map((player) => player.name.split(" ")[1]));
if (uniqueOpponentNames.size !== allOpponentPlayers.length || uniqueSurnames.size < 64 || uniqueGivenNames.size < 60 || allOpponentPlayers.some((player) => player.name.split(" ").length !== 2)) {
  throw new Error(JSON.stringify({ phase: "opponent-name-variety", players: allOpponentPlayers.length, uniqueNames: uniqueOpponentNames.size, uniqueSurnames: uniqueSurnames.size, uniqueGivenNames: uniqueGivenNames.size }));
}

const simulation = new ClubSimulation();
simulation.setFormation("3-6-1");
simulation.setPlayingStyle("press");
const opponent = simulation.currentOpponentTactics;
const matchup = simulation.currentTacticalMatchup;
if (opponent.clubId !== "aurora" || opponent.formationLabel !== "4-3-3" || opponent.playingStyle !== "possession" || opponent.lineup.length !== 11 || matchup.label !== "中央封鎖" || matchup.playerDefenseModifier < 3 || matchup.opponentAttackModifier > -2) {
  throw new Error(JSON.stringify({ phase: "matchup", opponent, matchup }));
}

const result = simulation.advanceWeek();
if (result.opponentTactics.clubId !== "aurora" || result.opponentTactics.roles.length < 3 || result.tacticalMatchup.label !== "中央封鎖" || result.matchDefense < simulation.score().defense || !result.highlights.some((item) => item.minute === 22 && item.text.includes("可変ポゼッション")) || !result.highlights.some((item) => item.minute === 1 && item.text.includes("vs"))) {
  throw new Error(JSON.stringify({ phase: "match-result", opponent: result.opponentTactics, matchup: result.tacticalMatchup, highlights: result.highlights }));
}

const nextOpponent = simulation.currentOpponentTactics;
if (nextOpponent.clubId !== "volta" || nextOpponent.formationLabel !== "4-5-1" || nextOpponent.playingStyle !== "possession") {
  throw new Error(JSON.stringify({ phase: "rotation", nextOpponent }));
}

console.log(JSON.stringify({ clubs: opponentSeeds.length, uniqueOpponentNames: uniqueOpponentNames.size, uniqueSurnames: uniqueSurnames.size, uniqueGivenNames: uniqueGivenNames.size, firstOpponent: `${opponent.club} ${opponent.formationLabel} ${opponent.playingStyleLabel}`, matchup: matchup.label, resultTactics: `${result.opponentTactics.trait} / ${result.tacticalMatchup.label}`, nextOpponent: nextOpponent.club }));
