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

        // collection_query が空の場合、collection_view の page_sort から直接取得する（フォールバック）
    if (pageIds.length === 0 && collectionView && viewIds && viewIds.length > 0) {
      try {
        const groupIndex = BLOG.NOTION_INDEX || 0
        const viewId = viewIds[groupIndex]
        console.log('DEBUG page_sort fallback: viewId=', viewId)
        console.log('DEBUG page_sort fallback: collectionView[viewId]=', JSON.stringify(collectionView[viewId]?.value))
        const pageSort = collectionView[viewId]?.value?.page_sort
        console.log('DEBUG page_sort fallback: pageSort=', pageSort)
        if (pageSort && Array.isArray(pageSort) && pageSort.length > 0) {
          pageIds = [...pageSort]
          console.log('DEBUG page_sort fallback: SUCCESS - got', pageIds.length, 'page IDs')
        } else {
          console.log('DEBUG page_sort fallback: page_sort is missing or empty')
        }
      } catch (error) {
        console.error('Error fetching page IDs from page_sort:', error)
      }
    }

    return pageIds
}
