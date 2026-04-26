import { siteConfig } from '@/lib/config'

/**
 * これは埋め込みコンポーネントであり、任意の場所で chat-base ダイアログを全画面表示できます。
 * 暂时没有页面引用
 * 因为您可以直接用内嵌网页的方式放入您的notion中 https://www.chatbase.co/chatbot-iframe/${siteConfig('CHATBASE_ID')}
 */
export default function ChatBase() {
  if (!siteConfig('CHATBASE_ID')) {
    return <></>
  }

  return <iframe
        src={`https://www.chatbase.co/chatbot-iframe/${siteConfig('CHATBASE_ID')}`}
        width="100%"
        style={{ height: '100%', minHeight: '700px' }}
        frameborder="0"
    ></iframe>
}
