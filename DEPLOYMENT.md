# デプロイガイド

## 概要

NotionNext は多様なデプロイ方法をサポートしています。本ガイドでは、各デプロイオプションとベストプラクティスについて詳しく説明します。

## デプロイ前の準備

### 1. 環境変数の設定

`.env.local` ファイルを作成し、必要な環境変数を設定します：

```bash
# 必須設定
NOTION_PAGE_ID=your-notion-page-id

# 推奨設定
NEXT_PUBLIC_TITLE=あなたのブログタイトル
NEXT_PUBLIC_DESCRIPTION=あなたのブログの説明
NEXT_PUBLIC_AUTHOR=著者名
NEXT_PUBLIC_LINK=https://yourdomain.com

# オプション設定
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_ANALYTICS_GOOGLE_ID=G-XXXXXXXXXX
```

### 2. ビルドテスト

デプロイ前に、プロジェクトが正常にビルドできることを確認します：

```bash
npm run build
npm run start
```

### 3. 品質チェック

総合的な品質チェックを実行します：

```bash
npm run quality
```

## Vercel デプロイ（推奨）

Vercel は Next.js の公式デプロイプラットフォームであり、最高のパフォーマンスと開発体験を提供します。

### 自動デプロイ

1. **GitHub と連携**
   - [Vercel](https://vercel.com) にアクセスします。
   - GitHub アカウントでログインします。
   - NotionNext リポジトリをインポートします。

2. **環境変数の設定**
   - Vercel のプロジェクト設定で環境変数を追加します。
   - 少なくとも `NOTION_PAGE_ID` の設定が必要です。

3. **デプロイ**
   - Vercel が自動的に Next.js プロジェクトを検出します。
   - メインブランチにプッシュするたびに自動的にデプロイされます。

### 手動デプロイ

```bash
# Vercel CLI のインストール
npm i -g vercel

# ログイン
vercel login

# デプロイ
vercel

# 本番デプロイ
vercel --prod
```

### Vercel 設定ファイル

詳細な設定を行うために `vercel.json` ファイルを作成できます：

```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/feed",
      "destination": "/rss.xml",
      "permanent": true
    }
  ]
}
```

## Netlify デプロイ

### 自動デプロイ

1. **リポジトリと連携**
   - [Netlify](https://netlify.com) にアクセスします。
   - GitHub リポジトリと連携します。

2. **ビルド設定**
   - Build command: `npm run build`
   - Publish directory: `out`
   - 環境変数: `EXPORT=true`

3. **環境変数の設定**
   - Netlify の設定画面で環境変数を追加します。

### 手動デプロイ

```bash
# 静的ファイルのビルド
npm run export

# Netlify CLI のインストール
npm install -g netlify-cli

# ログイン
netlify login

# デプロイ
netlify deploy --dir=out

# 本番デプロイ
netlify deploy --prod --dir=out
```

### Netlify 設定ファイル

`netlify.toml` ファイルを作成します：

```toml
[build]
  command = "npm run export"
  publish = "out"

[build.environment]
  EXPORT = "true"
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/feed"
  to = "/rss.xml"
  status = 301
```

## Docker デプロイ

### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NOTION_PAGE_ID=${NOTION_PAGE_ID}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

volumes:
  redis_data:
```

### デプロイコマンド

```bash
# イメージのビルド
docker build -t notionnext .

# コンテナの実行
docker run -p 3000:3000 -e NOTION_PAGE_ID=your-id notionnext

# Docker Compose を使用
docker-compose up -d
```

## 静的エクスポート (Static Export) デプロイ

GitHub Pages、Cloudflare Pages などの静的ホスティングサービスに適しています。

### 静的ファイルのビルド

```bash
npm run export
```

### GitHub Pages デプロイ

1. **GitHub Actions の設定**

`.github/workflows/deploy.yml` を作成します：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build
      run: npm run export
      env:
        NOTION_PAGE_ID: ${{ secrets.NOTION_PAGE_ID }}
        
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./out
```

2. **Secrets の設定**
   - GitHub リポジトリの Settings で `NOTION_PAGE_ID` を追加します。

## パフォーマンス最適化

### 1. キャッシュ設定

```bash
# Redis キャッシュ
REDIS_URL=redis://localhost:6379

# メモリキャッシュ
ENABLE_CACHE=true
```

### 2. CDN 設定

```bash
# 画像 CDN
NEXT_PUBLIC_IMAGE_CDN=https://cdn.example.com

# 静的リソース CDN
NEXT_PUBLIC_STATIC_CDN=https://static.example.com
```

### 3. 圧縮と最適化

```bash
# 圧縮の有効化
NEXT_PUBLIC_COMPRESS=true

# 画像の最適化
NEXT_PUBLIC_IMAGE_OPTIMIZE=true
```

## 監視とログ

### 1. エラー監視

```bash
# Sentry
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn

# LogRocket
NEXT_PUBLIC_LOGROCKET_ID=your-logrocket-id
```

### 2. パフォーマンス監視

```bash
# Vercel Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS=true

# Google Analytics
NEXT_PUBLIC_ANALYTICS_GOOGLE_ID=G-XXXXXXXXXX
```

## トラブルシューティング

### よくある問題

1. **ビルドの失敗**
   ```bash
   # キャッシュのクリア
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **環境変数の問題**
   ```bash
   # 環境変数のチェック
   npm run quality
   ```

3. **メモリ不足**
   ```bash
   # Node.js のメモリ制限を増やす
   NODE_OPTIONS="--max-old-space-size=4096" npm run build
   ```

### デバッグモード

```bash
# デバッグを有効にしてビルド
DEBUG=* npm run build

# Next.js デバッグ
NEXT_DEBUG=true npm run dev
```

## セキュリティチェックリスト

- [ ] 環境変数が正しく設定されている
- [ ] 機密情報がクライアント側に露出していない
- [ ] HTTPS が有効になっている
- [ ] セキュリティヘッダーが設定されている
- [ ] 依存パッケージに脆弱性がない
- [ ] アクセスログが有効になっている
- [ ] エラー監視が設定されている

## バックアップと復元

### データのバックアップ

```bash
# Notion データのバックアップ
npm run backup-notion

# 設定ファイルのバックアップ
tar -czf config-backup.tar.gz .env.local blog.config.js
```

### 復元フロー

1. コードリポジトリを復元する
2. 環境変数の設定を復元する
3. アプリケーションを再デプロイする
4. 機能が正常であることを確認する

## 更新とメンテナンス

### 定期メンテナンス

```bash
# 依存関係の更新チェック
npm run check-updates

# 依存関係の更新
npm update

# セキュリティ監査
npm audit

# パフォーマンス分析
npm run analyze
```

### バージョンアップ

1. 現在のバージョンをバックアップする
2. コードを更新する
3. 新機能をテストする
4. 本番環境にデプロイする
5. 稼働状態を監視する
