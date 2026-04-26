'use client'

import AlgoliaSearchModal from '@/components/AlgoliaSearchModal'
import Comment from '@/components/Comment'
import replaceSearchResult from '@/components/Mark'
import NotionPage from '@/components/NotionPage'
import ShareBar from '@/components/ShareBar'
import { siteConfig } from '@/lib/config'
import { useGlobal } from '@/lib/global'
import { loadWowJS } from '@/lib/plugins/wow'
import { isBrowser } from '@/lib/utils'
import { Transition } from '@headlessui/react'
import { useRouter } from 'next/router'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import ArchiveDateList from './components/ArchiveDateList'
import { ArticleInfo } from './components/ArticleInfo'
import { ArticleLock } from './components/ArticleLock'
import BlogListGroupByDate from './components/BlogListGroupByDate'
import { BlogListPage } from './components/BlogListPage'
import { BlogListScroll } from './components/BlogListScroll'
import BlogRecommend from './components/BlogRecommend'
import CategoryGroup from './components/CategoryGroup'
import CategoryItem from './components/CategoryItem'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { HomeBackgroundImage } from './components/HomeBackgroundImage'
import JumpToTopButton from './components/JumpToTopButton'
import LatestPostsGroup from './components/LatestPostsGroup'
import SlotBar from './components/SlotBar'
import TagGroups from './components/TagGroups'
import TagItem from './components/TagItem'
import CONFIG from './config'
import { Style } from './style'

// テーマのグローバル状態
const ThemeGlobalMovie = createContext()
export const useMovieGlobal = () => useContext(ThemeGlobalMovie)

/**
 * 基本レイアウトフレームワーク
 * 1. 他のページはすべて LayoutBase 内に埋め込まれます
 * 2. 左右レイアウトを採用し、モバイル端では上部ナビゲーションバーを使用します
 * @returns {JSX.Element}
 * @constructor
 */
const LayoutBase = props => {
  const { children, slotTop } = props
  const { onLoading, fullWidth } = useGlobal()
  const collapseRef = useRef(null)
  const router = useRouter()
  const searchModal = useRef(null)
  const [expandMenu, updateExpandMenu] = useState(false)
  useEffect(() => {
    loadWowJS()
  }, [])

  // ホームページの背景画像
  const headerSlot =
    router.route === '/' &&
    siteConfig('MOVIE_HOME_BACKGROUND', null, CONFIG) ? (
      <HomeBackgroundImage />
    ) : null

  return (
    <ThemeGlobalMovie.Provider
      value={{ searchModal, expandMenu, updateExpandMenu, collapseRef }}>
      <div
        id='theme-movie'
        className={`${siteConfig('FONT_STYLE')} dark:text-gray-300 duration-300 transition-all bg-white dark:bg-[#2A2A2A] scroll-smooth min-h-screen flex flex-col justify-between`}>
        <Style />

        {/* ヘッダー */}
        <Header {...props} />
        {headerSlot}

        {/* メインコンテンツ */}
        <div id='container-inner' className='w-full relative flex-grow z-10'>
          <div
            id='container-wrapper'
            className={
              (JSON.parse(siteConfig('LAYOUT_SIDEBAR_REVERSE'))
                ? 'flex-row-reverse'
                : '') + 'relative mx-auto justify-center md:flex items-start'
            }>
            {/* 内容 */}
            <div className={`w-full ${fullWidth ? '' : ''} px-6`}>
              <Transition
                show={!onLoading}
                appear={true}
                enter='transition ease-in-out duration-700 transform order-first'
                enterFrom='opacity-0 translate-y-16'
                enterTo='opacity-100'
                leave='transition ease-in-out duration-300 transform'
                leaveFrom='opacity-100 translate-y-0'
                leaveTo='opacity-0 -translate-y-16'
                unmount={false}>
                {/* 埋め込みスロット */}
                {slotTop}
                {children}
              </Transition>
            </div>
          </div>
        </div>

        {/* フッター */}
        <Footer {...props} />

        {/* 検索モーダル */}
        <AlgoliaSearchModal cRef={searchModal} {...props} />

        {/* トップへ戻るボタン */}
        <div className='fixed right-4 bottom-4 z-10'>
          <JumpToTopButton />
        </div>
      </div>
    </ThemeGlobalMovie.Provider>
  )
}

/**
 * ホームページ
 * @param {*} props
 * @returns このテーマのホームページはリスト形式です
 */
const LayoutIndex = props => {
  return <LayoutPostList {...props} />
}

/**
 * 記事リスト
 * @param {*} props
 * @returns
 */
const LayoutPostList = props => {
  return (
    <div className='max-w-[90rem] mx-auto'>
      <SlotBar {...props} />
      {siteConfig('POST_LIST_STYLE') === 'page' ? (
        <BlogListPage {...props} />
      ) : (
        <BlogListScroll {...props} />
      )}
    </div>
  )
}

/**
 * 記事詳細ページ
 * @param {*} props
 * @returns
 */
const LayoutSlug = props => {
  const { post, lock, validPassword } = props
  const router = useRouter()
  const waiting404 = siteConfig('POST_WAITING_TIME_FOR_404') * 1000
  useEffect(() => {
    // ページ内の複数のビデオを一つのアルバムにまとめる機能をJSで実装
    function combineVideo() {
      // ID が notion-article の要素を探す
      const notionArticle = document.querySelector('#article-wrapper #notion-article')
      if (!notionArticle) return // 見つからない場合は終了

      // すべての .notion-asset-wrapper 要素を探す
      const assetWrappers = document.querySelectorAll('.notion-asset-wrapper')
      if (!assetWrappers || assetWrappers.length === 0) return // 見つからない場合は終了

      // 重複作成を防止
      const exists = document.querySelectorAll('.video-wrapper')
      if (exists && exists.length > 0) return

      // ビデオセクションコンテナの作成
      const videoWrapper = document.createElement('div')
      videoWrapper.className =
        'video-wrapper py-1 px-3 bg-gray-100 dark:bg-white dark:text-black mx-auto'

      // カルーセルコンテナの作成
      const carouselWrapper = document.createElement('div')
      carouselWrapper.classList.add('notion-carousel-wrapper')

      // チャプターボタンのテキスト（figcaption）の配列
      const figCaptionValues = []

      // すべての .notion-asset-wrapper 要素をループ
      assetWrappers.forEach((wrapper, index) => {
        // figcaption 子要素があるか確認
        const figCaption = wrapper.querySelector('figcaption')

        // notion-asset-wrapper-video または notion-asset-wrapper-embed クラスがあるか確認
        if (
          !wrapper.classList.contains('notion-asset-wrapper-video') &&
          !wrapper.classList.contains('notion-asset-wrapper-embed')
        )
          return

        if (!figCaption) return // figcaption がない場合は処理しない

        // figcaption のテキストを取得して配列に追加
        const figCaptionValue = figCaption
          ? figCaption?.textContent?.trim()
          : `P-${index}`
        figCaptionValues.push(figCaptionValue)

        // 現在の .notion-asset-wrapper を包むための新しい div 要素を作成
        const carouselItem = document.createElement('div')
        carouselItem.classList.add('notion-carousel')
        carouselItem.appendChild(wrapper)

        // 外部埋め込みの場合、data-src に保存
        const iframe = wrapper.querySelector('iframe')
        if (iframe) {
          iframe?.setAttribute('data-src', iframe?.getAttribute('src'))
        }

        // 最初の要素をアクティブに設定
        if (index === 0) {
          carouselItem.classList.add('active')
        } else {
          iframe?.setAttribute('src', '')
        }

        // コンテナに追加
        carouselWrapper.appendChild(carouselItem)
      })

      // figcaption 値を保存するためのコンテナ要素を作成
      const figCaptionWrapper = document.createElement('div')
      figCaptionWrapper.className =
        'notion-carousel-route py-2 max-h-36 overflow-y-auto'

      // figCaptionValues 配列をループして、各値をコンテナに追加
      figCaptionValues.forEach(value => {
        const div = document.createElement('div')
        div.textContent = value
        div.addEventListener('click', function () {
          // すべての carouselItem 要素をループ
          document.querySelectorAll('.notion-carousel').forEach(item => {
            // 外部埋め込みは data-src から取得
            const iframe = item.querySelector('iframe')

            // 現在の要素がこの figCaption テキストを含んでいるか判断
            if (item.querySelector('figcaption').textContent.trim() === value) {
              item.classList.add('active')
              if (iframe) {
                iframe.setAttribute('src', iframe.getAttribute('data-src'))
              }
            } else {
              item.classList.remove('active')
              // 非アクティブウィンドウの再生を停止（Notion直接アップロードのみ対応）
              item.querySelectorAll('video')?.forEach(video => {
                video.pause()
              })
              // 外部埋め込みは src を空にして停止
              if (iframe) {
                iframe.setAttribute('src', '')
              }
            }
          })
        })
        figCaptionWrapper.appendChild(div)
      })

      if (carouselWrapper.children.length > 0) {
        // figcaption を含むコンテナを notion-article の先頭に挿入
        videoWrapper.appendChild(carouselWrapper)
        // 2チャプター以上ある場合、または強制表示設定の場合にボタンを表示
        if (
          figCaptionWrapper.children.length > 1 ||
          siteConfig('MOVIE_VIDEO_COMBINE_SHOW_PAGE_FORCE', false, CONFIG)
        ) {
          videoWrapper.appendChild(figCaptionWrapper)
        }
        // ページに追加
        if (
          notionArticle.firstChild &&
          notionArticle.contains(notionArticle.firstChild)
        ) {
          notionArticle.insertBefore(videoWrapper, notionArticle.firstChild)
        } else {
          notionArticle.appendChild(videoWrapper)
        }
      }
    }

    setTimeout(() => {
      combineVideo()
    }, 1500)

    // 404
    if (!post) {
      setTimeout(
        () => {
          if (isBrowser) {
            const article = document.querySelector('#article-wrapper #notion-article')
            if (!article) {
              router.push('/404').then(() => {
                console.warn('ページが見つかりません', router.asPath)
              })
            }
          }
        },
        waiting404
      )
    }
    return () => {
      // "video-wrapper" クラスを持つすべての要素を取得
      const videoWrappers = document.querySelectorAll('.video-wrapper')

      // すべての該当要素をループして削除
      videoWrappers.forEach(wrapper => {
        wrapper.parentNode.removeChild(wrapper) // DOM から要素を削除
      })
    }
  }, [post])

  return (
    <>
      {!lock ? post && (
        <div
          id='article-wrapper'
          className='px-2 max-w-5xl 2xl:max-w-[70%] mx-auto'>
          {/* 記事情報 */}
          <ArticleInfo post={post} />
          {/* Notionページ本文 */}
          <NotionPage post={post} />
          {/* 関連記事 */}
          <BlogRecommend {...props} />
          {/* シェアバー */}
          <ShareBar post={post} />
          {/* コメント欄 */}
          <Comment frontMatter={post} />
        </div>
      ) : (
        <ArticleLock validPassword={validPassword} />
      )}
    </>
  )
}

/**
 * 404ページ
 * @param {*} props
 * @returns
 */
const Layout404 = props => {
  const { locale } = useGlobal()
  const { searchModal } = useMovieGlobal()
  const router = useRouter()
  // 検索ボックスの切り替え
  const toggleShowSearchInput = () => {
    if (siteConfig('ALGOLIA_APP_ID')) {
      searchModal.current.openSearch()
    }
  }

  const onKeyUp = e => {
    if (e.keyCode === 13) {
      const search = document.getElementById('search').value
      if (search) {
        router.push({ pathname: '/search/' + search })
      }
    }
  }

  return (
    <>
      <div className='h-52'>
        <h2 className='text-4xl'>{locale.COMMON.NO_RESULTS_FOUND}</h2>
        <hr className='my-4' />
        <div className='max-w-md relative'>
          <input
            autoFocus
            id='search'
            onClick={toggleShowSearchInput}
            onKeyUp={onKeyUp}
            className='float-left w-full outline-none h-full p-2 rounded dark:bg-[#383838] bg-gray-100'
            aria-label='検索の送信'
            type='search'
            name='s'
            autoComplete='off'
            placeholder='キーワードを入力して検索...'
          />
          <i className='fas fa-search absolute right-0 my-auto p-2'></i>
        </div>
      </div>
      {/* 底部ナビゲーション */}
      <div className='h-full flex-grow grid grid-cols-4 gap-4'>
        <LatestPostsGroup {...props} />
        <CategoryGroup {...props} />
        <ArchiveDateList {...props} />
        <TagGroups {...props} />
      </div>
    </>
  )
}

/**
 * 検索ページ
 * @param {*} props
 * @returns
 */
const LayoutSearch = props => {
  const { keyword } = props
  const router = useRouter()
  useEffect(() => {
    if (isBrowser) {
      // 検索結果のハイライト
      const container = document.getElementById('posts-wrapper')
      if (keyword && container) {
        replaceSearchResult({
          doms: container,
          search: keyword,
          target: {
            element: 'span',
            className: 'text-red-500 border-b border-dashed'
          }
        })
      }
    }
  }, [router])

  return <LayoutPostList {...props} />
}

/**
 * アーカイブリスト
 * @param {*} props
 * @returns 日付順に記事をグループ化してソート
 */
const LayoutArchive = props => {
  const { archivePosts } = props
  return (
    <>
      <div className='mb-10 pb-20 md:py-12 p-3  min-h-screen w-full'>
        {Object.keys(archivePosts).map(archiveTitle => (
          <BlogListGroupByDate
            key={archiveTitle}
            archiveTitle={archiveTitle}
            archivePosts={archivePosts}
          />
        ))}
      </div>
    </>
  )
}

/**
 * カテゴリリスト
 * @param {*} props
 * @returns
 */
const LayoutCategoryIndex = props => {
  const { categoryOptions } = props
  return (
    <>
      <div id='category-list' className='duration-200 flex flex-wrap'>
        {categoryOptions?.map(category => (
          <CategoryItem key={category.name} category={category} />
        ))}
      </div>
    </>
  )
}

/**
 * タグリスト
 * @param {*} props
 * @returns
 */
const LayoutTagIndex = props => {
  const { tagOptions } = props
  return (
    <>
      <div id='tags-list' className='duration-200 flex flex-wrap'>
        {tagOptions.map(tag => (
          <TagItem key={tag.name} tag={tag} />
        ))}
      </div>
    </>
  )
}

export {
  Layout404,
  LayoutArchive,
  LayoutBase,
  LayoutCategoryIndex,
  LayoutIndex,
  LayoutPostList,
  LayoutSearch,
  LayoutSlug,
  LayoutTagIndex,
  CONFIG as THEME_CONFIG
}
