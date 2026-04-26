const CONFIG = {
  // ブログタイトル（バイリンガル）
  TYPOGRAPHY_BLOG_NAME: process.env.NEXT_PUBLIC_TYPOGRAPHY_BLOG_NAME || '活字印刷',
  TYPOGRAPHY_BLOG_NAME_EN: process.env.NEXT_PUBLIC_TYPOGRAPHY_BLOG_NAME_EN || process.env.NEXT_PUBLIC_TYPOGRAPHY_BLOG_NAME || 'Typography',

  TYPOGRAPHY_POST_AD_ENABLE: process.env.NEXT_PUBLIC_TYPOGRAPHY_POST_AD_ENABLE || false, // 記事リストに広告を挿入するかどうか

  TYPOGRAPHY_POST_COVER_ENABLE: process.env.NEXT_PUBLIC_TYPOGRAPHY_POST_COVER_ENABLE || false, // ブログのカバー画像を表示するかどうか

  TYPOGRAPHY_ARTICLE_RECOMMEND_POSTS: process.env.NEXT_PUBLIC_TYPOGRAPHY_ARTICLE_RECOMMEND_POSTS || true, // 記事詳細の下部におすすめ記事を表示

  // メニュー設定
  TYPOGRAPHY_MENU_CATEGORY: true, // カテゴリを表示
  TYPOGRAPHY_MENU_TAG: true, // タグを表示
  TYPOGRAPHY_MENU_ARCHIVE: true, // アーカイブを表示
}
export default CONFIG
