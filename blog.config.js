const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3',
  REVALIDATE_IDLE: 0, 
  REVALIDATE_SECOND: 0,
  NOTION_PAGE_ID: process.env.NOTION_PAGE_ID || '2f937055-8b22-80d9-b723-000bfd763007', 


  THEME: process.env.NEXT_PUBLIC_THEME || 'hexo', 
  LANG: 'ja-JP', 
  SINCE: 2026, 


  PSEUDO_STATIC: false, 
  // 【重要】ここを 0 または null に設定することで ISR エラーを回避します
  NEXT_REVALIDATE_SECOND: 0, 
  
  APPEARANCE: 'light', 

  AUTHOR: 'Mirai AI Lab', // そのままでもOKですが、'Mirai AI Lab' と大文字にするとより公式感が出ます
  BIO: 'つくばみらい市から、AIの今と未来を思考する。', // 特定の職業を伏せ、知的な「観測者」として定義
  LINK: 'https://mirai-ai-lab.pages.dev', 
  KEYWORDS: 'AI, 生成AI, つくばみらい市, 技術, デジタル', // 教育関連を外し、現在のコンテンツに最適化
  BLOG_FAVICON: '/favicon.ico',

  // blog.config.js 内を探してください
  ENABLE_RSS: process.env.NEXT_PUBLIC_ENABLE_RSS || false, // ここを false に書き換え

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

// --- ここから追加：Meiryo最優先・強制上書き ---
  FONT_STYLE: 'font-sans', 
  FONT_SANS: [
    'Meiryo', 'メイリオ', 'Inter', 'system-ui', '-apple-system', 
    'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Noto Sans JP', 'sans-serif'
  ],
  CUSTOM_EXTERNAL_CSS: [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap',
    // bodyとnotion全体にMeiryoを強制。!importantで「きもい明朝」を完全に粉砕します。
    'body { font-family: "Meiryo", "メイリオ", "Noto Sans JP", sans-serif !important; }',
    '.notion { font-family: "Meiryo", "メイリオ", "Noto Sans JP", sans-serif !important; }'
  ],
  // ------------------------------------------
  
  CUSTOM_EXTERNAL_JS: [''],
  CUSTOM_MENU: true, 
  CAN_COPY: true, 
  LAYOUT_SIDEBAR_REVERSE: false,
  GREETING_WORDS: 'つくばみらい市から発信する、技術と暮らしの思考ログ。日々の「微かな違和感」を論理の視点から解き明かす。',
  UUID_REDIRECT: false
}

module.exports = BLOG
