import { idToUuid } from 'notion-utils'
import { checkStrIsNotionId, getLastPartOfUrl, isBrowser } from '../utils'

/**
 * ページ内リンクのジャンプ処理:
 * 1. 自サイトのドメインの場合、現在のウィンドウで開き、新しいウィンドウを開かない
 * 2. URL が notion-id の場合、サイト内の記事リンクに変換する
 */
export const convertInnerUrl = ({ allPages, lang }) => {
  if (!isBrowser) {
    return
  }
  const allAnchorTags = document
    ?.getElementById('notion-article')
    ?.querySelectorAll('a.notion-link, a.notion-collection-card')

  if (!allAnchorTags) {
    return
  }
  const { origin, pathname } = window.location
  const currentURL = origin + pathname
  const currentPathLang = pathname.split('/').filter(Boolean)[0]
  const langPrefix = lang === currentPathLang ? '/' + lang : ''
  for (const anchorTag of allAnchorTags) {
    // URL を slug に置換
    if (anchorTag?.href) {
      // URL が Notion_id の場合、ブログの記事内リンクへのマッチングを試行
      const slug = getLastPartOfUrl(anchorTag.href)
      if (checkStrIsNotionId(slug)) {
        const slugPage = allPages?.find(page => {
          return idToUuid(slug).indexOf(page.short_id) === 14
        })
        if (slugPage) {
          anchorTag.href = langPrefix + slugPage?.href
        }
      }
    }
    // リンクを現在のページで開く
    if (anchorTag?.target === '_blank') {
      const hrefWithoutQueryHash = anchorTag.href.split('?')[0].split('#')[0]
      const hrefWithRelativeHash =
        currentURL.split('#')[0] || '' + anchorTag.href.split('#')[1] || ''
      if (
        currentURL === hrefWithoutQueryHash ||
        currentURL === hrefWithRelativeHash
      ) {
        anchorTag.target = '_self'
      }
    }

    // リンクが # で終わる場合は、強制的に新しいウィンドウで開く
    if (anchorTag.href.endsWith('#')) {
      anchorTag.target = '_blank'
    }
  }

  for (const anchorTag of allAnchorTags) {
    const slug = getLastPartOfUrl(anchorTag.href)
    const slugPage = allPages?.find(page => {
      return page.slug.indexOf(slug) >= 0
    })
    if (slugPage) {
    }
  }
}
