# Claude Code 作業ルール

## 環境
- Native Windows 11 / Node.js 20 / npm / PowerShell
- WSL は使用しない

## コーディング規約
- ファイルパスは必ず `path.join()` を使用
- 環境変数指定スクリプトは `cross-env` 経由
- TypeScript strict mode を維持
- 外部APIへの新規依存追加は禁止（MVPはローカル完結が前提）

## コミット規約
- Conventional Commits に準拠
  - feat: / fix: / refactor: / docs: / chore: / test:
- 1コミット1関心事

## ブランチ戦略
- main: 動作する状態のみ
- feature/*: 機能単位
- PR経由でマージ（Squash推奨）

## テスト
- レコメンドロジックの変更時は `lib/recommend.test.ts` を必ず更新
- `npm test` がグリーンであることを確認してからコミット
