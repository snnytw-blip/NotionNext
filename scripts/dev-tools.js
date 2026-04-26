#!/usr/bin/env node

/**
 * 開発ツールスクリプト
 * 各種開発支援機能を提供します
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

// カラー出力
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function runCommand(command, description) {
  log(`\n🔧 ${description}...`, 'blue')
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    log(`✅ ${description} 完了`, 'green')
    return { success: true, output }
  } catch (error) {
    log(`❌ ${description} 失敗`, 'red')
    if (error.stdout) console.log(error.stdout)
    if (error.stderr) console.error(error.stderr)
    return { success: false, error: error.message }
  }
}

/**
 * 開発環境の初期化
 */
function initDev() {
  log('🚀 開発環境を初期化しています', 'magenta')
  
  // Node.js バージョンの確認
  const nodeVersion = process.version
  log(`Node.js バージョン: ${nodeVersion}`, 'cyan')
  
  // npm バージョンの確認
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim()
    log(`npm バージョン: ${npmVersion}`, 'cyan')
  } catch (error) {
    log('npm がインストールされていません', 'red')
    return
  }
  
  // 依存関係のインストール
  runCommand('npm install', '依存関係のインストール')
  
  // 環境変数の確認
  checkEnvFile()
  
  // 品質チェックの実行
  runCommand('npm run quality', 'コード品質チェック')
  
  log('\n🎉 開発環境の初期化が完了しました！', 'green')
  log('💡 npm run dev を実行して開発を開始してください', 'cyan')
}

/**
 * 環境変数ファイルの確認
 */
function checkEnvFile() {
  log('\n📋 環境変数設定を確認しています...', 'blue')
  
  const envExample = path.join(process.cwd(), '.env.example')
  const envLocal = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envExample)) {
    log('⚠️  .env.example ファイルが存在しません', 'yellow')
    return
  }
  
  if (!fs.existsSync(envLocal)) {
    log('⚠️  .env.local ファイルが存在しません。作成しています...', 'yellow')
    try {
      fs.copyFileSync(envExample, envLocal)
      log('✅ .env.local ファイルを作成しました。必要な環境変数を設定してください', 'green')
    } catch (error) {
      log('❌ .env.local ファイルの作成に失敗しました', 'red')
    }
  } else {
    log('✅ .env.local ファイルが存在します', 'green')
  }
  
  // 必須の環境変数の確認
  const requiredVars = ['NOTION_PAGE_ID']
  const envContent = fs.readFileSync(envLocal, 'utf8')
  
  const missingVars = requiredVars.filter(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm')
    return !regex.test(envContent)
  })
  
  if (missingVars.length > 0) {
    log(`⚠️  不足している必須環境変数: ${missingVars.join(', ')}`, 'yellow')
    log('.env.local ファイルでこれらの変数を設定してください', 'yellow')
  } else {
    log('✅ すべての必須環境変数が設定されています', 'green')
  }
}

/**
 * プロジェクトのクリーンアップ
 */
function clean() {
  log('🧹 プロジェクトファイルをクリーンアップしています...', 'magenta')
  
  const dirsToClean = ['.next', 'out', 'node_modules/.cache', 'coverage', '.nyc_output']
  
  dirsToClean.forEach(dir => {
    const fullPath = path.join(process.cwd(), dir)
    if (fs.existsSync(fullPath)) {
      runCommand(`rm -rf ${fullPath}`, `${dir} のクリーンアップ`)
    } else {
      log(`📁 ${dir} は存在しません。スキップします`, 'cyan')
    }
  })
  
  log('✅ プロジェクトのクリーンアップが完了しました', 'green')
}

/**
 * コンポーネントテンプレートの生成
 */
function generateComponent(componentName) {
  if (!componentName) {
    log('❌ コンポーネント名を指定してください', 'red')
    log('使用法: npm run dev-tools generate:component MyComponent', 'cyan')
    return
  }
  
  log(`🎨 コンポーネントを生成しています: ${componentName}`, 'magenta')
  
  const componentDir = path.join(process.cwd(), 'components', componentName)
  const componentFile = path.join(componentDir, 'index.js')
  const styleFile = path.join(componentDir, 'style.module.css')
  
  // コンポーネントディレクトリの作成
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true })
  }
  
  // コンポーネントファイルの生成
  const componentTemplate = `import styles from './style.module.css'

/**
 * ${componentName} コンポーネント
 * @param {object} props コンポーネントプロパティ
 * @returns {JSX.Element}
 */
const ${componentName} = ({ children, className = '', ...props }) => {
  return (
    <div className={\`\${styles.container} \${className}\`} {...props}>
      {children}
    </div>
  )
}

export default ${componentName}
`
  
  // スタイルファイルの生成
  const styleTemplate = `.container {
  /* ${componentName} スタイル */
}
`
  
  fs.writeFileSync(componentFile, componentTemplate)
  fs.writeFileSync(styleFile, styleTemplate)
  
  log(`✅ コンポーネント ${componentName} の生成が完了しました`, 'green')
  log(`📁 場所: ${componentDir}`, 'cyan')
}

/**
 * パッケージサイズの分析
 */
function analyzeBundle() {
  log('📊 パッケージサイズを分析しています...', 'magenta')
  
  runCommand('npm run bundle-report', 'パッケージ分析レポートの生成')
  
  log('📈 パッケージ分析が完了しました。生成されたレポートを確認してください', 'green')
}

/**
 * 依存関係の更新確認
 */
function checkUpdates() {
  log('🔍 依存関係の更新を確認しています...', 'magenta')
  
  runCommand('npm outdated', '古い依存関係の確認')
  
  log('💡 npm update を実行して依存関係を更新してください', 'cyan')
}

/**
 * ドキュメントの生成
 */
function generateDocs() {
  log('📚 プロジェクトドキュメントを生成しています...', 'magenta')
  
  // API ドキュメントの生成
  const apiDocs = generateApiDocs()
  fs.writeFileSync(path.join(process.cwd(), 'docs', 'API.md'), apiDocs)
  
  // コンポーネントドキュメントの生成
  const componentDocs = generateComponentDocs()
  fs.writeFileSync(path.join(process.cwd(), 'docs', 'COMPONENTS.md'), componentDocs)
  
  log('✅ ドキュメントの生成が完了しました', 'green')
}

/**
 * API ドキュメントの生成
 */
function generateApiDocs() {
  return `# API ドキュメント

## 概要
このドキュメントは、プロジェクト内の API インターフェースについて説明します。

## インターフェース一覧

### GET /api/posts
記事一覧を取得します

**パラメータ:**
- page: ページ番号 (オプション)
- limit: 1ページあたりの件数 (オプション)

**レスポンス:**
\`\`\`json
{
  "success": true,
  "data": [...],
  "pagination": {...}
}
\`\`\`

### GET /api/posts/[slug]
単一の記事を取得します

**パラメータ:**
- slug: 記事識別子

**レスポンス:**
\`\`\`json
{
  "success": true,
  "data": {...}
}
\`\`\`
`
}

/**
 * コンポーネントドキュメントの生成
 */
function generateComponentDocs() {
  return `# コンポーネントドキュメント

## 概要
このドキュメントは、プロジェクト内の React コンポーネントについて説明します。

## コンポーネント一覧

### LazyImage
画像の遅延読み込みコンポーネント

**Props:**
- src: 画像 URL (必須)
- alt: 画像の説明 (必須)
- width: 画像の幅 (オプション)
- height: 画像の高さ (オプション)
- priority: 優先的に読み込むかどうか (オプション)

**使用例:**
\`\`\`jsx
<LazyImage 
  src="/image.jpg" 
  alt="説明" 
  width={300} 
  height={200} 
/>
\`\`\`

### SEO
SEO 最適化コンポーネント

**Props:**
- title: ページタイトル (オプション)
- description: ページの説明 (オプション)
- keywords: キーワード (オプション)

**使用例:**
\`\`\`jsx
<SEO 
  title="ページタイトル" 
  description="ページの説明" 
  keywords="キーワード1,キーワード2" 
/>
\`\`\`
`
}

/**
 * メイン関数
 */
function main() {
  const command = process.argv[2]
  const arg = process.argv[3]
  
  switch (command) {
    case 'init':
      initDev()
      break
    case 'clean':
      clean()
      break
    case 'generate:component':
      generateComponent(arg)
      break
    case 'analyze':
      analyzeBundle()
      break
    case 'check-updates':
      checkUpdates()
      break
    case 'docs':
      generateDocs()
      break
    default:
      log('🛠️  NotionNext 開発ツール', 'magenta')
      log('\n利用可能なコマンド:', 'cyan')
      log('  init              - 開発環境の初期化', 'cyan')
      log('  clean             - プロジェクトファイルのクリーンアップ', 'cyan')
      log('  generate:component <name> - コンポーネントテンプレートの生成', 'cyan')
      log('  analyze           - パッケージサイズの分析', 'cyan')
      log('  check-updates     - 依存関係の更新確認', 'cyan')
      log('  docs              - プロジェクトドキュメントの生成', 'cyan')
      log('\n使用法: npm run dev-tools <command> [args]', 'yellow')
  }
}

// メイン関数の実行
if (require.main === module) {
  main()
}

module.exports = {
  initDev,
  clean,
  generateComponent,
  analyzeBundle,
  checkUpdates,
  generateDocs
}
