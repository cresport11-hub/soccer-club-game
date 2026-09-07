/**
 * Design system: 「タッチライン戦術室」— game rules remain framework-independent and flow through one state owner.
 * Sponsors fund the season; financial history, matchday commerce, and facility levels evolve through this single state owner.
 */
import { formations, marketRecruits, opponentSeeds, opponentSquadFor, opponentTactics, playerSkillCatalog, playerSkillGrowthFocus, playerSkillsFor, players, recruit, youthIntakes, youthProspects, type AMPlayStyle, type CBPlayStyle, type CFPlayStyle, type CMPlayStyle, type ClubSeed, type DMPlayStyle, type Formation, type GKPlayStyle, type OpponentPlayer, type OpponentTacticalPlan, type Player, type PlayerSkillDefinition, type PlayerSkillId, type SBPlayStyle, type TrainingLoad, type WGPlayStyle, type YouthSkillQuality } from "./data";

export type PageId = "home" | "lineup" | "team" | "stats" | "league" | "training" | "market" | "academy" | "facilities" | "sponsors" | "cup" | "finance";
export type Mentality = "defensive" | "balanced" | "attacking";
export type PlayingStyle = "possession" | "direct" | "press";
export type TrainingFocus = "attacking" | "passing" | "finishing" | "defending" | "goalkeeping" | "recovery";
export type TrainingOption = { id: TrainingFocus; label: string; copy: string; cost: number; accent: "lime" | "blue" | "gold" | "coral" };
export type TrainingLoadOption = { id: TrainingLoad; label: string; shortLabel: string; copy: string; growthAdjustment: number; fatigueAdjustment: number; riskAdjustment: number };
export type CFPlayStyleOption = { id: CFPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type WGPlayStyleOption = { id: WGPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type AMPlayStyleOption = { id: AMPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type CMPlayStyleOption = { id: CMPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type DMPlayStyleOption = { id: DMPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type CBPlayStyleOption = { id: CBPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type SBPlayStyleOption = { id: SBPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type GKPlayStyleOption = { id: GKPlayStyle; label: string; copy: string; attackBonus: number; defenseBonus: number; directBonus: number; possessionBonus: number; pressBonus: number; finishCopy: string };
export type RoleKind = "cf" | "wg" | "am" | "cm" | "dm" | "cb" | "sb" | "gk";
export type RoleStyleOption = CFPlayStyleOption | WGPlayStyleOption | AMPlayStyleOption | CMPlayStyleOption | DMPlayStyleOption | CBPlayStyleOption | SBPlayStyleOption | GKPlayStyleOption;
export type RolePlayStyleFit = { playerId: string; player: string; role: RoleKind; style: string; active: boolean; abilityScore: number; abilityBonus: number; formationBonus: number; attackBoost: number; defenseBoost: number; totalBoost: number; grade: "伸長大" | "伸長" | "標準" | "待機"; reason: string };
export type SideLinkDetail = { side: "左" | "右"; widePlayer: string; widePosition: "SH" | "WG"; wideStyle: string; backPlayer: string; backStyle: string; attackBoost: number; defenseBoost: number; totalBoost: number; grade: "攻撃連動" | "攻守連動" | "守備連動"; reason: string };
export type MidfieldPressDetail = { active: boolean; grade: "一斉奪回" | "中盤封鎖" | "準備中" | "対象外"; midfielders: string[]; fitted: number; ballWinners: number; pressureScore: number; attackBoost: number; defenseBoost: number; totalBoost: number; summary: string; reason: string };
export type PlayerSkillActivation = { playerId: string; player: string; skillId: string; label: string; short: string; description: string; active: boolean; focusValue: number; minimum: number; attackBoost: number; defenseBoost: number; masteryLevel: number; masteryLabel: string; xp: number; reason: string; highlight: string };
export type PlayerSkillProgress = { skillId: PlayerSkillId; label: string; short: string; learned: boolean; canTrain: boolean; target: boolean; xp: number; level: number; levelLabel: string; nextXp: number | null; progress: number; trainingLabels: string[]; reason: string };
export type SkillXpGrant = { playerId: string; player: string; skillId: PlayerSkillId; label: string; xp: number; totalXp: number; levelUp: boolean; learned: boolean; source: "練習" | "試合" | "ユース" };
export type RecruitNegotiation = { candidateId: string; stage: "scouting" | "countered" | "agreed"; openingOffer: number; counterOffer: number; agreedFee: number | null };
export type SaleOffer = { id: string; playerId: string; clubName: string; proposedFee: number; expiresWeek: number };
export type ContractOfferId = "retention" | "balanced" | "ambitious";
export type ContractOffer = { id: ContractOfferId; label: string; copy: string; salaryIncrease: number; winBonus: number; appearanceBonus: number; goalBonus: number; signingRate: number };
export type TrainingHistoryEntry = { week: number; focus: TrainingFocus; label: string; affected: number; changes: string[]; fatigueChange: number };
export type YouthPlayer = Player & { academyWeeks: number };
export type TacticalAssessment = {
  formationLabel: string;
  formationTrait: string;
  formationNote: string;
  mentality: Mentality;
  mentalityLabel: string;
  playingStyle: PlayingStyle;
  playingStyleLabel: string;
  chemistry: number;
  chemistryBonus: number;
  links: number;
  formationAttack: number;
  formationDefense: number;
  mentalityAttack: number;
  mentalityDefense: number;
  styleAttack: number;
  styleDefense: number;
  cfRoleAttack: number;
  cfRoleDefense: number;
  cfRoleSummary: string;
  wgRoleAttack: number;
  wgRoleDefense: number;
  wgRoleSummary: string;
  amRoleAttack: number;
  amRoleDefense: number;
  amRoleSummary: string;
  cmRoleAttack: number;
  cmRoleDefense: number;
  cmRoleSummary: string;
  dmRoleAttack: number;
  dmRoleDefense: number;
  dmRoleSummary: string;
  cbRoleAttack: number;
  cbRoleDefense: number;
  cbRoleSummary: string;
  sbRoleAttack: number;
  sbRoleDefense: number;
  sbRoleSummary: string;
  gkRoleAttack: number;
  gkRoleDefense: number;
  gkRoleSummary: string;
  roleFitAttack: number;
  roleFitDefense: number;
  roleFitSummary: string;
  roleFitDetails: RolePlayStyleFit[];
  sideLinkAttack: number;
  sideLinkDefense: number;
  sideLinkSummary: string;
  sideLinkDetails: SideLinkDetail[];
  midfieldPressAttack: number;
  midfieldPressDefense: number;
  midfieldPressSummary: string;
  midfieldPressReason: string;
  midfieldPressDetail: MidfieldPressDetail;
  skillAttack: number;
  skillDefense: number;
  skillSummary: string;
  skillDetails: PlayerSkillActivation[];
  attackModifier: number;
  defenseModifier: number;
};
export type OpponentTacticalAssessment = { clubId: string; club: string; color: string; formationId: string; formationLabel: string; mentality: Mentality; mentalityLabel: string; playingStyle: PlayingStyle; playingStyleLabel: string; trait: string; note: string; cohesion: number; attack: number; defense: number; total: number; roles: string[]; lineup: OpponentPlayer[]; skillAttack: number; skillDefense: number; skillSummary: string; skillDetails: PlayerSkillActivation[] };
export type TacticalMatchup = { label: string; playerAttackModifier: number; playerDefenseModifier: number; opponentAttackModifier: number; opponentDefenseModifier: number; note: string };
export type ScoutTacticalFit = { score: number; grade: "戦術の核" | "高適合" | "起用可能" | "調整が必要"; formation: number; mentality: number; playingStyle: number; chemistry: number; formationLabel: string; mentalityLabel: string; playingStyleLabel: string; strengths: string[]; concern: string };
export type RecruitmentPriority = { position: Player["position"]; score: number; grade: "最優先" | "高" | "中" | "低"; demand: number; coverage: number; available: number; averagePower: number; injuryCount: number; fatigueRisk: number; contractRisk: number; ageRisk: number; reasons: string[] };
export type MarketCandidateComparison = { player: Player; tacticalFit: ScoutTacticalFit; recruitmentPriority: RecruitmentPriority; openingFee: number; annualImpact: number; status: "閲覧中" | "市場候補" };
export type MarketUpdateNotice = { week: number; candidateIds: string[]; requestedPositions: Player["position"][] };
export type ContractAlert = { player: Player; positionPriority: RecruitmentPriority; renewalFee: number; years: number; urgency: "至急" | "要判断"; note: string };

export type LeagueRow = {
  id: string;
  name: string;
  color: string;
  rating: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  gf: number;
  ga: number;
  pts: number;
};

export type Sponsor = {
  id: string;
  name: string;
  sector: string;
  accent: string;
  upFront: number;
  weeklyIncome: number;
  winBonus: number;
  fameRequired: number;
  copy: string;
};

export type CupFixture = {
  id: string;
  homeId: string;
  awayId: string;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  note?: string;
};

export type CupRound = { name: string; scheduledWeek: number; fixtures: CupFixture[] };
export type CupState = { status: "active" | "eliminated" | "champion"; roundIndex: number; rounds: CupRound[] };
export type GateReceipt = { competition: "リーグ" | "カップ"; isHome: boolean; attendance: number; capacity: number; ticketPrice: number; revenue: number };
export type MerchandiseReceipt = { isHome: boolean; buyers: number; purchaseRate: number; averageSpend: number; revenue: number };
export type MembershipReceipt = { members: number; weeklyFee: number; revenue: number };
export type ConcessionReceipt = { isHome: boolean; level: number; customers: number; purchaseRate: number; averageSpend: number; capacity: number; revenue: number };
export type ConcessionFacility = { level: number; name: string; capacity: number; purchaseBonus: number; spendBonus: number; nextCost: number | null; nextName: string | null };
export type ScoutFacility = { level: number; name: string; ratingBoost: number; ceilingBoost: number; youthQuality: YouthSkillQuality; youthInitialXpBonus: number; youthSessionXpBonus: number; youthPaceStep: number; youthQualityNote: string; nextCost: number | null; nextName: string | null; note: string };
export type ScoutStaff = { id: string; name: string; region: string; specialtyPosition: Player["position"]; specialtyLabel: string; specialtySkill: PlayerSkillId; profile: string; note: string; entryXpBonus: number; sessionXpBonus: number };
export type TrainingFacility = { level: number; name: string; weeklySlots: number; growthBonus: number; riskReduction: number; nextCost: number | null; nextName: string | null; note: string };
export type TrainingRecommendation = { focus: TrainingFocus; label: string; grade: "回復優先" | "調整推奨" | "実施可"; averageFatigue: number; highFatiguePlayers: number; highLoadPlayers: number; injuryCount: number; reason: string };
export type TrainingRiskReport = { chance: number; grade: "低" | "注意" | "高"; atRiskNames: string[]; highLoadNames: string[]; note: string };
export type FinanceCategory = "繰越資金" | "試合賞金" | "スポンサー" | "入場料" | "グッズ" | "会員費" | "売店・飲食" | "移籍" | "トレーニング" | "年俸" | "契約更新" | "出来高" | "施設投資" | "育成" | "シーズン報奨金";
export type FinanceEntry = { week: number; label: string; category: FinanceCategory; amount: number; kind: "income" | "expense"; note: string };
export type FinancialSummary = { cash: number; incomeTotal: number; expenseTotal: number; net: number; currentWeekIncome: number; currentWeekExpense: number; incomeBreakdown: Array<{ category: FinanceCategory; amount: number }>; expenseBreakdown: Array<{ category: FinanceCategory; amount: number }>; recentEntries: FinanceEntry[]; cashTrail: number[] };
export type CupMatchResult = { round: string; opponent: string; playerGoals: number; opponentGoals: number; won: boolean; reward: number; note: string; gate: GateReceipt; merchandise: MerchandiseReceipt; concession: ConcessionReceipt; popularityDelta: number };
export type MatchSubstitution = { outPlayer: string; inPlayer: string; outPlayerId: string; inPlayerId: string; slotId: string };
export type MatchInjury = { playerId: string; player: string; minute: number; weeks: number; detail: string };
export type PlayerMatchRating = { playerId: string; player: string; position: string; rating: number; goals: number; assists: number; started: boolean; subbedOn: boolean; injured: boolean; note: string };
export type RecentMatchForm = { outcome: "W" | "D" | "L"; margin: number; competition: "リーグ" | "カップ" };
export type TeamMatchCondition = { isHome: boolean; morale: number; moraleLabel: string; moraleAttack: number; moraleDefense: number; momentum: number; momentumLabel: string; momentumAttack: number; momentumDefense: number; homeAttack: number; homeDefense: number; opponentHomeAttack: number; opponentHomeDefense: number; form: RecentMatchForm[]; summary: string; reason: string };
export type MarkDuelReport = { playerId: string; player: string; position: string; opponent: string; opponentPosition: string; opponentRole: string; outcome: "勝利" | "拮抗" | "苦戦"; differential: number; engagements: number; activity: number; activityGrade: "躍動" | "貢献" | "粘戦" | "苦戦"; rating: number; summary: string };
export type MarkingMatchImpact = { attackModifier: number; defenseModifier: number; grade: "対人優位" | "対人拮抗" | "対人警戒"; advantageCount: number; cautionCount: number; summary: string; reason: string };
export type IndividualBonusEntry = { playerId: string; player: string; appearance: number; goals: number; amount: number };
export type IndividualBonusReceipt = { total: number; entries: IndividualBonusEntry[] };
export type PlayerSeasonStat = { playerId: string; player: string; position: string; appearances: number; starts: number; goals: number; assists: number; ratingTotal: number; ratingCount: number; mvpAwards: number };
export type MatchHighlight = { minute: number; kind: "kickoff" | "action" | "goal" | "tactic" | "substitution" | "injury" | "halftime" | "fulltime"; team: "orbit" | "opponent" | "neutral"; text: string; scorer?: string; assistant?: string };
export type HalfTimeReport = { playerGoals: number; opponentGoals: number; message: string; tacticalNote: string; recommendation: string };
export type MatchResult = { opponent: string; opponentId: string; playerGoals: number; opponentGoals: number; message: string; won: boolean; reward: number; sponsorRevenue: number; cupResult: CupMatchResult | null; gate: GateReceipt; merchandise: MerchandiseReceipt; membership: MembershipReceipt; concession: ConcessionReceipt; totalTicketRevenue: number; totalAttendance: number; totalCommercialRevenue: number; popularityDelta: number; leaguePopularityDelta: number; popularity: number; tactics: TacticalAssessment; opponentTactics: OpponentTacticalAssessment; tacticalMatchup: TacticalMatchup; markingImpact: MarkingMatchImpact; matchAttack: number; matchDefense: number; matchCondition: TeamMatchCondition; conditionAfter: TeamMatchCondition; halfTime: HalfTimeReport; highlights: MatchHighlight[]; substitutions: MatchSubstitution[]; injuries: MatchInjury[]; playerRatings: PlayerMatchRating[]; markDuels: MarkDuelReport[]; mvp: PlayerMatchRating | null; individualBonuses: IndividualBonusReceipt; skillXpGrants: SkillXpGrant[]; halfTimeChanges: string[] };

type Persisted = {
  money: number;
  fame: number;
  week: number;
  formationId: string;
  lineup: Record<string, string | null>;
  players: Player[];
  rows: LeagueRow[];
  logs: string[];
  recruited: boolean;
  sponsor?: Sponsor | null;
  cup?: CupState;
  popularity?: number;
  concessionLevel?: number;
  ledger?: FinanceEntry[];
  cashTrail?: number[];
  mentality?: Mentality;
  playingStyle?: PlayingStyle;
  injuries?: Record<string, number>;
  recruitNegotiation?: RecruitNegotiation;
  saleOffers?: SaleOffer[];
  trainingHistory?: TrainingHistoryEntry[];
  lastTrainingWeek?: number | null;
  trainingSessionsThisWeek?: number;
  trainingFacilityLevel?: number;
  marketSignedIds?: string[];
  marketCandidateIds?: string[];
  marketPreferredPositions?: Player["position"][];
  marketCandidateCycle?: number;
  marketUpdateNotice?: MarketUpdateNotice | null;
  youthPlayers?: YouthPlayer[];
  seasonStats?: PlayerSeasonStat[];
  scoutLevel?: number;
  assignedScoutId?: string;
  teamMorale?: number;
  recentMatchForm?: RecentMatchForm[];
  youthIntakeCursor?: number;
  manualMarkAssignments?: Record<string, string>;
};

const storageKey = "touchline-tactics-save-v1";
const userClub: ClubSeed = { id: "orbit", name: "オービット東京", rating: 64, color: "#d9ff4a", form: "新体制で上昇気流" };
const cupWeeks = [3, 7, 11, 15];
const cupRoundNames = ["ラウンド16", "準々決勝", "準決勝", "決勝"];
const concessionLevels = [
  { name: "ピッチサイド・キオスク", capacity: 3400, purchaseBonus: 0, spendBonus: 0, upgradeCost: 1600000 },
  { name: "スタンド・フードコート", capacity: 5600, purchaseBonus: .065, spendBonus: 260, upgradeCost: 3400000 },
  { name: "オービット・ホスピタリティ", capacity: 8200, purchaseBonus: .12, spendBonus: 540, upgradeCost: null },
];
const scoutLevels = [
  { name: "地域スカウティング", ratingBoost: 0, ceilingBoost: 0, youthQuality: "地域発掘" as YouthSkillQuality, youthInitialXpBonus: 0, youthSessionXpBonus: 0, youthPaceStep: 0, youthQualityNote: "基礎スキルと地元で見つけた伸びしろから、クラブらしい原石を育てる。", note: "近隣リーグの映像と地域ネットワークを活用する。", upgradeCost: 900000 },
  { name: "広域映像ネットワーク", ratingBoost: 2, ceilingBoost: 1, youthQuality: "広域注目" as YouthSkillQuality, youthInitialXpBonus: 10, youthSessionXpBonus: 1, youthPaceStep: 1, youthQualityNote: "全国の映像分析で、初期XPが高く、育成ペースを一段押し上げた注目株を見つける。", note: "全国の映像網を整え、即戦力と伸びしろを見逃さない。", upgradeCost: 1750000 },
  { name: "オービット・スカウト網", ratingBoost: 4, ceilingBoost: 2, youthQuality: "分析選抜" as YouthSkillQuality, youthInitialXpBonus: 24, youthSessionXpBonus: 2, youthPaceStep: 2, youthQualityNote: "分析班が適性を精査し、習得間近の初期XPと早い育成ペースを持つ選抜候補を招く。", note: "広域網と分析班が連携し、戦術適性の高い候補を選別する。", upgradeCost: null },
];
const scoutStaff: ScoutStaff[] = [
  { id: "scout-forward", name: "北原 誠", region: "首都圏・攻撃局面", specialtyPosition: "CF", specialtyLabel: "CF / WG / AM", specialtySkill: "finisher", profile: "アタッカー発掘", note: "ゴールに直結する動きと決定力を見抜く。前線候補にはフィニッシュセンスを起点にした育成プランを持ち込む。", entryXpBonus: 14, sessionXpBonus: 1 },
  { id: "scout-midfield", name: "香坂 凛", region: "広域・中盤創造", specialtyPosition: "CM", specialtyLabel: "CM / DM / AM", specialtySkill: "vision", profile: "ゲームメーカー発掘", note: "配球の質と判断の速さを評価する。中盤候補にはスルーパスを軸にした組立プランを与える。", entryXpBonus: 14, sessionXpBonus: 1 },
  { id: "scout-defense", name: "相馬 剛", region: "沿岸・守備組織", specialtyPosition: "CB", specialtyLabel: "CB / SB / DM", specialtySkill: "interceptor", profile: "守備者発掘", note: "予測と対応の早さを重視する。守備候補にはインターセプトを軸にした奪回プランを与える。", entryXpBonus: 14, sessionXpBonus: 1 },
  { id: "scout-keeper", name: "東雲 澪", region: "全国・GK分析", specialtyPosition: "GK", specialtyLabel: "GK", specialtySkill: "one-on-one", profile: "守護者発掘", note: "至近距離での判断と反応を見抜く。GK候補には1対1セーブを軸にした反応プランを与える。", entryXpBonus: 18, sessionXpBonus: 2 },
];
const trainingFacilityLevels = [
  { name: "ベース・トレーニング棟", weeklySlots: 1, growthBonus: 0, riskReduction: 0, note: "基本設備で週1回の全体トレーニングを実施する。", upgradeCost: 650000 },
  { name: "パフォーマンス・ラボ", weeklySlots: 2, growthBonus: 1, riskReduction: 4, note: "計測とリカバリー機器を整え、週2枠と成長効率を確保する。", upgradeCost: 1450000 },
  { name: "オービット高機能センター", weeklySlots: 3, growthBonus: 1, riskReduction: 8, note: "個別負荷管理まで行い、週3枠を安定して運用する。", upgradeCost: null },
];

export const trainingLoadOptions: TrainingLoadOption[] = [
  { id: "recovery", label: "回復専念", shortLabel: "回復", copy: "技術練習の負荷を外し、疲労回復を最優先する。", growthAdjustment: -2, fatigueAdjustment: -11, riskAdjustment: -10 },
  { id: "light", label: "軽め", shortLabel: "軽め", copy: "技術刺激を残しつつ、疲労の上積みを抑える。", growthAdjustment: -1, fatigueAdjustment: -3, riskAdjustment: -4 },
  { id: "standard", label: "標準", shortLabel: "標準", copy: "成長とコンディションの基準となる通常設定。", growthAdjustment: 0, fatigueAdjustment: 0, riskAdjustment: 0 },
  { id: "high", label: "高負荷", shortLabel: "高負荷", copy: "成長を強く狙うが、疲労と過負荷リスクが上がる。", growthAdjustment: 1, fatigueAdjustment: 4, riskAdjustment: 7 },
];

export const cfPlayStyleOptions: CFPlayStyleOption[] = [
  { id: "target", label: "ターゲットマン", copy: "最前線で収め、周囲を押し上げる基点になる。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 0, pressBonus: 0, finishCopy: "背を向けてボールを収め、強引にねじ込んだ。" },
  { id: "runner", label: "裏抜け", copy: "相手最終ラインの背後を狙い、素早くゴールへ向かう。", attackBonus: 1, defenseBonus: 0, directBonus: 2, possessionBonus: 0, pressBonus: 1, finishCopy: "最終ラインの背後へ抜け出し、冷静に流し込んだ。" },
  { id: "false-nine", label: "偽9番", copy: "中盤まで降りてつなぎ、周囲の前進と数的優位を作る。", attackBonus: 0, defenseBonus: 1, directBonus: 0, possessionBonus: 2, pressBonus: 1, finishCopy: "中盤へ下りて連係し、最後は自らフィニッシュへ持ち込んだ。" },
];

export const wgPlayStyleOptions: WGPlayStyleOption[] = [
  { id: "touchline", label: "タッチライン・ウイング", copy: "幅を取り、外からの前進とクロスで局面を動かす。", attackBonus: 1, defenseBonus: 0, directBonus: 0, possessionBonus: 1, pressBonus: 0, finishCopy: "タッチライン際で受け、正確なクロスから決定機を生んだ。" },
  { id: "inverted", label: "インサイド・ウイング", copy: "内側へ切れ込み、シュートとラストパスを狙う。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 0, pressBonus: 1, finishCopy: "外から内へ切れ込み、鋭い一撃でゴールを脅かした。" },
  { id: "wide-worker", label: "ワイド・ワーカー", copy: "上下動と帰陣を徹底し、サイドの強度を高める。", attackBonus: 0, defenseBonus: 1, directBonus: 0, possessionBonus: 0, pressBonus: 2, finishCopy: "守備から全力で追い越し、サイドを一気に押し上げた。" },
];

export const amPlayStyleOptions: AMPlayStyleOption[] = [
  { id: "playmaker", label: "ゲームメーカー", copy: "間で受け、試合を組み立てる最後のパスを選ぶ。", attackBonus: 1, defenseBonus: 0, directBonus: 0, possessionBonus: 2, pressBonus: 0, finishCopy: "狭い間で時間を作り、決定的なラストパスを通した。" },
  { id: "shadow-striker", label: "シャドーストライカー", copy: "前線へ飛び出し、ゴール前で決定力を発揮する。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 0, pressBonus: 1, finishCopy: "二列目から鋭く飛び出し、ゴール前へ入り込んだ。" },
  { id: "pressing-ten", label: "プレッシング10", copy: "前線から追い込み、奪回後の一手を加速させる。", attackBonus: 0, defenseBonus: 1, directBonus: 0, possessionBonus: 0, pressBonus: 2, finishCopy: "高い位置で奪い返し、そのまま決定機へつなげた。" },
];

export const cmPlayStyleOptions: CMPlayStyleOption[] = [
  { id: "box-to-box", label: "ボックス・トゥ・ボックス", copy: "二つのペナルティエリアを往復し、攻守の接続を担う。", attackBonus: 1, defenseBonus: 1, directBonus: 0, possessionBonus: 0, pressBonus: 1, finishCopy: "中盤を駆け抜け、攻守をつなぐ推進力を見せた。" },
  { id: "deep-playmaker", label: "ディープ・プレーメーカー", copy: "後方から配球し、保持のリズムと前進の起点を作る。", attackBonus: 1, defenseBonus: 0, directBonus: 0, possessionBonus: 2, pressBonus: 0, finishCopy: "低い位置から展開し、相手の守備を一気に動かした。" },
  { id: "mezzala", label: "メッツァーラ", copy: "ハーフスペースへ運び、内側から攻撃の人数を増やす。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 1, pressBonus: 0, finishCopy: "ハーフスペースへ侵入し、前線へ決定的な加速を与えた。" },
];

export const dmPlayStyleOptions: DMPlayStyleOption[] = [
  { id: "anchor", label: "アンカー", copy: "中央を固定し、最終ライン前の安全網になる。", attackBonus: 0, defenseBonus: 2, directBonus: 0, possessionBonus: 0, pressBonus: 0, finishCopy: "危険なスペースを埋め、奪回から攻撃の起点を作った。" },
  { id: "regista", label: "レジスタ", copy: "守備の底から展開し、攻撃の方向と速度を決める。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 2, pressBonus: 0, finishCopy: "守備の底から一本のパスで局面を前進させた。" },
  { id: "destroyer", label: "デストロイヤー", copy: "強い対人で相手の前進を断ち、即時奪回を支える。", attackBonus: 0, defenseBonus: 1, directBonus: 0, possessionBonus: 0, pressBonus: 2, finishCopy: "中盤で鋭く奪い返し、そのまま攻撃の波を作った。" },
];

export const cbPlayStyleOptions: CBPlayStyleOption[] = [
  { id: "stopper", label: "ストッパー", copy: "前へ強く出て対人を制し、中央で相手の勢いを止める。", attackBonus: 0, defenseBonus: 2, directBonus: 0, possessionBonus: 0, pressBonus: 1, finishCopy: "強い当たりで前進を止め、セットプレーから押し込んだ。" },
  { id: "ball-playing", label: "ビルドアップCB", copy: "最終ラインから配球し、保持の起点と前進を作る。", attackBonus: 1, defenseBonus: 0, directBonus: 0, possessionBonus: 2, pressBonus: 0, finishCopy: "最終ラインから正確に展開し、攻撃参加から仕留めた。" },
  { id: "cover", label: "カバー", copy: "背後を読み、危険な走路を消して最終ラインを整える。", attackBonus: 0, defenseBonus: 1, directBonus: 1, possessionBonus: 0, pressBonus: 1, finishCopy: "背後のスペースを読む守備から、意表を突く一撃を決めた。" },
];

export const sbPlayStyleOptions: SBPlayStyleOption[] = [
  { id: "overlap", label: "オーバーラップ", copy: "外側を追い越し、幅とクロスで前進を加速させる。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 1, pressBonus: 0, finishCopy: "外側を駆け上がり、鋭いクロスの流れから決めた。" },
  { id: "inverted-fullback", label: "インバートSB", copy: "内側へ絞って中盤を助け、保持時の数的優位を作る。", attackBonus: 1, defenseBonus: 1, directBonus: 0, possessionBonus: 2, pressBonus: 0, finishCopy: "内側へ入り込み、連係からゴール前へ飛び出した。" },
  { id: "defensive-fullback", label: "守備的SB", copy: "無理な前進を抑え、サイドの1対1と背後を安定させる。", attackBonus: 0, defenseBonus: 2, directBonus: 0, possessionBonus: 0, pressBonus: 1, finishCopy: "サイドを締める守備から、セットプレーで仕留めた。" },
];

export const gkPlayStyleOptions: GKPlayStyleOption[] = [
  { id: "shot-stopper", label: "ショットストッパー", copy: "至近距離の反応とセービングで、ゴール前の最後の壁になる。", attackBonus: 0, defenseBonus: 2, directBonus: 0, possessionBonus: 0, pressBonus: 0, finishCopy: "ビッグセーブで流れを引き寄せ、最後は劇的な決着を演出した。" },
  { id: "sweeper-keeper", label: "スイーパーGK", copy: "高い位置で背後を管理し、最終ラインの守備範囲を広げる。", attackBonus: 0, defenseBonus: 1, directBonus: 1, possessionBonus: 0, pressBonus: 2, finishCopy: "広い守備範囲で危機を摘み、速い再開から攻撃を動かした。" },
  { id: "distributor", label: "配球GK", copy: "正確なキックと短い配球で、後方から攻撃のリズムを作る。", attackBonus: 1, defenseBonus: 0, directBonus: 1, possessionBonus: 2, pressBonus: 0, finishCopy: "正確な配球で局面をひっくり返し、攻撃の起点になった。" },
];

export const mentalityOptions: Array<{ id: Mentality; label: string; copy: string; attack: number; defense: number }> = [
  { id: "defensive", label: "守備重視", copy: "ブロックを整え、失点リスクを抑える。", attack: -5, defense: 6 },
  { id: "balanced", label: "バランス", copy: "攻守の距離感を保ち、安定した試合運びを狙う。", attack: 0, defense: 0 },
  { id: "attacking", label: "攻撃重視", copy: "前進の人数を増やし、ゴールへ圧力をかける。", attack: 6, defense: -5 },
];

export const playingStyleOptions: Array<{ id: PlayingStyle; label: string; copy: string; attack: number; defense: number }> = [
  { id: "possession", label: "ポゼッション", copy: "保持で主導権を握り、試合を落ち着かせる。", attack: 2, defense: 1 },
  { id: "direct", label: "ダイレクト", copy: "素早く背後を取り、少ない手数で仕留める。", attack: 4, defense: -1 },
  { id: "press", label: "ハイプレス", copy: "前線から奪い、即時奪回で波をつくる。", attack: 3, defense: -2 },
];

export const trainingOptions: TrainingOption[] = [
  { id: "attacking", label: "攻撃技術", copy: "ドリブル・パス・シュートを総合的に磨く。", cost: 48000, accent: "lime" },
  { id: "passing", label: "パス＆組立", copy: "中盤の前進とラストパスの質を高める。", cost: 42000, accent: "blue" },
  { id: "finishing", label: "フィニッシュ", copy: "シュート精度と決定力を集中強化する。", cost: 54000, accent: "gold" },
  { id: "defending", label: "守備組織", copy: "タックル、ブロック、パスカットを鍛える。", cost: 48000, accent: "blue" },
  { id: "goalkeeping", label: "GK専門", copy: "GK能力とビルドアップの起点を強化する。", cost: 46000, accent: "gold" },
  { id: "recovery", label: "リカバリー", copy: "疲労を落とし、次節への準備度を整える。", cost: 28000, accent: "coral" },
];

export const contractOfferOptions: ContractOffer[] = [
  { id: "retention", label: "堅実提示", copy: "年俸の上昇を抑え、低めの出来高を加える。", salaryIncrease: .04, winBonus: 20000, appearanceBonus: 8000, goalBonus: 18000, signingRate: .11 },
  { id: "balanced", label: "標準提示", copy: "年俸と出来高のバランスを取る標準プラン。", salaryIncrease: .08, winBonus: 50000, appearanceBonus: 15000, goalBonus: 35000, signingRate: .14 },
  { id: "ambitious", label: "主力提示", copy: "年俸と個人成果を手厚くし、残留を最優先する。", salaryIncrease: .13, winBonus: 85000, appearanceBonus: 22000, goalBonus: 55000, signingRate: .18 },
];

const formationIdentities: Record<string, { trait: string; note: string; attack: number; defense: number }> = {
  "4-4-2": { trait: "二列の連動", note: "二つのコンパクトなラインで、攻守の受け渡しを安定させる。", attack: 0, defense: 2 },
  "4-3-3": { trait: "幅と前進", note: "両翼の推進力で、相手守備を横へ広げて攻略する。", attack: 3, defense: 0 },
  "4-5-1": { trait: "中盤の支配", note: "中央の人数を活かし、試合のテンポを握る。", attack: 1, defense: 3 },
  "3-4-3": { trait: "前線プレス", note: "前からの圧力と人数をかけた攻撃で主導権を奪う。", attack: 4, defense: -2 },
  "3-5-2": { trait: "中央制圧", note: "中央を厚く保ち、ワイドの上下動で優位をつくる。", attack: 2, defense: 2 },
  "3-6-1": { trait: "六枚の中盤", note: "中盤の数的優位で試合を支配し、両翼の押し上げから一人の前線へ届ける。", attack: 1, defense: 4 },
  "5-4-1": { trait: "守備ブロック", note: "最終ラインを厚くし、堅い守備から一撃を狙う。", attack: -2, defense: 5 },
  "5-3-2": { trait: "速攻の出口", note: "5バックの安定を土台に、二人の前線へ素早く届ける。", attack: 1, defense: 4 },
};

export const sponsorOffers: Sponsor[] = [
  { id: "orbit-credit", name: "ORBIT CREDIT", sector: "地域金融", accent: "#d9ff4a", upFront: 360000, weeklyIncome: 62000, winBonus: 35000, fameRequired: 250, copy: "地域の挑戦を支える金融パートナー。勝利に応じた上乗せ報酬を重視する。" },
  { id: "northforge", name: "NORTH FORGE", sector: "テクノロジー", accent: "#6ad7ff", upFront: 520000, weeklyIncome: 41000, winBonus: 68000, fameRequired: 300, copy: "上位を目指すクラブへ研究開発の力を。勝利時の高額ボーナスが魅力。" },
  { id: "mori-craft", name: "MORI CRAFT", sector: "飲料・ライフスタイル", accent: "#f5c955", upFront: 220000, weeklyIncome: 79000, winBonus: 18000, fameRequired: 180, copy: "ファンの日常に寄り添う長期協賛。安定した週次収入をもたらす。" },
];

const defaultContractYears = (player: Player) => player.contractYears ?? (player.age <= 21 ? 3 : player.age >= 28 ? 1 : 2);
export const ROSTER_LIMIT = 32;
export const ROSTER_WARNING_THRESHOLD = 30;
const isCfEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "CF" || player.secondary === "CF";
const isWgEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "WG" || player.position === "SH" || player.secondary === "WG" || player.secondary === "SH";
const isAmEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "AM" || player.secondary === "AM";
const isCmEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "CM" || player.secondary === "CM";
const isDmEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "DM" || player.secondary === "DM";
const isCbEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "CB" || player.secondary === "CB";
const isSbEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "SB" || player.secondary === "SB";
const isGkEligible = (player: Pick<Player, "position" | "secondary">) => player.position === "GK" || player.secondary === "GK";
const copyPlayers = () => players.map((player) => ({ ...player, contractYears: defaultContractYears(player), trainingLoad: player.trainingLoad ?? "standard", skillXp: { ...(player.skillXp ?? {}) }, skillTrainingTarget: player.skillTrainingTarget ?? playerSkillsFor(player)[0], cfPlayStyle: isCfEligible(player) ? player.cfPlayStyle ?? cfPlayStyleOptions[0].id : undefined, wgPlayStyle: isWgEligible(player) ? player.wgPlayStyle ?? wgPlayStyleOptions[0].id : undefined, amPlayStyle: isAmEligible(player) ? player.amPlayStyle ?? amPlayStyleOptions[0].id : undefined, cmPlayStyle: isCmEligible(player) ? player.cmPlayStyle ?? cmPlayStyleOptions[0].id : undefined, dmPlayStyle: isDmEligible(player) ? player.dmPlayStyle ?? dmPlayStyleOptions[0].id : undefined, cbPlayStyle: isCbEligible(player) ? player.cbPlayStyle ?? cbPlayStyleOptions[0].id : undefined, sbPlayStyle: isSbEligible(player) ? player.sbPlayStyle ?? sbPlayStyleOptions[0].id : undefined, gkPlayStyle: isGkEligible(player) ? player.gkPlayStyle ?? gkPlayStyleOptions[0].id : undefined }));
const blankLineup = () => Object.fromEntries(formations[0].slots.map((slot) => [slot.id, null])) as Record<string, string | null>;
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const deterministic = (seed: number) => { const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453; return value - Math.floor(value); };
const finiteOr = (value: unknown, fallback: number) => typeof value === "number" && Number.isFinite(value) ? value : fallback;
const initialRecruitNegotiation = (candidate: Player = marketRecruits[0]): RecruitNegotiation => ({ candidateId: candidate.id, stage: "scouting", openingOffer: Math.round(candidate.salary * .82), counterOffer: Math.round(candidate.salary * .95), agreedFee: null });
const initialSaleOffers = (): SaleOffer[] => [
  { id: "sale-p3", playerId: "p3", clubName: "アズール福岡", proposedFee: 11800000, expiresWeek: 19 },
  { id: "sale-p9", playerId: "p9", clubName: "オーロラ横浜", proposedFee: 13200000, expiresWeek: 19 },
  { id: "sale-p16", playerId: "p16", clubName: "フォージ埼玉", proposedFee: 8600000, expiresWeek: 19 },
];
const initialSeasonStats = (roster: Player[]): PlayerSeasonStat[] => roster.map((player) => ({ playerId: player.id, player: player.name, position: player.position, appearances: 0, starts: 0, goals: 0, assists: 0, ratingTotal: 0, ratingCount: 0, mvpAwards: 0 }));

function baseRows(): LeagueRow[] {
  return [userClub, ...opponentSeeds].map((club) => ({ ...club, played: 0, win: 0, draw: 0, loss: 0, gf: 0, ga: 0, pts: 0 }));
}

function initialCup(): CupState {
  const clubs = [userClub, ...opponentSeeds.slice(0, 15)];
  const fixtures: CupFixture[] = [];
  for (let index = 0; index < clubs.length; index += 2) fixtures.push({ id: `r16-${index / 2}`, homeId: clubs[index].id, awayId: clubs[index + 1].id });
  return { status: "active", roundIndex: 0, rounds: [{ name: cupRoundNames[0], scheduledWeek: cupWeeks[0], fixtures }] };
}

export class ClubSimulation {
  private money = 3200000;
  private fame = 315;
  private week = 0;
  private formationId = "4-3-3";
  private lineup = blankLineup();
  private roster: Player[] = copyPlayers();
  private rows = baseRows();
  private logs = ["監督就任。オービット東京の新しいシーズンが始まる。"];
  private selectedPlayerId: string | null = null;
  private recruited = false;
  private sponsor: Sponsor | null = null;
  private cup = initialCup();
  private popularity = 42;
  private teamMorale = 58;
  private recentMatchForm: RecentMatchForm[] = [];
  private concessionLevel = 1;
  private scoutLevel = 1;
  private assignedScoutId = "scout-forward";
  private mentality: Mentality = "balanced";
  private playingStyle: PlayingStyle = "possession";
  private ledger: FinanceEntry[] = [{ week: 0, label: "開幕運転資金", category: "繰越資金", amount: 3200000, kind: "income", note: "クラブの初期運転資金" }];
  private cashTrail = [3200000];
  private injuries: Record<string, number> = {};
  private recruitNegotiation = initialRecruitNegotiation();
  private marketSignedIds: string[] = [];
  private marketCandidateIds: string[] = [];
  private marketPreferredPositions: Player["position"][] = [];
  private marketCandidateCycle = 0;
  private pendingMarketUpdateNotice: MarketUpdateNotice | null = null;
  private youthPlayers: YouthPlayer[] = youthProspects.map((player) => this.scoutYouthProspect(player));
  private youthIntakeCursor = 0;
  private saleOffers = initialSaleOffers();
  private trainingHistory: TrainingHistoryEntry[] = [];
  private lastTrainingWeek: number | null = null;
  private trainingSessionsThisWeek = 0;
  private trainingFacilityLevel = 1;
  private seasonStats: PlayerSeasonStat[] = initialSeasonStats(copyPlayers());
  private manualMarkAssignments: Record<string, string> = {};
  public lastResult: MatchResult | null = null;

  constructor() {
    this.load();
    this.ensureMarketCandidateList();
    this.autoLineup();
  }

  private resetToInitialState() {
    this.money = 3200000;
    this.fame = 315;
    this.week = 0;
    this.formationId = "4-3-3";
    this.lineup = blankLineup();
    this.roster = copyPlayers();
    this.rows = baseRows();
    this.logs = ["監督就任。オービット東京の新しいシーズンが始まる。"];
    this.selectedPlayerId = null;
    this.recruited = false;
    this.sponsor = null;
    this.cup = initialCup();
    this.popularity = 42;
    this.teamMorale = 58;
    this.recentMatchForm = [];
    this.concessionLevel = 1;
    this.scoutLevel = 1;
    this.assignedScoutId = "scout-forward";
    this.mentality = "balanced";
    this.playingStyle = "possession";
    this.ledger = [{ week: 0, label: "開幕運転資金", category: "繰越資金", amount: 3200000, kind: "income", note: "クラブの初期運転資金" }];
    this.cashTrail = [3200000];
    this.injuries = {};
    this.marketSignedIds = [];
    this.marketCandidateIds = marketRecruits.map((player) => player.id);
    this.marketPreferredPositions = [];
    this.marketCandidateCycle = 0;
    this.pendingMarketUpdateNotice = null;
    this.recruitNegotiation = initialRecruitNegotiation();
    this.ensureMarketCandidateList();
    this.youthPlayers = youthProspects.map((player) => this.scoutYouthProspect(player));
    this.youthIntakeCursor = 0;
    this.saleOffers = initialSaleOffers();
    this.trainingHistory = [];
    this.lastTrainingWeek = null;
    this.trainingSessionsThisWeek = 0;
    this.trainingFacilityLevel = 1;
    this.seasonStats = initialSeasonStats(this.roster);
    this.manualMarkAssignments = {};
  }

  resetGame() {
    this.resetToInitialState();
    this.autoLineup();
    this.persist();
  }

  private hasUsableSave(value: unknown): value is Persisted {
    if (!value || typeof value !== "object") return false;
    const saved = value as Partial<Persisted>;
    return Number.isFinite(saved.money) && Number.isFinite(saved.fame) && Number.isFinite(saved.week) && typeof saved.formationId === "string" && !!saved.lineup && typeof saved.lineup === "object" && Array.isArray(saved.players) && saved.players.length > 0 && Array.isArray(saved.rows) && saved.rows.length > 0 && Array.isArray(saved.logs);
  }

  get formation(): Formation { return formations.find((formation) => formation.id === this.formationId) ?? formations[0]; }
  get rosterPlayers() { return this.roster; }
  get rosterLimit() { return ROSTER_LIMIT; }
  get rosterCapacityStatus() {
    const count = this.roster.length;
    const remaining = Math.max(0, ROSTER_LIMIT - count);
    const full = count >= ROSTER_LIMIT;
    const warning = count >= ROSTER_WARNING_THRESHOLD;
    return { count, limit: ROSTER_LIMIT, remaining, warning, full, tone: full ? "full" as const : warning ? "warning" as const : "safe" as const };
  }
  get leagueRows() { return [...this.rows].sort((a, b) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf || b.rating - a.rating); }
  get selectedPlayer() { return this.roster.find((player) => player.id === this.selectedPlayerId) ?? null; }
  get seasonProgress() { return Math.round((this.week / 19) * 100); }
  get completedWeeks() { return this.week; }
  get annualSalary() { return this.roster.reduce((sum, player) => sum + player.salary, 0); }
  get weeklySalary() { return Math.round(this.annualSalary / 52); }
  get teamWinBonus() { return this.roster.reduce((sum, player) => sum + (player.winBonus ?? 0), 0); }
  get contractDuePlayers() { return this.roster.filter((player) => (player.contractYears ?? defaultContractYears(player)) <= 1); }
  contractRenewalFee(player: Player, offerId: ContractOfferId = "balanced") { const offer = contractOfferOptions.find((item) => item.id === offerId) ?? contractOfferOptions[1]; return Math.round(player.salary * (1 + offer.salaryIncrease) * offer.signingRate); }
  get teamPosition() { return this.leagueRows.findIndex((row) => row.id === userClub.id) + 1; }
  get currentOpponent() { return opponentSeeds[this.week % opponentSeeds.length]; }
  get currentOpponentTactics() { return this.opponentTacticalAssessment(this.currentOpponent.id); }
  get currentTacticalMatchup() { return this.tacticalMatchup(this.score().tactics, this.currentOpponentTactics); }
  get nextMatchCondition() { return this.matchConditionFor(this.isHomeWeek()); }
  get teamMoraleValue() { return this.teamMorale; }
  get recentForm() { return [...this.recentMatchForm]; }
  get currentManualMarkAssignments() {
    const opponentIds = new Set(this.currentOpponentTactics.lineup.map((player) => player.id));
    const starterIds = new Set(Object.values(this.lineup).filter((id): id is string => Boolean(id)));
    return Object.fromEntries(Object.entries(this.manualMarkAssignments).filter(([opponentId, playerId]) => opponentIds.has(opponentId) && starterIds.has(playerId)));
  }
  get currentWeek() { return this.week + 1; }
  get currentMoney() { return this.money; }
  get currentFame() { return this.fame; }
  get currentLogs() { return this.logs.slice(0, 5); }
  get isRecruited() { return this.recruited; }
  get lineupState() { return this.lineup; }
  get currentSponsor() { return this.sponsor; }
  get currentMarketCandidate() { const base = this.marketCandidates[0] ?? null; return base ? this.scoutCandidate(base) : null; }
  get currentMarketTacticalFit() { const candidate = this.currentMarketCandidate; return candidate ? this.scoutTacticalFit(candidate) : null; }
  get marketCandidateComparison() { return this.buildMarketCandidateComparison(); }
  get selectedMarketPositions() { return [...this.marketPreferredPositions]; }
  get marketNextRefreshWeek() { return this.week + this.marketRefreshIn; }
  get marketUpdateNotice() {
    if (!this.pendingMarketUpdateNotice) return null;
    const candidates = this.pendingMarketUpdateNotice.candidateIds
      .map((id) => marketRecruits.find((player) => player.id === id))
      .filter((player): player is Player => player !== undefined)
      .map((player) => this.scoutCandidate(player));
    return { ...this.pendingMarketUpdateNotice, candidates };
  }
  get contractAlerts() { return this.buildContractAlerts(); }
  get recruitmentPriorities() { return this.recruitmentPriorityBoard(); }
  get currentMarketRecruitmentMatch() { const candidate = this.currentMarketCandidate; if (!candidate) return null; const matches = this.recruitmentPriorities.filter((priority) => priority.position === candidate.position || priority.position === candidate.secondary).sort((a, b) => b.score - a.score); const priority = matches[0]; return priority ? { priority, score: priority.score, label: priority.grade, note: `${candidate.name}は現在${priority.grade === "最優先" ? "最優先の" : `${priority.grade}優先の`}${priority.position}補強に合致します。` } : null; }
  get currentRecruitNegotiation() { const candidate = this.currentMarketCandidate; return candidate && this.recruitNegotiation.candidateId === candidate.id ? this.recruitNegotiation : candidate ? initialRecruitNegotiation(candidate) : null; }
  get marketRefreshIn() { return 3 - (this.week % 3) || 3; }
  get youthAcademyPlayers() { return this.youthPlayers; }
  get youthTrainingCost() { return 65000; }
  get youthIntakeForecast() { return Math.max(0, 3 - this.youthPlayers.length); }
  get activeSaleOffers() { return this.saleOffers.filter((offer) => this.roster.some((player) => player.id === offer.playerId)); }

  setManualMarkAssignment(opponentPlayerId: string, playerId: string) {
    const opponentPlayer = this.currentOpponentTactics.lineup.find((player) => player.id === opponentPlayerId);
    const player = this.roster.find((item) => item.id === playerId);
    if (!opponentPlayer || !player || !Object.values(this.lineup).includes(playerId)) return { ok: false, text: "相手または先発選手を確認できませんでした。" };
    Object.entries(this.manualMarkAssignments).forEach(([opponentId, assignedId]) => { if (assignedId === playerId) delete this.manualMarkAssignments[opponentId]; });
    this.manualMarkAssignments[opponentPlayerId] = playerId;
    this.persist();
    return { ok: true, text: `${player.name}を${opponentPlayer.name}の担当に指定しました。` };
  }

  clearManualMarkAssignments() {
    const opponentIds = new Set(this.currentOpponentTactics.lineup.map((player) => player.id));
    Object.keys(this.manualMarkAssignments).forEach((opponentId) => { if (opponentIds.has(opponentId)) delete this.manualMarkAssignments[opponentId]; });
    this.persist();
  }

  private pruneManualMarkAssignments() {
    const starterIds = new Set(Object.values(this.lineup).filter((id): id is string => Boolean(id)));
    this.manualMarkAssignments = Object.fromEntries(Object.entries(this.manualMarkAssignments).filter(([, playerId]) => starterIds.has(playerId)));
  }
  get recentTrainingHistory() { return this.trainingHistory.slice(0, 8); }
  get trainingFacility(): TrainingFacility { const current = trainingFacilityLevels[this.trainingFacilityLevel - 1]; const next = trainingFacilityLevels[this.trainingFacilityLevel]; return { level: this.trainingFacilityLevel, name: current.name, weeklySlots: current.weeklySlots, growthBonus: current.growthBonus, riskReduction: current.riskReduction, nextCost: current.upgradeCost, nextName: next?.name ?? null, note: current.note }; }
  get trainingSessionsUsed() { return this.lastTrainingWeek === this.week ? this.trainingSessionsThisWeek : 0; }
  get trainingSessionsRemaining() { return Math.max(0, this.trainingFacility.weeklySlots - this.trainingSessionsUsed); }
  get canTrainThisWeek() { return this.trainingSessionsRemaining > 0; }
  get trainingRecommendation() { return this.buildTrainingRecommendation(); }
  get trainingLoadSummary() { return trainingLoadOptions.map((option) => ({ ...option, count: this.roster.filter((player) => this.trainingLoadFor(player).id === option.id).length })); }
  get seasonPlayerStats() { return [...this.seasonStats].sort((a, b) => b.goals - a.goals || b.assists - a.assists || (b.ratingCount ? b.ratingTotal / b.ratingCount : 0) - (a.ratingCount ? a.ratingTotal / a.ratingCount : 0) || b.appearances - a.appearances); }
  get sponsorWeeksRemaining() { return Math.max(0, 19 - this.week); }
  get cupState() { return this.cup; }
  get cupCurrentRound() { return this.cup.rounds[this.cup.roundIndex] ?? this.cup.rounds.at(-1); }
  get nextCupWeek() { return cupWeeks.find((scheduled) => scheduled > this.week) ?? null; }
  get fanPopularity() { return this.popularity; }
  get currentMentality() { return this.mentality; }
  get currentPlayingStyle() { return this.playingStyle; }
  get maxSubstitutions() { return 3; }
  injuryWeeksFor(playerId: string) { return this.injuries[playerId] ?? this.roster.find((player) => player.id === playerId)?.injuryWeeks ?? 0; }
  get stadiumCapacity() { return 10000; }
  get isUpcomingHome() { return this.isHomeWeek(); }
  get currentTicketPrice() { return this.ticketPrice(); }
  get upcomingGateForecast() { return this.createGateReceipt("リーグ", this.isHomeWeek(), this.currentOpponent.rating); }
  get fanClubMembers() { return this.fanClubMembersFor(this.popularity); }
  get weeklyFanClubFee() { return this.membershipReceipt().revenue; }
  get upcomingMerchandiseForecast() { return this.createMerchandiseReceipt(this.upcomingGateForecast); }
  get concessionFacility(): ConcessionFacility {
    const current = concessionLevels[this.concessionLevel - 1];
    const next = concessionLevels[this.concessionLevel];
    return { level: this.concessionLevel, name: current.name, capacity: current.capacity, purchaseBonus: current.purchaseBonus, spendBonus: current.spendBonus, nextCost: current.upgradeCost, nextName: next?.name ?? null };
  }
  get scoutFacility(): ScoutFacility { const current = scoutLevels[this.scoutLevel - 1]; const next = scoutLevels[this.scoutLevel]; return { level: this.scoutLevel, name: current.name, ratingBoost: current.ratingBoost, ceilingBoost: current.ceilingBoost, youthQuality: current.youthQuality, youthInitialXpBonus: current.youthInitialXpBonus, youthSessionXpBonus: current.youthSessionXpBonus, youthPaceStep: current.youthPaceStep, youthQualityNote: current.youthQualityNote, nextCost: current.upgradeCost, nextName: next?.name ?? null, note: current.note }; }
  get scoutStaffMembers() { return scoutStaff; }
  get assignedScout() { return scoutStaff.find((staff) => staff.id === this.assignedScoutId) ?? scoutStaff[0]; }
  get scoutDeployment() { const staff = this.assignedScout; return { staff, tendency: `${staff.specialtyLabel}を優先発掘`, summary: `${staff.name}が${staff.region}を担当。${staff.specialtyLabel}の候補は${playerSkillCatalog[staff.specialtySkill].label}を初期スキル候補に持ち、加入XP +${staff.entryXpBonus}・ユースXP +${staff.sessionXpBonus}/回を得る。` }; }
  get youthScoutQualityForecast() { const current = this.scoutFacility; const next = scoutLevels[this.scoutLevel]; return { current, next: next ? { level: this.scoutLevel + 1, name: next.name, youthQuality: next.youthQuality, youthInitialXpBonus: next.youthInitialXpBonus, youthSessionXpBonus: next.youthSessionXpBonus, youthPaceStep: next.youthPaceStep, note: next.youthQualityNote } : null }; }
  get marketQualityNote() { const facility = this.scoutFacility; return `スカウトLv.${facility.level}：候補能力 +${facility.ratingBoost} / 上限 +${facility.ceilingBoost}`; }
  get upcomingConcessionForecast() { return this.createConcessionReceipt(this.upcomingGateForecast); }
  get financialSummary(): FinancialSummary {
    const income = this.ledger.filter((entry) => entry.kind === "income");
    const expenses = this.ledger.filter((entry) => entry.kind === "expense");
    const sum = (entries: FinanceEntry[]) => entries.reduce((total, entry) => total + entry.amount, 0);
    const byCategory = (entries: FinanceEntry[]) => Object.entries(entries.reduce<Record<string, number>>((totals, entry) => { totals[entry.category] = (totals[entry.category] ?? 0) + entry.amount; return totals; }, {})).map(([category, amount]) => ({ category: category as FinanceCategory, amount })).sort((a, b) => b.amount - a.amount);
    const currentEntries = this.ledger.filter((entry) => entry.week === this.week);
    return { cash: this.money, incomeTotal: sum(income), expenseTotal: sum(expenses), net: sum(income) - sum(expenses), currentWeekIncome: sum(currentEntries.filter((entry) => entry.kind === "income")), currentWeekExpense: sum(currentEntries.filter((entry) => entry.kind === "expense")), incomeBreakdown: byCategory(income), expenseBreakdown: byCategory(expenses), recentEntries: [...this.ledger].slice(-8).reverse(), cashTrail: this.cashTrail.slice(-8) };
  }

  playerForSlot(slotId: string) {
    const playerId = this.lineup[slotId];
    return playerId ? this.roster.find((player) => player.id === playerId) ?? null : null;
  }

  playerIsFit(player: Player, slotId: string) {
    const slot = this.formation.slots.find((item) => item.id === slotId);
    return Boolean(slot && (slot.allowed.includes(player.position) || (player.secondary && slot.allowed.includes(player.secondary))));
  }

  rolePlayStyleFit(player: Player, role: RoleKind, option: RoleStyleOption): RolePlayStyleFit {
    const slot = this.formation.slots.find((item) => this.lineup[item.id] === player.id);
    const active = Boolean(slot && ((role === "cf" && slot.label === "CF") || (role === "wg" && ["WG", "SH"].includes(slot.label)) || (role === "am" && slot.label === "CM" && player.position === "AM") || (role === "cm" && slot.label === "CM" && player.position === "CM") || (role === "dm" && slot.label === "DM") || (role === "cb" && slot.label === "CB") || (role === "sb" && slot.label === "SB") || (role === "gk" && slot.label === "GK")));
    const abilityScore = this.roleAbilityScore(player, role, option.id);
    const abilityBonus = active && abilityScore >= 72 ? 2 : active && abilityScore >= 62 ? 1 : 0;
    const formationBonus = active ? this.roleFormationBonus(role, option.id) : 0;
    const multiplier = (abilityBonus === 2 ? .5 : abilityBonus === 1 ? .25 : 0) + (formationBonus ? .25 : 0);
    const styleAttack = option.attackBonus + (this.playingStyle === "direct" ? option.directBonus : this.playingStyle === "possession" ? option.possessionBonus : option.pressBonus);
    const attackBoost = multiplier > 0 && styleAttack > 0 ? Math.max(1, Math.round(styleAttack * multiplier)) : 0;
    const defenseBoost = multiplier > 0 && option.defenseBonus > 0 ? Math.max(1, Math.round(option.defenseBonus * multiplier)) : 0;
    const totalBoost = attackBoost + defenseBoost;
    const grade: RolePlayStyleFit["grade"] = !active ? "待機" : totalBoost >= 2 ? "伸長大" : totalBoost === 1 ? "伸長" : "標準";
    const reason = !active ? "この役割は対応する起用位置でのみ伸長します。" : `${this.formation.label}の配置${formationBonus ? "が役割を後押し" : "で運用中"}。適合能力 ${abilityScore}${abilityBonus === 2 ? "で高水準" : abilityBonus === 1 ? "で基準到達" : "は伸長基準未満"}。`;
    return { playerId: player.id, player: player.name, role, style: option.label, active, abilityScore, abilityBonus, formationBonus, attackBoost, defenseBoost, totalBoost, grade, reason };
  }

  private skillMasteryLevel(xp: number, learned: boolean) {
    if (!learned) return 0;
    if (xp >= 210) return 3;
    if (xp >= 115) return 2;
    if (xp >= 45) return 1;
    return 0;
  }

  private skillMasteryLabel(level: number, learned: boolean) {
    if (!learned) return "習得準備";
    return ["基礎", "習熟", "熟達", "達人"][level] ?? "基礎";
  }

  private skillCandidatesFor(player: Player) {
    const learned = playerSkillsFor(player);
    const focusValue = (definition: PlayerSkillDefinition) => definition.focus === "attack" ? player.attack : definition.focus === "defense" ? player.defense : definition.focus === "pass" ? player.pass : definition.focus === "tackle" ? player.tackle : definition.focus === "interception" ? player.interception : player.gk ?? 0;
    return (Object.values(playerSkillCatalog) as PlayerSkillDefinition[])
      .filter((definition) => definition.positions.includes(player.position) && !learned.includes(definition.id))
      .sort((a, b) => focusValue(b) - b.minimum - (focusValue(a) - a.minimum) || a.label.localeCompare(b.label, "ja"))
      .slice(0, 2)
      .map((definition) => definition.id);
  }

  skillProgressFor(player: Player): PlayerSkillProgress[] {
    const learnedSkills = playerSkillsFor(player);
    const skillIds = Array.from(new Set([...learnedSkills, ...this.skillCandidatesFor(player)]));
    return skillIds.map((skillId) => {
      const learned = learnedSkills.includes(skillId);
      const xp = clamp(Math.round(finiteOr(player.skillXp?.[skillId], 0)), 0, 210);
      const level = this.skillMasteryLevel(xp, learned);
      const nextXp = !learned ? 100 : level === 0 ? 45 : level === 1 ? 115 : level === 2 ? 210 : null;
      const floor = !learned ? 0 : level === 0 ? 0 : level === 1 ? 45 : 115;
      const progress = nextXp === null ? 100 : clamp(Math.round((xp - floor) / Math.max(1, nextXp - floor) * 100), 0, 100);
      const definition = playerSkillCatalog[skillId];
      const trainingLabels = playerSkillGrowthFocus[skillId].map((focus) => trainingOptions.find((option) => option.id === focus)?.label ?? focus);
      return { skillId, label: definition.label, short: definition.short, learned, canTrain: !learned || level < 3, target: player.skillTrainingTarget === skillId, xp, level, levelLabel: this.skillMasteryLabel(level, learned), nextXp, progress, trainingLabels, reason: !learned ? `${trainingLabels.join(" / ")}でXPを100まで貯めると習得できます。` : nextXp === null ? "最高熟達です。試合中のスキル効果が最大化されています。" : `${trainingLabels.join(" / ")}と試合出場で熟達度を高めます。レベル2以降は発動時の攻守効果が伸びます。` };
    });
  }

  skillTrainingTargetFor(player: Player) {
    const progress = this.skillProgressFor(player);
    return progress.find((item) => item.target && item.canTrain) ?? progress.find((item) => item.learned && item.canTrain) ?? progress.find((item) => item.canTrain) ?? progress[0] ?? null;
  }

  setSkillTrainingTarget(playerId: string, skillId: PlayerSkillId) {
    const player = this.roster.find((item) => item.id === playerId);
    const progress = player ? this.skillProgressFor(player).find((item) => item.skillId === skillId) : null;
    if (!player || !progress) return { ok: false, text: "対象選手またはスキル習得候補を確認できませんでした。" };
    if (!progress.canTrain) return { ok: false, text: `${player.name}の${progress.label}は最高熟達です。別のスキルを選んでください。` };
    player.skillTrainingTarget = skillId;
    this.logs.unshift(`${player.name}のスキル育成対象を「${progress.label}」へ設定。`);
    this.persist();
    return { ok: true, text: `${player.name}は「${progress.label}」を集中育成します。${progress.reason}` };
  }

  setYouthSkillTrainingTarget(playerId: string, skillId: PlayerSkillId) {
    const player = this.youthPlayers.find((item) => item.id === playerId);
    const progress = player ? this.skillProgressFor(player).find((item) => item.skillId === skillId) : null;
    if (!player || !progress) return { ok: false, text: "ユース選手または育成方針を確認できませんでした。" };
    if (!progress.canTrain) return { ok: false, text: `${player.name}の${progress.label}は最高熟達です。別の育成方針を選んでください。` };
    player.skillTrainingTarget = skillId;
    this.logs.unshift(`ユース${player.name}の重点スキルを「${progress.label}」へ設定。`);
    this.persist();
    return { ok: true, text: `${player.name}の重点を「${progress.label}」へ変更しました。次のユースセッションからXPを獲得します。` };
  }

  private grantSkillXp(player: Player, skillId: PlayerSkillId, amount: number, source: SkillXpGrant["source"]) {
    const progress = this.skillProgressFor(player).find((item) => item.skillId === skillId);
    if (!progress || !progress.canTrain || amount <= 0) return null;
    const totalXp = clamp(progress.xp + Math.max(1, Math.round(amount)), 0, 210);
    const learned = !progress.learned && totalXp >= 100;
    const wasLevel = progress.level;
    const learnedSkills = playerSkillsFor(player);
    if (learned) player.skills = Array.from(new Set([...learnedSkills, skillId]));
    player.skillXp = { ...(player.skillXp ?? {}), [skillId]: totalXp };
    const nextLevel = this.skillMasteryLevel(totalXp, progress.learned || learned);
    return { playerId: player.id, player: player.name, skillId, label: progress.label, xp: totalXp - progress.xp, totalXp, levelUp: nextLevel > wasLevel, learned, source } satisfies SkillXpGrant;
  }

  private rollbackSkillXp(grants: SkillXpGrant[]) {
    grants.forEach((grant) => {
      const player = this.roster.find((item) => item.id === grant.playerId);
      if (!player) return;
      const restoredXp = Math.max(0, Math.round(finiteOr(player.skillXp?.[grant.skillId], 0)) - grant.xp);
      player.skillXp = { ...(player.skillXp ?? {}), [grant.skillId]: restoredXp };
      if (grant.learned && restoredXp < 100) player.skills = (player.skills ?? []).filter((skill) => skill !== grant.skillId);
    });
  }

  private awardMatchSkillXp(ratings: PlayerMatchRating[], tactics: TacticalAssessment) {
    return ratings.flatMap((rating) => {
      const player = this.roster.find((item) => item.id === rating.playerId);
      const target = player ? this.skillTrainingTargetFor(player) : null;
      if (!player || !target) return [];
      const activation = tactics.skillDetails.find((item) => item.playerId === player.id && item.skillId === target.skillId);
      const amount = 2 + (rating.started ? 2 : 1) + rating.goals * 5 + rating.assists * 3 + (activation?.active ? 2 : 0) + (rating.rating >= 7.4 ? 2 : 0);
      const grant = this.grantSkillXp(player, target.skillId, amount, "試合");
      return grant ? [grant] : [];
    });
  }

  playerSkillStatus(player: Player) {
    const starting = Object.values(this.lineup).includes(player.id) && this.injuryWeeksFor(player.id) === 0;
    return this.playerSkillActivations(player, this.playingStyle).map((skill) => starting ? skill : { ...skill, active: false, attackBoost: 0, defenseBoost: 0, reason: "先発起用時に、戦術条件と能力基準を満たすと発動します。" });
  }

  private playerSkillActivations(player: Pick<Player, "id" | "name" | "position" | "skills" | "skillXp" | "attack" | "defense" | "pass" | "tackle" | "interception" | "gk">, playingStyle: PlayingStyle): PlayerSkillActivation[] {
    const focusValue = (definition: PlayerSkillDefinition) => definition.focus === "attack" ? player.attack : definition.focus === "defense" ? player.defense : definition.focus === "pass" ? player.pass : definition.focus === "tackle" ? player.tackle : definition.focus === "interception" ? player.interception : player.gk ?? 0;
    return playerSkillsFor(player).map((skillId: PlayerSkillId) => {
      const definition = playerSkillCatalog[skillId];
      const value = focusValue(definition);
      const positionReady = definition.positions.includes(player.position);
      const styleReady = !definition.styles?.length || definition.styles.includes(playingStyle);
      const active = positionReady && styleReady && value >= definition.minimum;
      const xp = clamp(Math.round(finiteOr(player.skillXp?.[skillId], 0)), 0, 210);
      const masteryLevel = this.skillMasteryLevel(xp, true);
      const masteryBonus = masteryLevel >= 2 ? 1 : 0;
      const attackBoost = active ? definition.attackBoost + (definition.attackBoost > 0 ? masteryBonus : 0) : 0;
      const defenseBoost = active ? definition.defenseBoost + (definition.defenseBoost > 0 ? masteryBonus : 0) : 0;
      const reason = !positionReady ? `${player.position}での起用時には発動しません。` : !styleReady ? `${definition.styles?.map((style) => playingStyleOptions.find((item) => item.id === style)?.label ?? style).join(" / ")}で発動します。` : value < definition.minimum ? `${definition.focus === "gk" ? "GK" : definition.focus === "pass" ? "パス" : definition.focus === "tackle" ? "タックル" : definition.focus === "interception" ? "パスカット" : definition.focus === "defense" ? "守備" : "攻撃"}${value}（発動基準 ${definition.minimum}）` : `${playingStyleOptions.find((item) => item.id === playingStyle)?.label ?? playingStyle}で発動。${this.skillMasteryLabel(masteryLevel, true)} Lv.${masteryLevel} / 攻${attackBoost >= 0 ? "+" : ""}${attackBoost} / 守${defenseBoost >= 0 ? "+" : ""}${defenseBoost}`;
      return { playerId: player.id, player: player.name, skillId, label: definition.label, short: definition.short, description: definition.description, active, focusValue: value, minimum: definition.minimum, attackBoost, defenseBoost, masteryLevel, masteryLabel: this.skillMasteryLabel(masteryLevel, true), xp, reason, highlight: definition.highlight };
    });
  }

  private skillAssessment(selected: Player[]) {
    const details = selected.flatMap((player) => this.playerSkillActivations(player, this.playingStyle));
    const active = details.filter((skill) => skill.active);
    const skillAttack = Math.min(5, active.reduce((sum, skill) => sum + skill.attackBoost, 0));
    const skillDefense = Math.min(5, active.reduce((sum, skill) => sum + skill.defenseBoost, 0));
    const skillSummary = active.length ? `スキル連動: ${active.map((skill) => `${skill.player}=${skill.label}`).join(" / ")}（攻+${skillAttack}/守+${skillDefense}）` : "スキル連動: 発動条件を満たす選手なし";
    return { details, skillAttack, skillDefense, skillSummary };
  }

  private roleAbilityScore(player: Player, role: RoleKind, styleId: string) {
    const weighted = (...entries: Array<[number, number]>) => Math.round(entries.reduce((sum, [value, weight]) => sum + value * weight, 0));
    if (role === "cf") return styleId === "target" ? weighted([player.attack, .22], [player.shoot, .42], [player.pass, .21], [player.defense, .15]) : styleId === "runner" ? weighted([player.attack, .25], [player.dribble, .35], [player.shoot, .4]) : weighted([player.attack, .2], [player.dribble, .25], [player.pass, .45], [player.defense, .1]);
    if (role === "wg") return styleId === "touchline" ? weighted([player.attack, .2], [player.dribble, .4], [player.pass, .4]) : styleId === "inverted" ? weighted([player.attack, .25], [player.dribble, .45], [player.shoot, .3]) : weighted([player.attack, .15], [player.dribble, .2], [player.pass, .2], [player.defense, .25], [player.tackle, .2]);
    if (role === "am") return styleId === "playmaker" ? weighted([player.attack, .2], [player.dribble, .22], [player.pass, .48], [player.shoot, .1]) : styleId === "shadow-striker" ? weighted([player.attack, .28], [player.dribble, .26], [player.shoot, .46]) : weighted([player.attack, .18], [player.pass, .24], [player.defense, .22], [player.tackle, .18], [player.interception, .18]);
    if (role === "cm") return styleId === "box-to-box" ? weighted([player.attack, .22], [player.pass, .22], [player.defense, .25], [player.tackle, .16], [player.interception, .15]) : styleId === "deep-playmaker" ? weighted([player.pass, .52], [player.attack, .18], [player.defense, .15], [player.interception, .15]) : weighted([player.attack, .27], [player.dribble, .28], [player.pass, .3], [player.shoot, .15]);
    if (role === "dm") return styleId === "anchor" ? weighted([player.defense, .32], [player.tackle, .26], [player.block, .18], [player.interception, .24]) : styleId === "regista" ? weighted([player.pass, .5], [player.attack, .18], [player.defense, .16], [player.interception, .16]) : weighted([player.defense, .28], [player.tackle, .34], [player.block, .14], [player.interception, .24]);
    if (role === "cb") return styleId === "stopper" ? weighted([player.defense, .28], [player.tackle, .34], [player.block, .22], [player.interception, .16]) : styleId === "ball-playing" ? weighted([player.pass, .46], [player.defense, .2], [player.interception, .18], [player.attack, .16]) : weighted([player.defense, .28], [player.block, .24], [player.interception, .32], [player.pass, .16]);
    if (role === "sb") return styleId === "overlap" ? weighted([player.attack, .2], [player.dribble, .31], [player.pass, .3], [player.defense, .19]) : styleId === "inverted-fullback" ? weighted([player.pass, .4], [player.dribble, .2], [player.defense, .23], [player.interception, .17]) : weighted([player.defense, .3], [player.tackle, .28], [player.block, .18], [player.interception, .24]);
    return styleId === "shot-stopper" ? weighted([player.gk ?? 0, .62], [player.block, .23], [player.interception, .15]) : styleId === "sweeper-keeper" ? weighted([player.gk ?? 0, .5], [player.interception, .25], [player.pass, .25]) : weighted([player.gk ?? 0, .32], [player.pass, .53], [player.attack, .15]);
  }

  private roleFormationBonus(role: RoleKind, styleId: string) {
    const formationId = this.formation.id;
    const hasTwoForwards = ["4-4-2", "3-5-2", "5-3-2"].includes(formationId);
    const hasBackThree = ["3-4-3", "3-5-2", "3-6-1", "5-4-1", "5-3-2"].includes(formationId);
    const centralHeavy = ["4-5-1", "3-5-2", "3-6-1"].includes(formationId);
    if (role === "cf") return (styleId === "target" && hasTwoForwards) || (styleId === "runner" && ["4-3-3", "3-4-3"].includes(formationId)) || (styleId === "false-nine" && centralHeavy) ? 1 : 0;
    if (role === "wg") return styleId === "wide-worker" && ["3-4-3", "5-4-1"].includes(formationId) ? 1 : ["4-3-3", "3-4-3"].includes(formationId) ? 1 : 0;
    if (role === "am") return styleId === "shadow-striker" && hasTwoForwards ? 1 : styleId === "playmaker" && centralHeavy ? 1 : styleId === "pressing-ten" && formationId === "3-4-3" ? 1 : 0;
    if (role === "cm") return styleId === "deep-playmaker" && centralHeavy ? 1 : styleId === "mezzala" && ["4-3-3", "3-4-3"].includes(formationId) ? 1 : styleId === "box-to-box" && centralHeavy ? 1 : 0;
    if (role === "dm") return styleId === "anchor" && hasBackThree ? 1 : styleId === "regista" && centralHeavy ? 1 : styleId === "destroyer" && formationId === "3-4-3" ? 1 : 0;
    if (role === "cb") return styleId === "cover" && hasBackThree ? 1 : styleId === "ball-playing" && ["4-3-3", "4-5-1"].includes(formationId) ? 1 : styleId === "stopper" && formationId === "3-4-3" ? 1 : 0;
    if (role === "sb") return styleId === "overlap" && ["3-5-2", "3-6-1", "5-4-1", "5-3-2"].includes(formationId) ? 1 : styleId === "inverted-fullback" && ["4-3-3", "4-5-1", "3-6-1"].includes(formationId) ? 1 : styleId === "defensive-fullback" && ["4-4-2", "3-6-1", "5-4-1"].includes(formationId) ? 1 : 0;
    return styleId === "sweeper-keeper" && ["3-4-3", "3-5-2", "3-6-1"].includes(formationId) ? 1 : styleId === "distributor" && ["4-3-3", "4-5-1", "3-6-1"].includes(formationId) ? 1 : styleId === "shot-stopper" && ["5-4-1", "5-3-2"].includes(formationId) ? 1 : 0;
  }

  private opponentTacticalAssessment(clubId: string): OpponentTacticalAssessment {
    const club = this.clubForId(clubId);
    const fallbackPlan: OpponentTacticalPlan = { formationId: "4-3-3", mentality: "balanced", playingStyle: "possession", cohesion: 72, attackBias: 0, defenseBias: 0, trait: "基本の4-3-3", note: "バランスを保ちながら局面ごとに前進する。", roles: [] };
    const plan = opponentTactics[club.id] ?? fallbackPlan;
    const formation = formations.find((item) => item.id === plan.formationId) ?? formations[1];
    const lineup = opponentSquadFor(club.id);
    const average = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : club.rating;
    const fieldPlayers = lineup.filter((player) => player.position !== "GK");
    const baseAttack = average(fieldPlayers.map((player) => player.attack * .56 + player.pass * .28 + (player.position === "CF" || player.position === "WG" ? 5 : 0)));
    const baseDefense = average(lineup.map((player) => player.position === "GK" ? (player.gk ?? player.defense) : player.defense * .62 + player.tackle * .22 + player.interception * .16));
    const formationBonus: Record<string, [number, number]> = { "4-4-2": [0, 0], "4-3-3": [2, 0], "4-5-1": [0, 2], "3-4-3": [3, -1], "3-5-2": [1, 2], "3-6-1": [1, 4], "5-4-1": [-2, 5], "5-3-2": [0, 4] };
    const mentalityBonus: Record<Mentality, [number, number]> = { defensive: [-5, 6], balanced: [0, 0], attacking: [6, -5] };
    const styleBonus: Record<PlayingStyle, [number, number]> = { possession: [2, 1], direct: [4, -1], press: [3, -2] };
    const roleAttack = plan.roles.filter((item) => ["裏抜け", "偽9番", "インサイド・ウイング", "タッチライン・ウイング", "メッツァーラ", "オーバーラップ", "シャドーストライカー"].includes(item.role)).length;
    const roleDefense = plan.roles.filter((item) => ["アンカー", "デストロイヤー", "守備的SB", "カバー", "ストッパー", "ショットストッパー", "ワイド・ワーカー"].includes(item.role)).length;
    const cohesionBonus = Math.round((plan.cohesion - 70) / 10);
    const skillDetails = lineup.flatMap((player) => this.playerSkillActivations(player, plan.playingStyle));
    const activeSkills = skillDetails.filter((skill) => skill.active);
    const skillAttack = Math.min(4, activeSkills.reduce((sum, skill) => sum + skill.attackBoost, 0));
    const skillDefense = Math.min(4, activeSkills.reduce((sum, skill) => sum + skill.defenseBoost, 0));
    const skillSummary = activeSkills.length ? `相手スキル: ${activeSkills.map((skill) => `${skill.player}=${skill.label}`).join(" / ")}（攻+${skillAttack}/守+${skillDefense}）` : "相手スキル: 発動なし";
    const [formationAttack, formationDefense] = formationBonus[formation.id] ?? [0, 0];
    const [mentalityAttack, mentalityDefense] = mentalityBonus[plan.mentality];
    const [styleAttack, styleDefense] = styleBonus[plan.playingStyle];
    const attack = clamp(Math.round(baseAttack + formationAttack + mentalityAttack + styleAttack + plan.attackBias + Math.min(3, roleAttack) + cohesionBonus + skillAttack), 35, 95);
    const defense = clamp(Math.round(baseDefense + formationDefense + mentalityDefense + styleDefense + plan.defenseBias + Math.min(3, roleDefense) + cohesionBonus + skillDefense), 35, 95);
    const mentality = mentalityOptions.find((item) => item.id === plan.mentality) ?? mentalityOptions[1];
    const playingStyle = playingStyleOptions.find((item) => item.id === plan.playingStyle) ?? playingStyleOptions[0];
    return { clubId: club.id, club: club.name, color: club.color, formationId: formation.id, formationLabel: formation.label, mentality: plan.mentality, mentalityLabel: mentality.label, playingStyle: plan.playingStyle, playingStyleLabel: playingStyle.label, trait: plan.trait, note: plan.note, cohesion: plan.cohesion, attack, defense, total: Math.round((attack + defense) / 2), roles: plan.roles.map((item) => `${item.position} ${item.role}`), lineup, skillAttack, skillDefense, skillSummary, skillDetails };
  }

  private tacticalMatchup(tactics: TacticalAssessment, opponent: OpponentTacticalAssessment): TacticalMatchup {
    let playerAttackModifier = 0;
    let playerDefenseModifier = 0;
    let opponentAttackModifier = 0;
    let opponentDefenseModifier = 0;
    let label = "戦術拮抗";
    let note = "両軍の狙いがぶつかる。役割の遂行と選手の能力が局面を左右する。";
    if (tactics.playingStyle === "press" && opponent.playingStyle === "possession") { playerDefenseModifier = 2; opponentAttackModifier = -1; label = "プレス優位"; note = "こちらのハイプレスが相手の保持型を捕まえやすい。中央での再奪取が鍵になる。"; }
    else if (tactics.playingStyle === "direct" && opponent.playingStyle === "press") { playerAttackModifier = 2; opponentDefenseModifier = -1; label = "背後攻略"; note = "相手が前へ出る背後に、こちらのダイレクトな前進を通しやすい。"; }
    else if (tactics.playingStyle === "possession" && opponent.playingStyle === "direct") { playerDefenseModifier = 1; opponentAttackModifier = -1; label = "保持安定"; note = "ボールを動かして相手の速攻機会を減らせる。無理な縦パスは避けたい。"; }
    else if (tactics.playingStyle === "possession" && opponent.playingStyle === "press") { playerAttackModifier = -1; opponentDefenseModifier = 1; label = "圧力警戒"; note = "相手の前からの圧力を受ける。中盤の安全な出口を確保したい。"; }
    else if (tactics.playingStyle === "press" && opponent.playingStyle === "direct") { playerDefenseModifier = -1; opponentAttackModifier = 1; label = "背後警戒"; note = "こちらが前へ出るほど、相手の速攻に背後を使われるリスクがある。"; }
    if (tactics.formationLabel === "3-6-1" && opponent.formationId === "4-3-3") { playerDefenseModifier += 1; opponentAttackModifier -= 1; label = "中央封鎖"; note = "六枚の中盤で相手の三枚前線への配球経路を消しやすい。"; }
    if (opponent.formationId === "3-6-1" && tactics.playingStyle === "direct") { playerAttackModifier += 1; opponentDefenseModifier -= 1; label = "幅の活用"; note = "相手が中央を固める分、こちらは早い展開で外側のレーンを使える。"; }
    return { label, playerAttackModifier, playerDefenseModifier, opponentAttackModifier, opponentDefenseModifier, note };
  }

  score() {
    const selected = this.startingPlayers().filter((player) => this.injuryWeeksFor(player.id) === 0);
    const tactics = this.tacticalAssessment(selected);
    if (!selected.length) return { total: 0, attack: 0, defense: 0, readiness: 0, tactics };
    const baseAttack = Math.round(selected.reduce((sum, player) => sum + this.attackPower(player) * (1 - player.fatigue / 150), 0) / selected.length);
    const baseDefense = Math.round(selected.reduce((sum, player) => sum + this.defensePower(player) * (1 - player.fatigue / 150), 0) / selected.length);
    const attack = clamp(baseAttack + tactics.attackModifier, 0, 99);
    const defense = clamp(baseDefense + tactics.defenseModifier, 0, 99);
    const readiness = Math.round(100 - selected.reduce((sum, player) => sum + player.fatigue, 0) / selected.length);
    return { total: Math.round((attack + defense) / 2), attack, defense, readiness, tactics };
  }

  setMentality(mentality: Mentality) {
    if (!mentalityOptions.some((item) => item.id === mentality)) return;
    this.mentality = mentality;
    this.persist();
  }

  setPlayingStyle(playingStyle: PlayingStyle) {
    if (!playingStyleOptions.some((item) => item.id === playingStyle)) return;
    this.playingStyle = playingStyle;
    this.persist();
  }

  cfPlayStyleFor(player: Player) {
    if (!isCfEligible(player)) return null;
    return cfPlayStyleOptions.find((option) => option.id === player.cfPlayStyle) ?? cfPlayStyleOptions[0];
  }

  setCfPlayStyle(playerId: string, playStyle: CFPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = cfPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isCfEligible(player) || !option) return { ok: false, text: "CF適性を持つ選手だけが前線プレースタイルを設定できます。" };
    player.cfPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  wgPlayStyleFor(player: Player) {
    if (!isWgEligible(player)) return null;
    return wgPlayStyleOptions.find((option) => option.id === player.wgPlayStyle) ?? wgPlayStyleOptions[0];
  }

  setWgPlayStyle(playerId: string, playStyle: WGPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = wgPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isWgEligible(player) || !option) return { ok: false, text: "WG適性を持つ選手だけがウイングのプレースタイルを設定できます。" };
    player.wgPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  amPlayStyleFor(player: Player) {
    if (!isAmEligible(player)) return null;
    return amPlayStyleOptions.find((option) => option.id === player.amPlayStyle) ?? amPlayStyleOptions[0];
  }

  setAmPlayStyle(playerId: string, playStyle: AMPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = amPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isAmEligible(player) || !option) return { ok: false, text: "AM適性を持つ選手だけが攻撃的MFのプレースタイルを設定できます。" };
    player.amPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  cmPlayStyleFor(player: Player) {
    if (!isCmEligible(player)) return null;
    return cmPlayStyleOptions.find((option) => option.id === player.cmPlayStyle) ?? cmPlayStyleOptions[0];
  }

  setCmPlayStyle(playerId: string, playStyle: CMPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = cmPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isCmEligible(player) || !option) return { ok: false, text: "CM適性を持つ選手だけがセントラルMFのプレースタイルを設定できます。" };
    player.cmPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  dmPlayStyleFor(player: Player) {
    if (!isDmEligible(player)) return null;
    return dmPlayStyleOptions.find((option) => option.id === player.dmPlayStyle) ?? dmPlayStyleOptions[0];
  }

  setDmPlayStyle(playerId: string, playStyle: DMPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = dmPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isDmEligible(player) || !option) return { ok: false, text: "DM適性を持つ選手だけが守備的MFのプレースタイルを設定できます。" };
    player.dmPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  cbPlayStyleFor(player: Player) {
    if (!isCbEligible(player)) return null;
    return cbPlayStyleOptions.find((option) => option.id === player.cbPlayStyle) ?? cbPlayStyleOptions[0];
  }

  setCbPlayStyle(playerId: string, playStyle: CBPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = cbPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isCbEligible(player) || !option) return { ok: false, text: "CB適性を持つ選手だけがセンターバックのプレースタイルを設定できます。" };
    player.cbPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  sbPlayStyleFor(player: Player) {
    if (!isSbEligible(player)) return null;
    return sbPlayStyleOptions.find((option) => option.id === player.sbPlayStyle) ?? sbPlayStyleOptions[0];
  }

  setSbPlayStyle(playerId: string, playStyle: SBPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = sbPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isSbEligible(player) || !option) return { ok: false, text: "SB適性を持つ選手だけがサイドバックのプレースタイルを設定できます。" };
    player.sbPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  gkPlayStyleFor(player: Player) {
    if (!isGkEligible(player)) return null;
    return gkPlayStyleOptions.find((option) => option.id === player.gkPlayStyle) ?? gkPlayStyleOptions[0];
  }

  setGkPlayStyle(playerId: string, playStyle: GKPlayStyle) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = gkPlayStyleOptions.find((item) => item.id === playStyle);
    if (!player || !isGkEligible(player) || !option) return { ok: false, text: "GK適性を持つ選手だけがゴールキーパーのプレースタイルを設定できます。" };
    player.gkPlayStyle = option.id;
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  private matchRoleFor(player: Player) {
    const slot = this.formation.slots.find((item) => this.lineup[item.id] === player.id);
    if (!slot) return null;
    if (slot.label === "CF") return this.cfPlayStyleFor(player);
    if (slot.label === "WG" || slot.label === "SH") return this.wgPlayStyleFor(player);
    if (slot.label === "CM") return player.position === "CM" ? this.cmPlayStyleFor(player) : player.position === "AM" ? this.amPlayStyleFor(player) : player.position === "DM" ? this.dmPlayStyleFor(player) : this.cmPlayStyleFor(player) ?? this.amPlayStyleFor(player) ?? this.dmPlayStyleFor(player);
    if (slot.label === "DM") return this.dmPlayStyleFor(player) ?? this.cmPlayStyleFor(player);
    if (slot.label === "CB") return this.cbPlayStyleFor(player);
    if (slot.label === "SB") return this.sbPlayStyleFor(player);
    if (slot.label === "GK") return this.gkPlayStyleFor(player);
    return null;
  }

  applyHalfTimePlan(mentality: Mentality, playingStyle: PlayingStyle, changes: Array<{ outPlayerId: string; inPlayerId: string }>) {
    const result = this.lastResult;
    if (!result) return { ok: false, text: "進行中の試合がありません。" };
    this.rollbackSkillXp(result.skillXpGrants);
    this.mentality = mentalityOptions.some((item) => item.id === mentality) ? mentality : this.mentality;
    this.playingStyle = playingStyleOptions.some((item) => item.id === playingStyle) ? playingStyle : this.playingStyle;
    const substitutions: MatchSubstitution[] = [];
    for (const change of changes.slice(0, 3)) {
      if (change.outPlayerId === change.inPlayerId || substitutions.some((item) => item.outPlayer === change.outPlayerId || item.inPlayer === change.inPlayerId)) continue;
      const slotId = Object.entries(this.lineup).find(([, playerId]) => playerId === change.outPlayerId)?.[0];
      const outgoing = this.roster.find((player) => player.id === change.outPlayerId);
      const incoming = this.roster.find((player) => player.id === change.inPlayerId);
      if (!slotId || !outgoing || !incoming || this.injuryWeeksFor(incoming.id) > 0 || !this.playerIsFit(incoming, slotId)) continue;
      this.lineup[slotId] = incoming.id;
      outgoing.fatigue = clamp(outgoing.fatigue - 6, 0, 99);
      incoming.fatigue = clamp(incoming.fatigue + 12, 0, 99);
      substitutions.push({ outPlayer: outgoing.name, inPlayer: incoming.name, outPlayerId: outgoing.id, inPlayerId: incoming.id, slotId });
    }
    this.selectedPlayerId = null;
    const oldPlayerGoals = result.playerGoals;
    const oldOpponentGoals = result.opponentGoals;
    const oldReward = result.reward;
    const oldSponsorRevenue = result.sponsorRevenue;
    const oldLeagueWinBonus = result.won ? this.teamWinBonus : 0;
    const oldIndividualBonus = result.individualBonuses.total;
    const oldLeaguePopularity = result.leaguePopularityDelta;
    const oldFame = result.won ? 11 : oldPlayerGoals === oldOpponentGoals ? 4 : 1;
    this.restoreTeamCondition(result.matchCondition);
    const score = this.score();
    const opponent = this.clubForId(result.opponentId);
    const opponentTactics = this.opponentTacticalAssessment(opponent.id);
    const tacticalMatchup = this.tacticalMatchup(score.tactics, opponentTactics);
    const markingImpact = this.markingMatchImpact(opponentTactics);
    const matchCondition = this.matchConditionFor(result.gate.isHome);
    const matchAttack = clamp(score.attack + tacticalMatchup.playerAttackModifier + markingImpact.attackModifier + matchCondition.homeAttack + matchCondition.moraleAttack + matchCondition.momentumAttack, 0, 99);
    const matchDefense = clamp(score.defense + tacticalMatchup.playerDefenseModifier + markingImpact.defenseModifier + matchCondition.homeDefense + matchCondition.moraleDefense + matchCondition.momentumDefense, 0, 99);
    const matchWeek = Math.max(0, this.week - 1);
    const playerGoals = Math.max(result.halfTime.playerGoals, clamp(Math.round((matchAttack - (opponentTactics.defense + tacticalMatchup.opponentDefenseModifier) + 18 + deterministic(matchWeek + 4) * 24) / 20), 0, 5));
    const opponentGoals = Math.max(result.halfTime.opponentGoals, clamp(Math.round(((opponentTactics.attack + tacticalMatchup.opponentAttackModifier) - matchDefense + 22 + deterministic(matchWeek + 18) * 20) / 21), 0, 4));
    const won = playerGoals > opponentGoals;
    const draw = playerGoals === opponentGoals;
    const reward = won ? 245000 : draw ? 105000 : 48000;
    const sponsorRevenue = this.sponsor ? this.sponsor.weeklyIncome + (won ? this.sponsor.winBonus : 0) : 0;
    const leagueWinBonus = won ? this.teamWinBonus : 0;
    const leaguePopularityDelta = this.popularityChange(won, draw, result.gate.isHome, "リーグ");
    this.rollbackLeagueResult(userClub.id, result.opponentId, oldPlayerGoals, oldOpponentGoals);
    this.applyResult(userClub.id, result.opponentId, playerGoals, opponentGoals);
    this.money += reward + sponsorRevenue - oldReward - oldSponsorRevenue - leagueWinBonus + oldLeagueWinBonus;
    this.fame += (won ? 11 : draw ? 4 : 1) - oldFame;
    this.popularity = clamp(this.popularity - oldLeaguePopularity + leaguePopularityDelta, 12, 98);
    this.updateTeamCondition(won, draw, playerGoals - opponentGoals, "リーグ");
    if (result.cupResult) this.updateTeamCondition(result.cupResult.won, false, result.cupResult.playerGoals - result.cupResult.opponentGoals, "カップ");
    const updatedFlow = this.createMatchFlow(playerGoals, opponentGoals, result.opponent, score.tactics, opponentTactics, tacticalMatchup, matchCondition, matchWeek, result.halfTime);
    updatedFlow.halfTime.tacticalNote += ` / ${markingImpact.summary} / ${matchCondition.summary}`;
    const firstHalfHighlights = result.highlights.filter((item) => item.minute <= 45);
    const substitutionHighlights: MatchHighlight[] = substitutions.map((item, index) => ({ minute: 46 + index, kind: "substitution", team: "orbit", text: `${item.outPlayer} → ${item.inPlayer}。後半から交代を投入。` }));
    const secondHalfHighlights = updatedFlow.highlights.filter((item) => item.minute > 45);
    result.playerGoals = playerGoals;
    result.opponentGoals = opponentGoals;
    result.won = won;
    result.reward = reward;
    result.sponsorRevenue = sponsorRevenue;
    result.popularityDelta += leaguePopularityDelta - oldLeaguePopularity;
    result.leaguePopularityDelta = leaguePopularityDelta;
    result.popularity = this.popularity;
    result.tactics = score.tactics;
    result.opponentTactics = opponentTactics;
    result.tacticalMatchup = tacticalMatchup;
    result.markingImpact = markingImpact;
    result.matchAttack = matchAttack;
    result.matchDefense = matchDefense;
    result.matchCondition = matchCondition;
    result.conditionAfter = this.matchConditionFor(result.gate.isHome);
    result.substitutions = substitutions;
    result.halfTimeChanges = [`${score.tactics.mentalityLabel} / ${score.tactics.playingStyleLabel}`, ...substitutions.map((item) => `${item.outPlayer} → ${item.inPlayer}`)];
    result.highlights = [...firstHalfHighlights, ...substitutionHighlights, ...secondHalfHighlights].sort((a, b) => a.minute - b.minute || a.kind.localeCompare(b.kind));
    this.rollbackSeasonStats(result.playerRatings, result.mvp);
    result.playerRatings = this.createPlayerRatings(result.highlights, result.substitutions, result.injuries);
    result.markDuels = this.createMarkDuelReports(result.opponentTactics, result.playerRatings, result.playerGoals, result.opponentGoals);
    result.mvp = result.playerRatings[0] ?? null;
    this.recordSeasonStats(result.playerRatings, result.mvp);
    result.skillXpGrants = this.awardMatchSkillXp(result.playerRatings, result.tactics);
    result.individualBonuses = this.createIndividualBonusReceipt(result.playerRatings);
    this.money += oldIndividualBonus - result.individualBonuses.total;
    result.message = won ? "後半の采配が実を結び、勝利を手繰り寄せた。" : draw ? "後半の修正で、勝点を手放さなかった。" : "後半に手を打ったが、次節へ課題を残す結果となった。";
    const financeWeek = this.week;
    this.ledger.forEach((entry) => {
      if (entry.week !== financeWeek) return;
      if (entry.category === "試合賞金" && entry.note === `リーグ ${result.opponent}戦`) entry.amount = reward;
      if (entry.category === "スポンサー" && entry.note === "週次協賛・勝利ボーナス") entry.amount = sponsorRevenue;
    });
    this.ledger = this.ledger.filter((entry) => !(entry.week === financeWeek && entry.category === "出来高" && (entry.note === "リーグ勝利の選手出来高" || entry.note === `個人出来高: ${result.opponent}`)));
    if (leagueWinBonus) this.recordFinance("出来高", leagueWinBonus, "expense", "リーグ勝利の選手出来高", financeWeek);
    if (result.individualBonuses.total) this.recordFinance("出来高", result.individualBonuses.total, "expense", `個人出来高: ${result.opponent}`, financeWeek);
    if (this.cashTrail.length) this.cashTrail[this.cashTrail.length - 1] = this.money;
    this.logs.unshift(`第${this.week}節ハーフタイム采配: ${result.halfTimeChanges.join(" / ")}。最終結果 ${playerGoals}-${opponentGoals}、連携 ${score.tactics.chemistry}%。`);
    this.persist();
    return { ok: true, text: substitutions.length ? `${substitutions.length}人を交代。後半の戦術補正と結果を更新しました。` : "後半の戦術プランを反映し、結果を更新しました。" };
  }

  setFormation(formationId: string) {
    const next = formations.find((formation) => formation.id === formationId);
    if (!next) return;
    this.formationId = formationId;
    this.lineup = Object.fromEntries(next.slots.map((slot) => [slot.id, null]));
    this.selectedPlayerId = null;
    this.autoLineup();
    this.manualMarkAssignments = {};
    this.persist();
  }

  selectPlayer(playerId: string) { this.selectedPlayerId = this.selectedPlayerId === playerId ? null : playerId; }

  trainingLoadFor(player: Player) { return trainingLoadOptions.find((option) => option.id === player.trainingLoad) ?? trainingLoadOptions[2]; }

  setTrainingLoad(playerId: string, load: TrainingLoad) {
    const player = this.roster.find((item) => item.id === playerId);
    const option = trainingLoadOptions.find((item) => item.id === load);
    if (!player || !option) return { ok: false, text: "対象選手または練習負荷を確認できませんでした。" };
    player.trainingLoad = option.id;
    this.logs.unshift(`${player.name}の個別練習負荷を「${option.label}」へ設定。`);
    this.persist();
    return { ok: true, text: `${player.name}を「${option.label}」に設定しました。${option.copy}` };
  }

  assignSelected(slotId: string) {
    const player = this.selectedPlayer;
    if (!player || this.injuryWeeksFor(player.id) > 0) return false;
    const existingSlot = Object.entries(this.lineup).find(([, playerId]) => playerId === player.id)?.[0];
    if (existingSlot) this.lineup[existingSlot] = null;
    this.lineup[slotId] = player.id;
    this.selectedPlayerId = null;
    this.pruneManualMarkAssignments();
    this.persist();
    return true;
  }

  private autoLineupScore(player: Player, slotId: string) {
    const slot = this.formation.slots.find((item) => item.id === slotId);
    const primaryFit = Boolean(slot?.allowed.includes(player.position));
    const secondaryFit = Boolean(!primaryFit && player.secondary && slot?.allowed.includes(player.secondary));
    const fatiguePenalty = player.fatigue * .28 + (player.fatigue >= 80 ? 8 : player.fatigue >= 60 ? 3 : 0);
    return this.playerPower(player) + (primaryFit ? 8 : secondaryFit ? 2 : 0) - fatiguePenalty;
  }

  autoLineup() {
    const remaining = [...this.roster].filter((player) => this.injuryWeeksFor(player.id) === 0);
    const next: Record<string, string | null> = {};
    for (const slot of this.formation.slots) {
      const candidates = remaining.filter((player) => this.playerIsFit(player, slot.id));
      const pool = candidates.length ? candidates : remaining;
      const player = [...pool].sort((a, b) => this.autoLineupScore(b, slot.id) - this.autoLineupScore(a, slot.id))[0];
      if (player) {
        const index = remaining.findIndex((item) => item.id === player.id);
        if (index >= 0) remaining.splice(index, 1);
      }
      next[slot.id] = player?.id ?? null;
    }
    this.lineup = next;
    this.selectedPlayerId = null;
    this.pruneManualMarkAssignments();
    this.persist();
  }

  private trainingTargets(focus: TrainingFocus) {
    const starters = this.roster.filter((player) => Object.values(this.lineup).includes(player.id) && this.injuryWeeksFor(player.id) === 0);
    return focus === "goalkeeping" ? this.roster.filter((player) => player.position === "GK" && this.injuryWeeksFor(player.id) === 0) : focus === "recovery" ? starters : starters.filter((player) => player.position !== "GK");
  }

  private buildTrainingRecommendation(): TrainingRecommendation {
    const starters = this.roster.filter((player) => Object.values(this.lineup).includes(player.id));
    const averageFatigue = starters.length ? Math.round(starters.reduce((sum, player) => sum + player.fatigue, 0) / starters.length) : 0;
    const highFatiguePlayers = starters.filter((player) => player.fatigue >= 60).length;
    const highLoadPlayers = starters.filter((player) => this.trainingLoadFor(player).id === "high").length;
    const injuryCount = starters.filter((player) => this.injuryWeeksFor(player.id) > 0).length;
    if (averageFatigue >= 54 || highFatiguePlayers >= 3 || injuryCount >= 2 || highLoadPlayers >= 3) return { focus: "recovery", label: "リカバリー", grade: "回復優先", averageFatigue, highFatiguePlayers, highLoadPlayers, injuryCount, reason: `平均疲労 ${averageFatigue}、高疲労 ${highFatiguePlayers}人、高負荷 ${highLoadPlayers}人。次節前は回復を優先し、過負荷を避けましょう。` };
    const score = this.score();
    const focus: TrainingFocus = score.attack < score.defense ? "attacking" : score.defense < score.attack ? "defending" : "passing";
    const option = trainingOptions.find((item) => item.id === focus) ?? trainingOptions[0];
    return { focus, label: option.label, grade: averageFatigue >= 38 || highFatiguePlayers || highLoadPlayers ? "調整推奨" : "実施可", averageFatigue, highFatiguePlayers, highLoadPlayers, injuryCount, reason: averageFatigue >= 38 || highLoadPlayers ? `平均疲労 ${averageFatigue}、高負荷 ${highLoadPlayers}人。負荷は管理可能ですが、実施後は次節までの回復を意識してください。` : `${score.attack <= score.defense ? "攻撃" : "守備"}の総合値を補う ${option.label} が有効です。現在の平均疲労は ${averageFatigue} です。` };
  }

  trainingRiskReport(focus: TrainingFocus): TrainingRiskReport {
    const targets = this.trainingTargets(focus);
    const averageFatigue = targets.length ? targets.reduce((sum, player) => sum + player.fatigue, 0) / targets.length : 0;
    const highFatigue = targets.filter((player) => player.fatigue >= 60).length;
    const averageLoadRisk = targets.length ? targets.reduce((sum, player) => sum + this.trainingLoadFor(player).riskAdjustment, 0) / targets.length : 0;
    const highLoad = ["attacking", "finishing", "defending"].includes(focus) ? 5 : focus === "goalkeeping" ? 3 : focus === "passing" ? 2 : -12;
    const chance = focus === "recovery" ? 0 : clamp(Math.round(Math.max(0, averageFatigue - 42) * .72 + highFatigue * 3 + highLoad + averageLoadRisk - this.trainingFacility.riskReduction), 0, 45);
    const grade: TrainingRiskReport["grade"] = chance >= 18 ? "高" : chance >= 8 ? "注意" : "低";
    const atRiskNames = targets.filter((player) => player.fatigue >= 55 || this.trainingLoadFor(player).id === "high").sort((a, b) => b.fatigue + this.trainingLoadFor(b).riskAdjustment - (a.fatigue + this.trainingLoadFor(a).riskAdjustment)).slice(0, 3).map((player) => player.name);
    const highLoadNames = targets.filter((player) => this.trainingLoadFor(player).id === "high").map((player) => player.name);
    const note = chance === 0 ? "回復メニューは過負荷リスクを増やしません。" : grade === "高" ? `高リスクの ${atRiskNames.join("、") || "主力"} に負荷がかかります。回復・軽め設定も検討してください。` : grade === "注意" ? `${highLoadNames.length ? `${highLoadNames.join("、")}の高負荷設定を含みます。` : "疲労が蓄積しています。"} 次節までの回復余地を残しましょう。` : "現時点の負荷は管理可能です。";
    return { chance, grade, atRiskNames, highLoadNames, note };
  }

  private applyTrainingInjury(focus: TrainingFocus, targets: Player[], risk: TrainingRiskReport) {
    if (focus === "recovery" || risk.chance <= 0 || !targets.length) return null;
    const focusSeed = Array.from(focus).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    const roll = (this.week * 31 + this.trainingSessionsUsed * 17 + focusSeed + targets.length * 7) % 100;
    if (roll >= risk.chance) return null;
    const player = [...targets].sort((a, b) => b.fatigue + this.trainingLoadFor(b).riskAdjustment - (a.fatigue + this.trainingLoadFor(a).riskAdjustment) || b.age - a.age)[0];
    const weeks = risk.grade === "高" ? 2 : 1;
    this.injuries[player.id] = Math.max(this.injuryWeeksFor(player.id), weeks);
    player.injuryWeeks = this.injuries[player.id];
    return { player: player.name, weeks };
  }

  upgradeTrainingFacility() {
    const facility = this.trainingFacility;
    if (!facility.nextCost || !facility.nextName) return { ok: false, text: "練習施設は最高レベルです。週次枠と負荷管理を最大限に活用できます。" };
    if (this.money < facility.nextCost) return { ok: false, text: `改修には ${facility.nextCost.toLocaleString()}円が必要です。資金を確保してから着手しましょう。` };
    this.money -= facility.nextCost;
    this.recordFinance("施設投資", facility.nextCost, "expense", `${facility.nextName} への改修`, this.currentWeek);
    this.trainingFacilityLevel += 1;
    const upgraded = this.trainingFacility;
    this.captureCashPoint();
    this.logs.unshift(`練習施設を ${upgraded.name}（Lv.${upgraded.level}）へ改修。週${upgraded.weeklySlots}枠と負荷管理が利用可能になった。`);
    this.persist();
    return { ok: true, text: `${upgraded.name} を稼働開始。週${upgraded.weeklySlots}枠、負傷リスク −${upgraded.riskReduction}% を反映します。` };
  }

  train(focus: TrainingFocus = "attacking") {
    const option = trainingOptions.find((item) => item.id === focus) ?? trainingOptions[0];
    if (!this.canTrainThisWeek) return { ok: false, text: `今週の練習枠を使い切りました（${this.trainingSessionsUsed}/${this.trainingFacility.weeklySlots}）。次節へ進むと再開できます。` };
    if (this.money < option.cost) return { ok: false, text: "資金が不足しています。スポンサー収入や次節の賞金を確保しましょう。" };
    const boosted = this.trainingTargets(focus);
    if (!boosted.length) return { ok: false, text: "このメニューの対象選手がいません。編成を確認してください。" };
    const facility = this.trainingFacility;
    const risk = this.trainingRiskReport(focus);
    this.money -= option.cost;
    this.recordFinance("トレーニング", option.cost, "expense", `${option.label}を実施`, this.currentWeek);
    this.captureCashPoint();
    const before = { attack: boosted.reduce((sum, player) => sum + player.attack, 0), defense: boosted.reduce((sum, player) => sum + player.defense, 0), dribble: boosted.reduce((sum, player) => sum + player.dribble, 0), pass: boosted.reduce((sum, player) => sum + player.pass, 0), shoot: boosted.reduce((sum, player) => sum + player.shoot, 0), tackle: boosted.reduce((sum, player) => sum + player.tackle, 0), block: boosted.reduce((sum, player) => sum + player.block, 0), interception: boosted.reduce((sum, player) => sum + player.interception, 0), gk: boosted.reduce((sum, player) => sum + (player.gk ?? 0), 0), fatigue: boosted.reduce((sum, player) => sum + player.fatigue, 0) };
    boosted.forEach((player, index) => {
      const load = this.trainingLoadFor(player);
      const skill = (base: number) => Math.max(0, base + facility.growthBonus + load.growthAdjustment);
      const fatigue = (base: number) => clamp(player.fatigue + base + (focus === "recovery" ? Math.min(0, load.fatigueAdjustment) : load.fatigueAdjustment), 0, 99);
      if (focus === "attacking") { player.attack += skill(1); player.dribble += skill(1); player.pass += Math.max(0, index % 2 + load.growthAdjustment); player.shoot += skill(1); player.fatigue = fatigue(7); }
      if (focus === "passing") { player.attack += skill(1); player.pass += skill(2); player.dribble += Math.max(0, index % 2 + load.growthAdjustment); player.fatigue = fatigue(5); }
      if (focus === "finishing") { player.attack += skill(1); player.shoot += skill(2); player.dribble += Math.max(0, (index % 3 === 0 ? 1 : 0) + load.growthAdjustment); player.fatigue = fatigue(8); }
      if (focus === "defending") { player.defense += skill(1); player.tackle += skill(1); player.block += Math.max(0, index % 2 + load.growthAdjustment); player.interception += skill(1); player.fatigue = fatigue(7); }
      if (focus === "goalkeeping") { player.gk = (player.gk ?? 50) + skill(2); player.pass += skill(1); player.fatigue = fatigue(6); }
      if (focus === "recovery") player.fatigue = fatigue(-13);
    });
    const skillXpGrants = focus === "recovery" ? [] : boosted.flatMap((player) => {
      const target = this.skillTrainingTargetFor(player);
      if (!target || !playerSkillGrowthFocus[target.skillId].includes(focus)) return [];
      const load = this.trainingLoadFor(player);
      const amount = 4 + facility.growthBonus + Math.max(0, load.growthAdjustment);
      const grant = this.grantSkillXp(player, target.skillId, amount, "練習");
      return grant ? [grant] : [];
    });
    const after = { attack: boosted.reduce((sum, player) => sum + player.attack, 0), defense: boosted.reduce((sum, player) => sum + player.defense, 0), dribble: boosted.reduce((sum, player) => sum + player.dribble, 0), pass: boosted.reduce((sum, player) => sum + player.pass, 0), shoot: boosted.reduce((sum, player) => sum + player.shoot, 0), tackle: boosted.reduce((sum, player) => sum + player.tackle, 0), block: boosted.reduce((sum, player) => sum + player.block, 0), interception: boosted.reduce((sum, player) => sum + player.interception, 0), gk: boosted.reduce((sum, player) => sum + (player.gk ?? 0), 0), fatigue: boosted.reduce((sum, player) => sum + player.fatigue, 0) };
    const labels: Array<[keyof typeof before, string]> = [["attack", "OF"], ["defense", "DF"], ["dribble", "ドリブル"], ["pass", "パス"], ["shoot", "シュート"], ["tackle", "タックル"], ["block", "ブロック"], ["interception", "パスカット"], ["gk", "GK"]];
    const changes = labels.map(([key, label]) => ({ label, amount: after[key] - before[key] })).filter((item) => item.amount > 0).map((item) => `${item.label} +${item.amount}`);
    if (skillXpGrants.length) changes.push(`SKILL XP +${skillXpGrants.reduce((sum, grant) => sum + grant.xp, 0)}`);
    skillXpGrants.filter((grant) => grant.learned).forEach((grant) => changes.push(`${grant.player}が${grant.label}を習得`));
    skillXpGrants.filter((grant) => grant.levelUp).forEach((grant) => changes.push(`${grant.player} ${grant.label} Lv.UP`));
    const fatigueChange = after.fatigue - before.fatigue;
    const trainingInjury = this.applyTrainingInjury(focus, boosted, risk);
    if (trainingInjury) changes.push(`負傷注意 ${trainingInjury.player}`);
    this.trainingHistory.unshift({ week: this.currentWeek, focus, label: option.label, affected: boosted.length, changes, fatigueChange });
    if (this.trainingHistory.length > 16) this.trainingHistory.splice(16);
    if (this.lastTrainingWeek !== this.week) this.trainingSessionsThisWeek = 0;
    this.lastTrainingWeek = this.week;
    this.trainingSessionsThisWeek += 1;
    this.logs.unshift(trainingInjury ? `${option.label}を実施。${trainingInjury.player}が過負荷で${trainingInjury.weeks}週の離脱。` : `${option.label}を実施。${option.copy}`);
    this.persist();
    return { ok: true, text: trainingInjury ? `${option.label}を完了しましたが、${trainingInjury.player}が過負荷で離脱しました。` : `${option.label}を完了。残り練習枠は${this.trainingSessionsRemaining}です。` };
  }

  developYouth() {
    if (!this.youthPlayers.length) return { ok: false, text: "育成中のユース選手はいません。次のスカウトサイクルを待ちましょう。" };
    const cost = this.youthTrainingCost;
    if (this.money < cost) return { ok: false, text: "ユースセッションの費用を確保できません。資金計画を確認してください。" };
    this.money -= cost;
    this.recordFinance("育成", cost, "expense", `ユース育成セッション ${this.youthPlayers.length}名`, this.currentWeek);
    const skillGrants = this.youthPlayers.flatMap((player, index) => {
      player.academyWeeks += 1;
      if (["CF", "WG", "SH"].includes(player.position)) { player.attack += 1; player.dribble += 1; player.shoot += index % 2; }
      if (["AM", "CM"].includes(player.position)) { player.attack += 1; player.pass += 1; player.dribble += index % 2; }
      if (["DM", "CB", "SB"].includes(player.position)) { player.defense += 1; player.tackle += 1; player.interception += index % 2; }
      if (player.position === "GK") { player.gk = (player.gk ?? 50) + 1; player.pass += 1; }
      if (player.academyWeeks % 2 === 0 && player.level < player.ceiling) player.level += 1;
      const target = player.skillTrainingTarget ?? player.youthSkillTendency?.developmentSkill ?? playerSkillsFor(player)[0];
      const paceBonus = player.youthSkillTendency?.growthPace === "早熟" ? 2 : player.youthSkillTendency?.growthPace === "標準" ? 1 : 0;
      const grant = this.grantSkillXp(player, target, 10 + paceBonus + (player.youthScoutXpBonus ?? 0) + (player.youthScoutStaffSessionXpBonus ?? 0), "ユース");
      return grant ? [grant] : [];
    });
    this.captureCashPoint();
    const skillSummary = skillGrants.length ? ` 重点スキルXP +${skillGrants.reduce((sum, grant) => sum + grant.xp, 0)}。` : "";
    this.logs.unshift(`ユース育成セッションを実施。${this.youthPlayers.length}名の基礎能力と将来性を高めた。${skillSummary}`);
    this.persist();
    return { ok: true, text: `ユース${this.youthPlayers.length}名を育成しました。重点スキルXP +${skillGrants.reduce((sum, grant) => sum + grant.xp, 0)}。3セッションでトップ昇格の基準に達します。` };
  }

  promoteYouth(playerId: string) {
    const player = this.youthPlayers.find((item) => item.id === playerId);
    if (!player) return { ok: false, text: "昇格対象のユース選手を確認できませんでした。" };
    if (player.academyWeeks < 3) return { ok: false, text: `${player.name}はあと${3 - player.academyWeeks}回の育成セッションが必要です。` };
    if (this.roster.length >= ROSTER_LIMIT) return { ok: false, text: `トップ登録が${ROSTER_LIMIT}人に達しています。売却または契約整理を進めてください。` };
    const fee = 180000;
    if (this.money < fee) return { ok: false, text: "トップ昇格に必要な登録・育成費を確保できません。" };
    this.money -= fee;
    this.recordFinance("育成", fee, "expense", `${player.name}をユースからトップ昇格`, this.currentWeek);
    this.roster.push(this.hydratePlayer({ ...player, fatigue: 0, contractYears: 3, trainingLoad: "standard" }));
    this.ensureSeasonStat(player);
    this.youthPlayers = this.youthPlayers.filter((item) => item.id !== playerId);
    this.fame += 4;
    this.captureCashPoint();
    this.logs.unshift(`${player.name}をユースからトップチームへ昇格。クラブの育成成果が名声を押し上げた。`);
    this.persist();
    return { ok: true, text: `${player.name}をトップチームへ昇格しました。` };
  }

  private ensureCurrentRecruitNegotiation() {
    const candidate = this.currentMarketCandidate;
    if (!candidate) return null;
    if (this.recruitNegotiation.candidateId !== candidate.id) this.recruitNegotiation = initialRecruitNegotiation(candidate);
    return candidate;
  }

  setMarketPreferredPosition(position: Player["position"]) {
    const current = new Set(this.marketPreferredPositions);
    if (current.has(position)) current.delete(position); else current.add(position);
    this.marketPreferredPositions = Array.from(current);
    this.persist();
    const nextRefresh = this.marketNextRefreshWeek;
    const selected = this.marketPreferredPositions.join(" / ");
    return { ok: true, text: this.marketPreferredPositions.length ? `${selected}を希望ポジションに登録しました。第${nextRefresh}節の市場更新で該当選手だけを一覧にします。` : `希望ポジションを解除しました。第${nextRefresh}節は全ポジションから候補を更新します。` };
  }

  clearMarketPreferredPositions() {
    if (!this.marketPreferredPositions.length) return { ok: false, text: "希望ポジションは選択されていません。" };
    this.marketPreferredPositions = [];
    this.persist();
    return { ok: true, text: `希望ポジションをすべて解除しました。第${this.marketNextRefreshWeek}節は全ポジションから候補を更新します。` };
  }

  dismissMarketUpdateNotice() {
    if (!this.pendingMarketUpdateNotice) return null;
    const notice = this.marketUpdateNotice;
    this.pendingMarketUpdateNotice = null;
    this.persist();
    return notice;
  }

  private get marketCandidates() {
    return this.marketCandidateIds
      .map((id) => marketRecruits.find((player) => player.id === id))
      .filter((player): player is Player => player !== undefined && !this.marketSignedIds.includes(player.id));
  }

  private buildMarketCandidateIds() {
    const available = marketRecruits.filter((player) => !this.marketSignedIds.includes(player.id));
    const requested = this.marketPreferredPositions.length
      ? available.filter((player) => this.marketPreferredPositions.includes(player.position) || (player.secondary !== undefined && this.marketPreferredPositions.includes(player.secondary)))
      : available;
    const pool = this.marketPreferredPositions.length ? requested : available;
    if (!pool.length) return [];
    const offset = (Math.floor(this.week / 3) * 4) % pool.length;
    return [...pool.slice(offset), ...pool.slice(0, offset)].slice(0, Math.min(4, pool.length)).map((player) => player.id);
  }

  private ensureMarketCandidateList() {
    const expectedCycle = Math.floor(this.week / 3) * 3;
    const candidateIdsAreValid = this.marketCandidateIds.length > 0 && this.marketCandidateIds.every((id) => marketRecruits.some((player) => player.id === id));
    if (candidateIdsAreValid && this.marketCandidateCycle === expectedCycle) return;
    this.marketCandidateCycle = expectedCycle;
    this.marketCandidateIds = this.buildMarketCandidateIds();
    const candidate = this.marketCandidates[0];
    this.recruitNegotiation = candidate ? initialRecruitNegotiation(candidate) : initialRecruitNegotiation();
  }

  private refreshMarketCandidates(notify = false) {
    this.marketCandidateCycle = this.week;
    this.marketCandidateIds = this.buildMarketCandidateIds();
    const candidate = this.marketCandidates[0];
    this.recruitNegotiation = candidate ? initialRecruitNegotiation(candidate) : initialRecruitNegotiation();
    if (notify) this.pendingMarketUpdateNotice = { week: this.week, candidateIds: [...this.marketCandidateIds], requestedPositions: [...this.marketPreferredPositions] };
    return this.marketPreferredPositions.length
      ? `希望ポジション（${this.marketPreferredPositions.join(" / ")}）に限定して${this.marketCandidateIds.length}名の市場候補を更新。`
      : `${this.marketCandidateIds.length}名の市場候補を更新。`;
  }

  private scoutCandidate(candidate: Player): Player {
    const facility = this.scoutFacility;
    const boost = facility.ratingBoost;
    const boosted = (value: number) => clamp(value + boost, 0, 99);
    return { ...candidate, attack: boosted(candidate.attack), defense: boosted(candidate.defense), dribble: boosted(candidate.dribble), pass: boosted(candidate.pass), shoot: boosted(candidate.shoot), tackle: boosted(candidate.tackle), block: boosted(candidate.block), interception: boosted(candidate.interception), gk: candidate.gk === undefined ? undefined : boosted(candidate.gk), ceiling: clamp(candidate.ceiling + facility.ceilingBoost, candidate.level, 10) };
  }

  private scoutTacticalFit(candidate: Player): ScoutTacticalFit {
    const formation = this.formation;
    const identity = formationIdentities[formation.id] ?? formationIdentities["4-3-3"];
    const mentality = mentalityOptions.find((item) => item.id === this.mentality) ?? mentalityOptions[1];
    const style = playingStyleOptions.find((item) => item.id === this.playingStyle) ?? playingStyleOptions[0];
    const wideSystem = ["4-3-3", "3-4-3"].includes(formation.id);
    const centralSystem = ["4-5-1", "3-5-2", "3-6-1"].includes(formation.id);
    const backFive = ["5-4-1", "5-3-2"].includes(formation.id);
    const twoStrikers = ["4-4-2", "3-5-2", "5-3-2"].includes(formation.id);
    let formationScore = 68;
    if (formation.slots.some((slot) => slot.allowed.includes(candidate.position) || (candidate.secondary && slot.allowed.includes(candidate.secondary)))) formationScore += 11;
    if (wideSystem && ["WG", "SH", "SB"].includes(candidate.position)) formationScore += 9;
    if (centralSystem && ["CM", "AM", "DM"].includes(candidate.position)) formationScore += 9;
    if (backFive && ["CB", "SB", "DM"].includes(candidate.position)) formationScore += 8;
    if (twoStrikers && candidate.position === "CF") formationScore += 7;
    if (["4-5-1", "3-6-1"].includes(formation.id) && candidate.position === "CF") formationScore -= 4;
    formationScore = clamp(formationScore, 45, 95);
    const balance = candidate.attack - candidate.defense;
    const mentalityScore = this.mentality === "attacking" ? clamp(72 + balance * .42, 48, 96) : this.mentality === "defensive" ? clamp(72 - balance * .42, 48, 96) : clamp(84 - Math.max(0, Math.abs(balance) - 18) * .55, 58, 93);
    const styleBase = this.playingStyle === "possession" ? candidate.pass * .5 + candidate.dribble * .2 + candidate.interception * .15 + candidate.attack * .15 : this.playingStyle === "direct" ? candidate.shoot * .36 + candidate.dribble * .28 + candidate.attack * .22 + candidate.pass * .14 : candidate.tackle * .32 + candidate.interception * .28 + candidate.defense * .24 + candidate.attack * .16;
    const playingStyleScore = clamp(Math.round(styleBase), 45, 96);
    const teamChemistry = this.roster.map((player) => player.chemistry);
    const sameType = teamChemistry.filter((type) => type === candidate.chemistry).length;
    const compatible = teamChemistry.filter((type) => (candidate.chemistry === "spark" && type === "steady") || (candidate.chemistry === "steady" && type !== "steady") || (candidate.chemistry === "edge" && type === "steady")).length;
    const chemistryScore = clamp(63 + Math.min(18, sameType * 4) + Math.min(9, compatible * 2), 58, 93);
    const score = clamp(Math.round(formationScore * .32 + mentalityScore * .2 + playingStyleScore * .3 + chemistryScore * .18), 40, 98);
    const grade: ScoutTacticalFit["grade"] = score >= 86 ? "戦術の核" : score >= 74 ? "高適合" : score >= 62 ? "起用可能" : "調整が必要";
    const strengths = [
      `${formation.label}の「${identity.trait}」で${candidate.position}の役割を担える。`,
      `${style.label}では${this.playingStyle === "possession" ? `パス ${candidate.pass} とドリブル ${candidate.dribble}` : this.playingStyle === "direct" ? `シュート ${candidate.shoot} とドリブル ${candidate.dribble}` : `タックル ${candidate.tackle} とパスカット ${candidate.interception}`}が武器になる。`,
      `${candidate.chemistry === "spark" ? "推進力" : candidate.chemistry === "steady" ? "安定感" : "緊張感"}をもたらす${candidate.chemistry === "spark" ? "SPARK" : candidate.chemistry === "steady" ? "STEADY" : "EDGE"}型で、現行グループとの連携見込みは${chemistryScore}。`,
    ];
    const lowest = [{ label: "フォーメーション", value: formationScore }, { label: "攻守意識", value: mentalityScore }, { label: "プレースタイル", value: playingStyleScore }, { label: "連携", value: chemistryScore }].sort((a, b) => a.value - b.value)[0];
    const concern = lowest.value >= 75 ? "現行プランの中で大きな衝突要因は少ない。起用時間を確保すれば、戦術の選択肢を広げられる。" : `${lowest.label}の相性は${lowest.value}。加入後は役割設定や起用位置を調整して、強みを引き出したい。`;
    return { score, grade, formation: formationScore, mentality: Math.round(mentalityScore), playingStyle: playingStyleScore, chemistry: chemistryScore, formationLabel: formation.label, mentalityLabel: mentality.label, playingStyleLabel: style.label, strengths, concern };
  }

  private recruitmentPriorityBoard(): RecruitmentPriority[] {
    const positions: Player["position"][] = ["GK", "CB", "SB", "DM", "CM", "AM", "SH", "WG", "CF"];
    return positions.map((position) => {
      const demand = this.formation.slots.filter((slot) => slot.allowed.includes(position)).length;
      const relevant = this.roster.filter((player) => player.position === position || player.secondary === position);
      const availablePlayers = relevant.filter((player) => this.injuryWeeksFor(player.id) === 0);
      const injuryCount = relevant.length - availablePlayers.length;
      const fatigueRisk = relevant.filter((player) => player.fatigue >= 60).length;
      const contractRisk = relevant.filter((player) => (player.contractYears ?? defaultContractYears(player)) <= 1).length;
      const ageRisk = relevant.filter((player) => player.age >= 29).length;
      const averagePower = relevant.length ? Math.round(relevant.reduce((sum, player) => sum + this.playerPower(player), 0) / relevant.length) : 0;
      const desiredCoverage = position === "GK" ? Math.max(2, demand) : Math.max(1, demand + 1);
      const shortage = Math.max(0, desiredCoverage - availablePlayers.length);
      const demandWeight = demand ? 5 : 1;
      const strengthRisk = relevant.length ? Math.max(0, 66 - averagePower) * .55 : 26;
      const score = clamp(Math.round(shortage * 24 + injuryCount * 13 + fatigueRisk * 7 + contractRisk * 9 + ageRisk * 5 + strengthRisk + demandWeight), 5, 98);
      const grade: RecruitmentPriority["grade"] = score >= 72 ? "最優先" : score >= 53 ? "高" : score >= 33 ? "中" : "低";
      const reasons: string[] = [];
      if (shortage) reasons.push(`必要${desiredCoverage}人に対して稼働${availablePlayers.length}人。`);
      if (injuryCount) reasons.push(`${injuryCount}人が離脱中。`);
      if (fatigueRisk) reasons.push(`${fatigueRisk}人が疲労注意域。`);
      if (contractRisk) reasons.push(`${contractRisk}人が契約最終年。`);
      if (ageRisk) reasons.push(`${ageRisk}人がベテラン域。`);
      if (averagePower && averagePower < 66) reasons.push(`平均戦力 ${averagePower}。即戦力の上積みを検討。`);
      if (!reasons.length) reasons.push(`稼働${availablePlayers.length}人、平均戦力${averagePower}で現時点の層は安定。`);
      return { position, score, grade, demand, coverage: relevant.length, available: availablePlayers.length, averagePower, injuryCount, fatigueRisk, contractRisk, ageRisk, reasons };
    }).sort((a, b) => b.score - a.score || b.demand - a.demand || a.position.localeCompare(b.position));
  }

  private buildMarketCandidateComparison(): MarketCandidateComparison[] {
    const priorities = this.recruitmentPriorities;
    const currentId = this.currentMarketCandidate?.id;
    return this.marketCandidates.map((player) => {
      const scouted = this.scoutCandidate(player);
      const priority = priorities.filter((item) => item.position === scouted.position || item.position === scouted.secondary).sort((a, b) => b.score - a.score)[0] ?? priorities.at(-1)!;
      const status: MarketCandidateComparison["status"] = scouted.id === currentId ? "閲覧中" : "市場候補";
      return { player: scouted, tacticalFit: this.scoutTacticalFit(scouted), recruitmentPriority: priority, openingFee: Math.round(scouted.salary * .82), annualImpact: scouted.salary, status };
    }).sort((a, b) => b.recruitmentPriority.score - a.recruitmentPriority.score || b.tacticalFit.score - a.tacticalFit.score || a.openingFee - b.openingFee);
  }

  private buildContractAlerts(): ContractAlert[] {
    const priorities = this.recruitmentPriorities;
    return this.contractDuePlayers.map((player) => {
      const positionPriority = priorities.filter((item) => item.position === player.position || item.position === player.secondary).sort((a, b) => b.score - a.score)[0] ?? priorities.at(-1)!;
      const years = player.contractYears ?? defaultContractYears(player);
      const renewalFee = this.contractRenewalFee(player);
      const urgency: ContractAlert["urgency"] = positionPriority.score >= 53 || player.level >= 5 ? "至急" : "要判断";
      const note = urgency === "至急" ? `${positionPriority.position}の層に影響します。移籍市場へ出る前に条件を整理したい。` : `更新費 ${renewalFee.toLocaleString()}円と年俸条件を、後継候補と比較して判断できます。`;
      return { player, positionPriority, renewalFee, years, urgency, note };
    }).sort((a, b) => (a.urgency === "至急" ? -1 : 1) - (b.urgency === "至急" ? -1 : 1) || b.positionPriority.score - a.positionPriority.score || b.player.level - a.player.level);
  }

  negotiateRecruit() {
    const candidate = this.ensureCurrentRecruitNegotiation();
    if (!candidate) return { ok: false, text: "今季に提示できる候補は全員と契約済みです。" };
    if (this.recruitNegotiation.stage === "scouting") {
      this.recruitNegotiation = { ...this.recruitNegotiation, stage: "countered" };
      this.logs.unshift(`${candidate.name}へ移籍金 ${this.recruitNegotiation.openingOffer.toLocaleString()}円を提示。相手クラブは ${this.recruitNegotiation.counterOffer.toLocaleString()}円を要求した。`);
      this.persist();
      return { ok: true, text: `先方から ${this.recruitNegotiation.counterOffer.toLocaleString()}円の対案が届きました。` };
    }
    if (this.recruitNegotiation.stage === "countered") {
      this.recruitNegotiation = { ...this.recruitNegotiation, stage: "agreed", agreedFee: this.recruitNegotiation.counterOffer };
      this.logs.unshift(`${candidate.name}の移籍金 ${this.recruitNegotiation.counterOffer.toLocaleString()}円でクラブ間合意。本人との契約を締結できます。`);
      this.persist();
      return { ok: true, text: "クラブ間で移籍金に合意しました。契約締結へ進めます。" };
    }
    return { ok: false, text: "移籍金はすでに合意済みです。契約を締結してください。" };
  }

  signRecruit() {
    const candidate = this.ensureCurrentRecruitNegotiation();
    if (!candidate) return { ok: false, text: "今季に提示できる候補は全員と契約済みです。" };
    if (this.recruitNegotiation.stage !== "agreed" || !this.recruitNegotiation.agreedFee) return { ok: false, text: "まず移籍金交渉を完了し、クラブ間合意を取り付けてください。" };
    if (this.roster.length >= ROSTER_LIMIT) return { ok: false, text: `トップ登録が${ROSTER_LIMIT}人に達しています。売却または契約整理を進めてください。` };
    const fee = this.recruitNegotiation.agreedFee;
    if (this.money < fee) return { ok: false, text: "移籍金が不足しています。資金を確保してから契約しましょう。" };
    this.money -= fee;
    this.recordFinance("移籍", fee, "expense", `${candidate.name}の移籍金`, this.currentWeek);
    this.captureCashPoint();
    this.roster.push(this.hydratePlayer({ ...candidate, contractYears: 3, trainingLoad: "standard" }));
    this.ensureSeasonStat(candidate);
    this.marketSignedIds.push(candidate.id);
    this.recruited = this.recruited || candidate.id === recruit.id;
    this.fame += 18;
    this.logs.unshift(`市場から${candidate.name}を獲得。移籍金 ${fee.toLocaleString()}円、年俸 ${candidate.salary.toLocaleString()}円で3年契約を締結した。`);
    this.persist();
    return { ok: true, text: `${candidate.name}と3年契約を締結しました。市場候補は次のサイクルで入れ替わります。` };
  }

  respondToSaleOffer(offerId: string, accept: boolean) {
    const offer = this.saleOffers.find((item) => item.id === offerId);
    if (!offer) return { ok: false, text: "この売却オファーはすでに処理されています。" };
    const player = this.roster.find((item) => item.id === offer.playerId);
    if (!player) { this.saleOffers = this.saleOffers.filter((item) => item.id !== offerId); this.persist(); return { ok: false, text: "対象選手はすでにクラブに在籍していません。" }; }
    if (!accept) {
      this.saleOffers = this.saleOffers.filter((item) => item.id !== offerId);
      this.logs.unshift(`${offer.clubName}からの${player.name}に対する移籍オファーを見送った。`);
      this.persist();
      return { ok: true, text: `${player.name}へのオファーを見送りました。` };
    }
    if (this.roster.length <= 15) return { ok: false, text: "登録選手が15人を下回るため、まず補強を進めてください。" };
    this.money += offer.proposedFee;
    this.recordFinance("移籍", offer.proposedFee, "income", `${player.name}を${offer.clubName}へ売却`, this.currentWeek);
    this.captureCashPoint();
    this.roster = this.roster.filter((item) => item.id !== player.id);
    Object.entries(this.lineup).forEach(([slotId, playerId]) => { if (playerId === player.id) this.lineup[slotId] = null; });
    delete this.injuries[player.id];
    if (this.selectedPlayerId === player.id) this.selectedPlayerId = null;
    this.saleOffers = this.saleOffers.filter((item) => item.id !== offerId);
    this.fame = Math.max(0, this.fame - 2);
    this.autoLineup();
    this.logs.unshift(`${player.name}を${offer.clubName}へ売却。移籍金 ${offer.proposedFee.toLocaleString()}円を受領し、編成を再調整した。`);
    this.persist();
    return { ok: true, text: `${player.name}を売却し、${offer.proposedFee.toLocaleString()}円を受領しました。` };
  }

  renewContract(playerId: string, offerId: ContractOfferId = "balanced") {
    const player = this.roster.find((item) => item.id === playerId);
    if (!player) return { ok: false, text: "契約対象の選手を確認できませんでした。" };
    if ((player.contractYears ?? defaultContractYears(player)) > 1) return { ok: false, text: "契約更新は残り1年の選手から行えます。" };
    const offer = contractOfferOptions.find((item) => item.id === offerId) ?? contractOfferOptions[1];
    const nextSalary = Math.round(player.salary * (1 + offer.salaryIncrease));
    const fee = this.contractRenewalFee(player, offer.id);
    if (this.money < fee) return { ok: false, text: `更新一時金 ${fee.toLocaleString()}円を支払える資金がありません。` };
    this.money -= fee;
    player.contractYears = 3;
    player.salary = nextSalary;
    player.winBonus = offer.winBonus;
    player.appearanceBonus = offer.appearanceBonus;
    player.goalBonus = offer.goalBonus;
    this.recordFinance("契約更新", fee, "expense", `${player.name}との3年契約を${offer.label}で更新`, this.currentWeek);
    this.captureCashPoint();
    this.logs.unshift(`${player.name}と3年契約を${offer.label}で更新。年俸 ${nextSalary.toLocaleString()}円、勝利 ${offer.winBonus.toLocaleString()}円、出場 ${offer.appearanceBonus.toLocaleString()}円、得点 ${offer.goalBonus.toLocaleString()}円の出来高を設定。`);
    this.persist();
    return { ok: true, text: `${player.name}と3年契約を更新しました。年俸と勝利出来高を反映しています。` };
  }

  signSponsor(sponsorId: string) {
    const offer = sponsorOffers.find((item) => item.id === sponsorId);
    if (!offer) return { ok: false, text: "スポンサー情報を確認できませんでした。" };
    if (this.sponsor) return { ok: false, text: "今季はすでにスポンサーと契約済みです。契約はシーズン終了後に更新できます。" };
    if (this.fame < offer.fameRequired) return { ok: false, text: `契約には名声 ${offer.fameRequired} が必要です。リーグとカップ戦で実績を重ねましょう。` };
    this.sponsor = { ...offer };
    this.money += offer.upFront;
    this.recordFinance("スポンサー", offer.upFront, "income", `${offer.name} 契約金`, this.currentWeek);
    this.captureCashPoint();
    this.logs.unshift(`${offer.name} とシーズン契約を締結。契約金 ${offer.upFront.toLocaleString()}円を受領。`);
    this.persist();
    return { ok: true, text: `${offer.name} と契約しました。契約金と週次収入が資金計画を支えます。` };
  }

  upgradeConcession() {
    const facility = this.concessionFacility;
    if (!facility.nextCost || !facility.nextName) return { ok: false, text: "売店・飲食施設は最高レベルです。試合日収益を最大化しています。" };
    if (this.money < facility.nextCost) return { ok: false, text: `改修には ${facility.nextCost.toLocaleString()}円が必要です。ホーム戦収益を積み上げましょう。` };
    this.money -= facility.nextCost;
    this.recordFinance("施設投資", facility.nextCost, "expense", `${facility.nextName} への改修`, this.currentWeek);
    this.concessionLevel += 1;
    const upgraded = this.concessionFacility;
    this.captureCashPoint();
    this.logs.unshift(`スタジアム売店を ${upgraded.name}（Lv.${upgraded.level}）へ改修。飲食の提供能力と客単価が向上した。`);
    this.persist();
    return { ok: true, text: `${upgraded.name} を稼働開始。ホーム戦の飲食収入が拡大します。` };
  }

  upgradeScoutNetwork() {
    const facility = this.scoutFacility;
    if (!facility.nextCost || !facility.nextName) return { ok: false, text: "スカウト網は最高レベルです。候補の質を最大限に見極められます。" };
    if (this.money < facility.nextCost) return { ok: false, text: `改修には ${facility.nextCost.toLocaleString()}円が必要です。資金を確保してから着手しましょう。` };
    this.money -= facility.nextCost;
    this.recordFinance("施設投資", facility.nextCost, "expense", `${facility.nextName} への拡張`, this.currentWeek);
    this.scoutLevel += 1;
    const upgraded = this.scoutFacility;
    this.captureCashPoint();
    this.logs.unshift(`スカウト網を ${upgraded.name}（Lv.${upgraded.level}）へ拡張。市場候補の能力とポテンシャルに加え、次季ユースの初期XPと育成ペースが向上した。`);
    this.persist();
    return { ok: true, text: `${upgraded.name} を稼働開始。次季ユースは${upgraded.youthQuality}となり、初期XP +${upgraded.youthInitialXpBonus}、セッションXP +${upgraded.youthSessionXpBonus}を得ます。` };
  }

  assignScoutStaff(staffId: string) {
    const staff = scoutStaff.find((item) => item.id === staffId);
    if (!staff) return { ok: false, text: "配置するスカウト担当者を確認できませんでした。" };
    if (this.assignedScoutId === staff.id) return { ok: false, text: `${staff.name}はすでに${staff.region}を担当しています。` };
    this.assignedScoutId = staff.id;
    this.logs.unshift(`スカウト担当を${staff.name}へ変更。${staff.specialtyLabel}のユース候補を優先して追跡する。`);
    this.persist();
    return { ok: true, text: `${staff.name}を${staff.region}へ配置。次のユース加入では${staff.specialtyLabel}に${playerSkillCatalog[staff.specialtySkill].label}の傾向を反映します。` };
  }

  advanceWeek(): MatchResult {
    if (this.week >= 19) this.beginNewSeason();
    const recoveringPlayers = Object.keys(this.injuries);
    const opponent = this.currentOpponent;
    const score = this.score();
    const tactics = score.tactics;
    const opponentTactics = this.opponentTacticalAssessment(opponent.id);
    const tacticalMatchup = this.tacticalMatchup(tactics, opponentTactics);
    const markingImpact = this.markingMatchImpact(opponentTactics);
    const isHome = this.isHomeWeek();
    const matchCondition = this.matchConditionFor(isHome);
    const matchAttack = clamp(score.attack + tacticalMatchup.playerAttackModifier + markingImpact.attackModifier + matchCondition.homeAttack + matchCondition.moraleAttack + matchCondition.momentumAttack, 0, 99);
    const matchDefense = clamp(score.defense + tacticalMatchup.playerDefenseModifier + markingImpact.defenseModifier + matchCondition.homeDefense + matchCondition.moraleDefense + matchCondition.momentumDefense, 0, 99);
    const gate = this.createGateReceipt("リーグ", isHome, opponent.rating);
    const merchandise = this.createMerchandiseReceipt(gate);
    const membership = this.membershipReceipt();
    const concession = this.createConcessionReceipt(gate);
    const playerGoals = clamp(Math.round((matchAttack - (opponentTactics.defense + tacticalMatchup.opponentDefenseModifier) + 18 + deterministic(this.week + 4) * 24) / 20), 0, 5);
    const opponentGoals = clamp(Math.round(((opponentTactics.attack + tacticalMatchup.opponentAttackModifier) - matchDefense + 22 + deterministic(this.week + 18) * 20) / 21), 0, 4);
    const matchFlow = this.createMatchFlow(playerGoals, opponentGoals, opponent.name, tactics, opponentTactics, tacticalMatchup, matchCondition);
    matchFlow.halfTime.tacticalNote += ` / ${markingImpact.summary} / ${matchCondition.summary}`;
    matchFlow.highlights.sort((a, b) => a.minute - b.minute || a.kind.localeCompare(b.kind));
    const injuries = this.createMatchInjuries(matchFlow.highlights, this.week);
    const reward = playerGoals > opponentGoals ? 245000 : playerGoals === opponentGoals ? 105000 : 48000;
    const won = playerGoals > opponentGoals;
    const draw = playerGoals === opponentGoals;
    const sponsorRevenue = this.sponsor ? this.sponsor.weeklyIncome + (won ? this.sponsor.winBonus : 0) : 0;
    const leaguePopularityDelta = this.popularityChange(won, draw, isHome, "リーグ");
    this.popularity = clamp(this.popularity + leaguePopularityDelta, 12, 98);
    this.updateTeamCondition(won, draw, playerGoals - opponentGoals, "リーグ");
    const result: MatchResult = {
      opponent: opponent.name,
      opponentId: opponent.id,
      playerGoals,
      opponentGoals,
      reward,
      won,
      sponsorRevenue,
      cupResult: null,
      gate,
      merchandise,
      membership,
      concession,
      totalTicketRevenue: gate.revenue,
      totalAttendance: gate.attendance,
      totalCommercialRevenue: merchandise.revenue + membership.revenue + concession.revenue,
      popularityDelta: leaguePopularityDelta,
      leaguePopularityDelta,
      popularity: this.popularity,
      tactics,
      opponentTactics,
      tacticalMatchup,
      markingImpact,
      matchAttack,
      matchDefense,
      matchCondition,
      conditionAfter: this.matchConditionFor(isHome),
      halfTime: matchFlow.halfTime,
      highlights: matchFlow.highlights,
      substitutions: [],
      injuries,
      playerRatings: [],
      markDuels: [],
      mvp: null,
      individualBonuses: { total: 0, entries: [] },
      skillXpGrants: [],
      halfTimeChanges: [],
      message: won ? "勝利。スタンドの歓声が、次の挑戦を後押しする。" : draw ? "ドロー。サポーターへ、次節での反撃を約束する。" : "敗戦。戦術ボードを見直し、次節で取り返す。",
    };

    this.applyResult(userClub.id, opponent.id, playerGoals, opponentGoals);
    const others = opponentSeeds.filter((club) => club.id !== opponent.id);
    for (let index = 0; index < others.length; index += 2) {
      const home = others[index]; const away = others[index + 1];
      if (!away) continue;
      const homeTactics = this.opponentTacticalAssessment(home.id);
      const awayTactics = this.opponentTacticalAssessment(away.id);
      const homeGoals = clamp(Math.floor((homeTactics.attack - awayTactics.defense + 22 + deterministic(this.week * 11 + index) * 31) / 22), 0, 4);
      const awayGoals = clamp(Math.floor((awayTactics.attack - homeTactics.defense + 22 + deterministic(this.week * 9 + index + 3) * 31) / 22), 0, 4);
      this.applyResult(home.id, away.id, homeGoals, awayGoals);
    }

    const financeWeek = this.week + 1;
    const weeklySalary = this.weeklySalary;
    const leagueWinBonus = won ? this.teamWinBonus : 0;
    this.money += reward + sponsorRevenue + gate.revenue + merchandise.revenue + membership.revenue + concession.revenue - weeklySalary - leagueWinBonus;
    this.fame += won ? 11 : draw ? 4 : 1;
    const cupResult = this.advanceCupIfScheduled(this.week + 1);
    if (cupResult) {
      this.money += cupResult.reward + cupResult.gate.revenue + cupResult.merchandise.revenue + cupResult.concession.revenue;
      this.fame += cupResult.won ? 7 : 2;
      this.popularity = clamp(this.popularity + cupResult.popularityDelta, 12, 98);
      result.cupResult = cupResult;
      result.totalTicketRevenue += cupResult.gate.revenue;
      result.totalAttendance += cupResult.gate.attendance;
      result.totalCommercialRevenue += cupResult.merchandise.revenue + cupResult.concession.revenue;
      result.popularityDelta += cupResult.popularityDelta;
      result.popularity = this.popularity;
      this.updateTeamCondition(cupResult.won, false, cupResult.playerGoals - cupResult.opponentGoals, "カップ");
    }
    const cupWinBonus = cupResult?.won ? this.teamWinBonus : 0;
    if (cupWinBonus) this.money -= cupWinBonus;
    result.conditionAfter = this.matchConditionFor(isHome);
    this.recordFinance("試合賞金", reward, "income", `リーグ ${opponent.name}戦`, financeWeek);
    if (sponsorRevenue) this.recordFinance("スポンサー", sponsorRevenue, "income", "週次協賛・勝利ボーナス", financeWeek);
    if (gate.revenue) this.recordFinance("入場料", gate.revenue, "income", `リーグ戦 ${gate.attendance.toLocaleString()}人`, financeWeek);
    if (merchandise.revenue) this.recordFinance("グッズ", merchandise.revenue, "income", `ホーム戦 ${merchandise.buyers.toLocaleString()}人`, financeWeek);
    this.recordFinance("会員費", membership.revenue, "income", `${membership.members.toLocaleString()}人分の週次会費`, financeWeek);
    if (concession.revenue) this.recordFinance("売店・飲食", concession.revenue, "income", `ホーム戦 ${concession.customers.toLocaleString()}人`, financeWeek);
    this.recordFinance("年俸", weeklySalary, "expense", `${this.roster.length}人分の週次年俸`, financeWeek);
    if (leagueWinBonus) this.recordFinance("出来高", leagueWinBonus, "expense", "リーグ勝利の選手出来高", financeWeek);
    if (cupResult) {
      this.recordFinance("試合賞金", cupResult.reward, "income", `カップ ${cupResult.round}`, financeWeek);
      if (cupResult.gate.revenue) this.recordFinance("入場料", cupResult.gate.revenue, "income", `カップ戦 ${cupResult.gate.attendance.toLocaleString()}人`, financeWeek);
      if (cupResult.merchandise.revenue) this.recordFinance("グッズ", cupResult.merchandise.revenue, "income", `カップ戦 ${cupResult.merchandise.buyers.toLocaleString()}人`, financeWeek);
      if (cupResult.concession.revenue) this.recordFinance("売店・飲食", cupResult.concession.revenue, "income", `カップ戦 ${cupResult.concession.customers.toLocaleString()}人`, financeWeek);
      if (cupWinBonus) this.recordFinance("出来高", cupWinBonus, "expense", `カップ${cupResult.round}勝利の選手出来高`, financeWeek);
    }
    injuries.forEach((injury) => { this.injuries[injury.playerId] = injury.weeks; const player = this.roster.find((item) => item.id === injury.playerId); if (player) { player.fatigue = 99; player.injuryWeeks = injury.weeks; } });
    this.roster.forEach((player) => { player.fatigue = clamp(player.fatigue + (Object.values(this.lineup).includes(player.id) ? 11 : -7), 0, 99); });
    recoveringPlayers.forEach((playerId) => { if (!this.injuries[playerId]) return; this.injuries[playerId] -= 1; const player = this.roster.find((item) => item.id === playerId); if (this.injuries[playerId] <= 0) { delete this.injuries[playerId]; if (player) delete player.injuryWeeks; } else if (player) player.injuryWeeks = this.injuries[playerId]; });
    this.week += 1;
    this.saleOffers = this.saleOffers.filter((offer) => offer.expiresWeek >= this.week && this.roster.some((player) => player.id === offer.playerId));
    const marketRefreshLog = this.week % 3 === 0 ? this.refreshMarketCandidates(true) : "";
    this.captureCashPoint();
    result.playerRatings = this.createPlayerRatings(result.highlights, result.substitutions, result.injuries);
    result.markDuels = this.createMarkDuelReports(result.opponentTactics, result.playerRatings, result.playerGoals, result.opponentGoals);
    result.mvp = result.playerRatings[0] ?? null;
    this.recordSeasonStats(result.playerRatings, result.mvp);
    result.skillXpGrants = this.awardMatchSkillXp(result.playerRatings, result.tactics);
    result.individualBonuses = this.createIndividualBonusReceipt(result.playerRatings);
    if (result.individualBonuses.total) {
      this.money -= result.individualBonuses.total;
      this.recordFinance("出来高", result.individualBonuses.total, "expense", `個人出来高: ${opponent.name}`, financeWeek);
      this.captureCashPoint();
    }
    this.lastResult = result;
    const sponsorLog = sponsorRevenue ? ` スポンサー収入 ${sponsorRevenue.toLocaleString()}円。` : "";
    const gateLog = gate.isHome ? ` ホーム入場料 ${gate.revenue.toLocaleString()}円（${gate.attendance.toLocaleString()}人）。` : " アウェー戦のため入場料収入なし。";
    const goodsLog = merchandise.revenue ? ` グッズ売上 ${merchandise.revenue.toLocaleString()}円（${merchandise.buyers.toLocaleString()}人）。` : "";
    const concessionLog = concession.revenue ? ` 売店・飲食 ${concession.revenue.toLocaleString()}円（${concession.customers.toLocaleString()}人）。` : "";
    const membershipLog = ` ファンクラブ会費 ${membership.revenue.toLocaleString()}円（${membership.members.toLocaleString()}人）。`;
    const fanLog = ` 人気 ${result.popularityDelta >= 0 ? "+" : ""}${result.popularityDelta} → ${result.popularity}%。`;
    const tacticsLog = ` 戦術: ${tactics.formationLabel}・${tactics.mentalityLabel}・${tactics.playingStyleLabel}、${tactics.cfRoleSummary}、${tactics.wgRoleSummary}、${tactics.amRoleSummary}、${tactics.cmRoleSummary}、${tactics.dmRoleSummary}、${tactics.cbRoleSummary}、${tactics.sbRoleSummary}、${tactics.gkRoleSummary}、${tactics.roleFitSummary}、${tactics.sideLinkSummary}、${tactics.midfieldPressSummary}、${markingImpact.summary}、連携 ${tactics.chemistry}%（攻${tactics.attackModifier >= 0 ? "+" : ""}${tactics.attackModifier}/守${tactics.defenseModifier >= 0 ? "+" : ""}${tactics.defenseModifier}）。相手は${opponentTactics.formationLabel}・${opponentTactics.playingStyleLabel}の${opponentTactics.trait}。戦術相性は${tacticalMatchup.label}。ハーフタイム ${matchFlow.halfTime.playerGoals}-${matchFlow.halfTime.opponentGoals}。`;
    const salaryLog = ` 週次年俸 ${weeklySalary.toLocaleString()}円を支払い。`;
    const bonusLog = leagueWinBonus || cupWinBonus ? ` 勝利出来高 ${(leagueWinBonus + cupWinBonus).toLocaleString()}円を支払い。` : "";
    const personalBonusLog = result.individualBonuses.total ? ` 個人出来高 ${result.individualBonuses.total.toLocaleString()}円を支払い。` : "";
    const skillXpLog = result.skillXpGrants.length ? ` スキルXP +${result.skillXpGrants.reduce((sum, grant) => sum + grant.xp, 0)}（${result.skillXpGrants.filter((grant) => grant.learned).map((grant) => `${grant.player}が${grant.label}を習得`).join("、") || "試合経験を蓄積"}）。` : "";
    const medicalLog = injuries.length ? ` 医療報告: ${injuries.map((injury) => `${injury.player}が${injury.weeks}週離脱`).join("、")}。` : "";
    const cupLog = cupResult ? ` カップ戦 ${cupResult.round} ${cupResult.playerGoals}-${cupResult.opponentGoals}。` : "";
    this.logs.unshift(`第${this.week}節 ${isHome ? "HOME" : "AWAY"} ${opponent.name}戦 ${playerGoals}-${opponentGoals}。賞金 ${reward.toLocaleString()}円を獲得。${sponsorLog}${gateLog}${goodsLog}${concessionLog}${membershipLog}${salaryLog}${bonusLog}${personalBonusLog}${skillXpLog}${fanLog}${tacticsLog}${medicalLog}${cupLog}${marketRefreshLog ? ` ${marketRefreshLog}` : ""}`);
    this.persist();
    return result;
  }

  private markingMatchImpact(opponentTactics: OpponentTacticalAssessment): MarkingMatchImpact {
    const opponentFormation = formations.find((formation) => formation.id === opponentTactics.formationId);
    const ownSlots = this.formation.slots.map((slot) => ({ slot, player: this.playerForSlot(slot.id) })).filter((item): item is { slot: Formation["slots"][number]; player: Player } => Boolean(item.player));
    if (!opponentFormation || !ownSlots.length) return { attackModifier: 0, defenseModifier: 0, grade: "対人拮抗", advantageCount: 0, cautionCount: 0, summary: "MARKING IMPACT 拮抗（攻+0 / 守+0）", reason: "対応関係を十分に作れず、試合計算への補正は加えない。" };
    const remainingOpponents = opponentTactics.lineup.map((opponentPlayer) => ({ opponentPlayer, slot: opponentFormation.slots.find((slot) => opponentPlayer.id.endsWith(`-${slot.id}`)) ?? opponentFormation.slots[0] }));
    let advantageCount = 0;
    let cautionCount = 0;
    ownSlots.forEach(({ slot, player }) => {
      const manualIndex = remainingOpponents.findIndex((candidate) => this.manualMarkAssignments[candidate.opponentPlayer.id] === player.id);
      const bestIndex = manualIndex >= 0 ? manualIndex : remainingOpponents.reduce((best, candidate, index) => {
        const candidateDistance = (slot.x - candidate.slot.x) ** 2 + (slot.y - candidate.slot.y) ** 2;
        const bestDistance = (slot.x - remainingOpponents[best].slot.x) ** 2 + (slot.y - remainingOpponents[best].slot.y) ** 2;
        return candidateDistance < bestDistance ? index : best;
      }, 0);
      const { opponentPlayer, slot: opponentSlot } = remainingOpponents.splice(bestIndex, 1)[0];
      const defenderValue = player.position === "GK" ? (player.gk ?? 50) : Math.round(player.defense * .34 + player.tackle * .36 + player.interception * .3);
      const threatValue = Math.round(opponentPlayer.attack * .5 + opponentPlayer.pass * .3 + (opponentPlayer.role.includes("裏抜け") || opponentPlayer.role.includes("シャドー") ? 4 : opponentPlayer.role.includes("ターゲット") ? 2 : 0));
      const distancePenalty = Math.max(0, Math.hypot(slot.x - opponentSlot.x, slot.y - opponentSlot.y) - 14) * .16;
      const differential = defenderValue - threatValue - distancePenalty;
      if (differential >= 5) advantageCount += 1;
      if (differential <= -5) cautionCount += 1;
    });
    const balance = advantageCount - cautionCount;
    const attackModifier = balance >= 3 ? 1 : balance <= -3 ? -1 : 0;
    const defenseModifier = balance >= 2 ? 1 : balance <= -2 ? -1 : 0;
    const grade: MarkingMatchImpact["grade"] = balance >= 2 ? "対人優位" : balance <= -2 ? "対人警戒" : "対人拮抗";
    const summary = `MARKING IMPACT ${grade}（有利 ${advantageCount} / 警戒 ${cautionCount}・攻${attackModifier >= 0 ? "+" : ""}${attackModifier} / 守${defenseModifier >= 0 ? "+" : ""}${defenseModifier}）`;
    const reason = grade === "対人優位" ? "局地戦の優位が奪回と二次攻撃をわずかに後押しする。" : grade === "対人警戒" ? "不利な対人局面があり、カバーによる負荷を小さく織り込む。" : "対人局面は拮抗しており、チーム戦力と作戦が主な決定要因となる。";
    return { attackModifier, defenseModifier, grade, advantageCount, cautionCount, summary, reason };
  }

  private createMatchFlow(playerGoals: number, opponentGoals: number, opponentName: string, tactics: TacticalAssessment, opponentTactics: OpponentTacticalAssessment, tacticalMatchup: TacticalMatchup, matchCondition: TeamMatchCondition, matchWeek = this.week, fixedHalf?: Pick<HalfTimeReport, "playerGoals" | "opponentGoals">): { halfTime: HalfTimeReport; highlights: MatchHighlight[] } {
    const playerFirst = fixedHalf?.playerGoals ?? clamp(Math.round(playerGoals * (.38 + deterministic(matchWeek + 61) * .25)), 0, playerGoals);
    const opponentFirst = fixedHalf?.opponentGoals ?? clamp(Math.round(opponentGoals * (.38 + deterministic(matchWeek + 83) * .25)), 0, opponentGoals);
    const goalHighlights = [
      ...this.goalHighlights("orbit", playerGoals, playerFirst, opponentName, tactics, opponentTactics, 101, matchWeek),
      ...this.goalHighlights("opponent", opponentGoals, opponentFirst, opponentName, tactics, opponentTactics, 211, matchWeek),
    ];
    const highlights: MatchHighlight[] = [
      { minute: 1, kind: "kickoff", team: "neutral", text: "キックオフ。両チームが主導権を求めてボールを動かし始めた。" },
      ...this.keyPlayHighlights(opponentName, opponentTactics, matchWeek, goalHighlights.map((item) => item.minute), playerGoals, opponentGoals, playerFirst, opponentFirst),
      ...goalHighlights,
    ];
    const scoreAtHalf = `${playerFirst}-${opponentFirst}`;
    const halfTime: HalfTimeReport = {
      playerGoals: playerFirst,
      opponentGoals: opponentFirst,
      message: playerFirst > opponentFirst ? `前半終了。${scoreAtHalf}でリード。試合の主導権を保っている。` : playerFirst === opponentFirst ? `前半終了。${scoreAtHalf}。拮抗した展開で、次の一手が勝負を分ける。` : `前半終了。${scoreAtHalf}でビハインド。後半の修正が必要だ。`,
      tacticalNote: `${tactics.formationTrait} / ${tactics.skillSummary} / ${tactics.sideLinkDetails.length ? `サイド連動 攻+${tactics.sideLinkAttack}・守+${tactics.sideLinkDefense}` : "サイド連動なし"} / ${tactics.midfieldPressDetail.active ? `中盤プレス 攻+${tactics.midfieldPressAttack}・守+${tactics.midfieldPressDefense}` : "中盤プレス準備中"} / 相手 ${opponentTactics.formationLabel}・${opponentTactics.trait} / ${tacticalMatchup.label} / 攻 ${tactics.attackModifier >= 0 ? "+" : ""}${tactics.attackModifier}・守 ${tactics.defenseModifier >= 0 ? "+" : ""}${tactics.defenseModifier}`,
      recommendation: playerFirst > opponentFirst ? "試合を急がず、連携を保って相手の前進を受け止めよう。" : playerFirst === opponentFirst ? `後半は${tactics.playingStyleLabel}の狙いを継続し、決定機を一つずつ増やそう。` : tactics.mentality === "defensive" ? "得点が必要な時間帯。攻守意識をバランス以上へ引き上げる選択もある。" : "失点リスクを抑えつつ、前線へ届ける本数を増やそう。",
    };
    highlights.push({ minute: 45, kind: "halftime", team: "neutral", text: halfTime.message });
    highlights.push({ minute: 46, kind: "kickoff", team: "neutral", text: "後半開始。両チームが再び前線へ人数をかけ、試合が動き出した。" });
    highlights.push({ minute: 90, kind: "fulltime", team: "neutral", text: `試合終了。オービット東京 ${playerGoals}-${opponentGoals} ${opponentName}。` });
    return { halfTime, highlights: highlights.sort((a, b) => a.minute - b.minute || a.kind.localeCompare(b.kind)) };
  }

  private keyPlayHighlights(opponentName: string, opponentTactics: OpponentTacticalAssessment, matchWeek: number, blockedMinutes: number[], playerGoals: number, opponentGoals: number, playerFirst: number, opponentFirst: number): MatchHighlight[] {
    const orbitAttackers = this.startingPlayers().filter((player) => player.position !== "GK").sort((a, b) => this.attackPower(b) - this.attackPower(a));
    const opponentAttackers = opponentTactics.lineup.filter((player) => player.position !== "GK").sort((a, b) => b.attack - a.attack);
    const ownGoalkeeper = this.startingPlayers().find((player) => player.position === "GK")?.name ?? "守護神";
    const ownDefender = this.startingPlayers().filter((player) => ["CB", "SB", "DM"].includes(player.position)).sort((a, b) => this.defensePower(b) - this.defensePower(a))[0]?.name ?? "最終ライン";
    if (!orbitAttackers.length || !opponentAttackers.length) return [];
    const usedMinutes = new Set([1, 45, 46, 90, ...blockedMinutes]);
    const firstHalfGoalCount = blockedMinutes.filter((minute) => minute >= 2 && minute <= 44).length;
    const secondHalfGoalCount = blockedMinutes.filter((minute) => minute >= 47 && minute <= 89).length;
    // キックオフ／終了を含めて各ハーフ10件を基本にし、ゴール数に応じて重要プレー数を調整する。
    const tenseMatch = Math.abs(playerGoals - opponentGoals) <= 1 || playerGoals + opponentGoals >= 3 || Math.abs(playerFirst - opponentFirst) <= 1;
    const actionBase = tenseMatch ? 6 : 8;
    const firstHalfActionCount = Math.max(0, actionBase - firstHalfGoalCount);
    const secondHalfActionCount = Math.max(0, actionBase - secondHalfGoalCount);
    const allocateMinute = (base: number, min: number, max: number, seed: number) => {
      const desired = clamp(base + Math.round(deterministic(seed) * 4) - 2, min, max);
      for (let distance = 0; distance <= max - min; distance += 1) {
        const later = desired + distance;
        if (later <= max && !usedMinutes.has(later)) {
          usedMinutes.add(later);
          return later;
        }
        const earlier = desired - distance;
        if (earlier >= min && !usedMinutes.has(earlier)) {
          usedMinutes.add(earlier);
          return earlier;
        }
      }
      return desired;
    };
    const createHalfMinutes = (bases: number[], count: number, min: number, max: number, seedOffset: number) => Array.from({ length: count }, (_, index) => {
      const baseIndex = count <= 1 ? Math.floor(bases.length / 2) : Math.round((index * (bases.length - 1)) / (count - 1));
      return allocateMinute(bases[baseIndex], min, max, matchWeek * 31 + 331 + seedOffset + index);
    });
    const minutes = [
      ...createHalfMinutes([5, 10, 15, 20, 25, 30, 35, 40], firstHalfActionCount, 3, 44, 0),
      ...createHalfMinutes([49, 54, 59, 64, 69, 74, 79, 84], secondHalfActionCount, 47, 89, 32),
    ];
    const baseHighlights = minutes.map((minute, index) => {
      const orbitAction = deterministic(matchWeek * 37 + 401 + index) >= .43;
      const orbitCreator = orbitAttackers[(index + 1) % orbitAttackers.length];
      const orbitFinisher = orbitAttackers[(index + 2) % orbitAttackers.length];
      const opponentCreator = opponentAttackers[(index + 1) % opponentAttackers.length];
      const opponentFinisher = opponentAttackers[(index + 2) % opponentAttackers.length];
      const orbitPlays = [
        `${orbitCreator.name}が右サイドを華麗なドリブルで崩し、鋭いクロス。${orbitFinisher.name}が飛び込むが、シュートは惜しくも枠を外れる！`,
        `${orbitCreator.name}が中盤で相手をかわして${orbitFinisher.name}へスルーパス。抜け出した${orbitFinisher.name}のシュートはGKの好セーブに阻まれた！`,
        `${orbitCreator.name}のコーナーキックに${orbitFinisher.name}が競り勝つ。高い打点のヘディングは、ゴールライン手前でかき出された！`,
        `${orbitCreator.name}が左サイドでワンツーから抜け出し、マイナスの折り返し。${orbitFinisher.name}のダイレクトシュートは、わずかにサイドネット！`,
        `${orbitCreator.name}が高い位置でボールを奪い、${orbitFinisher.name}へ素早く預ける。振り抜いたミドルシュートはGKが弾き出した！`,
        `${orbitCreator.name}が相手の寄せを外してペナルティエリアへ侵入。${orbitFinisher.name}へ送ったラストパスは、相手DFが寸前でカットした！`,
        `${orbitCreator.name}がカウンターを加速させ、${orbitFinisher.name}が裏へ抜け出す。角度のない位置からのシュートは、GKが足で止めた！`,
        `${orbitCreator.name}の鋭いクロスに${orbitFinisher.name}が頭で合わせる。ボールはクロスバーをわずかに越えていった！`,
        `${orbitCreator.name}がタッチライン際で巧みに収め、切り返しからクロス。${orbitFinisher.name}のボレーは相手DFに当たってコーナーへ逃れた！`,
        `${orbitCreator.name}が素早いリスタートから前を向き、${orbitFinisher.name}へ浮き球のパス。胸で収めた${orbitFinisher.name}の一撃はGKの正面！`,
        `${orbitCreator.name}が中央をドリブルで運び、${orbitFinisher.name}とパスを交換。ペナルティエリア手前からのシュートは、わずかにポストの外！`,
        `${orbitCreator.name}のFKがゴール前へ落ちる。${orbitFinisher.name}が混戦で押し込もうとするが、GKが間一髪でキャッチした！`,
      ];
      const opponentPlays = [
        `${opponentName}の${opponentCreator.name}がサイドを抜け出してクロス。${opponentFinisher.name}が合わせるが、${ownGoalkeeper}が横っ飛びで防いだ！`,
        `${opponentName}の${opponentCreator.name}が鋭い縦パスを通す。${opponentFinisher.name}の強烈なシュートは、わずかに枠の外へ！`,
        `${opponentName}の${opponentCreator.name}がこぼれ球を拾い、${opponentFinisher.name}へラストパス。至近距離の一撃を${ownGoalkeeper}が体を張って止めた！`,
        `${opponentName}の${opponentCreator.name}のコーナーキックに${opponentFinisher.name}が競り勝つ。ヘディングシュートは、クロスバーの上へ！`,
        `${opponentName}の${opponentCreator.name}がワンツーで中央を突破。${opponentFinisher.name}のシュートは${ownDefender}が身を投げ出してブロックした！`,
        `${opponentName}の${opponentCreator.name}が切り返しから右足を振り抜く。鋭いミドルシュートを${ownGoalkeeper}が片手でかき出した！`,
        `${opponentName}の${opponentCreator.name}が速攻から折り返し。${opponentFinisher.name}の決定的な一撃は、${ownDefender}がゴール前でクリア！`,
        `${opponentName}の${opponentCreator.name}が最終ラインの背後へロングパス。${opponentFinisher.name}が狙うが、${ownGoalkeeper}が飛び出して先に収めた！`,
        `${opponentName}の${opponentCreator.name}がタッチライン際で巧みにキープし、深い位置からクロス。${opponentFinisher.name}のボレーは${ownDefender}に当たってコーナーへ！`,
        `${opponentName}の${opponentCreator.name}が素早いリスタートで前を向き、${opponentFinisher.name}へ浮き球のパス。胸で収めた${opponentFinisher.name}の一撃を${ownGoalkeeper}が正面で抑えた！`,
        `${opponentName}の${opponentCreator.name}が中央をドリブルで運び、${opponentFinisher.name}とパスを交換。ペナルティエリア手前からのシュートは、ポストの外へ外れた！`,
        `${opponentName}の${opponentCreator.name}のFKがゴール前へ落ちる。${opponentFinisher.name}が混戦で押し込もうとするが、${ownGoalkeeper}が間一髪でキャッチした！`,
      ];
      const playIndex = index % orbitPlays.length;
      return { minute, kind: "action" as const, team: orbitAction ? "orbit" as const : "opponent" as const, text: orbitAction ? orbitPlays[playIndex] : opponentPlays[playIndex] };
    });
    const sequenceHighlights: MatchHighlight[] = [];
    if (tenseMatch) {
      const sequenceBases = [[16, 20], [31, 35], [58, 62], [73, 77]];
      sequenceBases.forEach(([base, counterBase], sequenceIndex) => {
        const firstHalf = sequenceIndex < 2;
        const min = firstHalf ? 3 : 47;
        const max = firstHalf ? 44 : 89;
        const firstMinute = allocateMinute(base, min, max, matchWeek * 43 + 501 + sequenceIndex);
        const counterMinute = allocateMinute(counterBase, min, max, matchWeek * 43 + 511 + sequenceIndex);
        const orbitCreator = orbitAttackers[(sequenceIndex + 2) % orbitAttackers.length];
        const orbitFinisher = orbitAttackers[(sequenceIndex + 3) % orbitAttackers.length];
        const opponentCreator = opponentAttackers[(sequenceIndex + 2) % opponentAttackers.length];
        const opponentFinisher = opponentAttackers[(sequenceIndex + 3) % opponentAttackers.length];
        const orbitFirst = deterministic(matchWeek * 47 + 521 + sequenceIndex) >= .5;
        sequenceHighlights.push({
          minute: firstMinute,
          kind: "action",
          team: orbitFirst ? "orbit" : "opponent",
          text: orbitFirst
            ? `${orbitCreator.name}が縦へ仕掛け、${orbitFinisher.name}がゴール前へ飛び込む。シュートは相手GKの反応に阻まれた！`
            : `${opponentName}の${opponentCreator.name}が一気に前進し、${opponentFinisher.name}が決定的な一撃。${ownGoalkeeper}が間一髪で防いだ！`,
        });
        sequenceHighlights.push({
          minute: counterMinute,
          kind: "action",
          team: orbitFirst ? "opponent" : "orbit",
          text: orbitFirst
            ? `${opponentName}がこぼれ球から即座に反撃。${opponentCreator.name}の折り返しを${ownDefender}が体を張ってクリアした！`
            : `${orbitCreator.name}が奪い返してカウンター。${orbitFinisher.name}のシュートはわずかに枠を外れた！`,
        });
      });
    }
    return [...baseHighlights, ...sequenceHighlights];
  }

  private goalHighlights(team: "orbit" | "opponent", goals: number, firstHalfGoals: number, opponentName: string, tactics: TacticalAssessment, opponentTactics: OpponentTacticalAssessment, seed: number, matchWeek: number): MatchHighlight[] {
    const highlights: MatchHighlight[] = [];
    const attackers = this.startingPlayers().filter((player) => player.position !== "GK").sort((a, b) => this.attackPower(b) - this.attackPower(a));
    for (let index = 0; index < goals; index += 1) {
      const firstHalf = index < firstHalfGoals;
      const minute = firstHalf ? clamp(Math.round(6 + deterministic(matchWeek * 17 + seed + index) * 37), 5, 44) : clamp(Math.round(49 + deterministic(matchWeek * 19 + seed + index) * 39), 48, 89);
      const scorerPlayer = team === "orbit" ? attackers[index % Math.max(attackers.length, 1)] : undefined;
      const opponentAttacker = opponentTactics.lineup.filter((player) => ["CF", "WG", "SH", "AM"].includes(player.position)).sort((a, b) => b.attack - a.attack)[index % Math.max(1, opponentTactics.lineup.filter((player) => ["CF", "WG", "SH", "AM"].includes(player.position)).length)];
      const scorer = scorerPlayer?.name ?? opponentAttacker?.name ?? (team === "orbit" ? "オービット東京" : `${opponentName}のFW`);
      const assistant = team === "orbit" && attackers.length > 1 ? attackers[(index + 1) % attackers.length].name : undefined;
      const role = scorerPlayer ? this.matchRoleFor(scorerPlayer) : null;
      const buildUp = tactics.sideLinkAttack >= 2 && index % 2 === 0 ? `${assistant ?? scorer}がサイドを崩してクロスを送った。` : tactics.midfieldPressDetail.active && index % 2 === 1 ? `${assistant ?? scorer}が高い位置でボールを奪い、素早く前へ運んだ。` : tactics.playingStyle === "direct" ? `${assistant ?? scorer}が縦パスで最終ラインの背後を突いた。` : tactics.playingStyle === "press" ? `${assistant ?? scorer}が敵陣で奪い返し、すぐにチャンスへつなげた。` : `${assistant ?? scorer}が細かなパス交換で守備を崩した。`;
      const opponentBuildUp = opponentTactics.playingStyle === "direct" ? `${opponentName}が素早い縦パスで背後を取った。` : opponentTactics.playingStyle === "press" ? `${opponentName}が高い位置で奪い返し、すぐに攻め込んだ。` : `${opponentName}が中盤でパスをつなぎ、守備の間を通した。`;
      const text = team === "orbit"
        ? `${buildUp}${scorer}が${role?.finishCopy ?? "ゴール右隅へ流し込み"}、ネットを揺らした！ ゴール！`
        : `${opponentBuildUp}${scorer}が${opponentAttacker?.role.includes("ターゲット") ? "競り合いを制してヘディングを叩き込み" : "冷静にシュートを流し込み"}、ゴール！`;
      highlights.push({ minute, kind: "goal", team, text, scorer, assistant });
    }
    return highlights;
  }

  private createMatchInjuries(highlights: MatchHighlight[], matchWeek: number): MatchInjury[] {
    const candidates = this.startingPlayers().filter((player) => this.injuryWeeksFor(player.id) === 0 && player.fatigue >= 72).sort((a, b) => b.fatigue - a.fatigue);
    const candidate = candidates[0];
    if (!candidate || deterministic(matchWeek * 29 + candidate.fatigue) < .56) return [];
    const minute = clamp(Math.round(24 + deterministic(matchWeek * 31 + candidate.attack) * 56), 22, 84);
    const weeks = candidate.fatigue >= 90 ? 2 : 1;
    const detail = weeks > 1 ? "強い張りを訴え、数週間の離脱見込み。" : "打撲のため、大事を取って交代が必要。";
    const injury: MatchInjury = { playerId: candidate.id, player: candidate.name, minute, weeks, detail };
    highlights.push({ minute, kind: "injury", team: "orbit", text: `${candidate.name}が負傷。${detail}` });
    highlights.sort((a, b) => a.minute - b.minute || a.kind.localeCompare(b.kind));
    return [injury];
  }

  private createPlayerRatings(highlights: MatchHighlight[], substitutions: MatchSubstitution[], injuries: MatchInjury[]): PlayerMatchRating[] {
    const subbedOnIds = new Set(substitutions.map((item) => item.inPlayerId));
    const startedIds = new Set([...this.startingPlayers().map((player) => player.id), ...substitutions.map((item) => item.outPlayerId)]);
    const participants = this.roster.filter((player) => startedIds.has(player.id) || subbedOnIds.has(player.id));
    return participants.map((player) => {
      const goals = highlights.filter((item) => item.kind === "goal" && item.team === "orbit" && item.scorer === player.name).length;
      const assists = highlights.filter((item) => item.kind === "goal" && item.team === "orbit" && item.assistant === player.name).length;
      const injured = injuries.some((item) => item.playerId === player.id);
      const started = startedIds.has(player.id) && !subbedOnIds.has(player.id);
      const subbedOn = subbedOnIds.has(player.id);
      const base = player.position === "GK" ? (player.gk ?? 50) : (this.attackPower(player) + this.defensePower(player)) / 2;
      const rating = clamp(Math.round((6.0 + (base - 55) / 32 + goals * 1.45 + assists * .8 - (player.fatigue >= 85 ? .65 : 0) - (injured ? 1.3 : 0) - (subbedOn ? .2 : 0)) * 10) / 10, 4.5, 10);
      const note = injured ? "負傷により途中離脱" : goals ? "決定力で試合を動かした" : assists ? "最後のパスでチャンスを演出" : player.fatigue >= 85 ? "高い疲労下で奮闘" : subbedOn ? "途中出場で流れを変えた" : "チームの戦術を遂行";
      return { playerId: player.id, player: player.name, position: player.position, rating, goals, assists, started, subbedOn, injured, note };
    }).sort((a, b) => b.rating - a.rating || b.goals - a.goals || b.assists - a.assists);
  }

  private createMarkDuelReports(opponentTactics: OpponentTacticalAssessment, ratings: PlayerMatchRating[], playerGoals: number, opponentGoals: number): MarkDuelReport[] {
    const opponentFormation = formations.find((formation) => formation.id === opponentTactics.formationId);
    const ownSlots = this.formation.slots.map((slot) => ({ slot, player: this.playerForSlot(slot.id) })).filter((item): item is { slot: Formation["slots"][number]; player: Player } => Boolean(item.player));
    const ratingByPlayer = new Map(ratings.map((rating) => [rating.playerId, rating]));
    if (!opponentFormation || !ownSlots.length) return [];
    const remainingOpponents = opponentTactics.lineup.map((opponentPlayer) => ({ opponentPlayer, slot: opponentFormation.slots.find((slot) => opponentPlayer.id.endsWith(`-${slot.id}`)) ?? opponentFormation.slots[0] }));
    return ownSlots.map(({ slot, player }) => {
      const manualIndex = remainingOpponents.findIndex((candidate) => this.manualMarkAssignments[candidate.opponentPlayer.id] === player.id);
      const bestIndex = manualIndex >= 0 ? manualIndex : remainingOpponents.reduce((best, candidate, index) => {
        const candidateDistance = (slot.x - candidate.slot.x) ** 2 + (slot.y - candidate.slot.y) ** 2;
        const bestDistance = (slot.x - remainingOpponents[best].slot.x) ** 2 + (slot.y - remainingOpponents[best].slot.y) ** 2;
        return candidateDistance < bestDistance ? index : best;
      }, 0);
      const { opponentPlayer, slot: opponentSlot } = remainingOpponents.splice(bestIndex, 1)[0];
      const rating = ratingByPlayer.get(player.id);
      const defenderValue = player.position === "GK" ? (player.gk ?? 50) : Math.round(player.defense * .34 + player.tackle * .36 + player.interception * .3);
      const threatValue = Math.round(opponentPlayer.attack * .5 + opponentPlayer.pass * .3 + (opponentPlayer.role.includes("裏抜け") || opponentPlayer.role.includes("シャドー") ? 4 : opponentPlayer.role.includes("ターゲット") ? 2 : 0));
      const distancePenalty = Math.max(0, Math.hypot(slot.x - opponentSlot.x, slot.y - opponentSlot.y) - 14) * .16;
      const ratingImpact = ((rating?.rating ?? 6.2) - 6.2) * 5 + (rating?.goals ?? 0) * 3 + (rating?.assists ?? 0) * 2 - (rating?.injured ? 5 : 0);
      const flowImpact = (playerGoals - opponentGoals) * .8 + (deterministic(this.week * 37 + player.attack + opponentPlayer.attack) - .5) * 8;
      const differential = Math.round(defenderValue - threatValue - distancePenalty + ratingImpact + flowImpact);
      const outcome: MarkDuelReport["outcome"] = differential >= 6 ? "勝利" : differential <= -6 ? "苦戦" : "拮抗";
      const activity = clamp(Math.round(48 + ((rating?.rating ?? 6.2) - 5.5) * 18 + Math.max(0, differential) * .28 - Math.max(0, -differential) * .12 + deterministic(this.week * 19 + player.pass) * 10), 35, 95);
      const activityGrade: MarkDuelReport["activityGrade"] = activity >= 84 ? "躍動" : activity >= 70 ? "貢献" : activity >= 56 ? "粘戦" : "苦戦";
      const engagements = clamp(Math.round(5 + activity / 14 + deterministic(this.week * 13 + player.defense) * 3), 5, 13);
      const summary = outcome === "勝利" ? `${opponentPlayer.name}を抑え、対人局面で主導権を確保。` : outcome === "苦戦" ? `${opponentPlayer.role}への対応が後手に回り、援護が必要だった。` : `${opponentPlayer.name}と拮抗。局面ごとの集中が勝負を分けた。`;
      return { playerId: player.id, player: player.name, position: player.position, opponent: opponentPlayer.name, opponentPosition: opponentPlayer.position, opponentRole: opponentPlayer.role, outcome, differential, engagements, activity, activityGrade, rating: rating?.rating ?? 6.2, summary };
    }).sort((a, b) => Math.abs(b.differential) - Math.abs(a.differential) || b.activity - a.activity);
  }

  private createIndividualBonusReceipt(ratings: PlayerMatchRating[]): IndividualBonusReceipt {
    const entries = ratings.map((rating) => {
      const player = this.roster.find((item) => item.id === rating.playerId);
      const appearance = player ? (player.appearanceBonus ?? 0) : 0;
      const goals = player ? rating.goals * (player.goalBonus ?? 0) : 0;
      return { playerId: rating.playerId, player: rating.player, appearance, goals, amount: appearance + goals };
    }).filter((entry) => entry.amount > 0);
    return { total: entries.reduce((sum, entry) => sum + entry.amount, 0), entries };
  }

  private advanceCupIfScheduled(weekForEvent: number): CupMatchResult | null {
    if (this.cup.status !== "active") return null;
    const round = this.cup.rounds[this.cup.roundIndex];
    if (!round || round.scheduledWeek !== weekForEvent) return null;
    let userResult: CupMatchResult | null = null;
    for (const fixture of round.fixtures) {
      const outcome = this.resolveCupFixture(fixture, round.name, weekForEvent);
      if (fixture.homeId === userClub.id || fixture.awayId === userClub.id) userResult = outcome;
    }
    const winners = round.fixtures.map((fixture) => fixture.winnerId).filter((winner): winner is string => Boolean(winner));
    const userAdvances = winners.includes(userClub.id);
    if (!userAdvances) this.cup.status = "eliminated";
    if (winners.length === 1) {
      if (winners[0] === userClub.id) this.cup.status = "champion";
      this.cup.roundIndex = this.cup.rounds.length;
      return userResult;
    }
    const nextIndex = this.cup.roundIndex + 1;
    const fixtures: CupFixture[] = [];
    for (let index = 0; index < winners.length; index += 2) fixtures.push({ id: `cup-${nextIndex}-${index / 2}`, homeId: winners[index], awayId: winners[index + 1] });
    this.cup.rounds.push({ name: cupRoundNames[nextIndex], scheduledWeek: cupWeeks[nextIndex], fixtures });
    this.cup.roundIndex = nextIndex;
    return userResult;
  }

  private resolveCupFixture(fixture: CupFixture, roundName: string, weekForEvent: number): CupMatchResult | null {
    const home = this.clubForId(fixture.homeId);
    const away = this.clubForId(fixture.awayId);
    const isUserHome = home.id === userClub.id;
    const isUserAway = away.id === userClub.id;
    const userCondition = this.matchConditionFor(isUserHome);
    const userPower = (this.score().total || userClub.rating) + userCondition.homeAttack + userCondition.homeDefense + userCondition.moraleAttack + userCondition.moraleDefense + userCondition.momentumAttack + userCondition.momentumDefense;
    const homePower = isUserHome ? userPower : this.opponentTacticalAssessment(home.id).total + (isUserAway ? userCondition.opponentHomeAttack + userCondition.opponentHomeDefense : 0);
    const awayPower = isUserAway ? userPower : this.opponentTacticalAssessment(away.id).total;
    let homeScore = clamp(Math.round((homePower - awayPower + 13 + deterministic(weekForEvent * 7 + homePower) * 20) / 19), 0, 4);
    let awayScore = clamp(Math.round((awayPower - homePower + 13 + deterministic(weekForEvent * 9 + awayPower) * 20) / 19), 0, 4);
    let note = "90分";
    if (homeScore === awayScore) {
      const homeWinsPens = deterministic(weekForEvent + homePower * 3) >= .48;
      fixture.winnerId = homeWinsPens ? home.id : away.id;
      note = homeWinsPens ? "PK 5-4" : "PK 4-5";
    } else fixture.winnerId = homeScore > awayScore ? home.id : away.id;
    fixture.homeScore = homeScore;
    fixture.awayScore = awayScore;
    fixture.note = note;
    if (!isUserHome && !isUserAway) return null;
    const playerGoals = isUserHome ? homeScore : awayScore;
    const opponentGoals = isUserHome ? awayScore : homeScore;
    const won = fixture.winnerId === userClub.id;
    const baseReward = roundName === "ラウンド16" ? 120000 : roundName === "準々決勝" ? 210000 : roundName === "準決勝" ? 330000 : 900000;
    const reward = won ? baseReward : 35000;
    const opponent = isUserHome ? away : home;
    const gate = this.createGateReceipt("カップ", isUserHome, opponent.rating);
    const merchandise = this.createMerchandiseReceipt(gate);
    const concession = this.createConcessionReceipt(gate);
    const popularityDelta = this.popularityChange(won, false, isUserHome, "カップ");
    return { round: roundName, opponent: opponent.name, playerGoals, opponentGoals, won, reward, note, gate, merchandise, concession, popularityDelta };
  }

  private clubForId(id: string): ClubSeed { return id === userClub.id ? userClub : opponentSeeds.find((club) => club.id === id) ?? opponentSeeds[0]; }

  private isHomeWeek() { return this.week % 2 === 0; }

  private ticketPrice() { return 2400 + Math.floor(this.popularity / 5) * 80; }

  private createGateReceipt(competition: GateReceipt["competition"], isHome: boolean, opponentRating: number): GateReceipt {
    if (!isHome) return { competition, isHome, attendance: 0, capacity: this.stadiumCapacity, ticketPrice: this.ticketPrice(), revenue: 0 };
    const occupancy = clamp(.22 + this.popularity * .0065 + opponentRating * .0018, .32, .96);
    const attendance = Math.round((this.stadiumCapacity * occupancy) / 100) * 100;
    const ticketPrice = this.ticketPrice();
    return { competition, isHome, attendance, capacity: this.stadiumCapacity, ticketPrice, revenue: attendance * ticketPrice };
  }

  private fanClubMembersFor(popularity: number) { return Math.round((900 + popularity * 74) / 10) * 10; }

  private membershipReceipt(): MembershipReceipt {
    const members = this.fanClubMembersFor(this.popularity);
    const weeklyFee = 180;
    return { members, weeklyFee, revenue: members * weeklyFee };
  }

  private createMerchandiseReceipt(gate: GateReceipt): MerchandiseReceipt {
    if (!gate.isHome) return { isHome: false, buyers: 0, purchaseRate: 0, averageSpend: 0, revenue: 0 };
    const purchaseRate = clamp(.16 + this.popularity * .0025, .18, .42);
    const buyers = Math.round((gate.attendance * purchaseRate) / 10) * 10;
    const averageSpend = 850 + Math.floor(this.popularity / 5) * 50;
    return { isHome: true, buyers, purchaseRate, averageSpend, revenue: buyers * averageSpend };
  }

  private createConcessionReceipt(gate: GateReceipt): ConcessionReceipt {
    const facility = this.concessionFacility;
    if (!gate.isHome) return { isHome: false, level: facility.level, customers: 0, purchaseRate: 0, averageSpend: 0, capacity: facility.capacity, revenue: 0 };
    const purchaseRate = clamp(.20 + this.popularity * .002 + facility.purchaseBonus, .20, .58);
    const demand = Math.round((gate.attendance * purchaseRate) / 10) * 10;
    const customers = Math.min(demand, facility.capacity);
    const averageSpend = 980 + Math.floor(this.popularity / 5) * 35 + facility.spendBonus;
    return { isHome: true, level: facility.level, customers, purchaseRate, averageSpend, capacity: facility.capacity, revenue: customers * averageSpend };
  }

  private popularityChange(won: boolean, draw: boolean, isHome: boolean, competition: GateReceipt["competition"]) {
    const competitionBonus = competition === "カップ" ? 1 : 0;
    if (won) return (isHome ? 5 : 4) + competitionBonus;
    if (draw) return isHome ? 1 : 2;
    return (isHome ? -3 : -2) - competitionBonus;
  }

  private momentumValue() {
    const weighted = this.recentMatchForm.slice(0, 3).reduce((total, entry, index) => {
      const outcome = entry.outcome === "W" ? 2 : entry.outcome === "D" ? 0 : -2;
      const margin = entry.margin >= 3 ? 1 : entry.margin <= -3 ? -1 : 0;
      return total + (outcome + margin) * (3 - index);
    }, 0);
    return clamp(Math.round(weighted / 3), -3, 3);
  }

  private matchConditionFor(isHome: boolean): TeamMatchCondition {
    const morale = clamp(Math.round(this.teamMorale), 0, 100);
    const moraleAttack = morale >= 80 ? 2 : morale >= 60 ? 1 : morale < 20 ? -2 : morale < 40 ? -1 : 0;
    const moraleDefense = moraleAttack;
    const moraleLabel = morale >= 80 ? "上昇気流" : morale >= 60 ? "前向き" : morale >= 40 ? "平常" : morale >= 20 ? "不安定" : "危機";
    const momentum = this.momentumValue();
    const momentumAttack = momentum >= 2 ? 2 : momentum >= 1 ? 1 : momentum <= -2 ? -2 : momentum <= -1 ? -1 : 0;
    const momentumDefense = momentum >= 2 ? 1 : momentum <= -2 ? -1 : 0;
    const momentumLabel = momentum >= 3 ? "3連勝級" : momentum === 2 ? "好調" : momentum === 1 ? "上向き" : momentum === 0 ? "五分" : momentum === -1 ? "停滞" : momentum === -2 ? "不振" : "連敗警戒";
    const homeAttack = isHome && this.popularity >= 60 ? 1 : 0;
    const homeDefense = isHome ? 1 + (this.popularity >= 80 ? 1 : 0) : 0;
    const opponentHomeAttack = !isHome && this.popularity >= 60 ? 1 : 0;
    const opponentHomeDefense = !isHome ? 1 + (this.popularity >= 80 ? 1 : 0) : 0;
    const homeText = isHome ? `HOME EDGE 攻+${homeAttack}/守+${homeDefense}` : `AWAY PRESSURE 相手 攻+${opponentHomeAttack}/守+${opponentHomeDefense}`;
    const summary = `${homeText} / MORALE ${morale} ${moraleLabel}（攻${moraleAttack >= 0 ? "+" : ""}${moraleAttack}/守${moraleDefense >= 0 ? "+" : ""}${moraleDefense}） / FORM ${momentum >= 0 ? "+" : ""}${momentum} ${momentumLabel}（攻${momentumAttack >= 0 ? "+" : ""}${momentumAttack}/守${momentumDefense >= 0 ? "+" : ""}${momentumDefense}）`;
    const reason = isHome ? `人気${this.popularity}%のホーム戦。スタンドの後押しと、現在のチーム状態を攻守へ反映する。` : `アウェー戦。相手のホーム環境を織り込みつつ、士気${morale}と直近の勢いで対抗する。`;
    return { isHome, morale, moraleLabel, moraleAttack, moraleDefense, momentum, momentumLabel, momentumAttack, momentumDefense, homeAttack, homeDefense, opponentHomeAttack, opponentHomeDefense, form: [...this.recentMatchForm], summary, reason };
  }

  private updateTeamCondition(won: boolean, draw: boolean, margin: number, competition: "リーグ" | "カップ") {
    const resultDelta = won ? 8 : draw ? 2 : -6;
    const marginDelta = won && margin >= 3 ? 1 : !won && !draw && margin <= -3 ? -1 : 0;
    const cupDelta = competition === "カップ" ? (won ? 1 : -1) : 0;
    this.teamMorale = clamp(this.teamMorale + resultDelta + marginDelta + cupDelta, 0, 100);
    this.recentMatchForm.unshift({ outcome: won ? "W" : draw ? "D" : "L", margin, competition });
    if (this.recentMatchForm.length > 5) this.recentMatchForm.splice(5);
  }

  private restoreTeamCondition(condition: TeamMatchCondition) {
    this.teamMorale = condition.morale;
    this.recentMatchForm = condition.form.map((entry) => ({ ...entry }));
  }

  private applyResult(homeId: string, awayId: string, homeGoals: number, awayGoals: number) {
    const home = this.rows.find((row) => row.id === homeId); const away = this.rows.find((row) => row.id === awayId);
    if (!home || !away) return;
    home.played += 1; away.played += 1; home.gf += homeGoals; home.ga += awayGoals; away.gf += awayGoals; away.ga += homeGoals;
    if (homeGoals > awayGoals) { home.win += 1; home.pts += 3; away.loss += 1; }
    else if (homeGoals < awayGoals) { away.win += 1; away.pts += 3; home.loss += 1; }
    else { home.draw += 1; away.draw += 1; home.pts += 1; away.pts += 1; }
  }

  private rollbackLeagueResult(homeId: string, awayId: string, homeGoals: number, awayGoals: number) {
    const home = this.rows.find((row) => row.id === homeId); const away = this.rows.find((row) => row.id === awayId);
    if (!home || !away) return;
    home.played = Math.max(0, home.played - 1); away.played = Math.max(0, away.played - 1); home.gf = Math.max(0, home.gf - homeGoals); home.ga = Math.max(0, home.ga - awayGoals); away.gf = Math.max(0, away.gf - awayGoals); away.ga = Math.max(0, away.ga - homeGoals);
    if (homeGoals > awayGoals) { home.win = Math.max(0, home.win - 1); home.pts = Math.max(0, home.pts - 3); away.loss = Math.max(0, away.loss - 1); }
    else if (homeGoals < awayGoals) { away.win = Math.max(0, away.win - 1); away.pts = Math.max(0, away.pts - 3); home.loss = Math.max(0, home.loss - 1); }
    else { home.draw = Math.max(0, home.draw - 1); away.draw = Math.max(0, away.draw - 1); home.pts = Math.max(0, home.pts - 1); away.pts = Math.max(0, away.pts - 1); }
  }

  private beginNewSeason() {
    const finalPosition = this.teamPosition;
    const seasonBonus = finalPosition <= 3 ? 450000 : finalPosition <= 6 ? 220000 : 80000;
    this.money += seasonBonus;
    this.recordFinance("シーズン報奨金", seasonBonus, "income", `リーグ${finalPosition}位の順位報奨金`, this.week);
    this.fame += finalPosition <= 3 ? 35 : 12;
    this.week = 0;
    this.rows = baseRows();
    this.sponsor = null;
    this.cup = initialCup();
    this.lastResult = null;
    this.saleOffers = initialSaleOffers();
    this.refreshMarketCandidates();
    this.roster.forEach((player) => { player.contractYears = Math.max(1, (player.contractYears ?? defaultContractYears(player)) - 1); });
    const contractDue = this.contractDuePlayers.length;
    const newcomers = this.replenishYouthPlayers();
    this.seasonStats = initialSeasonStats(this.roster);
    this.logs.unshift(`シーズン終了。リーグ${finalPosition}位、順位報奨金 ${seasonBonus.toLocaleString()}円。${contractDue ? `${contractDue}名が契約最終年です。` : ""}${newcomers.length ? `ユースへ${newcomers.join("、")}が加入。` : ""}新たなスポンサー契約とカップ戦が始まる。`);
  }

  private replenishYouthPlayers() {
    const newcomers: string[] = [];
    const required = Math.max(0, 3 - this.youthPlayers.length);
    for (let index = 0; index < required; index += 1) {
      let prospect = youthIntakes[this.youthIntakeCursor % youthIntakes.length];
      let attempts = 0;
      while ((this.youthPlayers.some((player) => player.id === prospect.id) || this.roster.some((player) => player.id === prospect.id)) && attempts < youthIntakes.length) { this.youthIntakeCursor += 1; prospect = youthIntakes[this.youthIntakeCursor % youthIntakes.length]; attempts += 1; }
      this.youthPlayers.push(this.scoutYouthProspect(prospect));
      newcomers.push(prospect.name);
      this.youthIntakeCursor += 1;
    }
    return newcomers;
  }

  private attackPower(player: Player) { return player.attack * .46 + player.dribble * .18 + player.pass * .18 + player.shoot * .18; }

  private defensePower(player: Player) {
    const outfieldDefense = player.defense * .46 + player.tackle * .21 + player.block * .17 + player.interception * .16;
    return player.position === "GK" ? (player.gk ?? 0) * .72 + outfieldDefense * .28 : outfieldDefense;
  }

  private playerPower(player: Player) { return (this.attackPower(player) * .54 + this.defensePower(player) * .46) - player.fatigue * .12; }

  private startingPlayers(): Player[] {
    return this.formation.slots.map((slot) => this.playerForSlot(slot.id)).filter((player): player is Player => Boolean(player));
  }

  private sideLinkAssessment(occupied: Array<{ slot: Formation["slots"][number]; player: Player }>): SideLinkDetail[] {
    const details: SideLinkDetail[] = [];
    const evaluateSide = (side: "左" | "右", wideSlots: string[], backSlots: string[]) => {
      const wide = occupied.find((item) => wideSlots.includes(item.slot.id));
      const back = occupied.find((item) => backSlots.includes(item.slot.id));
      if (!wide || !back || !["SH", "WG"].includes(wide.slot.label) || back.slot.label !== "SB" || !isWgEligible(wide.player) || !isSbEligible(back.player)) return;
      const wideStyle = this.wgPlayStyleFor(wide.player);
      const backStyle = this.sbPlayStyleFor(back.player);
      if (!wideStyle || !backStyle) return;
      let attackBoost = 1;
      let defenseBoost = 1;
      let grade: SideLinkDetail["grade"] = "攻守連動";
      let reason = "幅を保ちながら、前進とカバーを分担する。";
      if ((wideStyle.id === "touchline" || wideStyle.id === "inverted") && backStyle.id === "overlap") {
        attackBoost = 2; defenseBoost = 0; grade = "攻撃連動"; reason = "ウイングの仕掛けとSBのオーバーラップが外側のレーンを広げる。";
      } else if (wideStyle.id === "inverted" && backStyle.id === "inverted-fullback") {
        attackBoost = 1; defenseBoost = 2; grade = "攻守連動"; reason = "内側への絞りとSBの中盤化で、中央の数的優位をつくる。";
      } else if (wideStyle.id === "wide-worker" && backStyle.id === "defensive-fullback") {
        attackBoost = 0; defenseBoost = 2; grade = "守備連動"; reason = "ワイド・ワーカーと守備的SBがサイドの守備ブロックを固める。";
      }
      details.push({ side, widePlayer: wide.player.name, widePosition: wide.player.position === "SH" ? "SH" : "WG", wideStyle: wideStyle.label, backPlayer: back.player.name, backStyle: backStyle.label, attackBoost, defenseBoost, totalBoost: attackBoost + defenseBoost, grade, reason });
    };
    evaluateSide("左", ["lm", "lw"], ["lb", "lwb"]);
    evaluateSide("右", ["rm", "rw"], ["rb", "rwb"]);
    return details;
  }

  private midfieldPressAssessment(occupied: Array<{ slot: Formation["slots"][number]; player: Player }>): MidfieldPressDetail {
    if (this.formation.id !== "3-6-1") return { active: false, grade: "対象外", midfielders: [], fitted: 0, ballWinners: 0, pressureScore: 0, attackBoost: 0, defenseBoost: 0, totalBoost: 0, summary: "中盤プレス: 3-6-1専用", reason: "3-6-1を選択すると、中盤6枚の距離感を使った一斉プレスを評価します。" };
    const midfieldIds = ["lwb", "lm", "lcm", "rcm", "rm", "rwb"];
    const midfield = occupied.filter((item) => midfieldIds.includes(item.slot.id));
    const fitted = midfield.filter((item) => this.playerIsFit(item.player, item.slot.id)).length;
    const ballWinners = midfield.filter((item) => (item.player.defense + item.player.tackle + item.player.interception) / 3 >= 55).length;
    const pressureScore = midfield.length ? Math.round(midfield.reduce((sum, item) => sum + (item.player.defense + item.player.tackle + item.player.interception) / 3, 0) / midfield.length) : 0;
    const midfielders = midfield.map((item) => `${item.slot.label}${item.player.name}`);
    const canPress = this.playingStyle === "press" && fitted >= 5 && ballWinners >= 3;
    const elitePress = canPress && fitted === 6 && ballWinners >= 4 && pressureScore >= 60;
    const attackBoost = canPress ? elitePress ? 2 : 1 : 0;
    const defenseBoost = canPress ? elitePress ? 4 : 3 : 0;
    const grade: MidfieldPressDetail["grade"] = elitePress ? "一斉奪回" : canPress ? "中盤封鎖" : "準備中";
    const summary = canPress ? `中盤プレス: ${grade}（適性 ${fitted}/6・奪取要員 ${ballWinners}名）` : `中盤プレス: ${this.playingStyle === "press" ? `適性 ${fitted}/6・奪取要員 ${ballWinners}名` : "ハイプレス未選択"}`;
    const reason = canPress ? `${midfielders.join("・")}が中央の距離を詰め、奪取から即時前進へ移る。` : this.playingStyle !== "press" ? "プレースタイルをハイプレスへ切り替えると、3-6-1専用の連動判定が始まります。" : fitted < 5 ? "中盤6枠のうち5枠以上を適性配置にすると、プレス連動を発動できます。" : "守備・タックル・パスカットに優れる奪取要員を3名以上起用すると、プレス連動を発動できます。";
    return { active: canPress, grade, midfielders, fitted, ballWinners, pressureScore, attackBoost, defenseBoost, totalBoost: attackBoost + defenseBoost, summary, reason };
  }

  private tacticalAssessment(selected: Player[]): TacticalAssessment {
    const formationIdentity = formationIdentities[this.formation.id] ?? formationIdentities["4-3-3"];
    const mentality = mentalityOptions.find((item) => item.id === this.mentality) ?? mentalityOptions[1];
    const style = playingStyleOptions.find((item) => item.id === this.playingStyle) ?? playingStyleOptions[0];
    const occupied = this.formation.slots
      .map((slot) => ({ slot, player: this.playerForSlot(slot.id) }))
      .filter((item): item is { slot: Formation["slots"][number]; player: Player } => Boolean(item.player));
    let linkTotal = 0;
    let links = 0;
    for (let index = 0; index < occupied.length; index += 1) {
      for (let compare = index + 1; compare < occupied.length; compare += 1) {
        const a = occupied[index];
        const b = occupied[compare];
        if (Math.hypot(a.slot.x - b.slot.x, a.slot.y - b.slot.y) > 38) continue;
        links += 1;
        if (a.player.chemistry === b.player.chemistry) linkTotal += a.player.chemistry === "spark" ? 10 : a.player.chemistry === "steady" ? 9 : 8;
        else if ((a.player.chemistry === "spark" && b.player.chemistry === "steady") || (a.player.chemistry === "steady" && b.player.chemistry === "spark")) linkTotal += 7;
        else if ((a.player.chemistry === "steady" && b.player.chemistry === "edge") || (a.player.chemistry === "edge" && b.player.chemistry === "steady")) linkTotal += 5;
        else linkTotal += 2;
      }
    }
    const pairAverage = links ? linkTotal / links : 0;
    const fitRate = selected.length ? selected.filter((player) => Object.entries(this.lineup).some(([slotId, playerId]) => playerId === player.id && this.playerIsFit(player, slotId))).length / selected.length : 0;
    const fatigueAverage = selected.length ? selected.reduce((total, player) => total + player.fatigue, 0) / selected.length : 100;
    const chemistry = selected.length ? clamp(Math.round(30 + pairAverage * 5 + fitRate * 15 - fatigueAverage * .12), 20, 95) : 0;
    const chemistryBonus = selected.length ? Math.round((chemistry - 50) / 15) : 0;
    const roleBonus = (option: CFPlayStyleOption | WGPlayStyleOption | AMPlayStyleOption | CMPlayStyleOption | DMPlayStyleOption | CBPlayStyleOption | SBPlayStyleOption | GKPlayStyleOption) => option.attackBonus + (style.id === "direct" ? option.directBonus : style.id === "possession" ? option.possessionBonus : option.pressBonus);
    const cfRoles = occupied.filter((item) => item.slot.label === "CF" && isCfEligible(item.player)).map((item) => ({ player: item.player, option: this.cfPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: CFPlayStyleOption } => Boolean(item.option));
    const wgRoles = occupied.filter((item) => ["WG", "SH"].includes(item.slot.label) && isWgEligible(item.player)).map((item) => ({ player: item.player, option: this.wgPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: WGPlayStyleOption } => Boolean(item.option));
    const amRoles = occupied.filter((item) => item.slot.label === "CM" && isAmEligible(item.player)).map((item) => ({ player: item.player, option: this.amPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: AMPlayStyleOption } => Boolean(item.option));
    const cmRoles = occupied.filter((item) => item.slot.label === "CM" && item.player.position === "CM" && isCmEligible(item.player)).map((item) => ({ player: item.player, option: this.cmPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: CMPlayStyleOption } => Boolean(item.option));
    const dmRoles = occupied.filter((item) => item.slot.label === "DM" && isDmEligible(item.player)).map((item) => ({ player: item.player, option: this.dmPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: DMPlayStyleOption } => Boolean(item.option));
    const cbRoles = occupied.filter((item) => item.slot.label === "CB" && isCbEligible(item.player)).map((item) => ({ player: item.player, option: this.cbPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: CBPlayStyleOption } => Boolean(item.option));
    const sbRoles = occupied.filter((item) => item.slot.label === "SB" && isSbEligible(item.player)).map((item) => ({ player: item.player, option: this.sbPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: SBPlayStyleOption } => Boolean(item.option));
    const gkRoles = occupied.filter((item) => item.slot.label === "GK" && isGkEligible(item.player)).map((item) => ({ player: item.player, option: this.gkPlayStyleFor(item.player) })).filter((item): item is { player: Player; option: GKPlayStyleOption } => Boolean(item.option));
    const roleFitDetails = [
      ...cfRoles.map((item) => this.rolePlayStyleFit(item.player, "cf", item.option)),
      ...wgRoles.map((item) => this.rolePlayStyleFit(item.player, "wg", item.option)),
      ...amRoles.map((item) => this.rolePlayStyleFit(item.player, "am", item.option)),
      ...cmRoles.map((item) => this.rolePlayStyleFit(item.player, "cm", item.option)),
      ...dmRoles.map((item) => this.rolePlayStyleFit(item.player, "dm", item.option)),
      ...cbRoles.map((item) => this.rolePlayStyleFit(item.player, "cb", item.option)),
      ...sbRoles.map((item) => this.rolePlayStyleFit(item.player, "sb", item.option)),
      ...gkRoles.map((item) => this.rolePlayStyleFit(item.player, "gk", item.option)),
    ];
    const roleFitAttack = roleFitDetails.reduce((sum, item) => sum + item.attackBoost, 0);
    const roleFitDefense = roleFitDetails.reduce((sum, item) => sum + item.defenseBoost, 0);
    const roleFitSummary = roleFitDetails.filter((item) => item.totalBoost > 0).length ? `役割適合: ${roleFitDetails.filter((item) => item.totalBoost > 0).map((item) => `${item.player}=${item.style} +${item.totalBoost}`).join(" / ")}` : "役割適合: 伸長なし";
    const sideLinkDetails = this.sideLinkAssessment(occupied);
    const sideLinkAttack = sideLinkDetails.reduce((sum, item) => sum + item.attackBoost, 0);
    const sideLinkDefense = sideLinkDetails.reduce((sum, item) => sum + item.defenseBoost, 0);
    const sideLinkSummary = sideLinkDetails.length ? `サイド連動: ${sideLinkDetails.map((item) => `${item.side} ${item.widePosition}${item.widePlayer}×SB${item.backPlayer}（攻+${item.attackBoost}/守+${item.defenseBoost}）`).join(" / ")}` : "サイド連動: SH・WGとSBを同じサイドで起用すると発動";
    const midfieldPressDetail = this.midfieldPressAssessment(occupied);
    const midfieldPressAttack = midfieldPressDetail.attackBoost;
    const midfieldPressDefense = midfieldPressDetail.defenseBoost;
    const midfieldPressSummary = midfieldPressDetail.summary;
    const midfieldPressReason = midfieldPressDetail.reason;
    const { details: skillDetails, skillAttack, skillDefense, skillSummary } = this.skillAssessment(selected);
    const cfRoleAttack = cfRoles.reduce((sum, item) => sum + item.option.attackBonus + (style.id === "direct" ? item.option.directBonus : style.id === "possession" ? item.option.possessionBonus : item.option.pressBonus), 0);
    const cfRoleDefense = cfRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const cfRoleSummary = cfRoles.length ? `CF役割: ${cfRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "CF役割: 前線適性なし";
    const wgRoleAttack = wgRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const wgRoleDefense = wgRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const wgRoleSummary = wgRoles.length ? `WG役割: ${wgRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "WG役割: 設定なし";
    const amRoleAttack = amRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const amRoleDefense = amRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const amRoleSummary = amRoles.length ? `AM役割: ${amRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "AM役割: 設定なし";
    const cmRoleAttack = cmRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const cmRoleDefense = cmRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const cmRoleSummary = cmRoles.length ? `CM役割: ${cmRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "CM役割: 設定なし";
    const dmRoleAttack = dmRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const dmRoleDefense = dmRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const dmRoleSummary = dmRoles.length ? `DM役割: ${dmRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "DM役割: 設定なし";
    const cbRoleAttack = cbRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const cbRoleDefense = cbRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const cbRoleSummary = cbRoles.length ? `CB役割: ${cbRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "CB役割: 設定なし";
    const sbRoleAttack = sbRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const sbRoleDefense = sbRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const sbRoleSummary = sbRoles.length ? `SB役割: ${sbRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "SB役割: 設定なし";
    const gkRoleAttack = gkRoles.reduce((sum, item) => sum + roleBonus(item.option), 0);
    const gkRoleDefense = gkRoles.reduce((sum, item) => sum + item.option.defenseBonus, 0);
    const gkRoleSummary = gkRoles.length ? `GK役割: ${gkRoles.map((item) => `${item.player.name}=${item.option.label}`).join(" / ")}` : "GK役割: 設定なし";
    return {
      formationLabel: this.formation.label, formationTrait: formationIdentity.trait, formationNote: formationIdentity.note,
      mentality: mentality.id, mentalityLabel: mentality.label, playingStyle: style.id, playingStyleLabel: style.label,
      chemistry, chemistryBonus, links,
      formationAttack: formationIdentity.attack, formationDefense: formationIdentity.defense,
      mentalityAttack: mentality.attack, mentalityDefense: mentality.defense,
      styleAttack: style.attack, styleDefense: style.defense,
      cfRoleAttack, cfRoleDefense, cfRoleSummary,
      wgRoleAttack, wgRoleDefense, wgRoleSummary,
      amRoleAttack, amRoleDefense, amRoleSummary,
      cmRoleAttack, cmRoleDefense, cmRoleSummary,
      dmRoleAttack, dmRoleDefense, dmRoleSummary,
      cbRoleAttack, cbRoleDefense, cbRoleSummary,
      sbRoleAttack, sbRoleDefense, sbRoleSummary,
      gkRoleAttack, gkRoleDefense, gkRoleSummary,
      roleFitAttack, roleFitDefense, roleFitSummary, roleFitDetails,
      sideLinkAttack, sideLinkDefense, sideLinkSummary, sideLinkDetails,
      midfieldPressAttack, midfieldPressDefense, midfieldPressSummary, midfieldPressReason, midfieldPressDetail,
      skillAttack, skillDefense, skillSummary, skillDetails,
      attackModifier: formationIdentity.attack + mentality.attack + style.attack + chemistryBonus + cfRoleAttack + wgRoleAttack + amRoleAttack + cmRoleAttack + dmRoleAttack + cbRoleAttack + sbRoleAttack + gkRoleAttack + roleFitAttack + sideLinkAttack + midfieldPressAttack + skillAttack,
      defenseModifier: formationIdentity.defense + mentality.defense + style.defense + chemistryBonus + cfRoleDefense + wgRoleDefense + amRoleDefense + cmRoleDefense + dmRoleDefense + cbRoleDefense + sbRoleDefense + gkRoleDefense + roleFitDefense + sideLinkDefense + midfieldPressDefense + skillDefense,
    };
  }

  private ensureSeasonStat(player: { id?: string; playerId?: string; name?: string; player?: string; position: string }) {
    let stat = this.seasonStats.find((item) => item.playerId === player.id || item.playerId === player.playerId);
    if (!stat) {
      const playerId = player.id ?? player.playerId ?? "unknown";
      const name = player.name ?? player.player ?? "不明な選手";
      const position = player.position;
      stat = { playerId, player: name, position, appearances: 0, starts: 0, goals: 0, assists: 0, ratingTotal: 0, ratingCount: 0, mvpAwards: 0 };
      this.seasonStats.push(stat);
    }
    return stat;
  }

  private recordSeasonStats(ratings: PlayerMatchRating[], mvp: PlayerMatchRating | null) {
    ratings.forEach((rating) => {
      const stat = this.ensureSeasonStat(rating);
      stat.player = rating.player;
      stat.position = rating.position;
      stat.appearances += 1;
      if (rating.started) stat.starts += 1;
      stat.goals += rating.goals;
      stat.assists += rating.assists;
      stat.ratingTotal += rating.rating;
      stat.ratingCount += 1;
    });
    if (mvp) this.ensureSeasonStat(mvp).mvpAwards += 1;
  }

  private rollbackSeasonStats(ratings: PlayerMatchRating[], mvp: PlayerMatchRating | null) {
    ratings.forEach((rating) => {
      const stat = this.seasonStats.find((item) => item.playerId === rating.playerId);
      if (!stat) return;
      stat.appearances = Math.max(0, stat.appearances - 1);
      stat.starts = Math.max(0, stat.starts - (rating.started ? 1 : 0));
      stat.goals = Math.max(0, stat.goals - rating.goals);
      stat.assists = Math.max(0, stat.assists - rating.assists);
      stat.ratingTotal = Math.max(0, stat.ratingTotal - rating.rating);
      stat.ratingCount = Math.max(0, stat.ratingCount - 1);
    });
    if (mvp) { const stat = this.seasonStats.find((item) => item.playerId === mvp.playerId); if (stat) stat.mvpAwards = Math.max(0, stat.mvpAwards - 1); }
  }

  private recordFinance(category: FinanceCategory, amount: number, kind: FinanceEntry["kind"], note: string, week: number) {
    this.ledger.push({ week, label: category, category, amount, kind, note });
    if (this.ledger.length > 180) this.ledger.splice(0, this.ledger.length - 180);
  }

  private captureCashPoint() {
    const latest = this.cashTrail.at(-1);
    if (latest !== this.money) this.cashTrail.push(this.money);
    if (this.cashTrail.length > 36) this.cashTrail.splice(0, this.cashTrail.length - 36);
  }

  private persist() {
    const saved: Persisted = { money: this.money, fame: this.fame, week: this.week, formationId: this.formationId, lineup: this.lineup, players: this.roster, rows: this.rows, logs: this.logs, recruited: this.recruited, sponsor: this.sponsor, cup: this.cup, popularity: this.popularity, teamMorale: this.teamMorale, recentMatchForm: this.recentMatchForm, concessionLevel: this.concessionLevel, scoutLevel: this.scoutLevel, trainingFacilityLevel: this.trainingFacilityLevel, trainingSessionsThisWeek: this.trainingSessionsThisWeek, youthIntakeCursor: this.youthIntakeCursor, ledger: this.ledger, cashTrail: this.cashTrail, mentality: this.mentality, playingStyle: this.playingStyle, injuries: this.injuries, recruitNegotiation: this.recruitNegotiation, saleOffers: this.saleOffers, trainingHistory: this.trainingHistory, lastTrainingWeek: this.lastTrainingWeek, marketSignedIds: this.marketSignedIds, marketCandidateIds: this.marketCandidateIds, marketPreferredPositions: this.marketPreferredPositions, marketCandidateCycle: this.marketCandidateCycle, marketUpdateNotice: this.pendingMarketUpdateNotice, youthPlayers: this.youthPlayers, seasonStats: this.seasonStats, manualMarkAssignments: this.manualMarkAssignments };
    saved.assignedScoutId = this.assignedScoutId;
    try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch { /* Private mode or storage restrictions must not block gameplay. */ }
  }

  private load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Persisted;
      if (!this.hasUsableSave(parsed)) throw new Error("Invalid save data");
      this.money = parsed.money; this.fame = parsed.fame; this.week = parsed.week; this.formationId = parsed.formationId; this.lineup = parsed.lineup; this.roster = this.hydrateOpeningRoster(parsed.players, parsed.week); this.rows = parsed.rows; this.logs = parsed.logs; this.recruited = parsed.recruited;
      this.sponsor = parsed.sponsor ?? null; this.cup = parsed.cup ?? initialCup(); this.popularity = parsed.popularity ?? 42; this.teamMorale = clamp(Math.round(finiteOr(parsed.teamMorale, 58)), 0, 100); this.recentMatchForm = Array.isArray(parsed.recentMatchForm) ? parsed.recentMatchForm.filter((entry): entry is RecentMatchForm => !!entry && ["W", "D", "L"].includes(entry.outcome) && Number.isFinite(entry.margin) && (entry.competition === "リーグ" || entry.competition === "カップ")).slice(0, 5).map((entry) => ({ outcome: entry.outcome, margin: clamp(Math.round(entry.margin), -5, 5), competition: entry.competition })) : []; this.concessionLevel = clamp(parsed.concessionLevel ?? 1, 1, concessionLevels.length); this.scoutLevel = clamp(parsed.scoutLevel ?? 1, 1, scoutLevels.length); this.assignedScoutId = scoutStaff.some((staff) => staff.id === parsed.assignedScoutId) ? parsed.assignedScoutId! : "scout-forward"; this.trainingFacilityLevel = clamp(parsed.trainingFacilityLevel ?? 1, 1, trainingFacilityLevels.length); this.trainingSessionsThisWeek = Math.max(0, Math.round(finiteOr(parsed.trainingSessionsThisWeek, 0))); this.youthIntakeCursor = Math.max(0, Math.round(finiteOr(parsed.youthIntakeCursor, 0))); this.lastTrainingWeek = typeof parsed.lastTrainingWeek === "number" && Number.isFinite(parsed.lastTrainingWeek) && parsed.lastTrainingWeek >= 0 ? Math.round(parsed.lastTrainingWeek) : null; this.mentality = mentalityOptions.some((item) => item.id === parsed.mentality) ? parsed.mentality! : "balanced"; this.playingStyle = playingStyleOptions.some((item) => item.id === parsed.playingStyle) ? parsed.playingStyle! : "possession"; this.injuries = parsed.injuries ?? Object.fromEntries(this.roster.filter((player) => (player.injuryWeeks ?? 0) > 0).map((player) => [player.id, player.injuryWeeks!])); this.ledger = parsed.ledger?.length ? parsed.ledger : [{ week: parsed.week, label: "既存シーズン繰越", category: "繰越資金", amount: parsed.money, kind: "income", note: "財務ダッシュボード導入前の残高" }]; this.cashTrail = parsed.cashTrail?.length ? parsed.cashTrail : [parsed.money]; this.marketSignedIds = this.hydrateMarketSignedIds(parsed.marketSignedIds, parsed.recruited); this.marketPreferredPositions = Array.isArray(parsed.marketPreferredPositions) ? Array.from(new Set(parsed.marketPreferredPositions.filter((position): position is Player["position"] => typeof position === "string" && ["GK", "CB", "SB", "DM", "CM", "AM", "SH", "WG", "CF"].includes(position)))) : []; this.marketCandidateIds = Array.isArray(parsed.marketCandidateIds) ? Array.from(new Set(parsed.marketCandidateIds.filter((id): id is string => typeof id === "string" && marketRecruits.some((player) => player.id === id)))) : []; this.marketCandidateCycle = Math.max(0, Math.round(finiteOr(parsed.marketCandidateCycle, -1))); const savedMarketNotice = parsed.marketUpdateNotice; this.pendingMarketUpdateNotice = savedMarketNotice && Number.isFinite(savedMarketNotice.week) && Array.isArray(savedMarketNotice.candidateIds) ? { week: Math.max(0, Math.round(savedMarketNotice.week)), candidateIds: savedMarketNotice.candidateIds.filter((id): id is string => typeof id === "string" && marketRecruits.some((player) => player.id === id)), requestedPositions: Array.isArray(savedMarketNotice.requestedPositions) ? savedMarketNotice.requestedPositions.filter((position): position is Player["position"] => typeof position === "string" && ["GK", "CB", "SB", "DM", "CM", "AM", "SH", "WG", "CF"].includes(position)) : [] } : null; this.recruitNegotiation = this.hydrateRecruitNegotiation(parsed.recruitNegotiation, parsed.recruited); this.saleOffers = this.hydrateSaleOffers(parsed.saleOffers); this.trainingHistory = this.hydrateTrainingHistory(parsed.trainingHistory); this.youthPlayers = this.hydrateYouthPlayers(parsed.youthPlayers); this.seasonStats = this.hydrateSeasonStats(parsed.seasonStats); this.manualMarkAssignments = Object.fromEntries(Object.entries(parsed.manualMarkAssignments ?? {}).filter(([, playerId]) => typeof playerId === "string" && this.roster.some((player) => player.id === playerId)));
    } catch {
      try { localStorage.removeItem(storageKey); } catch { /* Storage may be disabled; the initial state remains usable. */ }
      this.resetToInitialState();
    }
  }

  private hydratePlayer(saved: Player) {
    const reference = [...players, ...marketRecruits, ...youthProspects, ...youthIntakes].find((player) => player.id === saved.id);
    const attack = finiteOr(saved.attack, reference?.attack ?? 45);
    const defense = finiteOr(saved.defense, reference?.defense ?? 45);
    const legacyPosition = saved.position as string;
    const legacySecondary = saved.secondary as string | undefined;
    const position = legacyPosition === "ST" ? "CF" : saved.position;
    const secondary = legacySecondary === "ST" ? "CF" : saved.secondary;
    const cfPlayStyle = isCfEligible({ position, secondary }) ? (cfPlayStyleOptions.find((option) => option.id === (saved.cfPlayStyle ?? reference?.cfPlayStyle))?.id ?? cfPlayStyleOptions[0].id) : undefined;
    const wgPlayStyle = isWgEligible({ position, secondary }) ? (wgPlayStyleOptions.find((option) => option.id === (saved.wgPlayStyle ?? reference?.wgPlayStyle))?.id ?? wgPlayStyleOptions[0].id) : undefined;
    const amPlayStyle = isAmEligible({ position, secondary }) ? (amPlayStyleOptions.find((option) => option.id === (saved.amPlayStyle ?? reference?.amPlayStyle))?.id ?? amPlayStyleOptions[0].id) : undefined;
    const cmPlayStyle = isCmEligible({ position, secondary }) ? (cmPlayStyleOptions.find((option) => option.id === (saved.cmPlayStyle ?? reference?.cmPlayStyle))?.id ?? cmPlayStyleOptions[0].id) : undefined;
    const dmPlayStyle = isDmEligible({ position, secondary }) ? (dmPlayStyleOptions.find((option) => option.id === (saved.dmPlayStyle ?? reference?.dmPlayStyle))?.id ?? dmPlayStyleOptions[0].id) : undefined;
    const cbPlayStyle = isCbEligible({ position, secondary }) ? (cbPlayStyleOptions.find((option) => option.id === (saved.cbPlayStyle ?? reference?.cbPlayStyle))?.id ?? cbPlayStyleOptions[0].id) : undefined;
    const sbPlayStyle = isSbEligible({ position, secondary }) ? (sbPlayStyleOptions.find((option) => option.id === (saved.sbPlayStyle ?? reference?.sbPlayStyle))?.id ?? sbPlayStyleOptions[0].id) : undefined;
    const gkPlayStyle = isGkEligible({ position, secondary }) ? (gkPlayStyleOptions.find((option) => option.id === (saved.gkPlayStyle ?? reference?.gkPlayStyle))?.id ?? gkPlayStyleOptions[0].id) : undefined;
    const skills = playerSkillsFor({ position, skills: saved.skills ?? reference?.skills });
    const isLegacyYouthTendency = Boolean(reference?.youthSkillTendency) && !saved.youthSkillTendency;
    const savedXp = saved.skillXp && Object.keys(saved.skillXp).length ? saved.skillXp : reference?.skillXp ?? {};
    const skillXp = Object.fromEntries(Object.entries(savedXp).filter(([skillId, xp]) => Boolean(playerSkillCatalog[skillId as PlayerSkillId]) && Number.isFinite(xp)).map(([skillId, xp]) => [skillId, clamp(Math.round(xp as number), 0, 210)])) as Partial<Record<PlayerSkillId, number>>;
    const savedTarget = isLegacyYouthTendency ? reference?.skillTrainingTarget : saved.skillTrainingTarget ?? reference?.skillTrainingTarget;
    const skillTrainingTarget = savedTarget && playerSkillCatalog[savedTarget] ? savedTarget : skills[0];
    return {
      ...saved,
      position,
      secondary,
      cfPlayStyle,
      wgPlayStyle,
      amPlayStyle,
      cmPlayStyle,
      dmPlayStyle,
      cbPlayStyle,
      sbPlayStyle,
      gkPlayStyle,
      skills,
      skillXp,
      skillTrainingTarget,
      youthSkillTendency: saved.youthSkillTendency ?? reference?.youthSkillTendency,
      salary: reference?.salary ?? Math.max(2400000, finiteOr(saved.salary, 2400000) * (finiteOr(saved.salary, 0) < 1000000 ? 12 : 1)),
      attack,
      defense,
      dribble: finiteOr(saved.dribble, reference?.dribble ?? attack),
      pass: finiteOr(saved.pass, reference?.pass ?? attack),
      shoot: finiteOr(saved.shoot, reference?.shoot ?? attack),
      tackle: finiteOr(saved.tackle, reference?.tackle ?? defense),
      block: finiteOr(saved.block, reference?.block ?? defense),
      interception: finiteOr(saved.interception, reference?.interception ?? defense),
      trainingLoad: trainingLoadOptions.some((option) => option.id === saved.trainingLoad) ? saved.trainingLoad : "standard",
      contractYears: clamp(Math.round(finiteOr(saved.contractYears, reference ? defaultContractYears(reference) : defaultContractYears(saved))), 1, 3),
      winBonus: Math.max(0, finiteOr(saved.winBonus, 0)),
      appearanceBonus: Math.max(0, finiteOr(saved.appearanceBonus, 0)),
      goalBonus: Math.max(0, finiteOr(saved.goalBonus, 0)),
    } as Player;
  }

  private hydrateOpeningRoster(saved: Player[], week: number) {
    const hydrated = saved.map((player) => this.hydratePlayer(player));
    const legacyIds = players.slice(0, 16).map((player) => player.id);
    const isLegacyOpeningSave = week === 0 && hydrated.length === legacyIds.length && legacyIds.every((id) => hydrated.some((player) => player.id === id));
    const openingRoster = isLegacyOpeningSave ? [...hydrated, ...players.slice(16).map((player) => this.hydratePlayer(player))] : hydrated;
    return week === 0 ? openingRoster.map((player) => player.id === "p19" && player.position === "AM" && player.secondary === "WG" ? this.hydratePlayer({ ...player, position: "SH", secondary: "WG" }) : player) : openingRoster;
  }

  private hydrateRecruitNegotiation(saved: RecruitNegotiation | undefined, recruited: boolean): RecruitNegotiation {
    const candidate = this.currentMarketCandidate;
    if (!candidate) return initialRecruitNegotiation();
    if (!saved || !["scouting", "countered", "agreed"].includes(saved.stage) || (saved.candidateId && saved.candidateId !== candidate.id)) return initialRecruitNegotiation(candidate);
    const openingOffer = finiteOr(saved.openingOffer, Math.round(candidate.salary * .82));
    const counterOffer = finiteOr(saved.counterOffer, Math.round(candidate.salary * .95));
    return { candidateId: candidate.id, stage: saved.stage, openingOffer, counterOffer, agreedFee: saved.stage === "agreed" ? finiteOr(saved.agreedFee, counterOffer) : null };
  }

  private hydrateMarketSignedIds(saved: string[] | undefined, recruited: boolean) {
    const fromSave = Array.isArray(saved) ? saved.filter((id): id is string => typeof id === "string" && marketRecruits.some((player) => player.id === id)) : [];
    if (recruited && !fromSave.includes(recruit.id)) fromSave.push(recruit.id);
    return Array.from(new Set(fromSave));
  }

  private hydrateSaleOffers(saved: SaleOffer[] | undefined): SaleOffer[] {
    const candidates = Array.isArray(saved) && saved.length ? saved : initialSaleOffers();
    return candidates.filter((offer): offer is SaleOffer => !!offer && typeof offer.id === "string" && typeof offer.playerId === "string" && typeof offer.clubName === "string" && Number.isFinite(offer.proposedFee) && Number.isFinite(offer.expiresWeek) && this.roster.some((player) => player.id === offer.playerId));
  }

  private hydrateTrainingHistory(saved: TrainingHistoryEntry[] | undefined): TrainingHistoryEntry[] {
    if (!Array.isArray(saved)) return [];
    return saved.filter((entry): entry is TrainingHistoryEntry => !!entry && typeof entry.week === "number" && trainingOptions.some((option) => option.id === entry.focus) && typeof entry.label === "string" && Number.isFinite(entry.affected) && Array.isArray(entry.changes) && Number.isFinite(entry.fatigueChange)).slice(0, 16);
  }

  private scoutYouthProspect(prospect: Player): YouthPlayer {
    const facility = this.scoutFacility;
    const staff = this.assignedScout;
    const paceOrder: Array<NonNullable<Player["youthSkillTendency"]>["growthPace"]> = ["じっくり", "標準", "早熟"];
    const tendency = prospect.youthSkillTendency;
    const specialtyMatch = playerSkillCatalog[staff.specialtySkill].positions.includes(prospect.position) || Boolean(prospect.secondary && playerSkillCatalog[staff.specialtySkill].positions.includes(prospect.secondary));
    const skills = specialtyMatch ? Array.from(new Set([...playerSkillsFor(prospect), staff.specialtySkill])) : playerSkillsFor(prospect);
    const initialXp = Object.fromEntries(Object.entries(prospect.skillXp ?? {}).map(([skillId, xp]) => [skillId, clamp(Math.round(finiteOr(xp, 0)) + facility.youthInitialXpBonus, 0, 99)])) as Partial<Record<PlayerSkillId, number>>;
    if (specialtyMatch) initialXp[staff.specialtySkill] = clamp((initialXp[staff.specialtySkill] ?? facility.youthInitialXpBonus) + staff.entryXpBonus, 0, 99);
    const basePace = tendency ? paceOrder.indexOf(tendency.growthPace) : 1;
    const growthPace = tendency ? paceOrder[clamp(basePace + facility.youthPaceStep, 0, paceOrder.length - 1)] : undefined;
    return { ...prospect, skills, skillXp: initialXp, skillTrainingTarget: specialtyMatch ? staff.specialtySkill : prospect.skillTrainingTarget, youthScoutLevel: facility.level, youthSkillQuality: facility.youthQuality, youthInitialXpBonus: facility.youthInitialXpBonus, youthScoutXpBonus: facility.youthSessionXpBonus, youthScoutStaffId: specialtyMatch ? staff.id : undefined, youthScoutStaffName: specialtyMatch ? staff.name : undefined, youthScoutStaffImpact: specialtyMatch ? `${staff.profile}：${staff.specialtyLabel}に${playerSkillCatalog[staff.specialtySkill].label}の傾向を追加` : undefined, youthScoutStaffEntryXpBonus: specialtyMatch ? staff.entryXpBonus : 0, youthScoutStaffSessionXpBonus: specialtyMatch ? staff.sessionXpBonus : 0, youthSkillTendency: tendency && growthPace ? { ...tendency, developmentSkill: specialtyMatch ? staff.specialtySkill : tendency.developmentSkill, recommendedFocus: specialtyMatch ? playerSkillGrowthFocus[staff.specialtySkill][0] : tendency.recommendedFocus, growthPace, coachNote: `${tendency.coachNote} スカウト網Lv.${facility.level}の選抜により、${facility.youthQuality}品質で加入。${specialtyMatch ? ` ${staff.name}の${staff.profile}により、${playerSkillCatalog[staff.specialtySkill].label}を重点化。` : ""}` } : tendency, academyWeeks: 0 };
  }

  private hydrateYouthPlayers(saved: YouthPlayer[] | undefined): YouthPlayer[] {
    if (!Array.isArray(saved)) return youthProspects.map((player) => this.scoutYouthProspect(player));
    return saved.filter((player) => [...youthProspects, ...youthIntakes].some((prospect) => prospect.id === player?.id)).map((player) => {
      const hydrated = { ...this.hydratePlayer(player), academyWeeks: clamp(Math.round(finiteOr(player.academyWeeks, 0)), 0, 24) };
      return hydrated.youthScoutLevel ? hydrated : { ...this.scoutYouthProspect(hydrated), academyWeeks: hydrated.academyWeeks };
    });
  }

  private hydrateSeasonStats(saved: PlayerSeasonStat[] | undefined): PlayerSeasonStat[] {
    const empty = initialSeasonStats(this.roster);
    if (!Array.isArray(saved)) return empty;
    const valid = saved.filter((stat): stat is PlayerSeasonStat => !!stat && typeof stat.playerId === "string" && typeof stat.player === "string" && typeof stat.position === "string" && [stat.appearances, stat.starts, stat.goals, stat.assists, stat.ratingTotal, stat.ratingCount, stat.mvpAwards].every(Number.isFinite));
    const merged = new Map(valid.map((stat) => [stat.playerId, { ...stat, position: stat.position === "ST" ? "CF" : stat.position, appearances: Math.max(0, Math.round(stat.appearances)), starts: Math.max(0, Math.round(stat.starts)), goals: Math.max(0, Math.round(stat.goals)), assists: Math.max(0, Math.round(stat.assists)), ratingTotal: Math.max(0, stat.ratingTotal), ratingCount: Math.max(0, Math.round(stat.ratingCount)), mvpAwards: Math.max(0, Math.round(stat.mvpAwards)) }]));
    empty.forEach((stat) => { if (!merged.has(stat.playerId)) merged.set(stat.playerId, stat); });
    return Array.from(merged.values());
  }
}
