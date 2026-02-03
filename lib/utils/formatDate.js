// lib/utils/formatDate.js
export function formatDate(date, local) {
  if (!date) return '';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    
    // --- 修正箇所：try-catch を二重にするか、フォールバックを設定 ---
    try {
      return d.toLocaleDateString(local || 'en-US', options);
    } catch (localeError) {
      console.warn('Locale error, falling back to default');
      return d.toLocaleDateString(undefined, options); // ロケール指定なしで再試行
    }
    // -------------------------------------------------------
  } catch (err) {
    console.error('Date format error:', err);
    return '';
  }
}
