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
      const viewId = viewIds[groupIndex]
      if (collectionQuery && collectionId && collectionQuery[collectionId] && collectionQuery[collectionId][viewId]) {
        const ids = collectionQuery[collectionId][viewId]?.collection_group_results?.blockIds || collectionQuery[collectionId][viewId]?.blockIds || []
        if (ids) {
          for (const id of ids) {
            pageIds.push(id)
          }
        }
      }
      // フォールバック: collectionView.page_sortから直接取得
      if (pageIds.length === 0 && collectionView && viewId && collectionView[viewId]?.value?.page_sort) {
        pageIds = collectionView[viewId].value.page_sort.filter(id => id)
        console.log("[DEBUG page_sort] pageIds from page_sort:", pageIds.length)
      }
    }
  } catch (error) {
    console.error('Error fetching page IDs:', error);
    return [];
  }

  // それ以外の場合は、データベースの元のソート順に従う
  if (pageIds.length === 0 && collectionQuery && collectionId && collectionQuery[collectionId]) {
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
