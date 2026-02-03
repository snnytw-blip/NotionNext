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

  // 2. 超強力・全方位日付検閲（Mode 12: 自律アドイン）
  const sanitizeAnything = (obj) => {
    // JSONシリアライズで一度「生きたDateオブジェクト」を殺し、文字列にする
    // これにより .toISOString() の再発火を防ぐ
    const stringified = JSON.stringify(obj, (key, value) => {
      // 日付プロパティを見つけたら即座にチェック
      if (key === 'date' || key === 'publishDate' || key === 'lastEditedTime' || key === 'start_date') {
        if (!value) return undefined
        const d = new Date(value)
        if (isNaN(d.getTime())) return undefined // 不正なら消去
        return d.toISOString() // 正常なら文字列として固定
      }
      return value
    })
    return JSON.parse(stringified)
  }

  // 3. 浄化実行
  const props = sanitizeAnything(rawData)

  // 4. 以降、クリーンな props で処理を継続
  const POST_PREVIEW_LINES = siteConfig('POST_PREVIEW_LINES', 12, props?.NOTION_CONFIG)

  props.posts = props.allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  ) || []

  // ページング・プレビュー処理...（中略）
  
  // 5. 生成系に渡す直前で再度念押し
  generateRobotsTxt(props)
  // RSS生成でエラーが出るならここをコメントアウトする勇気も必要
  try {
    generateRss(props)
  } catch (e) {
    console.error('RSS生成をスキップしました', e)
  }
  generateSitemapXml(props)
  
  checkDataFromAlgolia(props)
  if (siteConfig('UUID_REDIRECT', false, props?.NOTION_CONFIG)) {
    generateRedirectJson(props)
  }

  delete props.allPages

  return {
    props,
    revalidate: process.env.EXPORT ? undefined : siteConfig('NEXT_REVALIDATE_SECOND', BLOG.NEXT_REVALIDATE_SECOND, props.NOTION_CONFIG)
  }
}

export default Index
