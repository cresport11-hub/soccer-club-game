import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClubSimulation } from "./ClubSimulation";
import { commonGivenNamePool, commonSurnamePool, marketRecruits, normalizePlayerName, opponentSeeds, opponentSquadFor, playerAssessmentFor, youthIntakes, youthProspects } from "./data";

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
    expect(firstHalf.length).toBeLessThanOrEqual(16);
    expect(secondHalf.length).toBeGreaterThanOrEqual(8);
    expect(secondHalf.length).toBeLessThanOrEqual(16);
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

  it("generates ability-based scouting assessments for selected market candidates", () => {
    const attacking = { ...marketRecruits[0], attack: 82, dribble: 78, pass: 50, shoot: 86, defense: 28, tackle: 24, block: 22, interception: 20 };
    const defending = { ...marketRecruits[0], attack: 30, dribble: 34, pass: 48, shoot: 22, defense: 84, tackle: 82, block: 86, interception: 80 };
    const attackingAssessment = playerAssessmentFor(attacking);
    const defendingAssessment = playerAssessmentFor(defending);
    expect(attackingAssessment).not.toBe(defendingAssessment);
    expect(attackingAssessment.length).toBeGreaterThan(20);
    expect(defendingAssessment.length).toBeGreaterThan(20);
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
    expect(givenNames.every((name) => name.replace(/\s/g, "").length >= 1)).toBe(true);
    expect(catalogNames.every((name) => name.split(/\s+/).slice(1).join("").length >= 2)).toBe(true);
    expect(opponentNames.every((name) => name.split(/\s+/).slice(1).join("").length >= 1)).toBe(true);
    expect(normalizePlayerName("篠崎 深", "r2", "篠崎 直人")).toBe("篠崎 深");
    expect(normalizePlayerName("高瀬 蓮", "r-single")).toBe("高瀬 蓮");
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

  it("tracks match-day condition separately from fatigue and persists its changes", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(simulation.lineupState).includes(item.id));
    expect(player).toBeDefined();
    const beforeCondition = simulation.conditionFor(player!);
    const beforeFatigue = player!.fatigue;
    expect(simulation.conditionStatusFor(player!).label).toBe("標準");

    simulation.setTrainingLoad(player!.id, "recovery");
    const beforeXp = player!.attributeXp?.pass ?? 0;
    const training = simulation.train("passing", player!.id);
    expect(training.ok).toBe(true);
    const afterTraining = simulation.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(simulation.conditionFor(afterTraining)).toBe(beforeCondition);
    expect(afterTraining.attributeXp?.pass ?? 0).toBe(beforeXp);
    expect(afterTraining.fatigue).toBeLessThan(beforeFatigue);

    const result = simulation.advanceWeek();
    expect(result.conditionChanges.length).toBeGreaterThan(0);
    const restored = new ClubSimulation();
    expect(restored.conditionFor(restored.rosterPlayers.find((item) => item.id === player!.id)!)).toBe(simulation.conditionFor(afterTraining));
  });

  it("reports and persists both training fatigue load and recovery", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(simulation.lineupState).includes(item.id));
    expect(player).toBeDefined();
    const beforeLoad = player!.fatigue;
    const loadResult = simulation.train("attacking");
    expect(loadResult.ok).toBe(true);
    expect(loadResult.text).toMatch(/疲労 \+/);
    const afterLoad = player!.fatigue;
    expect(afterLoad).toBeGreaterThan(beforeLoad);

    localStorage.clear();
    const recoverySimulation = new ClubSimulation();
    const recoveryPlayer = recoverySimulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(recoverySimulation.lineupState).includes(item.id));
    expect(recoveryPlayer).toBeDefined();
    recoveryPlayer!.fatigue = Math.max(40, recoveryPlayer!.fatigue);
    const beforeRecovery = recoveryPlayer!.fatigue;
    recoverySimulation.setTrainingLoad(recoveryPlayer!.id, "recovery");
    const recoveryResult = recoverySimulation.train("passing", recoveryPlayer!.id);
    expect(recoveryResult.ok).toBe(true);
    expect(recoveryResult.text).toMatch(/疲労 -/);
    expect(recoveryPlayer!.fatigue).toBeLessThan(beforeRecovery);
    const restored = new ClubSimulation();
    expect(restored.rosterPlayers.find((item) => item.id === recoveryPlayer!.id)?.fatigue).toBe(recoveryPlayer!.fatigue);
  });

  it("persists individual development plans and runs them before the next match", () => {
    localStorage.clear();
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(simulation.lineupState).includes(item.id));
    expect(player).toBeDefined();
    const setFocus = simulation.setTrainingFocus(player!.id, "passing");
    expect(setFocus.ok).toBe(true);
    simulation.setTrainingLoad(player!.id, "recovery");
    expect(simulation.trainingFocusFor(player!)).toBe("passing");
    player!.fatigue = 40;
    const before = player!.fatigue;
    const result = simulation.advanceWeek();
    expect(result).toBeDefined();
    expect(player!.fatigue).toBeLessThan(before);
    const restored = new ClubSimulation();
    const restoredPlayer = restored.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(restored.trainingFocusFor(restoredPlayer)).toBe("passing");
  });

  it("includes player condition in team readiness and attack strength", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(simulation.lineupState).includes(item.id));
    expect(player).toBeDefined();
    player!.condition = 20;
    const lowConditionScore = simulation.score();
    player!.condition = 90;
    const highConditionScore = simulation.score();
    expect(highConditionScore.attack).toBeGreaterThan(lowConditionScore.attack);
    expect(highConditionScore.readiness).toBeGreaterThan(lowConditionScore.readiness);
  });

  it("rejects marking a goalkeeper and accepts a defensive marker for an attacker", () => {
    const simulation = new ClubSimulation();
    const opponent = simulation.currentOpponentTactics;
    const starterIds = Object.values(simulation.lineupState).filter((id): id is string => Boolean(id));
    const goalkeeper = opponent.lineup.find((player) => player.position === "GK");
    const attacker = opponent.lineup.find((player) => ["CF", "WG", "AM", "SH"].includes(player.position));
    const secondAttacker = opponent.lineup.find((player) => ["CF", "WG", "AM", "SH"].includes(player.position) && player.id !== attacker?.id);
    const defender = starterIds.map((id) => simulation.rosterPlayers.find((player) => player.id === id)).find((player) => player && ["CB", "SB", "DM", "CM", "SH"].includes(player.position));

    expect(goalkeeper).toBeDefined();
    expect(attacker).toBeDefined();
    expect(defender).toBeDefined();
    expect(simulation.setManualMarkAssignment(goalkeeper!.id, defender!.id).ok).toBe(false);
    expect(simulation.setManualMarkAssignment(attacker!.id, defender!.id).ok).toBe(true);
    expect(simulation.currentManualMarkAssignments[attacker!.id]).toBe(defender!.id);
    if (secondAttacker) {
      expect(simulation.setManualMarkAssignment(secondAttacker.id, defender!.id).ok).toBe(true);
      expect(simulation.currentManualMarkAssignments[attacker!.id]).toBeUndefined();
      expect(simulation.currentManualMarkAssignments[secondAttacker.id]).toBe(defender!.id);
    }
  });

  it("keeps match marking one-to-one and reports zone coverage for surplus attackers", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    const assignedDefenders = result.markDuels.map((duel) => duel.playerId);
    const markedOpponents = result.markDuels.map((duel) => duel.opponent);

    expect(new Set(assignedDefenders).size).toBe(assignedDefenders.length);
    expect(new Set(markedOpponents).size).toBe(markedOpponents.length);
    expect(result.markingImpact.summary).toMatch(/一対一/);
    expect(result.markingImpact.summary).toMatch(/ゾーン/);
  });

  it("keeps hidden attribute ceilings above current ability and blocks growth beyond them", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK");
    expect(player).toBeDefined();
    const current = player!.attack;
    player!.attributeCeilings = { ...(player!.attributeCeilings ?? {}), attack: current };
    player!.attributeXp = { ...(player!.attributeXp ?? {}), attack: 99 };
    const training = simulation.train("attacking");
    expect(training.ok).toBe(true);
    const afterTraining = simulation.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(afterTraining.attack).toBe(current);
    expect(afterTraining.attributeCeilings?.attack).toBe(current);

    const candidate = simulation.marketCandidateComparison[0]?.player;
    expect(candidate).toBeDefined();
    expect(Object.values(candidate!.attributeCeilings ?? {}).every((ceiling) => typeof ceiling === "number" && ceiling >= 0 && ceiling <= 99)).toBe(true);

    const restored = new ClubSimulation();
    const restoredPlayer = restored.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(restoredPlayer.attributeCeilings?.attack).toBe(current);
  });

  it("differentiates player output through system understanding and formation mastery", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers[0];
    const current = simulation.systemEffectivenessFor(player);
    const systems = simulation.systemMasterySummaryFor(player);

    expect(current.understanding).toBeGreaterThanOrEqual(1);
    expect(current.understanding).toBeLessThanOrEqual(99);
    expect(current.mastery).toBeGreaterThanOrEqual(0);
    expect(current.rate).toBeGreaterThanOrEqual(70);
    expect(current.rate).toBeLessThanOrEqual(104);
    expect(systems.length).toBeGreaterThanOrEqual(8);
    expect(new Set(systems.map((item) => item.mastery)).size).toBeGreaterThan(1);
    expect(simulation.score().systemRate).toBeGreaterThanOrEqual(70);
  });

  it("grows and persists current-system mastery through training and match experience", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers.find((item) => item.position !== "GK" && Object.values(simulation.lineupState).includes(item.id));
    expect(player).toBeDefined();
    const formationId = simulation.formation.id;
    const masteryBefore = simulation.systemMasteryFor(player!, formationId);
    const understandingXpBefore = player!.systemUnderstandingXp ?? 0;

    const training = simulation.train("passing");
    expect(training.ok).toBe(true);
    expect(simulation.systemMasteryFor(player!, formationId)).toBeGreaterThan(masteryBefore);
    expect(player!.systemUnderstandingXp ?? 0).toBeGreaterThan(understandingXpBefore);

    const result = simulation.advanceWeek();
    expect(result.systemMasteryGrants.length).toBeGreaterThan(0);
    expect(result.systemMasteryGrants.every((grant) => grant.formationId === formationId)).toBe(true);

    const masteryAfter = simulation.systemMasteryFor(player!, formationId);
    const restored = new ClubSimulation();
    const restoredPlayer = restored.rosterPlayers.find((item) => item.id === player!.id)!;
    expect(restored.systemMasteryFor(restoredPlayer, formationId)).toBe(masteryAfter);
    expect(restoredPlayer.systemUnderstandingXp).toBe(player!.systemUnderstandingXp);
  });
});


describe("Match statistics", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("creates coherent full-time statistics for both teams", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    const { orbit, opponent } = result.stats;

    expect(orbit.possession + opponent.possession).toBe(100);
    expect(orbit.shots).toBeGreaterThanOrEqual(orbit.shotsOnTarget);
    expect(opponent.shots).toBeGreaterThanOrEqual(opponent.shotsOnTarget);
    expect(orbit.passAccuracy).toBeGreaterThanOrEqual(0);
    expect(opponent.passAccuracy).toBeGreaterThanOrEqual(0);
    expect(orbit.saves).toBeGreaterThanOrEqual(0);
    expect(opponent.saves).toBeGreaterThanOrEqual(0);
  });

  it("reports ratings for every player who appeared", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    expect(result.playerRatings).toHaveLength(11);
    expect(result.playerRatings.every((rating) => rating.playerId && rating.note.length > 0)).toBe(true);
  });

  it("assigns a deterministic referee strictness profile to each match", () => {
    const simulation = new ClubSimulation();
    const result = simulation.advanceWeek();
    expect(result.refereeStrictness).toBeGreaterThanOrEqual(.78);
    expect(result.refereeStrictness).toBeLessThanOrEqual(1.28);
    expect(["寛容", "標準", "厳格"]).toContain(result.refereeLabel);
  });
});


describe("Team power radar", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("builds six bounded axes and reacts to squad condition", () => {
    const simulation = new ClubSimulation();
    simulation.autoLineup();
    const radar = simulation.teamPowerRadar();
    const keys = ["attack", "defense", "midfield", "chemistry", "tacticalAdaptation", "transition"] as const;
    keys.forEach((key) => {
      expect(radar[key]).toBeGreaterThanOrEqual(0);
      expect(radar[key]).toBeLessThanOrEqual(99);
    });
    expect(radar.overall).toBeGreaterThanOrEqual(0);
    expect(radar.overall).toBeLessThanOrEqual(99);
    expect(keys).toContain(radar.strengthKey);
    expect(keys).toContain(radar.weaknessKey);

    const beforeTransition = radar.transition;
    simulation.rosterPlayers.filter((player) => Object.values(simulation.lineupState).includes(player.id)).forEach((player) => {
      player.fatigue = 90;
      player.condition = 35;
    });
    expect(simulation.teamPowerRadar().transition).toBeLessThan(beforeTransition);
  });

  it("reflects unit thickness when comparing 4-3-3 and 3-6-1", () => {
    const simulation = new ClubSimulation();
    simulation.setFormation("4-3-3");
    simulation.autoLineup();
    const before = new Set(Object.values(simulation.lineupState).filter(Boolean));
    const fourThreeThree = simulation.teamPowerRadar();
    simulation.setFormation("3-6-1");
    expect(Object.values(simulation.lineupState).filter(Boolean).length).toBeGreaterThan(0);
    expect([...before].filter((playerId) => Object.values(simulation.lineupState).includes(playerId)).length).toBeGreaterThanOrEqual(8);
    simulation.autoLineup();
    const threeSixOne = simulation.teamPowerRadar();

    expect(threeSixOne.midfield).toBeGreaterThan(fourThreeThree.midfield);
    expect(threeSixOne.attack).toBeLessThan(fourThreeThree.attack);
  });

  it("preserves the starting eleven when switching formations", () => {
    const simulation = new ClubSimulation();
    simulation.autoLineup();
    const before = new Set(Object.values(simulation.lineupState).filter(Boolean));
    simulation.setFormation("4-5-1");
    const after = Object.values(simulation.lineupState).filter(Boolean);
    expect(after).toHaveLength(11);
    expect(after.every((playerId) => before.has(playerId))).toBe(true);
    expect(new Set(after).size).toBe(after.length);
  });

  it("switches and persists auto lineup evaluation criteria", () => {
    const simulation = new ClubSimulation();
    expect(simulation.autoLineupCriteriaValue).toBe("fit");
    simulation.setAutoLineupCriteria("attack");
    simulation.autoLineup();
    expect(simulation.autoLineupCriteriaValue).toBe("attack");
    simulation.setAutoLineupCriteria("defense");
    simulation.autoLineup();
    expect(simulation.autoLineupCriteriaValue).toBe("defense");
    expect(new ClubSimulation().autoLineupCriteriaValue).toBe("defense");
  });
  it("supports four alternate midfield structures for 4-4-2", () => {
    const simulation = new ClubSimulation();
    const variants = [
      ["4-4-2-double-pivot", ["DM", "DM"]],
      ["4-4-2-attacking-wide", ["DM", "AM"]],
      ["4-4-2-central", ["CM", "CM", "CM", "CM"]],
      ["4-4-2-diamond", ["DM", "CM", "CM", "AM"]],
    ] as const;
    variants.forEach(([formationId, midfield]) => {
      simulation.setFormation(formationId);
      expect(simulation.formation.label).toBe("4-4-2");
      expect(simulation.formation.slots.filter((slot) => ["DM", "CM", "AM", "SH"].includes(slot.label)).map((slot) => slot.label)).toEqual(expect.arrayContaining(midfield));
    });
  });
  it("supports midfield structure presets for every base formation", () => {
    const simulation = new ClubSimulation();
    const structures = [["4-3-3", "double-pivot"], ["4-5-1", "wide"], ["3-4-3", "double-pivot"], ["3-5-2", "flat"], ["3-6-1", "double-pivot"], ["5-4-1", "double-pivot"], ["5-3-2", "flat"]] as const;
    structures.forEach(([baseId, suffix]) => {
      simulation.setFormation(baseId);
      expect(simulation.formation.id).toBe(baseId);
      simulation.setFormation(`${baseId}-${suffix}`);
      expect(simulation.formation.label).toBe(baseId);
      expect(simulation.formation.slots.some((slot) => ["DM", "CM", "AM", "SH"].includes(slot.label))).toBe(true);
      expect(simulation.score().tactics.formationTrait.length).toBeGreaterThan(0);
    });
  });
  it("keeps the diamond OH and DH on the central vertical axis", () => {
    const simulation = new ClubSimulation();
    simulation.setFormation("4-4-2-diamond");
    const oh = simulation.formation.slots.find((slot) => slot.id === "oh");
    const dh = simulation.formation.slots.find((slot) => slot.id === "dm");
    expect(oh?.x).toBe(50);
    expect(dh?.x).toBe(50);
    expect(dh?.y).toBeGreaterThan(oh?.y ?? 0);
  });
  it("applies distinct midfield structure bonuses to radar and match tactics", () => {
    const simulation = new ClubSimulation();
    const read = (formationId: string) => {
      simulation.setFormation(formationId);
      simulation.autoLineup();
      const radar = simulation.teamPowerRadar();
      const tactics = simulation.score().tactics;
      return { radar, tactics };
    };
    const pivot = read("4-4-2-double-pivot");
    const wide = read("4-4-2-attacking-wide");
    const central = read("4-4-2-central");
    const diamond = read("4-4-2-diamond");
    expect(pivot.tactics.structureDefense).toBe(4);
    expect(pivot.tactics.structureMidfield).toBe(3);
    expect(wide.tactics.structureAttack).toBe(4);
    expect(central.tactics.structureMidfield).toBe(5);
    expect(diamond.tactics.structureTransition).toBe(3);
    expect(central.radar.midfield).toBeGreaterThan(pivot.radar.midfield);
    expect(wide.radar.attack).toBeGreaterThan(pivot.radar.attack);
  });
});


describe("Youth academy sessions", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("allows one youth development session per week and unlocks it next week", () => {
    const simulation = new ClubSimulation();
    const first = simulation.developYouth();
    expect(first.ok).toBe(true);
    expect(simulation.youthTrainingUsedThisWeek).toBe(true);

    const duplicate = simulation.developYouth();
    expect(duplicate.ok).toBe(false);
    expect(duplicate.text).toContain("今週のユース育成セッションは実施済み");

    simulation.advanceWeek();
    expect(simulation.youthTrainingUsedThisWeek).toBe(false);
    expect(simulation.developYouth().ok).toBe(true);
  });
});

describe("Transfer market refresh", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("refreshes sale offers with the scouting market every three weeks", () => {
    const simulation = new ClubSimulation();
    expect(simulation.activeSaleOffers).toHaveLength(0);

    simulation.advanceWeek();
    expect(simulation.marketUpdateNotice).toBeNull();
    simulation.advanceWeek();
    expect(simulation.marketUpdateNotice).toBeNull();

    simulation.advanceWeek();
    const notice = simulation.marketUpdateNotice;
    expect(notice).not.toBeNull();
    expect(simulation.activeSaleOffers.length).toBeLessThanOrEqual(1);
    expect(notice?.saleOffers?.length ?? 0).toBeLessThanOrEqual(1);
    expect(notice?.saleOfferIds ?? []).toEqual((notice?.saleOffers ?? []).map((offer) => offer.id));
  });
});

describe("Recruit negotiation choices", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("offers low, fair, and high amounts and exposes hold conditions", () => {
    const lowSimulation = new ClubSimulation();
    const low = lowSimulation.negotiateRecruit("low");
    expect(lowSimulation.currentRecruitNegotiation?.offerTier).toBe("low");
    expect(["pending", "agreed", "failed"]).toContain(lowSimulation.currentRecruitNegotiation?.stage);
    expect(low.text).toBeTruthy();

    localStorage.clear();
    const highSimulation = new ClubSimulation();
    const high = highSimulation.negotiateRecruit("high");
    expect(highSimulation.currentRecruitNegotiation?.offerTier).toBe("high");
    expect(["pending", "agreed", "failed"]).toContain(highSimulation.currentRecruitNegotiation?.stage);
    if (highSimulation.currentRecruitNegotiation?.stage === "pending") {
      expect(highSimulation.currentRecruitNegotiation.holdReason).toBeTruthy();
      expect(highSimulation.acceptRecruitHold().ok).toBe(true);
    }
  });
});
