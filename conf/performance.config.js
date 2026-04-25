/**
 * パフォーマンス最適化の設定
 */
module.exports = {
  // プリロード設定
  PRELOAD_CRITICAL_RESOURCES: process.env.NEXT_PUBLIC_PRELOAD_CRITICAL_RESOURCES !== 'false',
  
  // 遅延読み込み（Lazy Load）設定
  LAZY_LOAD_IMAGES: process.env.NEXT_PUBLIC_LAZY_LOAD_IMAGES !== 'false',
  LAZY_LOAD_THRESHOLD: process.env.NEXT_PUBLIC_LAZY_LOAD_THRESHOLD || '200px',
  
  // コード分割設定
  ENABLE_CODE_SPLITTING: process.env.NEXT_PUBLIC_ENABLE_CODE_SPLITTING !== 'false',
  CHUNK_SIZE_LIMIT: process.env.NEXT_PUBLIC_CHUNK_SIZE_LIMIT || 244000, // 244KB
  
  // キャッシュ設定
  BROWSER_CACHE_TTL: process.env.NEXT_PUBLIC_BROWSER_CACHE_TTL || 86400, // 24時間
  CDN_CACHE_TTL: process.env.NEXT_PUBLIC_CDN_CACHE_TTL || 604800, // 7日間
  
  // 圧縮設定
  ENABLE_GZIP: process.env.NEXT_PUBLIC_ENABLE_GZIP !== 'false',
  ENABLE_BROTLI: process.env.NEXT_PUBLIC_ENABLE_BROTLI !== 'false',
  
  // フォント最適化
  FONT_DISPLAY: process.env.NEXT_PUBLIC_FONT_DISPLAY || 'swap',
  PRELOAD_FONTS: process.env.NEXT_PUBLIC_PRELOAD_FONTS !== 'false',
  
  // サードパーティスクリプトの最適化
  DEFER_THIRD_PARTY_SCRIPTS: process.env.NEXT_PUBLIC_DEFER_THIRD_PARTY_SCRIPTS || true,
  
  // 画像最適化
  WEBP_SUPPORT: process.env.NEXT_PUBLIC_WEBP_SUPPORT || true,
  AVIF_SUPPORT: process.env.NEXT_PUBLIC_AVIF_SUPPORT || true,
  
  // プリフェッチ設定
  PREFETCH_LINKS: process.env.NEXT_PUBLIC_PREFETCH_LINKS !== 'false',
  PREFETCH_IMAGES: process.env.NEXT_PUBLIC_PREFETCH_IMAGES || false,
  
  // パフォーマンスモニタリング
  ENABLE_WEB_VITALS: process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS !== 'false',
  PERFORMANCE_BUDGET: {
    FCP: 1800, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1   // Cumulative Layout Shift
  }
}
