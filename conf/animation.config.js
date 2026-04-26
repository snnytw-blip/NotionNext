/**
 * サイトの装飾・アニメーション設定
 */
module.exports = {
  // マウスクリック時の花火エフェクト
  FIREWORKS: process.env.NEXT_PUBLIC_FIREWORKS || false, // 有効・無効
  // 花火の色。 https://github.com/Vixcity 氏提供のカラーパレットに感謝いたします。
  FIREWORKS_COLOR: [
    '255, 20, 97',
    '24, 255, 146',
    '90, 135, 255',
    '251, 243, 140'
  ],

  // マウス追従エフェクト
  MOUSE_FOLLOW: process.env.NEXT_PUBLIC_MOUSE_FOLLOW || false, // 有効・無効
  // 以下の2つの設定は、マウス追従エフェクトが有効な場合のみ適用されます。
  // エフェクトの種類 1：パス散乱 2：落下散乱 3：上昇散乱 4：縁からマウスへ移動 5：追従回転 6：パスライン 7：集束散乱 8：集束グリッド 9：移動グリッド 10：上昇粒子 11：回転ランダムカラー粒子 12：コーン状放射追従ブルー粒子
  MOUSE_FOLLOW_EFFECT_TYPE: 11, // 1-12
  MOUSE_FOLLOW_EFFECT_COLOR: '#ef672a', // エフェクトの色（#xxxxxx または rgba(r,g,b,a)）

  // 桜の舞い散るエフェクト
  SAKURA: process.env.NEXT_PUBLIC_SAKURA || false, // 有効・無効
  // 浮遊する線（NEST）エフェクト
  NEST: process.env.NEXT_PUBLIC_NEST || false, // 有効・無効
  // 動的なリボン（FLUTTERING RIBBON）エフェクト
  FLUTTERINGRIBBON: process.env.NEXT_PUBLIC_FLUTTERINGRIBBON || false, // 有効・無効
  // 静的なリボン（RIBBON）エフェクト
  RIBBON: process.env.NEXT_PUBLIC_RIBBON || false, // 有効・無効
  // 星空エフェクト（ダークモード時のみ有効）
  STARRY_SKY: process.env.NEXT_PUBLIC_STARRY_SKY || false, // 有効・無効
  ANIMATE_CSS_URL:
    process.env.NEXT_PUBLIC_ANIMATE_CSS_URL ||
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css' // アニメーションCDNのURL
}
