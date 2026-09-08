/**
 * Design system: 「タッチライン戦術室」— dense tactical cards and a compact mobile scoreboard keep club health visible at all times.
 */
import { assets } from "./assets";
import { ClubSimulation, amPlayStyleOptions, cbPlayStyleOptions, cfPlayStyleOptions, cmPlayStyleOptions, contractOfferOptions, dmPlayStyleOptions, gkPlayStyleOptions, mentalityOptions, playingStyleOptions, sbPlayStyleOptions, sponsorOffers, trainingLoadOptions, trainingOptions, wgPlayStyleOptions, type ConcessionReceipt, type ContractOfferId, type GateReceipt, type MatchHighlight, type MembershipReceipt, type MerchandiseReceipt, type Mentality, type PageId, type PlayingStyle, type RolePlayStyleFit, type RoleStyleOption, type TrainingFocus } from "./ClubSimulation";
import { formations, opponentSeeds, playerSkillCatalog, positionLabel, recruit, type AMPlayStyle, type CBPlayStyle, type CFPlayStyle, type CMPlayStyle, type DMPlayStyle, type GKPlayStyle, type OpponentPlayer, type Player, type PlayerSkillId, type SBPlayStyle, type Slot, type WGPlayStyle } from "./data";

const navItems: Array<{ id: PageId; icon: string; label: string }> = [
  { id: "home", icon: "⌂", label: "ホーム" }, { id: "lineup", icon: "◫", label: "スタメン" }, { id: "team", icon: "◎", label: "チーム" }, { id: "stats", icon: "◈", label: "成績" },
  { id: "league", icon: "▤", label: "リーグ" }, { id: "cup", icon: "♛", label: "カップ戦" }, { id: "training", icon: "↗", label: "練習" },
  { id: "market", icon: "◇", label: "移籍市場" }, { id: "academy", icon: "✦", label: "ユース" }, { id: "sponsors", icon: "▣", label: "スポンサー" }, { id: "facilities", icon: "▥", label: "施設" }, { id: "finance", icon: "◒", label: "財務" }, { id: "settings", icon: "⚙", label: "クラブ設定" },
];
const mobileDockItems = navItems.filter((item) => ["home", "lineup", "team", "league"].includes(item.id));

const formatMoney = (value: number) => `${value.toLocaleString()}円`;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character] ?? character);
const average = (values: number[]) => values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
const surname = (name: string) => name.trim();
const compactSurname = (name: string) => name.trim().split(/\s+/)[0] || name;
const signed = (value: number) => `${value >= 0 ? "+" : ""}${value}`;
type RosterSort = "position" | "ability" | "salary-high" | "salary-low" | "contract-short" | "contract-long";
const rosterPositionOrder: Record<string, number> = { GK: 0, CB: 1, SB: 2, DM: 3, CM: 4, SH: 5, AM: 6, WG: 7, CF: 8 };
type SalaryFilter = "all" | "high" | "low";
type ContractFilter = "all" | "due" | "short" | "long";
type MarkTone = "advantage" | "even" | "caution";
type MarkingAssessment = { player: Player; tone: MarkTone; label: string; differential: number; reason: string; manual: boolean };

export class GameUI {
  private root = document.createElement("div");
  private page: PageId = "home";
  private toast = "";
  private modal = false;
  private matchStage: "halftime" | "fulltime" = "fulltime";
  private halfTimeMentality: Mentality | null = null;
  private halfTimeStyle: PlayingStyle | null = null;
  private halfTimePendingOut: string | null = null;
  private halfTimeChanges: Array<{ outPlayerId: string; inPlayerId: string }> = [];
  private commentaryTimer: number | null = null;
  private commentaryPhase: "first-half" | "second-half" | null = null;
  private commentaryVisibleCount = 0;
  private goalCelebration: MatchHighlight | null = null;
  private goalCelebrationTimer: number | null = null;
  private crowdAudio: AudioContext | null = null;
  private mobileNavOpen = false;
  private playerDetailId: string | null = null;
  private opponentScoutOpen = false;
  private opponentPlayerDetailId: string | null = null;
  private manualMarkSourceId: string | null = null;
  private draggingMarkSourceId: string | null = null;
  private radarMorph: { playerId: string; role: RolePlayStyleFit["role"]; values: number[] } | null = null;
  private rosterSort: RosterSort = "position";
  private rosterSalaryFilter: SalaryFilter = "all";
  private rosterContractFilter: ContractFilter = "all";
  private lineupPositionFilter: Player["position"] | "all" = "all";

  constructor(private readonly simulation: ClubSimulation) {
    this.root.className = "game-ui";
    document.body.appendChild(this.root);
    this.root.addEventListener("click", this.handleClick);
    this.root.addEventListener("dragstart", this.handleMarkDragStart);
    this.root.addEventListener("dragover", this.handleMarkDragOver);
    this.root.addEventListener("drop", this.handleMarkDrop);
    this.root.addEventListener("dragend", this.handleMarkDragEnd);
    const params = new URLSearchParams(window.location.search);
    const previewRoster = Number(params.get("preview-roster"));
    if (import.meta.env.DEV && [30, 31, 32].includes(previewRoster) && this.simulation.rosterPlayers.length < previewRoster) {
      const template = this.simulation.rosterPlayers[0];
      while (this.simulation.rosterPlayers.length < previewRoster) {
        const index = this.simulation.rosterPlayers.length + 1;
        this.simulation.rosterPlayers.push({ ...template, id: `preview-capacity-${index}`, name: `プレビュー選手 ${index}`, fatigue: 0 });
      }
    }
    const requestedPage = params.get("page") as PageId | null;
    if (requestedPage && navItems.some((item) => item.id === requestedPage)) this.page = requestedPage;
    const requestedPlayer = params.get("player");
    if (requestedPlayer && this.simulation.rosterPlayers.some((player) => player.id === requestedPlayer)) {
      this.page = "team";
      this.playerDetailId = requestedPlayer;
    }
    if (params.get("scout") === "1") this.opponentScoutOpen = true;
    this.render();
    if (new URLSearchParams(window.location.search).has("demo")) {
      window.setTimeout(() => { this.simulation.autoLineup(); this.openMatch(); }, 600);
    }
  }

  dispose() {
    this.stopLiveCommentary();
    this.stopGoalCelebration();
    void this.crowdAudio?.close();
    this.root.removeEventListener("click", this.handleClick);
    this.root.removeEventListener("dragstart", this.handleMarkDragStart);
    this.root.removeEventListener("dragover", this.handleMarkDragOver);
    this.root.removeEventListener("drop", this.handleMarkDrop);
    this.root.removeEventListener("dragend", this.handleMarkDragEnd);
    this.root.remove();
  }

  private handleClick = (event: MouseEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action], [data-nav], [data-mobile-nav], [data-player], [data-player-detail], [data-close-player-detail], [data-opponent-player], [data-mark-source], [data-mark-clear], [data-slot], [data-formation], [data-mentality], [data-style], [data-half-mentality], [data-half-style], [data-half-out], [data-half-in], [data-half-remove], [data-roster-sort], [data-roster-salary-filter], [data-roster-contract-filter], [data-lineup-position-filter]");
    if (!target) return;
    if (target.dataset.mobileNav !== undefined) { this.mobileNavOpen = !this.mobileNavOpen; this.render(); return; }
    if (target.dataset.nav) { this.page = target.dataset.nav as PageId; this.mobileNavOpen = false; this.playerDetailId = null; this.opponentScoutOpen = false; this.opponentPlayerDetailId = null; this.manualMarkSourceId = null; this.toast = ""; this.render(); return; }
    if (target.dataset.rosterSort) { this.rosterSort = target.dataset.rosterSort as RosterSort; this.toast = "選手一覧の並び順を更新しました。"; this.render(); return; }
    if (target.dataset.rosterSalaryFilter) { this.rosterSalaryFilter = target.dataset.rosterSalaryFilter as SalaryFilter; this.toast = "年俸条件を更新しました。"; this.render(); return; }
    if (target.dataset.rosterContractFilter) { this.rosterContractFilter = target.dataset.rosterContractFilter as ContractFilter; this.toast = "契約年数の条件を更新しました。"; this.render(); return; }
    if (target.dataset.lineupPositionFilter) { this.lineupPositionFilter = target.dataset.lineupPositionFilter as Player["position"] | "all"; this.toast = this.lineupPositionFilter === "all" ? "スタメン候補の絞り込みを解除しました。" : `${this.lineupPositionFilter}の主適性・副適性候補を表示します。`; this.render(); return; }
    if (target.dataset.playerDetail) { this.playerDetailId = target.dataset.playerDetail; this.render(); return; }
    if (target.dataset.closePlayerDetail !== undefined) { this.playerDetailId = null; this.render(); return; }
    if (target.dataset.markSource) {
      const source = this.simulation.rosterPlayers.find((player) => player.id === target.dataset.markSource);
      this.manualMarkSourceId = this.manualMarkSourceId === target.dataset.markSource ? null : target.dataset.markSource;
      this.toast = this.manualMarkSourceId && source ? `${source.name}を選択中。相手選手へドロップ、またはタップして担当を指定します。` : "担当選手の選択を解除しました。";
      this.render();
      return;
    }
    if (target.dataset.markClear !== undefined) {
      this.simulation.clearManualMarkAssignments();
      this.manualMarkSourceId = null;
      this.toast = "手動のマーク指定を解除し、近接ポジションの自動判定へ戻しました。";
      this.render();
      return;
    }
    if (target.dataset.opponentPlayer) {
      if (this.manualMarkSourceId) {
        const result = this.simulation.setManualMarkAssignment(target.dataset.opponentPlayer, this.manualMarkSourceId);
        this.toast = result.text;
        if (result.ok) this.manualMarkSourceId = null;
        this.render();
        return;
      }
      this.opponentPlayerDetailId = target.dataset.opponentPlayer;
      this.render();
      return;
    }
    if (target.dataset.player) {
      const incomingId = target.dataset.player;
      const selected = this.simulation.selectedPlayer;
      const selectedSlot = selected ? Object.entries(this.simulation.lineupState).find(([, playerId]) => playerId === selected.id)?.[0] : null;
      const incomingIsStarter = Object.values(this.simulation.lineupState).includes(incomingId);
      if (selected && selectedSlot && selected.id !== incomingId && !incomingIsStarter) {
        this.simulation.selectPlayer(incomingId);
        const swapped = this.simulation.assignSelected(selectedSlot);
        this.toast = swapped ? `${selected.name}に代えて${incomingId === selected.id ? selected.name : this.simulation.rosterPlayers.find((player) => player.id === incomingId)?.name ?? "選手"}を起用しました。` : "交代対象を配置できませんでした。";
      } else {
        this.simulation.selectPlayer(incomingId);
      }
      this.render();
      return;
    }
    if (target.dataset.slot) {
      const slotId = target.dataset.slot;
      const slotPlayer = this.simulation.playerForSlot(slotId);
      const selected = this.simulation.selectedPlayer;
      if (!selected && slotPlayer) {
        this.simulation.selectPlayer(slotPlayer.id);
        this.toast = `${slotPlayer.name}を交代対象として選択しました。ベンチ選手を選ぶと交代します。`;
      } else if (selected && slotPlayer?.id === selected.id) {
        this.simulation.selectPlayer(selected.id);
        this.toast = "交代対象の選択を解除しました。";
      } else {
        const assigned = this.simulation.assignSelected(slotId);
        if (assigned && selected) this.toast = `${selected.name}を${slotPlayer ? `${slotPlayer.name}に代えて` : "空き枠へ"}配置しました。`;
      }
      this.render();
      return;
    }
    if (target.dataset.formation) { this.simulation.setFormation(target.dataset.formation); this.render(); return; }
    if (target.dataset.mentality) { this.simulation.setMentality(target.dataset.mentality as Mentality); this.toast = `${this.simulation.score().tactics.mentalityLabel}へ攻守意識を変更しました。`; this.render(); return; }
    if (target.dataset.style) { this.simulation.setPlayingStyle(target.dataset.style as PlayingStyle); this.toast = `${this.simulation.score().tactics.playingStyleLabel}を試合プランへ設定しました。`; this.render(); return; }
    if (target.dataset.halfMentality) { this.halfTimeMentality = target.dataset.halfMentality as Mentality; this.render(); return; }
    if (target.dataset.halfStyle) { this.halfTimeStyle = target.dataset.halfStyle as PlayingStyle; this.render(); return; }
    if (target.dataset.halfOut) { this.halfTimePendingOut = target.dataset.halfOut; this.render(); return; }
    if (target.dataset.halfIn) {
      const outPlayerId = this.halfTimePendingOut;
      const inPlayerId = target.dataset.halfIn;
      const slotId = outPlayerId ? Object.entries(this.simulation.lineupState).find(([, playerId]) => playerId === outPlayerId)?.[0] : null;
      const incoming = this.simulation.rosterPlayers.find((player) => player.id === inPlayerId);
      if (outPlayerId && incoming && slotId && this.simulation.playerIsFit(incoming, slotId) && this.simulation.injuryWeeksFor(incoming.id) === 0 && this.halfTimeChanges.length < this.simulation.maxSubstitutions && !this.halfTimeChanges.some((item) => item.outPlayerId === outPlayerId || item.inPlayerId === inPlayerId)) this.halfTimeChanges.push({ outPlayerId, inPlayerId });
      this.halfTimePendingOut = null;
      this.render();
      return;
    }
    if (target.dataset.halfRemove) { this.halfTimeChanges.splice(Number(target.dataset.halfRemove), 1); this.render(); return; }
    switch (target.dataset.action) {
      case "advance": this.openMatch(); break;
      case "open-opponent-scout": this.opponentScoutOpen = true; this.playerDetailId = null; this.opponentPlayerDetailId = null; this.manualMarkSourceId = null; this.render(); break;
      case "close-opponent-scout": this.opponentScoutOpen = false; this.opponentPlayerDetailId = null; this.manualMarkSourceId = null; this.render(); break;
      case "close-opponent-player": this.opponentPlayerDetailId = null; this.render(); break;
      case "close-modal": { this.stopLiveCommentary(); this.stopGoalCelebration(); this.modal = false; this.matchStage = "fulltime"; this.resetHalfTimeControls(); const marketNotice = this.simulation.marketUpdateNotice; if (marketNotice) this.toast = `新着候補 ${marketNotice.candidates.length}名が市場に届きました。${marketNotice.requestedPositions.length ? `希望ポジション（${marketNotice.requestedPositions.map(positionLabel).join(" / ")}）に限定済みです。` : "移籍市場で確認してください。"}`; this.render(); break; }
      case "skip-commentary": this.finishLiveCommentary(); this.render(); break;
      case "continue-half": {
        const result = this.simulation.lastResult;
        if (!result) break;
        if (this.commentaryPhase === "first-half") { this.toast = "実況の受信が完了すると、後半を開始できます。"; this.render(); break; }
        const urgentInjury = result.injuries.find((injury) => injury.minute <= 45 && !this.halfTimeChanges.some((change) => change.outPlayerId === injury.playerId));
        if (urgentInjury) { this.toast = `${urgentInjury.player}の負傷交代を先に完了してください。`; this.render(); break; }
        const update = this.simulation.applyHalfTimePlan(this.halfTimeMentality ?? result.tactics.mentality, this.halfTimeStyle ?? result.tactics.playingStyle, this.halfTimeChanges);
        this.toast = update.text;
        this.matchStage = "fulltime";
        this.resetHalfTimeControls();
        this.startLiveCommentary("second-half");
        break;
      }
      case "auto": this.simulation.autoLineup(); this.toast = "最適な11人を戦術ボードへ配置しました。"; this.render(); break;
      case "train": { const result = this.simulation.train(target.dataset.training as TrainingFocus); this.toast = result.text; this.render(); break; }
      case "set-training-load": { const result = this.simulation.setTrainingLoad(target.dataset.trainingPlayer ?? "", target.dataset.trainingLoad as "recovery" | "light" | "standard" | "high"); this.toast = result.text; this.render(); break; }
      case "set-skill-training-target": { const result = this.simulation.setSkillTrainingTarget(target.dataset.skillPlayer ?? "", target.dataset.skillTarget as PlayerSkillId); this.toast = result.text; this.render(); break; }
      case "set-youth-skill-training-target": { const result = this.simulation.setYouthSkillTrainingTarget(target.dataset.youthSkillPlayer ?? "", target.dataset.youthSkillTarget as PlayerSkillId); this.toast = result.text; this.render(); break; }
      case "assign-scout-staff": { const result = this.simulation.assignScoutStaff(target.dataset.scoutStaff ?? ""); this.toast = result.text; this.render(); break; }
      case "set-role-play-style": { const role = target.dataset.roleKind as "cf" | "wg" | "am" | "cm" | "dm" | "cb" | "sb" | "gk"; const player = this.simulation.rosterPlayers.find((item) => item.id === target.dataset.rolePlayer); const current = player ? role === "cf" ? this.simulation.cfPlayStyleFor(player) : role === "wg" ? this.simulation.wgPlayStyleFor(player) : role === "am" ? this.simulation.amPlayStyleFor(player) : role === "cm" ? this.simulation.cmPlayStyleFor(player) : role === "dm" ? this.simulation.dmPlayStyleFor(player) : role === "cb" ? this.simulation.cbPlayStyleFor(player) : role === "sb" ? this.simulation.sbPlayStyleFor(player) : this.simulation.gkPlayStyleFor(player) : null; if (player && current) this.radarMorph = { playerId: player.id, role, values: this.roleFitRadarValues(this.simulation.rolePlayStyleFit(player, role, current)) }; const playStyle = target.dataset.roleStyle ?? ""; const result = role === "cf" ? this.simulation.setCfPlayStyle(target.dataset.rolePlayer ?? "", playStyle as CFPlayStyle) : role === "wg" ? this.simulation.setWgPlayStyle(target.dataset.rolePlayer ?? "", playStyle as WGPlayStyle) : role === "am" ? this.simulation.setAmPlayStyle(target.dataset.rolePlayer ?? "", playStyle as AMPlayStyle) : role === "cm" ? this.simulation.setCmPlayStyle(target.dataset.rolePlayer ?? "", playStyle as CMPlayStyle) : role === "dm" ? this.simulation.setDmPlayStyle(target.dataset.rolePlayer ?? "", playStyle as DMPlayStyle) : role === "cb" ? this.simulation.setCbPlayStyle(target.dataset.rolePlayer ?? "", playStyle as CBPlayStyle) : role === "sb" ? this.simulation.setSbPlayStyle(target.dataset.rolePlayer ?? "", playStyle as SBPlayStyle) : this.simulation.setGkPlayStyle(target.dataset.rolePlayer ?? "", playStyle as GKPlayStyle); if (!result.ok) this.radarMorph = null; this.toast = result.text; this.render(); break; }
      case "develop-youth": { const result = this.simulation.developYouth(); this.toast = result.text; this.render(); break; }
      case "promote-youth": { const result = this.simulation.promoteYouth(target.dataset.youth ?? ""); this.toast = result.text; this.render(); break; }
      case "set-market-preference": { const result = this.simulation.setMarketPreferredPosition(target.dataset.marketPosition as Player["position"]); this.toast = result.text; this.render(); break; }
      case "clear-market-preferences": { const result = this.simulation.clearMarketPreferredPositions(); this.toast = result.text; this.render(); break; }
      case "dismiss-market-update": { this.simulation.dismissMarketUpdateNotice(); this.toast = "新着候補の通知を確認しました。"; this.render(); break; }
      case "select-market-candidate": {
        const result = this.simulation.selectMarketCandidate(target.dataset.marketCandidate ?? "");
        this.toast = result.text;
        this.page = "market";
        this.render();
        break;
      }
      case "negotiate-recruit": { const result = this.simulation.negotiateRecruit(); this.toast = result.text; this.render(); break; }
      case "recruit": { const result = this.simulation.signRecruit(); this.toast = result.text; this.render(); break; }
      case "respond-sale": { const result = this.simulation.respondToSaleOffer(target.dataset.saleOffer ?? "", target.dataset.saleDecision === "accept"); this.toast = result.text; this.render(); break; }
      case "renew-contract": { const result = this.simulation.renewContract(target.dataset.contract ?? "", target.dataset.contractOffer as ContractOfferId); this.toast = result.text; this.render(); break; }
      case "sign-sponsor": { const result = this.simulation.signSponsor(target.dataset.sponsor ?? ""); this.toast = result.text; this.render(); break; }
      case "upgrade-concession": { const result = this.simulation.upgradeConcession(); this.toast = result.text; this.render(); break; }
      case "upgrade-scout": { const result = this.simulation.upgradeScoutNetwork(); this.toast = result.text; this.render(); break; }
      case "upgrade-training": { const result = this.simulation.upgradeTrainingFacility(); this.toast = result.text; this.render(); break; }
      case "save": this.toast = "クラブデータをこのブラウザに保存しました。"; this.render(); break;
      case "save-club-name": {
        const input = this.root.querySelector<HTMLInputElement>("[data-club-name-input]");
        const result = this.simulation.setClubName(input?.value ?? "");
        this.toast = result.text;
        this.render();
        break;
      }
      case "reset-game": {
        if (!window.confirm("テストプレイ用にゲームを初期状態へ戻します。現在の進行状況は失われます。実行しますか？")) break;
        this.stopLiveCommentary();
        this.stopGoalCelebration();
        this.simulation.resetGame();
        this.page = "home";
        this.modal = false;
        this.matchStage = "fulltime";
        this.resetHalfTimeControls();
        this.toast = "ゲームを初期状態へリセットしました。";
        this.render();
        break;
      }
    }
  };

  private handleMarkDragStart = (event: DragEvent) => {
    const source = (event.target as HTMLElement).closest<HTMLElement>("[data-mark-source]");
    const playerId = source?.dataset.markSource;
    if (!source || !playerId) return;
    this.draggingMarkSourceId = playerId;
    this.manualMarkSourceId = playerId;
    source.classList.add("is-mark-dragging");
    this.root.classList.add("is-mark-dragging");
    event.dataTransfer?.setData("text/plain", playerId);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
  };

  private handleMarkDragOver = (event: DragEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-opponent-player]");
    if (!target || !this.draggingMarkSourceId) return;
    event.preventDefault();
    target.classList.add("is-mark-drop-target");
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
  };

  private handleMarkDrop = (event: DragEvent) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-opponent-player]");
    const playerId = event.dataTransfer?.getData("text/plain") || this.draggingMarkSourceId;
    if (!target || !playerId) return;
    event.preventDefault();
    const result = this.simulation.setManualMarkAssignment(target.dataset.opponentPlayer ?? "", playerId);
    this.draggingMarkSourceId = null;
    this.manualMarkSourceId = null;
    this.root.classList.remove("is-mark-dragging");
    this.toast = result.text;
    this.render();
  };

  private handleMarkDragEnd = () => {
    this.draggingMarkSourceId = null;
    this.root.classList.remove("is-mark-dragging");
    this.root.querySelectorAll(".is-mark-dragging, .is-mark-drop-target").forEach((item) => item.classList.remove("is-mark-dragging", "is-mark-drop-target"));
  };

  private openMatch() {
    this.unlockCrowdAudio();
    this.simulation.advanceWeek();
    this.modal = true;
    this.matchStage = "halftime";
    this.resetHalfTimeControls();
    this.startLiveCommentary("first-half");
  }

  private resetHalfTimeControls() {
    this.halfTimeMentality = null;
    this.halfTimeStyle = null;
    this.halfTimePendingOut = null;
    this.halfTimeChanges = [];
  }

  private commentaryItems(result: NonNullable<ReturnType<ClubSimulation["advanceWeek"]>>, phase: "first-half" | "second-half") {
    return result.highlights.filter((item) => phase === "first-half" ? item.minute <= 45 : item.minute > 45 && item.kind !== "fulltime");
  }

  private displayedMatchScore(result: NonNullable<ReturnType<ClubSimulation["advanceWeek"]>>) {
    if (this.commentaryPhase) {
      const base = this.commentaryPhase === "second-half" ? result.halfTime : { playerGoals: 0, opponentGoals: 0 };
      const revealed = this.commentaryItems(result, this.commentaryPhase).slice(0, this.commentaryVisibleCount);
      return {
        playerGoals: base.playerGoals + revealed.filter((item) => item.kind === "goal" && item.team === "orbit").length,
        opponentGoals: base.opponentGoals + revealed.filter((item) => item.kind === "goal" && item.team === "opponent").length,
      };
    }
    if (this.matchStage === "halftime") return { playerGoals: result.halfTime.playerGoals, opponentGoals: result.halfTime.opponentGoals };
    return { playerGoals: result.playerGoals, opponentGoals: result.opponentGoals };
  }

  private stopLiveCommentary() {
    if (this.commentaryTimer !== null) window.clearInterval(this.commentaryTimer);
    this.commentaryTimer = null;
  }

  private finishLiveCommentary() {
    this.stopLiveCommentary();
    this.commentaryPhase = null;
    this.commentaryVisibleCount = 0;
  }

  private unlockCrowdAudio() {
    try {
      this.crowdAudio ??= new AudioContext();
      if (this.crowdAudio.state === "suspended") void this.crowdAudio.resume();
    } catch { /* Audio remains unavailable until browser policy allows playback. */ }
  }

  private playGoalCrowd() {
    const context = this.crowdAudio;
    if (!context || context.state !== "running") return;
    const now = context.currentTime;
    const output = context.createGain();
    output.gain.setValueAtTime(0.0001, now);
    output.gain.exponentialRampToValueAtTime(0.095, now + 0.05);
    output.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    output.connect(context.destination);
    const crowd = context.createBuffer(1, Math.floor(context.sampleRate * 0.88), context.sampleRate);
    const samples = crowd.getChannelData(0);
    for (let index = 0; index < samples.length; index += 1) samples[index] = (Math.random() * 2 - 1) * (1 - index / samples.length);
    const crowdSource = context.createBufferSource();
    const lowPass = context.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.setValueAtTime(1750, now);
    crowdSource.buffer = crowd;
    crowdSource.connect(lowPass).connect(output);
    crowdSource.start(now);
    const sting = context.createOscillator();
    const stingGain = context.createGain();
    sting.type = "sawtooth";
    sting.frequency.setValueAtTime(392, now);
    sting.frequency.exponentialRampToValueAtTime(784, now + 0.22);
    stingGain.gain.setValueAtTime(0.0001, now);
    stingGain.gain.exponentialRampToValueAtTime(0.032, now + 0.03);
    stingGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
    sting.connect(stingGain).connect(context.destination);
    sting.start(now);
    sting.stop(now + 0.48);
  }

  private stopGoalCelebration() {
    if (this.goalCelebrationTimer !== null) window.clearTimeout(this.goalCelebrationTimer);
    this.goalCelebrationTimer = null;
    this.goalCelebration = null;
  }

  private triggerGoalCelebration(item: MatchHighlight) {
    this.stopGoalCelebration();
    this.goalCelebration = item;
    this.playGoalCrowd();
    this.goalCelebrationTimer = window.setTimeout(() => {
      this.goalCelebration = null;
      this.goalCelebrationTimer = null;
      this.render();
    }, 880);
  }

  private revealCommentaryItem(item: MatchHighlight) {
    this.commentaryVisibleCount += 1;
    if (item.kind === "goal") this.triggerGoalCelebration(item);
    this.render();
  }

  private startLiveCommentary(phase: "first-half" | "second-half") {
    const result = this.simulation.lastResult;
    if (!result) return;
    const items = this.commentaryItems(result, phase);
    this.stopLiveCommentary();
    this.stopGoalCelebration();
    if (!items.length) { this.finishLiveCommentary(); this.render(); return; }
    this.commentaryPhase = phase;
    this.commentaryVisibleCount = 0;
    this.revealCommentaryItem(items[0]);
    this.commentaryTimer = window.setInterval(() => {
      if (this.commentaryPhase !== phase) return;
      if (this.commentaryVisibleCount < items.length) {
        this.revealCommentaryItem(items[this.commentaryVisibleCount]);
        return;
      }
      this.finishLiveCommentary();
      this.render();
    }, 2000);
  }

  private captureScrollPosition() {
    const main = this.root.querySelector<HTMLElement>(".game-main");
    const modal = this.root.querySelector<HTMLElement>(".match-modal");
    const navigation = this.root.querySelector<HTMLElement>(".club-nav");
    const playerDetail = this.root.querySelector<HTMLElement>(".player-detail-panel");
    return {
      mainTop: main?.scrollTop ?? 0,
      mainLeft: main?.scrollLeft ?? 0,
      modalTop: modal?.scrollTop ?? 0,
      modalLeft: modal?.scrollLeft ?? 0,
      navigationLeft: navigation?.scrollLeft ?? 0,
      playerDetailTop: playerDetail?.scrollTop ?? 0,
      playerDetailLeft: playerDetail?.scrollLeft ?? 0,
      windowTop: window.scrollY,
      windowLeft: window.scrollX,
    };
  }

  private restoreScrollPosition(position: ReturnType<GameUI["captureScrollPosition"]>) {
    const restore = () => {
      const main = this.root.querySelector<HTMLElement>(".game-main");
      const modal = this.root.querySelector<HTMLElement>(".match-modal");
      const navigation = this.root.querySelector<HTMLElement>(".club-nav");
      const playerDetail = this.root.querySelector<HTMLElement>(".player-detail-panel");
      if (main) { main.scrollTop = position.mainTop; main.scrollLeft = position.mainLeft; }
      if (modal) { modal.scrollTop = position.modalTop; modal.scrollLeft = position.modalLeft; }
      if (navigation) navigation.scrollLeft = position.navigationLeft;
      if (playerDetail) { playerDetail.scrollTop = position.playerDetailTop; playerDetail.scrollLeft = position.playerDetailLeft; }
      window.scrollTo(position.windowLeft, position.windowTop);
    };
    restore();
    window.requestAnimationFrame(restore);
  }

  private restoreLiveHighlightScroll() {
    this.root.querySelectorAll<HTMLElement>(".highlight-timeline.is-live").forEach((feed) => {
      feed.scrollTop = feed.scrollHeight;
    });
  }

  private render() {
    const scrollPosition = this.captureScrollPosition();
    const score = this.simulation.score();
    const selected = this.simulation.selectedPlayer;
    const contractAlertCount = this.simulation.contractAlerts.length;
    this.root.innerHTML = `
      <div class="ambient-grain"></div>
      <header class="club-header">
        <div class="club-brand"><img src="${assets.clubMark}" alt="" /><div><span>TOUCHLINE</span><strong>${escapeHtml(this.simulation.clubNameValue)}</strong></div></div>
        <div class="header-score"><span>第 ${this.simulation.currentWeek} 節</span><b>${this.simulation.teamPosition} 位</b></div>
        <div class="header-metrics"><span class="money-metric"><i>💰</i><em class="money-full">${formatMoney(this.simulation.currentMoney)}</em><em class="money-short">${Math.round(this.simulation.currentMoney / 10000).toLocaleString()}万</em></span><span>✦ ${this.simulation.currentFame}</span><span class="fan-header">♬ ${this.simulation.fanPopularity}%</span>${contractAlertCount ? `<button data-nav="team" class="header-contract-alert">契約 ${contractAlertCount}名</button>` : ""}<button data-action="save" class="icon-button" aria-label="セーブ">⌘</button></div>
        <button class="mobile-nav-toggle" data-mobile-nav aria-label="${this.mobileNavOpen ? "メニューを閉じる" : "メニューを開く"}" aria-expanded="${this.mobileNavOpen}"><i>${this.mobileNavOpen ? "×" : "☰"}</i><span>MENU</span></button>
      </header>
      <aside class="club-nav ${this.mobileNavOpen ? "is-open" : ""}">
        <div class="nav-label">CLUBHOUSE</div>
        ${navItems.map((item) => `<button data-nav="${item.id}" class="nav-item ${this.page === item.id ? "is-active" : ""}"><i>${item.icon}</i><span>${item.label}</span></button>`).join("")}
        <div class="nav-divider"></div>
        <div class="nav-note"><span>SEASON</span><strong>${this.simulation.seasonProgress}%</strong><div><b style="width:${this.simulation.seasonProgress}%"></b></div><small>${this.simulation.completedWeeks}/19 MATCHWEEKS</small></div>
      </aside>
      <nav class="mobile-dock" aria-label="主要メニュー">${mobileDockItems.map((item) => `<button data-nav="${item.id}" class="${this.page === item.id ? "is-active" : ""}"><i>${item.icon}</i><span>${item.label}</span></button>`).join("")}<button data-mobile-nav class="${this.mobileNavOpen ? "is-active" : ""}"><i>⋯</i><span>その他</span></button></nav>
      <main class="game-main">
        ${this.renderPage(score, selected)}
      </main>
      ${this.toast ? `<div class="toast-note"><span>✓</span>${this.toast}</div>` : ""}
      ${this.modal ? this.matchModal() : ""}
      ${this.opponentScoutOpen ? this.opponentScoutModal() : ""}
      ${this.opponentScoutOpen && this.opponentPlayerDetailId ? this.opponentPlayerPopup() : ""}
      ${this.playerDetailPanel()}
      ${this.goalCelebration ? `<div class="goal-celebration ${this.goalCelebration.team}" role="status" aria-live="assertive"><div><span>GOAL / ${String(this.goalCelebration.minute).padStart(2, "0")}′</span><strong>${this.goalCelebration.team === "orbit" ? "ORBIT GOAL" : "OPPONENT GOAL"}</strong><p>${this.goalCelebration.scorer ? `${this.goalCelebration.scorer} がネットを揺らした` : "スタジアムを揺らすゴール！"}</p></div></div>` : ""}
    `;
    this.decorateManualMarkControls();
    this.decorateOpponentMarkings();
    this.decorateMarkingMatchImpact();
    this.decoratePlayerSkills();
    this.decorateOpponentSkills();
    this.decorateMatchSkillSummary();
    this.decorateYouthScoutQuality();
    this.decorateScoutStaffDeployment();
    this.restoreScrollPosition(scrollPosition);
    this.restoreLiveHighlightScroll();
    this.animateRoleRadar();
  }

  private renderPage(score: ReturnType<ClubSimulation["score"]>, selected: Player | null) {
    switch (this.page) {
      case "lineup": return this.lineupPage(score, selected);
      case "team": return this.teamPage();
      case "stats": return this.seasonStatsPage();
      case "league": return this.leaguePage();
      case "cup": return this.cupPage();
      case "training": return this.trainingPage(score);
      case "market": return this.marketPage();
      case "academy": return this.academyPage();
      case "sponsors": return this.sponsorPage();
      case "facilities": return this.facilitiesPage();
      case "finance": return this.financePage();
      case "settings": return this.settingsPage();
      default: return this.homePage(score);
    }
  }

  private pageHeading(kicker: string, title: string, copy: string) {
    return `<section class="page-heading"><div><p>${kicker}</p><h1>${title}</h1><span>${copy}</span></div><button class="advance-button" data-action="advance"><span>次節へ</span><b>▶</b></button></section>`;
  }

  private opponentDossier() {
    const opponent = this.simulation.currentOpponentTactics;
    const matchup = this.simulation.currentTacticalMatchup;
    return `<section class="opponent-dossier tactical-card" style="--opponent:${opponent.color}"><div class="opponent-dossier-head"><div><span class="card-kicker">OPPONENT DOSSIER</span><h3>${opponent.club}</h3><p>${opponent.note}</p></div><div class="opponent-power"><span>TACTICAL RATING</span><b>${opponent.total}</b><small>攻 ${opponent.attack} / 守 ${opponent.defense}</small></div></div><div class="opponent-plan-grid"><div><span>FORMATION</span><b>${opponent.formationLabel}</b><small>${opponent.trait}</small></div><div><span>MENTALITY</span><b>${opponent.mentalityLabel}</b><small>連携 ${opponent.cohesion}%</small></div><div><span>PLAYING STYLE</span><b>${opponent.playingStyleLabel}</b><small>${opponent.roles.slice(0, 3).join(" / ")}</small></div><div class="matchup-readout"><span>MATCH-UP / ${matchup.label}</span><b>自 攻 ${signed(matchup.playerAttackModifier)} / 守 ${signed(matchup.playerDefenseModifier)}</b><small>${matchup.note}</small></div></div><div class="opponent-xi"><span>OPPOSITION XI</span><div>${opponent.lineup.map((player) => `<i><b>${positionLabel(player.position)}</b>${player.name}<small>${player.role}</small></i>`).join("")}</div></div><button data-action="open-opponent-scout" class="opponent-scout-trigger">布陣と要注意選手を確認 <b>↗</b></button></section>`;
  }

  private opponentScoutModal() {
    const opponent = this.simulation.currentOpponentTactics;
    const matchup = this.simulation.currentTacticalMatchup;
    const formation = formations.find((item) => item.id === opponent.formationId) ?? formations[1];
    const threatScore = (player: typeof opponent.lineup[number]) => Math.round(player.position === "GK" ? (player.gk ?? player.defense) * .62 + player.pass * .2 - 8 : player.attack * .56 + player.pass * .22 + player.defense * .14 + (['CF', 'WG', 'AM'].includes(player.position) ? 7 : player.position === "CM" || player.position === "DM" ? 3 : 0));
    const keyPlayers = [...opponent.lineup].sort((a, b) => threatScore(b) - threatScore(a)).slice(0, 3);
    const playerForSlot = (slotId: string) => opponent.lineup.find((player) => player.id.endsWith(`-${slotId}`));
    return `<div class="opponent-scout-overlay" role="dialog" aria-modal="true" aria-label="${opponent.club}の対戦前スカウト報告"><section class="opponent-scout-modal" style="--opponent:${opponent.color}"><button data-action="close-opponent-scout" class="opponent-scout-close" aria-label="スカウト報告を閉じる">×</button><header><span>PRE-MATCH SCOUT / WEEK ${this.simulation.currentWeek}</span><h2>${opponent.club}<small>${opponent.trait}</small></h2><p>${opponent.note}</p></header><div class="opponent-scout-summary"><div><span>FORMATION</span><b>${opponent.formationLabel}</b><small>${formation.description}</small></div><div><span>GAME PLAN</span><b>${opponent.mentalityLabel} / ${opponent.playingStyleLabel}</b><small>連携 ${opponent.cohesion}%</small></div><div class="scout-matchup"><span>MATCH-UP</span><b>${matchup.label}</b><small>自 攻 ${signed(matchup.playerAttackModifier)} / 守 ${signed(matchup.playerDefenseModifier)}</small></div></div><div class="opponent-scout-content"><section class="opponent-formation-panel"><div class="scout-panel-head"><span>OPPOSITION SHAPE</span><b>${formation.label}</b></div><div class="opponent-mini-pitch">${formation.slots.map((slot) => { const player = playerForSlot(slot.id); const isKey = player && keyPlayers.some((item) => item.id === player.id); return `<button type="button" data-opponent-player="${player?.id ?? ""}" class="opponent-token ${isKey ? "is-key" : ""}" style="left:${slot.x}%;top:${slot.y}%" aria-label="${player ? `${player.name}の詳細を表示` : "未配置"}" ${player ? "" : "disabled"}><i>${positionLabel(slot.label)}</i><b>${player?.name ?? "—"}</b><small>${player?.role ?? ""}</small></button>`; }).join("")}<span class="pitch-axis axis-top">ATTACK</span><span class="pitch-axis axis-bottom">${opponent.club}</span></div></section><aside class="opponent-key-panel"><div class="scout-panel-head"><span>WATCH LIST</span><b>要注意選手</b></div><p>能力・役割・配置から、試合を動かしやすい3名を抽出。</p>${keyPlayers.map((player, index) => `<button type="button" data-opponent-player="${player.id}" class="danger-player" aria-label="${player.name}の詳細を表示"><div><span>DANGER ${String(index + 1).padStart(2, "0")}</span><h3>${player.name}</h3><small>${positionLabel(player.position)} / ${player.role}</small></div><b>${threatScore(player)}</b><footer><span>攻 ${player.attack}</span><span>守 ${player.defense}</span><span>パス ${player.pass}</span></footer></button>`).join("")}</aside></div><footer class="opponent-scout-footer"><div><span>SCOUT NOTE</span><p>${matchup.note}</p></div><button data-action="close-opponent-scout" class="primary-action">報告を閉じる <b>→</b></button></footer></section></div>`;
  }

  private opponentPlayerPopup() {
    const opponent = this.simulation.currentOpponentTactics;
    const player = opponent.lineup.find((item) => item.id === this.opponentPlayerDetailId);
    if (!player) return "";
    const values = player.position === "GK" ? [["GK", player.gk ?? player.defense], ["パス", player.pass], ["守備", player.defense], ["攻撃", player.attack]] : [["攻撃", player.attack], ["守備", player.defense], ["パス", player.pass], ["シュート", Math.round(player.attack * .76 + player.pass * .24)]];
    const max = [...values].sort((a, b) => Number(b[1]) - Number(a[1]))[0];
    const min = [...values].sort((a, b) => Number(a[1]) - Number(b[1]))[0];
    const profile = player.position === "GK" ? "最後尾からパスを散らす役割。ビルドアップを急がせると精度が落ちる。" : ["CF", "WG", "AM"].includes(player.position) ? "前線で局面を変える役割。背後のスペースを与えず、中央への進入を制限したい。" : ["CB", "SB"].includes(player.position) ? "守備の基準点となる役割。前進を急がせ、パスコースを限定すると崩しやすい。" : "中盤の接続役。前を向かせず、受ける直前に圧力をかけることが重要。";
    return `<div class="opponent-player-popup" role="dialog" aria-modal="true" aria-label="${player.name}のスカウト詳細"><section style="--opponent:${opponent.color}"><button data-action="close-opponent-player" class="opponent-player-close" aria-label="選手詳細を閉じる">×</button><span>PLAYER SCOUT CARD / ${opponent.club}</span><header><div class="opponent-player-badge">${player.position}</div><div><h3>${player.name}</h3><p>${player.position} / ${player.role}</p></div></header><div class="opponent-player-ability">${values.map(([label, value]) => `<div><span>${label}</span><b>${value}</b><i><em style="width:${value}%"></em></i></div>`).join("")}</div><section class="opponent-player-trait"><span>SCOUTING NOTE</span><h4>強み：${max[0]} ${max[1]}　/　注意：${min[0]} ${min[1]}</h4><p>${profile}</p></section><button data-action="close-opponent-player" class="primary-action">ピッチへ戻る <b>→</b></button></section></div>`;
  }

  private markingForOpponent(opponentPlayer: OpponentPlayer, opponentSlot: Slot): MarkingAssessment | null {
    const candidates = this.simulation.formation.slots.map((slot) => ({ player: this.simulation.playerForSlot(slot.id), slot })).filter((item): item is { player: Player; slot: Slot } => Boolean(item.player));
    if (!candidates.length) return null;
    const manualPlayerId = this.simulation.currentManualMarkAssignments[opponentPlayer.id];
    const manualPairing = manualPlayerId ? candidates.find((candidate) => candidate.player.id === manualPlayerId) : undefined;
    const pairing = manualPairing ?? [...candidates].sort((a, b) => ((a.slot.x - opponentSlot.x) ** 2 + (a.slot.y - opponentSlot.y) ** 2) - ((b.slot.x - opponentSlot.x) ** 2 + (b.slot.y - opponentSlot.y) ** 2))[0];
    const defender = Math.round(pairing.player.defense * .34 + pairing.player.tackle * .36 + pairing.player.interception * .3);
    const attacker = Math.round(opponentPlayer.attack * .5 + opponentPlayer.pass * .3 + (opponentPlayer.role.includes("裏抜け") || opponentPlayer.role.includes("シャドー") ? 4 : opponentPlayer.role.includes("ターゲット") ? 2 : 0));
    const distance = Math.hypot(pairing.slot.x - opponentSlot.x, pairing.slot.y - opponentSlot.y);
    const differential = Math.round(defender - attacker - Math.max(0, distance - 14) * .16);
    const tone: MarkTone = differential >= 5 ? "advantage" : differential <= -5 ? "caution" : "even";
    const label = tone === "advantage" ? "有利" : tone === "caution" ? "警戒" : "拮抗";
    const reason = tone === "advantage" ? `${pairing.player.name}の守備・奪取力が上回る。` : tone === "caution" ? `${opponentPlayer.role}の前進力に注意。カバーを早めたい。` : `能力差は小さい。受ける前の圧力で主導権を取る。`;
    return { player: pairing.player, tone, label, differential, reason, manual: Boolean(manualPairing) };
  }

  private decorateManualMarkControls() {
    if (!this.opponentScoutOpen || this.root.querySelector(".manual-mark-console")) return;
    const content = this.root.querySelector(".opponent-scout-content");
    if (!content) return;
    const manualAssignments = this.simulation.currentManualMarkAssignments;
    const starters = this.simulation.formation.slots.map((slot) => ({ slot, player: this.simulation.playerForSlot(slot.id) })).filter((item): item is { slot: Slot; player: Player } => Boolean(item.player));
    const assignedPlayerIds = new Set(Object.values(manualAssignments));
    content.insertAdjacentHTML("beforebegin", `<section class="manual-mark-console"><header><div><span>MANUAL MARKING</span><b>担当を手動指定</b></div><div><i>${Object.keys(manualAssignments).length} / ${starters.length} 指定</i><button type="button" data-mark-clear ${Object.keys(manualAssignments).length ? "" : "disabled"}>自動へ戻す</button></div></header><p>自クラブの選手札を<strong>相手のピッチ上の選手へドラッグ</strong>してください。スマホでは、選手札をタップしてから相手をタップします。</p><div class="manual-mark-sources">${starters.map(({ slot, player }) => `<button type="button" draggable="true" data-mark-source="${player.id}" class="manual-mark-source ${this.manualMarkSourceId === player.id ? "is-selected" : ""} ${assignedPlayerIds.has(player.id) ? "is-assigned" : ""}" aria-pressed="${this.manualMarkSourceId === player.id}" aria-label="${player.name}をマーク担当に選択、またはドラッグ"><i>${positionLabel(slot.label)}</i><b>${player.name}</b><small>${assignedPlayerIds.has(player.id) ? "担当済" : "ドラッグ"}</small></button>`).join("")}</div></section>`);
  }

  private decorateOpponentMarkings() {
    if (!this.opponentScoutOpen) return;
    const opponent = this.simulation.currentOpponentTactics;
    const formation = formations.find((item) => item.id === opponent.formationId);
    if (!formation) return;
    const assessmentFor = (id: string) => {
      const player = opponent.lineup.find((item) => item.id === id);
      const slot = formation.slots.find((item) => player?.id.endsWith(`-${item.id}`));
      return player && slot ? this.markingForOpponent(player, slot) : null;
    };
    this.root.querySelectorAll<HTMLButtonElement>(".opponent-token[data-opponent-player]").forEach((token) => {
      const assessment = assessmentFor(token.dataset.opponentPlayer ?? "");
      if (!assessment) return;
      token.classList.add(`mark-${assessment.tone}`);
      if (assessment.manual) token.classList.add("has-manual-mark");
      token.dataset.mark = `${assessment.player.name} / ${assessment.manual ? "手動・" : ""}${assessment.label}`;
      token.insertAdjacentHTML("beforeend", `<em class="mark-player-label ${assessment.tone} ${assessment.manual ? "manual" : ""}">自 ${assessment.player.name} / ${assessment.manual ? "手動・" : ""}${assessment.label}</em>`);
      token.setAttribute("aria-label", `${token.getAttribute("aria-label") ?? "相手選手"}。${assessment.player.name}との${assessment.manual ? "手動" : "自動"}マーク相性は${assessment.label}。${assessment.reason}`);
    });
    const pitchHead = this.root.querySelector(".opponent-formation-panel .scout-panel-head");
    if (pitchHead) pitchHead.insertAdjacentHTML("afterend", `<div class="marking-legend"><span><i class="advantage"></i>有利</span><span><i class="even"></i>拮抗</span><span><i class="caution"></i>警戒</span><b>自クラブの近接担当との対人目安</b></div>`);
    const selected = this.opponentPlayerDetailId ? assessmentFor(this.opponentPlayerDetailId) : null;
    const trait = this.root.querySelector(".opponent-player-trait");
    if (selected && trait) trait.insertAdjacentHTML("beforebegin", `<aside class="marking-detail ${selected.tone}"><span>MARKING MATCH-UP / ${selected.manual ? "手動指定・" : ""}${selected.label}</span><b>${selected.player.name} <i>vs</i> 相手選手</b><small>対人差 ${signed(selected.differential)}　${selected.reason}</small></aside>`);
  }

  private decorateMarkingMatchImpact() {
    const result = this.simulation.lastResult;
    const gamePlan = this.root.querySelector(".match-tactics p");
    if (!result || !gamePlan) return;
    const impact = result.markingImpact;
    const tone = impact.grade === "対人優位" ? "advantage" : impact.grade === "対人警戒" ? "caution" : "even";
    const impactLine = `<strong class="marking-impact-line ${tone}">${impact.summary}</strong><small class="marking-impact-reason">${impact.reason}</small>`;
    gamePlan.insertAdjacentHTML("beforeend", `<br/>${impactLine}`);
    const duelIntro = this.root.querySelector(".mark-duel-report > p");
    if (duelIntro) duelIntro.insertAdjacentHTML("afterbegin", `<b class="marking-impact-report ${tone}">SIM EFFECT　攻 ${signed(impact.attackModifier)} / 守 ${signed(impact.defenseModifier)}</b>`);
  }

  private decoratePlayerSkills() {
    const player = this.playerDetailId ? this.simulation.rosterPlayers.find((item) => item.id === this.playerDetailId) : null;
    const ability = this.root.querySelector<HTMLElement>(".player-detail-panel .detail-ability");
    if (!player || !ability || this.root.querySelector(".player-skill-panel")) return;
    const skills = this.simulation.playerSkillStatus(player);
    const progress = this.simulation.skillProgressFor(player);
    const progressFor = (skillId: string) => progress.find((item) => item.skillId === skillId);
    const candidates = progress.filter((item) => !item.learned);
    const panel = `<section class="player-skill-panel"><div class="player-skill-head"><span>PLAYER SKILLS</span><b>${skills.filter((skill) => skill.active).length} / ${skills.length} ACTIVE</b></div>${skills.map((skill) => { const mastery = progressFor(skill.skillId); return `<article class="${skill.active ? "is-active" : ""}"><header><span>${skill.short}</span><h3>${skill.label}</h3><b>${skill.active ? "発動中" : "待機"}</b></header><p>${skill.description}</p><small>${skill.reason}</small><em>${skill.active ? `SIM EFFECT　攻 ${signed(skill.attackBoost)} / 守 ${signed(skill.defenseBoost)}` : `FOCUS ${skill.focusValue} / 基準 ${skill.minimum}`}</em>${mastery ? `<div class="skill-mastery-readout"><span>MASTERY / ${mastery.levelLabel} Lv.${mastery.level}</span><b>${mastery.xp}${mastery.nextXp !== null ? ` / ${mastery.nextXp} XP` : " / MAX"}</b><i><em style="width:${mastery.progress}%"></em></i><small>${mastery.reason}</small></div>` : ""}</article>`; }).join("")}${candidates.length ? `<section class="skill-learning-candidates"><div><span>SKILL LAB / UNLOCK</span><b>習得候補</b></div>${candidates.map((candidate) => `<button type="button" data-action="set-skill-training-target" data-skill-player="${player.id}" data-skill-target="${candidate.skillId}" class="${candidate.target ? "is-target" : ""}"><span>${candidate.short}</span><strong>${candidate.label}<small>${candidate.reason}</small></strong><b>${candidate.xp} / 100 XP</b></button>`).join("")}</section>` : ""}</section>`;
    ability.insertAdjacentHTML("afterend", panel);
  }

  private decorateOpponentSkills() {
    if (!this.opponentScoutOpen) return;
    const opponent = this.simulation.currentOpponentTactics;
    this.root.querySelectorAll<HTMLElement>("[data-opponent-player]").forEach((element) => {
      if (element.querySelector(".opponent-skill-chip")) return;
      const skill = opponent.skillDetails.find((item) => item.playerId === element.dataset.opponentPlayer);
      if (skill) element.insertAdjacentHTML("beforeend", `<em class="opponent-skill-chip ${skill.active ? "is-active" : ""}">${skill.short}${skill.active ? " 発動" : ""}</em>`);
    });
    const trait = this.root.querySelector<HTMLElement>(".opponent-player-popup .opponent-player-trait");
    const selectedSkill = opponent.skillDetails.find((item) => item.playerId === this.opponentPlayerDetailId);
    if (trait && selectedSkill && !trait.querySelector(".opponent-skill-readout")) trait.insertAdjacentHTML("beforeend", `<div class="opponent-skill-readout ${selectedSkill.active ? "is-active" : ""}"><span>PLAYER SKILL / ${selectedSkill.active ? "ACTIVE" : "STANDBY"}</span><b>${selectedSkill.label}</b><small>${selectedSkill.description}</small><em>${selectedSkill.reason}</em></div>`);
  }

  private decorateMatchSkillSummary() {
    const result = this.simulation.lastResult;
    const plan = this.root.querySelector<HTMLElement>(".match-tactics p");
    if (!result || !plan || plan.querySelector(".match-skill-summary")) return;
    const growth = result.skillXpGrants.length ? `SKILL XP +${result.skillXpGrants.reduce((sum, grant) => sum + grant.xp, 0)} / ${result.skillXpGrants.filter((grant) => grant.learned).map((grant) => `${grant.player} ${grant.label}習得`).join("・") || "集中育成の経験を蓄積"}` : "SKILL XP は次の試合から記録されます。";
    const condition = result.matchCondition;
    const after = result.conditionAfter;
    plan.insertAdjacentHTML("beforeend", `<br/><strong class="match-condition-summary ${condition.isHome ? "home" : "away"}">${condition.isHome ? "HOME EDGE" : "AWAY PRESSURE"}　攻 ${signed(condition.homeAttack - condition.opponentHomeAttack)} / 守 ${signed(condition.homeDefense - condition.opponentHomeDefense)}</strong><br/><small>${condition.summary}</small><br/><small class="match-condition-after">POST MATCH　MORALE ${after.morale} ${after.moraleLabel} / FORM ${signed(after.momentum)} ${after.momentumLabel}</small><br/><strong class="match-skill-summary">SKILL LINK-UP　攻 ${signed(result.tactics.skillAttack)} / 守 ${signed(result.tactics.skillDefense)}</strong><br/><small>${result.tactics.skillSummary}</small><br/><strong class="match-skill-summary opponent">OPPOSITION SKILLS　攻 ${signed(result.opponentTactics.skillAttack)} / 守 ${signed(result.opponentTactics.skillDefense)}</strong><br/><small class="match-skill-growth">${growth}</small>`);
  }

  private decorateYouthScoutQuality() {
    const forecast = this.simulation.youthScoutQualityForecast;
    if (this.page === "facilities") {
      const scoutCommand = this.root.querySelector<HTMLElement>(".scout-command");
      if (scoutCommand && !this.root.querySelector(".facility-youth-scout-brief")) {
        const current = forecast.current;
        const next = forecast.next;
        scoutCommand.insertAdjacentHTML("afterend", `<section class="facility-youth-scout-brief tactical-card"><div><span>YOUTH ACQUISITION EFFECT</span><h3>${current.youthQuality}</h3><p>${current.youthQualityNote}</p></div><div class="facility-youth-scout-stats"><span><i>INITIAL XP</i><b>+${current.youthInitialXpBonus}</b><small>加入時</small></span><span><i>SESSION XP</i><b>+${current.youthSessionXpBonus}</b><small>ユース育成</small></span><span><i>PACE STEP</i><b>+${current.youthPaceStep}</b><small>成長段階</small></span></div><aside>${next ? `<span>NEXT / ${next.youthQuality}</span><b>初期XP +${next.youthInitialXpBonus}・セッション +${next.youthSessionXpBonus}</b><small>次の拡張で、ユース候補のスキル品質を引き上げます。</small>` : `<span>MAX NETWORK</span><b>選抜ユースを継続発掘中</b><small>初期スキル品質と成長ペースは最高段階です。</small>`}</aside></section>`);
      }
      return;
    }
    if (this.page !== "academy") return;
    const command = this.root.querySelector<HTMLElement>(".academy-command");
    if (command && !this.root.querySelector(".academy-scout-quality")) {
      const current = forecast.current;
      const next = forecast.next;
      command.insertAdjacentHTML("afterend", `<section class="academy-scout-quality tactical-card"><div class="academy-scout-quality-head"><div><span>SCOUTING → YOUTH QUALITY</span><h3>${current.youthQuality}</h3><p>${current.youthQualityNote}</p></div><b>Lv.${current.level}<small>${current.name}</small></b></div><div class="academy-scout-quality-stats"><span><i>ENTRY XP</i><b>+${current.youthInitialXpBonus}</b><small>加入時</small></span><span><i>SESSION XP</i><b>+${current.youthSessionXpBonus}</b><small>毎セッション</small></span><span><i>PACE</i><b>+${current.youthPaceStep}</b><small>成長段階</small></span></div>${next ? `<div class="academy-scout-next"><span>NEXT NETWORK / Lv.${next.level}</span><b>${next.youthQuality}</b><small>初期XP +${next.youthInitialXpBonus} / セッション +${next.youthSessionXpBonus} / 成長段階 +${next.youthPaceStep}　${next.note}</small><button type="button" data-nav="facilities">スカウト網を確認 <b>→</b></button></div>` : `<div class="academy-scout-next is-max"><span>MAX NETWORK</span><b>分析選抜を運用中</b><small>ユースの初期スキル品質と成長ペースは最高段階です。</small></div>`}</section>`);
    }
    const blueprints = Array.from(this.root.querySelectorAll<HTMLElement>(".academy-skill-blueprint"));
    this.simulation.youthAcademyPlayers.forEach((player, index) => {
      const blueprint = blueprints[index];
      if (!blueprint || blueprint.querySelector(".academy-scout-stamp")) return;
      const quality = player.youthSkillQuality ?? forecast.current.youthQuality;
      const joinedLevel = player.youthScoutLevel ?? forecast.current.level;
      const entryXp = player.youthInitialXpBonus ?? 0;
      const sessionXp = player.youthScoutXpBonus ?? 0;
      blueprint.insertAdjacentHTML("beforeend", `<div class="academy-scout-stamp"><span>ACQUIRED / SCOUT Lv.${joinedLevel}</span><b>${quality}</b><small>加入XP +${entryXp}　育成XP +${sessionXp} / session</small></div>`);
    });
  }

  private decorateScoutStaffDeployment() {
    const deployment = this.simulation.scoutDeployment;
    const active = deployment.staff;
    const skillName = (skill: PlayerSkillId) => playerSkillCatalog[skill].label;
    const staffCards = this.simulation.scoutStaffMembers.map((staff) => `<button type="button" class="scout-staff-card ${staff.id === active.id ? "is-assigned" : ""}" data-action="assign-scout-staff" data-scout-staff="${staff.id}"><span>${staff.id === active.id ? "DEPLOYED" : "AVAILABLE"}</span><b>${staff.name}</b><em>${staff.profile}</em><small>${staff.region}</small><i>${staff.specialtyLabel}</i><strong>${skillName(staff.specialtySkill)}</strong><p>加入XP +${staff.entryXpBonus}　育成XP +${staff.sessionXpBonus}/回</p></button>`).join("");
    if (this.page === "facilities") {
      const anchor = this.root.querySelector<HTMLElement>(".facility-youth-scout-brief");
      if (anchor && !this.root.querySelector(".scout-staff-board")) anchor.insertAdjacentHTML("afterend", `<section class="scout-staff-board tactical-card"><header><div><span>SCOUT DEPLOYMENT BOARD</span><h3>担当者を配置する</h3></div><b>${deployment.tendency}<small>NEXT YOUTH INTAKE</small></b></header><p class="scout-staff-summary">${deployment.summary}</p><div class="scout-staff-roster">${staffCards}</div><footer>配置変更は<b>次に加入するユース候補</b>へ反映されます。すでにアカデミーにいる選手の取得時品質は維持されます。</footer></section>`);
      return;
    }
    if (this.page !== "academy") return;
    const quality = this.root.querySelector<HTMLElement>(".academy-scout-quality");
    if (quality && !quality.querySelector(".academy-scout-deployment")) quality.insertAdjacentHTML("beforeend", `<aside class="academy-scout-deployment"><span>ACTIVE SCOUT / NEXT INTAKE</span><b>${active.name} <i>${active.profile}</i></b><small>${active.specialtyLabel}を優先　${deployment.summary}</small><button type="button" data-nav="facilities">担当者を配置 <b>→</b></button></aside>`);
    this.root.querySelectorAll<HTMLElement>(".academy-skill-blueprint").forEach((blueprint, index) => {
      const player = this.simulation.youthAcademyPlayers[index];
      if (!player?.youthScoutStaffName || blueprint.querySelector(".academy-scout-staff-stamp")) return;
      blueprint.insertAdjacentHTML("beforeend", `<div class="academy-scout-staff-stamp"><span>SCOUT IMPACT / ${player.youthScoutStaffName}</span><b>${player.youthScoutStaffImpact}</b><small>専門加算　加入XP +${player.youthScoutStaffEntryXpBonus ?? 0} / 育成XP +${player.youthScoutStaffSessionXpBonus ?? 0} 回</small></div>`);
    });
  }

  private matchConditionBoard(condition: typeof this.simulation.nextMatchCondition) {
    const signedValue = (value: number) => `${value >= 0 ? "+" : ""}${value}`;
    const form = condition.form.length ? condition.form.slice(0, 3).map((entry) => `<i class="${entry.outcome.toLowerCase()}">${entry.outcome}</i>`).join("") : `<i class="neutral">—</i>`;
    return `<section class="match-condition-board ${condition.isHome ? "is-home" : "is-away"}"><div class="condition-board-head"><span>${condition.isHome ? "HOME EDGE" : "AWAY PRESSURE"}</span><b>${condition.isHome ? "ホームの後押し" : "アウェーの環境"}</b></div><div class="condition-metrics"><span><i>MORALE</i><b>${condition.morale}</b><small>${condition.moraleLabel}　攻${signedValue(condition.moraleAttack)}／守${signedValue(condition.moraleDefense)}</small></span><span><i>FORM</i><b>${signedValue(condition.momentum)}</b><small>${condition.momentumLabel}　攻${signedValue(condition.momentumAttack)}／守${signedValue(condition.momentumDefense)}</small></span><span><i>VENUE</i><b>攻${signedValue(condition.homeAttack - condition.opponentHomeAttack)}</b><small>守${signedValue(condition.homeDefense - condition.opponentHomeDefense)}　人気連動</small></span></div><div class="condition-form"><span>LAST 3</span>${form}</div><p>${condition.reason}</p></section>`;
  }

  private settingsPage() {
    const clubName = escapeHtml(this.simulation.clubNameValue);
    return `
      ${this.pageHeading("CLUB IDENTITY", "クラブ設定", "チームの看板を整え、戦術室の名前をあなたのクラブに合わせる。")}
      <section class="settings-layout">
        <article class="tactical-card club-name-panel">
          <div class="card-kicker">TEAM IDENTITY</div>
          <h2>チーム名を変更</h2>
          <p>ここで設定した名前は、ヘッダー、順位表、試合前のカード、実況結果、保存データへ反映されます。</p>
          <label class="club-name-field"><span>表示名</span><input data-club-name-input type="text" value="${clubName}" maxlength="24" autocomplete="off" aria-label="チーム名" /></label>
          <div class="club-name-preview"><span>CURRENT DISPLAY</span><strong>${clubName}</strong></div>
          <button data-action="save-club-name" class="primary-action">この名前で保存 <b>✓</b></button>
          <small class="settings-note">1〜24文字。前後の空白は自動で整理されます。</small>
        </article>
        <aside class="tactical-card settings-help-card"><div class="card-kicker">CLUBHOUSE NOTE</div><h3>名前は戦術の旗印</h3><p>クラブ名を変えても、選手、戦績、資金、移籍市場の進行はそのまま維持されます。</p><div class="settings-example"><span>試合結果</span><b>${clubName} 2 - 1 対戦クラブ</b></div></aside>
      </section>
    `;
  }

  private homePage(score: ReturnType<ClubSimulation["score"]>) {
    const opponent = this.simulation.currentOpponent;
    const recent = this.simulation.currentLogs;
    const nextGate = this.simulation.upcomingGateForecast;
    const nextMerchandise = this.simulation.upcomingMerchandiseForecast;
    const nextConcession = this.simulation.upcomingConcessionForecast;
    const membership = { members: this.simulation.fanClubMembers, revenue: this.simulation.weeklyFanClubFee };
    const venueCopy = nextGate.isHome ? `HOME / オービット・パーク　予想 ${nextGate.attendance.toLocaleString()} 人・入場料 ${formatMoney(nextGate.revenue)}` : "AWAY / アウェー戦のため入場料収入はありません";
    const condition = this.simulation.nextMatchCondition;
    return `
      ${this.pageHeading("DASHBOARD", "指揮官の戦術室", "全ての決断は、次の90分につながる。")}
      <section class="home-hero" style="background-image:linear-gradient(90deg,rgba(5,20,13,.96) 3%,rgba(5,20,13,.72) 43%,rgba(5,20,13,.24) 100%),url('${assets.commandCenter}')">
        <div class="hero-copy"><span class="eyebrow">NEXT FIXTURE / WEEK ${this.simulation.currentWeek}</span><h2>${escapeHtml(this.simulation.clubNameValue)} <i>vs</i> ${opponent.name}</h2><p>${opponent.form}。現在の戦術総合値は <b>${score.total || "--"}</b>。スタメンを確認してからキックオフへ。</p><div class="venue-note ${nextGate.isHome ? "is-home" : "is-away"}"><span>${nextGate.isHome ? "⌂" : "↗"}</span>${venueCopy}</div>${this.matchConditionBoard(condition)}<div class="hero-actions"><button data-action="open-opponent-scout" class="ghost-action">相手を偵察</button><button data-nav="lineup" class="ghost-action">戦術を確認</button><button data-action="advance" class="primary-action">試合をプレイ <b>▶</b></button></div></div>
        <div class="hero-rival"><span class="rival-dot" style="background:${opponent.color}"></span><small>OPPONENT RATING</small><strong>${opponent.rating}</strong><em>${opponent.form}</em></div>
      </section>
      ${this.opponentDossier()}
      <section class="dashboard-grid">
        <article class="tactical-card team-card"><div class="card-kicker">TEAM PULSE</div><h3>チーム総合値</h3><div class="score-ring" style="--score:${score.total || 0}"><span>${score.total || "--"}</span></div><div class="split-metrics"><span><b>${score.attack || "--"}</b>攻撃</span><span><b>${score.defense || "--"}</b>守備</span><span><b>${score.readiness || "--"}</b>準備度</span></div></article>
        <article class="tactical-card objective-card"><div class="card-kicker">SEASON OBJECTIVE</div><h3>今季の目標</h3><div class="objective-list"><p><b>01</b> リーグ <strong>6位以内</strong></p><p><b>02</b> 名声 <strong>500</strong> に到達</p><p><b>03</b> 10勝を積み上げる</p></div><div class="progress-label"><span>SEASON PROGRESS</span><b>${this.simulation.seasonProgress}%</b></div><div class="progress-bar"><i style="width:${this.simulation.seasonProgress}%"></i></div></article>
        <article class="tactical-card supporter-card"><div class="card-kicker">SUPPORTER PULSE</div><h3>ファン人気</h3><div class="fan-score"><strong>${this.simulation.fanPopularity}<small>%</small></strong><span>${this.simulation.fanPopularity >= 70 ? "熱狂" : this.simulation.fanPopularity >= 45 ? "期待" : "再建中"}</span></div><div class="fan-bar"><i style="width:${this.simulation.fanPopularity}%"></i></div><p>${nextGate.isHome ? `次戦予想 <b>${nextGate.attendance.toLocaleString()} / ${nextGate.capacity.toLocaleString()}人</b>` : "次戦はアウェー。次のホーム戦で入場料を獲得。"}</p><div class="supporter-commerce"><span><i>FAN CLUB</i><b>${membership.members.toLocaleString()}人</b><small>週次 +${formatMoney(membership.revenue)}</small></span><span><i>GOODS ${nextMerchandise.isHome ? "FORECAST" : "AWAY"}</i><b>${nextMerchandise.isHome ? `${nextMerchandise.buyers.toLocaleString()}人` : "—"}</b><small>${nextMerchandise.isHome ? `+${formatMoney(nextMerchandise.revenue)}` : "ホーム戦で販売"}</small></span><span><i>FOOD Lv.${nextConcession.level}</i><b>${nextConcession.isHome ? `${nextConcession.customers.toLocaleString()}人` : "—"}</b><small>${nextConcession.isHome ? `+${formatMoney(nextConcession.revenue)}` : "ホーム戦で営業"}</small></span></div></article>
        <article class="tactical-card log-card"><div class="card-kicker">TOUCHLINE LOG</div><h3>監督レポート</h3>${recent.map((log, index) => `<p class="log-line"><b>${String(index + 1).padStart(2, "0")}</b>${log}</p>`).join("")}${this.simulation.currentSponsor ? `<div class="compact-contract"><span>PARTNER</span><b>${this.simulation.currentSponsor.name}</b><em>週次 +${formatMoney(this.simulation.currentSponsor.weeklyIncome)}</em></div>` : `<button data-nav="sponsors" class="compact-contract is-empty"><span>PARTNER</span><b>スポンサーを選ぶ</b><em>資金計画を整える →</em></button>`}</article>
      </section>
      <section class="test-reset-panel" aria-label="テストプレイ用リセット"><div><span class="card-kicker">TEST PLAY / DANGER ZONE</span><h3>ゲームを初期状態へ戻す</h3><p>保存済みのシーズン進行、選手育成、資金、戦績をすべて開幕状態へ戻します。</p></div><button data-action="reset-game" class="reset-game-button">初期状態へリセット</button></section>
    `;
  }

  private lineupPage(score: ReturnType<ClubSimulation["score"]>, selected: Player | null) {
    const slots = this.simulation.formation.slots;
    const roster = this.simulation.rosterPlayers;
    const positionFilters: Array<{ id: Player["position"] | "all"; label: string }> = [{ id: "all", label: "全ポジション" }, { id: "GK", label: "GK" }, { id: "CB", label: "CB" }, { id: "SB", label: "SB" }, { id: "DM", label: "DH" }, { id: "CM", label: "CH" }, { id: "SH", label: "SH" }, { id: "AM", label: "OH" }, { id: "WG", label: "WG" }, { id: "CF", label: "CF" }];
    const visibleRoster = this.lineupPositionFilter === "all" ? roster : roster.filter((player) => player.position === this.lineupPositionFilter || player.secondary === this.lineupPositionFilter);
    const tactics = score.tactics;
    const selectedSlot = selected ? slots.find((slot) => this.simulation.playerForSlot(slot.id)?.id === selected.id) : null;
    const starterIds = new Set(Object.values(this.simulation.lineupState).filter((playerId): playerId is string => Boolean(playerId)));
    const replacementHints = new Map<string, "primary" | "secondary">();
    if (selectedSlot) {
      roster.filter((player) => !starterIds.has(player.id) && this.simulation.injuryWeeksFor(player.id) === 0).forEach((player) => {
        if (selectedSlot.allowed.includes(player.position)) replacementHints.set(player.id, "primary");
        else if (player.secondary && selectedSlot.allowed.includes(player.secondary)) replacementHints.set(player.id, "secondary");
      });
    }
    const replacementValues = Array.from(replacementHints.values());
    const primaryReplacementCount = replacementValues.filter((hint) => hint === "primary").length;
    const secondaryReplacementCount = replacementValues.filter((hint) => hint === "secondary").length;
    const roleFitLeaders = tactics.roleFitDetails.filter((item) => item.totalBoost > 0).sort((a, b) => b.totalBoost - a.totalBoost).slice(0, 3).map((item) => `${item.player} ${item.style} +${item.totalBoost}`).join("　/　");
    const sideLinkLeaders = tactics.sideLinkDetails.map((item) => `${item.side} ${item.widePlayer}×${item.backPlayer} ${item.grade}`).join("　/　");
    const skillLeaders = tactics.skillDetails.filter((skill) => skill.active).map((skill) => `${skill.player} ${skill.short}`).join("　/　");
    return `
      ${this.pageHeading("MATCHDAY", "スタメンを組む", "選手を選び、戦術ボードのポジションへ配置する。")}
      <section class="formation-switcher">${formations.map((formation) => `<button data-formation="${formation.id}" class="formation-chip ${this.simulation.formation.id === formation.id ? "is-selected" : ""}"><b>${formation.label}</b><span>${formation.description}</span></button>`).join("")}</section>
      <section class="tactical-console tactical-card">
        <div class="tactic-identity"><span class="card-kicker">FORMATION IDENTITY</span><h3>${tactics.formationTrait}</h3><p>${tactics.formationNote}</p><div><span>攻撃 ${signed(tactics.formationAttack)}</span><span>守備 ${signed(tactics.formationDefense)}</span></div></div>
        <div class="tactic-selector"><span class="card-kicker">MENTALITY</span><div class="tactic-options">${mentalityOptions.map((item) => `<button data-mentality="${item.id}" class="tactic-option ${tactics.mentality === item.id ? "is-selected" : ""}"><b>${item.label}</b><small>攻${signed(item.attack)} / 守${signed(item.defense)}</small></button>`).join("")}</div></div>
        <div class="tactic-selector"><span class="card-kicker">PLAYING STYLE</span><div class="tactic-options">${playingStyleOptions.map((item) => `<button data-style="${item.id}" class="tactic-option style ${tactics.playingStyle === item.id ? "is-selected" : ""}"><b>${item.label}</b><small>攻${signed(item.attack)} / 守${signed(item.defense)}</small></button>`).join("")}</div></div>
        <div class="role-fit-console"><span class="card-kicker">ROLE SYNERGY</span><div><p>${tactics.roleFitSummary}</p><small>${roleFitLeaders ? `上位伸長: ${roleFitLeaders}` : "対応位置と役割を揃えると、ここに伸長要因が表示されます。"}</small></div><b>適合伸長　攻 ${signed(tactics.roleFitAttack)} / 守 ${signed(tactics.roleFitDefense)}</b></div>
        <div class="skill-console ${tactics.skillDetails.some((skill) => skill.active) ? "is-active" : ""}"><span class="card-kicker">SKILL LINK-UP</span><div><p>${tactics.skillSummary}</p><small>${skillLeaders || "戦術と能力の発動条件を満たすスキルはありません。"}</small></div><b>発動補正　攻 ${signed(tactics.skillAttack)} / 守 ${signed(tactics.skillDefense)}</b></div>
        <div class="side-link-console ${tactics.sideLinkDetails.length ? "is-active" : ""}"><span class="card-kicker">WIDE LINK-UP</span><div><p>${tactics.sideLinkDetails.length ? tactics.sideLinkSummary : "SH・WGとSBを同じサイドの対応位置へ起用すると、サイド攻略ボーナスが発動します。"}</p><small>${sideLinkLeaders || "左右のレーンに連動ユニットはありません。"}</small></div><b>連動補正　攻 ${signed(tactics.sideLinkAttack)} / 守 ${signed(tactics.sideLinkDefense)}</b></div>
        <div class="midfield-press-console ${tactics.midfieldPressDetail.active ? "is-active" : ""}"><span class="card-kicker">MIDFIELD PRESS</span><div><p>${tactics.midfieldPressSummary}</p><small>${tactics.midfieldPressReason}</small></div><b>連動補正　攻 ${signed(tactics.midfieldPressAttack)} / 守 ${signed(tactics.midfieldPressDefense)}</b></div>
      </section>
      ${this.opponentDossier()}
      <section class="lineup-layout">
        <article class="tactical-card pitch-panel"><div class="panel-top"><div><span class="card-kicker">TACTICAL BOARD</span><h3>${this.simulation.formation.label} <small>${this.simulation.formation.description}</small></h3></div><button data-action="auto" class="mini-action">⚡ オート編成</button></div>
          <p class="auto-lineup-note"><b>AUTO SELECT</b> ポジション適性・能力・疲労度を総合評価。疲労60以上は優先度を下げ、80以上はさらに強く抑制します。</p>
          <div class="tactics-pitch" style="background-image:linear-gradient(rgba(4,31,18,.23),rgba(4,31,18,.23)),url('${assets.tacticsBoard}')">
            ${slots.map((slot) => { const player = this.simulation.playerForSlot(slot.id); const fit = player ? this.simulation.playerIsFit(player, slot.id) : true; const injuryWeeks = player ? this.simulation.injuryWeeksFor(player.id) : 0; const condition = injuryWeeks ? "is-injured" : player && player.fatigue >= 80 ? "is-danger" : player && player.fatigue >= 60 ? "is-warning" : ""; const isSwapSource = player?.id === selected?.id; return `<button data-slot="${slot.id}" class="player-token ${player ? "is-filled" : ""} ${isSwapSource ? "is-swap-source" : ""} ${!fit ? "is-offrole" : ""} ${condition}" style="left:${slot.x}%;top:${slot.y}%"><i>${positionLabel(slot.label)}</i>${player ? `<strong>${compactSurname(player.name)}</strong><small>${injuryWeeks ? `離脱 ${injuryWeeks}週` : player.position === "GK" ? `GK ${player.gk} / 疲 ${player.fatigue}` : `${player.attack}/${player.defense} / 疲 ${player.fatigue}`}</small>` : `<strong>空き</strong><small>配置</small>`}</button>`; }).join("")}
          </div>
          <p class="selection-help">${selected ? selectedSlot ? `<b>${selected.name}</b> を交代対象として選択中。ベンチの <strong>主適性 ${primaryReplacementCount}名</strong>${secondaryReplacementCount ? ` / 副適性 ${secondaryReplacementCount}名` : ""} をハイライトしています。候補を選ぶと、このポジションへ交代します。` : `<b>${selected.name}</b> を選択中。ピッチ上のポジションを押して起用できます。` : "ベンチ選手を先に選ぶか、ピッチ上のスタメンを先にタップしてから交代相手を選んでください。"}</p>
        </article>
        <aside class="lineup-aside"><article class="tactical-card score-card"><span class="card-kicker">MATCH READINESS</span><div class="score-line"><strong>${score.total}</strong><span>TEAM<br/>RATING</span></div><div class="bar-set"><p>攻撃 <b>${score.attack}</b></p><i><b style="width:${score.attack}%"></b></i><p>守備 <b>${score.defense}</b></p><i class="blue"><b style="width:${score.defense}%"></b></i></div><div class="tactical-net"><span>最終補正</span><b>攻 ${signed(tactics.attackModifier)} / 守 ${signed(tactics.defenseModifier)}</b></div></article><article class="tactical-card chemistry-card"><span class="card-kicker">LINK-UP PLAY</span><h3>選手間連携 <b>${tactics.chemistry}<small>%</small></b></h3><div class="chemistry-meter"><i style="width:${tactics.chemistry}%"></i></div><p>${tactics.links}本の近接リンクを評価。適性配置と疲労管理が連携補正 <strong>${signed(tactics.chemistryBonus)}</strong> を生みます。</p></article></aside>
      </section>
      <section class="bench-section"><div class="section-label"><span>BENCH & SQUAD</span><b>${selectedSlot ? `候補 / 主 ${primaryReplacementCount}・副 ${secondaryReplacementCount}` : `${visibleRoster.length} / ${roster.length} PLAYERS`}</b></div><div class="candidate-filter"><span>POSITION FILTER</span><div>${positionFilters.map((filter) => `<button type="button" data-lineup-position-filter="${filter.id}" class="${this.lineupPositionFilter === filter.id ? "is-selected" : ""}">${filter.label}</button>`).join("")}</div><p>主適性・副適性のどちらかに一致する選手を表示します。</p></div><div class="player-grid">${visibleRoster.length ? visibleRoster.map((player) => this.playerCard(player, selected?.id === player.id, replacementHints.get(player.id), this.lineupPositionFilter)).join("") : `<div class="roster-filter-empty">このポジションに該当する選手はいません。</div>`}</div></section>
    `;
  }

  private playerCard(player: Player, isSelected: boolean, replacementHint?: "primary" | "secondary", positionFilter: Player["position"] | "all" = "all") {
    const isStarter = Object.values(this.simulation.lineupState).includes(player.id);
    const ability = player.position === "GK" ? `GK ${player.gk}　OF ${player.attack}` : `OF ${player.attack}　DF ${player.defense}`;
    const injuryWeeks = this.simulation.injuryWeeksFor(player.id);
    const skill = this.simulation.playerSkillStatus(player)[0];
    const condition = injuryWeeks ? `<span class="condition-pill injured">負傷 / ${injuryWeeks}週</span>` : `<span class="condition-pill ${player.fatigue >= 80 ? "danger" : player.fatigue >= 60 ? "warning" : "ready"}">${player.fatigue >= 80 ? "危険" : player.fatigue >= 60 ? "注意" : "良好"}</span>`;
    const filterFit = positionFilter !== "all" ? player.position === positionFilter ? `<span class="position-fit primary">主適性 / ${positionLabel(positionFilter)}</span>` : player.secondary === positionFilter ? `<span class="position-fit secondary">副適性 / ${positionLabel(positionFilter)}</span>` : "" : "";
    return `<button data-player="${player.id}" class="squad-card ${isSelected ? "is-selected" : ""} ${replacementHint ? `is-replacement-${replacementHint}` : ""} ${isStarter ? "is-starter" : ""} ${injuryWeeks ? "is-injured" : ""}" ${injuryWeeks ? "disabled" : ""}><div><span class="pos-tag">${positionLabel(player.position)}</span><span class="chemistry-dot ${player.chemistry}"></span></div><h4>${player.name}</h4><p>${player.secondary ? `${positionLabel(player.position)} / ${positionLabel(player.secondary)}` : positionLabel(player.position)}　Lv.${player.level}/${player.ceiling}</p><div class="card-stat"><b>${ability}</b><span>疲 ${player.fatigue}</span></div>${skill ? `<span class="player-skill-chip ${skill.active ? "is-active" : ""}">${skill.short}</span>` : ""}${condition}${replacementHint ? `<span class="replacement-fit ${replacementHint}">${replacementHint === "primary" ? "主適性 / 優先" : "副適性 / 候補"}</span>` : ""}${filterFit}${isStarter ? "<em>STARTING XI</em>" : ""}</button>`;
  }

  private organizedRosterPlayers() {
    const contractYears = (player: Player) => player.contractYears ?? 1;
    const filtered = this.simulation.rosterPlayers.filter((player) => {
      const salaryMatches = this.rosterSalaryFilter === "all" || this.rosterSalaryFilter === "high" && player.salary >= 10000000 || this.rosterSalaryFilter === "low" && player.salary < 5000000;
      const years = contractYears(player);
      const contractMatches = this.rosterContractFilter === "all" || this.rosterContractFilter === "due" && years <= 1 || this.rosterContractFilter === "short" && years <= 2 || this.rosterContractFilter === "long" && years >= 3;
      return salaryMatches && contractMatches;
    });
    return filtered.sort((a, b) => {
      const ability = (player: Player) => player.position === "GK" ? (player.gk ?? 0) + player.attack : player.attack + player.defense;
      if (this.rosterSort === "position") return (rosterPositionOrder[a.position] ?? 99) - (rosterPositionOrder[b.position] ?? 99) || ability(b) - ability(a);
      if (this.rosterSort === "salary-high") return b.salary - a.salary || ability(b) - ability(a);
      if (this.rosterSort === "salary-low") return a.salary - b.salary || ability(b) - ability(a);
      if (this.rosterSort === "contract-short") return contractYears(a) - contractYears(b) || b.salary - a.salary;
      if (this.rosterSort === "contract-long") return contractYears(b) - contractYears(a) || b.salary - a.salary;
      return ability(b) - ability(a);
    });
  }

  private teamPage() {
    const attack = average(this.simulation.rosterPlayers.map((player) => player.attack));
    const defense = average(this.simulation.rosterPlayers.filter((player) => player.position !== "GK").map((player) => player.defense));
    const contractDue = this.simulation.contractDuePlayers;
    const saleOffers = this.simulation.activeSaleOffers;
    const capacity = this.simulation.rosterCapacityStatus;
    const organizedRoster = this.organizedRosterPlayers();
    const sortOptions: Array<{ id: RosterSort; label: string }> = [{ id: "position", label: "ポジション順" }, { id: "ability", label: "能力順" }, { id: "salary-high", label: "年俸 高い順" }, { id: "salary-low", label: "年俸 低い順" }, { id: "contract-short", label: "残年数 短い順" }, { id: "contract-long", label: "残年数 長い順" }];
    const salaryFilters: Array<{ id: SalaryFilter; label: string }> = [{ id: "all", label: "全年俸" }, { id: "high", label: "1,000万〜" }, { id: "low", label: "〜500万" }];
    const contractFilters: Array<{ id: ContractFilter; label: string }> = [{ id: "all", label: "全契約" }, { id: "due", label: "最終年" }, { id: "short", label: "2年以内" }, { id: "long", label: "3年以上" }];
    const capacityAlert = capacity.warning ? `<section class="roster-capacity-alert tactical-card is-${capacity.tone}"><div><span class="card-kicker">SQUAD CAPACITY ALERT</span><h3>${capacity.full ? "登録上限に到達しています" : `保有枠の残りは ${capacity.remaining} 人です`}</h3><p>${capacity.full ? `${capacity.count} / ${capacity.limit}人です。新規契約とユース昇格を進める前に、売却・契約満了・レンタルなどの整理を行ってください。` : `${capacity.count} / ${capacity.limit}人を保有しています。補強の前に、選手一覧と売却オファーを確認して契約整理の方針を決めましょう。`}</p></div><b>${capacity.full ? "FULL" : `${capacity.remaining} SLOT${capacity.remaining === 1 ? "" : "S"}`}</b></section>` : "";
    return `
      ${this.pageHeading("SQUAD DATABASE", "チームを整える", "成長と疲労を見極め、長いシーズンを戦い抜く。")}
      <section class="team-stat-row team-stat-row-primary"><article class="stat-strip"><span>登録選手</span><b>${this.simulation.rosterPlayers.length}<small> / ${this.simulation.rosterLimit}</small></b></article><article class="stat-strip"><span>平均年齢</span><b>${(this.simulation.rosterPlayers.reduce((sum, player) => sum + player.age, 0) / this.simulation.rosterPlayers.length).toFixed(1)}</b></article><article class="stat-strip"><span>平均 OF</span><b>${attack}</b></article><article class="stat-strip"><span>平均 DF</span><b>${defense}</b></article></section>
      <section class="team-stat-row team-stat-row-salary"><article class="stat-strip salary-strip"><span>年間年俸</span><b>${formatMoney(this.simulation.annualSalary)}</b></article><article class="stat-strip salary-strip"><span>週次年俸</span><b>${formatMoney(this.simulation.weeklySalary)}</b></article></section>
      ${capacityAlert}
      <section class="roster-organizer tactical-card"><div class="roster-organizer-head"><div><span class="card-kicker">CONTRACT ORGANIZER</span><h3>年俸・契約で整理</h3><p>並び替えと条件を組み合わせ、優先して見直す契約を絞り込みます。</p></div><b>${organizedRoster.length}<small> / ${this.simulation.rosterPlayers.length}名</small></b></div><div class="roster-control-set"><span>並び順</span><div>${sortOptions.map((option) => `<button type="button" data-roster-sort="${option.id}" class="${this.rosterSort === option.id ? "is-selected" : ""}">${option.label}</button>`).join("")}</div></div><div class="roster-control-grid"><div class="roster-control-set"><span>年俸</span><div>${salaryFilters.map((filter) => `<button type="button" data-roster-salary-filter="${filter.id}" class="${this.rosterSalaryFilter === filter.id ? "is-selected" : ""}">${filter.label}</button>`).join("")}</div></div><div class="roster-control-set"><span>契約残年数</span><div>${contractFilters.map((filter) => `<button type="button" data-roster-contract-filter="${filter.id}" class="${this.rosterContractFilter === filter.id ? "is-selected" : ""}">${filter.label}</button>`).join("")}</div></div></div></section>
      <section class="roster-table tactical-card"><div class="table-heading"><div><span class="card-kicker">PLAYER DIRECTORY</span><h3>選手一覧</h3></div><span>${organizedRoster.length ? "カードをタップして詳細を見る" : "条件に一致する選手はいません"}</span></div><div class="table-head"><span>選手</span><span>役割 / 契約</span><span>能力</span><span>疲労</span><span>年齢</span><span>年俸</span></div>${organizedRoster.length ? organizedRoster.map((player) => { const injuryWeeks = this.simulation.injuryWeeksFor(player.id); const years = player.contractYears ?? 1; return `<button type="button" data-player-detail="${player.id}" class="table-row player-directory-card ${injuryWeeks ? "is-injured" : ""}"><strong><i class="pos-tag">${positionLabel(player.position)}</i><span>${player.name}<small>詳細を見る ›</small></span></strong><span>${positionLabel(player.position)}${player.secondary ? ` / ${positionLabel(player.secondary)}` : ""}<small class="roster-contract-years">残り ${years}年${years <= 1 ? " / 更新優先" : ""}</small></span><span>${player.position === "GK" ? `GK ${player.gk} / OF${player.attack}` : `OF${player.attack} / DF${player.defense}`}</span><span><b class="fatigue ${injuryWeeks ? "injured" : player.fatigue >= 80 ? "danger" : player.fatigue >= 60 ? "high" : ""}">${injuryWeeks ? `負傷 ${injuryWeeks}週` : player.fatigue}</b></span><span>${player.age}歳</span><span>${formatMoney(player.salary)}</span></button>`; }).join("") : `<div class="roster-filter-empty">現在の年俸・契約条件に一致する選手はいません。条件を「全」に戻して確認してください。</div>`}</section>
      <section class="contract-command tactical-card"><div><span class="card-kicker">CONTRACT DESK</span><h3>契約最終年の選手</h3><p>${contractDue.length ? "年俸と勝利・出場・得点出来高を組み合わせ、3年契約の条件を提示できます。" : "今季は全選手が複数年契約下です。シーズン更新時に残年数が進行します。"}</p></div><div class="contract-renewal-list">${contractDue.length ? contractDue.map((player) => `<article><span><b>${player.name}</b><small>残り ${player.contractYears ?? 1}年　/　現年俸 ${formatMoney(player.salary)}</small></span><div class="contract-offer-buttons">${contractOfferOptions.map((offer) => `<button data-action="renew-contract" data-contract="${player.id}" data-contract-offer="${offer.id}" class="ghost-action"><strong>${offer.label}</strong><small>年俸 ${formatMoney(Math.round(player.salary * (1 + offer.salaryIncrease)))} / 勝利 ${formatMoney(offer.winBonus)} / 出場 ${formatMoney(offer.appearanceBonus)} / 得点 ${formatMoney(offer.goalBonus)} / 更新 ${formatMoney(this.simulation.contractRenewalFee(player, offer.id))}</small></button>`).join("")}</div></article>`).join("") : `<span class="contract-clear">契約更新が必要な選手はいません。</span>`}</div></section>
      <section class="sale-command tactical-card"><div><span class="card-kicker">TRANSFER OUTBOX</span><h3>売却オファー</h3><p>${saleOffers.length ? "他クラブから届いた移籍オファーです。戦力と資金計画を踏まえて受諾または見送ります。" : "現在、対応が必要な売却オファーはありません。"}</p></div><div class="sale-offer-list">${saleOffers.length ? saleOffers.map((offer) => { const player = this.simulation.rosterPlayers.find((item) => item.id === offer.playerId); return player ? `<article><span><i class="pos-tag">${positionLabel(player.position)}</i><b>${player.name}</b><small>${offer.clubName} / 移籍金 ${formatMoney(offer.proposedFee)}</small></span><div><button data-action="respond-sale" data-sale-offer="${offer.id}" data-sale-decision="decline" class="ghost-action">見送る</button><button data-action="respond-sale" data-sale-offer="${offer.id}" data-sale-decision="accept" class="primary-action">売却を受諾 <b>+${formatMoney(offer.proposedFee)}</b></button></div></article>` : ""; }).join("") : `<span class="contract-clear">オファー到着時にここへ表示されます。</span>`}</div></section>
    `;
  }

  private roleFitRadarValues(fit: RolePlayStyleFit) {
    return [fit.abilityScore, fit.active ? 100 : 18, fit.formationBonus ? 100 : fit.active ? 54 : 18, Math.min(100, fit.attackBoost * 50), Math.min(100, fit.defenseBoost * 50)];
  }

  private animateRoleRadar() {
    const radar = this.root.querySelector<HTMLElement>(".role-fit-radar.is-morph-candidate");
    const morph = this.radarMorph;
    this.radarMorph = null;
    if (!radar || !morph || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = (radar.dataset.radarFrom ?? "").split(",").map(Number);
    const target = (radar.dataset.radarTarget ?? "").split(",").map(Number);
    const polygon = radar.querySelector<SVGPolygonElement>(".radar-value");
    const dots = Array.from(radar.querySelectorAll<SVGCircleElement>(".radar-dot"));
    if (!polygon || from.length !== 5 || target.length !== 5 || from.some(Number.isNaN) || target.some(Number.isNaN)) return;
    const point = (value: number, index: number) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / 5;
      const distance = 43 * (value / 100);
      return { x: 66 + Math.cos(angle) * distance, y: 66 + Math.sin(angle) * distance };
    };
    const draw = (values: number[]) => {
      const points = values.map((value, index) => point(value, index));
      polygon.setAttribute("points", points.map((item) => `${item.x.toFixed(1)},${item.y.toFixed(1)}`).join(" "));
      dots.forEach((dot, index) => { dot.setAttribute("cx", points[index].x.toFixed(1)); dot.setAttribute("cy", points[index].y.toFixed(1)); });
    };
    radar.classList.add("is-morphing");
    draw(from);
    const startedAt = performance.now();
    const duration = 460;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      draw(from.map((value, index) => value + (target[index] - value) * eased));
      if (progress < 1) window.requestAnimationFrame(tick);
      else { draw(target); radar.classList.remove("is-morphing"); }
    };
    window.requestAnimationFrame(tick);
  }

  private roleFitRadar(fit: RolePlayStyleFit, option: RoleStyleOption) {
    const playingStyle = this.simulation.currentPlayingStyle;
    const styledAttack = option.attackBonus + (playingStyle === "direct" ? option.directBonus : playingStyle === "possession" ? option.possessionBonus : option.pressBonus);
    const values = this.roleFitRadarValues(fit);
    const dimensions = [
      { label: "能力", value: values[0], detail: `${fit.abilityScore}/100` },
      { label: "起用", value: values[1], detail: fit.active ? "対応枠" : "待機" },
      { label: "配置", value: values[2], detail: fit.formationBonus ? "好相性" : fit.active ? "通常" : "未起用" },
      { label: "攻伸", value: values[3], detail: `+${fit.attackBoost}` },
      { label: "守伸", value: values[4], detail: `+${fit.defenseBoost}` },
    ];
    const center = 66;
    const radius = 43;
    const point = (value: number, index: number, scale = 1) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / dimensions.length;
      const distance = radius * scale * (value / 100);
      return `${(center + Math.cos(angle) * distance).toFixed(1)},${(center + Math.sin(angle) * distance).toFixed(1)}`;
    };
    const outline = (scale: number) => dimensions.map((_, index) => point(100, index, scale)).join(" ");
    const plot = dimensions.map((dimension, index) => point(dimension.value, index)).join(" ");
    const fromValues = this.radarMorph?.playerId === fit.playerId && this.radarMorph.role === fit.role ? this.radarMorph.values : null;
    return `<section class="role-fit-radar ${fit.grade === "待機" ? "is-idle" : ""} ${fromValues ? "is-morph-candidate" : ""}" data-radar-from="${fromValues?.join(",") ?? ""}" data-radar-target="${values.join(",")}" aria-label="${fit.style}の役割適合マップ"><div class="role-fit-radar-head"><span>ROLE SYNERGY MAP</span><b>${fit.grade} <small>${styledAttack > 0 || option.defenseBonus > 0 ? `基礎効果 攻${signed(styledAttack)} / 守${signed(option.defenseBonus)}` : "基礎効果なし"}</small></b></div><div class="role-fit-radar-plot"><svg viewBox="0 0 132 132" role="img" aria-label="能力、起用、配置、攻撃伸長、守備伸長のレーダーチャート"><g class="radar-grid">${[.25, .5, .75, 1].map((scale) => `<polygon points="${outline(scale)}"></polygon>`).join("")}</g><g class="radar-axis">${dimensions.map((_, index) => `<line x1="${center}" y1="${center}" x2="${point(100, index)}"></line>`).join("")}</g><polygon class="radar-value" points="${plot}"></polygon>${dimensions.map((dimension, index) => { const [x, y] = point(dimension.value, index).split(","); return `<circle class="radar-dot" cx="${x}" cy="${y}" r="2.3"></circle>`; }).join("")}</svg></div><ul class="role-fit-radar-legend">${dimensions.map((dimension) => `<li><span>${dimension.label}</span><b>${dimension.detail}</b></li>`).join("")}</ul><p>${fit.active ? "五角形が外側へ広がるほど、その役割を現在の編成で活かせます。" : "対応するポジションへ配置すると、起用・配置・攻守伸長の軸が有効になります。"}</p></section>`;
  }

  private rolePlayStyleControl(player: Player, role: "cf" | "wg" | "am" | "cm" | "dm" | "cb" | "sb" | "gk") {
    const playingStyle = this.simulation.currentPlayingStyle;
    const config = role === "cf"
      ? { label: "CF PLAY STYLE", number: "09", current: this.simulation.cfPlayStyleFor(player), options: cfPlayStyleOptions, note: "前線補正" }
      : role === "wg"
        ? { label: player.position === "SH" ? "SH PLAY STYLE" : "WG PLAY STYLE", number: "11", current: this.simulation.wgPlayStyleFor(player), options: wgPlayStyleOptions, note: player.position === "SH" ? "サイドハーフ補正" : "サイド補正" }
        : role === "am"
          ? { label: "AM PLAY STYLE", number: "10", current: this.simulation.amPlayStyleFor(player), options: amPlayStyleOptions, note: "中盤補正" }
          : role === "cm"
            ? { label: "CM PLAY STYLE", number: "08", current: this.simulation.cmPlayStyleFor(player), options: cmPlayStyleOptions, note: "中央補正" }
            : role === "dm"
              ? { label: "DM PLAY STYLE", number: "06", current: this.simulation.dmPlayStyleFor(player), options: dmPlayStyleOptions, note: "守備中盤補正" }
              : role === "cb"
                ? { label: "CB PLAY STYLE", number: "04", current: this.simulation.cbPlayStyleFor(player), options: cbPlayStyleOptions, note: "最終ライン補正" }
                : role === "sb"
                  ? { label: "SB PLAY STYLE", number: "02", current: this.simulation.sbPlayStyleFor(player), options: sbPlayStyleOptions, note: "サイド守備補正" }
                  : { label: "GK PLAY STYLE", number: "01", current: this.simulation.gkPlayStyleFor(player), options: gkPlayStyleOptions, note: "ゴール前補正" };
    if (!config.current) return "";
    const currentFit = this.simulation.rolePlayStyleFit(player, role, config.current);
    return `<section class="cf-style-control role-${role}" data-role-number="${config.number}"><div class="cf-style-head"><span>${config.label}</span><b>${config.current.label}</b></div><p>${config.current.copy}</p><div class="role-fit-readout ${currentFit.grade === "伸長大" ? "is-major" : currentFit.grade === "伸長" ? "is-growing" : ""}"><span>ROLE FIT / ${currentFit.grade}</span><b>適合能力 ${currentFit.abilityScore}　伸長 攻${signed(currentFit.attackBoost)} / 守${signed(currentFit.defenseBoost)}</b><small>${currentFit.reason}</small></div>${this.roleFitRadar(currentFit, config.current)}<div class="cf-style-options">${config.options.map((option) => { const fit = this.simulation.rolePlayStyleFit(player, role, option); const attackBonus = option.attackBonus + (playingStyle === "direct" ? option.directBonus : playingStyle === "possession" ? option.possessionBonus : option.pressBonus) + fit.attackBoost; const defenseBonus = option.defenseBonus + fit.defenseBoost; return `<button type="button" data-action="set-role-play-style" data-role-kind="${role}" data-role-player="${player.id}" data-role-style="${option.id}" class="${config.current?.id === option.id ? "is-selected" : ""}"><strong>${option.label}</strong><small>${option.copy}</small><em>攻 ${signed(attackBonus)} / 守 ${signed(defenseBonus)}${fit.totalBoost ? `<mark>適合 +${fit.totalBoost}</mark>` : ""}</em></button>`; }).join("")}</div><small class="cf-style-footnote">現在のチームプレースタイル「${this.simulation.score().tactics.playingStyleLabel}」と、${this.simulation.formation.label}での起用位置・能力を加味した${config.note}です。</small></section>`;
  }

  private playerDetailPanel() {
    const player = this.playerDetailId ? this.simulation.rosterPlayers.find((item) => item.id === this.playerDetailId) : null;
    if (!player) return "";
    const injuryWeeks = this.simulation.injuryWeeksFor(player.id);
    const role = player.secondary ? `${positionLabel(player.position)} / ${positionLabel(player.secondary)}` : `${positionLabel(player.position)} 専門`;
    const condition = injuryWeeks ? `負傷中 / 復帰まで ${injuryWeeks}週` : player.fatigue >= 80 ? `コンディション危険 / 疲労 ${player.fatigue}` : player.fatigue >= 60 ? `コンディション注意 / 疲労 ${player.fatigue}` : `コンディション良好 / 疲労 ${player.fatigue}`;
    const cfStyleControl = ["cf", "wg", "am", "cm", "dm", "cb", "sb", "gk"].map((item) => this.rolePlayStyleControl(player, item as "cf" | "wg" | "am" | "cm" | "dm" | "cb" | "sb" | "gk")).join("");
    return `<div class="player-detail-overlay" role="dialog" aria-modal="true" aria-label="${player.name}の選手詳細"><section class="player-detail-panel"><header><div><span>PLAYER PROFILE</span><h2>${player.name}</h2><p>${role}</p></div><button type="button" data-close-player-detail aria-label="選手詳細を閉じる">×</button></header><div class="detail-identity"><span class="pos-tag">${positionLabel(player.position)}</span><div><b>${player.age}<small>歳</small></b><p>年齢</p></div><div><b>LV.${player.level}<small> / ${player.ceiling}</small></b><p>現在レベル / 上限</p></div></div><section class="detail-ability"><h3>OFFENSE / 攻撃能力</h3><div><span>OF</span><b>${player.attack}</b><i><em style="width:${player.attack}%"></em></i></div><div><span>ドリブル</span><b>${player.dribble}</b><i><em style="width:${player.dribble}%"></em></i></div><div><span>パス</span><b>${player.pass}</b><i><em style="width:${player.pass}%"></em></i></div><div><span>シュート</span><b>${player.shoot}</b><i><em style="width:${player.shoot}%"></em></i></div><h3 class="defense-heading">DEFENSE / 守備能力</h3><div><span>DF</span><b>${player.defense}</b><i class="blue"><em style="width:${player.defense}%"></em></i></div><div><span>タックル</span><b>${player.tackle}</b><i class="blue"><em style="width:${player.tackle}%"></em></i></div><div><span>ブロック</span><b>${player.block}</b><i class="blue"><em style="width:${player.block}%"></em></i></div><div><span>パスカット</span><b>${player.interception}</b><i class="blue"><em style="width:${player.interception}%"></em></i></div>${player.position === "GK" ? `<h3 class="keeper-heading">GOALKEEPING</h3><div><span>GK</span><b>${player.gk ?? 0}</b><i class="gold"><em style="width:${player.gk ?? 0}%"></em></i></div>` : ""}</section>${cfStyleControl}<section class="detail-note"><span>CONDITION / CONTRACT</span><b>${condition}</b><p>年俸 ${formatMoney(player.salary)}　/　勝利 ${player.winBonus ? formatMoney(player.winBonus) : "なし"}　/　出場 ${player.appearanceBonus ? formatMoney(player.appearanceBonus) : "なし"}　/　得点 ${player.goalBonus ? formatMoney(player.goalBonus) : "なし"}　/　残り ${player.contractYears ?? 1}年</p></section><button type="button" class="detail-close-button" data-close-player-detail>選手一覧へ戻る</button></section></div>`;
  }

  private seasonStatsPage() {
    const stats = this.simulation.seasonPlayerStats;
    const topScorer = stats[0];
    const bestRating = [...stats].filter((stat) => stat.ratingCount > 0).sort((a, b) => b.ratingTotal / b.ratingCount - a.ratingTotal / a.ratingCount)[0];
    const mvpLeader = [...stats].sort((a, b) => b.mvpAwards - a.mvpAwards || b.goals - a.goals)[0];
    return `
      ${this.pageHeading("SEASON LEDGER", "選手の結果を読む", "数字の裏にある働きを見極め、次の起用へつなげる。")}
      <section class="stats-hero tactical-card"><div><span class="card-kicker">ORBIT TOKYO / SEASON ${this.simulation.completedWeeks} WEEKS</span><h2>個の積み上げを、チームの勝点へ。</h2><p>リーグ戦の出場、得点、アシスト、平均評価、MVPを記録しています。選手をタップするとプロフィールを確認できます。</p></div><div class="stats-leader"><span>TOP SCORER</span><b>${topScorer?.player ?? "—"}</b><strong>${topScorer?.goals ?? 0}<small> GOALS</small></strong></div><div class="stats-leader ice"><span>BEST RATING</span><b>${bestRating?.player ?? "—"}</b><strong>${bestRating ? (bestRating.ratingTotal / bestRating.ratingCount).toFixed(1) : "—"}<small> AVG</small></strong></div><div class="stats-leader gold"><span>MVP LEADER</span><b>${mvpLeader?.player ?? "—"}</b><strong>${mvpLeader?.mvpAwards ?? 0}<small> AWARDS</small></strong></div></section>
      <section class="season-stats-table tactical-card"><div class="stats-table-head"><div><span class="card-kicker">PLAYER PERFORMANCE INDEX</span><h3>シーズン個人成績</h3></div><span>${stats.filter((stat) => stat.appearances > 0).length} PLAYERS USED</span></div><div class="stats-columns"><span>選手</span><span>出場</span><span>先発</span><span>得点</span><span>アシスト</span><span>平均評価</span><span>MVP</span></div>${stats.map((stat, index) => `<button type="button" data-player-detail="${stat.playerId}" class="stats-row ${stat.appearances ? "is-active" : ""}"><strong><i>${String(index + 1).padStart(2, "0")}</i><span>${stat.player}<small>${stat.position}</small></span></strong><span>${stat.appearances}</span><span>${stat.starts}</span><span class="goal-stat">${stat.goals}</span><span>${stat.assists}</span><span class="rating-stat">${stat.ratingCount ? (stat.ratingTotal / stat.ratingCount).toFixed(1) : "—"}</span><span class="mvp-stat">${stat.mvpAwards}</span></button>`).join("")}</section>
    `;
  }

  private leaguePage() {
    const rows = this.simulation.leagueRows;
    return `
      ${this.pageHeading("NATIONAL LEAGUE", "リーグ順位表", "勝点、得失点差、そして次節への執念。")}
      <section class="league-intro tactical-card"><div><span class="card-kicker">DIVISION 5 / 20 CLUBS</span><h3>昇格圏は、上位3クラブ。</h3><p>現在の${escapeHtml(this.simulation.clubNameValue)}は <b>${this.simulation.teamPosition}位</b>。毎節の結果が、クラブの物語を動かします。</p></div><div class="league-key"><span><i class="promotion"></i>昇格圏</span><span><i class="club-dot"></i>あなたのクラブ</span></div></section>
      <section class="league-table tactical-card"><div class="league-head"><span>順位 / クラブ</span><span>試</span><span>勝</span><span>分</span><span>負</span><span>得点</span><span>失点</span><span>差</span><span>勝点</span></div>${rows.map((row, index) => `<div class="league-row ${row.id === "orbit" ? "is-user" : ""} ${index < 3 ? "is-promotion" : ""}"><strong><i>${index + 1}</i><b style="background:${row.color}"></b>${row.name}</strong><span>${row.played}</span><span>${row.win}</span><span>${row.draw}</span><span>${row.loss}</span><span>${row.gf}</span><span>${row.ga}</span><span>${row.gf - row.ga > 0 ? "+" : ""}${row.gf - row.ga}</span><span><em>${row.pts}</em></span></div>`).join("")}</section>
    `;
  }

  private sponsorPage() {
    const sponsor = this.simulation.currentSponsor;
    if (sponsor) {
      return `
        ${this.pageHeading("SEASON PARTNERSHIP", "スポンサー契約", "クラブの挑戦を支える、今季のパートナー。")}
        <section class="sponsor-active tactical-card" style="--partner:${sponsor.accent}"><div class="partner-mark">${sponsor.name.slice(0, 1)}</div><div><span class="card-kicker">ACTIVE PARTNER / ${sponsor.sector}</span><h2>${sponsor.name}</h2><p>${sponsor.copy}</p></div><div class="contract-totals"><span>契約残り</span><strong>${this.simulation.sponsorWeeksRemaining}<small> WEEKS</small></strong><div><p>週次収入 <b>+${formatMoney(sponsor.weeklyIncome)}</b></p><p>勝利ボーナス <b>+${formatMoney(sponsor.winBonus)}</b></p></div></div></section>
        <section class="partner-note tactical-card"><span class="card-kicker">CONTRACT NOTE</span><h3>今季の収支を支える柱</h3><p>スポンサー収入はリーグ戦の週進行ごとに自動で計上されます。契約はシーズン終了時に満了し、次のシーズン開始時に新しいパートナーを選べます。</p></section>
      `;
    }
    return `
      ${this.pageHeading("SEASON PARTNERSHIP", "スポンサーを迎える", "資金計画と勝利への意志を、同じ方向へ。")}
      <section class="sponsor-intro tactical-card"><div><span class="card-kicker">CONTRACT WINDOW OPEN</span><h2>一社を、今季のパートナーに。</h2><p>契約時に一時金を受け取り、以後は各リーグ週の終了時に週次収入と勝利ボーナスが加算されます。契約はシーズン末まで継続します。</p></div><div class="sponsor-fame">現在の名声 <b>✦ ${this.simulation.currentFame}</b></div></section>
      <section class="sponsor-grid">${sponsorOffers.map((offer, index) => { const locked = this.simulation.currentFame < offer.fameRequired; return `<article class="sponsor-offer tactical-card ${locked ? "is-locked" : ""}" style="--partner:${offer.accent}"><div class="offer-number">0${index + 1}</div><span class="card-kicker">${offer.sector}</span><h2>${offer.name}</h2><p>${offer.copy}</p><div class="offer-money"><span>契約金<b>+${formatMoney(offer.upFront)}</b></span><span>週次<b>+${formatMoney(offer.weeklyIncome)}</b></span><span>勝利時<b>+${formatMoney(offer.winBonus)}</b></span></div><div class="offer-footer"><span class="fame-gate ${locked ? "is-locked" : ""}">✦ 名声 ${offer.fameRequired}</span><button data-action="sign-sponsor" data-sponsor="${offer.id}" class="${locked ? "ghost-action" : "primary-action"}">${locked ? "実績が必要" : "契約を結ぶ"} <b>›</b></button></div></article>`; }).join("")}</section>
    `;
  }

  private cupPage() {
    const cup = this.simulation.cupState;
    const round = this.simulation.cupCurrentRound;
    const nextWeek = this.simulation.nextCupWeek;
    const nameFor = (id: string) => id === "orbit" ? this.simulation.clubNameValue : opponentSeeds.find((club) => club.id === id)?.name ?? "TBD";
    const status = cup.status === "champion" ? "CHAMPIONS" : cup.status === "eliminated" ? "ELIMINATED" : "IN THE RUN";
    const statusCopy = cup.status === "champion" ? "クラブはカップの頂点へ。優勝賞金を獲得しました。" : cup.status === "eliminated" ? "今季のカップ戦はここで終了。リーグ戦で巻き返しましょう。" : nextWeek ? `次のカップ戦は第${nextWeek}節。ノックアウトの緊張が近づく。` : "カップ戦の全日程が完了しました。";
    return `
      ${this.pageHeading("ORBIT CUP", "カップ戦トーナメント", "一発勝負を勝ち抜き、クラブの歴史を塗り替える。")}
      <section class="cup-status tactical-card ${cup.status}"><div><span class="card-kicker">${status}</span><h2>${round?.name ?? "大会終了"}</h2><p>${statusCopy}</p></div><div class="cup-prize"><span>CHAMPION PRIZE</span><b>900,000円</b><small>決勝勝利時</small></div></section>
      <section class="cup-round-tabs">${cup.rounds.map((item, index) => `<span class="${index === cup.roundIndex ? "is-current" : ""} ${index < cup.roundIndex ? "is-past" : ""}"><b>${String(index + 1).padStart(2, "0")}</b>${item.name}<small>WEEK ${item.scheduledWeek}</small></span>`).join("")}</section>
      <section class="cup-bracket tactical-card"><div class="bracket-heading"><div><span class="card-kicker">${round?.name ?? "TOURNAMENT"}</span><h3>対戦カード</h3></div><span>${round?.fixtures.length ?? 0} FIXTURES</span></div><div class="fixture-grid">${(round?.fixtures ?? []).map((fixture) => { const userFixture = fixture.homeId === "orbit" || fixture.awayId === "orbit"; const done = fixture.homeScore !== undefined; return `<article class="fixture ${userFixture ? "is-user" : ""} ${done ? "is-done" : ""}"><div class="fixture-team ${fixture.winnerId === fixture.homeId ? "is-winner" : ""}"><span>${nameFor(fixture.homeId)}</span><b>${done ? fixture.homeScore : "—"}</b></div><div class="fixture-team ${fixture.winnerId === fixture.awayId ? "is-winner" : ""}"><span>${nameFor(fixture.awayId)}</span><b>${done ? fixture.awayScore : "—"}</b></div><small>${done ? fixture.note : `第${round?.scheduledWeek}節`}</small></article>`; }).join("")}</div></section>
      <section class="cup-note tactical-card"><span class="card-kicker">TOURNAMENT RULE</span><p>カップ戦はラウンド16から決勝までの一発勝負です。同点の場合はPK戦で勝者を決定し、勝ち上がるほど賞金と名声を獲得できます。</p></section>
    `;
  }

  private trainingPage(score: ReturnType<ClubSimulation["score"]>) {
    const history = this.simulation.recentTrainingHistory;
    const canTrain = this.simulation.canTrainThisWeek;
    const facility = this.simulation.trainingFacility;
    const recommendation = this.simulation.trainingRecommendation;
    const loadSummary = this.simulation.trainingLoadSummary;
    const trainingRoster = [...this.simulation.rosterPlayers].sort((a, b) => Number(Object.values(this.simulation.lineupState).includes(b.id)) - Number(Object.values(this.simulation.lineupState).includes(a.id)) || b.fatigue - a.fatigue || a.position.localeCompare(b.position));
    const skillTargets = trainingRoster.map((player) => ({ player, target: this.simulation.skillTrainingTargetFor(player) })).filter((item): item is { player: Player; target: NonNullable<ReturnType<ClubSimulation["skillTrainingTargetFor"]>> } => Boolean(item.target));
    const focusSkill = skillTargets[0];
    const totalSkillXp = skillTargets.reduce((sum, item) => sum + item.target.xp, 0);
    return `
      ${this.pageHeading("DEVELOPMENT", "練習メニュー", "短い積み重ねを、確かな勝点へ変える。")}
      <section class="skill-growth-workbench tactical-card"><div class="skill-workbench-brand"><img src="${assets.clubMark}" alt="" /><span>ORBIT<br/>SKILL LAB</span></div><div class="skill-workbench-copy"><span class="card-kicker">COACH'S WORKBENCH / WEEK ${this.simulation.currentWeek}</span><h2>今日の練習を、次の武器へ。</h2><p>集中対象を選び、対応メニューと試合出場でXPを積み上げます。100 XPで新スキルを習得し、熟達Lv.2からは発動効果も伸長します。</p></div><div class="skill-workbench-state"><span>ACTIVE TARGETS</span><b>${skillTargets.length}<small> PLAYERS</small></b><em>TEAM XP ${totalSkillXp}</em></div>${focusSkill ? `<article class="skill-workbench-dossier"><span>01 / FOCUS DOSSIER</span><div><b>${focusSkill.player.name}</b><small>${positionLabel(focusSkill.player.position)}　${focusSkill.target.short} ${focusSkill.target.label}</small></div><strong>${focusSkill.target.xp}${focusSkill.target.nextXp !== null ? ` / ${focusSkill.target.nextXp}` : " / MAX"}<small> XP</small></strong><i><em style="width:${focusSkill.target.progress}%"></em></i><button type="button" data-player-detail="${focusSkill.player.id}" class="primary-action">育成詳細を開く <b>→</b></button></article>` : ""}</section>
      <section class="training-layout"><article class="training-visual tactical-card" style="background-image:linear-gradient(90deg,rgba(5,23,14,.9),rgba(5,23,14,.34)),url('${assets.commandCenter}')"><span class="card-kicker">DEVELOPMENT DESK / ${facility.name}</span><h2>能力別トレーニング</h2><p>狙うプレーを選び、個別能力を伸ばす。高負荷メニューの後は、リカバリーで状態を整える。</p><div><span>週次練習枠</span><b>${this.simulation.trainingSessionsUsed} / ${facility.weeklySlots}</b></div></article><aside class="training-aside"><article class="tactical-card training-recommendation ${recommendation.grade === "回復優先" ? "is-recovery" : ""}"><span class="card-kicker">TRAINING ADVISOR / ${recommendation.grade}</span><h3>${recommendation.label} を推奨</h3><div class="shape-number">${recommendation.averageFatigue}<small> FATIGUE</small></div><p>${recommendation.reason}</p><small class="advisor-load-note">高負荷 ${recommendation.highLoadPlayers}人 / 高疲労 ${recommendation.highFatiguePlayers}人</small></article><article class="tactical-card"><span class="card-kicker">WEEKLY NOTE</span><p>GK専門はゴールキーパーを、その他の技術メニューはスタメンのフィールドプレーヤーを対象にします。施設Lv.${facility.level}では週${facility.weeklySlots}枠を利用できます。</p></article></aside></section>
      <section class="training-load-command tactical-card"><div class="training-load-copy"><span class="card-kicker">INDIVIDUAL LOAD CONTROL</span><h3>選手別の練習負荷</h3><p>選手カードから回復・軽め・標準・高負荷を指定します。設定は技術成長、疲労変動、過負荷リスクに即時反映されます。</p></div><div class="training-load-legend">${loadSummary.map((option) => `<span class="load-${option.id}"><b>${option.count}</b>${option.shortLabel}</span>`).join("")}</div></section>
      <section class="training-load-board tactical-card"><div class="training-load-board-head"><div><span class="card-kicker">SQUAD CONDITIONING BOARD</span><h3>個別コンディション設定</h3></div><p>スタメンを先頭に表示。疲労が高い選手は軽めまたは回復専念へ切り替えられます。</p></div><div class="training-load-list">${trainingRoster.map((player) => { const load = this.simulation.trainingLoadFor(player); const injured = this.simulation.injuryWeeksFor(player.id); const starter = Object.values(this.simulation.lineupState).includes(player.id); const fatigueClass = player.fatigue >= 60 ? "danger" : player.fatigue >= 38 ? "warning" : "ready"; const target = this.simulation.skillTrainingTargetFor(player); const progress = this.simulation.skillProgressFor(player); return `<article class="training-load-row ${load.id === "high" ? "is-high" : ""} ${injured ? "is-injured" : ""}"><div class="training-player-meta"><span class="load-starter">${starter ? "STARTER" : "SQUAD"}</span><strong>${player.name} <small>${positionLabel(player.position)}</small></strong><span class="condition-pill ${injured ? "injured" : fatigueClass}">${injured ? `離脱 ${injured}週` : `疲労 ${player.fatigue}`}</span></div><div class="training-load-options" aria-label="${player.name}の練習負荷">${trainingLoadOptions.map((option) => `<button data-action="set-training-load" data-training-player="${player.id}" data-training-load="${option.id}" class="load-option load-${option.id} ${load.id === option.id ? "is-selected" : ""}" title="${option.copy}">${option.shortLabel}</button>`).join("")}</div><small class="training-load-effect">${load.label}：${load.growthAdjustment >= 0 ? `成長 +${load.growthAdjustment}` : `成長 ${load.growthAdjustment}`} / 疲労 ${load.fatigueAdjustment >= 0 ? `+${load.fatigueAdjustment}` : load.fatigueAdjustment} / リスク ${load.riskAdjustment >= 0 ? `+${load.riskAdjustment}` : load.riskAdjustment}</small>${target ? `<div class="training-skill-track"><div><span>SKILL FOCUS</span><b>${target.short} ${target.label}<small>${target.levelLabel} Lv.${target.level} / ${target.xp}${target.nextXp !== null ? `→${target.nextXp}` : " MAX"} XP</small></b></div><i><em style="width:${target.progress}%"></em></i><p>${target.trainingLabels.join(" / ")}でXP獲得${target.learned ? "。試合出場・発動でも伸びます。" : "。100 XPで新スキルを習得。"}</p><div>${progress.filter((item) => item.canTrain).map((item) => `<button type="button" data-action="set-skill-training-target" data-skill-player="${player.id}" data-skill-target="${item.skillId}" class="${item.target ? "is-selected" : ""}">${item.short}</button>`).join("")}</div></div>` : ""}</article>`; }).join("")}</div></section>
      <section class="training-menu">${trainingOptions.map((option) => { const risk = this.simulation.trainingRiskReport(option.id); const recommended = option.id === recommendation.focus; return `<article class="training-option tactical-card ${option.accent} ${!canTrain ? "is-complete" : ""} ${recommended ? "is-recommended" : ""}"><span class="card-kicker">${!canTrain ? "WEEKLY LIMIT" : recommended ? "RECOMMENDED" : option.id === "recovery" ? "CONDITIONING" : "SKILL PROGRAM"}</span><h3>${option.label}</h3><p>${!canTrain ? "今週の練習枠を使い切りました。次節後に再開します。" : option.copy}</p><div><span>実施費用</span><b>${!canTrain ? "完了" : formatMoney(option.cost)}</b></div><small class="training-risk ${risk.grade === "高" ? "is-high" : risk.grade === "注意" ? "is-caution" : ""}">負傷リスク ${risk.chance}% / ${risk.grade}　${risk.note}</small><button data-action="train" data-training="${option.id}" class="${option.accent === "coral" ? "ghost-action" : "primary-action"}" ${!canTrain ? "disabled" : ""}>${!canTrain ? "今週は実施済み" : "このメニューを実施"} <b>${!canTrain ? "✓" : "↗"}</b></button></article>`; }).join("")}</section>
      <section class="training-history tactical-card"><div class="training-history-head"><div><span class="card-kicker">DEVELOPMENT LEDGER</span><h3>成長履歴</h3></div><span>${history.length} SESSIONS</span></div>${history.length ? `<div class="training-history-list">${history.map((entry) => `<article><div><span>W${entry.week}</span><b>${entry.label}</b><small>${entry.affected}人を対象</small></div><p>${entry.changes.length ? entry.changes.join(" / ") : "能力値の変動なし"}</p><strong class="${entry.fatigueChange > 0 ? "is-load" : "is-recovery"}">${entry.fatigueChange > 0 ? `疲労 +${entry.fatigueChange}` : `疲労 ${entry.fatigueChange}`}</strong></article>`).join("")}</div>` : `<p class="training-history-empty">まだ練習履歴はありません。メニューを実施すると、対象人数と能力・疲労の変動がここに記録されます。</p>`}</section>
    `;
  }

  private marketPage() {
    const negotiation = this.simulation.currentRecruitNegotiation;
    const candidate = this.simulation.currentMarketCandidate;
    const fit = this.simulation.currentMarketTacticalFit;
    const priorities = this.simulation.recruitmentPriorities;
    const candidateNeed = this.simulation.currentMarketRecruitmentMatch;
    const comparisons = this.simulation.marketCandidateComparison;
    const requestedPositions = this.simulation.selectedMarketPositions;
    const marketPositions: Player["position"][] = ["GK", "CB", "SB", "DM", "CM", "SH", "AM", "WG", "CF"];
    const nextRefreshWeek = this.simulation.marketNextRefreshWeek;
    const marketUpdate = this.simulation.marketUpdateNotice;
    const marketUpdateBanner = marketUpdate ? `<section class="market-update-alert tactical-card"><div><span class="card-kicker">MARKET INBOX / WEEK ${marketUpdate.week}</span><h3>新着候補が届きました</h3><p>${marketUpdate.requestedPositions.length ? `希望ポジション（${marketUpdate.requestedPositions.map(positionLabel).join(" / ")}）に一致する候補です。` : "3節ごとの市場更新で、新しい獲得候補が届きました。"}</p><div class="market-update-players">${marketUpdate.candidates.length ? marketUpdate.candidates.map((player) => `<span><b>${player.name}</b>${positionLabel(player.position)}${player.secondary ? ` / ${positionLabel(player.secondary)}` : ""}</span>`).join("") : "<span>現在の希望条件に一致する候補はいません。</span>"}</div></div><button type="button" data-action="dismiss-market-update" class="ghost-action">通知を確認 <b>✓</b></button></section>` : "";
    const marketRequestPanel = `<section class="market-request tactical-card"><div><span class="card-kicker">MARKET REQUEST LIST</span><h3>希望ポジションリスト</h3><p>選択内容は現在の候補に影響しません。第${nextRefreshWeek}節の市場更新時に、希望ポジションへ主適性または副適性を持つ選手だけをリストアップします。</p></div><div class="market-request-controls" aria-label="希望ポジションを選択">${marketPositions.map((position) => `<button type="button" data-action="set-market-preference" data-market-position="${position}" class="${requestedPositions.includes(position) ? "is-selected" : ""}">${positionLabel(position)}</button>`).join("")}</div><aside><span>NEXT UPDATE</span><b>第${nextRefreshWeek}節</b><small>${requestedPositions.length ? `希望：${requestedPositions.map(positionLabel).join(" / ")}` : "希望なし：全ポジション"}</small><button type="button" data-action="clear-market-preferences" ${requestedPositions.length ? "" : "disabled"}>すべて解除</button></aside></section>`;
    const contractAlerts = this.simulation.contractAlerts;
    const capacity = this.simulation.rosterCapacityStatus;
    const capacityAlert = capacity.warning ? `<section class="roster-capacity-alert tactical-card is-${capacity.tone}"><div><span class="card-kicker">SQUAD CAPACITY ALERT</span><h3>${capacity.full ? "登録上限に到達しています" : `保有枠の残りは ${capacity.remaining} 人です`}</h3><p>${capacity.full ? `${capacity.count} / ${capacity.limit}人です。市場との契約はできません。先にチーム画面で売却・契約整理を行ってください。` : `${capacity.count} / ${capacity.limit}人を保有しています。候補を獲得する前に、チーム画面で売却・契約整理の優先順位を確認しましょう。`}</p></div><button type="button" data-nav="team" class="ghost-action">チームで整理 <b>→</b></button></section>` : "";
    if (!candidate || !negotiation) return `${this.pageHeading("TRANSFER WINDOW", "市場を待つ", "次のスカウトサイクルを待ち、候補が届くのを待つ。")}${capacityAlert}${marketRequestPanel}<section class="tactical-card market-empty"><span class="card-kicker">SCOUTING CYCLE</span><h2>${requestedPositions.length ? "希望条件に合う候補を待っています" : "全候補と交渉済み"}</h2><p>${requestedPositions.length ? `第${nextRefreshWeek}節の更新で、${requestedPositions.map(positionLabel).join(" / ")}の候補を探します。希望ポジションはいつでも変更できます。` : "新たなシーズンに、次の市場候補が届きます。"}</p></section>`;
    const status = negotiation.stage === "scouting" ? "SCOUTED" : negotiation.stage === "countered" ? "COUNTER OFFER" : "FEE AGREED";
    const action = negotiation.stage === "scouting" ? `<button data-action="negotiate-recruit" class="primary-action">${formatMoney(negotiation.openingOffer)}を提示 <b>›</b></button>` : negotiation.stage === "countered" ? `<button data-action="negotiate-recruit" class="primary-action">対案 ${formatMoney(negotiation.counterOffer)}を受諾 <b>›</b></button>` : `<button data-action="recruit" class="primary-action">3年契約を締結 <b>›</b></button>`;
    const dealCopy = negotiation.stage === "scouting" ? `移籍金の初回提示は ${formatMoney(negotiation.openingOffer)}。交渉開始後、先方の対案を確認します。` : negotiation.stage === "countered" ? `相手クラブは ${formatMoney(negotiation.counterOffer)}を要求しています。合意後に本人との3年契約へ進めます。` : `クラブ間の移籍金は ${formatMoney(negotiation.agreedFee ?? negotiation.counterOffer)}で合意済み。年俸 ${formatMoney(candidate.salary)}の3年契約を提示できます。`;
    return `
      ${this.pageHeading("TRANSFER WINDOW", "市場で才能を見つける", "戦術に足りない最後のピースを、今ここで。")}
      ${capacityAlert}
      ${marketUpdateBanner}
      <section class="recruitment-board tactical-card"><div class="recruitment-board-head"><div><span class="card-kicker">SQUAD GAP ANALYSIS</span><h2>補強優先順位</h2><p>登録人数、稼働人数、能力、疲労・負傷、年齢、契約、現在のフォーメーション需要を集計しています。</p></div><b>LIVE<br/><small>RECALC</small></b></div><div class="recruitment-priority-list">${priorities.slice(0, 4).map((priority, index) => `<article class="priority-ticket ${priority.grade === "最優先" ? "urgent" : priority.grade === "高" ? "high" : ""}"><i>${String(index + 1).padStart(2, "0")}</i><div><span>${priority.grade} PRIORITY</span><h3>${positionLabel(priority.position)}<small> ${priority.score}</small></h3><p>${priority.reasons[0]}</p></div><aside><b>${priority.available}<small> / ${priority.demand || 1}</small></b><span>稼働 / 必要</span></aside></article>`).join("")}</div></section>
      ${marketRequestPanel}
      <section class="market-tools-grid"><article class="candidate-comparison tactical-card"><div class="market-tool-head"><div><span class="card-kicker">RECRUIT TARGET LIST / WEEK ${this.simulation.currentWeek}</span><h3>獲得候補リスト</h3></div><b>${comparisons.length} PROFILES</b></div><p class="market-list-note">${requestedPositions.length ? `次回は希望ポジション（${requestedPositions.map(positionLabel).join(" / ")}）に限定して更新` : "3節ごとに市場候補を更新"}　/　次回 第${nextRefreshWeek}節</p><p class="market-selection-note">候補をタップすると、下のスカウトレポートと交渉対象が切り替わります。現在選択中：<b>${candidate.name}</b></p><div class="candidate-compare-head"><span>候補</span><span>OF / DF</span><span>戦術</span><span>優先</span><span>移籍金</span></div>${comparisons.map((item) => `<button type="button" data-action="select-market-candidate" data-market-candidate="${item.player.id}" class="candidate-compare-row ${item.status === "閲覧中" ? "is-current" : ""}" aria-pressed="${item.status === "閲覧中"}"><strong><i>${item.status === "閲覧中" ? "NOW" : "VIEW"}</i>${item.player.name}<small>${positionLabel(item.player.position)}${item.player.secondary ? ` / ${positionLabel(item.player.secondary)}` : ""}　${item.player.age}歳</small></strong><span>${item.player.position === "GK" ? `GK ${item.player.gk}` : `OF ${item.player.attack}`}<small>DF ${item.player.defense}</small></span><span class="compare-fit">${item.tacticalFit.score}<small>${item.tacticalFit.grade}</small></span><span class="compare-priority ${item.recruitmentPriority.grade === "最優先" ? "urgent" : ""}">${positionLabel(item.recruitmentPriority.position)} ${item.recruitmentPriority.score}<small>${item.recruitmentPriority.grade}</small></span><span>${formatMoney(item.openingFee)}<small>年俸 ${formatMoney(item.annualImpact)}</small></span></button>`).join("")}</article></section>
      ${contractAlerts.length ? `<section class="contract-expiry-alert tactical-card"><div><span class="card-kicker">CONTRACT EXPIRY ALERT</span><h3>契約最終年の選手が ${contractAlerts.length} 名います。</h3><p>${contractAlerts.slice(0, 2).map((alert) => `${alert.player.name}（${positionLabel(alert.player.position)} / ${alert.urgency}）`).join("、")}${contractAlerts.length > 2 ? ` ほか${contractAlerts.length - 2}名` : ""}。更新費と後継候補を比較して判断してください。</p></div><button data-nav="team" class="ghost-action">契約デスクを開く <b>→</b></button></section>` : ""}
      <section class="market-feature tactical-card"><div class="market-image" style="background-image:linear-gradient(0deg,rgba(4,20,12,.82),rgba(4,20,12,.04)),url('${assets.scoutCard}')"><span>SCOUT REPORT</span></div><div class="market-details"><span class="card-kicker">PRIORITY TARGET / ${status}</span><h2>${candidate.name} <em>${positionLabel(candidate.position)}${candidate.secondary ? ` / ${positionLabel(candidate.secondary)}` : ""}</em></h2><p>${candidate.position === "GK" ? "反応とビルドアップを兼ね備えた将来性のある守護者。" : candidate.position === "CB" ? "最終ラインを整え、前進の起点にもなれるディフェンダー。" : candidate.position === "CF" ? "背後への抜け出しと決定力でゴール前を変える若きストライカー。" : "高い創造性と伸びしろを持つ攻撃的ミッドフィールダー。中盤からの決定的な一手を加える。"}</p><div class="market-stats"><span><b>${candidate.position === "GK" ? `GK ${candidate.gk}` : `OF ${candidate.attack}`}</b>OFFENSE</span><span><b>DF ${candidate.defense}</b>DEFENSE</span><span><b>${candidate.age}</b>AGE</span><span><b>Lv.${candidate.level}/${candidate.ceiling}</b>GROWTH</span></div>${candidateNeed ? `<div class="candidate-need-match"><span>CANDIDATE NEED MATCH</span><b>${candidateNeed.note}</b><small>${positionLabel(candidateNeed.priority.position)}補強優先度 ${candidateNeed.score} / 稼働 ${candidateNeed.priority.available}人 / 戦力平均 ${candidateNeed.priority.averagePower}</small></div>` : ""}${fit ? `<section class="tactical-fit-report"><div class="fit-report-head"><div><span>TACTICAL FIT / ${fit.grade}</span><h3>現行プランとの戦術適合</h3><p>${fit.formationLabel} / ${fit.mentalityLabel} / ${fit.playingStyleLabel} を基準に再評価。</p></div><strong>${fit.score}<small>/100</small></strong></div><div class="fit-breakdown"><span><b style="width:${fit.formation}%"></b><i>FORMATION</i><em>${fit.formation}</em></span><span><b style="width:${fit.mentality}%"></b><i>MENTALITY</i><em>${fit.mentality}</em></span><span><b style="width:${fit.playingStyle}%"></b><i>STYLE</i><em>${fit.playingStyle}</em></span><span><b style="width:${fit.chemistry}%"></b><i>CHEMISTRY</i><em>${fit.chemistry}</em></span></div><ul class="fit-strengths">${fit.strengths.map((strength) => `<li>${strength}</li>`).join("")}</ul><p class="fit-concern"><b>SCOUT NOTE</b>${fit.concern}</p></section>` : ""}<div class="market-deal-strip"><span>SCOUT REPORT / ${this.simulation.marketQualityNote}</span><b>${negotiation.stage === "agreed" ? formatMoney(negotiation.agreedFee ?? negotiation.counterOffer) : negotiation.stage === "countered" ? formatMoney(negotiation.counterOffer) : formatMoney(negotiation.openingOffer)}</b><small>${dealCopy}</small></div><div class="market-footer"><p>年俸 <b>${formatMoney(candidate.salary)}</b>　/　契約期間 <b>3年</b>　/　候補更新 <b>あと${this.simulation.marketRefreshIn}週</b></p>${action}</div></div></section>
    `;
  }

  private academyPage() {
    const prospects = this.simulation.youthAcademyPlayers;
    const ready = prospects.filter((player) => player.academyWeeks >= 3).length;
    return `
      ${this.pageHeading("ORBIT ACADEMY", "未来の戦力を磨く", "今日の育成が、数シーズン後の勝利をつくる。")}
      <section class="academy-command tactical-card"><div><span class="card-kicker">YOUTH DEVELOPMENT DESK</span><h2>ユース育成プログラム</h2><p>セッションごとにユース全員の役割能力を鍛えます。3セッションを終えた選手は、トップチームへの昇格候補です。${this.simulation.youthIntakeForecast ? ` 空いた${this.simulation.youthIntakeForecast}枠は、来季に新人候補で補充されます。` : ""}</p></div><div class="academy-command-stats"><span>育成中<b>${prospects.length}<small> PLAYERS</small></b></span><span>昇格可能<b>${ready}<small> READY</small></b></span><span>実施費<b>−${formatMoney(this.simulation.youthTrainingCost)}</b></span></div><button data-action="develop-youth" class="primary-action" ${prospects.length ? "" : "disabled"}>育成セッションを実施 <b>↗</b></button></section>
      <section class="academy-grid">${prospects.length ? prospects.map((player, index) => { const readiness = Math.min(100, Math.round(player.academyWeeks / 3 * 100)); const tendency = player.youthSkillTendency; const progress = this.simulation.skillProgressFor(player); const focused = this.simulation.skillTrainingTargetFor(player); const primary = tendency ? playerSkillCatalog[tendency.primarySkill] : null; const development = tendency ? playerSkillCatalog[tendency.developmentSkill] : focused ? playerSkillCatalog[focused.skillId] : null; const recommended = tendency ? trainingOptions.find((option) => option.id === tendency.recommendedFocus)?.label ?? tendency.recommendedFocus : focused?.trainingLabels[0] ?? "個別育成"; const focusChoices = progress.filter((item) => item.canTrain).slice(0, 3); const tendencyPanel = tendency && focused ? `<section class="academy-skill-blueprint"><div class="academy-blueprint-head"><span>SKILL BLUEPRINT</span><b>${tendency.growthPace}</b></div><h4>${tendency.archetype}</h4><p>${tendency.headline}</p><div class="academy-skill-pair"><span><i>BASE</i><b>${primary?.short} ${primary?.label}</b></span><span><i>FOCUS</i><b>${development?.short} ${development?.label}</b></span></div><div class="academy-focus-progress"><div><span>重点XP <b>${focused.xp} / ${focused.nextXp ?? 210}</b></span><small>推奨 ${recommended}</small></div><i><em style="width:${focused.progress}%"></em></i></div><p class="academy-coach-note"><b>COACH PLAN</b>${tendency.coachNote}</p><div class="academy-focus-choices">${focusChoices.map((item) => `<button type="button" data-action="set-youth-skill-training-target" data-youth-skill-player="${player.id}" data-youth-skill-target="${item.skillId}" class="${item.target ? "is-active" : ""}"><b>${item.short}</b><span>${item.label}</span></button>`).join("")}</div><small class="academy-promotion-note">昇格時、初期スキル・XP・重点方針をトップチームへ引き継ぎます。</small></section>` : ""; return `<article class="academy-player tactical-card"><div class="academy-number">0${index + 1}</div><span class="card-kicker">ACADEMY / ${positionLabel(player.position)}</span><h3>${player.name}</h3><p>${player.secondary ? `${positionLabel(player.position)} / ${positionLabel(player.secondary)}` : `${positionLabel(player.position)}専門`}　${player.age}歳　Lv.${player.level}/${player.ceiling}</p><div class="academy-skills"><span>OF <b>${player.attack}</b></span><span>DF <b>${player.defense}</b></span><span>${player.position === "GK" ? "GK" : "POT"} <b>${player.position === "GK" ? player.gk ?? 0 : player.ceiling}</b></span></div>${tendencyPanel}<div class="academy-progress"><span>育成セッション <b>${player.academyWeeks} / 3</b></span><i><em style="width:${readiness}%"></em></i></div>${player.academyWeeks >= 3 ? `<button data-action="promote-youth" data-youth="${player.id}" class="primary-action">トップ昇格 <b>−${formatMoney(180000)}</b></button>` : `<button class="ghost-action" disabled>昇格まであと ${3 - player.academyWeeks} セッション</button>`}</article>`; }).join("") : `<article class="academy-empty tactical-card"><span class="card-kicker">ACADEMY REPORT</span><h3>現在のユースは全員昇格済みです。</h3><p>シーズンの節目に、新たな才能がアカデミーへ加わります。</p></article>`}</section>
    `;
  }

  private facilitiesPage() {
    const facility = this.simulation.concessionFacility;
    const scout = this.simulation.scoutFacility;
    const training = this.simulation.trainingFacility;
    const forecast = this.simulation.upcomingConcessionForecast;
    const items = [["メディカルルーム", "Lv. 1", "週ごとの疲労回復 +2", "改修候補"]];
    return `
      ${this.pageHeading("CLUB INFRASTRUCTURE", "クラブの土台を育てる", "今日の投資が、数年後のタイトルをつくる。")}
      <section class="concession-command tactical-card"><div><span class="card-kicker">MATCHDAY HOSPITALITY / LEVEL ${facility.level}</span><h2>${facility.name}</h2><p>ホーム戦の来場者へ、飲食・売店サービスを提供する収益施設。人気と観客数が購買需要をつくり、改修により提供能力と客単価が伸びます。</p></div><div class="concession-command-stats"><span>提供上限<b>${facility.capacity.toLocaleString()}<small> PEOPLE</small></b></span><span>購買補正<b>+${Math.round(facility.purchaseBonus * 100)}<small>%</small></b></span><span>客単価補正<b>+${formatMoney(facility.spendBonus)}</b></span></div><div class="concession-forecast"><span>NEXT HOME FORECAST</span><b>${forecast.isHome ? `+ ${formatMoney(forecast.revenue)}` : "次のホーム戦で営業"}</b><small>${forecast.isHome ? `${forecast.customers.toLocaleString()}人 / 上限 ${forecast.capacity.toLocaleString()}人` : "ホーム日程に合わせて売店が開きます"}</small></div><button data-action="upgrade-concession" class="${facility.nextCost ? "primary-action" : "ghost-action"}" ${facility.nextCost ? "" : "disabled"}>${facility.nextCost ? `${facility.nextName}へ改修` : "最高レベル"}<b>${facility.nextCost ? `+ ${formatMoney(facility.nextCost)}` : "✓"}</b></button></section>
      <section class="scout-command tactical-card"><div><span class="card-kicker">SCOUTING NETWORK / LEVEL ${scout.level}</span><h2>${scout.name}</h2><p>${scout.note} 次の市場候補には能力 +${scout.ratingBoost}、上限 +${scout.ceilingBoost} が反映されます。</p></div><div class="scout-command-stats"><span>候補能力<b>+${scout.ratingBoost}<small> RATING</small></b></span><span>上限補正<b>+${scout.ceilingBoost}<small> CEILING</small></b></span><span>更新周期<b>${this.simulation.marketRefreshIn}<small> WEEKS</small></b></span></div><button data-action="upgrade-scout" class="${scout.nextCost ? "primary-action" : "ghost-action"}" ${scout.nextCost ? "" : "disabled"}>${scout.nextCost ? `${scout.nextName}へ拡張` : "最高レベル"}<b>${scout.nextCost ? `− ${formatMoney(scout.nextCost)}` : "✓"}</b></button></section>
      <section class="training-facility-command tactical-card"><div><span class="card-kicker">PERFORMANCE CENTER / LEVEL ${training.level}</span><h2>${training.name}</h2><p>${training.note} 練習画面では残り枠と負傷リスクを確認して、メニューの負荷を調整できます。</p></div><div class="training-facility-stats"><span>週次練習枠<b>${training.weeklySlots}<small> SESSIONS</small></b></span><span>成長補正<b>+${training.growthBonus}<small> PER SKILL</small></b></span><span>負傷リスク<b>−${training.riskReduction}<small>%</small></b></span></div><button data-action="upgrade-training" class="${training.nextCost ? "primary-action" : "ghost-action"}" ${training.nextCost ? "" : "disabled"}>${training.nextCost ? `${training.nextName}へ改修` : "最高レベル"}<b>${training.nextCost ? `− ${formatMoney(training.nextCost)}` : "✓"}</b></button></section>
      <section class="facility-grid">${items.map(([title, level, copy, status], index) => `<article class="facility-card tactical-card"><div class="facility-number">0${index + 1}</div><span class="card-kicker">${status}</span><h2>${title}</h2><strong>${level}</strong><p>${copy}</p><button class="ghost-action" disabled>設備を確認</button></article>`).join("")}</section>
    `;
  }

  private financePage() {
    const finance = this.simulation.financialSummary;
    const colors: Record<string, string> = { "繰越資金": "#d9ff4a", "試合賞金": "#f5c955", "スポンサー": "#b8e83a", "入場料": "#f5c955", "グッズ": "#ff9b73", "会員費": "#6ad7ff", "売店・飲食": "#86c9ff", "移籍": "#ff7d52", "トレーニング": "#c793ff", "年俸": "#ff7d52", "契約更新": "#ff9b73", "出来高": "#6ad7ff", "施設投資": "#ff7d52", "育成": "#d9ff4a", "シーズン報奨金": "#d9ff4a" };
    const maxTrail = Math.max(...finance.cashTrail, 1);
    const maxIncome = Math.max(...finance.incomeBreakdown.map((entry) => entry.amount), 1);
    const maxExpense = Math.max(...finance.expenseBreakdown.map((entry) => entry.amount), 1);
    const summaryRows = [["総収入", finance.incomeTotal, "income"], ["総費用", finance.expenseTotal, "expense"], ["純増額", finance.net, finance.net >= 0 ? "income" : "expense"], ["今週の収支", finance.currentWeekIncome - finance.currentWeekExpense, finance.currentWeekIncome >= finance.currentWeekExpense ? "income" : "expense"]] as const;
    return `
      ${this.pageHeading("FINANCIAL CONTROL", "クラブ財務ダッシュボード", "収益の源泉と投資の余力を、一枚の戦術ボードで把握する。")}
      <section class="finance-hero tactical-card"><div><span class="card-kicker">AVAILABLE CASH / SEASON ${this.simulation.completedWeeks} WEEKS</span><h2>${formatMoney(finance.cash)}</h2><p>手元資金は、ホーム戦の集客、スポンサー契約、週次年俸、クラブ設備への投資によって変動します。数字を確認して次の一手を決めましょう。</p></div><div class="finance-hero-stat"><span>今週の収入</span><b>+${formatMoney(finance.currentWeekIncome)}</b><small>今週の費用 ${formatMoney(finance.currentWeekExpense)}</small></div><div class="finance-hero-stat salary"><span>週次年俸</span><b>−${formatMoney(this.simulation.weeklySalary)}</b><small>年間 ${formatMoney(this.simulation.annualSalary)}</small></div><div class="finance-hero-stat"><span>財務純増</span><b class="${finance.net >= 0 ? "is-positive" : "is-negative"}">${finance.net >= 0 ? "+" : ""}${formatMoney(finance.net)}</b><small>シーズン累計の収支</small></div></section>
      <section class="finance-summary-grid">${summaryRows.map(([label, value, tone]) => `<article class="finance-summary tactical-card ${tone}"><span>${label}</span><b>${value >= 0 ? (label === "総費用" ? "−" : "+") : ""}${formatMoney(Math.abs(value))}</b><small>${label === "今週の収支" ? `第${this.simulation.completedWeeks}節まで` : "シーズン累計"}</small></article>`).join("")}</section>
      <section class="finance-layout"><article class="tactical-card cashflow-card"><div class="finance-section-head"><div><span class="card-kicker">CASH POSITION</span><h3>資金推移</h3></div><b>${finance.cashTrail.length} POINTS</b></div><div class="cash-bars">${finance.cashTrail.map((value, index) => `<div class="cash-bar"><i style="height:${Math.max(12, Math.round(value / maxTrail * 100))}%"></i><span>${index === finance.cashTrail.length - 1 ? "NOW" : `#${index + 1}`}</span></div>`).join("")}</div><div class="cash-axis"><span>最小 ${formatMoney(Math.min(...finance.cashTrail))}</span><b>現在 ${formatMoney(finance.cash)}</b><span>最大 ${formatMoney(maxTrail)}</span></div></article><article class="tactical-card finance-guide"><span class="card-kicker">OPERATING NOTE</span><h3>収支の見方</h3><p>チケット、グッズ、売店・飲食はホーム戦でのみ拡大します。ファンクラブ会費とスポンサー収入は毎週の基礎収入です。施設・選手・トレーニングへの投資は、将来の成果と収益の土台になります。</p><button data-nav="facilities" class="ghost-action">施設投資を確認 <b>→</b></button></article></section>
      <section class="finance-breakdown-grid"><article class="tactical-card finance-breakdown"><div class="finance-section-head"><div><span class="card-kicker">REVENUE MIX</span><h3>収益構成</h3></div><b>+${formatMoney(finance.incomeTotal)}</b></div><div class="finance-rows">${finance.incomeBreakdown.length ? finance.incomeBreakdown.map((entry) => `<div class="finance-row"><span><i style="background:${colors[entry.category]}"></i>${entry.category}</span><div><b style="width:${Math.max(4, Math.round(entry.amount / maxIncome * 100))}%;background:${colors[entry.category]}"></b></div><strong>+${formatMoney(entry.amount)}</strong></div>`).join("") : `<p class="finance-empty">まだ収益データがありません。</p>`}</div></article><article class="tactical-card finance-breakdown expense"><div class="finance-section-head"><div><span class="card-kicker">INVESTMENT & COST</span><h3>費用構成</h3></div><b>−${formatMoney(finance.expenseTotal)}</b></div><div class="finance-rows">${finance.expenseBreakdown.length ? finance.expenseBreakdown.map((entry) => `<div class="finance-row"><span><i style="background:${colors[entry.category]}"></i>${entry.category}</span><div><b style="width:${Math.max(4, Math.round(entry.amount / maxExpense * 100))}%;background:${colors[entry.category]}"></b></div><strong>−${formatMoney(entry.amount)}</strong></div>`).join("") : `<p class="finance-empty">まだ投資・費用データがありません。</p>`}</div></article></section>
      <section class="tactical-card ledger-card"><div class="finance-section-head"><div><span class="card-kicker">LATEST LEDGER</span><h3>直近の収支</h3></div><b>${finance.recentEntries.length} ENTRIES</b></div><div class="ledger-head"><span>節</span><span>区分</span><span>内容</span><span>金額</span></div>${finance.recentEntries.map((entry) => `<div class="ledger-row ${entry.kind}"><span>W${entry.week}</span><span><i style="background:${colors[entry.category]}"></i>${entry.category}</span><p>${entry.note}</p><strong>${entry.kind === "income" ? "+" : "−"}${formatMoney(entry.amount)}</strong></div>`).join("")}</section>
    `;
  }

  private gateReceipt(gate: GateReceipt, prefix = "LEAGUE GATE") {
    if (!gate.isHome) return `<div class="gate-receipt is-away"><span>${prefix}</span><b>AWAY MATCH</b><em>入場料収入なし</em></div>`;
    return `<div class="gate-receipt"><span>${prefix} / HOME</span><b>${gate.attendance.toLocaleString()}<small> / ${gate.capacity.toLocaleString()} PEOPLE</small></b><em>チケット ${formatMoney(gate.ticketPrice)}　<strong>+ ${formatMoney(gate.revenue)}</strong></em></div>`;
  }

  private commerceReceipt(merchandise: MerchandiseReceipt, membership: MembershipReceipt) {
    const goods = merchandise.isHome ? `<div class="commerce-receipt goods"><span>GOODS / HOME</span><b>${merchandise.buyers.toLocaleString()}<small> BUYERS</small></b><em>平均 ${formatMoney(merchandise.averageSpend)}　<strong>+ ${formatMoney(merchandise.revenue)}</strong></em></div>` : `<div class="commerce-receipt is-away"><span>GOODS / AWAY</span><b>STADIUM CLOSED</b><em>アウェー戦のため販売なし</em></div>`;
    return `<section class="commerce-receipts">${goods}<div class="commerce-receipt membership"><span>FAN CLUB / WEEKLY</span><b>${membership.members.toLocaleString()}<small> MEMBERS</small></b><em>会費 ${formatMoney(membership.weeklyFee)}　<strong>+ ${formatMoney(membership.revenue)}</strong></em></div></section>`;
  }

  private concessionReceipt(concession: ConcessionReceipt, prefix = "FOOD & DRINK") {
    if (!concession.isHome) return `<div class="commerce-receipt is-away concession"><span>${prefix} / AWAY</span><b>STANDS CLOSED</b><em>アウェー戦のため売店営業なし</em></div>`;
    return `<div class="commerce-receipt concession"><span>${prefix} / LV.${concession.level}</span><b>${concession.customers.toLocaleString()}<small> CUSTOMERS</small></b><em>平均 ${formatMoney(concession.averageSpend)}　<strong>+ ${formatMoney(concession.revenue)}</strong></em></div>`;
  }

  private highlightsTimeline(highlights: NonNullable<ReturnType<ClubSimulation["advanceWeek"]>>["highlights"], throughHalf: boolean, visibleCount?: number) {
    const visible = highlights.filter((item) => throughHalf ? item.minute <= 45 : item.minute > 45 && item.kind !== "fulltime");
    const shown = visibleCount === undefined ? visible : visible.slice(0, visibleCount);
    const line = (item: MatchHighlight) => `<article class="highlight-item ${item.team} ${item.kind}"><b>${String(item.minute).padStart(2, "0")}′</b><span>${item.kind === "goal" ? "GOAL" : item.kind === "action" ? "PLAY" : item.kind === "injury" ? "MED" : item.kind === "tactic" ? "PLAN" : item.kind === "halftime" ? "HT" : "•"}</span><p>${item.text}</p></article>`;
    return `<section class="highlight-timeline ${visibleCount === undefined ? "" : "is-live"}" aria-live="polite">${visibleCount === undefined ? shown.map(line).join("") : `<small>LIVE FEED / ${visibleCount} of ${visible.length}</small>${shown.map(line).join("")}`}</section>`;
  }

  private liveCommentaryStatus(result: NonNullable<ReturnType<ClubSimulation["advanceWeek"]>>, phase: "first-half" | "second-half") {
    const total = this.commentaryItems(result, phase).length;
    const label = phase === "first-half" ? "前半" : "後半";
    return `<section class="live-commentary-status"><div><span><i></i>LIVE COMMENTARY</span><b>${label}の実況を受信中</b><small>${this.commentaryVisibleCount} / ${total} 行目　次のコメントまで2秒</small></div></section>`;
  }

  private halfTimeModal(result: NonNullable<ReturnType<ClubSimulation["advanceWeek"]>>) {
    const report = result.halfTime;
    const displayScore = this.displayedMatchScore(result);
    const mentality = this.halfTimeMentality ?? result.tactics.mentality;
    const style = this.halfTimeStyle ?? result.tactics.playingStyle;
    const starters = this.simulation.rosterPlayers.filter((player) => Object.values(this.simulation.lineupState).includes(player.id));
    const bench = this.simulation.rosterPlayers.filter((player) => !Object.values(this.simulation.lineupState).includes(player.id));
    const halfTimeInjuries = result.injuries.filter((injury) => injury.minute <= 45);
    const slots = this.simulation.lineupState;
    const pendingSlot = this.halfTimePendingOut ? Object.entries(slots).find(([, playerId]) => playerId === this.halfTimePendingOut)?.[0] : null;
    const substitutionsRemaining = this.simulation.maxSubstitutions - this.halfTimeChanges.length;
    const changes = this.halfTimeChanges.map((change, index) => {
      const outgoing = this.simulation.rosterPlayers.find((player) => player.id === change.outPlayerId);
      const incoming = this.simulation.rosterPlayers.find((player) => player.id === change.inPlayerId);
      return `<button data-half-remove="${index}" class="change-chip">${outgoing?.name ?? "—"} <i>→</i> ${incoming?.name ?? "—"}<b>×</b></button>`;
    }).join("");
    const liveFirstHalf = this.commentaryPhase === "first-half";
    return `<div class="match-overlay">
      <section class="match-modal halftime-modal" style="background-image:linear-gradient(180deg,rgba(3,15,10,.35),rgba(3,15,10,.95)),url('${assets.commandCenter}')">
        <span class="modal-kicker">${liveFirstHalf ? "LIVE FIRST HALF" : "HALF TIME"} / WEEK ${this.simulation.completedWeeks}</span>
        <div class="match-crests"><div><img src="${assets.clubMark}" alt=""/><b>${escapeHtml(this.simulation.clubNameValue)}</b></div><strong>${displayScore.playerGoals}<i>-</i>${displayScore.opponentGoals}</strong><div><span class="opponent-crest">◉</span><b>${result.opponent}</b></div></div>
        <p>${report.message}</p>
        <section class="match-live-top" aria-live="polite"><span class="match-live-top-label">LATEST HIGHLIGHT</span>${liveFirstHalf ? this.liveCommentaryStatus(result, "first-half") : "<strong>HALF-TIME FEED</strong>"}${this.highlightsTimeline(result.highlights, true, liveFirstHalf ? this.commentaryVisibleCount : undefined)}</section>
        <section class="half-time-brief"><span>TACTICAL BRIEF</span><b>${report.tacticalNote}</b><p>${report.recommendation}</p></section>${this.matchConditionBoard(result.matchCondition)}
        ${liveFirstHalf ? "" : ""}
        ${halfTimeInjuries.length ? `<section class="injury-alert"><span>MEDICAL ALERT</span><b>${halfTimeInjuries.map((injury) => `${injury.player}：${injury.detail}`).join("<br/>")}</b><p>負傷選手の交代を完了するまで後半は開始できません。</p></section>` : ""}
        <section class="half-time-command">
          <div class="half-command-head"><span>SECOND-HALF COMMAND</span><b>後半の采配</b><small>交代枠 残り ${substitutionsRemaining} / ${this.simulation.maxSubstitutions}</small></div>
          <div class="half-tactic-row"><div><i>MENTALITY</i>${mentalityOptions.map((item) => `<button data-half-mentality="${item.id}" class="half-tactic ${mentality === item.id ? "is-selected" : ""}">${item.label}<small>攻${signed(item.attack)} / 守${signed(item.defense)}</small></button>`).join("")}</div><div><i>STYLE</i>${playingStyleOptions.map((item) => `<button data-half-style="${item.id}" class="half-tactic style ${style === item.id ? "is-selected" : ""}">${item.label}<small>攻${signed(item.attack)} / 守${signed(item.defense)}</small></button>`).join("")}</div></div>
          <div class="substitution-desk"><div class="sub-heading"><span>SUBSTITUTIONS</span><b>${this.halfTimeChanges.length} / ${this.simulation.maxSubstitutions}</b></div><p>${this.halfTimePendingOut ? `${this.simulation.rosterPlayers.find((player) => player.id === this.halfTimePendingOut)?.name ?? "選手"} に替えて入れる、適性のあるベンチ選手を選択してください。` : "疲労60以上は注意、80以上は危険です。先に交代させるスタメンを選択してください。"}</p><div class="sub-columns"><div><i>ON PITCH</i><div class="sub-player-list">${starters.map((player) => { const injured = halfTimeInjuries.some((injury) => injury.playerId === player.id); const condition = injured ? "injured" : player.fatigue >= 80 ? "danger" : player.fatigue >= 60 ? "warning" : ""; return `<button data-half-out="${player.id}" class="sub-player ${condition} ${this.halfTimePendingOut === player.id ? "is-selected" : ""} ${this.halfTimeChanges.some((item) => item.outPlayerId === player.id) ? "is-queued" : ""}" ${this.halfTimeChanges.some((item) => item.outPlayerId === player.id) || substitutionsRemaining <= 0 ? "disabled" : ""}><b>${player.name}${injured ? " / 負傷" : ""}</b><small>${positionLabel(player.position)} / 疲 ${player.fatigue}${player.fatigue >= 80 ? "・危険" : player.fatigue >= 60 ? "・注意" : ""}</small></button>`; }).join("")}</div></div><div><i>BENCH</i><div class="sub-player-list">${bench.map((player) => { const unavailable = this.simulation.injuryWeeksFor(player.id) > 0; const eligible = Boolean(pendingSlot && this.simulation.playerIsFit(player, pendingSlot)); return `<button data-half-in="${player.id}" class="sub-player bench ${unavailable ? "injured" : ""} ${this.halfTimeChanges.some((item) => item.inPlayerId === player.id) ? "is-queued" : ""}" ${!this.halfTimePendingOut || !eligible || unavailable || this.halfTimeChanges.some((item) => item.inPlayerId === player.id) || substitutionsRemaining <= 0 ? "disabled" : ""}><b>${player.name}${unavailable ? " / 離脱中" : ""}</b><small>${positionLabel(player.position)} / 疲 ${player.fatigue}${!unavailable && pendingSlot && !eligible ? "・適性外" : ""}</small></button>`; }).join("")}</div></div></div><div class="change-queue">${changes || "<span>交代なし</span>"}</div></div>
        </section>
        <button data-action="continue-half" class="primary-action" ${liveFirstHalf ? "disabled" : ""}>${liveFirstHalf ? "実況を受信中…" : "後半を開始"} <b>▶</b></button>
      </section>
    </div>`;
  }

  private matchModal() {
    const result = this.simulation.lastResult;
    if (!result) return "";
    if (this.matchStage === "halftime") return this.halfTimeModal(result);
    const liveSecondHalf = this.commentaryPhase === "second-half";
    const displayScore = this.displayedMatchScore(result);
    const displayPlayerGoals = displayScore.playerGoals;
    const displayOpponentGoals = displayScore.opponentGoals;
    const mvp = result.mvp ? `<section class="mvp-card"><span>PLAYER OF THE MATCH</span><b>${result.mvp.rating.toFixed(1)}</b><div><strong>${result.mvp.player}</strong><small>${positionLabel(result.mvp.position)} / ${result.mvp.goals ? `${result.mvp.goals} GOAL` : result.mvp.assists ? `${result.mvp.assists} ASSIST` : result.mvp.note}</small></div></section>` : "";
    const ratings = result.playerRatings.length ? `<section class="player-ratings"><div><span>PLAYER RATINGS</span><b>${result.playerRatings.length} PLAYERS</b></div>${result.playerRatings.slice(0, 8).map((player) => `<article class="rating-row ${player.injured ? "injured" : ""}"><strong>${surname(player.player)}<small>${positionLabel(player.position)}</small></strong><span>${player.goals ? `${player.goals}G` : ""}${player.assists ? `${player.assists}A` : ""}${player.injured ? "MED" : ""}</span><p>${player.note}</p><b>${player.rating.toFixed(1)}</b></article>`).join("")}</section>` : "";
    const duels = result.markDuels.length ? `<section class="mark-duel-report"><div class="mark-duel-head"><div><span>MARK DUEL REPORT</span><b>対人局面の振り返り</b></div><aside><i class="win">勝利 ${result.markDuels.filter((duel) => duel.outcome === "勝利").length}</i><i class="even">拮抗 ${result.markDuels.filter((duel) => duel.outcome === "拮抗").length}</i><i class="loss">苦戦 ${result.markDuels.filter((duel) => duel.outcome === "苦戦").length}</i></aside></div><p>自クラブの最終スタメンと相手の対応関係を、試合採点・対人能力・結果から再評価。</p><div class="mark-duel-list">${result.markDuels.map((duel) => `<article class="mark-duel-row ${duel.outcome === "勝利" ? "win" : duel.outcome === "苦戦" ? "loss" : "even"}"><div class="duel-player"><span>${positionLabel(duel.position)} / ORBIT</span><strong>${surname(duel.player)}</strong><small>採点 ${duel.rating.toFixed(1)}</small></div><div class="duel-battle"><b>${duel.outcome}</b><i><em style="width:${duel.activity}%"></em></i><small>活躍度 ${duel.activity} / 対決 ${duel.engagements}回・${duel.activityGrade}</small></div><div class="duel-opponent"><span>vs ${positionLabel(duel.opponentPosition)} / ${duel.opponentRole}</span><strong>${surname(duel.opponent)}</strong><small>対人差 ${signed(duel.differential)}</small></div><p>${duel.summary}</p></article>`).join("")}</div></section>` : "";
    const individualBonuses = result.individualBonuses.total ? `<section class="individual-bonus-receipt"><div><span>INDIVIDUAL BONUS</span><b>−${formatMoney(result.individualBonuses.total)}</b></div>${result.individualBonuses.entries.map((entry) => `<p><strong>${surname(entry.player)}</strong><span>${entry.appearance ? `出場 ${formatMoney(entry.appearance)}` : ""}${entry.goals ? `${entry.appearance ? " / " : ""}${entry.goals / Math.max(1, this.simulation.rosterPlayers.find((player) => player.id === entry.playerId)?.goalBonus ?? 1)}得点 ${formatMoney(entry.goals)}` : ""}</span><b>−${formatMoney(entry.amount)}</b></p>`).join("")}</section>` : "";
    return `<div class="match-overlay"><section class="match-modal ${liveSecondHalf ? "live-match-modal" : ""}" style="background-image:linear-gradient(180deg,rgba(3,15,10,.35),rgba(3,15,10,.95)),url('${assets.commandCenter}')"><span class="modal-kicker">${liveSecondHalf ? "LIVE SECOND HALF" : "FULL TIME"} / WEEK ${this.simulation.completedWeeks}</span><div class="match-crests"><div><img src="${assets.clubMark}" alt=""/><b>${escapeHtml(this.simulation.clubNameValue)}</b></div><strong>${displayPlayerGoals}<i>-</i>${displayOpponentGoals}</strong><div><span class="opponent-crest">◉</span><b>${result.opponent}</b></div></div><p>${liveSecondHalf ? "後半のプレーを実況で追跡中。最後の一行まで、戦況はまだ決まらない。" : result.message}</p>${liveSecondHalf ? `<section class="match-live-top" aria-live="polite"><span class="match-live-top-label">LATEST HIGHLIGHT</span>${this.liveCommentaryStatus(result, "second-half")}${this.highlightsTimeline(result.highlights, false, this.commentaryVisibleCount)}</section>` : `<section class="match-live-top" aria-live="polite"><span class="match-live-top-label">MATCH HIGHLIGHTS</span>${this.highlightsTimeline(result.highlights, false)}</section><section class="match-tactics"><span>GAME PLAN</span><b>${result.tactics.formationLabel} / ${result.tactics.formationTrait} / ${result.tactics.mentalityLabel}</b><p>${result.tactics.playingStyleLabel}　連携 ${result.tactics.chemistry}%　攻 ${signed(result.tactics.attackModifier)} / 守 ${signed(result.tactics.defenseModifier)}<br/>${result.tactics.sideLinkDetails.length ? `WIDE LINK-UP　攻 ${signed(result.tactics.sideLinkAttack)} / 守 ${signed(result.tactics.sideLinkDefense)}` : "WIDE LINK-UP　未発動"}<br/>${result.tactics.midfieldPressDetail.active ? `MIDFIELD PRESS　${result.tactics.midfieldPressDetail.grade}　攻 ${signed(result.tactics.midfieldPressAttack)} / 守 ${signed(result.tactics.midfieldPressDefense)}` : "MIDFIELD PRESS　準備中"}<br/><strong>OPPOSITION　${result.opponentTactics.formationLabel} / ${result.opponentTactics.mentalityLabel} / ${result.opponentTactics.playingStyleLabel}</strong><br/>${result.opponentTactics.trait}　${result.opponentTactics.roles.slice(0, 3).join(" / ")}<br/>MATCH-UP ${result.tacticalMatchup.label}　自 攻 ${signed(result.tacticalMatchup.playerAttackModifier)} / 守 ${signed(result.tacticalMatchup.playerDefenseModifier)}</p></section>${mvp}${ratings}${duels}${individualBonuses}${this.gateReceipt(result.gate)}${result.cupResult ? this.gateReceipt(result.cupResult.gate, `CUP ${result.cupResult.round}`) : ""}${this.commerceReceipt(result.merchandise, result.membership)}<section class="concession-receipts">${this.concessionReceipt(result.concession)}${result.cupResult ? this.concessionReceipt(result.cupResult.concession, `CUP FOOD`) : ""}</section><div class="reward-line"><span>PRIZE MONEY</span><b>+ ${formatMoney(result.reward)}</b>${result.sponsorRevenue ? `<span>PARTNER</span><b>+ ${formatMoney(result.sponsorRevenue)}</b>` : ""}${result.cupResult ? `<span>CUP ${result.cupResult.round}</span><b>+ ${formatMoney(result.cupResult.reward)}</b>` : ""}<span>FANS</span><b>${result.popularityDelta >= 0 ? "+" : ""}${result.popularityDelta} → ${result.popularity}%</b><span>FAME</span><b>+ ${result.won ? 11 : result.playerGoals === result.opponentGoals ? 4 : 1}</b></div><button data-action="close-modal" class="primary-action">戦術室へ戻る <b>→</b></section>`}</section></div>`;
  }
}
