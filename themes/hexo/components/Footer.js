// [task6_footer] タスク6: 固定文言「© 2026 未来AIラボ」＋お問い合わせリンク
import Link from 'next/link'

const Footer = ({ title }) => {
  return (
    <footer className='relative z-10 dark:bg-black flex-shrink-0 bg-hexo-light-gray justify-center text-center m-auto w-full leading-6 text-gray-600 dark:text-gray-100 text-sm p-6'>
      <div className='flex flex-col items-center gap-2'>
        <span>
          © 2026{' '}
          <Link
            href='/contact'
            className='underline font-bold hover:text-gray-900 dark:hover:text-gray-300 transition-colors'
          >
            未来AIラボ
          </Link>
        </span>
        <Link
          href='/contact'
          className='text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors'
        >
          お問い合わせ
        </Link>
      </div>
    </footer>
  )
}

export default Footer
