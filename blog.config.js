const BLOG = {
  API_BASE_URL: process.env.API_BASE_URL || 'https://www.notion.so/api/v3',
  REVALIDATE_IDLE: 0, 
  REVALIDATE_SECOND: 0,
  NOTION_PAGE_ID: process.env.NOTION_PAGE_ID || '2f9370558b2280389aefc7da882b7c66', 

  THEME: process.env.NEXT_PUBLIC_THEME || 'hexo', 
  LANG: 'ja-JP', 
  SINCE: 2024, 

  PSEUDO_STATIC: false, 
  // 【重要】ここを 0 または null に設定することで ISR エラーを回避します
  NEXT_REVALIDATE_SECOND: null, 
  
  APPEARANCE: 'light', 

  AUTHOR: 'mirai-ai-lab', 
  BIO: 'つくばみらい市の特別支援教育ガイド', 
  LINK: 'https://mirai-ai-lab.pages.dev', 
  KEYWORDS: 'つくばみらい市, 特別支援学級, 教育', 
  BLOG_FAVICON: '/favicon.ico', 

  // RSSは静的出力でも動作可能ですが、一旦ビルドを通すために false のままでOKです
  ENABLE_RSS: false, 

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
