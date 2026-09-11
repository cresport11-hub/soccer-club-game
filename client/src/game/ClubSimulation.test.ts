import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClubSimulation } from "./ClubSimulation";
import { commonGivenNamePool, commonSurnamePool, marketRecruits, normalizePlayerName, opponentSeeds, opponentSquadFor, youthIntakes, youthProspects } from "./data";

describe("ClubSimulation match commentary", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("keeps each half dense and includes consecutive attack-counterattack sequences", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    const firstHalf = result.highlights.filter((item) => item.minute <= 45);
    const secondHalf = result.highlights.filter((item) => item.minute > 45 && item.kind !== "fulltime");
    const sequenceLines = result.highlights.filter((item) => /即座に反撃|奪い返してカウンター|一気に前進/.test(item.text));

    expect(firstHalf.length).toBeGreaterThanOrEqual(8);
    expect(firstHalf.length).toBeLessThanOrEqual(12);
    expect(secondHalf.length).toBeGreaterThanOrEqual(8);
    expect(secondHalf.length).toBeLessThanOrEqual(12);
    expect(sequenceLines.length).toBeGreaterThanOrEqual(2);
  });

  it("keeps the live goal count aligned with the halftime and final scores", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    const firstHalfGoals = result.highlights.filter((item) => item.minute <= 45 && item.kind === "goal");
    const secondHalfGoals = result.highlights.filter((item) => item.minute > 45 && item.minute < 90 && item.kind === "goal");
    const orbitGoals = result.highlights.filter((item) => item.kind === "goal" && item.team === "orbit");
    const opponentGoals = result.highlights.filter((item) => item.kind === "goal" && item.team === "opponent");

    expect(firstHalfGoals.length).toBe(result.halfTime.playerGoals + result.halfTime.opponentGoals);
    expect(orbitGoals.length).toBe(result.playerGoals);
    expect(opponentGoals.length).toBe(result.opponentGoals);
    expect(secondHalfGoals.length).toBe(result.playerGoals + result.opponentGoals - firstHalfGoals.length);
  });

  it("switches the market dossier and negotiation target when a candidate is selected", () => {
    const simulation = new ClubSimulation();
    const currentId = simulation.selectedMarketCandidateIdValue;
    const target = simulation.marketCandidateComparison.find((item) => item.player.id !== currentId);
    expect(target).toBeDefined();

    const selection = simulation.selectMarketCandidate(target!.player.id);
    expect(selection.ok).toBe(true);
    expect(simulation.selectedMarketCandidateIdValue).toBe(target!.player.id);
    expect(simulation.currentMarketCandidate?.name).toBe(target!.player.name);
    expect(simulation.currentRecruitNegotiation?.candidateId).toBe(target!.player.id);
    expect(simulation.marketCandidateComparison.find((item) => item.player.id === target!.player.id)?.status).toBe("閲覧中");
    expect(simulation.marketCandidateComparison.find((item) => item.player.id === currentId)?.status).toBe("市場候補");

    const restoredSimulation = new ClubSimulation();
    expect(restoredSimulation.selectedMarketCandidateIdValue).toBe(target!.player.id);
    expect(restoredSimulation.currentMarketTacticalFit?.score).toBe(target!.tacticalFit.score);
  });

  it("persists a renamed club across simulation instances and match reports", () => {
    const firstSimulation = new ClubSimulation();
    const update = firstSimulation.setClubName("  ブライト 札幌  ");
    expect(update.ok).toBe(true);
    expect(firstSimulation.clubNameValue).toBe("ブライト 札幌");

    const restoredSimulation = new ClubSimulation();
    expect(restoredSimulation.clubNameValue).toBe("ブライト 札幌");
    expect(restoredSimulation.leagueRows.find((row) => row.id === "orbit")?.name).toBe("ブライト 札幌");

    const result = restoredSimulation.advanceWeek();
    expect(result.highlights.some((item) => item.kind === "fulltime" && item.text.includes("ブライト 札幌"))).toBe(true);
  });

  it("maps only attack or midfield opponents to defensive markers", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    const markableOpponentPositions = ["CF", "WG", "AM", "SH", "CM", "DM"];
    const defensivePositions = ["CB", "SB", "DM", "CM", "SH"];

    expect(result.markDuels.length).toBeGreaterThan(0);
    expect(result.markDuels.every((duel) => markableOpponentPositions.includes(duel.opponentPosition))).toBe(true);
    expect(result.markDuels.every((duel) => defensivePositions.includes(duel.position))).toBe(true);
    expect(result.markDuels.some((duel) => duel.position === "GK")).toBe(false);
    expect(result.markDuels.some((duel) => ["CB", "SB"].includes(duel.opponentPosition))).toBe(false);
  });

  it("keeps generated and catalog player names readable", () => {
    const givenNames = [...commonGivenNamePool, ...marketRecruits, ...youthProspects, ...youthIntakes].map((item) => typeof item === "string" ? item : item.name.split(/\s+/).slice(1).join(""));
    const catalogNames = [...marketRecruits, ...youthProspects, ...youthIntakes].map((player) => player.name);
    const opponentNames = opponentSeeds.flatMap((club) => opponentSquadFor(club.id).map((player) => player.name));

    expect(commonSurnamePool.length).toBeGreaterThan(90);
    expect(commonGivenNamePool.length).toBeGreaterThan(90);
    expect(givenNames.every((name) => name.replace(/\s/g, "").length >= 2)).toBe(true);
    expect(catalogNames.every((name) => name.split(/\s+/).slice(1).join("").length >= 2)).toBe(true);
    expect(opponentNames.every((name) => name.split(/\s+/).slice(1).join("").length >= 2)).toBe(true);
    expect(normalizePlayerName("篠崎 深", "r2", "篠崎 直人")).toBe("篠崎 直人");
    expect(commonGivenNamePool).not.toContain("美咲");
    expect(normalizePlayerName("高瀬 美咲", "y2", "高瀬 美咲")).not.toBe("高瀬 美咲");
    expect(normalizePlayerName("高瀬 美咲", "y2", "高瀬 美咲").split(/\s+/)[1].length).toBeGreaterThanOrEqual(2);
  });

  it("accumulates individual attribute XP and position mastery through training and matches", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(simulation.lineupState).includes(item.id));
    expect(player).toBeDefined();
    const beforeAttributeXp = player!.attributeXp?.attack ?? 0;
    const beforeMastery = player!.positionMastery?.[player!.position] ?? 0;
    const training = simulation.train("attacking");
    expect(training.ok).toBe(true);
    const afterTraining = simulation.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(afterTraining.attributeXp?.attack ?? 0).toBeGreaterThan(beforeAttributeXp);
    expect(afterTraining.positionMastery?.[afterTraining.position] ?? 0).toBeGreaterThan(beforeMastery);

    const result = simulation.advanceWeek();
    expect(result.attributeXpGrants.length).toBeGreaterThan(0);
    expect(result.positionMasteryGrants.length).toBeGreaterThan(0);
    const restored = new ClubSimulation();
    const restoredPlayer = restored.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(restoredPlayer.attributeXp?.attack).toBe(afterTraining.attributeXp?.attack);
    expect(restoredPlayer.positionMastery?.[afterTraining.position]).toBe(afterTraining.positionMastery?.[afterTraining.position]);
  });

  it("rejects marking a goalkeeper and accepts a defensive marker for an attacker", () => {
    const simulation = new ClubSimulation();
    const opponent = simulation.currentOpponentTactics;
    const starterIds = Object.values(simulation.lineupState).filter((id): id is string => Boolean(id));
    const goalkeeper = opponent.lineup.find((player) => player.position === "GK");
    const attacker = opponent.lineup.find((player) => ["CF", "WG", "AM", "SH"].includes(player.position));
    const defender = starterIds.map((id) => simulation.rosterPlayers.find((player) => player.id === id)).find((player) => player && ["CB", "SB", "DM", "CM", "SH"].includes(player.position));

    expect(goalkeeper).toBeDefined();
    expect(attacker).toBeDefined();
    expect(defender).toBeDefined();
    expect(simulation.setManualMarkAssignment(goalkeeper!.id, defender!.id).ok).toBe(false);
    expect(simulation.setManualMarkAssignment(attacker!.id, defender!.id).ok).toBe(true);
    expect(simulation.currentManualMarkAssignments[attacker!.id]).toBe(defender!.id);
  });
});
