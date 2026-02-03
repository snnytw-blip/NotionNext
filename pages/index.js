import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { getGlobalData, getPostBlocks } from '@/lib/db/getSiteData'
import { generateRobotsTxt } from '@/lib/robots.txt'
import { generateRss } from '@/lib/rss'
import { generateSitemapXml } from '@/lib/sitemap.xml'
import { DynamicLayout } from '@/themes/theme'
import { generateRedirectJson } from '@/lib/redirect'
import { checkDataFromAlgolia } from '@/lib/plugins/algolia'

const Index = props => {
  const theme = siteConfig('THEME', BLOG.THEME, props.NOTION_CONFIG)
  return <DynamicLayout theme={theme} layoutName='LayoutIndex' {...props} />
}

export async function getStaticProps(req) {
  const { locale } = req
  const from = 'index'
  
  // 1. データの取得
  const rawData = await getGlobalData({ from, locale })

  // 2. 浄化ロジック (サーバーサイドに隔離)
  const sanitizeAnything = (obj) => {
    return JSON.parse(JSON.stringify(obj, (key, value) => {
      const dateKeys = ['date', 'publishDate', 'lastEditedTime', 'start_date']
      if (dateKeys.includes(key)) {
        if (!value) return undefined
        const d = new Date(value)
        return isNaN(d.getTime()) ? undefined : d.toISOString()
      }
      return value
    }))
  }

  const props = sanitizeAnything(rawData)

  // 3. 投稿データの抽出
  const POST_PREVIEW_LINES = siteConfig('POST_PREVIEW_LINES', 12, props?.NOTION_CONFIG)
  props.posts = props.allPages?.filter(p => p.type === 'Post' && p.status === 'Published') || []

  if (siteConfig('POST_LIST_STYLE') === 'page') {
    props.posts = props.posts.slice(0, siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG))
  }

  if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
    for (const post of props.posts) {
      if (post.password) continue
      post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
    }
  }

  // 4. 静的ファイル生成（失敗してもビルドを止めない）
  const tryGenerate = (fn) => { try { fn(props) } catch (e) { console.error(e) } }
  tryGenerate(generateRobotsTxt)
  tryGenerate(generateRss)
  tryGenerate(generateSitemapXml)
  
  checkDataFromAlgolia(props)
  if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
    tryGenerate(generateRedirectJson)
  }

  delete props.allPages

  return {
    props,
    revalidate: process.env.EXPORT ? undefined : siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, props.NOTION_CONFIG)
  }
}

export default Index
