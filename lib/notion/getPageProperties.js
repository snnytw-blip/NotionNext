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
 * 繝夲ｿｽE繧ｸ隕∫ｴ縺ｮ繝励Ο繝代ユ繧｣繧貞叙蠕・
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
  // 笘・DIAGNOSTIC: schema availability check
    console.log('[DEBUG GETPROP]', id,
      'propKeys:', Object.keys(value?.properties || {}),
      'schemaKeys:', Object.keys(schema || {}),
      'schemaNull:', schema == null,
      'schemaKeysCount:', Object.keys(schema || {}).length
    )
    // 笘・DEEP DIAGNOSTIC: value structure when properties are empty
    if (!value?.properties || Object.keys(value?.properties || {}).length === 0) {
      console.log('[DEBUG VALUE STRUCTURE]', id,
        'valueType:', value?.type,
        'valueKeys:', Object.keys(value || {}),
        'hasProperties:', 'properties' in (value || {}),
        'hasCollection:', 'collection_id' in (value || {}),
        'parentTable:', value?.parent_table,
        'parentId:', value?.parent_id
      )
    }
    const rawProperties = Object.entries(value?.properties || {})
  const excludeProperties = ['date', 'select', 'multi_select', 'person']
    const properties = {}
  for (let i = 0; i < rawProperties.length; i++) {
    const [key, val] = rawProperties[i]
    properties.id = id

    // 笘・FALLBACK: schema[key] undefined (collection_query empty)
    const schemaEntry = schema?.[key]

    if (schemaEntry?.type && !excludeProperties.includes(schemaEntry.type)) {
      properties[schemaEntry.name] = getTextContent(val)
    } else if (schemaEntry?.type === 'date') {
      const dateProperty = getDateValue(val)
      delete dateProperty.type
      properties[schemaEntry.name] = dateProperty
    } else if (schemaEntry?.type === 'select' || schemaEntry?.type === 'multi_select') {
      const selects = getTextContent(val)
      if (selects[0]?.length) {
        properties[schemaEntry.name] = selects.split(',')
      }
    } else if (schemaEntry?.type === 'person') {
      const rawUsers = val.flat()
      const users = []
      for (let u = 0; u < rawUsers.length; u++) {
        if (rawUsers[u][0][1]) {
          const userId = rawUsers[u][0]
          const res = await notionAPI.getUsers(userId)
          const resValue = res?.recordMapWithRoles?.notion_user?.[userId[1]]?.value
          const user = { id: resValue?.id, first_name: resValue?.given_name, last_name: resValue?.family_name, profile_photo: resValue?.profile_photo }
          users.push(user)
        }
      }
      properties[schemaEntry.name] = users
    } else if (!schemaEntry && key) {
      // 笘・KEY FALLBACK: use key directly if it matches known property names
      // [task3_category_site_filter] site 繧・knownNames 縺ｫ霑ｽ蜉
      const knownNames = ['title', 'slug', 'type', 'status', 'category', 'tags', 'date', 'summary', 'password', 'ext', 'comment', 'site']
      const notionPropNames = Object.values(BLOG.NOTION_PROPERTY_NAME).filter(Boolean)
      if (knownNames.includes(key)) {
        properties[key] = getTextContent(val)
      } else if (notionPropNames.includes(key)) {
        // key matches a NOTION_PROPERTY_NAME value 竊・use as-is
        properties[key] = getTextContent(val)
      } else {
        // try reverse mapping: find which propName matches key
        for (const [propKey, propName] of Object.entries(BLOG.NOTION_PROPERTY_NAME)) {
          if (propName === key) {
            properties[propKey] = getTextContent(val)
            break
          }
        }
      }
    }
  }

  // 繧ｭ繝ｼ繝槭ャ繝斐Φ繧ｰ・ｽE・ｽ繝ｦ繝ｼ繧ｶ繝ｼ螳夂ｾｩ縺ｮ繝倥ャ繝繝ｼ蜷・
  const fieldNames = BLOG.NOTION_PROPERTY_NAME
  if (fieldNames) {
    Object.keys(fieldNames).forEach(key => {
      if (fieldNames[key] && properties[fieldNames[key]]) {
        properties[key] = properties[fieldNames[key]]
      }
    })
  }

  // type/status/category 縺ｯ蜊倅ｸ驕ｸ謚橸ｿｽE縺溘ａ縲・・ｽE蛻暦ｿｽE譛蛻晢ｿｽE隕∫ｴ繧貞叙蠕・
  properties.type = properties.type?.[0] || ''
  properties.status = properties.status?.[0] || ''
  properties.category = properties.category?.[0] || ''
  // [task3_category_site_filter] site 繧ょ酔讒倥↓蜊倅ｸ譁・ｭ怜・縺ｨ縺励※蜿門ｾ・
  properties.site = properties.site?.[0] || ''
  properties.comment = properties.comment?.[0] || ''

  // 蛟､縺ｮ繝槭ャ繝斐Φ繧ｰ・ｽE・ｽ繝ｦ繝ｼ繧ｶ繝ｼ縺後き繧ｹ繧ｿ繝槭う繧ｺ縺励◆ type 縺ｨ status 繝輔ぅ繝ｼ繝ｫ繝会ｿｽE蛟､繧偵さ繝ｼ繝我ｸ奇ｿｽE蜀・・ｽ・ｽ隴伜挨蟄撰ｼ郁恭隱橸ｼ峨↓謌ｻ縺・
  mapProperties(properties)

  // RAW SCAN: When schema is null, raw property keys are hash IDs (not human-readable names).
  //   The schema-less fallback (knownNames.includes(key)) never matches hash IDs,
  //   so properties.date stays undefined. Scan raw values using getDateValue() to detect
  //   any date-type property from the raw Notion API response.
  if (!properties.date && value?.properties && typeof value.properties === "object") {
    console.log("[DEBUG DATE SCAN] Scanning raw properties for date values...")
    const rawEntries = Object.entries(value.properties)
    for (const [, rawVal] of rawEntries) {
      try {
        const dateVal = getDateValue(rawVal)
        if (dateVal && dateVal.start_date) {
          console.log("[DEBUG DATE SCAN] Found date property, start_date:", dateVal.start_date)
          properties.date = dateVal
          delete properties.date.type
          break
        }
      } catch (e) {
        // not a date property, continue scanning
      }
    }
    if (properties.date) {
      console.log("[DEBUG DATE SCAN] Successfully resolved date via raw value scan.")
    } else {
      console.log("[DEBUG DATE SCAN] No date property found in raw values either.")
    }
  }

// getPageProperties.js 蜀・・ｽE隧ｲ蠖鍋ｮ・・ｽ・ｽ
// [publish_date蟇ｾ蠢彎 譌･莉伜叙蠕励・繝輔か繝ｼ繝ｫ繝舌ャ繧ｯ鬆・ｺ上ｒ菫ｮ豁｣・磯撼繧ｪ繝悶ず繧ｧ繧ｯ繝医ぎ繝ｼ繝芽ｿｽ蜉・・
try {
  // 1. 譛蜆ｪ蜈・ Notion DB 縺ｮ縲梧律莉倥阪・繝ｭ繝代ユ繧｣・・roperties.date.start_date・・
  //    properties.date 縺後が繝悶ず繧ｧ繧ｯ繝医〒縺ｪ縺・ｴ蜷茨ｼ磯・蛻励↑縺ｩ・峨・繧ｬ繝ｼ繝峨ｒ霑ｽ蜉
  let rawDate = null
    if (properties?.date && typeof properties.date === 'object' && !Array.isArray(properties.date)) {
      rawDate = properties.date?.start_date
    }

    // 笘・FIX: Handle string date (from schema-less fallback path, where getTextContent returns "2024-05-02" instead of an object)
    if (!rawDate && properties?.date && typeof properties.date === 'string') {
      rawDate = properties.date
    }

    // 2. 谺｡轤ｹ: value.created_time
    if (!rawDate) {
      rawDate = value?.created_time
    }

  // 3. 譛邨ゅヵ繧ｩ繝ｼ繝ｫ繝舌ャ繧ｯ: 迴ｾ蝨ｨ譎ょ綾
  if (!rawDate) {
    rawDate = new Date().getTime()
  }

  const testDate = new Date(rawDate)
  if (isNaN(testDate.getTime())) {
    properties.publishDate = new Date().getTime()
  } else {
    properties.publishDate = testDate.getTime()
  }
} catch (e) {
  properties.publishDate = new Date().getTime()
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
  // --- 菫ｮ豁｣縺薙％縺ｾ縺ｧ ---
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
 * 譁・・ｽ・ｽ・ｽE繧・JSON 縺ｫ螟画鋤
 * @param {*} str
 * @returns
 */
function convertToJSON(str) {
  if (!str) {
    return {}
  }
  // 豁｣隕剰｡ｨ迴ｾ繧剃ｽｿ逕ｨ縺励※繧ｹ繝夲ｿｽE繧ｹ縺ｨ謾ｹ陦後ｒ蜑企勁
  try {
    return JSON.parse(str.replace(/\s/g, ''))
  } catch (error) {
    console.warn('辟｡蜉ｹ縺ｪJSON', str)
    return {}
  }
}

/**
 * 繝ｦ繝ｼ繧ｶ繝ｼ螳夂ｾｩ繝倥ャ繝繝ｼ縺ｮ繝槭ャ繝斐Φ繧ｰ
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
 * 繝夲ｿｽE繧ｸ繝・・ｽE繧ｿ縺ｮ繝輔ぅ繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ縺ｨ隱ｿ謨ｴ
 * 繝輔ぅ繝ｫ繧ｿ繝ｪ繝ｳ繧ｰ繝励Ο繧ｻ繧ｹ縺ｧ縺ｯ NOTION_CONFIG 縺ｮ險ｭ螳壹′菴ｿ逕ｨ縺輔ｌ縺ｾ縺・
 */
export function adjustPageProperties(properties, NOTION_CONFIG) {
  // URL縺ｮ蜃ｦ逅・
  // 1. 繝ｦ繝ｼ繧ｶ繝ｼ險ｭ螳夲ｿｽE URL_PREFIX 縺ｫ蝓ｺ縺･縺・・ｽ・ｽ slug 繧貞､画鋤
  // 2. 險倅ｺ九↓ href 繝輔ぅ繝ｼ繝ｫ繝峨ｒ霑ｽ蜉縺励∵怙邨ら噪縺ｪ繝代せ繧剃ｿ晏ｭ・
  if (properties.type === 'Post') {
    properties.slug = generateCustomizeSlug(properties, NOTION_CONFIG)
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Page') {
    properties.href = properties.slug ?? properties.id
  } else if (properties.type === 'Menu' || properties.type === 'SubMenu') {
    // 繝｡繝九Η繝ｼ繝代せ縺檎ｩｺ縺ｮ蝣ｴ蜷茨ｿｽE縲∝ｱ暮幕蜿ｯ閭ｽ縺ｪ繝｡繝九Η繝ｼ縺ｨ縺励※菴ｿ逕ｨ
    properties.href = properties.slug ?? '#'
    properties.name = properties.title ?? ''
  }

  // http 縺ｾ縺滂ｿｽE https 縺ｧ蟋九∪繧句ｴ蜷茨ｿｽE螟夜Κ繝ｪ繝ｳ繧ｯ縺ｨ縺励※謇ｱ縺・
  if (isHttpLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_blank'
  } else if (isMailOrTelLink(properties?.href)) {
    properties.href = properties?.slug
    properties.target = '_self'
  } else {
    properties.target = '_self'
    // 謫ｬ莨ｼ髱咏噪繝代せ縺ｮ蝣ｴ蜷茨ｿｽE譛ｫ蟆ｾ縺ｫ .html 繧剃ｻ倅ｸ・
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

    // 逶ｸ蟇ｾ繝代せ繧堤ｵｶ蟇ｾ繝代せ縺ｫ螟画鋤・ｽE・ｽ・ｽE鬆ｭ縺ｫ / 繧剃ｻ倅ｸ・
    properties.href = convertUrlStartWithOneSlash(properties?.href)
  }

  // 繝ｪ繝繧､繝ｬ繧ｯ繝医Μ繝ｳ繧ｯ縺悟､夊ｨ隱櫁ｨｭ螳夲ｿｽE蝣ｴ蜷茨ｿｽE縲∵眠縺励＞繧ｦ繧｣繝ｳ繝峨え縺ｧ髢九￥
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

  // 繝代せ繝ｯ繝ｼ繝峨ヵ繧｣繝ｼ繝ｫ繝会ｿｽE md5 蛹・
  properties.password = properties.password
    ? md5(properties.slug + properties.password)
    : ''
}

/**
 * 繧ｫ繧ｹ繧ｿ繝URL繧貞叙蠕・
 * 螟画焚縺ｫ蝓ｺ縺･縺・・ｽ・ｽURL繧堤函謌舌〒縺阪∪縺・
 * 繧ｵ繝晢ｿｽE繝医＆繧後ｋ蠖｢蠑・ %category%/%year%/%month%/%day%/%slug%
 * @param {*} postProperties
 * @returns
 */
function generateCustomizeSlug(postProperties, NOTION_CONFIG) {
  // 螟夜Κ繝ｪ繝ｳ繧ｯ縺ｯ蜃ｦ逅・・ｽ・ｽ縺ｪ縺・
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
      // 繧ｫ繝・・ｽ・ｽ繝ｪ蜷搾ｿｽE繝槭ャ繝斐Φ繧ｰ繧定ｨｱ蜿ｯ縲る壼ｸｸ縲ゞRL繧堤ｾ弱＠縺上☆繧九◆繧√↓荳ｭ蝗ｽ隱橸ｿｽE繧ｫ繝・・ｽ・ｽ繝ｪ繧定恭隱槭↓繝槭ャ繝斐Φ繧ｰ縺吶ｋ縺溘ａ縺ｫ菴ｿ逕ｨ縲・
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
    fullPrefix = fullPrefix.substring(1) // 蜈磯ｭ縺ｮ "/" 繧貞炎髯､
  }
  if (fullPrefix.endsWith('/')) {
    fullPrefix = fullPrefix.substring(0, fullPrefix.length - 1) // 譛ｫ蟆ｾ縺ｮ "/" 繧貞炎髯､
  }

  if (fullPrefix) {
    return `${fullPrefix}/${postProperties.slug ?? postProperties.id}`
  } else {
    return `${postProperties.slug ?? postProperties.id}`
  }
}
