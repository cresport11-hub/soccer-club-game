# Structure: タッチライン戦術室

## 役割分担

Reactはアプリケーションの額縁として、ゲームキャンバスを1回だけマウントする。Babylon.jsは背景となるスタジアムシーン、ピッチ、照明、ボール、試合演出を描画する。クラブ運営のルールは `client/src/game/` 配下のフレームワーク非依存のTypeScriptとして保持する。ゲームUIはキャンバス上に重ねる独立したDOM HUDとして構成し、ゲーム状態の変更はすべて `ClubSimulation` を経由する。

## モジュール

| パス | 責務 |
| --- | --- |
| `client/src/components/GameCanvas.tsx` | Engineの生成、描画ループ、リサイズ、破棄を管理する。 |
| `client/src/game/scene.ts` | BabylonシーンとDOM HUDを接続し、`GameHandle`を返す。 |
| `client/src/game/ClubSimulation.ts` | 選手、スタメン、資金、週、試合、順位表、保存を管理する。 |
| `client/src/game/data.ts` | 架空の選手・クラブ・フォーメーション・初期状態を定義する。 |
| `client/src/game/ui.ts` | 画面遷移、操作、戦術ボード、試合ダイアログをDOMで描画する。 |
| `client/src/game/assets.ts` | Web用ストレージURLを一箇所で定義する。 |
| `client/src/game/game.css` | タッチライン戦術室のHUDスタイルを定義する。 |

## 状態遷移

`ClubSimulation` は、初期化、編成更新、練習、選手獲得、週進行、セーブ・ロードを公開する。UI層は毎回スナップショットを描画し、演算済みの状態を直接変更しない。試合進行では、練習処理、疲労処理、対象節の全試合結果、クラブ収支、順位計算、試合ログの順で状態を確定する。

## Asset Hints

| アセット | 使用場所 | サイズ |
| --- | --- | --- |
| `touchline-command-center` | ホーム・試合モーダルの背景 | 1920x1080、ビューポートを覆う |
| `tactics-pitch-board` | スタメン画面のピッチ領域 | 920x690px、コンテナ内を覆う |
| `player-scout-card-art` | 補強・選手詳細パネル | 360x540px、縦長 |
| `club-orbit-mark` | ヘッダー、ローディング、favicon | 72x72px、正方形 |
