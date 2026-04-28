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
  
  // Notionから返されたブロックIDが要求したpageIdと異なる場合（エイリアス等）のフォールバック
  if (!block[pageId] && Object.keys(block).length > 0) {
    pageId = Object.keys(block)[0]
  }
  
  const rawMetadata = block[pageId]?.value
  // Type Page-Database または Inline-Database かチェック
  const collection = pageRecordMap.collection ? Object.values(pageRecordMap.collection)[0]?.value : {}
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

  const collectionData = []

  const pageIds = getAllPageIds(
    collectionQuery,
    collectionId,
    collectionView,
    viewIds
  )

  if (pageIds?.length === 0) {
    console.error(
      '取得した記事リストが空です。Notionテンプレートを確認してください',
      collectionQuery,
      collection,
      collectionView,
      viewIds,
      pageRecordMap
    )
  } else {
    // console.log('有効なページ数', pageIds?.length)
  }

  // メインデータベースからは最大1000ブロックまで取得。溢れた分をここで一括取得
  const blockIdsNeedFetch = []
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value
    if (!value) {
      blockIdsNeedFetch.push(id)
    }
  }
  const fetchedBlocks = await fetchInBatches(blockIdsNeedFetch)
  block = Object.assign({}, block, fetchedBlocks)

  // 获取每篇文章基础数据
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value || fetchedBlocks[id]?.value
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

  // Sort by date
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
  // 清理多余数据
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

  const latestPosts = Object.create(allPosts).sort((a, b) => {
    const dateA = new Date(a?.lastEditedDate || a?.publishDate)
    const dateB = new Date(b?.lastEditedDate || b?.publishDate)
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
  const defaultTitle = NOTION_CONFIG?.TITLE || 'NotionNext BLOG'
  const defaultDescription =
    NOTION_CONFIG?.DESCRIPTION || 'NotionNext によって生成されたサイトです'
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
 * 将指定时区的日期字符串转换为 UTC 时间
 * @param {string} dateStr - 日期字符串，格式为 YYYY-MM-DD HH:mm:ss
 * @param {string} timeZone - 时区名称（如 "Asia/Shanghai"）
 * @returns {Date} - 转换后的 Date 对象（UTC 时间）
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

  // 将日期字符串转换为本地时间的 Date 对象
  const localDate = new Date(`${dateStr.replace(' ', 'T')}Z`)
  if (isNaN(localDate.getTime())) {
    throw new Error(`Invalid date string: ${dateStr}`)
  }

  // 计算 UTC 时间的时间戳
  const utcTimestamp = localDate.getTime() - offsetHours * 60 * 60 * 1000
  return new Date(utcTimestamp)
}

// 辅助函数：生成指定日期时间的时间戳（基于目标时区）
function getTimestamp(date, time = '00:00', time_zone) {
  if (!date) return null
  return convertToUTC(`${date} ${time}:00`, time_zone).getTime()
}

/**
 * 获取导航用的精减文章列表
 * gitbook主题用到，只保留文章的标题分类标签分类信息，精减掉摘要密码日期等数据
 * 导航页面的条件，必须是Posts
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