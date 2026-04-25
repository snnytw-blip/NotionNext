const CONFIG = {
  HEXO_HOME_BANNER_ENABLE: true,
  // 3.14.1以降のバージョンでは、挨拶文はblog.config.jsで設定し、半角カンマ','で複数区切ります。
  HEXO_HOME_BANNER_GREETINGS: [
    'こんにちは、エンジニアです',
    'こんにちは、日々を綴っています',
    'こんにちは、未来を思考しています',
    '私のブログへようこそ🎉'
  ], // ヒーローセクションの挨拶文

  HEXO_HOME_NAV_BUTTONS: true, // ページ上部にカテゴリなどのナビゲーションボタンを表示するか
  // 既知の未修正バグ：モバイル版でtrueにすると画像が読み込まれないことがあるため、一時的にfalseを推奨します。
  HEXO_HOME_NAV_BACKGROUND_IMG_FIXED: false, // スクロール時に背景画像を固定するか。trueで固定、falseで一緒にスクロールします。
  // 「読み始める」ボタンを表示するか
  HEXO_SHOW_START_READING: true,

  // メニュー設定
  HEXO_MENU_INDEX: true, // ホームを表示
  HEXO_MENU_CATEGORY: true, // カテゴリを表示
  HEXO_MENU_TAG: true, // タグを表示
  HEXO_MENU_ARCHIVE: true, // アーカイブを表示
  HEXO_MENU_SEARCH: true, // 検索を表示
  HEXO_MENU_RANDOM: true, // ランダム表示ボタンを表示

  HEXO_POST_LIST_COVER: true, // リストに記事のカバー画像を表示
  HEXO_POST_LIST_COVER_HOVER_ENLARGE: false, // マウスホバーで画像を拡大

  HEXO_POST_LIST_COVER_DEFAULT: true, // カバー画像がない場合にサイトの背景をデフォルトにする
  HEXO_POST_LIST_SUMMARY: true, // 記事の概要を表示
  HEXO_POST_LIST_PREVIEW: false, // 記事のプレビューを読み込む
  HEXO_POST_LIST_IMG_CROSSOVER: true, // ブログリストの画像を左右交互に配置

  HEXO_ARTICLE_ADJACENT: true, // 前の記事・次の記事のレコメンドを表示
  HEXO_ARTICLE_COPYRIGHT: true, // 記事の著作権表示を表示
  HEXO_ARTICLE_NOT_BY_AI: false, // 「AIによる執筆ではありません」を表示
  HEXO_ARTICLE_RECOMMEND: true, // 関連記事のレコメンドを表示

  HEXO_WIDGET_LATEST_POSTS: true, // 最新記事ウィジェットを表示
  HEXO_WIDGET_ANALYTICS: false, // 統計カードを表示
  HEXO_WIDGET_TO_TOP: true, // トップへ戻るボタン
  HEXO_WIDGET_TO_COMMENT: true, // コメント欄へジャンプ
  HEXO_WIDGET_DARK_MODE: true, // ダークモード切り替え
  HEXO_WIDGET_TOC: true, // モバイル版のフローティング目次

  HEXO_THEME_COLOR: '#928CEE' // テーマカラー設定（デフォルトは #928CEE）
}
export default CONFIG
