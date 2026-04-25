import { APPEARANCE, LANG, NOTION_PAGE_ID, THEME } from '@/blog.config'
import {
  THEMES,
  getThemeConfig,
  initDarkMode,
  saveDarkModeToLocalStorage
} from '@/themes/theme'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useState } from 'react'
import { generateLocaleDict, initLocale, redirectUserLang } from './lang'

/**
 * グローバルコンテキスト
 */
const GlobalContext = createContext()

export function GlobalContextProvider(props) {
  const {
    post,
    children,
    siteInfo,
    categoryOptions,
    tagOptions,
    NOTION_CONFIG
  } = props

  const [lang, updateLang] = useState(NOTION_CONFIG?.LANG || LANG) // デフォルト言語
  const [locale, updateLocale] = useState(
    generateLocaleDict(NOTION_CONFIG?.LANG || LANG)
  ) // デフォルト言語ロケール
  const [theme, setTheme] = useState(NOTION_CONFIG?.THEME || THEME) // デフォルトテーマ
  const [THEME_CONFIG, SET_THEME_CONFIG] = useState(null) // テーマ設定
  const [isLiteMode,setLiteMode] = useState(false)

  const defaultDarkMode = NOTION_CONFIG?.APPEARANCE || APPEARANCE
  const [isDarkMode, updateDarkMode] = useState(defaultDarkMode === 'dark') // デフォルトダークモード設定
  const [onLoading, setOnLoading] = useState(false) // 記事データの取得中状態
  const router = useRouter()

  // Clerk は無効化（使用しないため完全に削除）
  let clerkUser = { isLoaded: true, isSignedIn: false, user: false }
  const { isLoaded, isSignedIn, user } = clerkUser

  // 全画面表示かどうか
  const fullWidth = post?.fullWidth ?? false

  // テーマ切り替え
  function switchTheme() {
    const query = router.query
    const currentTheme = query.theme || theme
    const currentIndex = THEMES.indexOf(currentTheme)
    const newIndex = currentIndex < THEMES.length - 1 ? currentIndex + 1 : 0
    const newTheme = THEMES[newIndex]
    query.theme = newTheme
    router.push({ pathname: router.pathname, query })
    return newTheme
  }

  // テーマ設定を更新
  const updateThemeConfig = async theme => {
    const config = await getThemeConfig(theme)
    SET_THEME_CONFIG(config)
  }

  // ダークモード切り替え
  const toggleDarkMode = () => {
    const newStatus = !isDarkMode
    saveDarkModeToLocalStorage(newStatus)
    updateDarkMode(newStatus)
    const htmlElement = document.getElementsByTagName('html')[0]
    htmlElement.classList?.remove(newStatus ? 'light' : 'dark')
    htmlElement.classList?.add(newStatus ? 'dark' : 'light')
  }

  function changeLang(lang) {
    if (lang) {
      updateLang(lang)
      updateLocale(generateLocaleDict(lang))
    }
  }

  // ルート変更時の言語処理を追加
  useEffect(() => {
    initLocale(router.locale, changeLang, updateLocale)
    // 簡易モードの処理
    if (router.query.lite && router.query.lite==='true') {
      setLiteMode(true)
    }
}, [router])


  // 初回読み込み完了時
  useEffect(() => {
    initDarkMode(updateDarkMode, defaultDarkMode)
    // 多言語自動リダイレクト処理
    if (
      NOTION_CONFIG?.REDIRECT_LANG &&
      JSON.parse(NOTION_CONFIG?.REDIRECT_LANG)
    ) {
      redirectUserLang(NOTION_PAGE_ID)
    }
    setOnLoading(false)
  }, [])

  useEffect(() => {
    const handleStart = url => {
      const themeValue = router.query.theme
      const themeStr = Array.isArray(themeValue) ? themeValue[0] : themeValue

      if (themeStr && !url.includes(`theme=${themeStr}`)) {
        const newUrl = `${url}${url.includes('?') ? '&' : '?'}theme=${themeStr}`
        router.push(newUrl)
      }

      if (!onLoading) {
        setOnLoading(true)
      }
    }

    const handleStop = () => {
      if (onLoading) {
        setOnLoading(false)
      }
    }

    const currentTheme = router?.query?.theme || theme
    updateThemeConfig(currentTheme)

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeError', handleStop)
    router.events.on('routeChangeComplete', handleStop)
    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleStop)
      router.events.off('routeChangeError', handleStop)
    }
  }, [router, onLoading])

  return (
    <GlobalContext.Provider
      value={{
        isLiteMode,
        isLoaded,
        isSignedIn,
        user,
        fullWidth,
        NOTION_CONFIG,
        THEME_CONFIG,
        toggleDarkMode,
        onLoading,
        setOnLoading,
        lang,
        changeLang,
        locale,
        updateLocale,
        isDarkMode,
        updateDarkMode,
        theme,
        setTheme,
        switchTheme,
        siteInfo,
        categoryOptions,
        tagOptions
      }}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobal = () => useContext(GlobalContext)
