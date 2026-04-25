import { siteConfig } from '@/lib/config'
import SmartLink from '@/components/SmartLink'
/**
 * ロゴ
 * テキスト表示をサポート
 * @param {*} props
 * @returns
 */
const Logo = props => {
  const { siteInfo } = props
  return (
    <SmartLink href='/' passHref legacyBehavior>
      <div className='flex flex-col justify-center items-center cursor-pointer space-y-3'>
        <div className='font-medium text-lg p-1.5 rounded dark:border-white dark:text-white menu-link transform duration-200'>
          {' '}
          {siteInfo?.title || siteConfig('TITLE')}
        </div>
      </div>
    </SmartLink>
  )
}
export default Logo
