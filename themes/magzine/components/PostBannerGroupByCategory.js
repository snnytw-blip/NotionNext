import { siteConfig } from '@/lib/config'
import PostListHorizontal from './PostListHorizontal'

/**
 * 記事カテゴリ別にグループ化された記事リストブロック
 * @returns {JSX.Element}
 * @constructor
 */
const PostBannerGroupByCategory = props => {
  const { posts, categoryOptions, allNavPages } = props
  if (!posts || posts.length === 0) {
    return null
  }

  // 按分类将文章分组成文件夹
  const categoryFolders = groupArticles(categoryOptions, allNavPages.slice(8))

  return (
    <>
      {/* 各カテゴリの記事リスト */}
      {categoryFolders?.map((categoryGroup, index) => {
        if (
          !categoryGroup ||
          !categoryGroup.items ||
          categoryGroup.items.length < 1
        ) {
          return null
        }

        return (
          <PostListHorizontal
            key={index}
            hasBg={index % 2 === 1}
            title={categoryGroup?.category}
            href={`/category/${categoryGroup?.category}`}
            posts={categoryGroup?.items}
          />
        )
      })}
    </>
  )
}

// 按照分类将文章分组成文件夹
function groupArticles(categoryOptions, allPosts) {
  if (!allPosts) {
    return []
  }
  const groups = []

  for (let i = 0; i < allPosts.length; i++) {
    const item = allPosts[i]
    const categoryName = item?.category ? item?.category : '' // 将 category 转换为字符串

    const existingGroup = groups.find(group => group.category === categoryName) // 同名の最後のグループを検索します

    if (existingGroup && existingGroup.category === categoryName) {
      // グループが既に存在し、そのグループ内の記事数が 4 未満の場合は、記事を追加します
      if (existingGroup.items.length < 4) {
        existingGroup.items.push(item)
      }
    } else {
      // 新建分组，并添加当前文章
      groups.push({ category: categoryName, items: [item] })
    }
  }
  const hiddenCategory = siteConfig('MAGZINE_HOME_HIDDEN_CATEGORY')
  // 按照 categoryOptions 的顺序排序 groups
  const sortedGroups = []
  for (let i = 0; i < categoryOptions.length; i++) {
    const option = categoryOptions[i]
    const matchingGroup = groups.find(group => group.category === option.name)

    if (matchingGroup) {
      if (
        hiddenCategory &&
        hiddenCategory.indexOf(matchingGroup.category) >= 0
      ) {
        continue
      }
      sortedGroups.push(matchingGroup)
    }
  }
  return sortedGroups
}

export default PostBannerGroupByCategory
