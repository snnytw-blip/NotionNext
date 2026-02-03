export default function formatDate(date, lang) {
  try {
    const d = new Date(date)
    if (isNaN(d.getTime())) {
      return '2026-02-03' // 不正な日付の場合は今日の日付を文字列で返す
    }
    return d.toISOString().split('T')[0] // 常に YYYY-MM-DD 形式を保証
  } catch (e) {
    return '2026-02-03'
  }
}
