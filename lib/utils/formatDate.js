/**
 * 日付をフォーマットする（全テーマ共通の防波堤）
 */
export function formatDate(date, local) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return ''; // 不正な日付は空文字を返す
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return d.toLocaleDateString(local || 'en-US', options);
  } catch (err) {
    console.error('Date format error:', err);
    return '';
  }
}

// 【重要】既存の各テーマがこの名前で呼び出しているため、エイリアスとしてエクスポート
export const formatDateFmt = formatDate;

// デフォルトエクスポートも念のため設定
export default formatDate;
