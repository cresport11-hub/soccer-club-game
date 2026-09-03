import { ClubSimulation } from "../client/src/game/ClubSimulation";
import { youthProspects } from "../client/src/game/data";

const storageKey = "touchline-tactics-save-v1";
const store = new Map<string, string>();
Object.assign(globalThis, { localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value), removeItem: (key: string) => store.delete(key) } });

const base = new ClubSimulation();
const localProspect = base.youthAcademyPlayers.find((player) => player.id === "y2");
if (!localProspect || localProspect.youthSkillQuality !== "地域発掘" || localProspect.youthSkillTendency?.growthPace !== "じっくり" || localProspect.skillXp?.["tempo-controller"] !== 38 || localProspect.youthScoutXpBonus !== 0) {
  throw new Error(JSON.stringify({ phase: "level-one-quality", localProspect }));
}

base.setYouthSkillTrainingTarget(localProspect.id, "tempo-controller");
const saved = JSON.parse(store.get(storageKey) ?? "{}");
const legacyProspects = youthProspects.map(({ youthScoutLevel: _scout, youthSkillQuality: _quality, youthInitialXpBonus: _entry, youthScoutXpBonus: _session, ...player }) => ({ ...player, academyWeeks: 0 }));

saved.scoutLevel = 2;
saved.youthPlayers = legacyProspects;
store.set(storageKey, JSON.stringify(saved));
const regional = new ClubSimulation();
const levelTwo = regional.youthAcademyPlayers.find((player) => player.id === "y2");
if (!levelTwo || levelTwo.youthSkillQuality !== "広域注目" || levelTwo.youthScoutLevel !== 2 || levelTwo.youthSkillTendency?.growthPace !== "標準" || levelTwo.skillXp?.["tempo-controller"] !== 48 || levelTwo.youthInitialXpBonus !== 10 || levelTwo.youthScoutXpBonus !== 1) {
  throw new Error(JSON.stringify({ phase: "level-two-quality", levelTwo, facility: regional.scoutFacility }));
}
const xpBeforeSession = levelTwo.skillXp?.["tempo-controller"] ?? 0;
const session = regional.developYouth();
const xpAfterSession = levelTwo.skillXp?.["tempo-controller"] ?? 0;
if (!session.ok || xpAfterSession !== xpBeforeSession + 12) {
  throw new Error(JSON.stringify({ phase: "level-two-session-xp", session, xpBeforeSession, xpAfterSession }));
}

const levelTwoSave = JSON.parse(store.get(storageKey) ?? "{}");
levelTwoSave.scoutLevel = 3;
levelTwoSave.youthPlayers = legacyProspects;
store.set(storageKey, JSON.stringify(levelTwoSave));
const elite = new ClubSimulation();
const levelThree = elite.youthAcademyPlayers.find((player) => player.id === "y2");
const forecast = elite.youthScoutQualityForecast;
if (!levelThree || levelThree.youthSkillQuality !== "分析選抜" || levelThree.youthScoutLevel !== 3 || levelThree.youthSkillTendency?.growthPace !== "早熟" || levelThree.skillXp?.["tempo-controller"] !== 62 || levelThree.youthInitialXpBonus !== 24 || levelThree.youthScoutXpBonus !== 2 || forecast.next !== null || forecast.current.youthQuality !== "分析選抜") {
  throw new Error(JSON.stringify({ phase: "level-three-quality", levelThree, forecast }));
}

console.log(JSON.stringify({ levelOne: localProspect.youthSkillQuality, levelTwo: { quality: levelTwo.youthSkillQuality, xp: 48, pace: levelTwo.youthSkillTendency?.growthPace, sessionXp: xpAfterSession - xpBeforeSession }, levelThree: { quality: levelThree.youthSkillQuality, xp: levelThree.skillXp?.["tempo-controller"], pace: levelThree.youthSkillTendency?.growthPace }, maxForecast: forecast.next === null }));
