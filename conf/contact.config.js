/**
 * ソーシャルボタン関連の設定
 */
module.exports = {
  // Formspree お問い合わせフォームのエンドポイント
  // https://formspree.io でフォームを作成し、エンドポイントURLを設定
  CONTACT_FORMSPREE_ENDPOINT:
    process.env.NEXT_PUBLIC_CONTACT_FORMSPREE_ENDPOINT ||
    '',

  // ソーシャルリンク。不要な場合は空欄（例：CONTACT_WEIBO:''）にしてください。
  CONTACT_EMAIL:
    (process.env.NEXT_PUBLIC_CONTACT_EMAIL &&
      btoa(
        unescape(encodeURIComponent(process.env.NEXT_PUBLIC_CONTACT_EMAIL))
      )) ||
    '', // メールアドレス（例：mail@tangly1024.com）
  CONTACT_WEIBO: process.env.NEXT_PUBLIC_CONTACT_WEIBO || '', // Weiboの個人ページ
  CONTACT_TWITTER: process.env.NEXT_PUBLIC_CONTACT_TWITTER || '', // Twitter (X) の個人ページ
  CONTACT_GITHUB: process.env.NEXT_PUBLIC_CONTACT_GITHUB || '', // GitHubの個人ページ（例：https://github.com/tangly1024）
  CONTACT_TELEGRAM: process.env.NEXT_PUBLIC_CONTACT_TELEGRAM || '', // TelegramのURL（例：https://t.me/tangly_1024）
  CONTACT_LINKEDIN: process.env.NEXT_PUBLIC_CONTACT_LINKEDIN || '', // LinkedInの個人ページ
  CONTACT_INSTAGRAM: process.env.NEXT_PUBLIC_CONTACT_INSTAGRAM || '', // Instagramの個人ページ
  CONTACT_BILIBILI: process.env.NEXT_PUBLIC_CONTACT_BILIBILI || '', // Bilibiliの個人ページ
  CONTACT_YOUTUBE: process.env.NEXT_PUBLIC_CONTACT_YOUTUBE || '', // Youtubeの個人ページ
  CONTACT_XIAOHONGSHU: process.env.NEXT_PUBLIC_CONTACT_XIAOHONGSHU || '', // 小紅書（Little Red Book）の個人ページ
  CONTACT_ZHISHIXINGQIU: process.env.NEXT_PUBLIC_CONTACT_ZHISHIXINGQIU || '', // 知識星球
  CONTACT_WEHCHAT_PUBLIC: process.env.NEXT_PUBLIC_CONTACT_WEHCHAT_PUBLIC || '' // WeChat公式アカウント（形式：https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=【xxxxxx】==#wechat_redirect）
}

