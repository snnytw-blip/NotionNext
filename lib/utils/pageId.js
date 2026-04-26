/**
 * page-id の言語プレフィックスを抽出する
 * notionPageId の形式は en:xxxxx のような形式を想定
 * @param {*} str
 * @returns en|ja|xx
 */
function extractLangPrefix(str) {
  const match = str.match(/^(.+?):/)
  if (match && match[1]) {
    return match[1]
  } else {
    return ''
  }
}

/**
 * page-id の本体IDを抽出する
 * notionPageId の形式は en:xxxxx のような形式を想定
 * @param {*} str
 * @returns xxxxx
 */
function extractLangId(str) {
  // 正規表現を使用して文字列をマッチング
  const match = str.match(/:\s*(.+)/)
  // マッチングに成功した場合は、その内容を返す
  if (match && match[1]) {
    return match[1]
  } else {
    // マッチングしない場合は、元の文字列を返す
    return str
  }
}

/**
 * リスト内でページを識別するには末尾のIDだけで十分
 */

function getShortId(uuid) {
  if (!uuid || uuid.indexOf('-') < 0) {
    return uuid
  }
  return uuid.substring(14)
}

module.exports = { extractLangPrefix, extractLangId, getShortId }
