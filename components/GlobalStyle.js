/* eslint-disable react/no-unknown-property */

import { siteConfig } from '@/lib/config'

/**
 * ここに記述された CSS スタイルはグローバルに適用されます
 * 主题客制化css
 * @returns
 */
const GlobalStyle = () => {
  // 从NotionConfig中读取样式
  const GLOBAL_CSS = siteConfig('GLOBAL_CSS')
  // この文字列が空でない場合、表示されます
  if (GLOBAL_CSS && GLOBAL_CSS.trim() !== '') {
    console.log('Inject CSS:', GLOBAL_CSS);
  }
  return (<style jsx global>{`

    ${GLOBAL_CSS}

  `}</style>)
}

export { GlobalStyle }
