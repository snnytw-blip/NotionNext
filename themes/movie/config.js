/**
 * 主题配置文件
 */
const CONFIG = {
  // 菜单配置
  MOVIE_MENU_CATEGORY: true, // 显示分类
  MOVIE_MENU_TAG: true, // 显示标签
  MOVIE_MENU_ARCHIVE: true, // 显示归档
  MOVIE_MENU_SEARCH: true, // 显示搜索
  MOVIE_HOME_BACKGROUND: false, // 首页是否显示背景图, 默认关闭

  MOVIE_PREVIEW_CATEGORY_COUNT: 16, // ホームページに表示するカテゴリの最大数、0 は無制限
  MOVIE_ARTICLE_RECOMMEND: true, // 推荐关联内容在文章底部
  MOVIE_VIDEO_COMBINE: true, // ビデオの集約。有効にすると、記事内の複数のビデオ（キャプション付き）が記事の冒頭にまとめられ、選択ボタンが表示されます。
  MOVIE_VIDEO_COMBINE_SHOW_PAGE_FORCE: false, // 即使只有一集也显示集数切换按钮

  MOVIE_POST_LIST_COVER: true // 列表显示文章封面
}
export default CONFIG
