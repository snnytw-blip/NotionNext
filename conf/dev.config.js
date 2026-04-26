/**
 * 開発者向け設定
 */
module.exports = {
  SUB_PATH: '', // leave this empty unless you want to deploy in a folder
  DEBUG: process.env.NEXT_PUBLIC_DEBUG || false, // デバッグボタンを表示するかどうか
  // TAILWINDCSS設定のカスタムカラー（廃止）
  BACKGROUND_LIGHT: '#eeeeee', // use hex value, don't forget '#' e.g #fffefc
  BACKGROUND_DARK: '#000000', // use hex value, don't forget '#'

  // Redisキャッシュデータベースのアドレス
  REDIS_URL: process.env.REDIS_URL || '',

  ENABLE_CACHE:
    process.env.ENABLE_CACHE ||
    process.env.npm_lifecycle_event === 'build' ||
    process.env.npm_lifecycle_event === 'export', // ビルドプロセス中はデフォルトでキャッシュを有効化します。開発中や実行中にこの機能を有効にする意味はあまりありません。
  isProd: process.env.VERCEL_ENV === 'production' || process.env.CF_PAGES === '1' || process.env.EXPORT, // distinguish between development and production environment (ref: https://vercel.com/docs/environment-variables#system-environment-variables)
  BUNDLE_ANALYZER: process.env.ANALYZE === 'true' || false, // コンパイル時の依存関係とサイズを表示するかどうか
  VERSION: (() => {
    try {
      // 環境変数を優先し、設定されていない場合はpackage.jsonからバージョン番号を取得します
      return (
        process.env.NEXT_PUBLIC_VERSION || require('../package.json').version
      )
    } catch (error) {
      console.warn('Failed to load package.json version:', error)
      return '1.0.0' // デフォルトのバージョン番号
    }
  })()
}
