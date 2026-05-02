## プロジェクト概要
- Next.js をベースにしたブログ生成システム（NotionNext フォーク）
- Notion API からバックエンドデータを取得し、**すべてのページを静的書き出し（SSG: `output:'export'`）** する
- Cloudflare Pages などの静的ホスティングを想定、動的サーバー処理は一切なし（ISR も事実上無効）

## システム構成図
### 1. AI開発環境（ローカル）
- **IDE**: VSCode + Continue 拡張（OpenRouter 経由で DeepSeek モデルに接続、コード補完・生成）
- **成果物の流れ**: ローカル作業 → Git push → GitHub → Cloudflare Pages 自動デプロイ

### 2. コンテンツ管理
- **Notion**（記事DB / コンテンツソース）
- **NotionNext**（Next.js SSG で Notion データを静的サイト化）

### 3. 公開基盤
- **GitHub**（ソース管理、push トリガー）
- **Cloudflare Pages**（CDN・SSL・静的配信）
  - 本番: カスタムドメイン
  - 検証: `*.pages.dev`

### 4. 読者接点
- **Giscus**（コメント機能）
  - 実装: `public/js/giscus.js`, `conf/comment.config.js`
  - バックエンド: GitHub Discussions

### 5. 収益化
- **ASP**: A8.net / もしも / ValueCommerce / Amazonアソシエイト
- **投げ銭**: Stripe Payment Links（任意採用）

### 採用しないもの（確定）
- 限定配布PDF・会員制・独自バックエンド・専用DB はすべて不採用

### 情報の流れ（一文）
> ローカルのAI支援開発環境でコードを書き → GitHubにpush → Cloudflare Pagesが自動デプロイ → 読者はGiscusでコメントし、ASP経由で収益が発生する。

## 重要ファイルマップ
### Notion API 取得処理
- `lib/notion/getNotionAPI.js` – Notion クライアントの初期化
- `lib/notion/getPostBlocks.js` – API からの生データ（blockMap）取得
- `lib/notion/getAllPageIds.js` – データベースのページID一覧を取得（ビュー順 / page_sort フォールバック）
- `lib/notion/getPageProperties.js` – 各ページのプロパティをスキーマに従ってパースし、`publishDate` などの正規化を行う
- `lib/notion/getMetadata.js` – メタデータ抽出（ロック状態、フォント等）
- `lib/notion/getNotionConfig.js` – Notion データベース内の設定ページから `NOTION_CONFIG` を生成
- `lib/notion/getNotionPost.js` – 単一ページの内容を取得（`getPost`）
- `lib/db/getSiteData.js` – 上記を統合しサイト全体のデータ（`allPages`, `tagOptions`, `categoryOptions` 等）を生成するメイン関数

### 記事一覧・詳細ページ
- 一覧表示: `pages/index.js`（ホーム）, `pages/page/[page].js`（ページネーション）
- カテゴリ/タグ一覧: `pages/category/[category]/index.js`, `pages/tag/[tag]/index.js`
- 記事詳細（スラッグ）: `pages/[prefix]/index.js`（単一スラッグ）, `pages/[prefix]/[slug]/index.js`（複数階層スラッグ）
- テーマ側のリスト表示コンポーネント（現在のテーマは `hexo`）:
  - `themes/hexo/components/BlogPostListPage.js`（ページ分割）
  - `themes/hexo/components/BlogPostListScroll.js`（無限スクロール）
- レイアウト: `themes/hexo/index.js`（`LayoutBase`, `LayoutIndex`, `LayoutSlug` 等）
- `components/NotionPage.js` – 記事本文のレンダリング

### ソート処理
- `lib/db/getSiteData.js` 内
  - `convertNotionToSiteData()`: `POSTS_SORT_BY` が `'date'` の場合 `allPages` を `publishDate` の降順でソート
  - `getLatestPosts()`: 常に `lastEditedDate`（フォールバック `publishDate`）の降順（→ 修正予定）
- `conf/post.config.js`: `POSTS_SORT_BY` のデフォルト値（現在は `'notion'`）

### canonical / metadata 出力箇所
- `components/SEO.js` – `<Head>` 内に `<title>`, OG, Twitter Card, 構造化データを出力（canonical はまだ未出力）
- `pages/_document.js` – HTML 全体のベース、ダークモード設定

### footer / favicon 設定箇所
- ファビコン設定: `blog.config.js` の `BLOG_FAVICON: '/favicon.ico'`
- 使用ファイル: `public/favicon.ico`, `public/favicon.svg`
- フッター: `themes/hexo/components/Footer.js`（著作権表記・备案・PoweredBy 等）
- テーマはカレントテーマ（`blog.config.js` の `THEME`）に依存、複製に注意

### ビルド設定
- `next.config.js` – `output:'export'`, 画像最適化無効, webpack エイリアスでテーマ解決
- `blog.config.js` – BLOG 全体設定（API URL, テーマ, サイトメタ情報等）
- `conf/post.config.js` – 記事関連設定（URLプレフィックス, ソート, リスト形式等）
- `conf/notion.config.js` – Notion DB のプロパティ名マッピング
- `.env.example` – 環境変数テンプレート（実際の値は `.env.local` 等）

## Notion DB プロパティ名（`conf/notion.config.js` より）
現在のコードで取得しているプロパティは以下の通り（`NOTION_PROPERTY_NAME` でマッピング）:
- `password` – 記事ロック用
- `type` – ページ種別（`Post`, `Page`, `Notice`, `Menu`, `SubMenu`）
- `title` – 記事タイトル
- `status` – 公開ステータス（`published`, `Invisible`）
- `summary` – 概要
- `slug` – URL パス
- `category` – カテゴリ（`select`）
- `date` – 日付（これを基に `publishDate` を生成）
- `tags` – タグ（`multi_select`）
- `icon` – アイコン
- `ext` – 拡張JSON

※ `site` プロパティは計画中だが、現時点では未実装。

## 設計制約（触ってはいけないもの）
- **動的 SSR/API ルートは使用不可**（`output:'export'` のため）
- ISR の `revalidate` は無効（`NEXT_REVALIDATE_SECOND:0` または環境変数で 0）
- Notion API との通信は**ビルド時にのみ**行われる（`getStaticProps` / `getStaticPaths` 内）
- `next/image` 最適化は無効（`images.unoptimized:true`）
- 多言語ルーティングは簡易的なプレフィックス方式（`[prefix]`）で、内部的な `locale` 切替のみ

## 既知の注意点（コードのクセ・ハマりどころ）
- `lib/db/getSiteData.js` 内で Notion API の応答が**二重ラップ（`value.value`）されている場合の正規化処理**が入っている（最近の修正）
- `getAllPageIds.js` では、`collection_query` が空の場合に `page_sort` から ID を復旧するゴリ押しフォールバックあり
- `getPageProperties.js` はスキーマが null の場合にもキー名からの逆引きフォールバックを試みる（やや複雑）
- `SEO.js` 内で `<link rel='icon'>` が2重に出力されている（同じ値だが冗長）
- `getLatestPosts()` のソートキーが `lastEditedDate` 優先（仕様と不一致、修正予定）
- ビルド時、`BUNDLE_ANALYZER` フラグが立つと空データを返す仕様（デバッグ用）
- 環境変数 `NOTION_TOKEN_V2` 等のデバッグログが `conf/notion.config.js` に残っている
- `convertToUTC` が独自のタイムゾーンマッピングを使用（dayjs 等の標準ライブラリ未使用）