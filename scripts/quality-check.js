#!/usr/bin/env node

/**
 * コード品質チェックスクリプト
 * 各種コード品質チェックツールを実行します
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

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
  log(`\n🔍 ${description}...`, 'blue')
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    log(`✅ ${description} 合格`, 'green')
    return { success: true, output }
  } catch (error) {
    log(`❌ ${description} 不合格`, 'red')
    if (error.stdout) {
      console.log(error.stdout)
    }
    if (error.stderr) {
      console.error(error.stderr)
    }
    return { success: false, error: error.message }
  }
}

function checkFileExists(filePath, description) {
  log(`\n📁 ${description} を確認しています...`, 'blue')
  if (fs.existsSync(filePath)) {
    log(`✅ ${description} が存在します`, 'green')
    return true
  } else {
    log(`❌ ${description} が存在しません: ${filePath}`, 'red')
    return false
  }
}

function analyzePackageJson() {
  log('\n📦 package.json を分析しています...', 'blue')
  const packagePath = path.join(process.cwd(), 'package.json')
  
  if (!fs.existsSync(packagePath)) {
    log('❌ package.json が存在しません', 'red')
    return false
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'))
  
  // 必須スクリプトの確認
  const requiredScripts = ['build', 'dev', 'start']
  const missingScripts = requiredScripts.filter(script => !packageJson.scripts?.[script])
  
  if (missingScripts.length > 0) {
    log(`⚠️  不足しているスクリプト: ${missingScripts.join(', ')}`, 'yellow')
  } else {
    log('✅ すべての必須スクリプトが存在します', 'green')
  }

  // 依存関係バージョンの確認
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }
  
  log(`📊 総依存関係数: ${Object.keys(dependencies).length}`, 'cyan')
  
  return true
}

function checkCodeCoverage() {
  log('\n📈 コードカバレッジを確認しています...', 'blue')
  // ここにコードカバレッジ確認ロジックを追加できます
  log('ℹ️  コードカバレッジ確認はスキップされました（テストの構成が必要です）', 'yellow')
}

function checkSecurity() {
  log('\n🔒 セキュリティチェック...', 'blue')
  return runCommand('npm audit --audit-level=moderate', '依存関係のセキュリティチェック')
}

function checkBundleSize() {
  log('\n📦 パッケージサイズを確認しています...', 'blue')
  // ここにパッケージサイズ分析ロジックを追加できます
  log('ℹ️  パッケージサイズ確認はスキップされました（ビルドが必要です）', 'yellow')
}

function generateReport(results) {
  log('\n📋 品質レポートを生成しています...', 'blue')
  
  const report = {
    timestamp: new Date().toISOString(),
    results: results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    }
  }

  const reportPath = path.join(process.cwd(), 'quality-report.json')
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
  
  log(`📄 品質レポートを生成しました: ${reportPath}`, 'cyan')
  return report
}

async function main() {
  log('🚀 コード品質チェックを開始します', 'magenta')
  
  const results = []
  
  // 設定ファイルの確認
  const configFiles = [
    { path: '.eslintrc.js', name: 'ESLint 設定' },
    { path: '.prettierrc.js', name: 'Prettier 設定' },
    { path: 'tsconfig.json', name: 'TypeScript 設定' },
    { path: 'next.config.js', name: 'Next.js 設定' }
  ]
  
  configFiles.forEach(({ path: filePath, name }) => {
    const exists = checkFileExists(filePath, name)
    results.push({ name, success: exists, type: 'config' })
  })
  
  // package.json の分析
  const packageAnalysis = analyzePackageJson()
  results.push({ name: 'package.json の分析', success: packageAnalysis, type: 'analysis' })
  
  // ESLint の実行
  const eslintResult = runCommand('npx eslint . --ext .js,.jsx,.ts,.tsx --max-warnings 0', 'ESLint チェック')
  results.push({ name: 'ESLint', success: eslintResult.success, type: 'lint', ...eslintResult })
  
  // TypeScript の実行
  const tscResult = runCommand('npx tsc --noEmit', 'TypeScript 型チェック')
  results.push({ name: 'TypeScript', success: tscResult.success, type: 'type-check', ...tscResult })
  
  // Prettier の実行
  const prettierResult = runCommand('npx prettier --check .', 'Prettier フォーマットチェック')
  results.push({ name: 'Prettier', success: prettierResult.success, type: 'format', ...prettierResult })
  
  // セキュリティチェック
  const securityResult = checkSecurity()
  results.push({ name: 'セキュリティチェック', success: securityResult.success, type: 'security', ...securityResult })
  
  // その他のチェック
  checkCodeCoverage()
  checkBundleSize()
  
  // レポートの生成
  const report = generateReport(results)
  
  // まとめを出力
  log('\n📊 品質チェックのまとめ:', 'magenta')
  log(`✅ 合格: ${report.summary.passed}`, 'green')
  log(`❌ 不合格: ${report.summary.failed}`, 'red')
  log(`📊 合計: ${report.summary.total}`, 'cyan')
  
  // 不合格のチェックがある場合、終了コードを 1 に設定
  if (report.summary.failed > 0) {
    log('\n⚠️  品質上の問題が見つかりました。修正してから再試行してください', 'yellow')
    process.exit(1)
  } else {
    log('\n🎉 すべての品質チェックに合格しました！', 'green')
    process.exit(0)
  }
}

// メイン関数の実行
if (require.main === module) {
  main().catch(error => {
    log(`💥 品質チェック中にエラーが発生しました: ${error.message}`, 'red')
    process.exit(1)
  })
}

module.exports = { main, runCommand, checkFileExists }
