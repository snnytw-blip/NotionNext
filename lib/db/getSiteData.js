import BLOG from '@/blog.config'
import { getOrSetDataWithCache } from '@/lib/cache/cache_manager'
import { getAllCategories } from '@/lib/notion/getAllCategories'
import getAllPageIds from '@/lib/notion/getAllPageIds'
import { getAllTags } from '@/lib/notion/getAllTags'
import { getConfigMapFromConfigPage } from '@/lib/notion/getNotionConfig'
import getPageProperties, {
  adjustPageProperties
} from '@/lib/notion/getPageProperties'
import { fetchInBatches, getPage } from '@/lib/notion/getPostBlocks'
import { compressImage, mapImgUrl } from '@/lib/notion/mapImage'
import { deepClone } from '@/lib/utils'
import { idToUuid } from 'notion-utils'
import { siteConfig } from '../config'
import { extractLangId, extractLangPrefix, getShortId } from '../utils/pageId'

export { getAllTags } from '../notion/getAllTags'
export { getPost } from '../notion/getNotionPost'
export { getPage as getPostBlocks } from '../notion/getPostBlocks'

/**
 * ブログデータを取得します（Notionベース）
 * @param {*} pageId
 * @param {*} from
 * @param {*} locale 言語 zh|en|ja など
 * @returns
 *
 */
export async function getGlobalData({
  pageId = BLOG.NOTION_PAGE_ID,
  from,
  locale
}) {
  // サイトデータを取得。pageIdがカンマ区切りなら複数回に分けて取得
  const siteIds = pageId?.split(',') || []
  let data = EmptyData(pageId)

  if (BLOG.BUNDLE_ANALYZER) {
    return data
  }

  try {
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const id = extractLangId(siteId)
      const prefix = extractLangPrefix(siteId)
      // 最初のIDがサイトのデフォルト言語
      if (index === 0 || locale === prefix) {
        data = await getSiteDataByPageId({
          pageId: id,
          from
        })
      }
    }
  } catch (error) {
    console.error('エラーが発生しました', error)
  }
  return handleDataBeforeReturn(deepClone(data))
}

/**
 * 指定したNotionコレクションデータを取得
 * @param pageId
 * @param from リクエスト元
 * @returns {Promise<JSX.Element|*|*[]>}
 */
export async function getSiteDataByPageId({ pageId, from }) {
  // Notionの生データを取得。メモリキャッシュをサポート。
  return await getOrSetDataWithCache(
    `site_data_${pageId}`,
    async (pageId, from) => {
      const pageRecordMap = await getPage(pageId, from)
      return convertNotionToSiteData(pageId, from, deepClone(pageRecordMap))
    },
    pageId,
    from
  )
}

/**
 * お知らせを取得
 */
async function getNotice(post) {
  if (!post) {
    return null
  }

  post.blockMap = await getPage(post.id, 'data-notice')
  return post
}

/**
 * 空のデフォルトデータ
 * @param {*} pageId
 * @returns
 */
const EmptyData = pageId => {
  const empty = {
    notice: null,
    siteInfo: getSiteInfo({}),
    allPages: [
      {
        id: '11111111-1111-1111-1111-111111111111',
        title: `Notionデータを取得できません。Notion_IDを確認してください： \n 現在の設定: ${pageId}`,
        summary:
          'ヘルプドキュメントを参照 → https://docs.tangly1024.com/article/vercel-deploy-notion-next',
        status: 'Published',
        type: 'Post',
        slug: 'oops',
        publishDay: '2024-11-13',
        pageCoverThumbnail: BLOG.HOME_BANNER_IMAGE || '/bg_image.jpg',
        date: {
          start_date: '2023-04-24',
          lastEditedDay: '2023-04-24',
          tagItems: []
        }
      }
    ],
    allNavPages: [],
    collection: [],
    collectionQuery: {},
    collectionId: null,
    collectionView: {},
    viewIds: [],
    block: {},
    schema: {},
    tagOptions: [],
    categoryOptions: [],
    rawMetadata: {},
    customNav: [],
    customMenu: [],
    postCount: 1,
    pageIds: [],
    latestPosts: []
  }
  return empty
}

/**
 * Notionデータをサイトデータに変換
 * ここでデータ形式を統一します
 * @returns {Promise<JSX.Element|null|*>}
 */
async function convertNotionToSiteData(pageId, from, pageRecordMap) {
  if (!pageRecordMap) {
    console.error('can`t get Notion Data ; Which id is: ', pageId)
    return {}
  }
    pageId = idToUuid(pageId)
  let block = pageRecordMap.block || {}

  // ★★★★★ 二重ラップ正規化（修正ポイント） ★★★★★
  // Notion API の応答で block の各エントリが { value: { value: actualBlock, role }, role } という
  // 二重ラップ構造になっている場合に対応: value.value が存在するものは一段階巻き戻す
  for (const key of Object.keys(block)) {
    const entry = block[key]
    if (entry && typeof entry.value === 'object' && entry.value !== null && 'value' in entry.value) {
      // 二重ラップ: entry.value = { value: actualBlock, role: '...' }
      block[key] = { value: entry.value.value, role: entry.role }
    }
  }
  // ★★★★★ ここまで ★★★★★

  // Notionから返されたブロックIDが要求したpageIdと異なる場合（エイリアス等）のフォールバック
  if (!block[pageId] && Object.keys(block).length > 0) {
    pageId = Object.keys(block)[0]
  }
  
  const rawMetadata = block[pageId]?.value
  // Type Page-Database または Inline-Database かチェック
  // ★★★★★ collection の二重ラップ対応 ★★★★★
  let collection = {}
  const colEntries = pageRecordMap.collection ? Object.values(pageRecordMap.collection) : []
  if (colEntries.length > 0) {
    let firstCol = colEntries[0]?.value
    if (firstCol && typeof firstCol === 'object' && 'value' in firstCol) {
      collection = firstCol.value
    } else {
      collection = firstCol || {}
    }
  }
  // ★★★★★ ここまで ★★★★★
  
  const hasCollection = collection && Object.keys(collection).length > 0

  if (
    !hasCollection &&
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view' &&
    rawMetadata?.type !== 'page'
  ) {
    console.error(`[DEBUG] pageId "${pageId}" is not a database. Type is: ${rawMetadata?.type}`)
    console.error(`[DEBUG] Object.keys(block): ${JSON.stringify(Object.keys(block))}`)
    if (pageRecordMap.collection) {
       console.error(`[DEBUG] Object.keys(collection): ${JSON.stringify(Object.keys(pageRecordMap.collection))}`)
    }
    return EmptyData(pageId)
  }
  if (rawMetadata?.type === 'page' && (!collection || Object.keys(collection).length === 0)) {
    console.error(`pageId "${pageId}" is a regular page without any database collection.`)
    return EmptyData(pageId)
  }
  let collectionId = rawMetadata?.collection_id
  let viewIds = rawMetadata?.view_ids

  // Notionの仕様変更対応: typeが 'page' の場合、中にある 'collection_view' を探す
  if (rawMetadata?.type === 'page') {
    const contentIds = rawMetadata?.content || []
    for (const id of contentIds) {
      const childBlock = block[id]?.value
      if (childBlock?.type === 'collection_view') {
        collectionId = childBlock.collection_id
        viewIds = childBlock.view_ids
        break
      }
    }
  }

  // rawMetadata から取得できなかったが、collection が存在する場合のフォールバック
  if (!collectionId && hasCollection) {
    collectionId = collection.id
    viewIds = pageRecordMap.collection_view ? Object.keys(pageRecordMap.collection_view) : []
  }

  const collectionQuery = pageRecordMap.collection_query
    const collectionView = pageRecordMap.collection_view
    const schema = collection?.schema
  
    // ★ DIAGNOSTIC: collection_query detailed structure
    if (collectionQuery) {
      const cqKeys = Object.keys(collectionQuery)
      console.log('[DEBUG COLLECTION_QUERY] keys:', cqKeys)
      for (const cqKey of cqKeys) {
        const inner = collectionQuery[cqKey]
        console.log('[DEBUG COLLECTION_QUERY] inner[' + cqKey + '] type:', typeof inner, 'keys:', Object.keys(inner || {}))
        if (inner) {
          for (const innerKey of Object.keys(inner)) {
            const val = inner[innerKey]
            console.log('[DEBUG COLLECTION_QUERY] inner[' + cqKey + '][' + innerKey + '] type:', typeof val, 'keys:', Object.keys(val || {}), 'hasBlockIds:', !!val?.blockIds, 'hasAggregationResultGroups:', !!val?.aggregationResultGroups)
            // Print first page ID's properties if blockIds exist
            if (val?.blockIds?.length > 0) {
              console.log('[DEBUG COLLECTION_QUERY] first blockIds:', val.blockIds.slice(0, 3))
            }
          }
        }
      }
    } else {
      console.log('[DEBUG COLLECTION_QUERY] collectionQuery is null/undefined')
    }
    // ★ DIAGNOSTIC: collection structure
    if (collection) {
      console.log('[DEBUG COLLECTION] keys:', Object.keys(collection), 'hasSchema:', 'schema' in collection, 'schema type:', typeof collection?.schema, 'schema keys:', Object.keys(collection?.schema || {}), 'hasName:', !!collection?.name)
    } else {
      console.log('[DEBUG COLLECTION] collection is null/undefined')
    }

  const collectionData = []

    const pageIds = getAllPageIds(
    collectionQuery,
    collectionId,
    collectionView,
    viewIds
  )

  // ★ ブロックに存在しないIDを個別に取得（Notionがsub-pageのblockを返さない問題の対処）
    // getPageでは全IDのblockデータが返らない場合があるため、
    // pageIdsに含まれるIDでblockに無いものを個別にgetPageで取得する
    if (pageIds.length > 0) {
      const blockIdsNeedFetch = []
      for (let i = 0; i < pageIds.length; i++) {
        const id = pageIds[i]
        if (!block[id]?.value) {
          blockIdsNeedFetch.push(id)
        }
      }
      if (blockIdsNeedFetch.length > 0) {
        console.log('[DEBUG] Fetching', blockIdsNeedFetch.length, 'blocks individually via getPage (collectionQuery fallback)')
        for (const blockId of blockIdsNeedFetch) {
          try {
            const pageData = await getPage(blockId, 'data-fetch-block')
            if (pageData?.block) {
              block = Object.assign({}, block, pageData.block)
            }
          } catch (e) {
            console.warn('[DEBUG] Failed to fetch block', blockId, e.message)
          }
        }
      }
    }

    // ブロックに存在するIDのみを有効とする
    const validPageIds = pageIds.filter(id => block[id]?.value)
    if (validPageIds.length !== pageIds.length) {
      console.log(`[フィルタ] ${pageIds.length - validPageIds.length}件の無効なページIDを除外しました`)
    }

    if (validPageIds?.length === 0) {
      console.error(
        '取得した記事リストが空です。Notionテンプレートを確認してください',
        collectionQuery,
        collection,
        collectionView,
        viewIds,
        pageRecordMap
      )
    } else {
      // console.log('有効なページ数', validPageIds?.length)
    }

  // 各記事の基本データを取得
  for (let i = 0; i < validPageIds.length; i++) {
    const id = validPageIds[i]
    const value = block[id]?.value
    const properties =
      (await getPageProperties(
        id,
        value,
        schema,
        null,
        getTagOptions(schema)
      )) || null

    if (properties) {
      collectionData.push(properties)
            console.log('[DEBUG PROPERTIES] id=' + id + ' type=' + properties.type + ' status=' + properties.status + ' slug=' + properties.slug + ' title=' + (properties.title || '').substring(0, 30))
    } else {
      console.log('[DEBUG PROPERTIES] id=' + id + ' properties is null')
    }
  }

  // サイト設定：設定用テーブルがある場合はそちらを優先。なければ blog.config.js を使用
  const NOTION_CONFIG = (await getConfigMapFromConfigPage(collectionData)) || {}

  // 各データのフィールドを調整
  collectionData.forEach(function (element) {
    adjustPageProperties(element, NOTION_CONFIG)
  })

  // サイト基本情報
  const siteInfo = getSiteInfo({ collection, block, NOTION_CONFIG })

  // 記事数カウント
  let postCount = 0

  // すべてのPostとPageを検索
  const allPages = collectionData.filter(post => {
    if (post?.type === 'Post' && post.status === 'Published') {
      postCount++
    }

    return (
      post &&
      post?.slug &&
      //   !post?.slug?.startsWith('http') &&
      (post?.status === 'Invisible' || post?.status === 'Published')
    )
  })

  // 日付順にソート
  if (siteConfig('POSTS_SORT_BY', null, NOTION_CONFIG) === 'date') {
    allPages.sort((a, b) => {
      return b?.publishDate - a?.publishDate
    })
  }

  const notice = await getNotice(
    collectionData.filter(post => {
      return (
        post &&
        post?.type &&
        post?.type === 'Notice' &&
        post.status === 'Published'
      )
    })?.[0]
  )
  // すべてのカテゴリ
  const categoryOptions = getAllCategories({
    allPages,
    categoryOptions: getCategoryOptions(schema)
  })
  // すべてのタグ
  const tagSchemaOptions = getTagOptions(schema)
  const tagOptions =
    getAllTags({
      allPages: allPages ?? [],
      tagOptions: tagSchemaOptions ?? [],
      NOTION_CONFIG
    }) ?? null
  // 旧メニュー
  const customNav = getCustomNav({
    allPages: collectionData.filter(
      post => post?.type === 'Page' && post.status === 'Published'
    )
  })
  // 新メニュー
  const customMenu = getCustomMenu({ collectionData, NOTION_CONFIG })
  const latestPosts = getLatestPosts({ allPages, from, latestPostCount: 6 })
  const allNavPages = getNavPages({ allPages })

  return {
    NOTION_CONFIG,
    notice,
    siteInfo,
    allPages,
    allNavPages,
    collection,
    collectionQuery,
    collectionId,
    collectionView,
    viewIds,
    block,
    schema,
    tagOptions,
    categoryOptions,
    rawMetadata,
    customNav,
    customMenu,
    postCount,
    pageIds,
    latestPosts
  }
}

/**
 * ブラウザフロントエンドに返す前のデータ処理
 * 秘匿情報の削除
 * サイズの削減
 * その他の処理
 * @param {*} db
 */
function handleDataBeforeReturn(db) {
  // 不要なデータを削除
  delete db.block
  delete db.schema
  delete db.rawMetadata
  delete db.pageIds
  delete db.viewIds
  delete db.collection
  delete db.collectionQuery
  delete db.collectionId
  delete db.collectionView

  // 不要なブロックを削除
  if (db?.notice) {
    db.notice = cleanBlock(db?.notice)
    delete db.notice?.id
  }
  db.categoryOptions = cleanIds(db?.categoryOptions)
  db.customMenu = cleanIds(db?.customMenu)

  //   db.latestPosts = shortenIds(db?.latestPosts)
  db.allNavPages = shortenIds(db?.allNavPages)
  //   db.allPages = cleanBlocks(db?.allPages)

  db.allNavPages = cleanPages(db?.allNavPages, db.tagOptions)
  db.allPages = cleanPages(db.allPages, db.tagOptions)
  db.latestPosts = cleanPages(db.latestPosts, db.tagOptions)
  // 使用後に削除が必要
  db.tagOptions = cleanTagOptions(db?.tagOptions)

  const POST_SCHEDULE_PUBLISH = siteConfig(
    'POST_SCHEDULE_PUBLISH',
    null,
    db.NOTION_CONFIG
  )
  if (POST_SCHEDULE_PUBLISH) {
    //   console.log('[予約投稿] チェック開始')
    db.allPages?.forEach(p => {
      // 記事の公開・非公開時間を判断し、期間外であれば非表示にする
      const publish = isInRange(p.title, p.date)
      if (!publish) {
        const currentTimestamp = Date.now()
        const startTimestamp = getTimestamp(
          p.date.start_date,
          p.date.start_time || '00:00',
          p.date.time_zone
        )
        const endTimestamp = getTimestamp(
          p.date.end_date,
          p.date.end_time || '23:59',
          p.date.time_zone
        )
        console.log(
          '[予約投稿] 非表示--> 記事:',
          p.title,
          '現在タイムスタンプ:',
          currentTimestamp,
          '目標タイムスタンプ:',
          startTimestamp,
          '-',
          endTimestamp
        )
        console.log(
          '[予約投稿] 非表示--> 記事:',
          p.title,
          '現在時刻:',
          new Date(),
          '目標時刻:',
          p.date
        )
        // 非表示
        p.status = 'Invisible'
      }
    })
  }

  return db
}

/**
 * 記事リスト内の異常なデータを処理
 * @param {Array} allPages - すべてのページデータ
 * @param {Array} tagOptions - タグオプション
 * @returns {Array} 処理後の allPages
 */
function cleanPages(allPages, tagOptions) {
  // パラメータが配列かチェック
  if (!Array.isArray(allPages) || !Array.isArray(tagOptions)) {
    console.warn('Invalid input: allPages and tagOptions should be arrays.')
    return allPages || [] // 空配列または元の値を返す
  }

  // tagOptions から有効なタグ名を抽出
  const validTags = new Set(
    tagOptions
      .map(tag => (typeof tag.name === 'string' ? tag.name : null))
      .filter(Boolean) // 有効な文字列のみ残す
  )

  // すべてのページをループ
  allPages.forEach(page => {
    // tagItems が配列か確認
    if (Array.isArray(page.tagItems)) {
      // 各ページの tagItems をフィルタリング
      page.tagItems = page.tagItems.filter(
        tagItem =>
          validTags.has(tagItem?.name) && typeof tagItem.name === 'string' // tagItem.name が文字列かチェック
      )
    }
  })

  return allPages
}

/**
 * データのIDを整理
 * @param {*} items
 * @returns
 */
function shortenIds(items) {
  if (items && Array.isArray(items)) {
    return deepClone(
      items.map(item => {
        item.short_id = getShortId(item.id)
        delete item.id
        return item
      })
    )
  }
  return items
}

/**
 * データのIDを整理
 * @param {*} items
 * @returns
 */
function cleanIds(items) {
  if (items && Array.isArray(items)) {
    return deepClone(
      items.map(item => {
        delete item.id
        return item
      })
    )
  }
  return items
}

/**
 * tagOptions を整理・フィルタリング
 * @param {*} tagOptions
 * @returns
 */
function cleanTagOptions(tagOptions) {
  if (tagOptions && Array.isArray(tagOptions)) {
    return deepClone(
      tagOptions
        .filter(tagOption => tagOption.source === 'Published')
        .map(({ id, source, ...newTagOption }) => newTagOption)
    )
  }
  return tagOptions
}

/**
 * ブロックデータを整理
 */
function cleanBlock(item) {
  const post = deepClone(item)
  const pageBlock = post?.blockMap?.block
  //   delete post?.id
  //   delete post?.blockMap?.collection

  if (pageBlock) {
    for (const i in pageBlock) {
      pageBlock[i] = cleanBlock(pageBlock[i])
      delete pageBlock[i]?.role
      delete pageBlock[i]?.value?.version
      delete pageBlock[i]?.value?.created_by_table
      delete pageBlock[i]?.value?.created_by_id
      delete pageBlock[i]?.value?.last_edited_by_table
      delete pageBlock[i]?.value?.last_edited_by_id
      delete pageBlock[i]?.value?.space_id
      delete pageBlock[i]?.value?.version
      delete pageBlock[i]?.value?.format?.copied_from_pointer
      delete pageBlock[i]?.value?.format?.block_locked_by
      delete pageBlock[i]?.value?.parent_table
      delete pageBlock[i]?.value?.copied_from_pointer
      delete pageBlock[i]?.value?.copied_from
      delete pageBlock[i]?.value?.created_by_table
      delete pageBlock[i]?.value?.created_by_id
      delete pageBlock[i]?.value?.last_edited_by_table
      delete pageBlock[i]?.value?.last_edited_by_id
      delete pageBlock[i]?.value?.permissions
      delete pageBlock[i]?.value?.alive
    }
  }
  return post
}

/**
 * 最新記事を取得。最終編集時間の降順で並べ替え
 * @param {*}} param0
 * @returns
 */
function getLatestPosts({ allPages, from, latestPostCount }) {
    const allPosts = allPages?.filter(
    page => page.type === 'Post' && page.status === 'Published'
  )

  // [publish_date対応] ソートキーを publishDate 優先に変更（lastEditedDate はフォールバック）
  const latestPosts = Object.create(allPosts).sort((a, b) => {
    const dateA = a?.publishDate || a?.lastEditedDate || 0
        const dateB = b?.publishDate || b?.lastEditedDate || 0
    return dateB - dateA
  })
  return latestPosts.slice(0, latestPostCount)
}

/**
 * ユーザー定義のシングルページメニューを取得
 * 旧バージョン：Menuを読み込まず、type=Page から生成
 * @param notionPageData
 * @returns {Promise<[]|*[]>}
 */
function getCustomNav({ allPages }) {
  const customNav = []
  if (allPages && allPages.length > 0) {
    allPages.forEach(p => {
      p.to = p.slug
      customNav.push({
        icon: p.icon || null,
        name: p.title || p.name || '',
        href: p.href,
        target: p.target,
        show: true
      })
    })
  }
  return customNav
}

/**
 * カスタムメニューを取得
 * @param {*} allPages
 * @returns
 */
function getCustomMenu({ collectionData, NOTION_CONFIG }) {
  const menuPages = collectionData.filter(
    post =>
      post.status === 'Published' &&
      (post?.type === 'Menu' || post?.type === 'SubMenu')
  )
  const menus = []
  if (menuPages && menuPages.length > 0) {
    menuPages.forEach(e => {
      e.show = true
      if (e.type === 'Menu') {
        menus.push(e)
      } else if (e.type === 'SubMenu') {
        const parentMenu = menus[menus.length - 1]
        if (parentMenu) {
          if (parentMenu.subMenus) {
            parentMenu.subMenus.push(e)
          } else {
            parentMenu.subMenus = [e]
          }
        }
      }
    })
  }
  return menus
}

/**
 * タグオプションを取得
 * @param schema
 * @returns {undefined}
 */
function getTagOptions(schema) {
  if (!schema) return {}
  const tagSchema = Object.values(schema).find(
    e => e.name === BLOG.NOTION_PROPERTY_NAME.tags
  )
  return tagSchema?.options || []
}

/**
 * カテゴリオプションを取得
 * @param schema
 * @returns {{}|*|*[]}
 */
function getCategoryOptions(schema) {
  if (!schema) return {}
  const categorySchema = Object.values(schema).find(
    e => e.name === BLOG.NOTION_PROPERTY_NAME.category
  )
  return categorySchema?.options || []
}

/**
 * サイト情報
 * @param notionPageData
 * @param from
 * @returns {Promise<{title,description,pageCover,icon}>}
 */
function getSiteInfo({ collection, block, NOTION_CONFIG }) {
  const defaultTitle = NOTION_CONFIG?.TITLE || BLOG.TITLE || 'NotionNext BLOG'
  const defaultDescription =
    NOTION_CONFIG?.DESCRIPTION || BLOG.DESCRIPTION || 'NotionNext によって生成されたサイトです'
  const defaultPageCover = NOTION_CONFIG?.HOME_BANNER_IMAGE || '/bg_image.jpg'
  const defaultIcon = NOTION_CONFIG?.AVATAR || '/avatar.svg'
  const defaultLink = NOTION_CONFIG?.LINK || BLOG.LINK
  // 空データの場合はデフォルト値を返す
  if (!collection && !block) {
    return {
      title: defaultTitle,
      description: defaultDescription,
      pageCover: defaultPageCover,
      icon: defaultIcon,
      link: defaultLink
    }
  }

  const title = collection?.name?.[0][0] || defaultTitle
  const description = collection?.description
    ? Object.assign(collection).description[0][0]
    : defaultDescription

  const pageCover = collection?.cover
    ? mapImgUrl(collection?.cover, collection, 'collection')
    : defaultPageCover

  // アバター画像を圧縮
  let icon = compressImage(
    collection?.icon
      ? mapImgUrl(collection?.icon, collection, 'collection')
      : defaultIcon
  )
  // サイトURL
  const link = NOTION_CONFIG?.LINK || defaultLink

  // サイトアイコンに絵文字は使用不可
  const emojiPattern = /\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g
  if (!icon || emojiPattern.test(icon)) {
    icon = defaultIcon
  }
  return { title, description, pageCover, icon, link }
}

/**
 * 記事が公開期間内か判断
 * @param {string} title - 記事タイトル
 * @param {Object} date - 時間範囲パラメータ
 * @param {string} date.start_date - 開始日（YYYY-MM-DD）
 * @param {string} date.start_time - 開始時間（任意、HH:mm）
 * @param {string} date.end_date - 終了日（YYYY-MM-DD）
 * @param {string} date.end_time - 終了時間（任意、HH:mm）
 * @param {string} date.time_zone - タイムゾーン（IANA形式、例："Asia/Tokyo"）
 * @returns {boolean} 範囲内かどうか
 */
function isInRange(title, date = {}) {
  const {
    start_date,
    start_time = '00:00',
    end_date,
    end_time = '23:59',
    time_zone = 'Asia/Tokyo'
  } = date

  // 現在時刻のタイムスタンプを取得（対象のタイムゾーンに基づく）
  const currentTimestamp = Date.now()

  // 開始と終了時刻のタイムスタンプを取得
  const startTimestamp = getTimestamp(start_date, start_time, time_zone)
  const endTimestamp = getTimestamp(end_date, end_time, time_zone)

  // 範囲内か判断
  if (startTimestamp && currentTimestamp < startTimestamp) {
    return false
  }

  if (endTimestamp && currentTimestamp > endTimestamp) {
    return false
  }

  return true
}

/**
  * 指定されたタイムゾーンの日付文字列をUTC時間に変換
 * @param {string} dateStr - 日付文字列、形式は YYYY-MM-DD HH:mm:ss
 * @param {string} timeZone - タイムゾーン名（例："Asia/Shanghai"）
 * @returns {Date} - 変換後のDateオブジェクト（UTC時間）
 */
function convertToUTC(dateStr, timeZone = 'Asia/Shanghai') {
  // タイムゾーンのオフセットマッピングを維持（時間単位）
  const timeZoneOffsets = {
    // UTC 基礎
    UTC: 0,
    'Etc/GMT': 0,
    'Etc/GMT+0': 0,

    // アジア
    'Asia/Shanghai': 8, // 中国
    'Asia/Taipei': 8, // 台湾
    'Asia/Tokyo': 9, // 日本
    'Asia/Seoul': 9, // 韓国
    'Asia/Kolkata': 5.5, // インド
    'Asia/Jakarta': 7, // インドネシア
    'Asia/Singapore': 8, // シンガポール
    'Asia/Hong_Kong': 8, // 香港
    'Asia/Bangkok': 7, // タイ
    'Asia/Dubai': 4, // アラブ首長国連邦
    'Asia/Tehran': 3.5, // イラン
    'Asia/Riyadh': 3, // サウジアラビア

    // ヨーロッパ
    'Europe/London': 0, // 英国（GMT）
    'Europe/Paris': 1, // フランス（CET）
    'Europe/Berlin': 1, // ドイツ
    'Europe/Moscow': 3, // ロシア
    'Europe/Amsterdam': 1, // オランダ

    // アメリカ
    'America/New_York': -5, // 米国東部（EST）
    'America/Chicago': -6, // 米国中部（CST）
    'America/Denver': -7, // 米国山岳部（MST）
    'America/Los_Angeles': -8, // 米国西部（PST）
    'America/Sao_Paulo': -3, // ブラジル
    'America/Argentina/Buenos_Aires': -3, // アルゼンチン

    // アフリカ
    'Africa/Johannesburg': 2, // 南アフリカ
    'Africa/Cairo': 2, // エジプト
    'Africa/Nairobi': 3, // ケニア

    // オセアニア
    'Australia/Sydney': 10, // オーストラリア東部
    'Australia/Perth': 8, // オーストラリア西部
    'Pacific/Auckland': 13, // ニュージーランド
    'Pacific/Fiji': 12, // フィジー

    // 北極・南極
    'Antarctica/Palmer': -3, // 南極パルマー
    'Antarctica/McMurdo': 13 // 南極マクマード
  }

  // 大陸ごとのデフォルトタイムゾーンをプリセット
  const continentDefaults = {
    Asia: 'Asia/Tokyo',
    Europe: 'Europe/London',
    America: 'America/New_York',
    Africa: 'Africa/Cairo',
    Australia: 'Australia/Sydney',
    Pacific: 'Pacific/Auckland',
    Antarctica: 'Antarctica/Palmer',
    UTC: 'UTC'
  }

  // 対象タイムゾーンのオフセット量を取得（時間単位）
  let offsetHours = timeZoneOffsets[timeZone]

  // サポートされていないタイムゾーンの場合の互換処理
  if (offsetHours === undefined) {
    // タイムゾーン所属の大陸を取得 ("Continent/City" -> "Continent")
    const continent = timeZone.split('/')[0]

    // その大陸のデフォルトタイムゾーンを選択
    const fallbackZone = continentDefaults[continent] || 'UTC'
    offsetHours = timeZoneOffsets[fallbackZone]

    console.warn(
      `Warning: Unsupported time zone "${timeZone}". Using default "${fallbackZone}" for continent "${continent}".`
    )
  }


  // 日付文字列をローカル時間のDateオブジェクトに変換
  const localDate = new Date(`${dateStr.replace(' ', 'T')}Z`)
  if (isNaN(localDate.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }
  // 计算 UTC 时间的时间戳
  const utcTimestamp = localDate.getTime() - offsetHours * 60 * 60 * 1000
  return new Date(utcTimestamp)
}

// 補助関数：指定された日時のタイムスタンプを生成（対象タイムゾーン基準）
function getTimestamp(date, time = '00:00', time_zone) {
  if (!date) return null
  return convertToUTC(`${date} ${time}:00`, time_zone).getTime()
}

/**
 * ナビゲーション用の精選された記事リストを取得
 * gitbookテーマで使用。記事のタイトル・カテゴリ・タグ情報のみ保持し、
 * 要約・パスワード・日付などのデータは省く
 * ナビゲーションページの条件は、Postであること
 * @param {*} param0
 */
export function getNavPages({ allPages }) {
  const allNavPages = allPages?.filter(post => {
    return (
      post &&
      post?.slug &&
      post?.type === 'Post' &&
      post?.status === 'Published'
    )
  })

  return allNavPages.map(item => ({
    id: item.id,
    title: item.title || '',
    pageCoverThumbnail: item.pageCoverThumbnail || '',
    category: item.category || null,
    tags: item.tags || null,
    summary: item.summary || null,
    slug: item.slug,
    href: item.href,
    pageIcon: item.pageIcon || '',
    lastEditedDate: item.lastEditedDate,
    publishDate: item.publishDate,
    ext: item.ext || {}
  }))
}