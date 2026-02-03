/**
 * 日付をロケールに基づいてフォーマットする（堅牢版）
 */
export const formatDate = (date, local) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    
    try {
      // 1. 指定されたロケールで試行
      return d.toLocaleDateString(local || 'en-US', options)
    } catch (localeError) {
      // 2. ロケールエラー（Cloudflare環境等）時のフォールバック
      return d.toLocaleDateString(undefined, options)
    }
  } catch (err) {
    return ''
  }
}

/**
 * テーマが要求する formatDateFmt のエイリアス
 */
export const formatDateFmt = (date, fmt) => {
  // 簡易実装として formatDate に流す（エラー回避用）
  return formatDate(date)
}

// デフォルトエクスポートとして登録（多くのコンポーネントがこれを要求する）
export default formatDate
