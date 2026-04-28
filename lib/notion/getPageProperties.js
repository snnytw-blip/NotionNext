import BLOG from '@/blog.config'
import { getDateValue, getTextContent } from 'notion-utils'
import formatDate from '../utils/formatDate'
// import { createHash } from 'crypto'
import md5 from 'js-md5'
import { siteConfig } from '../config'
import { convertUrlStartWithOneSlash, getLastSegmentFromUrl, isHttpLink, isMailOrTelLink } from '../utils'
import { extractLangPrefix } from '../utils/pageId'
import { mapImgUrl } from './mapImage'
import notionAPI from '@/lib/notion/getNotionAPI'

/**
 * ペ�Eジ要素のプロパティを取征E
 * @param {*} id
 * @param {*} value
 * @param {*} schema
 * @param {*} authToken
 * @param {*} tagOptions
 * @returns
 */
export default async function getPageProperties(
  id,
  value,
  schema,
  authToken,
  tagOptions
) {
  const rawProperties = Object.entries(value?.properties || [])
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
  const properties = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id
    if (schema[key]?.type && !excludeProperties.includes(schema[key].type)) {
      properties[schema[key].name] = getTextContent(val)
    } else {
      switch (schema[key]?.type) {
        case 'date': {
          const dateProperty = getDateValue(val)
          delete dateProperty.type
          properties[schema[key].name] = dateProperty
          break
        }
        case 'select':
        case 'multi_select': {
          const selects = getTextContent(val)
          if (selects[0]?.length) {
            properties[schema[key].name] = selects.split(',')
          }
          break
        }
        case 'person': {
          const rawUsers = val.flat()
          const users = []

          for (let i = 0; i < rawUsers.length; i++) {
            if (rawUsers[i][0][1]) {
              const userId = rawUsers[i][0]
              const res = await notionAPI.getUsers(userId)
              const resValue =
                res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
              const user = {
                id: resValue?.id,
                first_name: resValue?.given_name,
                last_name: resValue?.family_name,
                profile_photo: resValue?.profile_photo
              }
              users.push(user)
            }
          }
          properties[schema[key].name] = users
          break
        }
        default:
          break
      }
    }
  }

  // キーマッピング�E�ユーザー定義のヘッダー吁E
  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]]) {
        properties[key] = properties[fieldNames[key]]
      }
    })
  }

  // type/status/category は単一選択�Eため、E�E列�E最初�E要素を取征E
  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.category = properties.category?.[0] || ''
  properties.comment = properties.comment?.[0] || ''

  // 値のマッピング�E�ユーザーがカスタマイズした type と status フィールド�E値をコード上�E冁E��識別子（英語）に戻ぁE
  mapProperties(properties)

// getPageProperties.js 冁E�E該当箁E��
try {
  // 1. プロパティからの取得を試みめE
  let rawDate = properties?.date?.start_date || value?.created_time;
  
  // 2. それでも空なら現在時刻をフォールバック
  if (!rawDate) {
    rawDate = new Date().getTime();
  }

  const testDate = new Date(rawDate);
  if (isNaN(testDate.getTime())) {
    properties.publishDate = new Date().getTime();
  } else {
    properties.publishDate = testDate.getTime();
  }
} catch (e) {
  properties.publishDate = new Date().getTime();
}

  properties.publishDay = formatDate(properties.publishDate, BLOG.LANG)

  try {
    const editedTime = value?.last_edited_time || new Date().getTime()
    properties.lastEditedDate = new Date(editedTime)
    properties.lastEditedDay = formatDate(properties.lastEditedDate, BLOG.LANG)
  } catch (e) {
    properties.lastEditedDate = new Date()
    properties.lastEditedDay = formatDate(new Date(), BLOG.LANG)
  }
  // --- 修正ここまで ---
  properties.fullWidth = value?.format?.page_full_width ?? false
  properties.pageIcon = mapImgUrl(value?.format?.page_icon, value) ?? ''
  properties.pageCover = mapImgUrl(value?.format?.page_cover, value) ?? ''
  properties.pageCoverThumbnail =
    mapImgUrl(value?.format?.page_cover, value, 'block') ?? ''
  properties.ext = convertToJSON(properties?.ext)
  properties.content = value.content ?? []
  properties.tagItems =
    properties?.tags?.map(tag => {
      return {
        name: tag,
        color: tagOptions?.find(t => t.value === tag)?.color || 'gray'
      }
    }) || []
  delete properties.content
  return properties
}

/**
 * 斁E���EめEJSON に変換
 * @param {*} str
 * @returns
 */
function convertToJSON(str) {
  if (!str) {
    return {}
  }
  // 正規表現を使用してスペ�Eスと改行を削除
  try {
    return JSON.parse(str.replace(/\s/g, ''))
  } catch (error) {
    console.warn('無効なJSON', str)
    return {}
  }
}

/**
 * ユーザー定義ヘッダーのマッピング
 */
function mapProperties(properties) {
  const typeMap = {
    [BLOG.NOTION_PROPERTY_NAME.type_post]: 'Post',
    [BLOG.NOTION_PROPERTY_NAME.type_page]: 'Page',
    [BLOG.NOTION_PROPERTY_NAME.type_notice]: 'Notice',
    [BLOG.NOTION_PROPERTY_NAME.type_menu]: 'Menu',
    [BLOG.NOTION_PROPERTY_NAME.type_sub_menu]: 'SubMenu'
  }

  const statusMap = {
    [BLOG.NOTION_PROPERTY_NAME.status_publish]: 'Published',
    [BLOG.NOTION_PROPERTY_NAME.status_invisible]: 'Invisible'
  }

  if (properties?.type && typeMap[properties.type]) {
    properties.type = typeMap[properties.type]
  }

  if (properties?.status && statusMap[properties.status]) {
    properties.status = statusMap[properties.status]
  }
}

/**
 * ペ�EジチE�Eタのフィルタリングと調整
 * フィルタリングプロセスでは NOTION_CONFIG の設定が使用されまぁE
 */
export function adjustPageProperties(properties, NOTION_CONFIG) {
  // URLの処琁E
  // 1. ユーザー設定�E URL_PREFIX に基づぁE�� slug を変換
  // 2. 記事に href フィールドを追加し、最終的なパスを保孁E
  if (properties.type === 'Post') {
    properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Page') {
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Menu' || properties.type === 'SubMenu') {
    // メニューパスが空の場合�E、展開可能なメニューとして使用
    properties.href = properties.slug ?? '#'
    properties.name = properties.title ?? ''
  }

  // http また�E https で始まる場合�E外部リンクとして扱ぁE
  if (isHttpLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_blank'
  } else if (isMailOrTelLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_self'
  } else {
    properties.target = '_self'
    // 擬似静的パスの場合�E末尾に .html を付丁E
    if (siteConfig('PSEUDO_STATIC', false, NOTION_CONFIG)) {
      if (
        !properties?.href?.endsWith('.html') &&
        properties?.href !== '' &&
        properties?.href !== '#' &&
        properties?.href !== '/'
      ) {
        properties.href += '.html'
      }
    }

    // 相対パスを絶対パスに変換�E��E頭に / を付丁E
    properties.href = convertUrlStartWithOneSlash(properties?.href)
  }

  // リダイレクトリンクが多言語設定�E場合�E、新しいウィンドウで開く
  if (BLOG.NOTION_PAGE_ID.indexOf(',') > 0) {
    const siteIds = BLOG.NOTION_PAGE_ID.split(',')
    for (let index = 0; index < siteIds.length; index++) {
      const siteId = siteIds[index]
      const prefix = extractLangPrefix(siteId)
      if (getLastSegmentFromUrl(properties.href) === prefix) {
        properties.target = '_blank'
      }
    }
  }

  // パスワードフィールド�E md5 匁E
  properties.password = properties.password
    ? md5(properties.slug + properties.password)
    : ''
}

/**
 * カスタムURLを取征E
 * 変数に基づぁE��URLを生成できまぁE
 * サポ�Eトされる形弁E %category%/%year%/%month%/%day%/%slug%
 * @param {*} postProperties
 * @returns
 */
function generateCustomizeSlug(postProperties, NOTION_CONFIG) {
  // 外部リンクは処琁E��なぁE
  if (isHttpLink(postProperties.slug)) {
    return postProperties.slug
  }
  let fullPrefix = ''
  let allSlugPatterns = NOTION_CONFIG?.POST_URL_PREFIX
  if (allSlugPatterns === undefined || allSlugPatterns === null) {
    allSlugPatterns = siteConfig(
      'POST_URL_PREFIX',
      BLOG.POST_URL_PREFIX,
      NOTION_CONFIG
    ).split('/')
  } else {
    allSlugPatterns = allSlugPatterns.split('/')
  }

  const POST_URL_PREFIX_MAPPING_CATEGORY = siteConfig(
    'POST_URL_PREFIX_MAPPING_CATEGORY',
    {},
    NOTION_CONFIG
  )

  allSlugPatterns.forEach((pattern, idx) => {
    if (pattern === '%year%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefix += formatPostCreatedDate.getUTCFullYear()
    } else if (pattern === '%month%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefix += String(formatPostCreatedDate.getUTCMonth() + 1).padStart(
        2,
        0
      )
    } else if (pattern === '%day%' && postProperties?.publishDay) {
      const formatPostCreatedDate = new Date(postProperties?.publishDay)
      fullPrefix += String(formatPostCreatedDate.getUTCDate()).padStart(2, 0)
    } else if (pattern === '%slug%') {
      fullPrefix += postProperties.slug ?? postProperties.id
    } else if (pattern === '%category%' && postProperties?.category) {
      let categoryPrefix = postProperties.category
      // カチE��リ名�Eマッピングを許可。通常、URLを美しくするために中国語�EカチE��リを英語にマッピングするために使用、E
      if (POST_URL_PREFIX_MAPPING_CATEGORY[postProperties?.category]) {
        categoryPrefix =
          POST_URL_PREFIX_MAPPING_CATEGORY[postProperties?.category]
      }
      fullPrefix += categoryPrefix
    } else if (!pattern.includes('%')) {
      fullPrefix += pattern
    } else {
      return
    }
    if (idx !== allSlugPatterns.length - 1) {
      fullPrefix += '/'
    }
  })
  if (fullPrefix.startsWith('/')) {
    fullPrefix = fullPrefix.substring(1) // 先頭の "/" を削除
  }
  if (fullPrefix.endsWith('/')) {
    fullPrefix = fullPrefix.substring(0, fullPrefix.length - 1) // 末尾の "/" を削除
  }

  if (fullPrefix) {
    return `${fullPrefix}/${postProperties.slug ?? postProperties.id}`
  } else {
    return `${postProperties.slug ?? postProperties.id}`
  }
}
