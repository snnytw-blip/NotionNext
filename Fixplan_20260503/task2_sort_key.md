# 作業指示書

## タスク名
ソートキーを last_edited_time → publish_date DESC に変更

---

## 対象ファイル
- `lib/db/getSiteData.js`
- `lib/notion/getPageProperties.js`
- `conf/post.config.js`
- `.env.example`

---

## 現状コード（該当箇所）

### `lib/db/getSiteData.js` (L492付近)
```js
function getLatestPosts({ allPages, from, latestPostCount }) {
  const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  const latestPosts = Object.create(allPosts).sort((a, b) => {
    const dateA = new Date(a?.lastEditedDate || a?.publishDate)
    const dateB = new Date(b?.lastEditedDate || b?.publishDate)
    return dateB - dateA
  })
  return latestPosts.slice(0, latestPostCount)
}
```

### `lib/db/getSiteData.js` (L293付近)
```js
if (siteConfig('POSTS_SORT_BY', null, NOTION_CONFIG) === 'date') {
  allPages.sort((a, b) => {
    return b?.publishDate - a?.publishDate
  })
}
```

### `conf/post.config.js`
```js
POSTS_SORT_BY: process.env.NEXT_PUBLIC_POST_SORT_BY || 'notion',
```

---

## 問題点
1. `getLatestPosts()` は `lastEditedDate` を主ソートキーとしており、`publishDate` はあくまでフォールバック
   - 改修計画では「publish_date を Notion DB から取得してソートに使う」が目的
2. `POSTS_SORT_BY` のデフォルト値が `'notion'` になっているため、明示的に設定しない限り `allPages` はDBビュー順のまま
3. 2つのソートロジック（`getLatestPosts` と `allPages` 本体）で一貫性がない

---

## 修正仕様

### `lib/db/getSiteData.js` - `getLatestPosts()`
- [ ] ソートキーを `publishDate` 優先に変更
  ```js
  const latestPosts = Object.create(allPosts).sort((a, b) => {
    const dateA = a?.publishDate || a?.lastEditedDate || 0
    const dateB = b?.publishDate || b?.lastEditedDate || 0
    return dateB - dateA  // DESC
  })
  ```
- [ ] `publishDate` も `lastEditedDate` も存在しない場合のフォールバックとして `0` を追加（`new Date(undefined)` が `NaN` になるのを防ぐ）

### `lib/notion/getPageProperties.js`
- [ ] `publishDate` が常に数値（タイムスタンプ）で設定されることを確認
  - 既存コードは `properties.publishDate = testDate.getTime()` で数値化済みだが、フォールバック時も同様に `getTime()` を使っている
  - 問題なければ変更不要（念のため確認のみ）

### `conf/post.config.js`
- [ ] デフォルトソートを `'date'` に変更
  ```js
  POSTS_SORT_BY: process.env.NEXT_PUBLIC_POST_SORT_BY || 'date',
  ```

### `.env.example`
- [ ] 追記:
  ```
  # ソート順 (date=publish_dateの降順, notion=Notionのビュー順)
  NEXT_PUBLIC_POST_SORT_BY=date
  ```

---

## 実装担当への注意事項
- `Object.create(allPosts)` はシャローコピーを作成しているが、配列の場合は `[...allPosts]` の方が安全（スプレッド構文で浅いコピー）。ただし既存コードとの整合性を優先し、変更は最小限に留めること
- `getSiteData.js` の `convertNotionToSiteData` 内のソート条件分岐（`if (siteConfig('POSTS_SORT_BY', ...) === 'date')`）は維持しつつ、デフォルト値を変えることで常に date ソートがかかるようにする
- テーマ側で独自に `allPages` を再ソートしていないか確認する必要はない（データ取得側で一元管理のため）