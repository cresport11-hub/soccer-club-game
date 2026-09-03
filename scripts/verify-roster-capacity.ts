import { ClubSimulation, ROSTER_LIMIT } from "../client/src/game/ClubSimulation";

type BrowserStorage = {
  data: Map<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

const storage: BrowserStorage = {
  data: new Map(),
  getItem(key) { return this.data.get(key) ?? null; },
  setItem(key, value) { this.data.set(key, value); },
  removeItem(key) { this.data.delete(key); },
};

Object.assign(globalThis, { localStorage: storage });

const simulation = new ClubSimulation();
const initialCount = simulation.rosterPlayers.length;
const openingSave = storage.data.get("touchline-tactics-save-v1");
if (!openingSave) throw new Error("新規開始セーブを作成できません。");
const legacySave = JSON.parse(openingSave) as { players: Array<{ id: string }>; seasonStats?: Array<{ playerId: string }> };
legacySave.players = legacySave.players.filter((player) => /^p(?:[1-9]|1[0-6])$/.test(player.id));
legacySave.seasonStats = legacySave.seasonStats?.filter((stat) => /^p(?:[1-9]|1[0-6])$/.test(stat.playerId));
storage.setItem("touchline-tactics-save-v1", JSON.stringify(legacySave));
const restored = new ClubSimulation();
const restoredCount = restored.rosterPlayers.length;
const template = simulation.rosterPlayers[0];

for (let index = initialCount; index < ROSTER_LIMIT; index += 1) {
  simulation.rosterPlayers.push({ ...template, id: `capacity-${index}`, name: `検証選手 ${index}`, fatigue: 0 });
}

const internals = simulation as unknown as {
  recruitNegotiation: { candidateId: string; stage: "scouting" | "countered" | "agreed"; openingOffer: number; counterOffer: number; agreedFee: number | null };
  youthPlayers: Array<{ id: string; academyWeeks: number; [key: string]: unknown }>;
};
internals.recruitNegotiation = { candidateId: "r1", stage: "agreed", openingOffer: 1, counterOffer: 1, agreedFee: 1 };
internals.youthPlayers = [{ ...template, id: "capacity-youth", name: "検証ユース", academyWeeks: 3 }];

const marketAtLimit = simulation.signRecruit();
const youthAtLimit = simulation.promoteYouth("capacity-youth");
const report = {
  initialCount,
  rosterLimit: simulation.rosterLimit,
  legacyRestoredCount: restoredCount,
  atLimitCount: simulation.rosterPlayers.length,
  marketAtLimit,
  youthAtLimit,
};

if (initialCount !== 20 || restoredCount !== 20 || simulation.rosterLimit !== 32 || ROSTER_LIMIT !== 32 || simulation.rosterPlayers.length !== 32 || marketAtLimit.ok || youthAtLimit.ok || !marketAtLimit.text.includes("32人") || !youthAtLimit.text.includes("32人")) {
  throw new Error(JSON.stringify(report));
}

console.log(JSON.stringify(report));
