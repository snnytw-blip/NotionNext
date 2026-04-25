const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3',
  REVALIDATE_IDLE: 0, // アイドル時の再検証（秒）
  REVALIDATE_SECOND: 0, // 再検証間隔（秒）

  THEME: process.env.NEXT_PUBLIC_THEME || 'hexo', // デフォルトテーマ
  LANG: 'ja-JP', // サイト言語
  SINCE: 2026, // サイト開始年
  NOTION_PAGE_ID: process.env.NOTION_PAGE_ID || '', // NotionデータベースのID

  PSEUDO_STATIC: false, // 擬似静的化（ISRの挙動に影響）
  // 【重要】ビルド時のエラー回避のため、0 または null に設定
  NEXT_REVALIDATE_SECOND: 0, 
  
  APPEARANCE: 'light', // 外観（light / dark / auto）

  AUTHOR: 'Mirai AI Lab', // 著者名
  BIO: 'つくばみらい市から、AIの今と未来を思考する。', // プロフィール
  LINK: 'https://mirai-ai-lab.pages.dev', // サイトURL
  KEYWORDS: 'AI, 生成AI, つくばみらい市, 技術, デジタル', // 検索キーワード
  BLOG_FAVICON: '/favicon.ico', // ファビコン

  ENABLE_RSS: process.env.NEXT_PUBLIC_ENABLE_RSS || false, // RSSフィードの有効化

  // 各種設定ファイルの読み込み
  ...require('./conf/comment.config'),
  ...require('./conf/contact.config'),
  ...require('./conf/post.config'),
  ...require('./conf/analytics.config'),
  ...require('./conf/image.config'),
  ...require('./conf/font.config'),
  ...require('./conf/right-click-menu'),
  ...require('./conf/code.config'),
  ...require('./conf/animation.config'),
  ...require('./conf/widget.config'),
  ...require('./conf/ad.config'),
  ...require('./conf/plugin.config'),
  ...require('./conf/performance.config'),
  ...require('./conf/layout-map.config'),
  ...require('./conf/notion.config'),
  ...require('./conf/dev.config'),

// --- フォント設定：メイリオ優先 ---
  FONT_STYLE: 'font-sans', 
  FONT_SANS: [
    'Meiryo', 'メイリオ', 'Inter', 'system-ui', '-apple-system', 
    'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans JP', 'sans-serif'
  ],
  CUSTOM_EXTERNAL_CSS: [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap'
  ],
  // ------------------------------------------
  
  CUSTOM_EXTERNAL_JS: [''],
  CUSTOM_MENU: true, // カスタムメニューの有効化
  CAN_COPY: true, // コンテンツのコピー許可
  LAYOUT_SIDEBAR_REVERSE: false, // サイドバーの左右反転
  GREETING_WORDS: 'つくばみらい市から発信する、技術と暮らしの思考ログ。日々の「微かな違和感」を論理の視点から解き明かす。',
  UUID_REDIRECT: false // UUIDによるリダイレクトの有効化
}

module.exports = BLOG
