/**
 * 日付をロケールに基づいてフォーマットする（基本形）
 */
export const formatDate = (date, local) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    
    try {
      return d.toLocaleDateString(local || 'en-US', options)
    } catch (localeError) {
      return d.toLocaleDateString(undefined, options)
    }
  } catch (err) {
    return ''
  }
}

/**
 * テーマが要求する formatDateFmt の実体
 * フォーマット文字列を解釈して日付をフォーマットする
 */
export const formatDateFmt = (date, fmt) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    if (!fmt) return formatDate(date)

    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    return fmt
      .replace('yyyy', String(year))
      .replace('yy', String(year).slice(-2))
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  } catch (err) {
    return ''
  }
}

/**
 * 安全にISO形式へ変換する（前回のエラー対策）
 */
export const safeToISOString = (date) => {
  if (!date) return null
  try {
    const d = new Date(date)
    return isNaN(d.getTime()) ? null : d.toISOString()
  } catch (e) {
    return null
  }
}

// デフォルトエクスポート
export default formatDate

