/**
 * 別のランディングページテーマ
 */
const CONFIG = {
  // デフォルトではLogoテキストのみを表示。ロゴ画像を設定すると、テキストの左側にアイコンが表示されます。
  STARTER_LOGO: '', // 通常のロゴ画像 例：/images/starter/logo/logo.svg
  STARTER_LOGO_WHITE: '', // 背景透過の明るいロゴ 例： /images/starter/logo/logo-white.svg

  // MENU 、メニュー部分はここでは設定しません。NotionデータベースでMENUを追加してください。

  // ヒーローセクションナビゲーション
  STARTER_HERO_ENABLE: true, // ヒーローセクションを有効にする
  STARTER_HERO_TITLE_1: 'Notionノートベースのオープンソースで無料のウェブサイト構築ツール', // ヒーローセクションのタイトル1
  STARTER_HERO_TITLE_2: 'ノートを書く感覚でサイトを構築し、あなたの価値を何倍にも高めます', // ヒーローセクションのタイトル2
  // ヒーローセクションの2つのボタン。TEXTが空の場合はボタンを非表示にします。
  STARTER_HERO_BUTTON_1_TEXT: '今すぐ始める', // ボタン1のテキスト
  STARTER_HERO_BUTTON_1_URL:
    'https://docs.tangly1024.com/article/vercel-deploy-notion-next', // ボタン1のURL
  STARTER_HERO_BUTTON_2_TEXT: 'Githubでチェック', // ボタン2のテキスト
  STARTER_HERO_BUTTON_2_URL: 'https://github.com/tangly1024/NotionNext', // ボタン2のURL
  STARTER_HERO_BUTTON_2_ICON: '/images/starter/github.svg', // ボタン2のアイコン。不要な場合は空にします。

  // ヒーローセクションのプレビュー画像。非表示にする場合は空値 '' にします。
  STARTER_HERO_PREVIEW_IMAGE: '/images/starter/hero/hero-image.webp', // 製品プレビュー画像。デフォルトはpublicディレクトリから読み込みます。
  STARTER_HERO_BANNER_IMAGE: '', // ヒーローセクション下部のフルワイド画像

  // 右上ナビゲーションボタン
  STARTER_NAV_BUTTON_1_TEXT: 'ログイン',
  STARTER_NAV_BUTTON_1_URL: '/sign-in',

  STARTER_NAV_BUTTON_2_TEXT: '会員登録',
  STARTER_NAV_BUTTON_2_URL: '/sign-up',

  // 特徴セクション
  STARTER_FEATURE_ENABLE: true, // 特徴セクションのスイッチ
  STARTER_FEATURE_TITLE: '特徴', // セクションタイトル
  STARTER_FEATURE_TEXT_1: 'NotionNextの主な特徴', // サブタイトル1
  STARTER_FEATURE_TEXT_2:
    'NotionNextのビジョンは、シンプルかつ安定して自分のウェブサイトを構築し、ブランドの価値を最大化するお手伝いをすることです。', // サブタイトル2

  STARTER_FEATURE_1_TITLE_1: '無料でオープンソース', // 特徴1のタイトル
  STARTER_FEATURE_1_TEXT_1: 'プロジェクトのソースコードはGithubで完全に公開されており、MITライセンスに従います', // 特徴1の説明
  STARTER_FEATURE_1_BUTTON_TEXT: '詳細を見る', // 特徴1のボタンテキスト
  STARTER_FEATURE_1_BUTTON_URL: 'https://github.com/tangly1024/NotionNext', // 特徴1のURL

  STARTER_FEATURE_2_TITLE_1: '多彩なテーマカスタマイズ', // 特徴2のタイトル
  STARTER_FEATURE_2_TEXT_1: '数十種類のテーマがあり、様々なシーンに対応。あなたにぴったりのものが必ず見つかります', // 特徴2の説明
  STARTER_FEATURE_2_BUTTON_TEXT: '詳細を見る', // 特徴2のボタンテキスト
  STARTER_FEATURE_2_BUTTON_URL:
    'https://docs.tangly1024.com/article/notion-next-themes', // 特徴2のURL

  STARTER_FEATURE_3_TITLE_1: '優れたパフォーマンス', // 特徴3のタイトル
  STARTER_FEATURE_3_TEXT_1: 'NextJSベースで開発されており、高速なレスポンスと優れたSEOを実現しています', // 特徴3の説明
  STARTER_FEATURE_3_BUTTON_TEXT: '詳細を見る', // 特徴3のボタンテキスト
  STARTER_FEATURE_3_BUTTON_URL: 'https://docs.tangly1024.com/article/next-js', // 特徴3のURL

  STARTER_FEATURE_4_TITLE_1: '快適な執筆体験', // 特徴4のタイトル
  STARTER_FEATURE_4_TEXT_1: 'Notionノートで編集するだけで、自動的にウェブサイトに同期されます', // 特徴4の説明
  STARTER_FEATURE_4_BUTTON_TEXT: '詳細を見る', // 特徴4のボタンテキスト
  STARTER_FEATURE_4_BUTTON_URL: 'https://docs.tangly1024.com/about', // 特徴4のURL

  // 首页ABOUTセクション
  STARTER_ABOUT_ENABLE: true, // ABOUTセクションのスイッチ
  STARTER_ABOUT_TITLE: '軽量で実用的なサイト構築ソリューション',
  STARTER_ABOUT_TEXT:
    'NotionNextのビジョンは、非エンジニアの方でも最小限のコストと時間で自分のウェブサイトを構築し、自身の製品やストーリーを効率的に世界へ伝えるお手伝いをすることです。<br /> <br /> 多機能なNotionノートと、シンプルで高速なVercelホスティングプラットフォームを組み合わせて、洗練されたサイトを実現します。',
  STARTER_ABOUT_BUTTON_TEXT: '詳細を見る',
  STARTER_ABOUT_BUTTON_URL: 'https://docs.tangly1024.com/about',
  STARTER_ABOUT_IMAGE_1: '/images/starter/about/about-image-01.jpg',
  STARTER_ABOUT_IMAGE_2: '/images/starter/about/about-image-02.jpg',
  STARTER_ABOUT_TIPS_1: '7000+',
  STARTER_ABOUT_TIPS_2: 'ブログサイト',
  STARTER_ABOUT_TIPS_3: 'オンラインで稼働中',

  // 料金プランセクション
  STARTER_PRICING_ENABLE: true, // 料金セクションのスイッチ
  STARTER_PRICING_TITLE: '料金プラン',
  STARTER_PRICING_TEXT_1: '最適なプランをお選びください',
  STARTER_PRICING_TEXT_2:
    '柔軟な料金体系をご用意しています。（NotionNextは無料でオープンソースです。ここでは製品購読機能のデモのみを行っており、実際に購入しないでください！）',

  STARTER_PRICING_1_TITLE: 'スターター',
  STARTER_PRICING_1_PRICE: '19.9',
  STARTER_PRICING_1_PRICE_CURRENCY: '$',
  STARTER_PRICING_1_PRICE_PERIOD: '月額',
  STARTER_PRICING_1_HEADER: '主な機能',
  STARTER_PRICING_1_FEATURES: 'すべてのテーマ,無料アップデート,ヘルプマニュアル', // カンマ区切り
  STARTER_PRICING_1_BUTTON_TEXT: '今すぐ購入',
  STARTER_PRICING_1_BUTTON_URL:
    'https://tangly1024.lemonsqueezy.com/checkout/buy/c1a38a65-362e-44c5-8065-733fee39eb54',

  STARTER_PRICING_2_TAG: 'おすすめ',
  STARTER_PRICING_2_TITLE: 'ベーシック',
  STARTER_PRICING_2_PRICE: '39.9',
  STARTER_PRICING_2_PRICE_CURRENCY: '$',
  STARTER_PRICING_2_PRICE_PERIOD: '月額',
  STARTER_PRICING_2_HEADER: '主な機能',
  STARTER_PRICING_2_FEATURES: 'スタータープランの全機能,ソースコード提供,コミュニティ参加,テクニカルサポート,SEO最適化', // カンマ区切り
  STARTER_PRICING_2_BUTTON_TEXT: '今すぐ購入',
  STARTER_PRICING_2_BUTTON_URL:
    'https://tangly1024.lemonsqueezy.com/checkout/buy/590ad70a-c3b7-4caf-94ec-9ca27bde06d4',

  STARTER_PRICING_3_TITLE: 'プレミアム',
  STARTER_PRICING_3_PRICE: '59.9',
  STARTER_PRICING_3_PRICE_CURRENCY: '$',
  STARTER_PRICING_3_PRICE_PERIOD: '月額',
  STARTER_PRICING_3_HEADER: '主な機能',
  STARTER_PRICING_3_FEATURES: 'ベーシックプランの全機能,カスタム機能開発', // カンマ区切り
  STARTER_PRICING_3_BUTTON_TEXT: '今すぐ購入',
  STARTER_PRICING_3_BUTTON_URL:
    'https://tangly1024.lemonsqueezy.com/checkout/buy/df924d66-09dc-42a4-a632-a6b0c5cc4f28',

  // ユーザーレビューセクション
  STARTER_TESTIMONIALS_ENABLE: true, // レビューセクションのスイッチ
  STARTER_TESTIMONIALS_TITLE: 'ユーザーの声',
  STARTER_TESTIMONIALS_TEXT_1: '利用者からのフィードバック',
  STARTER_TESTIMONIALS_TEXT_2:
    '数千人のサイトオーナーがNotionNextを選択しています。ヘルプマニュアルやコミュニティを通じて、多くの方が自身のサイト公開に成功しています。',
  STARTER_TESTIMONIALS_STAR_ICON: '/images/starter/testimonials/icon-star.svg', // 評価アイコン

  // ここではCONFIGや環境変数をサポートしていません。個別にコードを修正する必要があります。
  STARTER_TESTIMONIALS_ITEMS: [
    {
      STARTER_TESTIMONIALS_ITEM_TEXT:
        '素晴らしいツールをありがとうございます。以前はSuperやPotionなどの海外サービスを試していましたが、カスタマイズ性に欠けていました。この方法は自由度が高く、最高です！',
      STARTER_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F22de3fcb-d90d-4271-bc01-f815f476122b%2F4FE0A0C0-E487-4C74-BF8E-6F01A27461B8-14186-000008094BC289A6.jpg?table=collection&id=a320a2cc-6ebe-4a8d-95cc-ea94e63bced9&width=200',
      STARTER_TESTIMONIALS_ITEM_NICKNAME: 'Ryan_G',
      STARTER_TESTIMONIALS_ITEM_DESCRIPTION: 'Ryan`Log 管理人',
      STARTER_TESTIMONIALS_ITEM_URL: 'https://blog.gaoran.xyz/'
    },
    {
      STARTER_TESTIMONIALS_ITEM_TEXT:
        'このテーマがとても気に入っています。プログラミング初心者ですが、3日間の休暇でサイトを構築できました。カスタムドメインの設定ガイドも非常に役立ちました！',
      STARTER_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2F0d33d169-f932-41ff-ac6b-88a923c08e02%2F%25E5%25A4%25B4%25E5%2583%258F.jfif?table=collection&id=7787658d-d5c0-4f34-8e32-60c523dfaba3&width=400',
      STARTER_TESTIMONIALS_ITEM_NICKNAME: 'Asenkits',
      STARTER_TESTIMONIALS_ITEM_DESCRIPTION: '阿森の百宝袋 管理人',
      STARTER_TESTIMONIALS_ITEM_URL: 'https://asenkits.top/'
    },
    {
      STARTER_TESTIMONIALS_ITEM_TEXT:
        '半日の作業で、ようやくブログをデプロイできました！Tangly1024さんのフレームワークとチュートリアルに感謝します。今まで使った中で最高のブログフレームワークです。',
      STARTER_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fprod-files-secure.s3.us-west-2.amazonaws.com%2F6c096b44-beb9-48ee-8f92-1efdde47f3a3%2F338962f1-d352-49c7-9a1b-746e35a7005c%2Fhf.png?table=block&id=ce5a48a9-d77a-4843-a3d9-a78cd4f794ce&spaceId=6c096b44-beb9-48ee-8f92-1efdde47f3a3&width=100&userId=27074aef-7216-41ed-baef-d9b53addd870&cache=v2',
      STARTER_TESTIMONIALS_ITEM_NICKNAME: 'DWIND',
      STARTER_TESTIMONIALS_ITEM_DESCRIPTION: '且聴風吟 管理人',
      STARTER_TESTIMONIALS_ITEM_URL: 'https://www.dwind.top/'
    },
    {
      STARTER_TESTIMONIALS_ITEM_TEXT:
        'こんなに素晴らしいプロジェクトを提供していただき、ありがとうございます。他のプロジェクトは難解でしたが、これは非常にシンプルで初心者にも優しいです。',
      STARTER_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fd52f6766-3e32-4c3d-8529-46e1f214360f%2Ffavicon.svg?table=collection&id=7d76aad5-a2c4-4d9a-887c-c7913fae4eed&width=400',
      STARTER_TESTIMONIALS_ITEM_NICKNAME: '迪升disheng',
      STARTER_TESTIMONIALS_ITEM_DESCRIPTION: 'AIリソース共有ブログ',
      STARTER_TESTIMONIALS_ITEM_URL: 'https://blog.disheng.org/'
    },
    {
      STARTER_TESTIMONIALS_ITEM_TEXT:
        'ブログとNotionを連携させることができるこのモードをずっと待っていました。素晴らしいプロジェクトをありがとうございます！',
      STARTER_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fafb21381-f51b-4fd0-9998-800dbeb64dbe%2Favatar.png?table=block&id=195935d2-0d8d-49fc-bd81-1db42ee50840&spaceId=6c096b44-beb9-48ee-8f92-1efdde47f3a3&width=100&userId=27074aef-7216-41ed-baef-d9b53addd870&cache=v2',
      STARTER_TESTIMONIALS_ITEM_NICKNAME: 'AnJhon',
      STARTER_TESTIMONIALS_ITEM_DESCRIPTION: 'Anjhon`s Blog 管理人',
      STARTER_TESTIMONIALS_ITEM_URL: 'https://www.anjhon.top'
    },
    {
      STARTER_TESTIMONIALS_ITEM_TEXT: '長く使わせていただいています。本当に感謝しています！',
      STARTER_TESTIMONIALS_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fe4f391d7-7d65-4c05-a82c-c6e2c40f06e4%2Fa2a7641a26b367608c6ef28ce9b7e983_(2).png?table=block&id=a386eb0e-4c07-4b18-9ece-bba4e79ce21c&spaceId=6c096b44-beb9-48ee-8f92-1efdde47f3a3&width=100&userId=27074aef-7216-41ed-baef-d9b53addd870&cache=v2',
      STARTER_TESTIMONIALS_ITEM_NICKNAME: 'LUCEN',
      STARTER_TESTIMONIALS_ITEM_DESCRIPTION: 'LUCEN試験指導 管理人',
      STARTER_TESTIMONIALS_ITEM_URL: 'https://www.lucenczz.top/'
    }
  ],

  // FAQ よくある質問セクション
  STARTER_FAQ_ENABLE: true, // FAQセクションのスイッチ
  STARTER_FAQ_TITLE: 'よくある質問',
  STARTER_FAQ_TEXT_1: 'ご不明な点はありませんか？',
  STARTER_FAQ_TEXT_2: 'よく寄せられる質問をまとめました',

  STARTER_FAQ_1_QUESTION: 'NotionNextにヘルプドキュメントはありますか？',
  STARTER_FAQ_1_ANSWER:
    'NotionNextでは、サイトの構築・デプロイを支援するために、<a href="https://docs.tangly1024.com/about" className="underline">ヘルプドキュメント</a>、<a href="https://www.bilibili.com/video/BV1fM4y1L7Qi/" className="underline">操作解説動画</a>、および<a href="https://docs.tangly1024.com/article/chat-community" className="underline">交流コミュニティ</a>を提供しています。',

  STARTER_FAQ_2_QUESTION: 'デプロイ後、どのように記事を書けばよいですか？',
  STARTER_FAQ_2_ANSWER:
    'Notion内でタイプが「Post」のページを追加または変更するだけで、内容はリアルタイムでサイトに同期されます。詳細は<a className="underline" href="https://docs.tangly1024.com/article/start-to-write">《ヘルプドキュメント》</a>をご参照ください。',

  STARTER_FAQ_3_QUESTION: 'サイトのデプロイや更新に失敗します',
  STARTER_FAQ_3_ANSWER:
    '多くの場合、設定の修正ミスが原因です。設定を見直すか、手順を再試行してください。または、Vercel管理画面の「Deployments」でエラーログを確認し、コミュニティで質問してください。',

  STARTER_FAQ_4_QUESTION: '記事がリアルタイムで同期されません',
  STARTER_FAQ_4_ANSWER:
    'まず Notion_Page_ID が正しく設定されているか確認してください。また、ブログの各ページには独立したキャッシュがあるため、ブラウザでページを更新することで解決する場合があります。',

  // チームメンバーセクション
  STARTER_TEAM_ENABLE: true, // チームメンバーセクションのスイッチ
  STARTER_TEAM_TITLE: 'チームメンバー',
  STARTER_TEAM_TEXT_1: '開発チーム紹介',
  STARTER_TEAM_TEXT_2:
    'NotionNext は多くのオープンソース技術愛好家の協力によって完成しました。すべての<a className="underline" href="https://github.com/tangly1024/NotionNext/graphs/contributors">コントリビューター</a>に感謝します。',

  // ここではCONFIGや環境変数をサポートしていません。個別にコードを修正する必要があります。
  STARTER_TEAM_ITEMS: [
    {
      STARTER_TEAM_ITEM_AVATAR:
        'https://www.notion.so/image/https%3A%2F%2Fs3-us-west-2.amazonaws.com%2Fsecure.notion-static.com%2Fa06c61bb-980e-4180-bc18-c15f92c78bb4%2Ftangly1024.jpg?table=collection&id=8e7acf17-de09-4fa1-abde-b5b80ad4a813&t=8e7acf17-de09-4fa1-abde-b5b80ad4a813&width=100&cache=v2',
      STARTER_TEAM_ITEM_NICKNAME: 'Tangly',
      STARTER_TEAM_ITEM_DESCRIPTION: '開発者'
    },
    {
      STARTER_TEAM_ITEM_AVATAR: '/images/starter/team/team-01.png',
      STARTER_TEAM_ITEM_NICKNAME: 'Melissa Tatcher',
      STARTER_TEAM_ITEM_DESCRIPTION: 'マーケティングエキスパート'
    },
    {
      STARTER_TEAM_ITEM_AVATAR: '/images/starter/team/team-02.png',
      STARTER_TEAM_ITEM_NICKNAME: 'Stuard Ferrel',
      STARTER_TEAM_ITEM_DESCRIPTION: 'デジタルマーケター'
    },
    {
      STARTER_TEAM_ITEM_AVATAR: '/images/starter/team/team-03.png',
      STARTER_TEAM_ITEM_NICKNAME: 'Eva Hudson',
      STARTER_TEAM_ITEM_DESCRIPTION: 'クリエイティブデザイナー'
    }
  ],

  // ブログ記事セクション
  STARTER_BLOG_ENABLE: true, // ホームページブログセクションのスイッチ
  STARTER_BLOG_TITLE: '最新ブログ',
  STARTER_BLOG_COUNT: 3, // ホームページに表示する記事数
  STARTER_BLOG_TEXT_1: '最近のニュース',
  STARTER_BLOG_TEXT_2:
    'NotionNextに関する最新の動向、将来の計画、新機能の紹介などをこちらで発信しています。',

  // お問い合わせセクション
  STARTER_CONTACT_ENABLE: true, // お問い合わせセクションのスイッチ
  STARTER_CONTACT_TITLE: 'お問い合わせ',
  STARTER_CONTACT_TEXT: 'ご質問やご相談はこちらから',
  STARTER_CONTACT_LOCATION_TITLE: '所在地',
  STARTER_CONTACT_LOCATION_TEXT: '中国、福建省',
  STARTER_CONTACT_EMAIL_TITLE: 'メールでのお問い合わせ',
  STARTER_CONTACT_EMAIL_TEXT: 'mail@tangly1024.com',

  // 外部フォームの埋め込み
  STARTER_CONTACT_MSG_EXTERNAL_URL: 'https://noteforms.com/forms/yfctc7', // NoteFormベース。メッセージはNotionに保存されます。
  // カスタムお問い合わせフォーム（以下の設定は一時的に廃止）
  // STARTER_CONTACT_MSG_TITLE: 'メッセージを送る',
  // STARTER_CONTACT_MSG_NAME: 'お名前',
  // STARTER_CONTACT_MSG_EMAIL: 'メールアドレス',
  // STARTER_CONTACT_MSG_PHONE: '電話番号',
  // STARTER_CONTACT_MSG_TEXT: 'メッセージ内容',
  // STARTER_CONTACT_MSG_SEND: '送信',
  // STARTER_CONTACT_MSG_THANKS: 'お問い合わせありがとうございます',

  // パートナーロゴ
  STARTER_BRANDS_ENABLE: true, // パートナーセクションのスイッチ
  STARTER_BRANDS: [
    {
      IMAGE: '/images/starter/brands/graygrids.svg',
      IMAGE_WHITE: '/images/starter/brands/graygrids-white.svg',
      URL: 'https://graygrids.com/',
      TITLE: 'graygrids'
    },
    {
      IMAGE: '/images/starter/brands/lineicons.svg',
      IMAGE_WHITE: '/images/starter/brands/lineicons-white.svg',
      URL: 'https://lineicons.com/',
      TITLE: 'lineicons'
    },
    {
      IMAGE: '/images/starter/brands/uideck.svg',
      IMAGE_WHITE: '/images/starter/brands/uideck-white.svg',
      URL: 'https://uideck.com/',
      TITLE: 'uideck'
    },
    {
      IMAGE: '/images/starter/brands/ayroui.svg',
      IMAGE_WHITE: '/images/starter/brands/ayroui-white.svg',
      URL: 'https://ayroui.com/',
      TITLE: 'ayroui'
    },
    {
      IMAGE: '/images/starter/brands/tailgrids.svg',
      IMAGE_WHITE: '/images/starter/brands/tailgrids-white.svg',
      URL: '"https://tailgrids.com/',
      TITLE: 'tailgrids'
    }
  ],

  STARTER_FOOTER_SLOGAN: '私たちは技術を通じて、ブランドと企業にデジタル体験を創造します。',

  // フッター 3列メニュー
  STARTER_FOOTER_LINK_GROUP: [
    {
      TITLE: '私たちについて',
      LINK_GROUP: [
        { TITLE: '公式ホーム', URL: '/#home' },
        { TITLE: '操作ガイド', URL: 'https://docs.tangly1024.com/about' },
        {
          TITLE: 'ヘルプサポート',
          URL: 'https://docs.tangly1024.com/article/how-to-question'
        },
        {
          TITLE: '提携・協力',
          URL: 'https://docs.tangly1024.com/article/my-service'
        }
      ]
    },
    {
      TITLE: '機能・特徴',
      LINK_GROUP: [
        {
          TITLE: 'デプロイガイド',
          URL: 'https://docs.tangly1024.com/article/vercel-deploy-notion-next'
        },
        {
          TITLE: 'アップデートガイド',
          URL: 'https://docs.tangly1024.com/article/how-to-update-notionnext'
        },
        { TITLE: '最新バージョン', URL: 'https://docs.tangly1024.com/article/latest' }
      ]
    },
    {
      TITLE: 'Notionでの執筆',
      LINK_GROUP: [
        {
          TITLE: '執筆の始め方',
          URL: 'https://docs.tangly1024.com/article/start-to-write'
        },
        {
          TITLE: '効率化ショートカット',
          URL: 'https://docs.tangly1024.com/article/notion-short-key'
        },
        {
          TITLE: 'Notion高速化',
          URL: 'https://docs.tangly1024.com/article/notion-faster'
        }
      ]
    }
  ],

  STARTER_FOOTER_BLOG_LATEST_TITLE: '最新記事',

  STARTER_FOOTER_PRIVACY_POLICY_TEXT: 'プライバシーポリシー',
  STARTER_FOOTER_PRIVACY_POLICY_URL: '/privacy-policy',

  STARTER_FOOTER_PRIVACY_LEGAL_NOTICE_TEXT: '法的告知',
  STARTER_FOOTER_PRIVACY_LEGAL_NOTICE_URL: '/legacy-notice',

  STARTER_FOOTER_PRIVACY_TERMS_OF_SERVICE_TEXT: '利用規約',
  STARTER_FOOTER_PRIVACY_TERMS_OF_SERVICE_URL: '/terms-of-use',

  // 404ページ
  STARTER_404_TITLE: 'お探しのページは見つかりませんでした。',
  STARTER_404_TEXT: '申し訳ありません！指定されたページは存在しないか、移動または削除された可能性があります。',
  STARTER_404_BACK: 'ホームに戻る',

  // ページ下部 CTAセクション
  STARTER_CTA_ENABLE: true,
  STARTER_CTA_TITLE: '今すぐ始めませんか？',
  STARTER_CTA_TITLE_2: '素晴らしい体験が待っています',
  STARTER_CTA_DESCRIPTION:
    'NotionNextの操作ガイドには、即座にサイトを構築するための詳細なチュートリアルが用意されています。',
  STARTER_CTA_BUTTON: true, // ボタンを表示するか
  STARTER_CTA_BUTTON_URL:
    'https://docs.tangly1024.com/article/vercel-deploy-notion-next',
  STARTER_CTA_BUTTON_TEXT: '無料で始める',

  STARTER_POST_REDIRECT_ENABLE: true, // リダイレクトを有効にする
  STARTER_POST_REDIRECT_URL: 'https://blog.tangly1024.com', // リダイレクト先ドメイン
  STARTER_NEWSLETTER: process.env.NEXT_PUBLIC_THEME_STARTER_NEWSLETTER || false // メール購読（Mailchimpの設定が必要です）
}
export default CONFIG
