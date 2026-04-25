/**
 * サイト内のコードブロックの表示設定
 */
module.exports = {
  // START********コード関連********
  // PrismJs 関連
  PRISM_JS_PATH: 'https://npm.elemecdn.com/prismjs@1.29.0/components/',
  PRISM_JS_AUTO_LOADER:
    'https://npm.elemecdn.com/prismjs@1.29.0/plugins/autoloader/prism-autoloader.min.js',

  // コードブロックのテーマ @see https://github.com/PrismJS/prism-themes
  PRISM_THEME_PREFIX_PATH:
    process.env.NEXT_PUBLIC_PRISM_THEME_PREFIX_PATH ||
    'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.css', // デフォルトテーマ
  PRISM_THEME_SWITCH: process.env.NEXT_PUBLIC_PRISM_THEME_SWITCH !== 'false', // ライト/ダークモードでのテーマ切り替えを有効にするか
  PRISM_THEME_LIGHT_PATH:
    process.env.NEXT_PUBLIC_PRISM_THEME_LIGHT_PATH ||
    'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-solarizedlight.css', // ライトモード用テーマ
  PRISM_THEME_DARK_PATH:
    process.env.NEXT_PUBLIC_PRISM_THEME_DARK_PATH ||
    'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-okaidia.min.css', // ダークモード用テーマ

  CODE_MAC_BAR: process.env.NEXT_PUBLIC_CODE_MAC_BAR !== 'false', // 左上のmac風（赤黄緑）アイコンを表示するか
  CODE_LINE_NUMBERS: process.env.NEXT_PUBLIC_CODE_LINE_NUMBERS || false, // 行番号を表示するか
  CODE_COLLAPSE: process.env.NEXT_PUBLIC_CODE_COLLAPSE !== 'false', // コードブロックの折りたたみを有効にするか
  CODE_COLLAPSE_EXPAND_DEFAULT:
    process.env.NEXT_PUBLIC_CODE_COLLAPSE_EXPAND_DEFAULT !== 'false', // デフォルトで展開状態にするか
  // Mermaid チャート CDN
  MERMAID_CDN:
    process.env.NEXT_PUBLIC_MERMAID_CDN ||
    'https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.min.js' // CDN

  // END********コード関連********
}
