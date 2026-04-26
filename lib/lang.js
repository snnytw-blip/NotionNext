import BLOG from '@/blog.config'
import { getQueryVariable, isBrowser, mergeDeep } from '@/lib/utils'
import enUS from './lang/en-US'
import frFR from './lang/fr-FR'
import jaJP from './lang/ja-JP'
import trTR from './lang/tr-TR'
import zhCN from './lang/zh-CN'
import zhHK from './lang/zh-HK'
import zhTW from './lang/zh-TW'
import { extractLangPrefix } from './utils/pageId'
import { useRouter } from 'next/router'

/**
 * ここでサポートされているすべての言語を設定します
 * 国-地域
 */
const LANGS = {
  'en-US': enUS,
  'zh-CN': zhCN,
  'zh-HK': zhHK,
  'zh-TW': zhTW,
  'fr-FR': frFR,
  'tr-TR': trTR,
  'ja-JP': jaJP
}

export default LANGS

/**
 * 現在の言語辞書を取得します
 * 完全な「国-地域」が一致する場合、その言語を表示します
 * @returns 各言語に対応する辞書
 */
export function generateLocaleDict(langString) {
  const supportedLocales = Object.keys(LANGS)
  let userLocale

  // 言語文字列を言語コードと地域コードに分割します。例：「zh-CN」を「zh」と「CN」に分割。
  const [language, region] = langString?.split(/[-_]/)

  // 言語と地域の両方が一致する場合を優先します
  const specificLocale = `${language}-${region}`
  if (supportedLocales.includes(specificLocale)) {
    userLocale = LANGS[specificLocale]
  }

  // 次に言語のみが一致する場合を試みます
  if (!userLocale) {
    const languageOnlyLocales = supportedLocales.filter(locale =>
      locale.startsWith(language)
    )
    if (languageOnlyLocales.length > 0) {
      userLocale = LANGS[languageOnlyLocales[0]]
    }
  }

  // まだ一致しない場合は、最も近い言語パックを返します
  if (!userLocale) {
    const fallbackLocale = supportedLocales.find(locale =>
      locale.startsWith('en')
    )
    userLocale = LANGS[fallbackLocale]
  }

  return mergeDeep({}, LANGS['en-US'], userLocale)
}

/**
 * サイトのローカライズ初期化
 * ルーターのlocaleメカニズムを利用し、localeに応じて言語を自動的に切り替えます
 */
export function initLocale(locale, changeLang, updateLocale) {
  if (isBrowser) {
    // クエリパラメータで言語が指定されている場合はそれを優先します
    const queryLang =
      getQueryVariable('locale') || getQueryVariable('lang') || locale
    if (queryLang) {
      const match = queryLang.match(/[a-zA-Z]{2}(?:-[a-zA-Z]{2})?/)
      if (match) {
        const targetLang = match[0]
        changeLang(targetLang)
        const targetLocale = generateLocaleDict(targetLang)
        updateLocale(targetLocale)
      }
    }
  }
}

/**
 * ユーザーの言語設定を検出し、対応する多言語サイトへリダイレクトします
 * @param {*} lang
 * @param {*} pageId
 */
export const redirectUserLang = (lang, pageId) => {
  if (!isBrowser) {
    return
  }
  // トップページでのみリダイレクトを処理します
  if (!window.location.pathname === '/') {
    return
  }
  // 多言語機能が無効な場合
  if (BLOG.NOTION_PAGE_ID.indexOf(',') < 0) {
    return
  }

  const userLang =
    getQueryVariable('locale') ||
    getQueryVariable('lang') ||
    window?.navigator?.language
  const siteIds = pageId?.split(',') || []

  // デフォルトはトップページです。ユーザーのブラウザ言語に一致する多言語設定が見つかった場合、自動的にリダイレクトします。
  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const prefix = extractLangPrefix(siteId)
    if (prefix === userLang) {
      if (window.location.pathname.indexOf(prefix) < 0) {
        window.location.href = '/' + prefix
      }
    }
  }
}