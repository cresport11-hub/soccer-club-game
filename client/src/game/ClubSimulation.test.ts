import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClubSimulation, sponsorOffers, wbPlayStyleOptions } from "./ClubSimulation";
import { commonGivenNamePool, commonSurnamePool, defaultGrowthProfileFor, defaultPlayerSideFor, defaultSecondarySideFor, formations, growthCurveModifierFor, marketRecruits, nationalityNameFor, nationalityPositionBoostFor, nationalityProfiles, normalizePlayerName, opponentSeeds, opponentSquadFor, playerAssessmentFor, players, youthIntakes, youthProspects } from "./data";

const advanceWeekForTest = (simulation: ClubSimulation) => {
  while (simulation.isBreakWeek) simulation.advanceBreakWeek("training-camp");
  return simulation.advanceWeek();
};

describe("Player side foundation", () => {
  it("provides dedicated WB play styles and applies the selected style", () => {
    expect(wbPlayStyleOptions).toHaveLength(3);
    expect(wbPlayStyleOptions.map((option) => option.label)).toEqual(["攻撃型ウイングバック", "内側可変ウイングバック", "守備安定型ウイングバック"]);
    const simulation = new ClubSimulation();
    const wingBack = simulation.rosterPlayers[0];
    wingBack.secondary = "WB";
    expect(simulation.wbPlayStyleFor(wingBack!)).toBeDefined();
    const result = simulation.setWbPlayStyle(wingBack!.id, "underlapping-wingback");
    expect(result.ok).toBe(true);
    expect(simulation.wbPlayStyleFor(wingBack!)?.id).toBe("underlapping-wingback");
  });

  it("assigns deterministic left/right adaptation sides without changing central roles", () => {
    expect(defaultPlayerSideFor({ id: "sb-demo", position: "SB" })).toBe(defaultPlayerSideFor({ id: "sb-demo", position: "SB" }));
    expect(["left", "right"]).toContain(defaultPlayerSideFor({ id: "sb-demo", position: "SB" }));
    expect(defaultPlayerSideFor({ id: "cf-demo", position: "CF" })).toBe("center");
    expect(defaultSecondarySideFor({ id: "wg-demo", position: "WG", secondary: "CF" })).toBe("center");
  });

  it("gives a wide secondary position the opposite side by default", () => {
    const primary = defaultPlayerSideFor({ id: "sb-demo", position: "SB" });
    const secondary = defaultSecondarySideFor({ id: "sb-demo", position: "SB", secondary: "SH" });
    expect(secondary).toBe(primary === "left" ? "right" : "left");
  });

  it("defines a left, center, or right side on every formation slot", () => {
    for (const formation of formations) {
      expect(formation.slots.every((slot) => ["left", "center", "right"].includes(slot.side))).toBe(true);
      expect(formation.slots.find((slot) => slot.id === "gk")?.side).toBe("center");
    }
    const fourFourTwo = formations.find((formation) => formation.id === "4-4-2");
    expect(fourFourTwo?.slots.find((slot) => slot.id === "lb")?.side).toBe("left");
    expect(fourFourTwo?.slots.find((slot) => slot.id === "rb")?.side).toBe("right");
    expect(fourFourTwo?.slots.find((slot) => slot.id === "lst")?.side).toBe("left");
    expect(fourFourTwo?.slots.find((slot) => slot.id === "rst")?.side).toBe("right");
  });

  it("defines distinct WB commentary for each play style", () => {
    expect(wbPlayStyleOptions.find((option) => option.id === "attacking-wingback")?.finishCopy).toContain("大外");
    expect(wbPlayStyleOptions.find((option) => option.id === "underlapping-wingback")?.finishCopy).toContain("内側");
    expect(wbPlayStyleOptions.find((option) => option.id === "defensive-wingback")?.finishCopy).toContain("帰陣");
  });

  it("supports WB as a distinct wing-back position", () => {
    expect(marketRecruits.some((player) => player.position === "WB" || player.secondary === "WB")).toBe(true);
    const wideSlot = formations.find((formation) => formation.id === "3-5-2")?.slots.find((slot) => slot.id === "lwb");
    expect(wideSlot?.allowed).toContain("WB");
    expect(formations.find((formation) => formation.id === "5-4-1")?.slots.find((slot) => slot.id === "rwb")?.allowed).toContain("WB");
  });
});

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
    const result = advanceWeekForTest(simulation);
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
    const result = advanceWeekForTest(simulation);
    const firstHalfGoals = result.highlights.filter((item) => item.minute <= 45 && item.kind === "goal");
    const secondHalfGoals = result.highlights.filter((item) => item.minute > 45 && item.minute < 90 && item.kind === "goal");
    const orbitGoals = result.highlights.filter((item) => item.kind === "goal" && item.team === "orbit");
    const opponentGoals = result.highlights.filter((item) => item.kind === "goal" && item.team === "opponent");

    expect(firstHalfGoals.length).toBe(result.halfTime.playerGoals + result.halfTime.opponentGoals);
    expect(orbitGoals.length).toBe(result.playerGoals);
    expect(opponentGoals.length).toBe(result.opponentGoals);
    expect(secondHalfGoals.length).toBe(result.playerGoals + result.opponentGoals - firstHalfGoals.length);
  });

  it("can finish a rally with a goal", () => {
    const simulation = new ClubSimulation();
    const rallyGoalTexts: string[] = [];
    for (let week = 0; week < 12; week += 1) {
      const result = advanceWeekForTest(simulation);
      rallyGoalTexts.push(...result.highlights.filter((item) => item.kind === "goal" && /ラリー/.test(item.text)).map((item) => item.text));
    }
    expect(rallyGoalTexts.length).toBeGreaterThan(0);
    expect(rallyGoalTexts.every((text) => /ゴール！/.test(text))).toBe(true);
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

  it("rotates market candidates without repeating the previous list", () => {
    const simulation = new ClubSimulation();
    const first = new Set(simulation.marketCandidateComparison.map((item) => item.player.id));
    advanceWeekForTest(simulation);
    advanceWeekForTest(simulation);
    advanceWeekForTest(simulation);
    const second = new Set(simulation.marketCandidateComparison.map((item) => item.player.id));

    expect(second.size).toBeGreaterThan(0);
    expect([...second].some((id) => first.has(id))).toBe(false);

    advanceWeekForTest(simulation);
    advanceWeekForTest(simulation);
    advanceWeekForTest(simulation);
    const third = new Set(simulation.marketCandidateComparison.map((item) => item.player.id));
    expect([...third].some((id) => second.has(id))).toBe(false);
  });

  it("persists a renamed club across simulation instances and match reports", () => {
    const firstSimulation = new ClubSimulation();
    const update = firstSimulation.setClubName("  ブライト 札幌  ");
    expect(update.ok).toBe(true);
    expect(firstSimulation.clubNameValue).toBe("ブライト 札幌");

    const restoredSimulation = new ClubSimulation();
    expect(restoredSimulation.clubNameValue).toBe("ブライト 札幌");
    expect(restoredSimulation.leagueRows.find((row) => row.id === "orbit")?.name).toBe("ブライト 札幌");

    const result = advanceWeekForTest(restoredSimulation);
    expect(result.highlights.some((item) => item.kind === "fulltime" && item.text.includes("ブライト 札幌"))).toBe(true);
  });

  it("maps only attack or midfield opponents to defensive markers", () => {
    const simulation = new ClubSimulation();
    const result = advanceWeekForTest(simulation);
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

  it("uses nationality-specific names for foreign players", () => {
    expect(marketRecruits.find((player) => player.id === "r1")?.name).toBe(nationalityNameFor("BR", "r1"));
    expect(marketRecruits.find((player) => player.id === "r4")?.name).toBe(nationalityNameFor("ES", "r4"));
    expect(marketRecruits.find((player) => player.id === "r9")?.name).toBe(nationalityNameFor("AR", "r9"));
    expect(nationalityNameFor("BR", "r1")).toMatch(/^[A-Za-zÀ-ÿ]+ [A-Za-zÀ-ÿ]+$/);
    expect(nationalityNameFor("KR", "sample")).toMatch(/^[A-Za-z-]+ [A-Za-z-]+$/);
  });

  it("provides 300 unique market player IDs with exactly 50 foreign players", () => {
    expect(marketRecruits).toHaveLength(300);
    expect(new Set(marketRecruits.map((player) => player.id)).size).toBe(300);
    expect(marketRecruits.filter((player) => player.nationality && player.nationality !== "JP")).toHaveLength(50);
    expect(marketRecruits.filter((player) => (player.nationality ?? "JP") === "JP")).toHaveLength(250);
    expect(marketRecruits.filter((player) => player.id.startsWith("rg"))).toHaveLength(291);
  });

  it("differentiates nationality tendencies by position", () => {
    expect(nationalityProfiles.BR.note).toContain("突破");
    expect(Object.values(nationalityProfiles).every((profile) => profile.styleTendency.length >= 40)).toBe(true);
    expect(nationalityPositionBoostFor("BR", "WG").dribble).toBeGreaterThan(nationalityPositionBoostFor("BR", "CB").dribble ?? 0);
    expect(nationalityPositionBoostFor("ES", "CM").pass).toBeGreaterThan(nationalityPositionBoostFor("ES", "WG").pass ?? 0);
    expect(nationalityPositionBoostFor("DE", "CB").defense).toBeGreaterThan(nationalityPositionBoostFor("DE", "WG").defense ?? 0);
    expect(nationalityPositionBoostFor("AR", "AM").pass).toBeGreaterThan(nationalityPositionBoostFor("AR", "CB").pass ?? 0);
    const brazilianWingers = marketRecruits.filter((player) => player.nationality === "BR" && player.position === "WG");
    const spanishMidfielders = marketRecruits.filter((player) => player.nationality === "ES" && ["CM", "AM", "DM"].includes(player.position));
    expect(brazilianWingers.length).toBeGreaterThan(0);
    expect(spanishMidfielders.length).toBeGreaterThan(0);
    expect(brazilianWingers.every((player) => player.dribble >= 60)).toBe(true);
    expect(spanishMidfielders.every((player) => player.pass >= 55)).toBe(true);
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

    const result = advanceWeekForTest(simulation);
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

    const result = advanceWeekForTest(simulation);
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
    const result = advanceWeekForTest(simulation);
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
    const result = advanceWeekForTest(simulation);
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
    expect(simulation.rosterPlayers.every((item) => simulation.systemUnderstandingFor(item) <= 72)).toBe(true);
    expect(simulation.rosterPlayers.every((item) => simulation.systemMasterySummaryFor(item).every((system) => system.mastery <= 42))).toBe(true);
    expect(systems.length).toBeGreaterThanOrEqual(8);
    expect(new Set(systems.map((item) => item.mastery)).size).toBeGreaterThan(1);
    expect(simulation.score().systemRate).toBeGreaterThanOrEqual(70);
  });

  it("assigns unique growth profiles and applies curve timing to XP gains", () => {
    const simulation = new ClubSimulation();
    const first = simulation.rosterPlayers[0]!;
    const second = simulation.rosterPlayers.find((player) => player.id !== first.id)!;
    const firstProfile = defaultGrowthProfileFor(first);
    const secondProfile = defaultGrowthProfileFor(second);
    expect(firstProfile.seed).not.toBe(secondProfile.seed);
    expect(firstProfile.affinities).not.toEqual(secondProfile.affinities);
    expect(growthCurveModifierFor("early", 20)).toBeGreaterThan(growthCurveModifierFor("late", 20));
    expect(growthCurveModifierFor("late", 31)).toBeGreaterThan(growthCurveModifierFor("early", 31));

    const summary = simulation.growthProfileSummaryFor(first);
    expect(["早熟型", "標準型", "晩成型"]).toContain(summary.curveLabel);
    expect(summary.top).toHaveLength(3);
    expect(summary.top[0]!.value).toBeGreaterThanOrEqual(summary.top[1]!.value);
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

    const result = advanceWeekForTest(simulation);
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
    const result = advanceWeekForTest(simulation);
    const { orbit, opponent } = result.stats;

    expect(orbit.possession + opponent.possession).toBe(100);
    expect(orbit.shots).toBeGreaterThanOrEqual(orbit.shotsOnTarget);
    expect(opponent.shots).toBeGreaterThanOrEqual(opponent.shotsOnTarget);
    expect(orbit.passAccuracy).toBeGreaterThanOrEqual(0);
    expect(opponent.passAccuracy).toBeGreaterThanOrEqual(0);
    expect(orbit.saves).toBeGreaterThanOrEqual(0);
    expect(opponent.saves).toBeGreaterThanOrEqual(0);
    expect(orbit.shots).toBeLessThanOrEqual(22);
    expect(opponent.shots).toBeLessThanOrEqual(22);
    expect(orbit.passes).toBeGreaterThanOrEqual(250);
    expect(orbit.passes).toBeLessThanOrEqual(680);
    expect(opponent.passes).toBeGreaterThanOrEqual(250);
    expect(opponent.passes).toBeLessThanOrEqual(680);
    expect(orbit.bigChances).toBeLessThanOrEqual(6);
    expect(opponent.bigChances).toBeLessThanOrEqual(6);
  });

  it("reports ratings for every player who appeared", () => {
    const simulation = new ClubSimulation();
    const result = advanceWeekForTest(simulation);
    expect(result.playerRatings).toHaveLength(11);
    expect(result.playerRatings.every((rating) => rating.playerId && rating.note.length > 0)).toBe(true);
  });

  it("raises defensive ratings when the team keeps a clean sheet", () => {
    const simulation = new ClubSimulation();
    const cleanSheet = (simulation as any).createPlayerRatings([], [], [], 0) as Array<{ position: string; rating: number }>;
    const concededTwo = (simulation as any).createPlayerRatings([], [], [], 2) as Array<{ position: string; rating: number }>;
    const cleanDefenders = cleanSheet.filter((item) => ["GK", "CB", "SB", "DM"].includes(item.position));
    const concededDefenders = concededTwo.filter((item) => ["GK", "CB", "SB", "DM"].includes(item.position));
    expect(cleanDefenders.length).toBeGreaterThan(0);
    expect(cleanDefenders.reduce((sum, item) => sum + item.rating, 0) / cleanDefenders.length)
      .toBeGreaterThan(concededDefenders.reduce((sum, item) => sum + item.rating, 0) / concededDefenders.length);
  });

  it("assigns a deterministic referee strictness profile to each match", () => {
    const simulation = new ClubSimulation();
    const result = advanceWeekForTest(simulation);
    expect(result.refereeStrictness).toBeGreaterThanOrEqual(.78);
    expect(result.refereeStrictness).toBeLessThanOrEqual(1.28);
    expect(["寛容", "標準", "厳格"]).toContain(result.refereeLabel);
  });

  it("generates injuries and cards often enough to affect match management", () => {
    const simulation = new ClubSimulation();
    let injuryCount = 0;
    let cardCount = 0;
    for (let week = 0; week < 12; week += 1) {
      const result = advanceWeekForTest(simulation);
      injuryCount += result.injuries.length;
      cardCount += result.highlights.filter((item) => item.kind === "card").length;
    }
    expect(injuryCount).toBeGreaterThan(0);
    expect(cardCount).toBeGreaterThan(4);
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

  it("keeps the goalkeeper visibly separated from the central defenders in three-back formations", () => {
    for (const formationId of ["3-4-3", "3-5-2", "3-6-1"]) {
      const formation = formations.find((item) => item.id === formationId);
      const gk = formation?.slots.find((slot) => slot.id === "gk");
      const cb = formation?.slots.find((slot) => slot.id === "cb");
      expect(gk).toBeDefined();
      expect(cb).toBeDefined();
      expect((gk?.y ?? 0) - (cb?.y ?? 0)).toBeGreaterThanOrEqual(13);
    }
  });

  it("keeps the goalkeeper visibly separated from the central defenders in five-back formations", () => {
    for (const formationId of ["5-4-1", "5-3-2"]) {
      const formation = formations.find((item) => item.id === formationId);
      const gk = formation?.slots.find((slot) => slot.id === "gk");
      const cb = formation?.slots.find((slot) => slot.id === "cb");
      expect(gk).toBeDefined();
      expect(cb).toBeDefined();
      expect((gk?.y ?? 0) - (cb?.y ?? 0)).toBeGreaterThanOrEqual(13);
    }
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
  it("offers three non-4-4-2 midfield structures while preserving 4-4-2 variants", () => {
    const baseIds = ["4-3-3", "4-5-1", "3-4-3", "3-5-2", "3-6-1", "5-4-1", "5-3-2"] as const;
    baseIds.forEach((baseId) => {
      const structures = formations.filter((formation) => formation.id.startsWith(`${baseId}-`));
      expect(structures).toHaveLength(3);
      expect(new Set(structures.map((formation) => formation.id)).size).toBe(3);
    });
    expect(formations.filter((formation) => formation.id.startsWith("4-4-2-")).map((formation) => formation.id)).toEqual([
      "4-4-2-double-pivot",
      "4-4-2-attacking-wide",
      "4-4-2-central",
      "4-4-2-diamond",
    ]);
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
  it("applies tailored bonuses to the added non-4-4-2 structures", () => {
    const read = (formationId: string) => {
      const simulation = new ClubSimulation();
      simulation.setFormation(formationId);
      simulation.autoLineup();
      return simulation.score().tactics;
    };
    expect(read("4-3-3-control").structureMidfield).toBe(5);
    expect(read("4-5-1-attacking-mid").structureAttack).toBe(4);
    expect(read("5-4-1-central").structureDefense).toBe(4);
    expect(read("5-3-2-counter").structureTransition).toBe(4);
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

    advanceWeekForTest(simulation);
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

    simulation.advanceBreakWeek("training-camp");
    simulation.advanceBreakWeek("preseason-match");

    simulation.advanceWeek();
    expect(simulation.marketUpdateNotice).not.toBeNull();
    simulation.dismissMarketUpdateNotice();
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

  it("shows four candidates initially and normalizes an oversized saved list", () => {
    const simulation = new ClubSimulation();
    expect(simulation.marketCandidateComparison).toHaveLength(4);

    const values = new Map<string, string>();
    simulation.resetGame();
    const saved = JSON.parse(values.get("touchline-tactics-save-v1") ?? "{}") as Record<string, unknown>;
    saved.marketCandidateIds = marketRecruits.map((player) => player.id);
    saved.marketCandidateCycle = 0;
    values.set("touchline-tactics-save", JSON.stringify(saved));
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });

    const restored = new ClubSimulation();
    expect(restored.marketCandidateComparison).toHaveLength(4);
  });

  it("does not repeat a market player name within the same season", () => {
    const simulation = new ClubSimulation();
    const firstNames = new Set(simulation.marketCandidateComparison.map((item) => item.player.name));

    simulation.advanceBreakWeek("training-camp");
    simulation.advanceBreakWeek("preseason-match");
    simulation.advanceWeek();
    const secondNames = new Set(simulation.marketCandidateComparison.map((item) => item.player.name));
    simulation.advanceWeek();
    simulation.advanceWeek();
    simulation.advanceWeek();
    const thirdNames = new Set(simulation.marketCandidateComparison.map((item) => item.player.name));

    expect([...secondNames].some((name) => firstNames.has(name))).toBe(false);
    expect([...thirdNames].some((name) => firstNames.has(name) || secondNames.has(name))).toBe(false);
    expect(secondNames.size).toBeGreaterThan(0);
    expect(thirdNames.size).toBeGreaterThan(0);
  });
});

describe("Sponsor balance", () => {
  it("keeps sponsor contracts meaningful without making any plan strictly dominant", () => {
    const byId = Object.fromEntries(sponsorOffers.map((offer) => [offer.id, offer]));
    expect(byId["orbit-credit"].upFront).toBe(1500000);
    expect(byId["northforge"].winBonus).toBe(190000);
    expect(byId["mori-craft"].weeklyIncome).toBe(220000);
    for (const offer of sponsorOffers) {
      expect(offer.upFront).toBeGreaterThanOrEqual(1000000);
      expect(offer.weeklyIncome).toBeGreaterThanOrEqual(120000);
      expect(offer.winBonus).toBeGreaterThanOrEqual(50000);
    }
  });

  it("provides sponsor-specific milestone rewards after signing", () => {
    const simulation = new ClubSimulation();
    expect(simulation.signSponsor("orbit-credit").ok).toBe(true);
    expect(simulation.currentSponsor?.id).toBe("orbit-credit");
    expect(simulation.sponsorSpecialRewards.map((reward) => reward.condition)).toEqual(["league-wins-3", "fame-400"]);
    expect(simulation.sponsorSpecialRewards.every((reward) => !reward.claimed && !reward.eligible)).toBe(true);
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

  it("reports a deterministic growth curve and bounded ability forecast", () => {
    const simulation = new ClubSimulation();
    const candidate = simulation.currentMarketCandidate;
    expect(candidate).toBeDefined();
    const report = simulation.scoutGrowthReport(candidate!);
    expect(["早熟型", "標準型", "晩成型"]).toContain(report.curveLabel);
    expect(report.confidence).toBeGreaterThan(0);
    expect(report.top.length).toBeGreaterThan(0);
    report.forecasts.forEach((item) => {
      expect(item.potential).toBeGreaterThanOrEqual(item.current);
      expect(item.potential).toBeLessThanOrEqual(item.ceiling);
    });
    expect(simulation.scoutGrowthReport(candidate!).top).toEqual(report.top);
  });

});

describe("Club startup defaults", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts a new club with 30 million yen", () => {
    const simulation = new ClubSimulation();
    expect(simulation.currentMoney).toBe(30_000_000);
  });
});

describe("Squad age balance", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("keeps opening and market players distributed across young, prime, and veteran groups", async () => {
    const { players } = await import("./data");
    const openingGroups = players.reduce((groups, player) => {
      groups[player.age <= 22 ? "young" : player.age <= 27 ? "prime" : "veteran"] += 1;
      return groups;
    }, { young: 0, prime: 0, veteran: 0 });
    const marketGroups = marketRecruits.reduce((groups, player) => {
      groups[player.age <= 22 ? "young" : player.age <= 27 ? "prime" : "veteran"] += 1;
      return groups;
    }, { young: 0, prime: 0, veteran: 0 });

    expect(openingGroups.young).toBeGreaterThanOrEqual(4);
    expect(openingGroups.prime).toBeGreaterThanOrEqual(5);
    expect(openingGroups.veteran).toBeGreaterThanOrEqual(4);
    expect(marketGroups.young).toBeGreaterThanOrEqual(2);
    expect(marketGroups.prime).toBeGreaterThanOrEqual(2);
    expect(marketGroups.veteran).toBeGreaterThanOrEqual(2);
  });

  it("makes younger players less mature and older players more complete without repeated save inflation", () => {
    const simulation = new ClubSimulation();
    const young = simulation.rosterPlayers.find((player) => player.id === "p15");
    const veteran = simulation.rosterPlayers.find((player) => player.id === "p13");
    expect(young).toBeDefined();
    expect(veteran).toBeDefined();
    expect(young!.age).toBeLessThan(veteran!.age);
    expect(young!.attack).toBeLessThanOrEqual((players.find((player) => player.id === "p15")?.attack ?? young!.attack) - 1);
    expect(veteran!.gk).toBeGreaterThanOrEqual(players.find((player) => player.id === "p13")?.gk ?? veteran!.gk ?? 0);

    const firstVeteranGk = veteran!.gk;
    simulation.train("recovery");
    const restored = new ClubSimulation();
    expect(restored.rosterPlayers.find((player) => player.id === "p13")?.gk).toBe(firstVeteranGk);
  });

  it("ages the squad at the season boundary and declines veteran attributes", () => {
    localStorage.clear();
    const simulation = new ClubSimulation();
    const veteran = simulation.rosterPlayers.find((player) => player.id === "p11")!;
    veteran.age = 31;
    veteran.defense = 90;
    veteran.attributeXp = { ...(veteran.attributeXp ?? {}), defense: 999 };
    veteran.attributeCeilings = { ...(veteran.attributeCeilings ?? {}), defense: 99 };
    const beforeAge = veteran.age;
    const beforeDefense = veteran.defense;

    for (let index = 0; index < 19; index += 1) advanceWeekForTest(simulation);
    for (let index = 0; index < 5; index += 1) simulation.advanceBreakWeek("training-camp");
    for (let index = 0; index < 14; index += 1) advanceWeekForTest(simulation);
    for (let index = 0; index < 10; index += 1) simulation.advanceBreakWeek("training-camp");

    const aged = simulation.rosterPlayers.find((player) => player.id === "p11")!;
    expect(aged.age).toBe(beforeAge + 1);
    expect(aged.defense).toBeLessThan(beforeDefense!);
    expect(aged.attributeCeilings?.defense).toBeLessThanOrEqual(99);
    expect(simulation.logs.some((log) => log.includes("能力衰退"))).toBe(true);
  });

  it("retires a 40-year-old player at the season boundary and clears lineup slots", () => {
    localStorage.clear();
    const simulation = new ClubSimulation();
    const veteran = simulation.rosterPlayers.find((player) => player.id === "p13")!;
    veteran.age = 40;
    expect(Object.values(simulation.lineupState)).toContain("p13");

    for (let index = 0; index < 19; index += 1) advanceWeekForTest(simulation);
    for (let index = 0; index < 5; index += 1) simulation.advanceBreakWeek("training-camp");
    for (let index = 0; index < 14; index += 1) advanceWeekForTest(simulation);
    for (let index = 0; index < 10; index += 1) simulation.advanceBreakWeek("training-camp");

    expect(simulation.rosterPlayers.some((player) => player.id === "p13")).toBe(false);
    expect(Object.values(simulation.lineupState)).not.toContain("p13");
    expect(simulation.logs.some((log) => log.includes("現役引退"))).toBe(true);
  });
});

describe("Rehabilitation facility", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("upgrades the rehabilitation center and persists its level", () => {
    const simulation = new ClubSimulation();
    const initial = simulation.rehabilitationFacility;
    const result = simulation.upgradeRehabilitationFacility();
    expect(result.ok).toBe(true);
    expect(simulation.rehabilitationFacility.level).toBe(initial.level + 1);
    expect(simulation.rehabilitationFacility.recoveryWeeks).toBe(2);
    const restored = new ClubSimulation();
    expect(restored.rehabilitationFacility.level).toBe(2);
  });

  it("uses meaningful upgrade costs across all facility categories", () => {
    const simulation = new ClubSimulation();
    expect(simulation.trainingFacility.nextCost).toBe(2_500_000);
    expect(simulation.rehabilitationFacility.nextCost).toBe(2_500_000);
    expect(simulation.concessionFacility.nextCost).toBe(3_000_000);
    expect(simulation.scoutFacility.nextCost).toBe(2_000_000);
  });

  it("charges the combined facility maintenance cost every week", () => {
    const simulation = new ClubSimulation();
    expect(simulation.weeklyFacilityMaintenance).toBe(550_000);
    simulation.advanceBreakWeek("training-camp");
    const maintenance = simulation.financialSummary.expenseBreakdown.find((entry) => entry.category === "施設維持費");
    expect(maintenance?.amount).toBe(550_000);
  });

  it("uses the rehabilitation level to shorten injury recovery", () => {
    const simulation = new ClubSimulation();
    const player = simulation.rosterPlayers[0];
    (simulation as unknown as { injuries: Record<string, number> }).injuries[player.id] = 2;
    player.injuryWeeks = 2;
    simulation.upgradeRehabilitationFacility();
    advanceWeekForTest(simulation);
    expect(simulation.injuryWeeksFor(player.id)).toBe(0);
    expect(player.injuryWeeks).toBeUndefined();
  });
});


describe("44-week season calendar", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value),
      removeItem: (key: string) => values.delete(key),
      clear: () => values.clear(),
    });
  });

  it("uses a 44-week season with two opening off-weeks", () => {
    const simulation = new ClubSimulation();
    expect(simulation.seasonWeeks).toBe(44);
    expect(simulation.calendarPhase).toBe("preseason");
    simulation.advanceBreakWeek("training-camp");
    expect(simulation.calendarPhase).toBe("preseason");
    simulation.advanceBreakWeek("preseason-match");
    expect(simulation.completedWeeks).toBe(2);
    expect(simulation.calendarPhase).toBe("league");
    for (let index = 0; index < 17; index += 1) simulation.advanceWeek();
    expect(simulation.calendarPhase).toBe("winter-break");
    expect(simulation.isBreakWeek).toBe(true);
    const camp = simulation.advanceBreakWeek("training-camp");
    expect(camp.ok).toBe(true);
    expect(simulation.completedWeeks).toBe(20);
    for (let index = 0; index < 4; index += 1) simulation.advanceBreakWeek("preseason-match");
    expect(simulation.completedWeeks).toBe(24);
    expect(simulation.calendarPhase).toBe("league");
  });

  it("finishes the 44-week season after the off-season activities and starts a new season", () => {
    const simulation = new ClubSimulation();
    for (let index = 0; index < 2; index += 1) simulation.advanceBreakWeek("training-camp");
    for (let index = 0; index < 17; index += 1) simulation.advanceWeek();
    for (let index = 0; index < 5; index += 1) simulation.advanceBreakWeek("training-camp");
    for (let index = 0; index < 14; index += 1) simulation.advanceWeek();
    expect(simulation.completedWeeks).toBe(38);
    expect(simulation.calendarPhase).toBe("off-season");
    for (let index = 0; index < 6; index += 1) simulation.advanceBreakWeek("preseason-match");
    expect(simulation.completedWeeks).toBe(0);
    expect(simulation.calendarPhase).toBe("preseason");
  });
});
