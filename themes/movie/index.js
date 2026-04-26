import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { isBrowser } from '@/lib/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import CONFIG from './config'
import LayoutSearch from './LayoutSearch'
import LayoutSlug from './LayoutSlug'
import LayoutTag from './LayoutTag'
import Layout404 from './Layout404'

/**
 * Movie テーマ
 * 動画や映画の紹介に最適なテーマです。
 */
const Movie = props => {
  const { post } = props
  const { onLoading, setOnLoading } = useGlobal()
  const router = useRouter()

  useEffect(() => {
    const handleStart = url => {
      if (url !== router.asPath) {
        setOnLoading(true)
      }
    }
    const handleComplete = url => {
      setOnLoading(false)
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router, setOnLoading])

  // 複数のビデオを一つのアルバムにまとめる機能をJSで実装
  useEffect(() => {
    if (isBrowser && post && siteConfig('MOVIE_VIDEO_COMBINE', true, CONFIG)) {
      combineVideos()
    }
  }, [post])

  /**
   * 記事内のビデオを一つにまとめる
   */
  const combineVideos = () => {
    // ID が notion-article の要素を探す
    const notionArticle = document.getElementById('notion-article')
    if (!notionArticle) return

    // すべての .notion-asset-wrapper 要素を探す
    const assetWrappers = notionArticle.querySelectorAll('.notion-asset-wrapper')
    if (!assetWrappers || assetWrappers.length === 0) return

    const videoWrappers = []
    const figcaptions = []

    // ビデオを含むラッパーを抽出
    assetWrappers.forEach(wrapper => {
      const video = wrapper.querySelector('video')
      const iframe = wrapper.querySelector('iframe')
      if (video || iframe) {
        videoWrappers.push(wrapper)
        const figcaption = wrapper.querySelector('figcaption')
        figcaptions.push(figcaption ? figcaption.innerText : 'ビデオ')
      }
    })

    if (videoWrappers.length <= 1) return

    // カルーセルコンテナの作成
    const carouselContainer = document.createElement('div')
    carouselContainer.className = 'video-carousel-container w-full mb-8'

    const videoDisplay = document.createElement('div')
    videoDisplay.className = 'video-display w-full aspect-video relative overflow-hidden rounded-xl bg-black shadow-2xl'

    const navButtons = document.createElement('div')
    navButtons.className = 'video-nav-buttons flex flex-wrap gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar'

    videoWrappers.forEach((wrapper, index) => {
      const clone = wrapper.cloneNode(true)
      clone.className = `video-item w-full h-full absolute top-0 left-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}`
      
      // figcaption を削除（クローン側）
      const fig = clone.querySelector('figcaption')
      if (fig) fig.remove()
      
      videoDisplay.appendChild(clone)

      // ナビゲーションボタンの作成
      const btn = document.createElement('button')
      btn.className = `px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${index === 0 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-2 hover:bg-gray-200'}`
      btn.innerText = figcaptions[index]
      btn.onclick = () => {
        // すべてのビデオを非表示に
        videoDisplay.querySelectorAll('.video-item').forEach((item, i) => {
          if (i === index) {
            item.classList.replace('opacity-0', 'opacity-100')
            item.classList.replace('z-0', 'z-10')
          } else {
            item.classList.replace('opacity-100', 'opacity-0')
            item.classList.replace('z-10', 'z-0')
          }
        })
        // ボタンのアクティブ状態の更新
        navButtons.querySelectorAll('button').forEach((b, i) => {
          if (i === index) {
            b.className = 'px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all bg-primary text-white shadow-lg'
          } else {
            b.className = 'px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all bg-gray-100 dark:bg-dark-2 hover:bg-gray-200'
          }
        })
      }
      navButtons.appendChild(btn)

      // 元のラッパーを削除
      wrapper.remove()
    })

    carouselContainer.appendChild(videoDisplay)
    carouselContainer.appendChild(navButtons)

    // 記事の先頭に挿入
    notionArticle.insertBefore(carouselContainer, notionArticle.firstChild)
  }

  return (
    <LayoutBase {...props}>
      {props.layout === 'archive' && <LayoutArchive {...props} />}
      {props.layout === 'category' && <LayoutCategory {...props} />}
      {props.layout === 'index' && <LayoutIndex {...props} />}
      {props.layout === 'post-list' && <LayoutPostList {...props} />}
      {props.layout === 'search' && <LayoutSearch {...props} />}
      {props.layout === 'slug' && <LayoutSlug {...props} />}
      {props.layout === 'tag' && <LayoutTag {...props} />}
      {props.layout === '404' && <Layout404 {...props} />}
    </LayoutBase>
  )
}

export default Movie
