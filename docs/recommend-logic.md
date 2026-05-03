# 診断レコメンドロジック

実装: `lib/recommend.ts` / 入力型: `lib/types.ts` / API: `app/api/recommend/route.ts` / テスト: `lib/recommend.test.ts`

## 概要

診断回答（`DiagnosisAnswers`）と香水データ（`Perfume[]`）を受け取り、各香水を 0〜100 点でスコアリングし、降順に上位 N 件（API では 5 件）を返す。各結果には最大 2 件の和文「理由」が添えられる。

```
DiagnosisAnswers ─┐
                  ├─► scorePerfume(p, a)  ─► 0..100
Perfume          ─┘
                  └─► buildReasons(p, a)  ─► string[] (最大2件)

recommend(perfumes, answers, topN) → Recommendation[] (score 降順)
```

## 入力

### `DiagnosisAnswers`

| キー          | 型                  | UI質問                  | スコアリング |
|---------------|---------------------|-------------------------|--------------|
| `age`         | `AgeGroup`          | 年齢層                  | **未使用**   |
| `gender`      | `Gender`            | 性別                    | 使用         |
| `diet`        | `DietType`          | 食生活の傾向            | 使用         |
| `skin`        | `SkinType`          | 肌質                    | 使用         |
| `metabolism`  | `MetabolismLevel`   | 平熱・代謝              | 使用         |
| `scenes`      | `Scene[]`           | 使用シーン（複数）      | 使用         |
| `preferences` | `Preference[]`      | 好きな香りの方向（複数）| 使用 + フィルタ的に作用 |
| `budget`      | `BudgetRange`       | 価格帯                  | 使用         |
| `mbti`        | `MBTI`              | MBTI                    | 使用（任意） |

> `age` は UI で取得しているが、現状スコアには反映されない（将来の拡張余地）。

## スコア配分

各要素の最大点を合計すると **125 点** だが、最終スコアは `Math.min(100, total)` でクリップする（`recommend.ts:197`）。これにより「ほぼ全要素ヒット」のときに天井（100）に達し、複数の最適解が同点になることがある。

| 要素                         | 最大 | 関数                           |
|------------------------------|-----:|--------------------------------|
| 肌質 × 濃度                  |   25 | `scoreSkinConcentration`       |
| 代謝 × 強度（intensity）     |   15 | `scoreMetabolismIntensity`     |
| 食生活 × 香調系統            |   10 | `scoreDietFamily`              |
| シーン一致                   |   20 | `scoreScene`                   |
| 好み × 系統                  |   20 | `scorePreference`              |
| 性別志向                     |   10 | `scoreGender`                  |
| MBTI × 系統                  |   10 | `scoreMbti`                    |
| 予算                         |   15 | `scoreBudget`                  |
| **合計（クリップ前）**       | **125** | `scorePerfume` |

## 各要素の詳細

### 1. 肌質 × 濃度（最大 25）

油分量で揮発・残香が変わる前提のマッピング。

| skin \\ concentration | Parfum | EDP | EDT | Cologne |
|-----------------------|-------:|----:|----:|--------:|
| 乾燥肌                | **25** |  20 |  10 |       5 |
| 普通肌                |  18    |  18 |  18 |      18 |
| 混合肌                |  15    |  22 |  22 |      15 |
| 脂性肌                |   5    |  10 |  20 |  **25** |

### 2. 代謝 × 強度（最大 15）

`intensity` は 1（軽）〜5（重）。代謝が高い人ほど香りが立ちやすいため、強い香水だと過剰になりやすい。

| metabolism \\ intensity | 1  | 2  | 3  | 4  | 5  |
|-------------------------|---:|---:|---:|---:|---:|
| 高め                    | 15 | 15 | 12 |  6 |  2 |
| 普通                    |  6 | 10 | 15 | 10 |  6 |
| 低め                    |  2 |  6 | 12 | 15 | 15 |

### 3. 食生活 × 香調系統（最大 10）

| diet           | 加点される系統                                  | 加点 | それ以外 |
|----------------|--------------------------------------------------|-----:|---------:|
| スパイス多め   | オリエンタル / ウッディ                          |   10 |        3 |
| 和食中心       | シトラス / アクアティック                        |   10 |        3 |
| 洋食中心       | フローラル / グルマン / シプレ                   |    8 |        4 |
| バランス型     | （対象なし、一律）                               |    6 |        — |

### 4. シーン一致（最大 20）

`scenes`（複数選択）と `perfume.scene_tags` の重なりで加点。

```
hits = |answers.scenes ∩ perfume.scene_tags|
score = min(20, hits * 5 + (hits > 0 ? 5 : 0))
```

| hits | 0 | 1  | 2  | 3  | 4  |
|------|--:|---:|---:|---:|---:|
| 加点 | 0 | 10 | 15 | 20 | 20 |

ヒットが 1 件以上あった瞬間に「初動 +5」が乗るため、0 件と 1 件の差（+10）が大きい。

### 5. 好み × 系統（最大 20）

`PREFERENCE_FAMILY_MAP` で各「好き」を系統集合にマップし、複数回答時はその**和集合**を作る。

| preference          | 対応系統                                        |
|---------------------|--------------------------------------------------|
| 爽やか              | シトラス, アクアティック, フゼア                |
| 甘い                | グルマン, オリエンタル, フローラル              |
| 落ち着いた木の香り  | ウッディ, シプレ                                |
| スパイシー          | オリエンタル, ウッディ                          |
| 清潔感のある石鹸系  | フローラル, フゼア, アクアティック              |
| 個性的・独特        | オリエンタル, シプレ, グルマン                  |

- 和集合に `perfume.scent_family` が含まれる: **20**
- 含まれない: **4**
- `preferences` が空: **0**

「含まれない」を 0 でなく 4 にしているため、好み外でも他の要素で逆転可能。

### 6. 性別志向（最大 10）

| answers.gender \\ perfume.gender_orientation | men | women | unisex |
|----------------------------------------------|----:|------:|-------:|
| 男性                                         |  10 |     2 |      8 |
| 女性                                         |   2 |    10 |      8 |
| 指定しない                                   |   5 |     5 |     10 |

unisex は常時優遇（最低 8、最大 10）。

### 7. MBTI × 系統（最大 10）

`MBTI_FAMILY_MAP` で 16 タイプを 2 系統ずつにマップ。

- 一致: **10**
- 不一致: **3**
- 「わからない」または未回答: **5**（中立）

> マッピングはキャラクター心理学に基づく簡易設計で、根拠は弱い。重み（10点）も他要素より低めに抑えている。

### 8. 予算（最大 15）

価格帯を 3 ランクに正規化して差分を取る。

| BudgetRange       | rank |
|-------------------|-----:|
| 〜¥15,000         |    0 |
| ¥15,000〜¥30,000  |    1 |
| ¥30,000〜         |    2 |
| こだわらない      | null（中立 8 点） |

| `priceRank(yen)` | 条件         |
|------------------|--------------|
| 0                | < 15,000     |
| 1                | < 30,000     |
| 2                | 30,000 以上  |

| `|want - actual|` | 加点 |
|-------------------|-----:|
| 0（同ランク）     |   15 |
| 1（隣接ランク）   |    8 |
| 2（遠い）         |    0 |

> `15000` 円ちょうどは `priceRank` で **1**（`〜¥15,000` でなく `¥15,000〜¥30,000` 側）になる。テスト `lib/recommend.test.ts:154-167` がこの境界挙動を固定している。

## 集計と並び替え

```ts
total = Σ(各要素のスコア)
score = min(100, total)
```

`recommend` は全件 `scorePerfume` → 降順ソート → `slice(0, topN)`。`Math.min(100, …)` のため上位が同点クリップになりうるが、安定ソートなのでデータ順が破綻はしない。

## 理由文（`buildReasons`）

スコアと**独立に**ルールベースで生成し、最大 2 件を返す（`reasons.slice(0, 2)`）。判定順は以下：

1. 肌質 × 濃度（乾燥 + Parfum/EDP / 脂性 + EDT/Cologne）
2. シーン一致（一致タグを「・」で連結）
3. 好み一致（`PREFERENCE_FAMILY_MAP` ヒット時）
4. 食生活（スパイス多め / 和食中心の特化系統のみ）
5. 代謝（高め × intensity≤3 / 低め × intensity≥4）
6. MBTI（マップ一致時のみ）
7. 予算（ランク完全一致時のみ）
8. どれも該当しないとき: フォールバック「`{family}` の中でも扱いやすく…」

> 上から順に `push` し最後に **先頭 2 件のみ採用**するため、肌質・シーンの理由が優先表示されやすい。スコア順とは無関係。

## 香水データの出所

レコメンド対象の `Perfume[]` は **完全にローカル完結**で、外部 API には依存しない（CLAUDE.md の「外部APIへの新規依存追加は禁止」に対応）。

```
data/seed.ts (26件のハードコード)
       │
       │ npm run seed   (INSERT OR REPLACE)
       ▼
data/perfume.db (SQLite, better-sqlite3)
       │
       │ getAllPerfumes() / getPerfumeById()  (lib/db.ts)
       ▼
recommend() / 詳細ページ
```

### マスタ定義 — `data/seed.ts`

- 26 本の `Perfume` オブジェクトを直書き（メンズ寄り 6 / レディース寄り 6 / ユニセックス 8 + ニッチ）
- 全 8 系統（`ScentFamily`）を最低 1 本ずつカバー
- `description` は短い情景描写（編集体裁の都合で）
- 配列フィールド（`top_notes` / `middle_notes` / `base_notes` / `season_tags` / `scene_tags`）は文字列配列

### 永続化 — `data/perfume.db`

- スキーマは `lib/db.ts:22-50` の `initSchema` が起動時に `IF NOT EXISTS` で作成
- 配列フィールドは `JSON.stringify` で TEXT 列に格納し、`rowToPerfume` 内で `JSON.parse` で復元
- `journal_mode = WAL`
- DB ファイル自体は git 管理されており、`npm run seed` を回さなくても初期状態で動く

### 更新の流れ

| 操作 | 手順 |
|------|------|
| 追加 | `data/seed.ts` の `perfumes` 配列に 1 件追記 → `npm run seed` |
| 更新 | 同じ `id` のエントリを書き換え → `npm run seed`（`INSERT OR REPLACE` で上書き） |
| 削除 | seed では不可。DB に対する手動 SQL が必要 |

> **注意**: seed.ts は `INSERT OR REPLACE` のみで、差分 DELETE をしない。seed.ts から行を消しても `data/perfume.db` には残り続ける。

## API レイヤー

`POST /api/recommend`（`app/api/recommend/route.ts`）

- `runtime = "nodejs"` / `dynamic = "force-dynamic"`
- リクエストボディ: `DiagnosisAnswers`（JSON）
- バリデーション: 「JSONとして読めるか」「objectか」のみ。フィールド型は未検証で `as DiagnosisAnswers` キャスト
- 香水は `getAllPerfumes()` で SQLite から全件取得し、`recommend(perfumes, answers, 5)` を実行
- 結果送信前に `saveDiagnosisResult(JSON.stringify(answers), [perfumeId, …])` でログ保存
- レスポンス: `{ recommendations: Recommendation[] }`

## テスト

`lib/recommend.test.ts`（vitest）で固定している不変条件:

- 乾燥肌 → EDP の方が Cologne より高スコア
- 脂性肌 → Cologne の方が EDP より高スコア
- 全要素ヒット入力でも `0 ≤ score ≤ 100`
- シーン一致数の単調性（0 < 1 < 2）
- 上位 N 件はスコア降順
- 各結果に少なくとも 1 件の理由が付く
- 「甘い + 乾燥肌 + デート」でグルマン EDP が 1 位
- 「〜¥15,000」予算で 8,000/12,000 円が 15,000 円より上位

> CLAUDE.md ルール: レコメンドロジックの変更時はこのファイルを必ず更新し、`npm test` がグリーンであることを確認してからコミット。

## 設計上のメモ

- **天井クリップ（100）**: 全要素ヒット時に容易に天井へ届く設計。差別化は天井未満のレンジで行われる。
- **`age` 未使用**: 取得はしているが現状未参照。将来世代別のシーン重みなどに使える余地。
- **「外れ」は 0 でなく低い加点**: `scorePreference` の 4 / `scoreMbti` の 3 / `scoreDietFamily` の 3-4 など、ハード除外を避けて他要素での逆転を許容している。
- **`buildReasons` の優先順 ≠ スコア寄与**: 表示理由は固定順。スコア寄与の大きい要素が必ず理由に出るとは限らない。
