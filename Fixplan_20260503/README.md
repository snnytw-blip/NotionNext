# P0タスク - 実装作業指示書 索引

## タスク一覧

| # | タスク名 | 作業指示書 | 主な対象ファイル |
|---|----------|-----------|-----------------|
| 1 | publish_date を Notion DB から取得してソートに使う | `task1_publish_date.md` | `lib/notion/getPageProperties.js`, `lib/db/getSiteData.js` |
| 2 | ソートキーを last_edited_time → publish_date DESC に変更 | `task2_sort_key.md` | `lib/db/getSiteData.js`, `conf/post.config.js` |
| 3 | category / site プロパティの取得・フィルタ処理を追加 | `task3_category_site_filter.md` | `conf/notion.config.js`, `lib/notion/getPageProperties.js`, `lib/db/getSiteData.js` |
| 4 | canonical タグを各記事ページの <head> に自動出力 | `task4_canonical_tag.md` | `components/SEO.js` |
| 5 | favicon をデフォルトから変更 | `task5_favicon.md` | `public/favicon.ico`, `blog.config.js` |
| 6 | footer をデフォルトから「© 2026 未来AIラボ」に変更 | `task6_footer.md` | `themes/hexo/components/Footer.js` |

## 依存関係
- **タスク1 → タスク2**: タスク1 で `publishDate` の確実な取得が前提となり、その値をタスク2でソートに使用
- **タスク3**: 独立して実施可能（他のタスクと並行して進められる）
- **タスク4〜6**: それぞれ独立して実施可能

## 実装順序の推奨
1. タスク1 (publish_date 取得)
2. タスク2 (ソート変更)
3. タスク3 (category/site フィルタ)
4. タスク4 (canonical タグ)
5. タスク5 (favicon 差し替え)
6. タスク6 (footer 変更)

## 環境変数の変更が必要なファイル
- `.env.example` に以下を追加:
  ```bash
  # ソート順 (date=publish_dateの降順, notion=Notionのビュー順)
  NEXT_PUBLIC_POST_SORT_BY=date
  # サイトフィルタ（Notion DB の site プロパティと一致する記事のみ表示）
  NEXT_PUBLIC_SITE_FILTER=
  # Notion DB の site プロパティ名（デフォルト: site）
  NEXT_PUBLIC_NOTION_PROPERTY_SITE=site
  ```
