# 作業指示書

## タスク名
footer をデフォルトから「© 2026 未来AIラボ」に変更

---

## 対象ファイル
- `themes/hexo/components/Footer.js`
- `blog.config.js`（念のため確認）

---

## 現状コード（該当箇所）

### `themes/hexo/components/Footer.js`
```js
import { BeiAnGongAn } from '@/components/BeiAnGongAn'
import BeiAnSite from '@/components/BeiAnSite'
import PoweredBy from '@/components/PoweredBy'
import { siteConfig } from '@/lib/config'

const Footer = ({ title }) => {
  const d = new Date()
  const currentYear = d.getFullYear()
  const since = siteConfig('SINCE')
  const copyrightDate =
    parseInt(since) < currentYear ? since + '-' + currentYear : currentYear

  return (
    <footer className='relative z-10 dark:bg-black flex-shrink-0 bg-hexo-light-gray justify-center text-center m-auto w-full leading-6  text-gray-600 dark:text-gray-100 text-sm p-6'>
      {/* <DarkModeButton/> */}
      <i className='fas fa-copyright' /> {`${copyrightDate}`}
      <span>
        <i className='mx-1 animate-pulse fas fa-heart' />
        <a
          href={siteConfig('LINK')}
          className='underline font-bold  dark:text-gray-300 '>
          {siteConfig('AUTHOR')}
        </a>
        .<br />
        <BeiAnSite />
        <BeiAnGongAn />
        <span className='hidden busuanzi_container_site_pv'>
          <i className='fas fa-eye' />
          <span className='px-1 busuanzi_value_site_pv'> </span>
        </span>
        <span className='pl-2 hidden busuanzi_container_site_uv'>
          <i className='fas fa-users' />
          <span className='px-1 busuanzi_value_site_uv'> </span>
        </span>
        <h1 className='text-xs pt-4 text-light-400 dark:text-gray-400'>
          {title} {siteConfig('BIO') && <>|</>} {siteConfig('BIO')}
        </h1>
        <PoweredBy className='justify-center' />
      </span>
      <br />
    </footer>
  )
}

export default Footer
```

---

## 問題点
1. フッターがデフォルトのテンプレートのままで、「© 2026 未来AIラボ」という固定文言になっていない
   - 現在は動的に `SINCE`, `AUTHOR`, `BIO`, `TITLE` を表示している
2. 改修計画では「© 2026 未来AIラボ」という固定文言が必要

---

## 修正仕様

### `themes/hexo/components/Footer.js`
- [ ] フッター本文を固定文言「© 2026 未来AIラボ」に置き換え
  - オプション A（固定文言のみ、完全上書き）:
    ```jsx
    const Footer = ({ title }) => {
      return (
        <footer className='relative z-10 dark:bg-black flex-shrink-0 bg-hexo-light-gray justify-center text-center m-auto w-full leading-6 text-gray-600 dark:text-gray-100 text-sm p-6'>
          <span>© 2026 未来AIラボ</span>
        </footer>
      )
    }
    ```
  - オプション B（動的コピーライト + 固定文言、柔軟）:
    ```jsx
    const Footer = ({ title }) => {
      const thisYear = 2026
      return (
        <footer className='relative z-10 dark:bg-black flex-shrink-0 bg-hexo-light-gray justify-center text-center m-auto w-full leading-6 text-gray-600 dark:text-gray-100 text-sm p-6'>
          <span>© {thisYear} 未来AIラボ</span>
          <PoweredBy className='justify-center' />
        </footer>
      )
    }
    ```
  - [ ] オプション A は `PoweredBy` も削除している。オプション B は `PoweredBy` を残すが、著作権表記は固定
- [ ] 不要になったインポート（`BeiAnGongAn`, `BeiAnSite`, `siteConfig`）を削除
- [ ] 現在のテーマが `hexo` かどうか確認し、異なる場合は該当テーマの `Footer.js` を修正

### 確認事項
- [ ] テーマを変更している場合、修正対象の `Footer.js` が変わる
  - 例: `themes/simple/components/Footer.js`, `themes/next/components/Footer.js` など
  - blog.config.js の `THEME` 設定値を確認し、正しいパスを指定すること

---

## 実装担当への注意事項
- `Next.js` のフッターコンポーネントは各テーマに個別に存在するため、**必ず現在使用中のテーマの Footer.js を修正する**こと
  - 現在のデフォルトは `hexo` (`blog.config.js` の `THEME: process.env.NEXT_PUBLIC_THEME || 'hexo'`)
- `BeiAnGongAn` や `BeiAnSite` は中国の ICP 备案向けのコンポーネントであり、日本向けサイトでは不要。削除しても問題ない
- フッターの再デプロイ後はブラウザのハードリロードで変更を確認すること（Next.js の静的生成によるキャッシュの可能性あり）