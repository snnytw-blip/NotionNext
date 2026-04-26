import { useEffect, useState } from 'react'
import { siteConfig } from '@/lib/config'

/**
 * アクセシビリティ強化コンポーネント
 * キーボードナビゲーション、スクリーンリーダー対応、高コントラストモードなどの機能を提供
 */
const Accessibility = () => {
  const [isHighContrast, setIsHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState('normal')
  const [isReducedMotion, setIsReducedMotion] = useState(false)

  useEffect(() => {
    // ユーザー設定の確認
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches

    setIsReducedMotion(prefersReducedMotion)
    setIsHighContrast(prefersHighContrast)

    // localStorageから設定を復元
    const savedFontSize = localStorage.getItem('accessibility-font-size')
    const savedHighContrast = localStorage.getItem('accessibility-high-contrast')
    
    if (savedFontSize) setFontSize(savedFontSize)
    if (savedHighContrast === 'true') setIsHighContrast(true)

    // 設定の適用
    applyAccessibilitySettings()

    // キーボードナビゲーションのサポートを追加
    setupKeyboardNavigation()

    // スキップリンクを追加
    addSkipLinks()

    // メディアクエリの変更を監視
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    
    motionQuery.addEventListener('change', (e) => setIsReducedMotion(e.matches))
    contrastQuery.addEventListener('change', (e) => setIsHighContrast(e.matches))

    return () => {
      motionQuery.removeEventListener('change', (e) => setIsReducedMotion(e.matches))
      contrastQuery.removeEventListener('change', (e) => setIsHighContrast(e.matches))
    }
  }, [])

  useEffect(() => {
    applyAccessibilitySettings()
  }, [isHighContrast, fontSize, isReducedMotion])

  const applyAccessibilitySettings = () => {
    const root = document.documentElement

    // フォントサイズの適用
    root.classList.remove('font-small', 'font-normal', 'font-large', 'font-extra-large')
    root.classList.add(`font-${fontSize}`)

    // 高コントラストモードの適用
    if (isHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // アニメーションの削減を適用
    if (isReducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // localStorageに保存
    localStorage.setItem('accessibility-font-size', fontSize)
    localStorage.setItem('accessibility-high-contrast', isHighContrast.toString())
  }

  const setupKeyboardNavigation = () => {
    // すべてのインタラクティブ要素にフォーカスインジケーターを追加
    const style = document.createElement('style')
    style.textContent = `
      .focus-visible:focus {
        outline: 2px solid #0066cc !important;
        outline-offset: 2px !important;
      }
      
      .skip-link {
        position: absolute;
        top: -40px;
        left: 6px;
        background: #000;
        color: #fff;
        padding: 8px;
        text-decoration: none;
        z-index: 9999;
        border-radius: 4px;
      }
      
      .skip-link:focus {
        top: 6px;
      }
      
      /* 高コントラストモードのスタイル */
      .high-contrast {
        filter: contrast(150%);
      }
      
      .high-contrast img {
        filter: contrast(120%);
      }
      
      /* フォントサイズのスタイル */
      .font-small { font-size: 14px; }
      .font-normal { font-size: 16px; }
      .font-large { font-size: 18px; }
      .font-extra-large { font-size: 20px; }
      
      /* アニメーションの削減 */
      .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      /* スクリーンリーダー専用テキスト */
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `
    document.head.appendChild(style)

    // キーボードイベントのリスナーを追加
    document.addEventListener('keydown', (e) => {
      // Alt + H: 高コントラストの切り替え
      if (e.altKey && e.key === 'h') {
        e.preventDefault()
        toggleHighContrast()
      }
      
      // Alt + +: フォントサイズを大きくする
      if (e.altKey && e.key === '=') {
        e.preventDefault()
        increaseFontSize()
      }
      
      // Alt + -: フォントサイズを小さくする
      if (e.altKey && e.key === '-') {
        e.preventDefault()
        decreaseFontSize()
      }
    })
  }

  const addSkipLinks = () => {
    // メインコンテンツへのスキップリンクを追加
    const skipLink = document.createElement('a')
    skipLink.href = '#main-content'
    skipLink.className = 'skip-link'
    skipLink.textContent = 'メインコンテンツへスキップ'
    skipLink.setAttribute('aria-label', 'メインコンテンツへスキップ')
    
    document.body.insertBefore(skipLink, document.body.firstChild)

    // メインコンテンツエリアに正しいIDがあることを確認
    const mainContent = document.querySelector('main') || document.querySelector('#__next')
    if (mainContent && !mainContent.id) {
      mainContent.id = 'main-content'
    }
  }

  const toggleHighContrast = () => {
    setIsHighContrast(!isHighContrast)
    announceToScreenReader(isHighContrast ? '高コントラストモードをオフにしました' : '高コントラストモードをオンにしました')
  }

  const increaseFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      const newSize = sizes[currentIndex + 1]
      setFontSize(newSize)
      announceToScreenReader(`フォントサイズを${newSize}に調整しました`)
    }
  }

  const decreaseFontSize = () => {
    const sizes = ['small', 'normal', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      const newSize = sizes[currentIndex - 1]
      setFontSize(newSize)
      announceToScreenReader(`フォントサイズを${newSize}に調整しました`)
    }
  }

  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // アクセシビリティ機能が無効な場合はコンポーネントをレンダリングしない
  if (!siteConfig('ACCESSIBILITY_ENABLED', true)) {
    return null
  }

  return (
    <>
      {/* アクセシビリティコントロールパネル */}
      <div 
        className="accessibility-controls fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg z-50 border"
        role="region"
        aria-label="アクセシビリティ設定"
      >
        <h3 className="text-sm font-semibold mb-2">アクセシビリティ設定</h3>
        
        <div className="space-y-2">
          <button
            onClick={toggleHighContrast}
            className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            aria-pressed={isHighContrast}
          >
            {isHighContrast ? 'オフ' : 'オン'}高コントラスト
          </button>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={decreaseFontSize}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              aria-label="フォントサイズを小さくする"
              disabled={fontSize === 'small'}
            >
              A-
            </button>
            <span className="text-xs">フォント</span>
            <button
              onClick={increaseFontSize}
              className="px-2 py-1 text-sm bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              aria-label="フォントサイズを大きくする"
              disabled={fontSize === 'extra-large'}
            >
              A+
            </button>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
          ショートカット: Alt+H (コントラスト), Alt+/- (フォント)
        </div>
      </div>

      {/* スクリーンリーダー告知エリア */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" />
    </>
  )
}

export default Accessibility
