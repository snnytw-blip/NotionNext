const CONFIG = {
  NAV_INDEX_PAGE: 'about', // ドキュメントのホームページに表示する記事。このパスが Notion データベースに含まれていることを確認してください。

  NAV_AUTO_SORT: process.env.NEXT_PUBLIC_NAV_AUTO_SORT || true, // カテゴリ名で記事を自動的にグループ化して並べ替えるかどうか。自動グループ化により、Notion 内の記事の順序が崩れる可能性があります。

  NAV_SHOW_TITLE_TEXT: false, // 标题栏显示文本
  NAV_USE_CUSTOM_MENU: true, // カスタムメニューを使用する（サブメニューやカスタムカテゴリボタンをサポート）。true の場合、すべてのカテゴリが表示されます。

  // 菜单
  NAV_MENU_CATEGORY: true, // 显示分类
  NAV_MENU_TAG: true, // 显示标签
  NAV_MENU_ARCHIVE: true, // 显示归档
  NAV_MENU_SEARCH: true, // 显示搜索

  // Widget
  NAV_WIDGET_REVOLVER_MAPS:
    process.env.NEXT_PUBLIC_WIDGET_REVOLVER_MAPS || 'false', // 地图插件
  NAV_WIDGET_TO_TOP: true // 跳回顶部
}
export default CONFIG
