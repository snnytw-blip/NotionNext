import { useGlobal } from '@/lib/global'

/**
 * 跳转到网页顶部
 * 当屏幕下滑500像素后会出现该控件
 * @param targetRef 高さを関連付ける対象の HTML タグ
 * @param showPercent 是否显示百分比
 * @returns {JSX.Element}
 * @constructor
 */
const JumpToTopButton = () => {
  const { locale } = useGlobal()
  return <div title={locale.POST.TOP} className='cursor-pointer p-2 text-center' onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    ><i className='fas fa-angle-up text-2xl' />
    </div>
}

export default JumpToTopButton
