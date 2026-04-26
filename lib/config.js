'use client'

import BLOG from '@/blog.config'
import { useGlobal } from './global'
import { deepClone, isUrlLikePath } from './utils'

/**
 * 設定の読み込み順序
 * 1. NotionConfigテーブルを優先
 * 2. 次に環境変数
 * 3. その次に blog.config.js または各テーマの CONFIG ファイル
 * @param {*} key ; パラメータ名
 * @param {*} defaultVal ; パラメータが存在しない場合のデフォルト値
 * @param {*} extendConfig ; 予備の設定オブジェクト {key:val}。Notionで見つからない場合に優先して検索
 * @returns
 */
export const siteConfig = (key, defaultVal = null, extendConfig = {}) => {
  if (!key) {
    return null
  }
  const getValue = (value, fallback) => (hasVal(value) ? value : fallback)
  const hasVal = value => value !== undefined && value !== null

  // 特殊な設定処理：以下の設定はサーバーサイドでのみ有効。Global の NOTION_CONFIG はフロントエンドコンポーネント用であるため、extendConfig から読み込む必要がある
  switch (key) {
    case 'NEXT_REVALIDATE_SECOND':
    case 'POST_RECOMMEND_COUNT':
    case 'IMAGE_COMPRESS_WIDTH':
    case 'PSEUDO_STATIC':
    case 'POSTS_SORT_BY':
    case 'POSTS_PER_PAGE':
    case 'POST_PREVIEW_LINES':
    case 'POST_URL_PREFIX':
    case 'POST_LIST_STYLE':
    case 'POST_LIST_PREVIEW':
    case 'POST_URL_PREFIX_MAPPING_CATEGORY':
    case 'POST_SCHEDULE_PUBLISH':
    case 'IS_TAG_COLOR_DISTINGUISHED':
    case 'TAG_SORT_BY_COUNT':
    case 'THEME':
    case 'LINK':
    case 'AI_SUMMARY_API':
    case 'AI_SUMMARY_KEY':
    case 'AI_SUMMARY_CACHE_TIME':
    case 'AI_SUMMARY_WORD_LIMIT':
    case 'UUID_REDIRECT':
      // LINK は特殊
      if (key === 'LINK') {
        if (!extendConfig || Object.keys(extendConfig).length === 0) {
          break
        }
      }
      return convertVal(
        getValue(extendConfig[key], getValue(defaultVal, BLOG[key]))
      )
    default:
  }

  let global = {}
  try {
    // const isClient = typeof window !== 'undefined'
    // eslint-disable-next-line react-hooks/rules-of-hooks
    global = useGlobal()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    // global = useGlobal()
  } catch (error) {
    // ローカルデバッグ用
    // console.warn('SiteConfig警告', key, error)
  }

  // 設定は NOTION 内のテーブル設定を最優先で読み込む
  let val = null
  let siteInfo = null

  if (global) {
    siteInfo = global.siteInfo
    val = global.NOTION_CONFIG?.[key] || global.THEME_CONFIG?.[key]
  }

  if (!val) {
    // 一部のキーに対して互換性処理を行う
    switch (key) {
      case 'HOME_BANNER_IMAGE':
        val = siteInfo?.pageCover // カバー画像は Notion のページカバーを使用
        break
      case 'AVATAR':
        val = siteInfo?.icon // アイコンは Notion のアイコンを使用
        break
      case 'TITLE':
        val = siteInfo?.title // タイトルは Notion のタイトルを使用
        break
      case 'DESCRIPTION':
        val = siteInfo?.description // 説明文は Notion のタイトルを使用（※原文ママ）
        break
    }
  }

  // 次に extendConfig が渡されている場合は読み込みを試行
  if (!hasVal(val) && extendConfig) {
    val = extendConfig[key]
  }

  // Notion で設定が見つからない場合は blog.config.js ファイルを読み込む
  if (!hasVal(val)) {
    val = BLOG[key]
  }

  if (!hasVal(val)) {
    return defaultVal
  }

  return convertVal(val)
}

export const cleanJsonString = val => {
  // 正規表現を使用して不要なスペース、改行、タブを削除
  return val.replace(/\s+/g, ' ').trim()
}

/**
 * 環境変数や NotionConfig から読み込まれた設定はすべて string 型です
 * ここでは、設定の文字列値が数値、ブール値、配列 []、オブジェクト {} であるかを識別し、
 * それらに該当する場合は対応する型に変換します
 * JSON と eval（※実際は JSON.parse）の2つの機能を使用
 * @param {*} val
 * @returns
 */
export const convertVal = val => {
  // パラメータ自体がすでにオブジェクト、配列、ブール値である場合は処理不要
  if (typeof val !== 'string' || !val) {
    return val
  }

  // 数値であるか確認し、オーバーフローを防止
  if (/^\d+$/.test(val)) {
    const parsedNum = Number(val)
    // 値が JavaScript の最大安全整数を超える場合は文字列として返す
    if (parsedNum > Number.MAX_SAFE_INTEGER) {
      return val + ''
    }
    return parsedNum
  }

  // ブール値であるか確認
  if (val === 'true' || val === 'false') {
    return JSON.parse(val)
  }

  // URL であるか確認
  if (isUrlLikePath(val)) {
    return val
  }

  // 設定値の前に余分なスペースがある可能性があるためトリム
  // 文字列が '[' または '{' で始まらない場合はそのまま返す
  if (!val.trim().startsWith('{') && !val.trim().startsWith('[')) {
    return val
  }

  // [] や {} のような文字列をオブジェクトに変換
  try {
    val = cleanJsonString(val)
    const parsedJson = JSON.parse(val)
    // 解析結果が null でないか確認
    if (parsedJson !== null) {
      return parsedJson
    }
  } catch (error) {
    // 解析失敗時は元の文字列を返す
    return val
  }

  return val
}

/**
 * すべての設定を読み込む
 * 1. NotionConfigテーブルを優先
 * 2. 次に環境変数
 * 3. その次に blog.config.js ファイル
 * @param {*} key
 * @returns
 */
export const siteConfigMap = () => {
  const val = deepClone(BLOG)
  for (const key in val) {
    val[key] = siteConfig(key)
    // console.log('site', key, val[key], siteConfig(key))
  }
  return val
}
