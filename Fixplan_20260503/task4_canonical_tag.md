# 作業指示書

## タスク名
canonical タグを各記事ページの <head> に自動出力

---

## 対象ファイル
- `components/SEO.js`
- `lib/config.js`（参照）
- `blog.config.js`（参照）

---

## 現状コード（該当箇所）

### `components/SEO.js`（抜粋）
```js
const SEO = props => {
  const { children, siteInfo, post, NOTION_CONFIG } = props
  const PATH = siteConfig('PATH')
  const LINK = siteConfig('LINK')
  const SUB_PATH = siteConfig('SUB_PATH', '')
  let url = PATH?.length ? `${LINK}/${SUB_PATH}` : LINK
  // ...
  const meta = getSEOMeta(props, router, useGlobal()?.locale)
  if (meta) {
    url = `${url}/${meta.slug}`
    image = meta.image || '/bg_image.jpg'
  }
  // ...
  return (
    <Head>
      <link rel='icon' href={favicon} />
      <title>{title}</title>
      {/* ... canonical タグは存在しない */}
    </Head>
  )
}
```

---

## 問題点
- 各記事ページに canonical タグが出力されていない
  - 重複コンテンツの問題が発生し、SEO 評価が分散する可能性がある
  - 異なる URL で同じ記事にアクセスできるケース（例：`/article/slug` と `/slug`）で、検索エンジンに正規 URL を伝えられない

---

## 修正仕様

### `components/SEO.js`
- [ ] canonical URL を `<link rel="canonical" href="..." />` として `<Head>` 内に追加
- [ ] canonical URL の生成ルール
  - ベース URL: `siteConfig('LINK')`（例：`https://mirai-ai-lab.pages.dev`）
  - トップページ（`/`）: `ベースURL` そのまま
  - 記事ページ: `ベースURL + '/' + post.slug`（例：`https://mirai-ai-lab.pages.dev/article/my-post`）
  - カテゴリ・タグなどの一覧ページも同様に `ベースURL + パス`
- [ ] 既存の `url` 変数がすでに `LINK + '/' + meta.slug` で計算されているため、この `url` をそのまま canonical に使用可能
- [ ] 追加コード（`</Head>` の前、適切な位置）:
```jsx
{url && <link rel="canonical" href={url} />}
```

### 補足
- 現在 `url` 変数は `PATH` と `SUB_PATH` を考慮しており、記事ページでは `meta.slug` を連結している
- 環境変数 `NEXT_PUBLIC_SITE_URL` があればそれを優先するなど、サイト URL の算出ロジックに変更は不要

---

## 実装担当への注意事項
- `url` 変数が `undefined` や空文字になるケース（404 ページなど）を考慮し、`url` が truthy な場合のみ出力すること
- SEO.js は全ページで使用されるため、影響範囲が広い。既存の OG や Twitter カードの `url` と値が一致することを確認
- `getSEOMeta` 関数の `default` ケースで `slug` が設定されない場合（404 など）は `url` が正しいか確認し、必要なら条件分岐
- ページネーション（`/page/2` など）では、正規 URL をページネーションなしのベース URL にするか、`rel="prev/next"` を使うかは別途検討だが、まずはシンプルに現在の URL を canonical として出力