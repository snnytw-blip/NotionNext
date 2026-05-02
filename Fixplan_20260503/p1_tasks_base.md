# P1 作業指示書ベース

> **前提**: P0タスク（publish_date, category/site, canonical, favicon, footer）は完了済みと読むこと。


---

### タスク1: metadata対応（title・description・publish_date）

**対象ファイル:**
- `components/SEO.js`
- `lib/notion/getPageProperties.js`（P0修正後の状態を想定。`publishDate` 数値化済み）

**現状コード（該当箇所）**
`components/SEO.js`：
```js
// getSEOMeta() default ケース（記事詳細ページ）
default:
  return {
    title: post ? `${post?.title} | ${siteInfo?.title}` : `${siteInfo?.title} | loading`,
    description: post?.summary,
    type: post?.type,
    slug: post?.slug,
    image: post?.pageCoverThumbnail || `${siteInfo?.pageCover}`,
    category: post?.category?.[0],
    tags: post?.tags
  }
```

また `<Head>` 内で：
```jsx
<meta name='description' content={description} />
```

**問題点 / 現状**
- `getSEOMeta` の戻り値に `publishDay` / `lastEditedDay` が含まれておらず、記事詳細で日付を meta 情報として出力できない
- ただし `<meta name='description'>` と `<meta name='keywords'>` は既に出力されている（P0, P1ともに `SEO.js` に実装済みのため、title/description の基本的な head 出力は現状でも動作している）
- 一覧ページ（`/`, `/category/[category]` 等）でも `getSEOMeta` に `publishDate` は不要（一覧ページの構造化データは `WebSite` 型のため問題ない）

**修正仕様**
- [ ] `getSEOMeta` の `default` ケースに以下を追加:
  ```js
  publishDay: post?.publishDay,
  lastEditedDay: post?.lastEditedDay
  ```
- [ ] 構造化データ `generateStructuredData()` 内の `BlogPosting` ノードで既に `datePublished`, `dateModified` が出力されていることを確認（現状コードの通り、`meta.publishDay` が存在すれば動作する）
- 注意: `<meta>` タグとしての日付出力は `article:published_time` `article:modified_time` が既存コードで出力されているため、それらを妨げないこと

**実装担当への注意事項**
- `publishDay` は `formatDate(properties.publishDate, BLOG.LANG)` で生成されるフォーマット済み文字列（P0修正後も維持）
- `getSEOMeta` に他プロパティを追加する際、既存の switch-case 構造を壊さないこと
- 一覧ページの `WebSite` ノードには日付を含めないこと（現状の分岐で問題ない）


### タスク2: OGP対応（og:title / description / image + Twitter Card + eyecatch）

**対象ファイル:**
- `components/SEO.js`
- `conf/notion.config.js`
- `lib/notion/getPageProperties.js`
- `lib/db/getSiteData.js`（`getSiteData` 内の `adjustPageProperties` から eyecatch が変換される想定）

**現状コード（該当箇所）**
`SEO.js` にて、OGP/Twitter Card は基本的に出力済み:
```jsx
<meta property='og:title' content={title} />
<meta property='og:description' content={description} />
<meta property='og:image' content={image} />
<meta property='og:type' content={type} />
<meta name='twitter:card' content='summary_large_image' />
<meta name='twitter:title' content={title} />
```

`image` の値は `getSEOMeta()` の `default` ケースで:
```js
image: post?.pageCoverThumbnail || `${siteInfo?.pageCover}`
```
となっており、固定画像 `/bg_image.jpg` にフォールバック済み。

**問題点 / 現状**
- eyecatch プロパティが `NOTION_PROPERTY_NAME`（`conf/notion.config.js`）に定義されていないため、Notion DB に eyecatch カラムがあっても取得されない
- 現状の画像優先順位: `pageCoverThumbnail` → `siteInfo.pageCover` → 固定画像
- 本来あるべき優先順位: **eyecatchプロパティが最優先** → `pageCoverThumbnail` → `siteInfo.pageCover`
- OGP の `og:image:width` / `og:image:height` は固定値 `1200` `630` でハードコードされている（問題ないが、eyecatch画像のアスペクト比が異なる場合に歪む可能性あり）

**修正仕様**
- [ ] `conf/notion.config.js` の `NOTION_PROPERTY_NAME` に eyecatch を追加:
  ```js
  eyecatch: process.env.NEXT_PUBLIC_NOTION_PROPERTY_EYECATCH || 'eyecatch'
  ```
- [ ] `lib/notion/getPageProperties.js` に eyecatch プロパティ取得処理を追加（`mapImgUrl` で変換; `properties.pageCover` と同じ変換方法）
- [ ] `adjustPageProperties()` で eyecatch に対しても URL 正規化を適用
- [ ] `getSEOMeta()` の `default` ケースで画像優先順位を変更:
  - **最優先**: `post?.eyecatch`
  - **次点**: `post?.pageCoverThumbnail`
  - **フォールバック**: `siteInfo?.pageCover` または固定画像
- [ ] OGP 画像サイズは eyecatch の実サイズが不明なため、**現状の固定値 `width=1200, height=630` を維持**し、必要に応じて後日調整

**実装担当への注意事項**
- Notion DB の eyecatch プロパティは `files` 型であることを想定。外部URLの場合は `mapImgUrl` がそのまま通るが、S3アップロードファイルの場合は Notion の一時URL切れに注意（静的ビルド時のみ有効）
- `getPageProperties.js` では eyecatch の生データが `value?.format?.page_cover` と同じ構造か不明なため、**要確認**（Notion API の `properties.eyecatch.files[0].external.url` 等を想定）
- 既存の `og:image` 変数は他箇所（`generateStructuredData` や `meta.image`）でも使用されているため、値の上書きに注意


### タスク3: パンくず実装（HOME > category > 記事タイトル）

**対象ファイル:**
- `themes/hexo/index.js`（`LayoutSlug` コンポーネント）
- `components/SEO.js`（構造化データ `BreadcrumbList` を追加する場合）
- （新規作成）`themes/hexo/components/Breadcrumb.js`

**現状コード（該当箇所）**
`themes/hexo/index.js` の `LayoutSlug`:
```jsx
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  return (
    <>
      <div className='...'>
        {!lock && post && (
          <div className='...'>
            <article id='article-wrapper' ...>
              <section ...>
                {post && <NotionPage post={post} />}
              </section>
              <ShareBar post={post} />
              {post?.type === 'Post' && (
                <>
                  <ArticleCopyright {...props} />
                  <ArticleRecommend {...props} />
                  <ArticleAdjacent {...props} />
                </>
              )}
            </article>
          </div>
        )}
      </div>
    </>
  )
}
```

パンくずコンポーネント `Breadcrumb` は**未実装**。テーマ内にも存在しない（全テーマ grep 結果: 0件）。
`components/SEO.js` の `generateStructuredData()` は `WebSite` と `BlogPosting` のみ出力。`BreadcrumbList` は未出力。

**問題点 / 現状**
- 記事詳細ページにパンくずが一切表示されていない
- 構造化データ `BreadcrumbList` も未出力
- HOME > [category] > [記事タイトル] の形式が存在しない

**修正仕様**
### 表示用コンポーネント（新規作成）
- [ ] `themes/hexo/components/Breadcrumb.js` を新規作成：
  ```jsx
  const Breadcrumb = ({ category, title }) => {
    return (
      <nav className='flex gap-2 text-sm text-gray-500 mb-4 px-1'>
        <SmartLink href='/'>HOME</SmartLink>
        {category && (
          <>
            <span>&gt;</span>
            <SmartLink href={`/category/${category}`}>{category}</SmartLink>
          </>
        )}
        <span>&gt;</span>
        <span className='text-gray-800 dark:text-gray-200'>{title}</span>
      </nav>
    )
  }
  ```
- [ ] `LayoutSlug` に `<Breadcrumb>` を追加（`<article>` の直前）
- [ ] スタイルは Tailwind CSS で最低限の横並びリスト（`flex`, `gap-2`, `text-sm`, `text-gray-500` 等）
- [ ] `LayoutSlug` で `post` が存在する場合のみ `Breadcrumb` を表示（`lock` 中は非表示）

### 構造化データ
- [ ] `components/SEO.js` の `generateStructuredData()` に `BreadcrumbList` を追加:
  - `meta?.type === 'Post'` の場合のみ、`BlogPosting` と並列に出力する
  - `category` が空の場合は HOME → 記事タイトルの2段階にする

**実装担当への注意事項**
- テーマ `hexo` の `LayoutSlug` には `post` オブジェクトが渡される。`post.category` は P0 修正後、単一文字列化されている（`properties.category = properties.category?.[0] || ''`）
- カテゴリが空文字の場合は「HOME > 記事タイトル」の2段階にする（中間のカテゴリをスキップ）
- 構造化データの `BreadcrumbList` は、`generateStructuredData` 内で `BlogPosting` と同じ階層に出せない（`@type` が競合する）ため、**別の `<script>` タグとして出力する**。`SEO.js` 内で `meta?.type === 'Post'` の条件でもう1個 `script` ブロックを追加する


### タスク4: 関連記事（同一category 新着3件）

**対象ファイル:**
- `lib/db/getSiteData.js`（`convertNotionToSiteData`）
- `themes/hexo/components/ArticleRecommend.js`（既存コンポーネント）
- `themes/hexo/index.js`（`LayoutSlug` で props として受け渡し）
- `pages/[prefix]/[slug]/index.js` および `pages/[prefix]/index.js`（`getStaticProps` で recommendPosts を生成）

**現状コード（該当箇所）**
`themes/hexo/index.js` の `LayoutSlug` では `ArticleRecommend` に `{...props}` を渡しているが、`recommendPosts` はまだ生成されていない。

`lib/db/getSiteData.js` には関連記事を生成する関数は存在しない。`getLatestPosts()` はあるが、これはカテゴリを絞らず全記事を `lastEditedDate` 降順で返す。

**問題点 / 現状**
- `ArticleRecommend` コンポーネントは存在するが、`recommendPosts` が渡されないため表示されない
- 関連記事ロジック（同一カテゴリ・自分自身除外・publishDate 降順）が未実装

**修正仕様**
- [ ] `lib/db/getSiteData.js` に `getRecommendPosts()` 関数を新設し export:
  ```js
  export function getRecommendPosts(currentPost, allPages, count = 3) {
    return allPages
      ?.filter(p =>
        p.type === 'Post' &&
        p.status === 'Published' &&
        p.id !== currentPost?.id &&        // 自分自身を除外
        p.category === currentPost?.category // 同一カテゴリ
      )
      .sort((a, b) => (b?.publishDate || 0) - (a?.publishDate || 0))
      .slice(0, count) || []
  }
  ```
- [ ] `pages/[prefix]/[slug]/index.js` の `getStaticProps` 内で `recommendPosts` を生成:
  ```js
  import { getRecommendPosts } from '@/lib/db/getSiteData'
  // ...
  props.recommendPosts = getRecommendPosts(props.post, props.allPages, 3)
  ```
- [ ] `pages/[prefix]/index.js`（単一スラッグ用）でも同様に `getStaticProps` 内で `recommendPosts` を生成
- [ ] `themes/hexo/index.js` の `LayoutSlug` では `{...props}` で渡しているため、props に `recommendPosts` が含まれれば自動で `ArticleRecommend` に渡る

**実装担当への注意事項**
- `getRecommendPosts` は `convertNotionToSiteData` 内で使うのではなく、**各ページの `getStaticProps` 内で呼ぶ**こと（`allPages` はすでに全ページデータを含む）
- `ArticleRecommend` は `HEXO_ARTICLE_RECOMMEND` コンフィグが有効でないと描画されない。デフォルトで動作するよう `conf/post.config.js` などで `HEXO_ARTICLE_RECOMMEND: true` を設定すること
- 同一カテゴリの記事が3件に満たない場合は、件数が足りていなくても取得できた分を表示する（`slice` で自然に処理される）


### タスク5: sitemap.xml生成（全publishedページ・日付含む・サイト別分離対応）

**対象ファイル:**
- `lib/sitemap.xml.js`（既存の `generateSitemapXml` 関数）
- `lib/sitemap.js`（別実装の `generateSitemap` 関数：参照用）
- `pages/index.js`（ビルド時に `generateSitemapXml` を呼び出している）
- `lib/db/getSiteData.js`（`getGlobalData` が返すデータ構造に依存）

**現状コード（該当箇所）**
`lib/sitemap.xml.js`:
```js
// 固定ページ4件（/, /archive, /category, /tag）+ 各記事ページ
const urls = [
  { loc: `${link}`, lastmod: '...', changefreq: 'daily', priority: 1.0 },
  { loc: `${link}/archive`, lastmod: '...', changefreq: 'daily', priority: 1.0 },
  { loc: `${link}/category`, lastmod: '...', changefreq: 'daily' },
  { loc: `${link}/tag`, lastmod: '...', changefreq: 'daily' }
]
allPages?.forEach(post => {
  urls.push({
    loc: `${link}/${slugWithoutLeadingSlash}`,
    lastmod: new Date(post?.publishDay).toISOString().split('T')[0],
    changefreq: 'daily'
  })
})