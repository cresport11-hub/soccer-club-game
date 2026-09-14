# GitHub同期検証記録

## 2026-09-14

本日のホーム画面圧縮実装を `cresport11-hub/soccer-club-game` の `main` へ同期した。

- GitHub上の最新コミット: `3d9d2a55c85d`
- コミット: `sync: upload home dashboard compression`
- GitHubソース上で確認できたマーカー: `CLUB PULSE`、`home-pulse-card`、`TACTICAL PLAN`、`advanced-tactics-details`
- GitHub Pagesのデプロイ実行: `https://github.com/cresport11-hub/soccer-club-game/actions/runs/34834032434`
- 確認時点のActions状態: `in_progress`
- GitHub Pages APIの状態: `building`
- 公開URL: `https://cresport11-hub.github.io/soccer-club-game/`

デプロイ完了前に公開URLを確認したため、ブラウザ表示は旧版の `OPPOSITION XI` と `SUPPORTER PULSE` を含んでいた。GitHub上のmainソースとPages生成物は新しいマーカーを含んでいるため、Actions完了後に公開URLを再確認する。


## 公開確認結果

GitHub Actions `34834032434` は `success` で完了した。デプロイ後の公開URLを再確認し、以下の新表示を確認した。

| 確認項目 | 結果 |
|---|---|
| CLUB PULSE | 表示済み |
| 人気率・状態 | 42%／再建中として表示 |
| 所持金 | 3,200,000円として表示 |
| 次回見込み収入 | +23,837,400円として表示 |
| 詳細折りたたみ | 「収益・人気の詳細」として初期閉じ状態で表示 |
| 詳細内訳 | FAN CLUB、GATE、GOODS、FOODを展開後に表示可能 |
| 財務導線 | 「財務ダッシュボードを見る」を確認 |
| 相手XI一覧 | 対戦前ドシエから削除され、スカウト導線へ集約済み |
