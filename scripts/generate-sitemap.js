const fs = require('fs')
const path = require('path')

const rootDir = path.join(__dirname, '..')
const outDir = path.join(rootDir, 'out')
const publicDir = path.join(rootDir, 'public')

// LINKの指定（環境変数SITE_URLがあれば使用、なければデフォルト）
const LINK = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://mirai-ai-lab.pages.dev'

// outディレクトリからHTMLファイルを再帰的に検索
function findHtmlFiles(dir) {
  let results = []
  try {
    const list = fs.readdirSync(dir)
    list.forEach(file => {
      const filePath = path.join(dir, file)
      const stat = fs.statSync(filePath)
      if (stat.isDirectory()) {
        results = results.concat(findHtmlFiles(filePath))
      } else if (file.endsWith('.html') && !file.startsWith('_')) {
        results.push(filePath)
      }
    })
  } catch (e) {
    // ディレクトリが存在しない場合は無視
  }
  return results
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function generateSitemap() {
  if (!fs.existsSync(outDir)) {
    console.warn('[generate-sitemap] out directory not found. Skipping.')
    return
  }

  const htmlFiles = findHtmlFiles(outDir)
  const urls = htmlFiles.map(filePath => {
    const relativePath = path.relative(outDir, filePath)
    // Windowsパス区切りをUnix形式に変換
    const normalizedPath = relativePath.replace(/\\/g, '/')
    // index.html の除去とルートパスの調整
    let urlPath = normalizedPath
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
    // ルートパスが空文字列になった場合は'/'にする
    if (urlPath === '' || urlPath === 'index') {
      urlPath = ''
    }
    const loc = `${LINK.replace(/\/+$/, '')}/${urlPath}`
    const stats = fs.statSync(filePath)
    const lastmod = stats.mtime.toISOString().split('T')[0]
    return { loc, lastmod }
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map(u => `  <url>
    <loc>${escapeXml(u.loc.replace(/\/+$/, ''))}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`

  // public ディレクトリに出力
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8')

  // out ディレクトリにも出力
  fs.writeFileSync(path.join(outDir, 'sitemap.xml'), xml, 'utf-8')

  console.log(`[generate-sitemap] sitemap.xml generated with ${urls.length} URLs`)
}

generateSitemap()