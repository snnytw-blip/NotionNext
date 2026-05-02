# 作業指示書

## タスク名
favicon をデフォルトから変更

---

## 対象ファイル
- `blog.config.js`
- `public/` ディレクトリ（画像ファイル）
- `.env.example`（参照）

---

## 現状コード（該当箇所）

### `blog.config.js`（抜粋）
```js
BLOG_FAVICON: '/favicon.ico', // ファビコン
```

### `public/` ディレクトリ
```
favicon.ico    // デフォルトの favicon
favicon.svg    // SVG 版 favicon
```

### `components/SEO.js`（抜粋）
```js
const favicon = siteConfig('BLOG_FAVICON')
// ...
<link rel='icon' href={favicon} />
// ...
const BLOG_FAVICON = siteConfig('BLOG_FAVICON', null, NOTION_CONFIG)
// ...
<link rel='icon' href={BLOG_FAVICON} />
```

---

## 問題点
1. 現在の `favicon.ico` は NotionNext のデフォルトアイコンであり、サイトのブランディングに合わない
2. 差し替え用の favicon 画像ファイルがまだ用意されていない（要作成）
3. SEO.js 内で `favicon` と `BLOG_FAVICON` の 2 つの `<link rel='icon'>` が出力されている（重複の可能性）

---

## 修正仕様

### 1. favicon 画像の用意
- [ ] 新しい favicon 画像を作成し、`public/favicon.ico` を上書き
  - 推奨サイズ: 32x32, 48x48, またはマルチアイコン .ico
- [ ] 必要に応じて `public/favicon.svg` も差し替え（モダンブラウザ向け）
- [ ] PNG 版（`public/favicon.png`）があれば、`apple-touch-icon` としても流用可能

### 2. `blog.config.js`
- [ ] 変更は不要（既に `/favicon.ico` を指しているため、ファイル差し替えで対応可能）
- [ ] 別ファイル名にする場合は以下を変更
```js
BLOG_FAVICON: '/new-favicon.ico', // ファビコン
```

### 3. `components/SEO.js`（任意・軽微な修正）
- [ ] 確認: 2 つの `<link rel='icon'>` が重複していないか調査
  - 1 つ目: `<link rel='icon' href={favicon} />`（L70付近）
  - 2 つ目: `<link rel='icon' href={BLOG_FAVICON} />`（L91付近）
  - `favicon` も `BLOG_FAVICON` も同じ `siteConfig('BLOG_FAVICON')` を参照しているため重複の可能性が高い
  - [ ] 重複している場合、2 つ目の `<link rel='icon' href={BLOG_FAVICON} />` を削除（または逆でも可）

---

## 実装担当への注意事項
- `public/` ディレクトリ内のファイルはビルド時にそのまま公開ディレクトリにコピーされるため、ファイル名を変更する場合は `blog.config.js` 側のパスも合わせること
- favicon がブラウザにキャッシュされている場合、変更が即座に反映されないことがある（キャッシュクリアまたはスーパーリロードで確認）
- 既存の `public/favicon.ico` をバックアップしてから上書きすることを推奨
- SEO.js の重複リンク削除は任意（動作に支障はないが、HTML の冗長性を減らすため）