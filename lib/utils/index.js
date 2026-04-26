// 外部リソースを非同期で読み込むためのメソッドのラップ
import { memo } from 'react'

/**
 * クライアントサイド（ブラウザ）かどうかを判定
 * @returns {boolean}
 */
export const isBrowser = typeof window !== 'undefined'

/**
 * 配列をシャッフルする
 * @param {*} array
 * @returns
 */
export const shuffleArray = array => {
  if (!array) {
    return []
  }
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/**
 * Google 検索エンジンロボット（クローラー）かどうかを判定
 * @returns
 */
export const isSearchEngineBot =
  typeof navigator !== 'undefined' &&
  /Googlebot|bingbot|Baidu/.test(navigator.userAgent)
/**
 * コンポーネントのメモ化（永続化）
 */
export const memorize = Component => {
  const MemoizedComponent = props => {
    return <Component {...props} />
  }
  return memo(MemoizedComponent)
}

/**
 * article/https://test.com のように誤ってプレフィックスが結合された slug を処理する
 * https://test.com に変換する
 * @param {*} str
 * @returns
 */
export function sliceUrlFromHttp(str) {
  // 文字列に http が含まれているか確認
  if (str?.includes('http:') || str?.includes('https:')) {
    // 含まれている場合、http の位置を探す
    const index = str?.indexOf('http')
    // http 以降の部分を返す
    return str.slice(index, str.length)
  } else {
    // 含まれていない場合、元の文字列を返す
    return str
  }
}

/**
 * 相対パスの URL（test）を絶対パス（/test）に変換する
 * URL が / で始まっていない場合、/ を先頭に付与する
 * また、先頭に複数の // がある場合は 1 つにまとめる
 * @param {*} str
 */
export function convertUrlStartWithOneSlash(str) {
  if (!str) {
    return '#'
  }
  // URL が / で始まっているか判定
  if (!str.startsWith('/')) {
    // 始まっていない場合、先頭に / を付与
    str = '/' + str
  }
  // 先頭の連続するスラッシュを 1 つに削除
  str = str.replace(/\/+/g, '/')
  return str
}

/**
 * 「URL 形式」のパス（内部または外部）であるかを判定
 * 内部（/about など）、外部（http://xxx.com など）
 * @param str
 * @returns {boolean}
 */
export function isUrlLikePath(str) {
  return typeof str === 'string' && (str.startsWith('/') || isHttpLink(str))
}

/**
 * http(s) で始まるリンク（外部ウェブページ）であるかを判定
 * @param str
 * @returns {boolean}
 */
export function isHttpLink(str) {
  return typeof str === 'string' && /^https?:\/\//i.test(str)
}

/**
 * メールまたは電話リンクであるかを確認
 * @param href
 * @returns {boolean}
 */
export function isMailOrTelLink(href) {
  return /^(mailto:|tel:)/i.test(href)
}

// 文字列が UUID かどうかを確認 https://ihateregex.io/expr/uuid/
export function checkStrIsUuid(str) {
  if (!str) {
    return false
  }
  // 正規表現を使用してマッチング
  const regex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/
  return regex.test(str)
}


// 文字列が Notion ID かどうかを確認：32文字、英数字のみで構成
export function checkStrIsNotionId(str) {
  if (!str) {
    return false
  }
  // 正規表現を使用してマッチング
  const regex = /^[a-zA-Z0-9]{32}$/
  return regex.test(str)
}

// URL の最後の / 以降の内容を抽出
export function getLastPartOfUrl(url) {
  if (!url) {
    return ''
  }
  // 最後のスラッシュの位置を探す
  const lastSlashIndex = url.lastIndexOf('/')

  // スラッシュが見つからない場合は文字列全体を返す
  if (lastSlashIndex === -1) {
    return url
  }

  // 最後のスラッシュ以降の内容を抽出
  const lastPart = url.substring(lastSlashIndex + 1)

  return lastPart
}

/**
 * 外部リソースをロードする
 * @param url アドレス 例: https://xx.com/xx.js
 * @param type js または css
 * @returns {Promise<unknown>}
 */
export function loadExternalResource(url, type = 'js') {
  // すでに存在するか確認
  const elements =
    type === 'js'
      ? document.querySelectorAll(`[src='${url}']`)
      : document.querySelectorAll(`[href='${url}']`)

  return new Promise((resolve, reject) => {
    if (elements.length > 0 || !url) {
      resolve(url)
      return url
    }

    let tag

    if (type === 'css') {
      tag = document.createElement('link')
      tag.rel = 'stylesheet'
      tag.href = url
    } else if (type === 'font') {
      tag = document.createElement('link')
      tag.rel = 'preload'
      tag.as = 'font'
      tag.href = url
    } else if (type === 'js') {
      tag = document.createElement('script')
      tag.src = url
    }
    if (tag) {
      tag.onload = () => {
        // console.log('Load Success', url)
        resolve(url)
      }
      tag.onerror = () => {
        console.warn('Load Error', url)
        reject(url)
      }
      document.head.appendChild(tag)
    }
  })
}

/**
 * URL 内のクエリパラメータを検索する
 * @param {string} key
 * @returns
 */
export function getQueryVariable(key) {
  const query = isBrowser ? window.location.search.substring(1) : ''
  const vars = query.split('&')
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=')
    if (pair[0] === key) {
      return pair[1]
    }
  }
  return false
}
/**
 * URL から指定されたパラメータの値を取得する
 * @param {string} url
 * @param {string} param
 * @returns {string|null}
 */
export function getQueryParam(url, param) {
  if (!url) {
    return ''
  }
  // ハッシュ部分を削除
  const urlWithoutHash = url.split('#')[0]
  const searchParams = new URLSearchParams(urlWithoutHash.split('?')[1])
  return searchParams.get(param)
}

/**
 * 2つのオブジェクトをディープマージする
 * @param target
 * @param sources
 */
export function mergeDeep(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        mergeDeep(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }
  return mergeDeep(target, ...sources)
}

/**
 * オブジェクトであるかを判定
 * @param item
 * @returns {boolean}
 */
export function isObject(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * イテラブル（反復可能）であるかを判定
 * @param {*} obj
 * @returns
 */
export function isIterable(obj) {
  return obj != null && typeof obj[Symbol.iterator] === 'function'
}

/**
 * オブジェクトをディープコピーする
 * 元のオブジェクトの型に応じて、オブジェクトまたは配列を再帰的にコピー
 * @param {*} obj
 * @returns
 */
export function deepClone(obj) {
  if (Array.isArray(obj)) {
    // If obj is an array, create a new array and deep clone each element
    return obj.map(item => deepClone(item))
  } else if (obj && typeof obj === 'object') {
    const newObj = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] instanceof Date) {
          newObj[key] = new Date(obj[key].getTime()).toISOString()
        } else {
          newObj[key] = deepClone(obj[key])
        }
      }
    }
    return newObj
  } else {
    return obj
  }
}
/**
 * 遅延処理（スリープ）
 * @param {*} ms
 * @returns
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

/**
 * 1ページ目から指定したページ番号までの記事を取得する
 * @param pageIndex ページ番号
 * @param list すべての記事
 * @param pageSize 1ページあたりの記事数
 * @returns {*}
 */
export const getListByPage = function (list, pageIndex, pageSize) {
  return list.slice(0, pageIndex * pageSize)
}

/**
 * モバイルデバイスであるかを判定
 */
export const isMobile = () => {
  let isMobile = false
  if (!isBrowser) {
    return isMobile
  }

  // この判定は navigator.userAgentData.mobile が undefined になる問題を引き起こし、
  // ブログが正常に動作しなくなる可能性があるためコメントアウト
  // if (!isMobile && navigator.userAgentData.mobile) {
  //   isMobile = true
  // }

  if (!isMobile && /Mobi|Android|iPhone/i.test(navigator.userAgent)) {
    isMobile = true
  }

  if (/Android|iPhone|iPad|iPod/i.test(navigator.platform)) {
    isMobile = true
  }

  if (typeof window.orientation !== 'undefined') {
    isMobile = true
  }

  return isMobile
}

/**
 * ページ上のすべてのテキストノードをスキャンし、URL形式のテキストをクリック可能なリンクに変換する
 * @param {*} node
 */
export const scanAndConvertToLinks = node => {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent
    const urlRegex = /https?:\/\/[^\s]+/g
    let lastIndex = 0
    let match

    const newNode = document.createElement('span')

    while ((match = urlRegex.exec(text)) !== null) {
      const beforeText = text.substring(lastIndex, match.index)
      const url = match[0]

      if (beforeText) {
        newNode.appendChild(document.createTextNode(beforeText))
      }

      const link = document.createElement('a')
      link.href = url
      link.target = '_blank'
      link.textContent = url

      newNode.appendChild(link)

      lastIndex = urlRegex.lastIndex
    }

    if (lastIndex < text.length) {
      newNode.appendChild(document.createTextNode(text.substring(lastIndex)))
    }

    node.parentNode.replaceChild(newNode, node)
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    for (const childNode of node.childNodes) {
      scanAndConvertToLinks(childNode)
    }
  }
}

/**
 * URL の最後のスラッシュ以降の内容を取得
 * @param {*} url
 * @returns
 */
export function getLastSegmentFromUrl(url) {
  if (!url) {
    return ''
  }
  // URL からクエリパラメータ部分を削除
  const trimmedUrl = url.split('?')[0]
  // 最後のスラッシュ以降の内容を取得
  const segments = trimmedUrl.split('/')
  return segments[segments.length - 1]
}
