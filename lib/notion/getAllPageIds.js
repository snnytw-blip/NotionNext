import BLOG from "@/blog.config"

export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) {
  if (!collectionQuery && !collectionView) {
    return []
  }
  let pageIds = []
  try {
    // Notion データベースの何番目のビューをサイトの表示とソートに使用するか：
    const groupIndex = BLOG.NOTION_INDEX || 0
    if (viewIds && viewIds.length > 0) {
      const ids = collectionQuery[collectionId][viewIds[groupIndex]]?.collection_group_results?.blockIds || []
      if (ids) {
        for (const id of ids) {
          pageIds.push(id)
        }
      }
    }
  } catch (error) {
    console.error('Error fetching page IDs:', ids, error);
    return [];
  }

  // それ以外の場合は、データベースの元のソート順に従う
  if (pageIds.length === 0 && collectionQuery && Object.values(collectionQuery).length > 0) {
    const pageSet = new Set()
    Object.values(collectionQuery[collectionId]).forEach(view => {
      view?.blockIds?.forEach(id => pageSet.add(id)) // group ビュー
      view?.collection_group_results?.blockIds?.forEach(id => pageSet.add(id)) // table ビュー
    })
    pageIds = [...pageSet]
    // console.log('PageIds: collectionQuery から取得', collectionQuery, pageIds.length)
  }
  return pageIds
}
