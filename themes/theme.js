import BLOG, { LAYOUT_MAPPINGS } from '@/blog.config'
import * as ThemeComponents from '@theme-components'
import getConfig from 'next/config'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { getQueryParam, getQueryVariable, isBrowser } from '../lib/utils'

// next.config.js で全テーマをスキャン
export const { THEMES = [] } = getConfig()?.publicRuntimeConfig || {}

/**
 * テーマ設定を取得
 * @param {string} themeQuery - テーマクエリパラメータ（カンマ区切りで複数指定可能）
 * @returns {Promise<object>} テーマ設定オブジェクト
 */
export const getThemeConfig = async themeQuery => {
  // themeQuery が存在し、デフォルトテーマと異なる場合のマルチテーマ処理
  if (typeof themeQuery === 'string' && themeQuery.trim()) {
    // themeQuery から最初のテーマ名を取得（カンマ区切り）
    const themeName = themeQuery.split(',')[0].trim()

    // themeQuery が現在のデフォルトテーマと異なる場合、指定されたテーマの設定をロード
    if (themeName !== BLOG.THEME) {
      try {
        // テーマ設定を動的にインポート
        const THEME_CONFIG = await import(`@/themes/${themeName}`)
          .then(m => m.THEME_CONFIG)
          .catch(err => {
            console.error(`Failed to load theme ${themeName}:`, err)
            return null // テーマのロードに失敗した場合は null またはデフォルト値を返す
          })

        // 如果主题配置加载成功，返回配置
        if (THEME_CONFIG) {
          return THEME_CONFIG
        } else {
          // ロードに失敗した場合はデフォルトテーマの設定を返す
          console.warn(
            `Loading ${themeName} failed. Falling back to default theme.`
          )
          return ThemeComponents?.THEME_CONFIG
        }
      } catch (error) {
        // インポート中に例外が発生した場合はデフォルトテーマの設定を返す
        console.error(
          `Error loading theme configuration for ${themeName}:`,
          error
        )
        return ThemeComponents?.THEME_CONFIG
      }
    }
  }

  // themeQuery がないか、デフォルトテーマと同じ場合はデフォルト設定を返す
  return ThemeComponents?.THEME_CONFIG
}

/**
 * グローバルレイアウトをロード
 * @param {*} theme
 * @returns
 */
export const getBaseLayoutByTheme = theme => {
  const LayoutBase = ThemeComponents['LayoutBase']
  const isDefaultTheme = !theme || theme === BLOG.THEME
  if (!isDefaultTheme) {
    return dynamic(
      () => import(`@/themes/${theme}`).then(m => m['LayoutBase']),
      { ssr: true }
    )
  }

  return LayoutBase
}

/**
 * レイアウトを動的に取得
 * @param {*} props
 */
export const DynamicLayout = props => {
  const { theme, layoutName } = props
  const SelectedLayout = useLayoutByTheme({ layoutName, theme })
  return <SelectedLayout {...props} />
}

/**
 * テーマファイルをロード
 * @param {*} layoutName
 * @param {*} theme
 * @returns
 */
export const useLayoutByTheme = ({ layoutName, theme }) => {
  // const layoutName = getLayoutNameByPath(router.pathname, router.asPath)
  const LayoutComponents =
    ThemeComponents[layoutName] || ThemeComponents.LayoutSlug

  const router = useRouter()
  const themeQuery = getQueryParam(router?.asPath, 'theme') || theme
  const isDefaultTheme = !themeQuery || themeQuery === BLOG.THEME

  // 現在のデフォルト以外のテーマをロード
  if (!isDefaultTheme) {
    const loadThemeComponents = componentsSource => {
      const components =
        componentsSource[layoutName] || componentsSource.LayoutSlug
      setTimeout(fixThemeDOM, 500)
      return components
    }
    return dynamic(
      () => import(`@/themes/${themeQuery}`).then(m => loadThemeComponents(m)),
      { ssr: true }
    )
  }

  setTimeout(fixThemeDOM, 100)
  return LayoutComponents
}

/**
 * パスに基づいて対応するレイアウト名を取得
 * @param {*} path
 * @returns
 */
const getLayoutNameByPath = path => {
  const layoutName = LAYOUT_MAPPINGS[path] || 'LayoutSlug'
  //   console.log('path-layout',path,layoutName)
  return layoutName
}

/**
 * テーマ切り替え時の特殊処理
 * 不要な要素を削除
 */
const fixThemeDOM = () => {
  if (isBrowser) {
    const elements = document.querySelectorAll('[id^="theme-"]')
    if (elements?.length > 1) {
      for (let i = 0; i < elements.length - 1; i++) {
        if (
          elements[i] &&
          elements[i].parentNode &&
          elements[i].parentNode.contains(elements[i])
        ) {
          elements[i].parentNode.removeChild(elements[i])
        }
      }
      elements[0]?.scrollIntoView()
    }
  }
}

/**
 * テーマの初期化。優先順位: query > cookies > systemPrefer
 * @param isDarkMode
 * @param updateDarkMode テーマ変更の状態更新関数
 * @description Cookieに保存されたユーザーテーマを読み込む
 */
export const initDarkMode = (updateDarkMode, defaultDarkMode) => {
  // ユーザーデバイスのブラウザがダークモードを好むか確認
  let newDarkMode = isPreferDark()

  // localStorage に保存されたユーザーのダークモード設定を確認
  const userDarkMode = loadDarkModeFromLocalStorage()
  if (userDarkMode) {
    newDarkMode = userDarkMode === 'dark' || userDarkMode === 'true'
    saveDarkModeToLocalStorage(newDarkMode) // ユーザーが手動で設定した場合のみ保存
  }

  // サイトが強制的にデフォルトダークモードを設定している場合の優先処理
  if (defaultDarkMode === 'true') {
    newDarkMode = true
  }

  // URL クエリパラメータによるダークモード指定を確認
  const queryMode = getQueryVariable('mode')
  if (queryMode) {
    newDarkMode = queryMode === 'dark'
  }

  updateDarkMode(newDarkMode)
  document
    .getElementsByTagName('html')[0]
    .setAttribute('class', newDarkMode ? 'dark' : 'light')
}

/**
 * ダークモードを優先するかどうか。システムのダークモード設定および現在の時間に基づいて判断
 * @returns {*}
 */
export function isPreferDark() {
  if (BLOG.APPEARANCE === 'dark') {
    return true
  }
  if (BLOG.APPEARANCE === 'auto') {
    // システムのダークモード設定または夜間時間帯の場合、強制的にダークモードにする
    const date = new Date()
    const prefersDarkMode = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches
    return (
      prefersDarkMode ||
      (BLOG.APPEARANCE_DARK_TIME &&
        (date.getHours() >= BLOG.APPEARANCE_DARK_TIME[0] ||
          date.getHours() < BLOG.APPEARANCE_DARK_TIME[1]))
    )
  }
  return false
}

/**
 * ダークモード設定を読み込む
 * @returns {*}
 */
export const loadDarkModeFromLocalStorage = () => {
  return localStorage.getItem('darkMode')
}

/**
 * ダークモード設定を保存
 * @param newTheme
 */
export const saveDarkModeToLocalStorage = newTheme => {
  localStorage.setItem('darkMode', newTheme)
}
