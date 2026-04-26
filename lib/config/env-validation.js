/**
 * 環境変数バリデーション設定
 * すべての必要な環境変数が正しく設定されていることを確認します
 */

import { Validator } from '@/lib/utils/validation'

// 環境変数バリデーションルール
const ENV_VALIDATION_RULES = {
  // 必須の環境変数
  required: {
    NOTION_PAGE_ID: {
      validator: (value) => {
        if (!value) return 'NOTION_PAGE_ID is required'
        // 複数のIDをカンマ区切りでサポート
        const ids = value.split(',')
        for (const id of ids) {
          const cleanId = id.trim().split(':')[1] || id.trim() // lang:id 形式をサポート
          if (!Validator.isValidNotionId(cleanId)) {
            return `Invalid Notion ID format: ${cleanId}`
          }
        }
        return true
      }
    }
  },

  // オプションだが設定が推奨される環境変数
  recommended: {
    NEXT_PUBLIC_TITLE: {
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    NEXT_PUBLIC_DESCRIPTION: {
      type: 'string',
      minLength: 1,
      maxLength: 500
    },
    NEXT_PUBLIC_AUTHOR: {
      type: 'string',
      minLength: 1,
      maxLength: 50
    },
    NEXT_PUBLIC_LINK: {
      validator: (value) => {
        if (value && !Validator.isValidUrl(value)) {
          return 'NEXT_PUBLIC_LINK must be a valid URL'
        }
        return true
      }
    }
  },

  // セキュリティ関連の環境変数
  security: {
    REDIS_URL: {
      validator: (value) => {
        if (value && !value.startsWith('redis://') && !value.startsWith('rediss://')) {
          return 'REDIS_URL must start with redis:// or rediss://'
        }
        return true
      }
    },
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: {
      validator: (value) => {
        if (value && !value.startsWith('pk_')) {
          return 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY must start with pk_'
        }
        return true
      }
    },
    CLERK_SECRET_KEY: {
      validator: (value) => {
        if (value && !value.startsWith('sk_')) {
          return 'CLERK_SECRET_KEY must start with sk_'
        }
        return true
      }
    }
  },

  // サードパーティサービス設定
  services: {
    NEXT_PUBLIC_ANALYTICS_GOOGLE_ID: {
      pattern: /^G-[A-Z0-9]+$/,
      description: 'Google Analytics ID format: G-XXXXXXXXXX'
    },
    NEXT_PUBLIC_ANALYTICS_BAIDU_ID: {
      pattern: /^[a-f0-9]{32}$/,
      description: 'Baidu Analytics ID should be 32 character hex string'
    },
    ALGOLIA_ADMIN_APP_KEY: {
      minLength: 32,
      maxLength: 32,
      description: 'Algolia Admin API Key should be 32 characters'
    },
    NEXT_PUBLIC_ALGOLIA_APP_ID: {
      pattern: /^[A-Z0-9]{10}$/,
      description: 'Algolia App ID format: 10 uppercase alphanumeric characters'
    }
  },

  // 開発環境固有の設定
  development: {
    NODE_ENV: {
      enum: ['development', 'production', 'test'],
      default: 'development'
    },
    NEXT_PUBLIC_DEBUG: {
      type: 'boolean',
      default: false
    }
  }
}

/**
 * 環境変数を検証
 * @returns {object} 検証結果
 */
export function validateEnvironmentVariables() {
  const errors = []
  const warnings = []
  const info = []

  // 必須の環境変数を検証
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.required)) {
    const value = process.env[key]
    const result = validateEnvVar(key, value, rules, true)
    
    if (result.error) {
      errors.push(result.error)
    }
  }

  // 推奨される環境変数を検証
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.recommended)) {
    const value = process.env[key]
    const result = validateEnvVar(key, value, rules, false)
    
    if (result.error) {
      warnings.push(result.error)
    } else if (!value) {
      warnings.push(`Recommended environment variable ${key} is not set`)
    }
  }

  // セキュリティ関連の環境変数を検証
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.security)) {
    const value = process.env[key]
    const result = validateEnvVar(key, value, rules, false)
    
    if (result.error) {
      errors.push(result.error)
    }
  }

  // サードパーティサービス設定を検証
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.services)) {
    const value = process.env[key]
    const result = validateEnvVar(key, value, rules, false)
    
    if (result.error) {
      warnings.push(result.error)
    }
  }

  // 開発環境設定を検証
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.development)) {
    const value = process.env[key] || rules.default
    const result = validateEnvVar(key, value, rules, false)
    
    if (result.error) {
      warnings.push(result.error)
    }
  }

  // 機密情報の漏洩をチェック
  const sensitivePatterns = [
    { pattern: /sk_[a-zA-Z0-9]+/, name: 'Secret Key' },
    { pattern: /[a-f0-9]{32,}/, name: 'API Key' },
    { pattern: /password|secret|key/i, name: 'Sensitive Data' }
  ]

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('NEXT_PUBLIC_')) {
      for (const { pattern, name } of sensitivePatterns) {
        if (pattern.test(value)) {
          warnings.push(`Potential ${name} exposed in public environment variable: ${key}`)
        }
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    info
  }
}

/**
 * 個別の環境変数を検証
 * @param {string} key 環境変数名
 * @param {string} value 環境変数の値
 * @param {object} rules 検証ルール
 * @param {boolean} required 必須かどうか
 * @returns {object} 検証結果
 */
function validateEnvVar(key, value, rules, required = false) {
  // 必須フィールドのチェック
  if (required && (!value || value.trim() === '')) {
    return { error: `Required environment variable ${key} is not set` }
  }

  // 値が存在せず、必須でもない場合は検証をスキップ
  if (!value) {
    return { valid: true }
  }

  // 型の検証
  if (rules.type) {
    switch (rules.type) {
      case 'boolean':
        if (!['true', 'false', '1', '0'].includes(value.toLowerCase())) {
          return { error: `${key} must be a boolean value (true/false)` }
        }
        break
      case 'number':
        if (isNaN(Number(value))) {
          return { error: `${key} must be a number` }
        }
        break
      case 'string':
        if (typeof value !== 'string') {
          return { error: `${key} must be a string` }
        }
        break
    }
  }

  // 長さの検証
  if (rules.minLength !== undefined && value.length < rules.minLength) {
    return { error: `${key} must be at least ${rules.minLength} characters long` }
  }

  if (rules.maxLength !== undefined && value.length > rules.maxLength) {
    return { error: `${key} must be no more than ${rules.maxLength} characters long` }
  }

  // 正規表現による検証
  if (rules.pattern && !rules.pattern.test(value)) {
    const description = rules.description || 'Invalid format'
    return { error: `${key}: ${description}` }
  }

  // 列挙型（Enum）の検証
  if (rules.enum && !rules.enum.includes(value)) {
    return { error: `${key} must be one of: ${rules.enum.join(', ')}` }
  }

  // カスタムバリデーター
  if (rules.validator) {
    const result = rules.validator(value)
    if (result !== true) {
      return { error: `${key}: ${result}` }
    }
  }

  return { valid: true }
}

/**
 * 環境変数のドキュメントを生成
 * @returns {string} ドキュメント内容
 */
export function generateEnvDocumentation() {
  let doc = '# 環境変数設定ドキュメント\n\n'

  doc += '## 必須の環境変数\n\n'
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.required)) {
    doc += `### ${key}\n`
    doc += `- **必須**: はい\n`
    if (rules.description) doc += `- **説明**: ${rules.description}\n`
    doc += '\n'
  }

  doc += '## 推奨される環境変数\n\n'
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.recommended)) {
    doc += `### ${key}\n`
    doc += `- **必須**: いいえ\n`
    if (rules.description) doc += `- **説明**: ${rules.description}\n`
    if (rules.type) doc += `- **型**: ${rules.type}\n`
    if (rules.minLength) doc += `- **最小長**: ${rules.minLength}\n`
    if (rules.maxLength) doc += `- **最大長**: ${rules.maxLength}\n`
    doc += '\n'
  }

  doc += '## セキュリティ関連の環境変数\n\n'
  for (const [key, rules] of Object.entries(ENV_VALIDATION_RULES.security)) {
    doc += `### ${key}\n`
    doc += `- **必須**: いいえ\n`
    doc += `- **型**: セキュリティ機密\n`
    if (rules.description) doc += `- **説明**: ${rules.description}\n`
    doc += '\n'
  }

  return doc
}

/**
 * アプリケーション起動時に環境変数を検証
 */
export function validateOnStartup() {
  const result = validateEnvironmentVariables()

  if (result.errors.length > 0) {
    console.error('❌ Environment validation failed:')
    result.errors.forEach(error => console.error(`  - ${error}`))
    
    if (process.env.NODE_ENV === 'production') {
      process.exit(1)
    }
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️  Environment validation warnings:')
    result.warnings.forEach(warning => console.warn(`  - ${warning}`))
  }

  if (result.errors.length === 0) {
    console.log('✅ Environment validation passed')
  }

  return result
}

export default {
  validateEnvironmentVariables,
  validateOnStartup,
  generateEnvDocumentation
}
