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
      // 指定されたロケールで試行
      return d.toLocaleDateString(local || 'en-US', options)
    } catch (localeError) {
      // ロケールエラー（Edge Runtime等）時のフォールバック
      return d.toLocaleDateString(undefined, options)
    }
  } catch (err) {
    return ''
  }
}

/**
 * テーマが要求する formatDateFmt の実体
 */
export const formatDateFmt = (date, fmt) => {
  // 内部的に formatDate を呼び出す
  return formatDate(date)
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
