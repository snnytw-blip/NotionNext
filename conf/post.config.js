/**
 * 記事関連の機能設定
 */
module.exports = {
  // 記事URLのプレフィックス
  POST_URL_PREFIX: process.env.NEXT_PUBLIC_POST_URL_PREFIX ?? 'article',
  // POSTタイプ記事のデフォルトパスプレフィックス。例：/article/[slug]
  // ここを ''（空文字）にすると、プレフィックスなしになります。
  // WordPressのようなカスタムパーマリンク形式に対応： %year%/%month%/%day% をサポート。
  // 例： 'article/%year%/%month%/%day%'

  POST_SCHEDULE_PUBLISH:
    process.env.NEXT_PUBLIC_NOTION_SCHEDULE_PUBLISH !== 'false', // 記事の公開日に基づいて自動的に公開/非公開を制御

  // シェアバー
  POST_SHARE_BAR_ENABLE: process.env.NEXT_PUBLIC_POST_SHARE_BAR || 'true', // 記事下部のシェアバーのオン/オフ
  POSTS_SHARE_SERVICES:
    process.env.NEXT_PUBLIC_POST_SHARE_SERVICES ||
    'link,twitter,line,facebook,email,wechat,qq,weibo,telegram,messenger,reddit,whatsapp,linkedin,csdn,juejin', // シェアサービスの表示順（カンマ区切り）
  // サポートされているサービス：link(コピー),wechat,qq,weibo,email,facebook,twitter,telegram,messenger,line,reddit,whatsapp,linkedin,vkshare,okshare,tumblr,livejournal,mailru,viber,workplace,pocket,instapaper,hatena

  POST_TITLE_ICON: process.env.NEXT_PUBLIC_POST_TITLE_ICON !== 'false', // タイトルアイコンを表示するかどうか
  POST_DISABLE_GALLERY_CLICK:
    process.env.NEXT_PUBLIC_POST_DISABLE_GALLERY_CLICK || false, // ギャラリービューでのクリックを禁止（リンク埋め込み用）
  POST_LIST_STYLE: process.env.NEXT_PUBLIC_POST_LIST_STYLE || 'page', // 記事リストの形式： 'page'（ページ分割）, 'scroll'（無限スクロール）
  POST_LIST_PREVIEW: process.env.NEXT_PUBLIC_POST_PREVIEW || 'false', // リスト表示時に記事プレビューを表示するか
  POST_PREVIEW_LINES: process.env.NEXT_PUBLIC_POST_POST_PREVIEW_LINES || 12, // プレビューの行数
  POST_RECOMMEND_COUNT: process.env.NEXT_PUBLIC_POST_RECOMMEND_COUNT || 6, // おすすめ記事の表示数
  POSTS_PER_PAGE: process.env.NEXT_PUBLIC_POST_PER_PAGE || 12, // 1ページあたりの記事数
  POSTS_SORT_BY: process.env.NEXT_PUBLIC_POST_SORT_BY || 'notion', // 並び替え： 'date'（日付順）, 'notion'（Notionでの順序）

  // 記事の有効期限通知（現在はHeoテーマのみ対応）
  ARTICLE_EXPIRATION_DAYS:
    process.env.NEXT_PUBLIC_ARTICLE_EXPIRATION_DAYS || 90, // 有効期限（日）
  ARTICLE_EXPIRATION_MESSAGE:
    process.env.NEXT_PUBLIC_ARTICLE_EXPIRATION_MESSAGE ||
    'この記事は %%DAYS%% 日前に公開されました。内容が古くなっている可能性があるため、ご注意ください。', // 通知メッセージ（%%DAYS%% が日数に置換されます）
  ARTICLE_EXPIRATION_ENABLED:
    process.env.NEXT_PUBLIC_ARTICLE_EXPIRATION_ENABLED || 'false', // 有効期限通知を有効にするか

  POST_WAITING_TIME_FOR_404:
    process.env.NEXT_PUBLIC_POST_WAITING_TIME_FOR_404 || '8', // 記事読み込みのタイムアウト時間（秒）。タイムアウト後は404へ遷移

  // タグ関連
  TAG_SORT_BY_COUNT: true, // タグを記事数が多い順に並べるか
  IS_TAG_COLOR_DISTINGUISHED:
    process.env.NEXT_PUBLIC_IS_TAG_COLOR_DISTINGUISHED === 'true' || true // 同名のタグで色を分けるか
}
