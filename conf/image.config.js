/**
 * 画像関連の設定
 *
 * 例: images.unsplash.com（Notionの画像ホストにあるすべての画像が置き換わります）。Notionにランダム画像のURLを追加しており、そのサービスが終了またはダウンした場合に、すべての配分を一括で切り替えたい場合は、そのURLをここに設定します。
 * デフォルトでは、Notionにアップロードしたホームページのカバー画像やアイコンも置き換わります。ホームページのカバー画像やアイコンは他の画像ホストに置き、Notionではリンクとして設定することをお勧めします。
 */
module.exports = {
  NOTION_HOST: process.env.NEXT_PUBLIC_NOTION_HOST || 'https://www.notion.so', // Notionのドメイン。リバースプロキシを使用する場合は独自のドメインを設定できます。リバースプロキシが何かわからない場合は変更しないでください。
  IMAGE_COMPRESS_WIDTH: process.env.NEXT_PUBLIC_IMAGE_COMPRESS_WIDTH || 1080, // 画像圧縮のデフォルト幅。ブログのカバーと記事内容に適用されます。値が小さいほど読み込みが速くなります。
  IMAGE_ZOOM_IN_WIDTH: process.env.NEXT_PUBLIC_IMAGE_ZOOM_IN_WIDTH || 1920, // 記事内の画像をクリックして拡大した際の画質幅。ウェブページ上での実際の表示幅ではありません。
  IMAGE_COMPRESS_QUALITY: process.env.NEXT_PUBLIC_IMAGE_COMPRESS_QUALITY || 80, // 画像圧縮の品質（0-100）。値が小さいほどファイルサイズは小さくなりますが、品質は低下します。
  RANDOM_IMAGE_URL: process.env.NEXT_PUBLIC_RANDOM_IMAGE_URL || '', // ランダム画像API。以下のキーワードが設定されていない場合、ホームページのカバー、アイコン、記事のカバー画像がランダム画像に置き換わります。
  RANDOM_IMAGE_REPLACE_TEXT:
    process.env.NEXT_PUBLIC_RANDOM_IMAGE_NOT_REPLACE_TEXT ||
    'images.unsplash.com', // 画像置換のトリガーとなるURLキーワード（カンマ区切りで複数指定可能）。画像アドレスにこのキーワードが含まれている場合のみ、上記のランダム画像URLに置換されます。

  // サイト画像
  IMG_LAZY_LOAD_PLACEHOLDER:
    process.env.NEXT_PUBLIC_IMG_LAZY_LOAD_PLACEHOLDER ||
    'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', // 遅延読み込み（Lazy Load）のプレースホルダー画像アドレス。base64またはURLをサポート。
  IMG_URL_TYPE: process.env.NEXT_PUBLIC_IMG_TYPE || 'Notion', // この設定は無効になりました。使用しないでください。AMAZONプランはサポートされなくなり、Notionプランのみをサポートします。 ['Notion','AMAZON'] サイト画像のプレフィックス。デフォルトは Notion:(https://notion.so/images/xx) 、 AMAZON(https://s3.us-west-2.amazonaws.com/xxx)
  IMG_SHADOW: process.env.NEXT_PUBLIC_IMG_SHADOW || false, // 記事内の画像に自動的に影を付けるかどうか
  IMG_COMPRESS_WIDTH: process.env.NEXT_PUBLIC_IMG_COMPRESS_WIDTH || 800 // Notion画像の圧縮幅
}
