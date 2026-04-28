import BLOG from '@/blog.config'
import {
  getDataFromCache,
  getOrSetDataWithCache,
  setDataToCache
} from '@/lib/cache/cache_manager'
import { deepClone, delay } from '../utils'
import notionAPI from '@/lib/notion/getNotionAPI'

/**
 * 記事のコンテンツブロックを取得
 * @param {*} id
 * @param {*} from
 * @param {*} slice
 * @returns
 */
export async function getPage(id, from = null, slice) {
  const cacheKey = `page_content_${id}`
  return await getOrSetDataWithCache(
    cacheKey,
    async (id, slice) => {
      let pageBlock = await getDataFromCache(cacheKey)
      if (pageBlock) {
        // console.debug('[API<<--キャッシュ]', `from:${from}`, cacheKey)
        return convertNotionBlocksToPost(id, pageBlock, slice)
      }

      // 最新データを取得
      pageBlock = await getPageWithRetry(id, from)

      if (pageBlock) {
        await setDataToCache(cacheKey, pageBlock)
        return convertNotionBlocksToPost(id, pageBlock, slice)
      }
      return pageBlock
    },
    id,
    slice
  )
}

/**
 * インターフェースを呼び出し、失敗した場合はリトライする
 * @param {*} id
 * @param {*} retryAttempts
 */
export async function getPageWithRetry(id, from, retryAttempts = 3) {
  if (retryAttempts && retryAttempts > 0) {
    console.log(
      '[API-->>リクエスト]',
      `from:${from}`,
      `id:${id}`,
      retryAttempts < 3 ? `残りリトライ回数:${retryAttempts}` : ''
    )
    try {
      const start = new Date().getTime()
      const pageData = await notionAPI.getPage(id)
            console.log('[DEBUG API] getPage result keys:', Object.keys(pageData))
            console.log('[DEBUG API] collection_query:', 'collection_query' in pageData, '| type:', typeof pageData.collection_query, '| keys:', pageData?.collection_query ? Object.keys(pageData.collection_query) : [])
            console.log('[DEBUG API] collection_view:', 'collection_view' in pageData, '| type:', typeof pageData.collection_view, '| keys:', pageData?.collection_view ? Object.keys(pageData.collection_view) : [])
            console.log('[DEBUG API] collection:', 'collection' in pageData, '| type:', typeof pageData.collection, '| keys:', pageData?.collection ? Object.keys(pageData.collection) : [])
            console.log('[DEBUG API] block:', 'block' in pageData, '| keys count:', pageData?.block ? Object.keys(pageData.block).length : 0)
            const end = new Date().getTime()
      console.log('[API<<--レスポンス]', `経過時間:${end - start}ms - from:${from}`)
      return pageData
    } catch (e) {
      console.warn('[API<<--例外]:', e)
      await delay(1000)
      const cacheKey = 'page_block_' + id
      const pageBlock = await getDataFromCache(cacheKey)
      if (pageBlock) {
        // console.log('[キャッシュリトライ]', `from:${from}`, `id:${id}`)
        return pageBlock
      }
      return await getPageWithRetry(id, from, retryAttempts - 1)
    }
  } else {
    console.error('[リクエスト失敗]:', `from:${from}`, `id:${id}`)
    return null
  }
}

/**
 * Notion ページのブロック形式のパース処理
 * 1. 冗長なフィールドの削除
 * 2. ファイル、ビデオ、オーディオ、URL のフォーマット
 * 3. コードブロックなどの要素の互換性維持
 * @param {*} id ページID
 * @param {*} blockMap ページ要素
 * @param {*} slice 抽出数
 * @returns
 */
function convertNotionBlocksToPost(id, blockMap, slice) {
  const clonePageBlock = deepClone(blockMap)
  let count = 0
  const blocksToProcess = Object.keys(clonePageBlock?.block || {})

  // ドキュメントの各ブロックをループで走査
  for (let i = 0; i < blocksToProcess.length; i++) {
    const blockId = blocksToProcess[i]
    const b = clonePageBlock?.block[blockId]

    if (slice && slice > 0 && count > slice) {
      delete clonePageBlock?.block[blockId]
      continue
    }

    // BlockId が PageId と等しい場合は削除
    if (b?.value?.id === id) {
      // このブロックには機密情報が含まれている可能性があるため削除
      delete b?.value?.properties
      continue
    }

    count++

     // === 【新規】不正な URL を強制的に修正 ===
    sanitizeBlockUrls(b?.value)

    if (b?.value?.type === 'sync_block' && b?.value?.children) {
      const childBlocks = b.value.children
      // 同期ブロックを削除
      delete clonePageBlock.block[blockId]
      // 子ブロックで同期ブロックを置換
      childBlocks.forEach((childBlock, index) => {
        const newBlockId = `${blockId}_child_${index}`
        clonePageBlock.block[newBlockId] = childBlock
        blocksToProcess.splice(i + index + 1, 0, newBlockId)
      })
      // 新しく追加された子ブロックを再処理
      i--
      continue
    }

    // C++、C#、アセンブリなどの言語名のマッピングを処理
    if (b?.value?.type === 'code') {
      if (b?.value?.properties?.language?.[0][0] === 'C++') {
        b.value.properties.language[0][0] = 'cpp'
      }
      if (b?.value?.properties?.language?.[0][0] === 'C#') {
        b.value.properties.language[0][0] = 'csharp'
      }
      if (b?.value?.properties?.language?.[0][0] === 'Assembly') {
        b.value.properties.language[0][0] = 'asm6502'
      }
    }

    // ファイル、または埋め込み PDF の場合、署名の再作成が必要
    if (
      ['file', 'pdf', 'video', 'audio'].includes(b?.value?.type) &&
      b?.value?.properties?.source?.[0][0] &&
      (b?.value?.properties?.source?.[0][0].indexOf('attachment') === 0 ||
        b?.value?.properties?.source?.[0][0].indexOf('amazonaws.com') > 0)
    ) {
      const oldUrl = b?.value?.properties?.source?.[0][0]
      const newUrl = `https://notion.so/signed/${encodeURIComponent(oldUrl)}?table=block&id=${b?.value?.id}`
      b.value.properties.source[0][0] = newUrl
    }
  }

  // 未使用のフィールドを削除
  if (id === BLOG.NOTION_PAGE_ID) {
    return clonePageBlock
  }
  return clonePageBlock
}

/**
 * ids に基づいてブロックを一括取得する
 * データベースの記事リスト取得時、一定数を超えたブロックは破棄されるため、pageId に基づいて一括取得を行う
 * @param {*} ids
 * @param {*} batchSize
 * @returns
 */
export const fetchInBatches = async (ids, batchSize = 100) => {
  // ids が配列でない場合は配列に変換
  if (!Array.isArray(ids)) {
    ids = [ids]
  }

  let fetchedBlocks = {}
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize)
    console.log('[API-->>リクエスト] 不足しているブロックを取得中', ids.length)
    const start = new Date().getTime()
    const pageChunk = await notionAPI.getBlocks(batch)
    const end = new Date().getTime()
    console.log(
      `[API<<--レスポンス] 経過時間:${end - start}ms 不足しているブロックの取得数:${ids.length} `
    )

    console.log('[API<<--レスポンス]')
    fetchedBlocks = Object.assign(
      {},
      fetchedBlocks,
      pageChunk?.recordMap?.block
    )
  }
  return fetchedBlocks
}


/**
 * ブロック内のすべての可能性のある不正な URL フィールドを強制的に修正
 * @param {Object} blockValue - block.value
 */
function sanitizeBlockUrls(blockValue) {
  if (!blockValue || typeof blockValue !== 'object') return

  const fixUrl = (url) => {
    if (typeof url !== 'string') return url

    if (url.startsWith('/')) {
      return url
    }
    
    // http:xxx → http://xxx の修正
    if (url.startsWith('http:') && !url.startsWith('http://')) {
      url = 'http://' + url.slice(5)
    } else if (url.startsWith('https:') && !url.startsWith('https://')) {
      url = 'https://' + url.slice(6)
    }

    // 再度バリデーションを行い、不正な場合はプレースホルダー画像に置換
    try {
      new URL(url)
      return url
    } catch {
      console.warn('[Sanitize URL] Invalid URL replaced:', url)
      return 'https://via.placeholder.com/1x1?text=Invalid+Image'
    }
  }

  // 1. properties.source の処理（image, embed, bookmark, file, pdf 等用）
  if (
    blockValue.properties?.source?.[0]?.[0] &&
    typeof blockValue.properties.source[0][0] === 'string'
  ) {
    blockValue.properties.source[0][0] = fixUrl(blockValue.properties.source[0][0])
  }

  // 2. file.url の処理（file ブロック用）
  if (blockValue.file?.url && typeof blockValue.file.url === 'string') {
    blockValue.file.url = fixUrl(blockValue.file.url)
  }

  // 3. format.page_cover の処理（ページカバー用）
  if (blockValue.format?.page_cover && typeof blockValue.format.page_cover === 'string') {
    blockValue.format.page_cover = fixUrl(blockValue.format.page_cover)
  }

  // 4. その他の可能性のある URL フィールド（オプション）
  // 例：video、audio の source も properties.source を経由するためカバー済み
}