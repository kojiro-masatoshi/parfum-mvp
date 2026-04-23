# Parfum MVP

香水レコメンドアプリの MVP。診断回答から相性のいい香水を提案する。

## 必要環境
- Windows 11
- Node.js v20 LTS（"Tools for Native Modules" にチェックを入れてインストール）
- Git

## セットアップ
```powershell
git clone https://github.com/<your-account>/parfum-mvp.git
cd parfum-mvp
npm install
npm run seed
npm run dev
```

ブラウザで http://localhost:3000 にアクセス。

## トラブルシュート

### better-sqlite3 のビルドが失敗する
`better-sqlite3` はネイティブモジュールなので、Windows ではビルドツールが必要。

```powershell
npm install --global node-gyp
# Visual Studio Build Tools 2022 (C++ workload) をインストール
npm rebuild better-sqlite3
```

### 改行コード警告が出る
```powershell
git config --global core.autocrlf input
```

## スクリプト
- `npm run dev` — 開発サーバー起動
- `npm run build` — プロダクションビルド
- `npm run seed` — DBに初期データ投入
- `npm test` — レコメンドロジックのテスト
- `npm run lint` — Lint
- `npm run typecheck` — 型チェック

## アーキテクチャ
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- better-sqlite3（`./data/perfume.db`、Gitignore対象）
- 外部APIゼロ（ネット切断でも動作）
- レコメンドはルールベースのスコアリング（`lib/recommend.ts`）

## 診断項目
年齢層 / 性別 / 食生活 / 肌質 / 代謝 / シーン / 好み / MBTI の8問。
回答から 100 点満点でスコアリングし、上位5件を返す。

## データ
`data/seed.ts` に実在する香水20本を手動登録。8系統・価格帯・ジェンダー志向をばらけさせている。
