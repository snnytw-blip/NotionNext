import { siteConfig } from '@/lib/config'
import { getGlobalData } from '@/lib/db/getSiteData'

/**
 * お問い合わせページ
 * Formspree を使用したフォーム送信
 */
const Contact = ({ siteInfo, categoryOptions, tagOptions, latestPosts, currentCategory, currentTag, showCategory, showTag, notice, allNavPages }) => {
  const formEndpoint = siteConfig('CONTACT_FORMSPREE_ENDPOINT', '')

  return (
    <div className='max-w-2xl mx-auto px-4 py-12'>
      <h1 className='text-3xl font-bold mb-8 text-center dark:text-gray-100'>
        お問い合わせ
      </h1>
      <p className='text-gray-600 dark:text-gray-400 text-center mb-10'>
        ご質問・ご意見などがありましたら、以下のフォームよりお気軽にお寄せください。
      </p>

      <form
        action={formEndpoint || '#'}
        method='POST'
        className='bg-white dark:bg-hexo-black-gray rounded-xl shadow p-8 space-y-6'
      >
        <div>
          <label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            お名前
          </label>
          <input
            type='text'
            id='name'
            name='name'
            required
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            placeholder='例: 山田 太郎'
          />
        </div>

        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            メールアドレス
          </label>
          <input
            type='email'
            id='email'
            name='_replyto'
            required
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            placeholder='例: example@example.com'
          />
        </div>

        <div>
          <label
            htmlFor='subject'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            件名
          </label>
          <input
            type='text'
            id='subject'
            name='subject'
            required
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            placeholder='例: 記事についての質問'
          />
        </div>

        <div>
          <label
            htmlFor='message'
            className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
          >
            メッセージ
          </label>
          <textarea
            id='message'
            name='message'
            rows={6}
            required
            className='w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
            placeholder='お問い合わせ内容をご記入ください'
          />
        </div>

        <div className='text-center'>
          <button
            type='submit'
            className='px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors duration-200'
          >
            送信する
          </button>
          <p className='text-xs text-gray-400 dark:text-gray-500 mt-3'>
            ※「送信する」をクリックすると、Formspree 経由でメールが送信されます。
          </p>
        </div>
      </form>
    </div>
  )
}

export async function getStaticProps({ locale }) {
  const from = 'contact-props'
  const props = await getGlobalData({ from, locale })

  // 不要データを削除
  delete props.allPages

  // SideRight コンポーネント用のプロパティ名をマッピング
  props.categories = props.categoryOptions
  props.tags = props.tagOptions
  props.showCategory = props.categoryOptions && props.categoryOptions.length > 0
  props.showTag = props.tagOptions && props.tagOptions.length > 0

  return {
    props
  }
}

export default Contact
