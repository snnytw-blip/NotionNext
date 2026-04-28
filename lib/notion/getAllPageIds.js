import BLOG from "@/blog.config"

export default function getAllPageIds(collectionQuery, collectionId, collectionView, viewIds) {
  console.log('getAllPageIds called: pageIds.length=0?', !collectionQuery && !collectionView ? 'no data' : 'has data', 'viewIds=', viewIds)
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
                console.log('DEBUG page_sort: enter fallback block, viewId=', viewId)
                // 生のオブジェクト参照でpage_sortにアクセス
                const rawValue = collectionView[viewId]?.value
                console.log('DEBUG page_sort: rawValue type=', typeof rawValue, 'keys=', Object.keys(rawValue || {}))
                const pageSort = rawValue?.value?.page_sort
               
                console.log('DEBUG page_sort: direct access pageSort=', pageSort)
                if (!pageSort || !Array.isArray(pageSort) || pageSort.length === 0) {
                  // 本当に無い場合だけJSON.stringifyで確認
                  const strVal = JSON.stringify(rawValue)
                  const hasPageSort = strVal.includes('page_sort')
                  console.log('DEBUG page_sort: contains page_sort in JSON?', hasPageSort)
                  if (hasPageSort) {
                    // JSONの中にはあるが直接アクセスできない → 文字列からパース
                    const parsed = JSON.parse(strVal)
                    const recoveredPageSort = parsed?.value?.page_sort
                    console.log('DEBUG page_sort: recovered from JSON=', recoveredPageSort?.length)
                    if (recoveredPageSort && Array.isArray(recoveredPageSort) && recoveredPageSort.length > 0) {
                      pageIds = [...recoveredPageSort]
                      console.log('DEBUG page_sort: SUCCESS from JSON fallback!')
                    }
                  }
                } else {
                  pageIds = [...pageSort]
                  console.log('DEBUG page_sort: SUCCESS direct access! got', pageIds.length, 'ids')
                }
      } catch (error) {
                console.error('Error fetching page IDs from page_sort:', error)
      }
    }

    return pageIds
}
