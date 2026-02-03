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
  const rawProps = await getGlobalData({ from, locale })

  // 2. 最終兵器：全データ構造を再帰的に走査して不正な日付を抹殺する関数
  const deepCleanProps = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj
    
    // 配列の場合：中身を洗浄し、記事オブジェクトであれば日付チェック
    if (Array.isArray(obj)) {
      return obj
        .map(v => deepCleanProps(v))
        .filter(v => {
          if (v && typeof v === 'object' && (v.publishDate || v.date)) {
            const dateValue = v.publishDate || v.date?.start_date || v.lastEditedTime
            const d = new Date(dateValue)
            return !isNaN(d.getTime())
          }
          return true
        })
    }

    // オブジェクトの場合：プロパティを再帰的にチェック
    const newObj = {}
    for (const [key, value] of Object.entries(obj)) {
      if (value instanceof Date && isNaN(value.getTime())) continue
      newObj[key] = deepCleanProps(value)
    }
    return newObj
  }

  // 3. データの浄化実行
  const props = deepCleanProps(rawProps)

  // 4. 以降の処理（洗浄済みの props を使用）
  const POST_PREVIEW_LINES = siteConfig(
    'POST_PREVIEW_LINES',
    12,
    props?.NOTION_CONFIG
  )

  // 洗浄済みの allPages から投稿を取得
  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  // ページング処理
  if (siteConfig('POST_LIST_STYLE') === 'scroll') {
    // スクロール時はそのまま
  } else if (siteConfig('POST_LIST_STYLE') === 'page') {
    props.posts = props.posts?.slice(
      0,
      siteConfig('POSTS_PER_PAGE', 12, props?.NOTION_CONFIG)
    )
  }

  // プレビュー表示設定
  if (siteConfig('POST_LIST_PREVIEW', false, props?.NOTION_CONFIG)) {
    for (const i in props.posts) {
      const post = props.posts[i]
      if (post.password && post.password !== '') continue
      post.blockMap = await getPostBlocks(post.id, 'slug', POST_PREVIEW_LINES)
    }
  }

  // 各種XML/Txt生成
  generateRobotsTxt(props)
  generateRss(props)
  generateSitemapXml(props)
  
  checkDataFromAlgolia(props)
  if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
    generateRedirectJson(props)
  }

  delete props.allPages

  return {
    props,
    revalidate: process.env.EXPORT
      ? undefined
      : siteConfig(
          'NEXT_REVALIDATE_SECOND',
          BLOG.NEXT_REVALIDATE_SECOND,
          props.NOTION_CONFIG
        )
  }
}

export default Index
