/* eslint-disable react/no-unknown-property */
/**
 * 此处样式只对当前主题生效
 * ここでは tailwindCSS の @apply 構文はサポートされていません
 * @returns
 */
const Style = () => {
  return <style jsx global>{`
    
    // 底色
    .dark body{
        background-color: black;
    }

  `}</style>
}

export { Style }
