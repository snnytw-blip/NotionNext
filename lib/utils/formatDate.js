export const formatDate = (date, local) => {
  if (!date) return ''
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) return '' // ここで Invalid Date を確実に除去

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

// ログでエラーが出ている toISOString 用の安全なラッパー
export const safeToISOString = (date) => {
  if (!date) return null
  const d = new Date(date)
  return isNaN(d.getTime()) ? null : d.toISOString()
}
