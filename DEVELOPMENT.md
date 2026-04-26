# 開発者ガイド

## クイックスタート

### 環境要件

- Node.js >= 16.0.0
- npm >= 8.0.0
- Git

### 開発環境の初期化

```bash
# プロジェクトをクローン
git clone <repository-url>
cd NotionNext

# 開発環境の初期化
npm run init-dev

# 開発サーバーの起動
npm run dev
```

## 開発ツール

### コード品質ツール

```bash
# コードのフォーマット
npm run format

# コードのチェック (Lint)
npm run lint

# 型チェック
npm run type-check

# 総合品質チェック
npm run quality

# コミット前チェック
npm run pre-commit
```

### 開発補助ツール

```bash
# すべての開発ツールコマンドを表示
npm run dev-tools

# プロジェクトファイルのクリーンアップ
npm run clean

# コンポーネントテンプレートの生成
npm run dev-tools generate:component MyComponent

# パッケージサイズの分析
npm run dev-tools analyze

# 依存関係の更新チェック
npm run check-updates

# プロジェクトドキュメントの生成
npm run docs
```

### Git Hooks

```bash
# Gitフックのインストール
npm run setup-hooks

# フックの状態を確認
npm run check-hooks

# Gitフックの削除
npm run remove-hooks
```

## プロジェクト構造

```
NotionNext/
├── components/          # Reactコンポーネント
├── pages/              # Next.jsページ
├── lib/                # ユーティリティライブラリと設定
│   ├── config/         # 設定ファイル
│   ├── utils/          # 共通関数
│   ├── middleware/     # ミドルウェア
│   └── cache/          # キャッシュ関連
├── themes/             # テーマファイル
├── conf/               # 設定ファイル
├── scripts/            # ビルドおよび開発用スクリプト
├── types/              # TypeScript型定義
├── .vscode/            # VSCode設定
└── docs/               # プロジェクトドキュメント
```

## コーディング規約

### コードスタイル

- Prettier を使用したコードフォーマット
- ESLint を使用したコードチェック
- TypeScript を使用した型チェック
- React Hooks のベストプラクティスに準拠

### 命名規則

- **コンポーネント**: PascalCase (例: `LazyImage`)
- **ファイル**: kebab-case (例: `lazy-image.js`)
- **変数/関数**: camelCase (例: `getUserData`)
- **定数**: UPPER_SNAKE_CASE (例: `API_BASE_URL`)

### コミットメッセージ規約

Conventional Commits 規約に従ってください:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**タイプ (type):**
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントの更新
- `style`: コードフォーマットの変更
- `refactor`: リファクタリング
- `test`: テストの追加・更新
- `chore`: ビルドツールや補助ツールの変更
- `perf`: パフォーマンス向上
- `ci`: CI設定やスクリプトの変更
- `build`: ビルドシステムや外部依存関係への影響がある変更
- `revert`: 以前のコミットの取り消し

**例:**
```
feat(auth): ユーザー認証機能の追加
fix(ui): ボタンの配置崩れを修正
docs: インストールガイドを更新
```

## 開発フロー

### 1. 機能ブランチの作成

```bash
git checkout -b feature/your-feature-name
```

### 2. 開発とテスト

```bash
# 開発サーバーの起動
npm run dev

# 品質チェックの実行
npm run quality

# テストの実行
npm test
```

### 3. コードのコミット

```bash
# ファイルの追加
git add .

# コミット（pre-commitフックが自動実行されます）
git commit -m "feat: 新機能を追加"
```

### 4. コードのプッシュ

```bash
# プッシュ（pre-pushフックが自動実行されます）
git push origin feature/your-feature-name
```

## デバッグガイド

### VSCodeでのデバッグ

プロジェクトにはVSCodeのデバッグ環境が設定されており、以下のモードをサポートしています:

- **Next.js: debug server-side** - サーバーサイドコードのデバッグ
- **Next.js: debug client-side** - クライアントサイドコードのデバッグ
- **Next.js: debug full stack** - フルスタックデバッグ
- **Jest: debug tests** - テストのデバッグ

### ブラウザでのデバッグ

```bash
# デバッグモードで起動
npm run dev

# ブラウザで開発者ツールを開く
# http://localhost:3000 にアクセス
```

### パフォーマンス分析

```bash
# パッケージサイズの分析
npm run bundle-report

# パフォーマンスレポートの生成
npm run analyze
```

## 環境変数

### 必須の環境変数

- `NOTION_PAGE_ID`: NotionのページID

### オプションの環境変数

- `NEXT_PUBLIC_TITLE`: サイトタイトル
- `NEXT_PUBLIC_DESCRIPTION`: サイトの説明
- `NEXT_PUBLIC_AUTHOR`: 著者名
- `NEXT_PUBLIC_LINK`: サイトのリンク

### 環境変数の検証

```bash
# 環境変数設定の検証
npm run quality
```

## よくある質問 (FAQ)

### 1. 依存関係のインストールに失敗する

```bash
# キャッシュのクリア
npm run clean
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### 2. ビルドに失敗する

```bash
# コード品質のチェック
npm run quality

# クリーンアップして再ビルド
npm run clean
npm run build
```

### 3. 型エラーが発生する

```bash
# 型チェックの実行
npm run type-check

# 詳細なエラー情報の表示
npx tsc --noEmit --pretty
```

### 4. ESLintエラーが発生する

```bash
# ESLintエラーの自動修正
npm run lint:fix

# すべてのESLintルールを表示
npx eslint --print-config .
```

## コントリビューションガイド

1. プロジェクトをフォークする
2. 機能ブランチを作成する
3. 変更をコミットする
4. ブランチをプッシュする
5. プルリクエスト (Pull Request) を作成する

### プルリクエストの要件

- すべての品質チェックをパスしていること
- 適切なテストが含まれていること
- 関連するドキュメントが更新されていること
- コミットメッセージ規約に従っていること

## 関連リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [React ドキュメント](https://reactjs.org/docs)
- [Tailwind CSS ドキュメント](https://tailwindcss.com/docs)
- [Notion API ドキュメント](https://developers.notion.com/)

## ヘルプが必要な場合

- プロジェクトドキュメントを確認: `npm run docs`
- 開発ツールを確認: `npm run dev-tools`
- Issue または Pull Request を作成
