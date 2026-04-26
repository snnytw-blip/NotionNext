/**
 * 広告表示プラグイン
 */
module.exports = {
  // Google AdSense
  ADSENSE_GOOGLE_ID: process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_ID || '', // Google AdSense ID（例：ca-pub-xxxxxxxxxxxxxxxx）
  ADSENSE_GOOGLE_TEST: process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_TEST || false, // Google AdSense テストモード。開発用にダミー広告を表示します。詳細は https://www.tangly1024.com/article/local-dev-google-adsense 参照
  ADSENSE_GOOGLE_SLOT_IN_ARTICLE:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_IN_ARTICLE || '3806269138', // 記事内広告のスロットID（data-ad-slotの値）
  ADSENSE_GOOGLE_SLOT_FLOW:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_FLOW || '1510444138', // インフィード広告のスロットID
  ADSENSE_GOOGLE_SLOT_NATIVE:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_NATIVE || '4980048999', // 関連コンテンツ広告（ネイティブ広告）のスロットID
  ADSENSE_GOOGLE_SLOT_AUTO:
    process.env.NEXT_PUBLIC_ADSENSE_GOOGLE_SLOT_AUTO || '8807314373', // ディスプレイ広告（自動広告）のスロットID

  // WWADS（万维广告）
  AD_WWADS_ID: process.env.NEXT_PUBLIC_WWAD_ID || null, // WWADSのユニットID（https://wwads.cn/ で作成）
  AD_WWADS_BLOCK_DETECT: process.env.NEXT_PUBLIC_WWADS_AD_BLOCK_DETECT || false // 広告ブロック検知を有効にするかどうか。有効にすると広告エリアにテキストが表示されます。 @see https://github.com/bytegravity/whitelist-wwads
}
