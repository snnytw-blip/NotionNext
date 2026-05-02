"# 作業指示書

## タスク名
category / site プロパティの取得・フィルタ処理を追加

---

## 対象ファイル
- `conf/notion.config.js`
- `lib/notion/getPageProperties.js`
- `lib/db/getSiteData.js`
- `lib/notion/getAllCategories.js`（参照）
- `lib/notion/getAllTags.js`（参照）

---

## 現状コード（該当箇所）

### 3-1. `conf/notion.config.js`
```js
NOTION_PROPERTY_NAME: {
  // ...
  category: process.env.NEXT_PUBLIC_NOTION_PROPERTY_CATEGORY || 'category',
  // site プロパティは未定義
}
```

### 3-2. `lib/notion/getPageProperties.js` 後半
```js
properties.category = properties.category?.[0] || ''
// site に相当する処理なし
```

### 3-3. `lib/db/getSiteData.js` の `convertNotionToSiteData`
- `getCategoryOptions(schema)` でスキーマからカテゴリセレクトオプションを取得
- `getAllCategories({ allPages, categoryOptions })` でカテゴリ一覧を生成
- フィルタや site による絞り込みは未実装

---

## 問題点
1. **site プロパティが未登録**
   - `NOTION_PROPERTY_NAME` に `site` が定義されていないため、Notion DB に `site` カラムがあっても取得されない
2. **category は文字列化されるが site はされない**
   - `getPageProperties.js` では `category` に対して `[0]` で先頭要素を取る処理があるが、`site` にはない
3. **フィルタ処理が未実装**
   - 特定の `site` 値を持つ記事だけを表示するようなフィルタが存在しない
   - 複数サイト運用時に Notion DB を共有する場合、サイト別に記事を振り分けられない

---

## 修正仕様

### `conf/notion.config.js`
- [ ] `NOTION_PROPERTY_NAME` に `site` を追加
```js
site: process.env.NEXT_PUBLIC_NOTION_PROPERTY_SITE || 'site',
```

### `lib/notion/getPageProperties.js`
- [ ] `category` と同様に `site` も単一文字列として取得
  - `properties.category = properties.category?.[0] || ''` の直後に以下を追加
```js
properties.site = properties.site?.[0] || ''
```
- [ ] スキーママッピング対象として `site` を認識させる（必要に応じてキーマッピング部分に `site` を追加）

### `lib/db/getSiteData.js`
- [ ] 環境変数 `NEXT_PUBLIC_SITE_FILTER` でフィルタ文字列を受け取り、該当する記事のみ `allPages` に含める処理を追加
- [ ] `collectionData.forEach(...)` で `adjustPageProperties` した後、`collectionData.filter(...)` する前にフィルタをかける
```js
// site フィルタ
const SITE_FILTER = process.env.NEXT_PUBLIC_SITE_FILTER || ''
if (SITE_FILTER) {
  collectionData = collectionData.filter(post => post.site === SITE_FILTER)
}
```
- [ ] ただし `collectionData` は const で宣言されているため、`let` に変更する or 新しい変数に代入する

### `.env.example`
- [ ] 追記:
```bash
# サイトフィルタ（Notion DB の site プロパティと一致する記事のみ表示）
NEXT_PUBLIC_SITE_FILTER=
```

---

## 実装担当への注意事項
- `site` プロパティの型は未確認（`select` か `multi_select` か）。現在のコードベースでは `select` を想定しているが、Notion DB 側の実際の型に合わせること
- `getPageProperties.js` のキーマッピングロジックは複雑なフォールバック処理を含んでいるため、`site` プロパティが Notion DB のカラム名と一致しない場合は `NOTION_PROPERTY_NAME` 経由でマッピングされる想定
- `getAllCategories` や `getAllTags` の既存ロジックには影響を与えないこと
- フィルタを追加しても、`tagOptions` や `categoryOptions` の集計は全記事を対象にするか、フィルタ後を対象にするか、設計判断が必要（指示書では単純化のためフィルタ後の `collectionData` に対して集計する）
- 既存の `allPages` を用いているテーマ側には `site` プロパティが追加されるだけで、破壊的変更にはならない想定"