import sys
with open('lib/notion/getAllPageIds.js', 'r', encoding='utf-8') as f:
    content = f.read()

old_text = '''if (viewIds && viewIds.length > 0) {
      const viewId = viewIds[groupIndex]
      if (collectionQuery && collectionId && collectionQuery[collectionId] && collectionQuery[collectionId][viewId]) {
        const ids = collectionQuery[collectionId][viewId]?.collection_group_results?.blockIds || collectionQuery[collectionId][viewId]?.blockIds || []
        if (ids) {
          for (const id of ids) {
            pageIds.push(id)
          }
        }
      }
    }'''

new_text = '''if (viewIds && viewIds.length > 0) {
      const viewId = viewIds[groupIndex]
      if (collectionQuery && collectionId && collectionQuery[collectionId] && collectionQuery[collectionId][viewId]) {
        const ids = collectionQuery[collectionId][viewId]?.collection_group_results?.blockIds || collectionQuery[collectionId][viewId]?.blockIds || []
        if (ids) {
          for (const id of ids) {
            pageIds.push(id)
          }
        }
      }
      // CollectionQueryが空の場合はcollectionView.page_sortから直接取得
      if (pageIds.length === 0 && collectionView && collectionView[viewId]?.value?.page_sort) {
        pageIds = collectionView[viewId].value.page_sort.filter(id => id)
        console.log('[DEBUG page_sort] pageIds from page_sort:', pageIds.length)
      }
    }'''

if old_text in content:
    content = content.replace(old_text, new_text, 1)
    with open('lib/notion/getAllPageIds.js', 'w', encoding='utf-8') as f:
        f.write(content)
    print('OK: replacement successful')
else:
    print('ERROR: old_text not found in file')
