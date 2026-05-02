# 作業指示書

## タスク名
publish_date を Notion DB から取得してソートに使う

---

## 対象ファイル
- `lib/notion/getPageProperties.js`
- `lib/db/getSiteData.js`
- `conf/post.config.js`
- `blog.config.js`（動作確認用）

---

## 現状コード（該当箇所）

### 1-1. `lib/notion/getPageProperties.js` 末尾付近
```js
// getPageProperties.js 内の該当箇所
try {
  let rawDate = properties?.date?.start_date || value?.created_time;
  if (!rawDate) {
    rawDate = new Date().getTime();
  }
  const testDate = new Date(rawDate);
  if (isNaN(testDate.getTime())) {
    properties.publishDate = new Date().getTime();
  } else {
    properties.publishDate = testDate.getTime();
  }
} catch (e) {
  properties.publishDate = new Date().getTime();
}
properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)
```

### 1-2. `lib/db/getSiteData.js` の `convertNotionToSiteData` 関数内
```js
// 日付順にソート
if (siteConfig('POSTS_SORT_BY', null, NOTION_CONFIG) === 'date') {
  allPages.sort((a, b) => {
    return b?.publishDate - a?.publishDate
  })
}
```

### 1-3. `lib/db/getSiteData.js` の `getLatestPosts` 関数内
```js
const latestPosts = Object.create(allPosts).sort((a, b) => {
  const dateA = new Date(a?.lastEditedDate || a?.publishDate)
  const dateB = new Date(b?.lastEditedDate || b?.publishDate)
  return dateB - dateA
})
```

---

## 問題点
1. `properties.date` の中身が Notion DB のフィールド名に依存している
   - Notion DB の日付プロパティ名は設定によって変わるが、コードは `properties.date` を決め打ちで参照している
   - `properties.date` が `{ start_date: "2026-01-01" }` の形で取得できていない場合、`created_time` にフォールバックしてしまう
2. `getLatestPosts()` ではメインのソートキーが `lastEditedDate` であり、`publishDate` はあくまでフォールバックになっている
   - 仕様「ソートキーを publish_date DESC に変更」と矛盾する
3. ソート設定 `POSTS_SORT_BY` がデフォルト `'notion'` のため、Notion DB のビュー順が使われてしまう
   - 環境変数で上書き可能だが、デフォルトを変える必要がある

---

## 修正仕様

### `lib/notion/getPageProperties.js`
- [x] すでに実装あり（`properties.publishDate` / `properties.publishDay`）
- [ ] ただしフォールバック順序を見直す
  - 最優先: Notion DB の「日付」プロパティ（`properties.date.start_date`）
  - 次点: `value.created_time`
  - 最終: `new Date().getTime()`
- [ ] `properties.date` がオブジェクトではない（配列など）場合のガードを追加

### `lib/db/getSiteData.js`
- [ ] `getLatestPosts()` 関数内のソートを修正
  - 変更前: `const dateA = new Date(a?.lastEditedDate || a?.publishDate)`
  - 変更後: `const dateA = a?.publishDate || a?.lastEditedDate`
  - ソート順: DESC（降順、`b - a` のまま維持）

### `conf/post.config.js`
- [ ] デフォルト値を `'notion'` → `'date'` に変更
```js
POSTS_SORT_BY: process.env.NEXT_PUBLIC_POST_SORT_BY || 'date',
```
- [ ] 環境変数 `NEXT_PUBLIC_POST_SORT_BY=date` を `.env.example` にも追記

---

## 実装担当への注意事項
- `allPages` 配列に格納されるオブジェクトは、複数テーマで共有されるため、プロパティ名 `publishDate` と `lastEditedDate` を両方とも維持すること
- `BlogListScroll.js` や `BlogListPage.js` が `allPages` を直接ソートしている場合は影響を受けないことを確認（通常は `getGlobalData` 側でソート済みの配列が渡る想定）
- デフォルト変更により、ビルド時の並び順が変わるため、既存サイトの表示順が変わる可能性を了承すること