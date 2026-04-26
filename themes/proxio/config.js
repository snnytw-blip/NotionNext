/**
 * PROXIO テーマ設定
 */
const CONFIG = {
  // ヒーローセクション
  PROXIO_HERO_ENABLE: true, // ヒーローセクションを表示
  PROXIO_HERO_TITLE_1: 'あなたのビジネスを',
  PROXIO_HERO_TITLE_2: '次のステージへ',
  PROXIO_HERO_DESCRIPTION: 'NotionNext を使用して、シンプルかつ強力なウェブサイトを構築。あなたの価値を世界に伝えましょう。',
  PROXIO_HERO_BUTTON_1_TEXT: '無料で始める',
  PROXIO_HERO_BUTTON_1_URL: 'https://docs.tangly1024.com/article/vercel-deploy-notion-next',
  PROXIO_HERO_BUTTON_2_TEXT: '詳細を見る',
  PROXIO_HERO_BUTTON_2_URL: 'https://docs.tangly1024.com/about',
  PROXIO_HERO_IMAGE: '/images/proxio/hero.png', // ヒーロー画像
  PROXIO_HERO_BANNER_IMAGE: '', // ヒーローセクションの背景。デフォルトは Notion の背景を使用。個別に設定する場合はここに URL を入力。

  // 特徴セクション
  PROXIO_FEATURE_ENABLE: true,
  PROXIO_FEATURE_TITLE: '主な特徴',
  PROXIO_FEATURE_TEXT_1: 'NotionNext が選ばれる理由',
  PROXIO_FEATURE_TEXT_2: 'シンプルさとカスタマイズ性を両立した、最新のサイト構築ソリューション。',

  PROXIO_FEATURE_1_TITLE_1: '高速なパフォーマンス',
  PROXIO_FEATURE_1_TEXT_1: 'Next.js ベースで、SEO に最適化された高速なページ読み込みを実現。',
  
  PROXIO_FEATURE_2_TITLE_1: '快適なデザイン',
  PROXIO_FEATURE_2_TEXT_1: 'フィードバックを融合し、期待を超えるデザインを共に創り上げます。',

  PROXIO_FEATURE_3_TITLE_1: '簡単な管理',
  PROXIO_FEATURE_3_TEXT_1: 'Notion ノートを更新するだけで、即座にサイトへ反映されます。',

  PROXIO_FEATURE_BUTTON_TEXT: '詳細を見る', // ボタンのテキスト
  PROXIO_FEATURE_BUTTON_URL: 'https://docs.tangly1024.com/article/notion-next-themes',

  // 実績セクション
  PROXIO_STATS_ENABLE: true,
  PROXIO_STATS_TITLE: '実績',
  PROXIO_STATS_TEXT_1: '私たちが提供する価値',
  PROXIO_STATS_TEXT_2: '世界中のユーザーが NotionNext を活用して自身のブランドを構築しています。',
  PROXIO_STATS_ITEMS: [
    { TITLE: 'ユーザー数', VALUE: '7,000+' },
    { TITLE: '提供テーマ', VALUE: '20+' },
    { TITLE: 'GitHub スター', VALUE: '5,000+' },
    { TITLE: 'コミュニティ', VALUE: '1,000+' }
  ],

  // ユーザーレビューセクション
  PROXIO_TESTIMONIALS_ENABLE: true,
  PROXIO_TESTIMONIALS_TITLE: 'ユーザーの声',
  PROXIO_TESTIMONIALS_TEXT_1: '利用者からのフィードバック',
  PROXIO_TESTIMONIALS_TEXT_2:
    '数千人のサイトオーナーが NotionNext を選択しています。ヘルプガイドやコミュニティを通じて、多くの方がサイト公開に成功しています。',
  
  // ここでは CONFIG や環境変数をサポートしていません。個別にコードを修正する必要があります。
  PROXIO_TESTIMONIALS_ITEMS: [
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '素晴らしいツールをありがとうございます。以前は Super や Potion などの海外サービスを試していましたが、カスタマイズ性が足りませんでした。この方法は自由度が高く、最高です！',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F22de3fcb-d90d-4271-bc01-f815f476122b%2F4FE0A0C0-E487-4C74-BF8E-6F01A27461B8-14186-000008094BC289A6.jpg?table=collection&id=a320a2cc-6ebe-4a8d-95cc-ea94e63bced9&width=200',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'Ryan_G',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'Ryan`Log 管理人'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        'このテーマがとても気に入っています。プログラミングの知識がなくても、数日でサイトを構築できました。カスタムドメインの設定ガイドも非常に役立ちました！',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F0d33d169-f932-41ff-ac6b-88a923c08e02%2F%25E5%25A4%25B4%25E5%2583%258F.jfif?table=collection&id=7787658d-d5c0-4f34-8e32-60c523dfaba3&width=400',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'Asenkits',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: '阿森の百宝袋 管理人'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '作業を開始して半日でブログをデプロイできました！フレームワークとチュートリアルに感謝します。今まで使った中で最高のブログフレームワークです。',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: 'https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F6c096b44-beb9-48ee-8f92-1efdde47f3a3%2F338962f1-d352-49c7-9a1b-746e35a7005c%2Fhf.png?table=block&id=ce5a48a9-d77a-4843-a3d9-a78cd4f794ce&spaceId=6c096b44-beb9-48ee-8f92-1efdde47f3a3&width=100&userId=27074aef-7216-41ed-baef-d9b53addd870&cache=v2',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'DWIND',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: '且聴風吟 管理人'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        '素晴らしいプロジェクトをありがとうございます。他のプロジェクトは複雑でしたが、これは非常にシンプルで初心者にも優しいです。',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd52f6766-3e32-4c3d-8529-46e1f214360f%2Ffavicon.svg?table=collection&id=7d76aad5-a2c4-4d9a-887c-c7913fae4eed&width=400',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: '迪升disheng',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'AIリソース共有ブログ'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT:
        'ブログと Notion を連携させることができるこのモードをずっと待っていました。期待通りの動作で、非常に満足しています！',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fafb21381-f51b-4fd0-9998-800dbeb64dbe%2Favatar.png?table=block&id=195935d2-0d8d-49fc-bd81-1db42ee50840&spaceId=6c096b44-beb9-48ee-8f92-1efdde47f3a3&width=100&userId=27074aef-7216-41ed-baef-d9b53addd870&cache=v2',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'AnJhon',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'Anjhon`s Blog 管理人'
    },
    {
      PROXIO_TESTIMONIALS_ITEM_TEXT: '長く愛用しています。本当に感謝しています！',
      PROXIO_TESTIMONIALS_ITEM_AVATAR: 'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe4f391d7-7d65-4c05-a82c-c6e2c40f06e4%2Fa2a7641a26b367608c6ef28ce9b7e983_(2).png?table=block&id=a386eb0e-4c07-4b18-9ece-bba4e79ce21c&spaceId=6c096b44-beb9-48ee-8f92-1efdde47f3a3&width=100&userId=27074aef-7216-41ed-baef-d9b53addd870&cache=v2',
      PROXIO_TESTIMONIALS_ITEM_NICKNAME: 'LUCEN',
      PROXIO_TESTIMONIALS_ITEM_DESCRIPTION: 'LUCEN試験指導 管理人'
    }
  ],

  // FAQ セクション
  PROXIO_FAQ_ENABLE: true,
  PROXIO_FAQ_TITLE: 'よくある質問',
  PROXIO_FAQ_TEXT_1: 'ご不明な点はありませんか？こちらをご確認ください',
  PROXIO_FAQ_TEXT_2: 'よく寄せられる質問をまとめました。',
  PROXIO_FAQ_ITEMS: [
    {
      q: 'NotionNext のヘルプドキュメントはありますか？',
      a: 'NotionNext では、<a href="https://docs.tangly1024.com/about" className="underline">ヘルプドキュメント</a>、<a href="https://www.bilibili.com/video/BV1fM4y1L7Qi/" className="underline">操作動画</a>、および<a href="https://docs.tangly1024.com/article/chat-community" className="underline">コミュニティ</a>を提供しています。'
    },
    {
      q: 'どのように記事を更新しますか？',
      a: 'Notion ノートで記事を書くだけで、サイトにリアルタイムで同期されます。Vercel で手動でビルドし直す必要はありません。'
    },
    {
      q: 'テーマをカスタマイズできますか？',
      a: 'はい、20種類以上のテーマから選べるほか、GLOBAL_CSS や設定ファイルを通じて自由にカスタマイズ可能です。'
    }
  ],

  // チームメンバーセクション
  PROXIO_TEAM_ENABLE: true,
  PROXIO_TEAM_TITLE: 'チーム紹介',
  PROXIO_TEAM_TEXT_1: '私たちのチーム',
  PROXIO_TEAM_TEXT_2: '情熱的な開発者とデザイナーが集まり、最高のデジタル体験を創造します。',

  // お問い合わせセクション
  PROXIO_CONTACT_ENABLE: true,
  PROXIO_CONTACT_TITLE: 'お問い合わせ',
  PROXIO_CONTACT_TEXT: 'ご質問やご相談はこちらから。',
  PROXIO_CONTACT_LOCATION_TITLE: '所在地',
  PROXIO_CONTACT_LOCATION_TEXT: '中国、福建省',
  PROXIO_CONTACT_EMAIL_TITLE: 'メール',
  PROXIO_CONTACT_EMAIL_TEXT: 'mail@tangly1024.com',

  // フッター
  PROXIO_FOOTER_SLOGAN: '私たちは技術を通じて、ブランドと企業にデジタル体験を創造します。',
  PROXIO_FOOTER_LINK_GROUP: [
    {
      TITLE: 'リソース',
      LINK_GROUP: [
        { TITLE: '操作ガイド', URL: 'https://docs.tangly1024.com/about' },
        { TITLE: 'ヘルプサポート', URL: 'https://docs.tangly1024.com/article/how-to-question' },
        { TITLE: '最新バージョン', URL: 'https://docs.tangly1024.com/article/latest' }
      ]
    },
    {
      TITLE: 'コミュニティ',
      LINK_GROUP: [
        { TITLE: 'GitHub', URL: 'https://github.com/tangly1024/NotionNext' },
        { TITLE: 'Discord', URL: 'https://discord.gg/invite' },
        { TITLE: 'Twitter', URL: 'https://twitter.com/tangly1024' }
      ]
    }
  ],

  // 404 ページ
  PROXIO_404_TITLE: 'お探しのページは見つかりませんでした。',
  PROXIO_404_TEXT: '申し訳ありませんが、指定されたページは存在しないか移動された可能性があります。',
  PROXIO_404_BACK: 'ホームに戻る',

  // CTA セクション
  PROXIO_CTA_ENABLE: true,
  PROXIO_CTA_TITLE_1: '準備はいいですか？',
  PROXIO_CTA_TITLE_2: '今すぐプロジェクトを開始しましょう',
  PROXIO_CTA_DESCRIPTION:
    'NotionNext のドキュメントには、すぐにサイトを構築するための詳細なチュートリアルが用意されています。',
  PROXIO_CTA_BUTTON_TEXT: '無料で始める',
  PROXIO_CTA_BUTTON_URL: 'https://docs.tangly1024.com/article/vercel-deploy-notion-next'
}

export default CONFIG
