# 未来AIラボ 改修計画
> 更新日: 2026-05-03  
> 位置づけ: PoC完了 → 運用基盤整理フェーズ

---

## 1. 現状評価

### できていること
- Notion CMS化
- NotionNext 静的サイト生成
- GitHub 管理
- Cloudflare Pages 自動デプロイ
- pages.dev 検証環境稼働

> 「まず公開できる状態」には到達済み。

### 主要問題

| # | 問題 | 症状 |
|---|------|------|
| 1 | **日付管理の崩壊** | 4月記事が最下部表示 / 最新記事扱い不正 / 公開日・更新日混在 |
| 2 | **タグ責務の混在** | 記事分類とサイト分割をタグ1つで兼用 → 将来的に運用崩壊リスク |
| 3 | **NotionNextデフォルト感** | favicon未変更 / footer未整備 / OGP未設定 |
| 4 | **SEO/構造系未整備** | canonical・sitemap・metadata・パンくず・関連記事 すべて未対応 |

---

## 2. 設計方針

### 基本思想

> 「単なる個人ブログ」ではなく  
> **「単一 Notion DB から複数メディアへ配信する静的CMS基盤」** として設計する。

- Notion DB: **1つ**
- GitHub repo: **1つ**
- Cloudflare Pages: **サイト単位で分離**
- ドメイン: **サブドメインで分離**

### やらないこと（確定）

| 項目 | 理由 |
|------|------|
| 会員制・限定コンテンツ | 不要 |
| 独自バックエンド | 複雑化回避 |
| 専用DB (D1 / Supabase等) | 不要 |
| 複雑な決済後自動処理 | 不要 |
| ISR / edge rendering | 更新不整合を避けるため |
| 高度キャッシュ | 更新反映の確実性を優先 |

---

## 3. 情報設計

### 3-1. category と site の分離

| 概念 | 目的 | 設定 |
|------|------|------|
| **category** | 読者向け分類・関連記事・タグ導線 | Multi Select（複数可） |
| **site** | ビルドフィルタ・配信先制御 | Select（基本1つ） |

#### category 初期設定

| category | 用途 |
|----------|------|
| AI | 生成AI全般 |
| M365 | Microsoft 365 |
| SiteBuild | サイト構築 |
| Education | 特別支援・教育 |
| Life | 生活 |
| Review | レビュー |
| Memo | 雑記 |

> 上限5〜8個を推奨。乱立すると関連記事弱体化・SEO分散につながる。

#### site 初期設定

| site | 公開先 |
|------|--------|
| main | 総合トップ |
| ai | AI特化 |
| life | 生活 |
| edu | 教育 |
| tech | 技術 |

> 上限3〜5程度。メディア境界として機能させるため増やしすぎない。

### 3-2. サブドメイン構成

```
mirai-ai-lab.com          ← main
ai.mirai-ai-lab.com       ← ai
life.mirai-ai-lab.com     ← life
edu.mirai-ai-lab.com      ← edu
```

### 3-3. Notion DB 設計

| 列名 | 型 | 用途 | 備考 |
|------|----|------|------|
| title | Title | 記事タイトル | |
| slug | Text | URL固定化 | 公開後変更禁止 |
| publish_date | Date | 公開日（ソート基準） | **新規追加・最重要** |
| updated_date | Date | 更新日 | |
| category | Multi Select | 読者向け分類 | |
| site | Select | 配信先 | ビルドフィルタに使用 |
| summary | Text | 要約・AI引用優先参照 | |
| eyecatch | Files / URL | OGP画像 | |
| status | Select | draft / published / archived | |

### 3-4. URL設計

```
# 推奨（英数字ハイフン区切り）
/posts/notionnext-cache-fix
/posts/cloudflare-pages-deploy

# 非推奨（日本語・大文字混在）
/posts/NotionNextのキャッシュ問題について
```

> slug は公開後変更禁止。SEO・SNS共有・AI引用保護のため。

---

## 4. ビルド・デプロイ設計

### ビルドフロー（完成形）

```
Notion
  ↓ Notion API
NotionNext（Next.js SSG）
  ↓ site filter（SITE_KEY環境変数）
GitHub
  ↓ 自動デプロイ
Cloudflare Pages
  ├─ mirai-main  (SITE_KEY=main)
  ├─ mirai-ai    (SITE_KEY=ai)
  ├─ mirai-life  (SITE_KEY=life)
  └─ mirai-edu   (SITE_KEY=edu)
```

### ビルド対象条件

```
status == published
AND
site == SITE_KEY
```

### 運用フロー

```
Notion執筆（status=draft）
  ↓ レビュー
status=published・publish_date設定
  ↓
GitHub push
  ↓
Cloudflare Build & Deploy
  ↓
Cache反映確認
```

---

## 5. 優先タスク

### P0 — 最優先（構造修正）

| タスク | 内容 | 完了条件 |
|--------|------|----------|
| **publish_date 導入** | Notion DB追加・ソートをpublish_date DESCに統一 | 4月記事問題解消・順番崩れなし |
| **category / site 分離** | Notion列追加・ビルドフィルタ実装 | siteでフィルタ可能・categoryで関連記事利用可能 |
| **canonical 対応** | 記事ごと自動生成 | `<link rel="canonical" href="..." />` がhtmlに出力される |
| **favicon 変更** | NotionNextデフォルト除去 | ブラウザタブで識別可能 |
| **footer 変更** | デフォルト削除・最低限 `© 2026 未来AIラボ` に整理 | NotionNext感が消える |
| **ソート修正** | last_edited_time → publish_date に統一 | 最新記事が正しく並ぶ |

### P1 — 次フェーズ（SEO / UX）

- metadata（title・description・OGP・publish_date）
- パンくず（`HOME > AI > 記事`）
- 関連記事（同一category・新着3件）
- sitemap.xml（初期は自動生成）
- OGP（初期は固定画像でも可）

### P2 — 将来対応

- AI最適化（llms.txt・構造化・AI引用ポリシー）
- RSS（site別も視野）
- Analytics（GA4・Search Console）
- UI改善（記事カード・モバイル最適化）

---

## 6. フェーズロードマップ

### フェーズ0: 現状安定化
**ゴール:** 「ちゃんとしたサイト」に見える状態

1. publish_date 導入
2. ソート修正・最新記事確認
3. favicon 変更
4. footer 変更
5. canonical 対応

### フェーズ1: 構造固定化
**ゴール:** 運用可能なCMS構造の完成

1. category / site 分離
2. metadata 整備（summary・eyecatch・title）
3. status 導入（draft / published）
4. slug 運用固定（変更禁止ルール化）

### フェーズ2: SEO / UX 整備
**ゴール:** 「読まれるサイト」として成立

1. パンくず
2. 関連記事
3. sitemap
4. OGP
5. モバイル確認

### フェーズ3: 複数サイト化
**ゴール:** 単一DBから複数メディア配信

1. Cloudflare Pages 複製
2. SITE_KEY 環境変数設定
3. ビルドフィルタ実装
4. サブドメイン分離

### フェーズ4: AI時代最適化
**ゴール:** AI引用されやすいメディア

1. llms.txt
2. summary 強化
3. 一次情報強化
4. 構造化改善

---

## 7. AI時代対応方針

### 従来SEO vs AI時代

| 従来SEO | AI時代 |
|---------|--------|
| キーワード・被リンク・ドメイン強度 | 一次情報・実運用・比較理由・意思決定・更新頻度 |

### 強い記事の条件

- 「実際に試した」「失敗した」「比較した」「なぜ選んだ」
- 意思決定の過程・失敗談・コスト・運用負荷を含む

### 避けるもの

- ニュース転載・要約のみ・AI生成だけ・一般論だけ

### 未来AIラボの強み

実運用ベース・意思決定過程・技術と運用が混在・現場感 → AI引用との相性良好

### 記事推奨構成

```
1. 背景
2. 問題
3. 比較
4. 判断理由
5. 実運用
6. 結論
```

---

## 8. 技術リスク

| リスク | 内容 | 方針 |
|--------|------|------|
| Notion API依存 | Rate Limit・仕様変更 | 静的ビルド前提のため即時問題なし。将来はbuild cacheを検討 |
| NotionNext依存 | バージョン更新でbuild破壊 | 短期は最新追従・中期はfork視野 |
| Cloudflare依存 | build timeout・Pages制限 | 静的サイト中心のため現状問題小 |

---

## 9. 最終ゴール

```
Notion DB（単一）
  ├─ category（読者向け分類）
  ├─ site（配信先制御）
  ├─ publish_date
  ├─ metadata
  └─ content

        ↓ NotionNext（単一コードベース）
        ↓ GitHub
        ↓

Cloudflare Pages
  ├─ main site
  ├─ ai site
  ├─ life site
  └─ edu site
```

**同時実現すること:**
- 単一 Notion DB で執筆
- 単一コードベースで管理
- 複数メディアへ静的配信
- AI・SEO 両対応
- 静的・高速・安価
- 運用負荷最小・長期資産化
