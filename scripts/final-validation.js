#!/usr/bin/env node

/**
 * プロジェクト最終検証スクリプト
 * すべての最適化タスクが完了しているか検証します
 */

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

/**
 * 最適化タスクの完了状況を検証
 */
function validateOptimizationTasks() {
  log('🎯 最適化タスクの完了状況を検証しています', 'magenta')
  log('=' .repeat(60), 'cyan')
  
  const tasks = [
    {
      name: 'プロジェクトの分析と評価',
      checks: [
        { file: 'OPTIMIZATION_SUMMARY.md', desc: '最適化まとめドキュメント' },
        { file: 'package.json', desc: 'プロジェクト設定ファイル' }
      ]
    },
    {
      name: '依存関係管理の最適化',
      checks: [
        { file: '.npmrc', desc: 'NPM 設定ファイル' },
        { file: 'package.json', desc: '依存パッケージの更新', validate: validateDependencies }
      ]
    },
    {
      name: 'パフォーマンスの最適化',
      checks: [
        { file: 'next.config.js', desc: 'Next.js パフォーマンス設定', validate: validateNextConfig },
        { file: 'conf/performance.config.js', desc: 'パフォーマンス設定ファイル' },
        { file: 'components/PerformanceMonitor.js', desc: 'パフォーマンス監視コンポーネント' }
      ]
    },
    {
      name: 'コード品質の向上',
      checks: [
        { file: 'tsconfig.json', desc: 'TypeScript 設定', validate: validateTSConfig },
        { file: '.eslintrc.js', desc: 'ESLint 設定' },
        { file: '.prettierrc.js', desc: 'Prettier 設定' },
        { file: 'lib/utils/errorHandler.js', desc: 'エラー処理ユーティリティ' },
        { file: 'types/index.ts', desc: '型定義ファイル' },
        { file: 'scripts/quality-check.js', desc: '品質チェックスクリプト' }
      ]
    },
    {
      name: 'SEO とアクセシビリティの最適化',
      checks: [
        { file: 'components/SEO.js', desc: 'SEO コンポーネント最適化', validate: validateSEOComponent },
        { file: 'components/Accessibility.js', desc: 'アクセシビリティコンポーネント' },
        { file: 'lib/sitemap.js', desc: 'サイトマップ生成ツール' }
      ]
    },
    {
      name: 'セキュリティの強化',
      checks: [
        { file: 'next.config.js', desc: 'セキュリティヘッダー設定', validate: validateSecurityHeaders },
        { file: 'lib/utils/validation.js', desc: '入力バリデーションツール' },
        { file: 'lib/middleware/security.js', desc: 'セキュリティミドルウェア' },
        { file: 'lib/config/env-validation.js', desc: '環境変数バリデーション' }
      ]
    },
    {
      name: '開発体験の最適化',
      checks: [
        { file: '.vscode/settings.json', desc: 'VSCode 設定' },
        { file: '.vscode/extensions.json', desc: 'VSCode 推奨拡張機能' },
        { file: '.vscode/launch.json', desc: 'VSCode デバッグ設定' },
        { file: '.vscode/tasks.json', desc: 'VSCode タスク設定' },
        { file: 'scripts/dev-tools.js', desc: '開発ツールスクリプト' },
        { file: 'scripts/setup-git-hooks.js', desc: 'Git Hooks 設定' },
        { file: 'DEVELOPMENT.md', desc: '開発者ガイド' }
      ]
    },
    {
      name: 'ドキュメントとテストの充実',
      checks: [
        { file: 'jest.config.js', desc: 'Jest 設定' },
        { file: 'jest.setup.js', desc: 'Jest セットアップファイル' },
        { file: '__tests__/components/LazyImage.test.js', desc: 'コンポーネントテスト例' },
        { file: '__tests__/lib/utils/validation.test.js', desc: 'ユーティリティ関数テスト' },
        { file: 'DEPLOYMENT.md', desc: 'デプロイガイド' },
        { file: '.github/workflows/ci.yml', desc: 'CI/CD 設定' },
        { file: 'lighthouserc.js', desc: 'Lighthouse 設定' }
      ]
    }
  ]
  
  let totalTasks = 0
  let completedTasks = 0
  
  tasks.forEach(task => {
    log(`\n📋 ${task.name}`, 'blue')
    
    let taskCompleted = 0
    task.checks.forEach(check => {
      totalTasks++
      
      if (fs.existsSync(check.file)) {
        let isValid = true
        
        // カスタム検証の実行
        if (check.validate) {
          try {
            isValid = check.validate(check.file)
          } catch (error) {
            isValid = false
          }
        }
        
        if (isValid) {
          log(`  ✅ ${check.desc}`, 'green')
          completedTasks++
          taskCompleted++
        } else {
          log(`  ⚠️  ${check.desc} - 設定が不完全な可能性があります`, 'yellow')
        }
      } else {
        log(`  ❌ ${check.desc} - ファイルが存在しません`, 'red')
      }
    })
    
    const taskProgress = Math.round((taskCompleted / task.checks.length) * 100)
    log(`  📊 タスク完了度: ${taskProgress}%`, taskProgress === 100 ? 'green' : taskProgress >= 80 ? 'yellow' : 'red')
  })
  
  return { completed: completedTasks, total: totalTasks }
}

/**
 * 依存パッケージ更新の検証
 */
function validateDependencies(filePath) {
  try {
    const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    // 主要な依存関係が更新されているか確認
    const keyDeps = {
      'next': '^14.2.30',
      'react': '^18.3.1',
      'tailwindcss': '^3.4.17'
    }
    
    for (const [dep, expectedVersion] of Object.entries(keyDeps)) {
      const currentVersion = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep]
      if (!currentVersion || !currentVersion.includes(expectedVersion.replace('^', ''))) {
        return false
      }
    }
    
    // 新規追加されたスクリプトの確認
    const requiredScripts = ['quality', 'pre-commit', 'dev-tools', 'health-check', 'test']
    for (const script of requiredScripts) {
      if (!packageJson.scripts?.[script]) {
        return false
      }
    }
    
    return true
  } catch {
    return false
  }
}

/**
 * Next.js 設定の検証
 */
function validateNextConfig(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // パフォーマンス最適化設定の確認
    const requiredConfigs = [
      'compress: true',
      'poweredByHeader: false',
      'swcMinify: true',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'Content-Security-Policy'
    ]
    
    return requiredConfigs.every(config => content.includes(config))
  } catch {
    return false
  }
}

/**
 * TypeScript 設定の検証
 */
function validateTSConfig(filePath) {
  try {
    const tsConfig = JSON.parse(fs.readFileSync(filePath, 'utf8'))
    
    // 厳格モード設定の確認
    const strictOptions = [
      'noImplicitAny',
      'noImplicitReturns',
      'exactOptionalPropertyTypes',
      'noUncheckedIndexedAccess'
    ]
    
    return strictOptions.every(option => 
      tsConfig.compilerOptions?.[option] === true
    )
  } catch {
    return false
  }
}

/**
 * SEO コンポーネントの検証
 */
function validateSEOComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // SEO 最適化機能の確認
    const seoFeatures = [
      'generateStructuredData',
      'og:image:width',
      'twitter:image:alt',
      'dns-prefetch',
      'preconnect'
    ]
    
    return seoFeatures.every(feature => content.includes(feature))
  } catch {
    return false
  }
}

/**
 * セキュリティヘッダー設定の検証
 */
function validateSecurityHeaders(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    
    // セキュリティヘッダーの確認
    const securityHeaders = [
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Content-Security-Policy'
    ]
    
    return securityHeaders.every(header => content.includes(header))
  } catch {
    return false
  }
}

/**
 * 最終報告の生成
 */
function generateFinalReport(taskResults) {
  log('\n📊 最終検証報告書', 'magenta')
  log('=' .repeat(60), 'cyan')
  
  const completionRate = Math.round((taskResults.completed / taskResults.total) * 100)
  
  log(`📈 全体完了度: ${completionRate}%`, completionRate >= 95 ? 'green' : completionRate >= 80 ? 'yellow' : 'red')
  log(`✅ 完了済みタスク: ${taskResults.completed}/${taskResults.total}`, 'cyan')
  
  if (completionRate >= 95) {
    log('\n🎉 おめでとうございます！すべての最適化タスクがほぼ完了しました！', 'green')
    log('🚀 プロジェクトはプロダクションレベルの品質基準に達しています', 'green')
  } else if (completionRate >= 80) {
    log('\n👍 素晴らしい！大部分の最適化タスクが完了しています', 'yellow')
    log('🔧 残りの設定項目を完成させることをお勧めします', 'yellow')
  } else {
    log('\n⚠️  まだ完了すべきタスクが多く残っています', 'red')
    log('📋 詳細は OPTIMIZATION_SUMMARY.md を参照してください', 'red')
  }
  
  // 報告ファイルの生成
  const report = {
    timestamp: new Date().toISOString(),
    completionRate,
    completedTasks: taskResults.completed,
    totalTasks: taskResults.total,
    status: completionRate >= 95 ? 'excellent' : completionRate >= 80 ? 'good' : 'needs-improvement'
  }
  
  fs.writeFileSync('validation-report.json', JSON.stringify(report, null, 2))
  log('\n📄 詳細な報告書を validation-report.json に保存しました', 'cyan')
  
  return report
}

/**
 * メイン関数
 */
function main() {
  log('🔍 NotionNext プロジェクト最終検証', 'magenta')
  log('すべての最適化タスクの完了状況を検証しています', 'cyan')
  log('=' .repeat(60), 'cyan')
  
  const taskResults = validateOptimizationTasks()
  const report = generateFinalReport(taskResults)
  
  log('\n💡 次のステップの提案:', 'cyan')
  log('1. npm run health-check を実行してヘルスチェックを行う', 'cyan')
  log('2. npm run quality を実行して品質チェックを行う', 'cyan')
  log('3. npm run build を実行してビルドをテストする', 'cyan')
  log('4. DEPLOYMENT.md を確認してデプロイ方法を理解する', 'cyan')
  
  return report.status === 'excellent'
}

// メイン関数の実行
if (require.main === module) {
  const success = main()
  process.exit(success ? 0 : 1)
}

module.exports = { main }
