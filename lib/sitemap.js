import { siteConfig } from '@/lib/config'
import { getAllPosts } from '@/lib/db/getSiteData'

/**
 * サイトマップの生成
 * @param {Array} allPosts すべての記事
 * @returns {string} XML形式のサイトマップ
 */
export function generateSitemap(allPosts = []) {
  const LINK = siteConfig('LINK')
  const currentDate = new Date().toISOString()

  // 静的ページ
  const staticPages = [
    {
      url: LINK,
      lastmod: currentDate,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      url: `${LINK}/archive`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${LINK}/category`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${LINK}/tag`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.8'
    },
    {
      url: `${LINK}/search`,
      lastmod: currentDate,
      changefreq: 'monthly',
      priority: '0.6'
    }
  ]

  // 記事ページ
  const postPages = allPosts
    .filter(post => post.status === 'Published' && post.type === 'Post')
    .map(post => ({
      url: `${LINK}/${post.slug}`,
      lastmod: new Date(post.lastEditedTime || post.date).toISOString(),
      changefreq: 'weekly',
      priority: '0.9'
    }))

  // ページ
  const pages = allPosts
    .filter(post => post.status === 'Published' && post.type === 'Page')
    .map(post => ({
      url: `${LINK}/${post.slug}`,
      lastmod: new Date(post.lastEditedTime || post.date).toISOString(),
      changefreq: 'monthly',
      priority: '0.7'
    }))

  // カテゴリページ
  const categories = [...new Set(allPosts
    .filter(post => post.category && post.status === 'Published')
    .map(post => post.category))]
    .map(category => ({
      url: `${LINK}/category/${encodeURIComponent(category)}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    }))

  // タグページ
  const tags = [...new Set(allPosts
    .filter(post => post.tags && post.status === 'Published')
    .flatMap(post => post.tags))]
    .map(tag => ({
      url: `${LINK}/tag/${encodeURIComponent(tag)}`,
      lastmod: currentDate,
      changefreq: 'weekly',
      priority: '0.6'
    }))

  const allUrls = [...staticPages, ...postPages, ...pages, ...categories, ...tags]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${allUrls.map(({ url, lastmod, changefreq, priority }) => `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return sitemap
}

/**
 * RSSフィードの生成
 * @param {Array} allPosts すべての記事
 * @returns {string} XML形式のRSS
 */
export function generateRSS(allPosts = []) {
  const LINK = siteConfig('LINK')
  const TITLE = siteConfig('TITLE')
  const DESCRIPTION = siteConfig('DESCRIPTION')
  const AUTHOR = siteConfig('AUTHOR')
  const LANG = siteConfig('LANG')
  
  const publishedPosts = allPosts
    .filter(post => post.status === 'Published' && post.type === 'Post')
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 20) // 最新の20記事

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:wfw="http://wellformedweb.org/CommentAPI/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:sy="http://purl.org/rss/1.0/modules/syndication/" xmlns:slash="http://purl.org/rss/1.0/modules/slash/">
  <channel>
    <title>${escapeXml(TITLE)}</title>
    <atom:link href="${LINK}/rss.xml" rel="self" type="application/rss+xml"/>
    <link>${LINK}</link>
    <description>${escapeXml(DESCRIPTION)}</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>${LANG}</language>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>NotionNext</generator>
${publishedPosts.map(post => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${LINK}/${post.slug}</link>
      <comments>${LINK}/${post.slug}#comments</comments>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <dc:creator><![CDATA[${AUTHOR}]]></dc:creator>
      <category><![CDATA[${post.category || ''}]]></category>
      <guid isPermaLink="false">${LINK}/${post.slug}</guid>
      <description><![CDATA[${post.summary || ''}]]></description>
      <content:encoded><![CDATA[${post.summary || ''}]]></content:encoded>
    </item>`).join('\n')}
  </channel>
</rss>`

  return rss
}

/**
 * robots.txt の生成
 * @returns {string} robots.txt の内容
 */
export function generateRobotsTxt() {
  const LINK = siteConfig('LINK')
  const ROBOTS_ALLOW = siteConfig('ROBOTS_ALLOW', true)
  
  if (!ROBOTS_ALLOW) {
    return `User-agent: *
Disallow: /

Sitemap: ${LINK}/sitemap.xml`
  }

  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /private/

# 検索エンジン固有のルール
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Baiduspider
Allow: /
Crawl-delay: 1

# サイトマップ
Sitemap: ${LINK}/sitemap.xml
Sitemap: ${LINK}/rss.xml

# クロール遅延
Crawl-delay: 1`
}

/**
 * セキュリティポリシーファイル (security.txt) の生成
 * @returns {string} security.txt の内容
 */
export function generateSecurityTxt() {
  const AUTHOR = siteConfig('AUTHOR')
  const LINK = siteConfig('LINK')
  const CONTACT_EMAIL = siteConfig('CONTACT_EMAIL', 'security@example.com')
  
  return `Contact: mailto:${CONTACT_EMAIL}
Contact: ${LINK}/contact
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Encryption: ${LINK}/pgp-key.txt
Acknowledgments: ${LINK}/security-acknowledgments
Policy: ${LINK}/security-policy
Hiring: ${LINK}/careers

# セキュリティ報告
# セキュリティ上の脆弱性を発見された場合は、上記連絡先までご報告ください
# 報告受領後24時間以内の返信を努めます`
}

/**
 * XML特殊文字のエスケープ
 * @param {string} str 
 * @returns {string}
 */
function escapeXml(str) {
  if (!str) return ''
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * ウェブサイトマニフェストファイル (manifest.json) の生成
 * @returns {object} manifest.json の内容
 */
export function generateManifest() {
  const TITLE = siteConfig('TITLE')
  const DESCRIPTION = siteConfig('DESCRIPTION')
  const LINK = siteConfig('LINK')
  const THEME_COLOR = siteConfig('THEME_COLOR', '#000000')
  const BACKGROUND_COLOR = siteConfig('BACKGROUND_COLOR', '#ffffff')
  
  return {
    name: TITLE,
    short_name: TITLE,
    description: DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: BACKGROUND_COLOR,
    theme_color: THEME_COLOR,
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ],
    categories: ['blog', 'news', 'education'],
    lang: siteConfig('LANG'),
    dir: 'ltr'
  }
}
