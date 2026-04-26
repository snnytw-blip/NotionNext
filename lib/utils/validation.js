/**
 * 入力バリデーションユーティリティクラス
 * 各種データのバリデーションとサニタイズ機能を提供します
 */

// よく使用される正規表現
const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  notionId: /^[a-f0-9]{8}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{4}-?[a-f0-9]{12}$/i,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  phoneNumber: /^[\+]?[1-9][\d]{0,15}$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
}

// XSS対策
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<link\b[^<]*(?:(?!<\/link>)<[^<]*)*<\/link>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /data:text\/html/gi,
  /on\w+\s*=/gi
]

/**
 * バリデータークラス
 */
export class Validator {
  /**
   * メールアドレスを検証
   * @param {string} email 
   * @returns {boolean}
   */
  static isValidEmail(email) {
    if (!email || typeof email !== 'string') return false
    return REGEX_PATTERNS.email.test(email.trim())
  }

  /**
   * URLを検証
   * @param {string} url 
   * @returns {boolean}
   */
  static isValidUrl(url) {
    if (!url || typeof url !== 'string') return false
    return REGEX_PATTERNS.url.test(url.trim())
  }

  /**
   * Slug（URLフレンドリーな文字列）を検証
   * @param {string} slug 
   * @returns {boolean}
   */
  static isValidSlug(slug) {
    if (!slug || typeof slug !== 'string') return false
    return REGEX_PATTERNS.slug.test(slug.trim())
  }

  /**
   * Notion IDを検証
   * @param {string} id 
   * @returns {boolean}
   */
  static isValidNotionId(id) {
    if (!id || typeof id !== 'string') return false
    return REGEX_PATTERNS.notionId.test(id.trim())
  }

  /**
   * 16進数カラーコードを検証
   * @param {string} color 
   * @returns {boolean}
   */
  static isValidHexColor(color) {
    if (!color || typeof color !== 'string') return false
    return REGEX_PATTERNS.hexColor.test(color.trim())
  }

  /**
   * IPアドレスを検証
   * @param {string} ip 
   * @returns {boolean}
   */
  static isValidIpAddress(ip) {
    if (!ip || typeof ip !== 'string') return false
    return REGEX_PATTERNS.ipAddress.test(ip.trim())
  }

  /**
   * ユーザー名を検証
   * @param {string} username 
   * @returns {boolean}
   */
  static isValidUsername(username) {
    if (!username || typeof username !== 'string') return false
    return REGEX_PATTERNS.username.test(username.trim())
  }

  /**
   * パスワード強度を検証
   * @param {string} password 
   * @returns {boolean}
   */
  static isValidPassword(password) {
    if (!password || typeof password !== 'string') return false
    return REGEX_PATTERNS.password.test(password)
  }

  /**
   * 文字列長を検証
   * @param {string} str 
   * @param {number} min 
   * @param {number} max 
   * @returns {boolean}
   */
  static isValidLength(str, min = 0, max = Infinity) {
    if (typeof str !== 'string') return false
    const length = str.trim().length
    return length >= min && length <= max
  }

  /**
   * 数値範囲を検証
   * @param {number} num 
   * @param {number} min 
   * @param {number} max 
   * @returns {boolean}
   */
  static isValidNumber(num, min = -Infinity, max = Infinity) {
    if (typeof num !== 'number' || isNaN(num)) return false
    return num >= min && num <= max
  }

  /**
   * 配列を検証
   * @param {any} arr 
   * @param {number} minLength 
   * @param {number} maxLength 
   * @returns {boolean}
   */
  static isValidArray(arr, minLength = 0, maxLength = Infinity) {
    if (!Array.isArray(arr)) return false
    return arr.length >= minLength && arr.length <= maxLength
  }
}

/**
 * サニタイザー（データクリーニング）クラス
 */
export class Sanitizer {
  /**
   * HTMLタグを削除
   * @param {string} str 
   * @returns {string}
   */
  static stripHtml(str) {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/<[^>]*>/g, '')
  }

  /**
   * XSS対策のサニタイズ
   * @param {string} str 
   * @returns {string}
   */
  static sanitizeXss(str) {
    if (!str || typeof str !== 'string') return ''
    
    let cleaned = str
    XSS_PATTERNS.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '')
    })
    
    return cleaned
  }

  /**
   * SQLインジェクション対策のサニタイズ
   * @param {string} str 
   * @returns {string}
   */
  static sanitizeSql(str) {
    if (!str || typeof str !== 'string') return ''
    
    // 一般的なSQLインジェクションパターンを削除
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|\/\*|\*\/|;|'|"|`)/g,
      /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/gi
    ]
    
    let cleaned = str
    sqlPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '')
    })
    
    return cleaned.trim()
  }

  /**
   * ファイル名をサニタイズ
   * @param {string} filename 
   * @returns {string}
   */
  static sanitizeFilename(filename) {
    if (!filename || typeof filename !== 'string') return ''
    
    return filename
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // 不正な文字を削除
      .replace(/^\.+/, '') // 先頭のドットを削除
      .replace(/\.+$/, '') // 末尾のドットを削除
      .replace(/\s+/g, '_') // スペースをアンダースコアに置換
      .substring(0, 255) // 長さを制限
  }

  /**
   * URLをサニタイズ
   * @param {string} url 
   * @returns {string}
   */
  static sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return ''
    
    // httpとhttpsプロトコルのみを許可
    if (!url.match(/^https?:\/\//)) {
      return ''
    }
    
    try {
      const urlObj = new URL(url)
      return urlObj.toString()
    } catch {
      return ''
    }
  }

  /**
   * HTMLエンティティをエスケープ
   * @param {string} str 
   * @returns {string}
   */
  static escapeHtml(str) {
    if (!str || typeof str !== 'string') return ''
    
    const htmlEntities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;'
    }
    
    return str.replace(/[&<>"'/]/g, char => htmlEntities[char])
  }

  /**
   * JSONをサニタイズして検証
   * @param {string} jsonStr 
   * @returns {object|null}
   */
  static sanitizeJson(jsonStr) {
    if (!jsonStr || typeof jsonStr !== 'string') return null
    
    try {
      const parsed = JSON.parse(jsonStr)
      // オブジェクト内の文字列値を再帰的にサニタイズ
      return this.deepSanitizeObject(parsed)
    } catch {
      return null
    }
  }

  /**
   * オブジェクトを深度サニタイズ
   * @param {any} obj 
   * @returns {any}
   */
  static deepSanitizeObject(obj) {
    if (typeof obj === 'string') {
      return this.sanitizeXss(obj)
    } else if (Array.isArray(obj)) {
      return obj.map(item => this.deepSanitizeObject(item))
    } else if (obj && typeof obj === 'object') {
      const cleaned = {}
      for (const [key, value] of Object.entries(obj)) {
        const cleanKey = this.sanitizeXss(key)
        cleaned[cleanKey] = this.deepSanitizeObject(value)
      }
      return cleaned
    }
    return obj
  }
}

/**
 * レートリミッター（流量制限）
 */
export class RateLimiter {
  constructor() {
    this.requests = new Map()
  }

  /**
   * レート制限を超えているかチェック
   * @param {string} identifier 識別子（IP、ユーザーIDなど）
   * @param {number} limit 制限回数
   * @param {number} windowMs 時間枠（ミリ秒）
   * @returns {boolean}
   */
  isRateLimited(identifier, limit = 100, windowMs = 60000) {
    const now = Date.now()
    const windowStart = now - windowMs
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }
    
    const userRequests = this.requests.get(identifier)
    
    // 期限切れのリクエスト記録をクリーンアップ
    const validRequests = userRequests.filter(timestamp => timestamp > windowStart)
    this.requests.set(identifier, validRequests)
    
    // 检查是否超过限制
    if (validRequests.length >= limit) {
      return true
    }
    
    // 记录当前请求
    validRequests.push(now)
    return false
  }

  /**
   * 期限切れの記録をクリーンアップ
   */
  cleanup() {
    const now = Date.now()
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > now - 3600000) // 1時間分
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

// グローバルレートリミッターインスタンスを作成
export const globalRateLimiter = new RateLimiter()

// 定期的に期限切れ記録をクリーンアップ
if (typeof window === 'undefined') { // サーバーサイドでのみ実行
  setInterval(() => {
    globalRateLimiter.cleanup()
  }, 300000) // 5分ごとにクリーンアップ
}

export default { Validator, Sanitizer, RateLimiter, globalRateLimiter }
