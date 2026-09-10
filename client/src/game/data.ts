/**
 * Design system: 「タッチライン戦術室」— data is compact, legible, and designed for a tactical board UI.
 */
export type Position = "GK" | "CB" | "SB" | "DM" | "CM" | "AM" | "SH" | "WG" | "CF";
export const positionLabels: Record<Position, string> = { GK: "GK", CB: "CB", SB: "SB", DM: "DH", CM: "CH", AM: "OH", SH: "SH", WG: "WG", CF: "CF" };

/** 実戦の守備対応に合わせたマーク対象と担当優先順位。GK・CB・SBは個別マークせず、守備ブロックで対応する。 */
export const markingTargetPositions: Position[] = ["CF", "WG", "AM", "SH", "CM", "DM"];
export const markingDefenderPositions: Position[] = ["CB", "SB", "DM", "CM", "SH"];
const markingDefenderPriority: Partial<Record<Position, Position[]>> = {
  CF: ["CB", "SB", "DM", "CM", "SH"],
  WG: ["SB", "CB", "SH", "DM", "CM"],
  AM: ["DM", "CM", "CB", "SB", "SH"],
  SH: ["SB", "SH", "DM", "CM", "CB"],
  CM: ["CM", "DM", "SH", "CB", "SB"],
  DM: ["DM", "CM", "CB", "SB", "SH"],
};
export const isMarkableOpponentPosition = (position: Position) => markingTargetPositions.includes(position);
export const isMarkingDefenderPosition = (position: Position) => markingDefenderPositions.includes(position);
export const markingDefenderRank = (opponentPosition: Position, defenderPosition: Position) => {
  if (!isMarkableOpponentPosition(opponentPosition) || !isMarkingDefenderPosition(defenderPosition)) return null;
  const rank = markingDefenderPriority[opponentPosition]?.indexOf(defenderPosition) ?? -1;
  return rank >= 0 ? rank : null;
};
export const canMarkOpponent = (opponentPosition: Position, defenderPosition: Position) => markingDefenderRank(opponentPosition, defenderPosition) !== null;
export const positionLabel = (position: Position | string) => positionLabels[position as Position] ?? position;
export type TrainingLoad = "recovery" | "light" | "standard" | "high";
export type SkillGrowthFocus = "attacking" | "passing" | "finishing" | "defending" | "goalkeeping";
export type PlayerSkillId = "finisher" | "linkman" | "cut-in" | "cross-master" | "vision" | "engine" | "switcher" | "ball-hunter" | "overlap" | "duel-master" | "aerial-wall" | "interceptor" | "sweeper" | "one-on-one" | "tempo-controller" | "recovery-run" | "regista-scan" | "touchline-drive" | "aerial-target";
export type PlayerSkillDefinition = { id: PlayerSkillId; label: string; short: string; description: string; positions: Position[]; focus: "attack" | "defense" | "pass" | "tackle" | "interception" | "gk"; minimum: number; styles?: Array<"possession" | "direct" | "press">; attackBoost: number; defenseBoost: number; highlight: string };
export type YouthSkillTendency = { archetype: string; headline: string; primarySkill: PlayerSkillId; developmentSkill: PlayerSkillId; recommendedFocus: SkillGrowthFocus; growthPace: "早熟" | "標準" | "じっくり"; coachNote: string };
export type YouthSkillQuality = "地域発掘" | "広域注目" | "分析選抜";
export type CFPlayStyle = "target" | "runner" | "false-nine";
export type WGPlayStyle = "touchline" | "inverted" | "wide-worker";
export type AMPlayStyle = "playmaker" | "shadow-striker" | "pressing-ten";
export type CMPlayStyle = "box-to-box" | "deep-playmaker" | "mezzala";
export type DMPlayStyle = "anchor" | "regista" | "destroyer";
export type CBPlayStyle = "stopper" | "ball-playing" | "cover";
export type SBPlayStyle = "overlap" | "inverted-fullback" | "defensive-fullback";
export type GKPlayStyle = "shot-stopper" | "sweeper-keeper" | "distributor";

export type Player = {
  id: string;
  name: string;
  position: Position;
  secondary?: Position;
  attack: number;
  dribble: number;
  pass: number;
  shoot: number;
  defense: number;
  tackle: number;
  block: number;
  interception: number;
  gk?: number;
  fatigue: number;
  trainingLoad?: TrainingLoad;
  cfPlayStyle?: CFPlayStyle;
  wgPlayStyle?: WGPlayStyle;
  amPlayStyle?: AMPlayStyle;
  cmPlayStyle?: CMPlayStyle;
  dmPlayStyle?: DMPlayStyle;
  cbPlayStyle?: CBPlayStyle;
  sbPlayStyle?: SBPlayStyle;
  gkPlayStyle?: GKPlayStyle;
  injuryWeeks?: number;
  age: number;
  salary: number;
  contractYears?: number;
  winBonus?: number;
  appearanceBonus?: number;
  goalBonus?: number;
  level: number;
  ceiling: number;
  chemistry: "spark" | "steady" | "edge";
  skills?: PlayerSkillId[];
  skillXp?: Partial<Record<PlayerSkillId, number>>;
  skillTrainingTarget?: PlayerSkillId;
  youthSkillTendency?: YouthSkillTendency;
  youthScoutLevel?: number;
  youthSkillQuality?: YouthSkillQuality;
  youthInitialXpBonus?: number;
  youthScoutXpBonus?: number;
  youthScoutStaffId?: string;
  youthScoutStaffName?: string;
  youthScoutStaffImpact?: string;
  youthScoutStaffEntryXpBonus?: number;
  youthScoutStaffSessionXpBonus?: number;
};

export type Slot = {
  id: string;
  label: Position;
  x: number;
  y: number;
  allowed: Position[];
};

export type Formation = { id: string; label: string; description: string; slots: Slot[] };

export type ClubSeed = { id: string; name: string; rating: number; color: string; form: string };
export type OpponentRole = { position: Position; role: string };
export type OpponentTacticalPlan = {
  formationId: string;
  mentality: "defensive" | "balanced" | "attacking";
  playingStyle: "possession" | "direct" | "press";
  cohesion: number;
  attackBias: number;
  defenseBias: number;
  trait: string;
  note: string;
  roles: OpponentRole[];
};
export type OpponentPlayer = { id: string; name: string; position: Position; role: string; attack: number; defense: number; pass: number; tackle: number; interception: number; gk?: number; skills: PlayerSkillId[] };

export const playerSkillCatalog: Record<PlayerSkillId, PlayerSkillDefinition> = {
  finisher: { id: "finisher", label: "フィニッシュセンス", short: "決定力", description: "ゴール前で一瞬のコースを見抜き、確率の低い局面も得点へ変える。", positions: ["CF", "WG", "AM"], focus: "attack", minimum: 64, attackBoost: 1, defenseBoost: 0, highlight: "ゴール前の一瞬を逃さず、鋭く仕留めた。" },
  linkman: { id: "linkman", label: "リンクマン", short: "連結", description: "降りて受け、周囲を使いながら前線の接続点をつくる。", positions: ["CF", "AM"], focus: "pass", minimum: 56, styles: ["possession"], attackBoost: 1, defenseBoost: 0, highlight: "前線で巧みに受け、味方の前進を引き出した。" },
  "cut-in": { id: "cut-in", label: "カットイン", short: "斜行", description: "外側から内へ鋭く入り、シュートまたはラストパスの角度をつくる。", positions: ["WG", "SH", "AM"], focus: "attack", minimum: 60, styles: ["possession", "direct"], attackBoost: 1, defenseBoost: 0, highlight: "内側への鋭い仕掛けで守備の基準を崩した。" },
  "cross-master": { id: "cross-master", label: "クロス職人", short: "配球", description: "サイドの前進を正確なクロスと逆サイドへの展開へ変える。", positions: ["WG", "SH", "SB"], focus: "pass", minimum: 52, styles: ["direct"], attackBoost: 1, defenseBoost: 0, highlight: "サイドから狙い澄ましたボールを送り込んだ。" },
  vision: { id: "vision", label: "スルーパス", short: "展望", description: "守備の間を読み、前を向く味方へ決定的なパスを通す。", positions: ["AM", "CM"], focus: "pass", minimum: 66, styles: ["possession"], attackBoost: 1, defenseBoost: 0, highlight: "守備の間を抜くパスで、局面を前へ動かした。" },
  engine: { id: "engine", label: "無尽蔵の運動量", short: "運動量", description: "攻守の往復を続け、プレッシングと前進の両方を支える。", positions: ["CM", "SH"], focus: "defense", minimum: 54, styles: ["press"], attackBoost: 1, defenseBoost: 1, highlight: "攻守に走り切り、味方のプレスを押し上げた。" },
  switcher: { id: "switcher", label: "展開力", short: "展開", description: "広い視野で逆サイドを見つけ、攻撃の向きを素早く変える。", positions: ["CM", "DM"], focus: "pass", minimum: 62, styles: ["possession"], attackBoost: 1, defenseBoost: 0, highlight: "逆サイドへの展開で、守備の重心を動かした。" },
  "ball-hunter": { id: "ball-hunter", label: "ボールハンター", short: "奪取", description: "相手の持ち出しを読み、前向きの奪取から即時攻撃につなげる。", positions: ["DM", "CM", "SH"], focus: "tackle", minimum: 58, styles: ["press"], attackBoost: 0, defenseBoost: 2, highlight: "鋭い寄せでボールを奪い、攻撃へつなげた。" },
  overlap: { id: "overlap", label: "オーバーラップ", short: "追越", description: "外側を追い越して幅をつくり、前線へ選択肢を増やす。", positions: ["SB", "SH"], focus: "attack", minimum: 45, styles: ["direct", "press"], attackBoost: 1, defenseBoost: 0, highlight: "外側を追い越し、前進の出口をつくった。" },
  "duel-master": { id: "duel-master", label: "対人強度", short: "対人", description: "一対一で粘り強く対応し、相手の前進を止める。", positions: ["SB", "CB", "DM"], focus: "defense", minimum: 65, attackBoost: 0, defenseBoost: 1, highlight: "対人局面を制し、危険な前進を止めた。" },
  "aerial-wall": { id: "aerial-wall", label: "空中戦の壁", short: "空中", description: "競り合いで高さを発揮し、クロスとロングボールを跳ね返す。", positions: ["CB", "SB"], focus: "defense", minimum: 68, styles: ["direct"], attackBoost: 0, defenseBoost: 1, highlight: "高い打点で競り勝ち、危険を跳ね返した。" },
  interceptor: { id: "interceptor", label: "インターセプト", short: "予測", description: "相手のパスコースを先読みし、攻撃の芽を摘み取る。", positions: ["CB", "DM"], focus: "interception", minimum: 64, attackBoost: 0, defenseBoost: 1, highlight: "パスコースを読み切り、前進を寸断した。" },
  sweeper: { id: "sweeper", label: "スイーパー対応", short: "掃除", description: "最終ラインの背後を素早くカバーし、広い守備範囲を使う。", positions: ["GK"], focus: "gk", minimum: 70, styles: ["press"], attackBoost: 0, defenseBoost: 1, highlight: "背後へ素早く飛び出し、危険を消した。" },
  "one-on-one": { id: "one-on-one", label: "1対1セーブ", short: "反応", description: "至近距離でも冷静に構え、決定機を止める。", positions: ["GK"], focus: "gk", minimum: 68, attackBoost: 0, defenseBoost: 2, highlight: "至近距離の決定機を止め、チームを救った。" },
  "tempo-controller": { id: "tempo-controller", label: "テンポ支配", short: "緩急", description: "試合の速度を選び、落ち着いたパスワークをつくる。", positions: ["CM", "DM"], focus: "pass", minimum: 61, styles: ["possession"], attackBoost: 1, defenseBoost: 0, highlight: "落ち着いた配球で、試合のテンポを整えた。" },
  "recovery-run": { id: "recovery-run", label: "リカバリーラン", short: "帰陣", description: "切り替え直後に素早く戻り、危険なスペースを閉じる。", positions: ["CB", "SB", "SH"], focus: "tackle", minimum: 60, styles: ["press"], attackBoost: 0, defenseBoost: 1, highlight: "素早い帰陣で、カウンターの芽を消した。" },
  "regista-scan": { id: "regista-scan", label: "レジスタの視野", short: "司令", description: "受ける前に周囲を見渡し、前進の起点をつくる。", positions: ["DM", "CM"], focus: "pass", minimum: 60, styles: ["possession"], attackBoost: 1, defenseBoost: 0, highlight: "一手早い視野で、前進の起点をつくった。" },
  "touchline-drive": { id: "touchline-drive", label: "タッチライン突破", short: "突破", description: "幅を保ちながら縦に運び、サイドの優位をつくる。", positions: ["WG", "SH"], focus: "attack", minimum: 58, styles: ["direct"], attackBoost: 1, defenseBoost: 0, highlight: "タッチライン際を駆け上がり、局面を押し込んだ。" },
  "aerial-target": { id: "aerial-target", label: "ポストプレー", short: "収め", description: "前線でボールを収め、周囲を押し上げる基準点になる。", positions: ["CF"], focus: "defense", minimum: 25, styles: ["direct"], attackBoost: 1, defenseBoost: 0, highlight: "前線でボールを収め、二列目を押し上げた。" },
};

export const playerSkillFor = (id: PlayerSkillId) => playerSkillCatalog[id];
export const playerSkillGrowthFocus: Record<PlayerSkillId, SkillGrowthFocus[]> = {
  finisher: ["finishing", "attacking"], linkman: ["passing"], "cut-in": ["attacking", "finishing"], "cross-master": ["passing"], vision: ["passing"], engine: ["attacking", "defending"], switcher: ["passing"], "ball-hunter": ["defending"], overlap: ["attacking", "passing"], "duel-master": ["defending"], "aerial-wall": ["defending"], interceptor: ["defending"], sweeper: ["goalkeeping"], "one-on-one": ["goalkeeping"], "tempo-controller": ["passing"], "recovery-run": ["defending"], "regista-scan": ["passing"], "touchline-drive": ["attacking"], "aerial-target": ["finishing", "attacking"],
};
const fallbackPlayerSkills: Record<Position, PlayerSkillId[]> = {
  GK: ["one-on-one"], CB: ["aerial-wall"], SB: ["overlap"], DM: ["interceptor"], CM: ["tempo-controller"], AM: ["vision"], SH: ["touchline-drive"], WG: ["cut-in"], CF: ["finisher"],
};
export const playerSkillsFor = (player: Pick<Player, "position" | "skills">) => {
  const configured = (player.skills ?? []).filter((skill): skill is PlayerSkillId => Boolean(playerSkillCatalog[skill]));
  return configured.length ? configured : fallbackPlayerSkills[player.position];
};

const field = (id: string, label: Position, x: number, y: number, allowed: Position[]): Slot => ({ id, label, x, y, allowed });

export const formations: Formation[] = [
  {
    id: "4-4-2",
    label: "4-4-2",
    description: "王道のバランス",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]),
      field("lb", "SB", 16, 76, ["SB", "CB"]), field("lcb", "CB", 38, 80, ["CB", "SB"]), field("rcb", "CB", 62, 80, ["CB", "SB"]), field("rb", "SB", 84, 76, ["SB", "CB"]),
      field("lm", "SH", 17, 51, ["SH", "WG", "AM", "CM"]), field("lcm", "CM", 39, 57, ["CM", "DM", "AM"]), field("rcm", "CM", 61, 57, ["CM", "DM", "AM"]), field("rm", "SH", 83, 51, ["SH", "WG", "AM", "CM"]),
      field("lst", "CF", 38, 24, ["CF", "AM", "WG"]), field("rst", "CF", 62, 24, ["CF", "AM", "WG"]),
    ],
  },
  {
    id: "4-3-3",
    label: "4-3-3",
    description: "攻撃的バランス",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]),
      field("lb", "SB", 16, 76, ["SB", "CB"]), field("lcb", "CB", 38, 80, ["CB", "SB"]), field("rcb", "CB", 62, 80, ["CB", "SB"]), field("rb", "SB", 84, 76, ["SB", "CB"]),
      field("lcm", "CM", 28, 57, ["CM", "DM", "AM"]), field("cm", "DM", 50, 62, ["DM", "CM"]), field("rcm", "CM", 72, 57, ["CM", "DM", "AM"]),
      field("lw", "WG", 20, 29, ["WG", "SH", "AM", "CF"]), field("st", "CF", 50, 23, ["CF", "AM", "WG"]), field("rw", "WG", 80, 29, ["WG", "SH", "AM", "CF"]),
    ],
  },
  {
    id: "4-5-1",
    label: "4-5-1",
    description: "中盤支配",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]), field("lb", "SB", 16, 76, ["SB", "CB"]), field("lcb", "CB", 38, 80, ["CB", "SB"]), field("rcb", "CB", 62, 80, ["CB", "SB"]), field("rb", "SB", 84, 76, ["SB", "CB"]),
      field("lm", "SH", 12, 45, ["SH", "WG", "AM", "CM"]), field("lcm", "CM", 31, 57, ["CM", "DM", "AM"]), field("dm", "DM", 50, 64, ["DM", "CM", "CB"]), field("rcm", "CM", 69, 57, ["CM", "DM", "AM"]), field("rm", "SH", 88, 45, ["SH", "WG", "AM", "CM"]),
      field("st", "CF", 50, 22, ["CF", "AM", "WG"]),
    ],
  },
  {
    id: "3-4-3",
    label: "3-4-3",
    description: "前線プレス",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]), field("lcb", "CB", 22, 80, ["CB", "SB"]), field("cb", "CB", 50, 84, ["CB"]), field("rcb", "CB", 78, 80, ["CB", "SB"]),
      field("lm", "SH", 17, 53, ["SH", "WG", "AM", "CM", "SB"]), field("lcm", "CM", 38, 58, ["CM", "DM", "AM"]), field("rcm", "CM", 62, 58, ["CM", "DM", "AM"]), field("rm", "SH", 83, 53, ["SH", "WG", "AM", "CM", "SB"]),
      field("lw", "WG", 18, 26, ["WG", "SH", "AM", "CF"]), field("st", "CF", 50, 21, ["CF", "AM", "WG"]), field("rw", "WG", 82, 26, ["WG", "SH", "AM", "CF"]),
    ],
  },
  {
    id: "3-5-2",
    label: "3-5-2",
    description: "厚い中盤",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]), field("lcb", "CB", 22, 80, ["CB", "SB"]), field("cb", "CB", 50, 84, ["CB"]), field("rcb", "CB", 78, 80, ["CB", "SB"]),
      field("lwb", "SB", 12, 54, ["SB", "WG", "SH"]), field("lcm", "CM", 33, 57, ["CM", "DM", "AM"]), field("dm", "DM", 50, 63, ["DM", "CM", "CB"]), field("rcm", "CM", 67, 57, ["CM", "DM", "AM"]), field("rwb", "SB", 88, 54, ["SB", "WG", "SH"]),
      field("lst", "CF", 38, 25, ["CF", "AM", "WG"]), field("rst", "CF", 62, 25, ["CF", "AM", "WG"]),
    ],
  },
  {
    id: "3-6-1",
    label: "3-6-1",
    description: "中盤の数的優位",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]), field("lcb", "CB", 22, 80, ["CB", "SB"]), field("cb", "CB", 50, 84, ["CB"]), field("rcb", "CB", 78, 80, ["CB", "SB"]),
      field("lwb", "SB", 9, 62, ["SB", "WG", "SH"]), field("lm", "SH", 24, 45, ["SH", "WG", "AM", "CM"]), field("lcm", "CM", 39, 60, ["CM", "DM", "AM"]), field("rcm", "CM", 61, 60, ["CM", "DM", "AM"]), field("rm", "SH", 76, 45, ["SH", "WG", "AM", "CM"]), field("rwb", "SB", 91, 62, ["SB", "WG", "SH"]),
      field("st", "CF", 50, 20, ["CF", "AM", "WG"]),
    ],
  },
  {
    id: "5-4-1",
    label: "5-4-1",
    description: "守備ブロック",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]), field("lwb", "SB", 10, 69, ["SB", "WG", "SH"]), field("lcb", "CB", 30, 80, ["CB", "SB"]), field("cb", "CB", 50, 83, ["CB"]), field("rcb", "CB", 70, 80, ["CB", "SB"]), field("rwb", "SB", 90, 69, ["SB", "WG", "SH"]),
      field("lm", "SH", 17, 51, ["SH", "WG", "AM", "CM"]), field("lcm", "CM", 39, 57, ["CM", "DM", "AM"]), field("rcm", "CM", 61, 57, ["CM", "DM", "AM"]), field("rm", "SH", 83, 51, ["SH", "WG", "AM", "CM"]),
      field("st", "CF", 50, 23, ["CF", "AM", "WG"]),
    ],
  },
  {
    id: "5-3-2",
    label: "5-3-2",
    description: "堅守速攻",
    slots: [
      field("gk", "GK", 50, 91, ["GK"]), field("lwb", "SB", 10, 69, ["SB", "WG", "SH"]), field("lcb", "CB", 30, 80, ["CB", "SB"]), field("cb", "CB", 50, 83, ["CB"]), field("rcb", "CB", 70, 80, ["CB", "SB"]), field("rwb", "SB", 90, 69, ["SB", "WG", "SH"]),
      field("lcm", "CM", 28, 55, ["CM", "DM", "AM"]), field("cm", "DM", 50, 60, ["DM", "CM"]), field("rcm", "CM", 72, 55, ["CM", "DM", "AM"]), field("lst", "CF", 38, 25, ["CF", "AM", "WG"]), field("rst", "CF", 62, 25, ["CF", "AM", "WG"]),
    ],
  },
];

export const players: Player[] = [
  { id: "p1", name: "相良 遥斗", position: "CF", secondary: "WG", cfPlayStyle: "runner", attack: 72, dribble: 69, pass: 55, shoot: 78, defense: 25, tackle: 22, block: 20, interception: 27, fatigue: 8, age: 22, salary: 18000000, level: 4, ceiling: 8, chemistry: "spark" },
  { id: "p2", name: "御影 蓮", position: "CF", secondary: "AM", cfPlayStyle: "false-nine", attack: 68, dribble: 62, pass: 61, shoot: 74, defense: 33, tackle: 29, block: 28, interception: 39, fatigue: 5, age: 25, salary: 14000000, level: 4, ceiling: 6, chemistry: "steady" },
  { id: "p3", name: "山城 蒼", position: "WG", secondary: "AM", wgPlayStyle: "inverted", amPlayStyle: "shadow-striker", attack: 64, dribble: 75, pass: 60, shoot: 58, defense: 38, tackle: 35, block: 30, interception: 46, fatigue: 12, age: 21, salary: 7200000, level: 3, ceiling: 9, chemistry: "spark" },
  { id: "p4", name: "栗原 湊", position: "WG", secondary: "CF", cfPlayStyle: "target", wgPlayStyle: "wide-worker", attack: 61, dribble: 71, pass: 54, shoot: 59, defense: 34, tackle: 31, block: 27, interception: 43, fatigue: 3, age: 20, salary: 4800000, level: 3, ceiling: 9, chemistry: "edge" },
  { id: "p5", name: "鳴海 晴", position: "AM", secondary: "CM", amPlayStyle: "playmaker", attack: 67, dribble: 66, pass: 73, shoot: 63, defense: 48, tackle: 42, block: 39, interception: 57, fatigue: 9, age: 24, salary: 12000000, level: 4, ceiling: 7, chemistry: "spark" },
  { id: "p6", name: "八雲 琉生", position: "CM", secondary: "DM", cmPlayStyle: "box-to-box", dmPlayStyle: "anchor", attack: 58, dribble: 57, pass: 69, shoot: 50, defense: 62, tackle: 60, block: 55, interception: 70, fatigue: 6, age: 26, salary: 10200000, level: 4, ceiling: 6, chemistry: "steady" },
  { id: "p7", name: "朝倉 悠真", position: "CM", secondary: "AM", cmPlayStyle: "mezzala", attack: 62, dribble: 63, pass: 68, shoot: 56, defense: 54, tackle: 49, block: 45, interception: 63, fatigue: 10, age: 23, salary: 8400000, level: 3, ceiling: 8, chemistry: "spark" },
  { id: "p8", name: "新田 迅", position: "DM", secondary: "CB", dmPlayStyle: "destroyer", attack: 48, dribble: 45, pass: 57, shoot: 38, defense: 69, tackle: 72, block: 67, interception: 75, fatigue: 4, age: 28, salary: 11000000, level: 5, ceiling: 6, chemistry: "steady" },
  { id: "p9", name: "安西 颯", position: "SB", secondary: "WG", sbPlayStyle: "overlap", attack: 50, dribble: 61, pass: 55, shoot: 42, defense: 65, tackle: 66, block: 58, interception: 70, fatigue: 8, age: 22, salary: 6800000, level: 3, ceiling: 8, chemistry: "edge" },
  { id: "p10", name: "黒川 岳", position: "SB", secondary: "CB", sbPlayStyle: "defensive-fullback", cbPlayStyle: "cover", attack: 46, dribble: 48, pass: 52, shoot: 35, defense: 68, tackle: 71, block: 66, interception: 69, fatigue: 2, age: 27, salary: 9000000, level: 4, ceiling: 6, chemistry: "steady" },
  { id: "p11", name: "冬木 海", position: "CB", secondary: "SB", cbPlayStyle: "ball-playing", sbPlayStyle: "defensive-fullback", attack: 38, dribble: 40, pass: 47, shoot: 34, defense: 73, tackle: 74, block: 78, interception: 69, fatigue: 11, age: 25, salary: 13000000, level: 5, ceiling: 7, chemistry: "spark" },
  { id: "p12", name: "七瀬 陸", position: "CB", cbPlayStyle: "cover", attack: 33, dribble: 41, pass: 43, shoot: 29, defense: 70, tackle: 68, block: 74, interception: 68, fatigue: 3, age: 21, salary: 5600000, level: 3, ceiling: 8, chemistry: "edge" },
  { id: "p13", name: "柏木 篤", position: "GK", gkPlayStyle: "sweeper-keeper", gk: 76, attack: 15, dribble: 15, pass: 43, shoot: 9, defense: 21, tackle: 16, block: 25, interception: 31, fatigue: 6, age: 29, salary: 16000000, level: 6, ceiling: 7, chemistry: "steady" },
  { id: "p14", name: "砂川 司", position: "GK", gkPlayStyle: "shot-stopper", gk: 66, attack: 13, dribble: 14, pass: 38, shoot: 8, defense: 19, tackle: 15, block: 23, interception: 28, fatigue: 0, age: 20, salary: 3600000, level: 2, ceiling: 9, chemistry: "spark" },
  { id: "p15", name: "坂口 叶", position: "CM", secondary: "DM", cmPlayStyle: "deep-playmaker", dmPlayStyle: "regista", attack: 54, dribble: 55, pass: 66, shoot: 48, defense: 60, tackle: 55, block: 58, interception: 66, fatigue: 7, age: 19, salary: 3200000, level: 2, ceiling: 10, chemistry: "spark" },
  { id: "p16", name: "神谷 奏", position: "CB", secondary: "DM", dmPlayStyle: "anchor", cbPlayStyle: "stopper", attack: 41, dribble: 44, pass: 48, shoot: 35, defense: 64, tackle: 66, block: 69, interception: 60, fatigue: 1, age: 24, salary: 6200000, level: 3, ceiling: 7, chemistry: "edge" },
  { id: "p17", name: "沢渡 駿", position: "SB", secondary: "CB", sbPlayStyle: "inverted-fullback", cbPlayStyle: "cover", attack: 44, dribble: 52, pass: 58, shoot: 32, defense: 62, tackle: 64, block: 56, interception: 65, fatigue: 4, age: 20, salary: 4400000, level: 2, ceiling: 9, chemistry: "steady" },
  { id: "p18", name: "桐生 玲", position: "DM", secondary: "CM", dmPlayStyle: "regista", cmPlayStyle: "deep-playmaker", attack: 47, dribble: 49, pass: 63, shoot: 38, defense: 61, tackle: 59, block: 55, interception: 67, fatigue: 6, age: 22, salary: 5800000, level: 3, ceiling: 8, chemistry: "edge" },
  { id: "p19", name: "白瀬 透", position: "SH", secondary: "WG", wgPlayStyle: "touchline", attack: 59, dribble: 64, pass: 62, shoot: 54, defense: 42, tackle: 39, block: 34, interception: 51, fatigue: 5, age: 21, salary: 5400000, level: 3, ceiling: 9, chemistry: "spark" },
  { id: "p20", name: "三好 湊", position: "CF", secondary: "WG", cfPlayStyle: "target", wgPlayStyle: "wide-worker", attack: 57, dribble: 55, pass: 49, shoot: 64, defense: 31, tackle: 27, block: 25, interception: 34, fatigue: 3, age: 19, salary: 3600000, level: 2, ceiling: 10, chemistry: "steady" },
];

const openingPlayerSkills: Record<string, PlayerSkillId[]> = {
  p1: ["finisher"], p2: ["linkman"], p3: ["cut-in"], p4: ["cross-master"], p5: ["vision"], p6: ["engine"], p7: ["switcher"], p8: ["ball-hunter"], p9: ["overlap"], p10: ["duel-master"],
  p11: ["aerial-wall"], p12: ["interceptor"], p13: ["sweeper"], p14: ["one-on-one"], p15: ["tempo-controller"], p16: ["recovery-run"], p17: ["overlap"], p18: ["regista-scan"], p19: ["touchline-drive"], p20: ["aerial-target"],
};
players.forEach((player) => { player.skills = openingPlayerSkills[player.id] ?? []; });

export const opponentSeeds: ClubSeed[] = [
  { id: "aurora", name: "オーロラ横浜", rating: 72, color: "#6fd7ff", form: "勢いに乗る上位候補" },
  { id: "volta", name: "ヴォルタ名古屋", rating: 66, color: "#ffd84a", form: "パスワークに定評" },
  { id: "ember", name: "エンバー大阪", rating: 69, color: "#ff744a", form: "攻撃陣が好調" },
  { id: "crest", name: "クレスト札幌", rating: 63, color: "#f1f4ff", form: "守備が堅い" },
  { id: "azul", name: "アズール福岡", rating: 60, color: "#4c82ff", form: "若手が台頭" },
  { id: "serein", name: "セレイン神戸", rating: 65, color: "#b67dff", form: "中盤を支配" },
  { id: "rivet", name: "リベット仙台", rating: 58, color: "#afc7d4", form: "反撃の足場を築く" },
  { id: "sol", name: "ソル広島", rating: 62, color: "#ffba59", form: "ホームで強い" },
  { id: "bloom", name: "ブルーム金沢", rating: 56, color: "#fa8ec2", form: "昇格を狙う" },
  { id: "vector", name: "ベクター千葉", rating: 59, color: "#69e0b3", form: "走力で勝負" },
  { id: "nox", name: "ノクス京都", rating: 67, color: "#8792b9", form: "経験豊富な布陣" },
  { id: "forge", name: "フォージ埼玉", rating: 57, color: "#b87842", form: "粘り強い守備" },
  { id: "pulse", name: "パルス静岡", rating: 61, color: "#ff637d", form: "好調の連勝中" },
  { id: "aero", name: "エアロ新潟", rating: 55, color: "#65d8e8", form: "カウンターが武器" },
  { id: "wells", name: "ウェルズ岡山", rating: 54, color: "#98c47d", form: "堅実に勝点を積む" },
  { id: "arc", name: "アーク熊本", rating: 53, color: "#d0a5ff", form: "新戦術を試す" },
  { id: "lumen", name: "ルーメン松本", rating: 52, color: "#bcd4ff", form: "粘りを見せる" },
  { id: "sable", name: "セイブル徳島", rating: 50, color: "#8f9e8c", form: "守備再建中" },
  { id: "tide", name: "タイド鹿児島", rating: 49, color: "#63b8c3", form: "残留を目指す" },
];

export const opponentTactics: Record<string, OpponentTacticalPlan> = {
  aurora: { formationId: "4-3-3", mentality: "attacking", playingStyle: "possession", cohesion: 84, attackBias: 2, defenseBias: 1, trait: "可変ポゼッション", note: "偽9番を起点に、両翼が内側へ入り込む保持型。", roles: [{ position: "CF", role: "偽9番" }, { position: "WG", role: "インサイド・ウイング" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "DM", role: "アンカー" }, { position: "CB", role: "ビルドアップCB" }, { position: "GK", role: "スイーパーGK" }] },
  volta: { formationId: "4-5-1", mentality: "balanced", playingStyle: "possession", cohesion: 81, attackBias: 0, defenseBias: 2, trait: "中盤循環", note: "五枚の中盤が短いパスをつなぎ、相手を動かして前進する。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "SH", role: "インサイド・ウイング" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "DM", role: "レジスタ" }, { position: "SB", role: "インバートSB" }, { position: "GK", role: "配球GK" }] },
  ember: { formationId: "3-4-3", mentality: "attacking", playingStyle: "direct", cohesion: 76, attackBias: 4, defenseBias: -1, trait: "三枚の速攻", note: "前線三枚の走力を使い、奪取直後に背後を狙う。", roles: [{ position: "CF", role: "裏抜け" }, { position: "WG", role: "タッチライン・ウイング" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "メッツァーラ" }, { position: "CB", role: "ストッパー" }, { position: "GK", role: "スイーパーGK" }] },
  crest: { formationId: "5-4-1", mentality: "defensive", playingStyle: "press", cohesion: 80, attackBias: -2, defenseBias: 5, trait: "低い守備ブロック", note: "五枚の最終ラインと帰陣するサイドで危険地帯を消す。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "SB", role: "守備的SB" }, { position: "CB", role: "カバー" }, { position: "GK", role: "ショットストッパー" }] },
  azul: { formationId: "4-3-3", mentality: "attacking", playingStyle: "press", cohesion: 73, attackBias: 2, defenseBias: 0, trait: "若手の前進圧力", note: "若い前線が走り続け、敵陣で奪い返す。", roles: [{ position: "CF", role: "裏抜け" }, { position: "WG", role: "ワイド・ワーカー" }, { position: "CM", role: "メッツァーラ" }, { position: "DM", role: "デストロイヤー" }, { position: "CB", role: "ストッパー" }, { position: "GK", role: "スイーパーGK" }] },
  serein: { formationId: "3-6-1", mentality: "balanced", playingStyle: "press", cohesion: 85, attackBias: 1, defenseBias: 4, trait: "六枚の中盤封鎖", note: "両翼を含む六枚の中盤が距離を詰め、中央で回収する。", roles: [{ position: "CF", role: "偽9番" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "SB", role: "インバートSB" }, { position: "CB", role: "カバー" }, { position: "GK", role: "スイーパーGK" }] },
  rivet: { formationId: "5-3-2", mentality: "defensive", playingStyle: "direct", cohesion: 70, attackBias: -1, defenseBias: 3, trait: "堅守二枚残し", note: "守備時は五枚で閉じ、二人のCFへ素早く預ける。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "DM", role: "アンカー" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "SB", role: "守備的SB" }, { position: "CB", role: "カバー" }, { position: "GK", role: "ショットストッパー" }] },
  sol: { formationId: "4-4-2", mentality: "attacking", playingStyle: "direct", cohesion: 78, attackBias: 3, defenseBias: 0, trait: "ホームの両翼", note: "サイドの推進力と二トップの距離で、早いクロスを狙う。", roles: [{ position: "CF", role: "裏抜け" }, { position: "SH", role: "タッチライン・ウイング" }, { position: "CM", role: "メッツァーラ" }, { position: "SB", role: "オーバーラップ" }, { position: "CB", role: "ストッパー" }, { position: "GK", role: "ショットストッパー" }] },
  bloom: { formationId: "4-3-3", mentality: "balanced", playingStyle: "possession", cohesion: 74, attackBias: 1, defenseBias: 0, trait: "成長型の保持", note: "若手の技術を生かし、中央と両翼を行き来する。", roles: [{ position: "CF", role: "偽9番" }, { position: "WG", role: "インサイド・ウイング" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "DM", role: "レジスタ" }, { position: "CB", role: "ビルドアップCB" }, { position: "GK", role: "配球GK" }] },
  vector: { formationId: "3-4-3", mentality: "attacking", playingStyle: "press", cohesion: 77, attackBias: 2, defenseBias: 1, trait: "走力プレス", note: "前線から走力で追い込み、再奪取で試合を速くする。", roles: [{ position: "CF", role: "裏抜け" }, { position: "WG", role: "ワイド・ワーカー" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "CB", role: "ストッパー" }, { position: "GK", role: "スイーパーGK" }] },
  nox: { formationId: "5-3-2", mentality: "defensive", playingStyle: "possession", cohesion: 83, attackBias: 0, defenseBias: 4, trait: "経験者の循環", note: "五枚の後方基盤から、経験ある中盤がゲームを整える。", roles: [{ position: "CF", role: "偽9番" }, { position: "DM", role: "レジスタ" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "SB", role: "インバートSB" }, { position: "CB", role: "ビルドアップCB" }, { position: "GK", role: "配球GK" }] },
  forge: { formationId: "5-4-1", mentality: "defensive", playingStyle: "press", cohesion: 76, attackBias: -2, defenseBias: 4, trait: "鍛造ブロック", note: "粘り強く耐え、奪った後はCFへ確実につなぐ。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "SB", role: "守備的SB" }, { position: "CB", role: "カバー" }, { position: "GK", role: "ショットストッパー" }] },
  pulse: { formationId: "4-3-3", mentality: "attacking", playingStyle: "press", cohesion: 82, attackBias: 3, defenseBias: 0, trait: "連勝の前圧", note: "前線のプレス強度を維持し、勢いをスコアへ変える。", roles: [{ position: "CF", role: "裏抜け" }, { position: "WG", role: "インサイド・ウイング" }, { position: "CM", role: "メッツァーラ" }, { position: "DM", role: "デストロイヤー" }, { position: "CB", role: "ストッパー" }, { position: "GK", role: "スイーパーGK" }] },
  aero: { formationId: "4-4-2", mentality: "balanced", playingStyle: "direct", cohesion: 72, attackBias: 2, defenseBias: -1, trait: "風のカウンター", note: "奪取後の一手目を速くし、二トップの背後へ送る。", roles: [{ position: "CF", role: "裏抜け" }, { position: "SH", role: "タッチライン・ウイング" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "SB", role: "オーバーラップ" }, { position: "CB", role: "カバー" }, { position: "GK", role: "ショットストッパー" }] },
  wells: { formationId: "4-5-1", mentality: "defensive", playingStyle: "possession", cohesion: 79, attackBias: -1, defenseBias: 3, trait: "勝点管理", note: "人数をかけた中盤で試合を落ち着かせ、確実に勝点を拾う。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "DM", role: "アンカー" }, { position: "SB", role: "守備的SB" }, { position: "GK", role: "配球GK" }] },
  arc: { formationId: "3-5-2", mentality: "attacking", playingStyle: "possession", cohesion: 71, attackBias: 2, defenseBias: 0, trait: "実験的な可変", note: "中盤を起点に、役割の入れ替わりで前進の形を探す。", roles: [{ position: "CF", role: "偽9番" }, { position: "DM", role: "レジスタ" }, { position: "CM", role: "メッツァーラ" }, { position: "SB", role: "インバートSB" }, { position: "CB", role: "ビルドアップCB" }, { position: "GK", role: "配球GK" }] },
  lumen: { formationId: "4-4-2", mentality: "balanced", playingStyle: "press", cohesion: 75, attackBias: 0, defenseBias: 1, trait: "粘る二列", note: "二列の距離を保ち、局面ごとに前へ出て回収する。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "SB", role: "守備的SB" }, { position: "CB", role: "ストッパー" }, { position: "GK", role: "スイーパーGK" }] },
  sable: { formationId: "5-4-1", mentality: "defensive", playingStyle: "direct", cohesion: 68, attackBias: -2, defenseBias: 2, trait: "再建の堅守", note: "まず失点を減らし、前線の収めから反撃へ移る。", roles: [{ position: "CF", role: "ターゲットマン" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ディープ・プレーメーカー" }, { position: "SB", role: "守備的SB" }, { position: "CB", role: "カバー" }, { position: "GK", role: "ショットストッパー" }] },
  tide: { formationId: "4-5-1", mentality: "defensive", playingStyle: "press", cohesion: 69, attackBias: -1, defenseBias: 2, trait: "残留プレス", note: "中盤からの粘り強いプレスで試合を五分へ引き戻す。", roles: [{ position: "CF", role: "裏抜け" }, { position: "SH", role: "ワイド・ワーカー" }, { position: "CM", role: "ボックス・トゥ・ボックス" }, { position: "DM", role: "デストロイヤー" }, { position: "SB", role: "守備的SB" }, { position: "GK", role: "ショットストッパー" }] },
};

const opponentSurnamePool = [
  "神楽", "相沢", "一ノ瀬", "結城", "真壁", "榊", "高遠", "柊", "秋月", "久世", "鷹野", "白鳥",
  "桐谷", "小野寺", "成瀬", "日向", "水城", "早瀬", "如月", "御堂", "深見", "遠野", "橘", "朝霧",
  "綾部", "泉", "五十嵐", "宇佐美", "江波", "大槻", "梶原", "片瀬", "金森", "川嶋", "木戸", "北見",
  "桐原", "国枝", "黒瀬", "小松", "佐伯", "笹原", "篠宮", "白川", "杉浦", "瀬尾", "高城", "立花",
  "月岡", "鶴見", "寺島", "時任", "永瀬", "長峰", "西園", "野々村", "羽鳥", "早川", "樋口", "福井",
  "古川", "星野", "本多", "牧野", "松波", "水上", "三田", "宮坂", "村瀬", "望月", "森下", "八代",
];
const opponentGivenPool = [
  "蓮", "蒼", "隼", "誠", "湊", "陸", "悠", "晴", "樹", "颯太", "迅", "律",
  "海斗", "陽", "凪", "翔", "叶", "弦", "仁", "透", "岳", "澪", "圭", "奏",
  "颯真", "結人", "瑛太", "朔", "蒼士", "伊織", "蒼介", "紬", "直哉", "瑛", "景", "柊真",
  "悠斗", "匠", "怜", "理人", "遼", "朔也", "壮真", "大和", "千隼", "拓海", "知己", "冬真",
  "尚輝", "颯介", "創", "大翔", "晴也", "光希", "湊斗", "優斗", "悠生", "理玖", "琉真", "怜司",
  "颯人", "雄大", "結翔", "龍之介", "蓮斗", "和真", "侑真", "凌", "律希", "瑛人", "奏太", "遥斗",
];
const fallbackOpponentRole: Record<Position, string> = { GK: "ショットストッパー", CB: "カバー", SB: "守備的SB", DM: "アンカー", CM: "ボックス・トゥ・ボックス", AM: "ゲームメーカー", SH: "ワイド・ワーカー", WG: "タッチライン・ウイング", CF: "ターゲットマン" };
const opponentValue = (value: number) => Math.max(12, Math.min(94, Math.round(value)));
const opponentPositionModifier: Record<Position, { attack: number; defense: number }> = { GK: { attack: -52, defense: 1 }, CB: { attack: -10, defense: 6 }, SB: { attack: -5, defense: 4 }, DM: { attack: -2, defense: 5 }, CM: { attack: 1, defense: 1 }, AM: { attack: 5, defense: -4 }, SH: { attack: 4, defense: -1 }, WG: { attack: 6, defense: -4 }, CF: { attack: 8, defense: -10 } };

const opponentSkillFor = (position: Position, role: string): PlayerSkillId => {
  if (position === "GK") return role === "スイーパーGK" ? "sweeper" : "one-on-one";
  if (position === "CF") return role === "偽9番" ? "linkman" : role === "裏抜け" ? "finisher" : "aerial-target";
  if (position === "WG" || position === "SH") return role.includes("インサイド") ? "cut-in" : role.includes("タッチライン") ? "touchline-drive" : "cross-master";
  if (position === "AM") return "vision";
  if (position === "CM") return role.includes("メッツァーラ") ? "engine" : role.includes("プレーメーカー") ? "switcher" : "tempo-controller";
  if (position === "DM") return role === "デストロイヤー" ? "ball-hunter" : role === "レジスタ" ? "regista-scan" : "interceptor";
  if (position === "SB") return role === "オーバーラップ" ? "overlap" : role === "インバートSB" ? "recovery-run" : "duel-master";
  return role === "ストッパー" ? "duel-master" : role === "ビルドアップCB" ? "recovery-run" : "aerial-wall";
};

export function opponentSquadFor(clubId: string): OpponentPlayer[] {
  const clubIndex = Math.max(0, opponentSeeds.findIndex((club) => club.id === clubId));
  const club = opponentSeeds[clubIndex] ?? opponentSeeds[0];
  const plan = opponentTactics[club.id] ?? opponentTactics.aurora;
  const formation = formations.find((item) => item.id === plan.formationId) ?? formations[1];
  return formation.slots.map((slot, index) => {
    const position = slot.label;
    const variance = (clubIndex * 5 + index * 7) % 9 - 4;
    const profile = opponentPositionModifier[position];
    const role = plan.roles.find((item) => item.position === position)?.role ?? fallbackOpponentRole[position];
    const serial = clubIndex * formation.slots.length + index;
    const surnameIndex = (serial * 17 + 9) % opponentSurnamePool.length;
    const givenIndex = (serial * 31 + Math.floor(serial / opponentSurnamePool.length) * 13 + 22) % opponentGivenPool.length;
    const attack = opponentValue(club.rating + profile.attack + plan.attackBias + variance);
    const defense = opponentValue(club.rating + profile.defense + plan.defenseBias - variance);
    return { id: `${club.id}-${slot.id}`, name: `${opponentSurnamePool[surnameIndex]} ${opponentGivenPool[givenIndex]}`, position, role, attack, defense, pass: opponentValue((attack + defense) / 2 + (role.includes("プレーメーカー") || role === "レジスタ" ? 7 : 0)), tackle: opponentValue(defense + (role === "デストロイヤー" || role === "ストッパー" ? 4 : 0)), interception: opponentValue(defense + (role === "アンカー" || role === "カバー" ? 4 : 0)), gk: position === "GK" ? opponentValue(club.rating + 7 + plan.defenseBias + variance) : undefined, skills: [opponentSkillFor(position, role)] };
  });
}

export const marketRecruits: Player[] = [
  { id: "r1", name: "東雲 レイ", position: "SH", secondary: "AM", wgPlayStyle: "inverted", amPlayStyle: "playmaker", attack: 74, dribble: 76, pass: 78, shoot: 70, defense: 44, tackle: 37, block: 41, interception: 53, fatigue: 0, age: 20, salary: 22000000, contractYears: 3, level: 5, ceiling: 10, chemistry: "spark" },
  { id: "r2", name: "篠崎 深", position: "CB", secondary: "SB", cbPlayStyle: "ball-playing", sbPlayStyle: "inverted-fullback", attack: 46, dribble: 48, pass: 61, shoot: 34, defense: 76, tackle: 77, block: 80, interception: 72, fatigue: 0, age: 25, salary: 15400000, contractYears: 3, level: 5, ceiling: 7, chemistry: "steady" },
  { id: "r3", name: "皆本 律", position: "GK", gkPlayStyle: "distributor", gk: 73, attack: 17, dribble: 18, pass: 55, shoot: 10, defense: 25, tackle: 18, block: 29, interception: 37, fatigue: 0, age: 21, salary: 9200000, contractYears: 3, level: 4, ceiling: 9, chemistry: "edge" },
  { id: "r4", name: "志摩 湊", position: "CF", secondary: "WG", cfPlayStyle: "runner", attack: 71, dribble: 74, pass: 58, shoot: 76, defense: 31, tackle: 27, block: 24, interception: 35, fatigue: 0, age: 19, salary: 11800000, contractYears: 3, level: 4, ceiling: 10, chemistry: "spark" },
  { id: "r5", name: "本多 朔", position: "DM", secondary: "CB", dmPlayStyle: "anchor", cbPlayStyle: "stopper", attack: 48, dribble: 50, pass: 69, shoot: 41, defense: 72, tackle: 74, block: 70, interception: 76, fatigue: 0, age: 24, salary: 16800000, contractYears: 3, level: 5, ceiling: 8, chemistry: "steady" },
  { id: "r6", name: "日向 透", position: "CM", secondary: "DM", cmPlayStyle: "box-to-box", dmPlayStyle: "regista", attack: 65, dribble: 67, pass: 74, shoot: 58, defense: 63, tackle: 61, block: 55, interception: 64, fatigue: 0, age: 23, salary: 17600000, contractYears: 3, level: 5, ceiling: 9, chemistry: "edge" },
  { id: "r7", name: "天城 陸", position: "AM", secondary: "SH", amPlayStyle: "playmaker", wgPlayStyle: "touchline", attack: 72, dribble: 73, pass: 79, shoot: 64, defense: 39, tackle: 34, block: 31, interception: 48, fatigue: 0, age: 22, salary: 21400000, contractYears: 3, level: 5, ceiling: 9, chemistry: "spark" },
  { id: "r8", name: "有沢 航", position: "SB", secondary: "SH", sbPlayStyle: "overlap", wgPlayStyle: "wide-worker", attack: 59, dribble: 63, pass: 68, shoot: 45, defense: 67, tackle: 69, block: 60, interception: 62, fatigue: 0, age: 22, salary: 13900000, contractYears: 3, level: 4, ceiling: 9, chemistry: "spark" },
  { id: "r9", name: "鷹野 玲", position: "WG", secondary: "CF", wgPlayStyle: "inverted", cfPlayStyle: "false-nine", attack: 75, dribble: 81, pass: 66, shoot: 72, defense: 34, tackle: 30, block: 27, interception: 38, fatigue: 0, age: 20, salary: 19800000, contractYears: 3, level: 5, ceiling: 10, chemistry: "edge" },
];

export const recruit = marketRecruits[0];

export const youthProspects: Player[] = [
  { id: "y1", name: "水瀬 湊", position: "CF", secondary: "WG", cfPlayStyle: "runner", attack: 48, dribble: 52, pass: 42, shoot: 55, defense: 26, tackle: 22, block: 19, interception: 29, fatigue: 0, age: 17, salary: 1800000, contractYears: 3, level: 1, ceiling: 9, chemistry: "spark", skills: ["finisher"], skillXp: { finisher: 18, "aerial-target": 32 }, skillTrainingTarget: "aerial-target", youthSkillTendency: { archetype: "ゴール前の嗅覚", headline: "フィニッシュの土台を持つ裏抜け型", primarySkill: "finisher", developmentSkill: "aerial-target", recommendedFocus: "finishing", growthPace: "早熟", coachNote: "まずフィニッシュでポストプレーを100 XPへ。CFの幅を増やしてから、WG起用も検討する。" } },
  { id: "y2", name: "高瀬 澪", position: "CM", secondary: "AM", amPlayStyle: "playmaker", attack: 46, dribble: 50, pass: 58, shoot: 41, defense: 44, tackle: 39, block: 34, interception: 51, fatigue: 0, age: 16, salary: 1600000, contractYears: 3, level: 1, ceiling: 10, chemistry: "edge", skills: ["switcher"], skillXp: { switcher: 14, "tempo-controller": 38 }, skillTrainingTarget: "tempo-controller", youthSkillTendency: { archetype: "展開の設計者", headline: "逆サイドを使える配球型の中盤", primarySkill: "switcher", developmentSkill: "tempo-controller", recommendedFocus: "passing", growthPace: "じっくり", coachNote: "パス＆組立を継続してテンポ支配を100 XPへ。先にCMで育て、後からAMの創造性を足す。" } },
  { id: "y3", name: "榊 晴也", position: "CB", secondary: "DM", attack: 34, dribble: 39, pass: 46, shoot: 28, defense: 56, tackle: 58, block: 61, interception: 53, fatigue: 0, age: 18, salary: 2000000, contractYears: 3, level: 2, ceiling: 8, chemistry: "steady", skills: ["aerial-wall"], skillXp: { "aerial-wall": 22, interceptor: 29 }, skillTrainingTarget: "interceptor", youthSkillTendency: { archetype: "後方の読み", headline: "高さを土台にパスコースを消すCB", primarySkill: "aerial-wall", developmentSkill: "interceptor", recommendedFocus: "defending", growthPace: "標準", coachNote: "守備組織でインターセプトを100 XPへ。CBの強度を固めてからDMの保険として育成する。" } },
];

export const youthIntakes: Player[] = [
  { id: "yi1", name: "有馬 仁", position: "GK", gk: 60, attack: 15, dribble: 18, pass: 49, shoot: 9, defense: 24, tackle: 19, block: 28, interception: 35, fatigue: 0, age: 16, salary: 1500000, contractYears: 3, level: 1, ceiling: 9, chemistry: "steady", skills: ["one-on-one"], skillXp: { "one-on-one": 16, sweeper: 24 }, skillTrainingTarget: "sweeper", youthSkillTendency: { archetype: "反応の守護者", headline: "至近距離に強い将来のGK", primarySkill: "one-on-one", developmentSkill: "sweeper", recommendedFocus: "goalkeeping", growthPace: "標準", coachNote: "GK専門でスイーパー対応を磨き、高い最終ラインを支える選択肢をつくる。" } },
  { id: "yi2", name: "鷺沢 陽", position: "WG", secondary: "CF", cfPlayStyle: "false-nine", wgPlayStyle: "inverted", attack: 51, dribble: 58, pass: 43, shoot: 50, defense: 27, tackle: 23, block: 20, interception: 31, fatigue: 0, age: 17, salary: 1700000, contractYears: 3, level: 1, ceiling: 10, chemistry: "spark", skills: ["cut-in"], skillXp: { "cut-in": 20, finisher: 34 }, skillTrainingTarget: "finisher", youthSkillTendency: { archetype: "内へ切る得点源", headline: "ドリブル起点で得点に近づくWG", primarySkill: "cut-in", developmentSkill: "finisher", recommendedFocus: "finishing", growthPace: "早熟", coachNote: "フィニッシュを優先して決定力を開花させる。WGからCFへ入る起用まで見据える。" } },
  { id: "yi3", name: "宮代 凪", position: "DM", secondary: "CB", attack: 39, dribble: 42, pass: 52, shoot: 29, defense: 58, tackle: 60, block: 54, interception: 61, fatigue: 0, age: 16, salary: 1600000, contractYears: 3, level: 1, ceiling: 9, chemistry: "edge", skills: ["interceptor"], skillXp: { interceptor: 17, "ball-hunter": 27 }, skillTrainingTarget: "ball-hunter", youthSkillTendency: { archetype: "回収の起点", headline: "読みを生かして前向きに奪うDM", primarySkill: "interceptor", developmentSkill: "ball-hunter", recommendedFocus: "defending", growthPace: "じっくり", coachNote: "守備組織でボールハンターを習得。まずDMで鍛え、CBのバックアップへ広げる。" } },
  { id: "yi4", name: "比嘉 樹", position: "SB", secondary: "WG", attack: 47, dribble: 51, pass: 48, shoot: 37, defense: 49, tackle: 53, block: 42, interception: 47, fatigue: 0, age: 17, salary: 1800000, contractYears: 3, level: 1, ceiling: 8, chemistry: "spark", skills: ["overlap"], skillXp: { overlap: 19, "cross-master": 31 }, skillTrainingTarget: "cross-master", youthSkillTendency: { archetype: "上下動するSB", headline: "外側の追い越しで幅をつくるサイド型", primarySkill: "overlap", developmentSkill: "cross-master", recommendedFocus: "passing", growthPace: "標準", coachNote: "パス＆組立でクロス職人を開放し、SH・WGと連動する右左の出口を育てる。" } },
  { id: "yi5", name: "葉山 颯太", position: "AM", secondary: "CM", amPlayStyle: "shadow-striker", attack: 54, dribble: 55, pass: 61, shoot: 43, defense: 33, tackle: 28, block: 25, interception: 40, fatigue: 0, age: 16, salary: 1900000, contractYears: 3, level: 1, ceiling: 10, chemistry: "edge", skills: ["vision"], skillXp: { vision: 21, linkman: 28 }, skillTrainingTarget: "linkman", youthSkillTendency: { archetype: "間の創造者", headline: "ラストパスと前線接続を両立するAM", primarySkill: "vision", developmentSkill: "linkman", recommendedFocus: "passing", growthPace: "じっくり", coachNote: "パス＆組立でリンクマンを開放。AMで判断を磨き、CFとの接続役へ伸ばす。" } },
  { id: "yi6", name: "古賀 侑真", position: "CB", secondary: "SB", attack: 32, dribble: 37, pass: 44, shoot: 22, defense: 60, tackle: 62, block: 64, interception: 56, fatigue: 0, age: 17, salary: 1800000, contractYears: 3, level: 1, ceiling: 8, chemistry: "steady", skills: ["aerial-wall"], skillXp: { "aerial-wall": 24, "duel-master": 35 }, skillTrainingTarget: "duel-master", youthSkillTendency: { archetype: "対空の番人", headline: "空中戦を軸に対人強度を足すCB", primarySkill: "aerial-wall", developmentSkill: "duel-master", recommendedFocus: "defending", growthPace: "標準", coachNote: "守備組織で対人強度を100 XPへ。中央を基準に、SBの守備固めにも備える。" } },
];
