import Announcement from './Announcement'

/**
 * CTA（Call To Action）：ユーザーに行動を促すセクションを作成するために使用されます。
 * 该组件通过以下方式激励用户进行特定操作
 * ユーザーのお知らせ欄の内容がここに表示されます
 **/
export default function CTA({ notice }) {
  return (
    <>
      {/* 底部 */}
      <Announcement
        post={notice}
        className={
          'cta text-center text-black bg-[#7BE986] dark:bg-hexo-black-gray py-16'
        }
      />
    </>
  )
}
