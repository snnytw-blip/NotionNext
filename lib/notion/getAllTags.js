import { siteConfig } from '../config'
import { isIterable } from '../utils'

/**
 * すべての記事のタグを取得する
 * @param allPosts
 * @param sliceCount デフォルトの抽出数は12。0の場合はすべてを返す
 * @param tagOptions タグのドロップダウンオプション
 * @returns {Promise<{}|*[]>}
 */
export function getAllTags({
  allPages,
  sliceCount = 0,
  tagOptions,
  NOTION_CONFIG
}) {
  // Invisible（非表示）状態のページ内のタグも一旦保持し、後でフィルタリングする
  const allPosts = allPages?.filter(
    page =>
      page.type === 'Post' &&
      (page.status === 'Published' || page.status === 'Invisible')
  )

  if (!allPosts || !tagOptions) {
    return []
  }
  // タグデータの統計
  const AllTagInfos = {}
  // すべての記事を走査
  allPosts.forEach(post => {
    post?.tags?.forEach(tag => {
      // タグが既に存在する場合
      if (AllTagInfos[tag]) {
        if (
          AllTagInfos[tag].source === 'Invisible' &&
          post.status === 'Published'
        ) {
          AllTagInfos[tag].source = post.status
        }
        AllTagInfos[tag].count++
      } else {
        // タグが存在しない場合、新しいタグオブジェクトを作成
        AllTagInfos[tag] = {
          count: 1,
          source: post.status
        }
      }
    })
  })

  const list = []
  const IS_TAG_COLOR_DISTINGUISHED = siteConfig(
    'IS_TAG_COLOR_DISTINGUISHED',
    false,
    NOTION_CONFIG
  )
  const TAG_SORT_BY_COUNT = siteConfig('TAG_SORT_BY_COUNT', true, NOTION_CONFIG)
  if (isIterable(tagOptions)) {
    if (!IS_TAG_COLOR_DISTINGUISHED) {
      // 色を区別しない場合、異なる色でも同じ名前のタグは同一として扱う
      const savedTagNames = new Set()
      tagOptions.forEach(c => {
        if (!savedTagNames.has(c.value)) {
          const tagInfo = AllTagInfos[c.value]
          if (tagInfo) {
            list.push({ id: c.id, name: c.value, color: c.color, ...tagInfo })
          }
          savedTagNames.add(c.value)
        }
      })
    } else {
      tagOptions.forEach(c => {
        const tagInfo = AllTagInfos[c.value]
        if (tagInfo) {
          list.push({ id: c.id, name: c.value, color: c.color, ...tagInfo })
        }
      })
    }
  }

  // 数量順にソート
  if (TAG_SORT_BY_COUNT) {
    list.sort((a, b) => b.count - a.count)
  }

  if (sliceCount && sliceCount > 0) {
    return list.slice(0, sliceCount)
  } else {
    return list
  }
}
