const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3',
  
  // 重要：あなたのNotion Page IDだけに絞ります（多言語の残骸を削除）
  NOTION_PAGE_ID: process.env.NOTION_PAGE_ID || '2f937055728b43869931341c21060635', 

  THEME: process.env.NEXT_PUBLIC_THEME || 'simple', 
  LANG: 'ja-JP', // 日本語固定
  SINCE: 2024, 

  PSEUDO_STATIC: false, 
  NEXT_REVALIDATE_SECOND: 60, 
  APPEARANCE: 'light', 

  AUTHOR: 'mirai-ai-lab', 
  BIO: 'つくばみらい市の特別支援教育ガイド', // 中国語を排除
  LINK: 'https://mirai-ai-lab.pages.dev', 
  KEYWORDS: 'つくばみらい市, 特別支援学級, 教育', 
  BLOG_FAVICON: '/favicon.ico', 

  ENABLE_RSS: true, 

  // 外部設定の読み込み
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

  CUSTOM_EXTERNAL_JS: [''],
  CUSTOM_EXTERNAL_CSS: [''],
  CUSTOM_MENU: true, 
  CAN_COPY: true, 
  LAYOUT_SIDEBAR_REVERSE: false,
  GREETING_WORDS: 'つくばみらい市特別支援学級 Guideへようこそ',
  UUID_REDIRECT: false
}

module.exports = BLOG
