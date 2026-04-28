/**
 * Notion関連の読み込み設定
 * Notionにカスタムフィールドを追加した場合は、このファイルを修正してください。
 * このファイルの内容は環境変数で上書き可能ですが、NOTION_CONFIGによる一括上書きはサポートされていません。
 */

// ★ デバッグ: 環境変数のキー存在確認（ビルドログ出力用）
console.log('[DEBUG ENV] NOTION_TOKEN_V2 key exists:', 'NOTION_TOKEN_V2' in process.env)
console.log('[DEBUG ENV] NOTION_ACTIVE_USER key exists:', 'NOTION_ACTIVE_USER' in process.env)
console.log('[DEBUG ENV] NOTION_TOKEN_V2 value preview:', (process.env.NOTION_TOKEN_V2 || '(undefined)').substring(0, 30) + '...')
console.log('[DEBUG ENV] Available NOTION/TOKEN keys:', Object.keys(process.env).filter(k => k.includes('NOTION') || k.includes('TOKEN') || k.includes('ACCESS')))
console.log('[DEBUG ENV] ALL env keys count:', Object.keys(process.env).length)

module.exports = {
  // Notionデータベースのインデックス。どのビューをデータソースとして使用するか（0から開始）
  NOTION_INDEX: process.env.NEXT_PUBLIC_NOTION_INDEX || 0,

  // Notionデータベースのプロパティ名（フィールド名）のカスタム設定
  NOTION_PROPERTY_NAME: {
    password: process.env.NEXT_PUBLIC_NOTION_PROPERTY_PASSWORD || 'password',
    type: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE || 'type', // 記事タイプ
    type_post: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_POST || 'Post', // 通常のブログ記事
    type_page: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_PAGE || 'Page', // 固定ページ
    type_notice:
      process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_NOTICE || 'Notice', // お知らせ
    type_menu: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_MENU || 'Menu', // メニュー
    type_sub_menu:
      process.env.NEXT_PUBLIC_NOTION_PROPERTY_TYPE_SUB_MENU || 'SubMenu', // サブメニュー
    title: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TITLE || 'title', // タイトル
    status: process.env.NEXT_PUBLIC_NOTION_PROPERTY_STATUS || 'status', // 公開ステータス
    status_publish:
      process.env.NEXT_PUBLIC_NOTION_PROPERTY_STATUS_PUBLISH || 'published', // 公開済み
    status_invisible:
      process.env.NEXT_PUBLIC_NOTION_PROPERTY_STATUS_INVISIBLE || 'Invisible', // 非表示
    summary: process.env.NEXT_PUBLIC_NOTION_PROPERTY_SUMMARY || 'summary', // 概要
    slug: process.env.NEXT_PUBLIC_NOTION_PROPERTY_SLUG || 'slug', // URLスラッグ
    category: process.env.NEXT_PUBLIC_NOTION_PROPERTY_CATEGORY || 'category', // カテゴリ
    date: process.env.NEXT_PUBLIC_NOTION_PROPERTY_DATE || 'date', // 日付
    tags: process.env.NEXT_PUBLIC_NOTION_PROPERTY_TAGS || 'tags', // タグ
    icon: process.env.NEXT_PUBLIC_NOTION_PROPERTY_ICON || 'icon', // アイコン
    ext: process.env.NEXT_PUBLIC_NOTION_PROPERTY_EXT || 'ext' // 拡張フィールド（JSON形式）
  },
  NOTION_ACTIVE_USER: process.env.NOTION_ACTIVE_USER || '',
  NOTION_TOKEN_V2: process.env.NOTION_TOKEN_V2 || process.env.NOTION_ACCESS_TOKEN || '' // データベースを非公開にする場合に必要（token_v2）
}
