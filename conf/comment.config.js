/**
 * 外部コメント・ウィジェット関連の設定
 * 複数のコンポーネント（WALINE, VALINE, GISCUS, CUSDIS, UTTERRANCES, GITALK等）を同時に有効化できます。
 */
module.exports = {
  COMMENT_HIDE_SINGLE_TAB:
    process.env.NEXT_PUBLIC_COMMENT_HIDE_SINGLE_TAB || false, // タブが一つしかない場合に、タブ切り替えバーを非表示にするか

  // artalk コメント
  COMMENT_ARTALK_SERVER: process.env.NEXT_PUBLIC_COMMENT_ARTALK_SERVER || '', // Artalk サーバーのアドレス
  COMMENT_ARTALK_JS:
    process.env.NEXT_PUBLIC_COMMENT_ARTALK_JS ||
    'https://cdnjs.cloudflare.com/ajax/libs/artalk/2.5.5/Artalk.js', // Artalk JS CDN
  COMMENT_ARTALK_CSS:
    process.env.NEXT_PUBLIC_COMMENT_ARTALK_CSS ||
    'https://cdnjs.cloudflare.com/ajax/libs/artalk/2.5.5/Artalk.css', // Artalk CSS CDN

  // twikoo
  COMMENT_TWIKOO_ENV_ID: process.env.NEXT_PUBLIC_COMMENT_ENV_ID || '', // TWIKOO環境ID（Tencent CloudならenvId、Vercelならドメイン）
  COMMENT_TWIKOO_COUNT_ENABLE:
    process.env.NEXT_PUBLIC_COMMENT_TWIKOO_COUNT_ENABLE || false, // 記事リストにコメント数を表示するか
  COMMENT_TWIKOO_CDN_URL:
    process.env.NEXT_PUBLIC_COMMENT_TWIKOO_CDN_URL ||
    'https://s4.zstatic.net/npm/twikoo@1.6.44/dist/twikoo.min.js', // twikoo クライアント CDN

  // utterance
  COMMENT_UTTERRANCES_REPO:
    process.env.NEXT_PUBLIC_COMMENT_UTTERRANCES_REPO || '', // GitHubリポジトリ名（例：'user/repo'）

  // giscus @see https://giscus.app/
  COMMENT_GISCUS_REPO: process.env.NEXT_PUBLIC_COMMENT_GISCUS_REPO || '', // GitHubリポジトリ名
  COMMENT_GISCUS_REPO_ID: process.env.NEXT_PUBLIC_COMMENT_GISCUS_REPO_ID || '', // リポジトリID
  COMMENT_GISCUS_CATEGORY_ID:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_CATEGORY_ID || '', // ディスカッションのカテゴリID
  COMMENT_GISCUS_MAPPING:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_MAPPING || 'pathname', // 記事の識別方法（デフォルト 'pathname'）
  COMMENT_GISCUS_REACTIONS_ENABLED:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_REACTIONS_ENABLED || '1', // リアクション（絵文字）を有効にするか（'1' or '0'）
  COMMENT_GISCUS_EMIT_METADATA:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_EMIT_METADATA || '0', // メタデータを抽出するか（'1' or '0'）
  COMMENT_GISCUS_INPUT_POSITION:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_INPUT_POSITION || 'bottom', // 入力欄の位置（'top' or 'bottom'）
  COMMENT_GISCUS_LANG: process.env.NEXT_PUBLIC_COMMENT_GISCUS_LANG || 'ja', // 言語（'ja', 'en', 'zh-CN'等）
  COMMENT_GISCUS_LOADING:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_LOADING || 'lazy', // 読み込み方式（デフォルト 'lazy'）
  COMMENT_GISCUS_CROSSORIGIN:
    process.env.NEXT_PUBLIC_COMMENT_GISCUS_CROSSORIGIN || 'anonymous', // crossorigin属性

  COMMENT_CUSDIS_APP_ID: process.env.NEXT_PUBLIC_COMMENT_CUSDIS_APP_ID || '', // Cusdis App ID
  COMMENT_CUSDIS_HOST:
    process.env.NEXT_PUBLIC_COMMENT_CUSDIS_HOST || 'https://cusdis.com', // Cusdis ホスト
  COMMENT_CUSDIS_SCRIPT_SRC:
    process.env.NEXT_PUBLIC_COMMENT_CUSDIS_SCRIPT_SRC || '/js/cusdis.es.js', // Cusdis スクリプトパス

  // gitalk コメント @see https://gitalk.github.io/
  COMMENT_GITALK_REPO: process.env.NEXT_PUBLIC_COMMENT_GITALK_REPO || '', // GitHubリポジトリ名
  COMMENT_GITALK_OWNER: process.env.NEXT_PUBLIC_COMMENT_GITALK_OWNER || '', // GitHubユーザー名
  COMMENT_GITALK_ADMIN: process.env.NEXT_PUBLIC_COMMENT_GITALK_ADMIN || '', // 管理者名（通常は自分）
  COMMENT_GITALK_CLIENT_ID:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_CLIENT_ID || '', // Client ID
  COMMENT_GITALK_CLIENT_SECRET:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_CLIENT_SECRET || '', // Client Secret
  COMMENT_GITALK_DISTRACTION_FREE_MODE: false, // フォーカスモード
  COMMENT_GITALK_JS_CDN_URL:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_JS_CDN_URL ||
    'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.min.js', // gitalk JS CDN
  COMMENT_GITALK_CSS_CDN_URL:
    process.env.NEXT_PUBLIC_COMMENT_GITALK_CSS_CDN_URL ||
    'https://cdn.jsdelivr.net/npm/gitalk@1/dist/gitalk.css', // gitalk CSS CDN

  COMMENT_GITTER_ROOM: process.env.NEXT_PUBLIC_COMMENT_GITTER_ROOM || '', // Gitter チャットルーム名
  COMMENT_DAO_VOICE_ID: process.env.NEXT_PUBLIC_COMMENT_DAO_VOICE_ID || '', // DaoVoice ID
  COMMENT_TIDIO_ID: process.env.NEXT_PUBLIC_COMMENT_TIDIO_ID || '', // Tidio ID

  COMMENT_VALINE_CDN:
    process.env.NEXT_PUBLIC_VALINE_CDN ||
    'https://unpkg.com/valine@1.5.1/dist/Valine.min.js',
  COMMENT_VALINE_APP_ID: process.env.NEXT_PUBLIC_VALINE_ID || '', // Valine App ID
  COMMENT_VALINE_APP_KEY: process.env.NEXT_PUBLIC_VALINE_KEY || '',
  COMMENT_VALINE_SERVER_URLS: process.env.NEXT_PUBLIC_VALINE_SERVER_URLS || '', // カスタムサーバーURL
  COMMENT_VALINE_PLACEHOLDER:
    process.env.NEXT_PUBLIC_VALINE_PLACEHOLDER || 'コメントを残す...', // プレースホルダー

  COMMENT_WALINE_SERVER_URL: process.env.NEXT_PUBLIC_WALINE_SERVER_URL || '', // Waline サーバーURL
  COMMENT_WALINE_RECENT: process.env.NEXT_PUBLIC_WALINE_RECENT || false, // 最新コメントを表示するか

  // WebMention 設定 @see https://webmention.io
  COMMENT_WEBMENTION_ENABLE: process.env.NEXT_PUBLIC_WEBMENTION_ENABLE || false,
  COMMENT_WEBMENTION_AUTH: process.env.NEXT_PUBLIC_WEBMENTION_AUTH || '',
  COMMENT_WEBMENTION_HOSTNAME:
    process.env.NEXT_PUBLIC_WEBMENTION_HOSTNAME || '',
  COMMENT_WEBMENTION_TWITTER_USERNAME:
    process.env.NEXT_PUBLIC_TWITTER_USERNAME || '',
  COMMENT_WEBMENTION_TOKEN: process.env.NEXT_PUBLIC_WEBMENTION_TOKEN || ''
}
