#!/usr/bin/env node

/**
 * Git Hooks 設定スクリプト
 * pre-commit および pre-push フックを自動設定します
 */

const fs = require('fs')
const path = require('path')

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
 * pre-commit フックを作成
 */
function createPreCommitHook() {
  const hookContent = `#!/bin/sh
# Pre-commit hook for NotionNext

echo "🔍 Running pre-commit checks..."

# コード品質チェックの実行
npm run pre-commit

# 実行結果の確認
if [ $? -ne 0 ]; then
  echo "❌ Pre-commit checks failed. Please fix the issues before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed!"
exit 0
`

  return hookContent
}

/**
 * pre-push フックを作成
 */
function createPrePushHook() {
  const hookContent = `#!/bin/sh
# Pre-push hook for NotionNext

echo "🚀 Running pre-push checks..."

# 完全な品質チェックの実行
npm run quality

# ビルドが成功するか確認
echo "🏗️  Testing build..."
npm run build

# 実行結果の確認
if [ $? -ne 0 ]; then
  echo "❌ Pre-push checks failed. Please fix the issues before pushing."
  exit 1
fi

echo "✅ Pre-push checks passed!"
exit 0
`

  return hookContent
}

/**
 * commit-msg フックを作成
 */
function createCommitMsgHook() {
  const hookContent = `#!/bin/sh
# Commit message hook for NotionNext

commit_regex='^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\\(.+\\))?: .{1,50}'

error_msg="❌ Invalid commit message format!

Commit message should follow the format:
<type>(<scope>): <description>

Types:
- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code
- refactor: A code change that neither fixes a bug nor adds a feature
- test: Adding missing tests or correcting existing tests
- chore: Changes to the build process or auxiliary tools
- perf: A code change that improves performance
- ci: Changes to CI configuration files and scripts
- build: Changes that affect the build system or external dependencies
- revert: Reverts a previous commit

Examples:
- feat(auth): add user authentication
- fix(ui): resolve button alignment issue
- docs: update installation guide
- style: format code with prettier
- refactor(api): simplify user service
- test: add unit tests for utils
- chore: update dependencies
"

if ! grep -qE "$commit_regex" "$1"; then
  echo "$error_msg" >&2
  exit 1
fi

echo "✅ Commit message format is valid!"
exit 0
`

  return hookContent
}

/**
 * Git フックを設定
 */
function setupGitHooks() {
  log('🔧 Git フックを設定しています...', 'magenta')

  const gitDir = path.join(process.cwd(), '.git')
  const hooksDir = path.join(gitDir, 'hooks')

  // Git リポジトリであるか確認
  if (!fs.existsSync(gitDir)) {
    log('❌ 現在のディレクトリは Git リポジトリではありません', 'red')
    return false
  }

  // hooks ディレクトリが存在することを確認
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true })
  }

  // フックファイルの作成
  const hooks = [
    { name: 'pre-commit', content: createPreCommitHook() },
    { name: 'pre-push', content: createPrePushHook() },
    { name: 'commit-msg', content: createCommitMsgHook() }
  ]

  hooks.forEach(({ name, content }) => {
    const hookPath = path.join(hooksDir, name)
    
    try {
      fs.writeFileSync(hookPath, content)
      fs.chmodSync(hookPath, '755') // 実行権限の設定
      log(`✅ ${name} フックを作成しました`, 'green')
    } catch (error) {
      log(`❌ ${name} フックの作成に失敗しました: ${error.message}`, 'red')
    }
  })

  log('🎉 Git フックの設定が完了しました！', 'green')
  log('💡 コードをコミットする際、自動的に品質チェックが実行されます', 'cyan')
  
  return true
}

/**
 * Git フックを削除
 */
function removeGitHooks() {
  log('🗑️  Git フックを削除しています...', 'yellow')

  const gitDir = path.join(process.cwd(), '.git')
  const hooksDir = path.join(gitDir, 'hooks')

  if (!fs.existsSync(hooksDir)) {
    log('📁 hooks ディレクトリが存在しません', 'cyan')
    return
  }

  const hooks = ['pre-commit', 'pre-push', 'commit-msg']

  hooks.forEach(hookName => {
    const hookPath = path.join(hooksDir, hookName)
    
    if (fs.existsSync(hookPath)) {
      try {
        fs.unlinkSync(hookPath)
        log(`✅ ${hookName} フックを削除しました`, 'green')
      } catch (error) {
        log(`❌ ${hookName} フックの削除に失敗しました: ${error.message}`, 'red')
      }
    } else {
      log(`📄 ${hookName} フックは存在しません`, 'cyan')
    }
  })

  log('✅ Git フックの削除が完了しました', 'green')
}

/**
 * Git フックの状態を確認
 */
function checkGitHooks() {
  log('🔍 Git フックの状態を確認しています...', 'blue')

  const gitDir = path.join(process.cwd(), '.git')
  const hooksDir = path.join(gitDir, 'hooks')

  if (!fs.existsSync(hooksDir)) {
    log('📁 hooks ディレクトリが存在しません', 'yellow')
    return
  }

  const hooks = ['pre-commit', 'pre-push', 'commit-msg']
  let installedCount = 0

  hooks.forEach(hookName => {
    const hookPath = path.join(hooksDir, hookName)
    
    if (fs.existsSync(hookPath)) {
      const stats = fs.statSync(hookPath)
      const isExecutable = (stats.mode & parseInt('111', 8)) !== 0
      
      if (isExecutable) {
        log(`✅ ${hookName} フックがインストールされており、実行可能です`, 'green')
        installedCount++
      } else {
        log(`⚠️  ${hookName} フックがインストールされていますが、実行不可能です`, 'yellow')
      }
    } else {
      log(`❌ ${hookName} フックがインストールされていません`, 'red')
    }
  })

  if (installedCount === hooks.length) {
    log('🎉 すべての Git フックが正しくインストールされています！', 'green')
  } else {
    log(`⚠️  ${installedCount}/${hooks.length} 個のフックがインストールされています`, 'yellow')
    log('💡 npm run setup-hooks を実行してすべてのフックをインストールしてください', 'cyan')
  }
}

/**
 * メイン関数
 */
function main() {
  const command = process.argv[2]

  switch (command) {
    case 'install':
    case 'setup':
      setupGitHooks()
      break
    case 'remove':
    case 'uninstall':
      removeGitHooks()
      break
    case 'check':
    case 'status':
      checkGitHooks()
      break
    default:
      log('🪝 Git Hooks 管理ツール', 'magenta')
      log('\n利用可能なコマンド:', 'cyan')
      log('  install/setup     - Git フックのインストール', 'cyan')
      log('  remove/uninstall  - Git フックの削除', 'cyan')
      log('  check/status      - フック状態の確認', 'cyan')
      log('\n使用法: node scripts/setup-git-hooks.js <command>', 'yellow')
  }
}

// メイン関数の実行
if (require.main === module) {
  main()
}

module.exports = {
  setupGitHooks,
  removeGitHooks,
  checkGitHooks
}
