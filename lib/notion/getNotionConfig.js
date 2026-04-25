/**
 * Notionからサイト設定を読み込みます。
 * Notionテンプレート内でタイプが CONFIG のページを作成し、データベーステーブルを追加することで設定を入力できます。
 * Notionデータベースの設定は優先度が最も高く、Vercelの環境変数や blog.config.js の設定を上書きします。
 * --注意--
 * データベースはテンプレートからコピーしてください： https://www.notion.so/tanghh/287869a92e3d4d598cf366bd6994755e
 *
 */
import { getDateValue, getTextContent } from 'notion-utils'
import { deepClone } from '../utils'
import getAllPageIds from './getAllPageIds'
import { getPage } from './getPostBlocks'
import { encryptEmail } from '@/lib/plugins/mailEncrypt'

/**
 * NotionからConfig設定テーブルを読み込む
 * @param {*} allPages
 * @returns
 */
export async function getConfigMapFromConfigPage(allPages) {
  // デフォルトで設定オブジェクトを返す
  const notionConfig = {}

  if (!allPages || !Array.isArray(allPages) || allPages.length === 0) {
    console.warn('[Notion設定] 無視された設定')
    return null
  }
  // Configクラスを探す
  const configPage = allPages?.find(post => {
    return (
      post &&
      post?.type &&
      (post?.type === 'CONFIG' ||
        post?.type === 'config' ||
        post?.type === 'Config')
    )
  })

  if (!configPage) {
    // console.warn('[Notion配置] 未找到配置页面')
    return null
  }
  const configPageId = configPage.id
  //   console.log('[Notion配置]请求配置数据 ', configPage.id)
  let pageRecordMap = await getPage(configPageId, 'config-table')
  //   console.log('配置中心Page', configPageId, pageRecordMap)
  let content = pageRecordMap.block[configPageId]?.value?.content
  for (const table of ['Config-Table', 'CONFIG-TABLE']) {
    if (content) break
    pageRecordMap = await getPage(configPageId, table)
    content = pageRecordMap.block[configPageId]?.value?.content
  }

  if (!content) {
    // console.warn(
    //   '[Notion設定] 設定テーブルが見つかりません',
    //   pageRecordMap.block[configPageId],
    //   pageRecordMap.block[configPageId].value
    // )
    return null
  }

  // PAGEファイル内のdatabaseを探す
  const configTableId = content?.find(contentId => {
    return pageRecordMap.block[contentId].value.type === 'collection_view'
  })

  // eslint-disable-next-line no-constant-condition, no-self-compare
  if (!configTableId) {
    // console.warn(
    //   '[Notion配置]未找到配置表格数据',
    //   pageRecordMap.block[configPageId],
    //   pageRecordMap.block[configPageId].value
    // )
    return null
  }

  // 页面查找
  const databaseRecordMap = pageRecordMap.block[configTableId]
  const block = pageRecordMap.block || {}
  const rawMetadata = databaseRecordMap.value
  // Type Page-Database または Inline-Database かチェック
  if (
    rawMetadata?.type !== 'collection_view_page' &&
    rawMetadata?.type !== 'collection_view'
  ) {
    console.error(`pageId "${configTableId}" is not a database`)
    return null
  }
  //   console.log('表格', databaseRecordMap, block, rawMetadata)
  const collectionId = rawMetadata?.collection_id
  const collection = pageRecordMap.collection[collectionId].value
  const collectionQuery = pageRecordMap.collection_query
  const collectionView = pageRecordMap.collection_view
  const schema = collection?.schema
  const viewIds = rawMetadata?.view_ids
  const pageIds = getAllPageIds(
    collectionQuery,
    collectionId,
    collectionView,
    viewIds
  )
  if (pageIds?.length === 0) {
    console.error(
      '[Notion設定] 取得した記事リストが空です。Notionテンプレートを確認してください',
      collectionQuery,
      collection,
      collectionView,
      viewIds,
      databaseRecordMap
    )
  }
  // ユーザーのテーブルをループ処理
  for (let i = 0; i < pageIds.length; i++) {
    const id = pageIds[i]
    const value = block[id]?.value
    if (!value) {
      continue
    }
    const rawProperties = Object.entries(block?.[id]?.value?.properties || [])
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
          default:
            break
        }
      }
    }

    if (properties) {
      // テーブルのフィールドを英語にマッピング
      const config = {
        enable: (properties['有効'] || properties['启用'] || properties.Enable) === 'Yes',
        key: properties['設定名'] || properties['配置名'] || properties.Name,
        value: properties['設定値'] || properties['配置值'] || properties.Value
      }

      // 有効な設定のみ読み込む
      if (config.enable) {
        // console.log('[Notion配置]', config.key, config.value)
        if (config.key === 'CONTACT_EMAIL') {
          notionConfig[config.key] =
            (config.value && encryptEmail(config.value)) || null
        } else {
          notionConfig[config.key] =
            parseTextToJson(config.value) || config.value || null
          // 配置不能是undefined，至少是null
        }
      }
    }
  }

  let combine = notionConfig
  try {
    // 将INLINE_CONFIG合并，@see https://docs.tangly1024.com/article/notion-next-inline-config
    combine = Object.assign(
      {},
      deepClone(notionConfig),
      notionConfig?.INLINE_CONFIG
    )
  } catch (err) {
    console.warn('INLINE_CONFIG の解析中にエラーが発生しました。JSON形式を確認してください', err)
  }
  return combine
}

/**
 * INLINE_CONFIG を解析
 * @param {*} configString
 * @returns
 */
export function parseConfig(configString) {
  if (!configString) {
    return {}
  }
  // 解析对象
  try {
    // eslint-disable-next-line no-eval
    const config = eval('(' + configString + ')')
    return config
  } catch (evalError) {
    console.warn(
      'eval(INLINE_CONFIG) の解析中にエラーが発生しました。JSON形式を確認してください',
      evalError
    )
    return {}
  }
}

/**
 * テキストをJSONとして解析
 * @param text
 * @returns {any|null}
 */
export function parseTextToJson(text) {
  try {
    return JSON.parse(text)
  } catch (error) {
    return null
  }
}
