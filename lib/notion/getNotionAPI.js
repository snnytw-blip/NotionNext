import { NotionAPI as NotionLibrary } from 'notion-client'
import BLOG from '@/blog.config'
import path from 'path'
import { RateLimiter } from './RateLimiter'

// Rate limiter config
const useRateLimiter = process.env.BUILD_MODE || process.env.EXPORT
const lockFilePath = path.resolve(process.cwd(), '.notion-api-lock')
const rateLimiter = new RateLimiter(60, lockFilePath)

const globalStore = { notion: null, inflight: new Map() }

function getRawNotion() {
  console.log('[DEBUG NOTION] authToken length:', (BLOG.NOTION_TOKEN_V2 || '').length, 'activeUser:', BLOG.NOTION_ACTIVE_USER ? 'set' : 'not set')
  if (!globalStore.notion) {
    globalStore.notion = new NotionLibrary({
      apiBaseUrl: BLOG.API_BASE_URL || 'https://www.notion.so/api/v3',
      activeUser: BLOG.NOTION_ACTIVE_USER || null,
      authToken: BLOG.NOTION_TOKEN_V2 || null,
      userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      kyOptions: {
        mode: 'cors',
        hooks: {
          beforeRequest: [
            (request) => {
              const url = request.url.toString()
              if (url.includes('queryCollection') || url.includes('syncRecordValues') || url.includes('getRecordValues') || url.includes('loadPageChunk')) {
                console.log('[DEBUG REQUEST]', url)
              }
              // ★ syncRecordValuesMain リライトを無効化（Notionが子ページデータを返さなくなる問題の切り分け）
                            // if (url.includes('/api/v3/syncRecordValues')) {
                            //   return new Request(
                            //     url.replace('/api/v3/syncRecordValues', '/api/v3/syncRecordValuesMain'),
                            //     request
                            //   )
                            // }
              return request
            }
          ]
        }
      }
    })
  }
  return globalStore.notion
}

async function callNotion(methodName, ...args) {
  const notion = getRawNotion()
  const original = notion[methodName]
  if (typeof original !== 'function') throw new Error(`${methodName} is not a function`)

  const key = `${methodName}-${JSON.stringify(args)}`

  if (globalStore.inflight.has(key)) return globalStore.inflight.get(key)

  const execute = async () => original.apply(notion, args)
  const promise = useRateLimiter
    ? rateLimiter.enqueue(key, execute)
    : execute()

  globalStore.inflight.set(key, promise)
  promise.finally(() => globalStore.inflight.delete(key))
  return promise
}

export const notionAPI = {
  getPage: (...args) => callNotion('getPage', ...args),
  getBlocks: (...args) => callNotion('getBlocks', ...args),
  getUsers: (...args) => callNotion('getUsers', ...args),
  getCollectionData: (...args) => callNotion('getCollectionData', ...args),
  __call: callNotion
}

export default notionAPI