module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'plugin:react/jsx-runtime',
    'plugin:react/recommended',
    'plugin:@next/next/recommended',
    'next',
    'prettier',
    'plugin:@typescript-eslint/recommended', // TypeScript推奨ルールの追加
    'plugin:@typescript-eslint/recommended-requiring-type-checking' // 型チェックが必要なルールの追加
  ],
  parser: '@typescript-eslint/parser', // TypeScriptパーサーを使用
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module',
    project: './tsconfig.eslint.json' // 新しいESLint設定ファイルを指定
  },
  plugins: [
    'react',
    'react-hooks',
    'prettier',
    '@typescript-eslint' // TypeScriptプラグインを追加
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    semi: 0,
    'react/no-unknown-property': 'off', // <style jsx>
    'react/prop-types': 'off',
    'space-before-function-paren': 0,
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    '@typescript-eslint/no-unused-vars': 'off', // 未使用変数のエラーを無効化
    '@typescript-eslint/explicit-function-return-type': 'off' // 関数の戻り値型の強制を無効化
  },
  overrides: [
    {
      files: ['.eslintrc.js'],
      parser: null // .eslintrc.jsファイルにTypeScriptパーサーを使用しないようにする
    },
    {
      files: ['**/*.js'], // すべての.jsファイルにマッチ。JSのコード規約チェックは緩やかに設定
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/no-unsafe-return': 'off'
      }
    }
  ],
  globals: {
    React: true
  }
}
