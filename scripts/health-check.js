#!/usr/bin/env node

/**
 * プロジェクトヘルスチェックスクリプト
 * すべての最適化が正常に機能しているか検証します
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

function runCommand(command, description, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: silent ? 'pipe' : 'inherit',
      timeout: 30000
    })
    return { success: true, output }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

/**
 * ファイルの存在確認
 */
function checkFileExists(filePath, description) {
  const exists = fs.existsSync(filePath)
  if (exists) {
    log(`✅ ${description}`, 'green')
  } else {
    log(`❌ ${description} - ファイルが存在しません: ${filePath}`, 'red')
  }
  return exists
}

/**
 * 設定ファイルの確認
 */
function checkConfigFiles() {
  log('\n📋 設定ファイルを確認しています...', 'blue')
  
  const configFiles = [
    { path: 'package.json', name: 'Package.json' },
    { path: 'next.config.js', name: 'Next.js 設定' },
    { path: 'tailwind.config.js', name: 'Tailwind 設定' },
    { path: 'tsconfig.json', name: 'TypeScript 設定' },
    { path: '.eslintrc.js', name: 'ESLint 設定' },
    { path: '.prettierrc.js', name: 'Prettier 設定' },
    { path: 'jest.config.js', name: 'Jest 設定' },
    { path: '.npmrc', name: 'NPM 設定' }
  ]
  
  let passed = 0
  configFiles.forEach(({ path: filePath, name }) => {
    if (checkFileExists(filePath, name)) {
      passed++
    }
  })
  
  return { passed, total: configFiles.length }
}

/**
 * VSCode 設定の確認
 */
function checkVSCodeConfig() {
  log('\n🔧 VSCode 設定を確認しています...', 'blue')
  
  const vscodeFiles = [
    { path: '.vscode/settings.json', name: 'VSCode 設定' },
    { path: '.vscode/extensions.json', name: 'VSCode 推奨拡張機能' },
    { path: '.vscode/launch.json', name: 'VSCode デバッグ設定' },
    { path: '.vscode/tasks.json', name: 'VSCode タスク設定' }
  ]
  
  let passed = 0
  vscodeFiles.forEach(({ path: filePath, name }) => {
    if (checkFileExists(filePath, name)) {
      passed++
    }
  })
  
  return { passed, total: vscodeFiles.length }
}

/**
 * スクリプトファイルの確認
 */
function checkScripts() {
  log('\n📜 スクリプトファイルを確認しています...', 'blue')
  
  const scriptFiles = [
    { path: 'scripts/quality-check.js', name: 'コード品質チェックスクリプト' },
    { path: 'scripts/dev-tools.js', name: '開発ツールスクリプト' },
    { path: 'scripts/setup-git-hooks.js', name: 'Git Hooks 設定スクリプト' },
    { path: 'scripts/health-check.js', name: 'ヘルスチェックスクリプト' }
  ]
  
  let passed = 0
  scriptFiles.forEach(({ path: filePath, name }) => {
    if (checkFileExists(filePath, name)) {
      passed++
    }
  })
  
  return { passed, total: scriptFiles.length }
}

/**
 * ドキュメントファイルの確認
 */
function checkDocumentation() {
  log('\n📚 ドキュメントファイルを確認しています...', 'blue')
  
  const docFiles = [
    { path: 'README.md', name: 'プロジェクト説明ドキュメント' },
    { path: 'DEVELOPMENT.md', name: '開発者ガイド' },
    { path: 'DEPLOYMENT.md', name: 'デプロイガイド' },
    { path: 'OPTIMIZATION_SUMMARY.md', name: '最適化まとめ' }
  ]
  
  let passed = 0
  docFiles.forEach(({ path: filePath, name }) => {
    if (checkFileExists(filePath, name)) {
      passed++
    }
  })
  
  return { passed, total: docFiles.length }
}

/**
 * テストファイルの確認
 */
function checkTests() {
  log('\n🧪 テストファイルを確認しています...', 'blue')
  
  const testFiles = [
    { path: '__tests__/components/LazyImage.test.js', name: 'LazyImage コンポーネントテスト' },
    { path: '__tests__/lib/utils/validation.test.js', name: 'バリデーションツールテスト' },
    { path: 'jest.setup.js', name: 'Jest セットアップファイル' },
    { path: 'jest.env.js', name: 'Jest 環境設定' }
  ]
  
  let passed = 0
  testFiles.forEach(({ path: filePath, name }) => {
    if (checkFileExists(filePath, name)) {
      passed++
    }
  })
  
  return { passed, total: testFiles.length }
}

/**
 * 依存関係のインストール確認
 */
function checkDependencies() {
  log('\n📦 依存関係のインストールを確認しています...', 'blue')
  
  if (!fs.existsSync('node_modules')) {
    log('❌ node_modules ディレクトリが存在しません。npm install を実行してください', 'red')
    return { passed: 0, total: 1 }
  }
  
  log('✅ node_modules ディレクトリが存在します', 'green')
  
  // 主要な依存関係の確認
  const keyDeps = ['next', 'react', 'tailwindcss', '@testing-library/react', 'jest']
  let passed = 1 // node_modules 存在
  
  keyDeps.forEach(dep => {
    const depPath = path.join('node_modules', dep)
    if (fs.existsSync(depPath)) {
      log(`✅ ${dep} がインストールされています`, 'green')
      passed++
    } else {
      log(`❌ ${dep} がインストールされていません`, 'red')
    }
  })
  
  return { passed, total: keyDeps.length + 1 }
}

/**
 * コード品質チェックの実行
 */
function runQualityChecks() {
  log('\n🔍 コード品質チェックを実行しています...', 'blue')
  
  const checks = [
    { command: 'npm run lint', name: 'ESLint チェック' },
    { command: 'npm run type-check', name: 'TypeScript 型チェック' },
    { command: 'npm run format:check', name: 'Prettier フォーマットチェック' }
  ]
  
  let passed = 0
  checks.forEach(({ command, name }) => {
    log(`\n🔧 ${name} を実行中...`, 'cyan')
    const result = runCommand(command, name, true)
    
    if (result.success) {
      log(`✅ ${name} 合格`, 'green')
      passed++
    } else {
      log(`❌ ${name} 不合格`, 'red')
      if (result.error) {
        console.log(result.error)
      }
    }
  })
  
  return { passed, total: checks.length }
}

/**
 * ビルドのテスト
 */
function testBuild() {
  log('\n🏗️ プロジェクトのビルドをテストしています...', 'blue')
  
  log('🔧 ビルドコマンドを実行中...', 'cyan')
  const result = runCommand('npm run build', 'プロジェクトビルド', true)
  
  if (result.success) {
    log('✅ プロジェクトのビルドに成功しました', 'green')
    
    // ビルド出力の確認
    if (fs.existsSync('.next')) {
      log('✅ .next ディレクトリが生成されました', 'green')
      return { passed: 2, total: 2 }
    } else {
      log('❌ .next ディレクトリが生成されませんでした', 'red')
      return { passed: 1, total: 2 }
    }
  } else {
    log('❌ プロジェクトのビルドに失敗しました', 'red')
    if (result.error) {
      console.log(result.error)
    }
    return { passed: 0, total: 2 }
  }
}

/**
 * テストの実行
 */
function runTests() {
  log('\n🧪 テストを実行しています...', 'blue')
  
  log('🔧 テストコマンドを実行中...', 'cyan')
  const result = runCommand('npm test -- --passWithNoTests', 'ユニットテスト', true)
  
  if (result.success) {
    log('✅ テストの実行に成功しました', 'green')
    return { passed: 1, total: 1 }
  } else {
    log('❌ テストの実行に失敗しました', 'red')
    if (result.error) {
      console.log(result.error)
    }
    return { passed: 0, total: 1 }
  }
}

/**
 * セキュリティの確認
 */
function checkSecurity() {
  log('\n🔒 セキュリティを確認しています...', 'blue')
  
  log('🔧 セキュリティ監査を実行中...', 'cyan')
  const result = runCommand('npm audit --audit-level=moderate', 'セキュリティ監査', true)
  
  if (result.success) {
    log('✅ セキュリティ監査に合格しました', 'green')
    return { passed: 1, total: 1 }
  } else {
    log('⚠️  セキュリティの問題が見つかりました。npm audit fix を実行してください', 'yellow')
    return { passed: 0, total: 1 }
  }
}

/**
 * ヘルスレポートの生成
 */
function generateHealthReport(results) {
  log('\n📊 ヘルスレポートを生成しています...', 'blue')
  
  const totalPassed = results.reduce((sum, result) => sum + result.passed, 0)
  const totalChecks = results.reduce((sum, result) => sum + result.total, 0)
  const healthScore = Math.round((totalPassed / totalChecks) * 100)
  
  const report = {
    timestamp: new Date().toISOString(),
    healthScore,
    totalChecks,
    totalPassed,
    results: results.map((result, index) => ({
      category: [
        '設定ファイル',
        'VSCode設定',
        'スクリプトファイル',
        'ドキュメントファイル',
        'テストファイル',
        '依存関係インストール',
        'コード品質',
        'プロジェクトビルド',
        'ユニットテスト',
        'セキュリティチェック'
      ][index],
      ...result
    }))
  }
  
  // レポートの保存
  const reportPath = path.join(process.cwd(), 'health-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log(`📄 ヘルスレポートを保存しました: ${reportPath}`, 'cyan')
  
  return report
}

/**
 * メイン関数
 */
async function main() {
  log('🏥 NotionNext プロジェクトヘルスチェック', 'magenta')
  log('=' .repeat(50), 'cyan')
  
  const results = []
  
  // すべてのチェックを実行
  results.push(checkConfigFiles())
  results.push(checkVSCodeConfig())
  results.push(checkScripts())
  results.push(checkDocumentation())
  results.push(checkTests())
  results.push(checkDependencies())
  results.push(runQualityChecks())
  results.push(testBuild())
  results.push(runTests())
  results.push(checkSecurity())
  
  // レポートの生成
  const report = generateHealthReport(results)
  
  // まとめを出力
  log('\n📋 ヘルスチェックのまとめ:', 'magenta')
  log('=' .repeat(50), 'cyan')
  log(`🎯 ヘルススコア: ${report.healthScore}%`, report.healthScore >= 90 ? 'green' : report.healthScore >= 70 ? 'yellow' : 'red')
  log(`✅ 合格したチェック: ${report.totalPassed}/${report.totalChecks}`, 'cyan')
  
  if (report.healthScore >= 90) {
    log('\n🎉 プロジェクトの健康状態は非常に良好です！', 'green')
  } else if (report.healthScore >= 70) {
    log('\n⚠️  プロジェクトの健康状態は良好ですが、改善の余地があります', 'yellow')
  } else {
    log('\n❌ プロジェクトの健康状態には改善が必要です', 'red')
  }
  
  log('\n💡 提案:', 'cyan')
  log('- npm run quality を実行して完全な品質チェックを行ってください', 'cyan')
  log('- npm run dev-tools を実行して開発ツールを確認してください', 'cyan')
  log('- DEVELOPMENT.md を確認して開発ガイドラインを理解してください', 'cyan')
  
  // 終了コード
  process.exit(report.healthScore >= 70 ? 0 : 1)
}

// メイン関数の実行
if (require.main === module) {
  main().catch(error => {
    log(`💥 ヘルスチェック中にエラーが発生しました: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { main }
