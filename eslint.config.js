import configPrettier from 'eslint-config-prettier/flat'
import globals from 'globals'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default [
  {
    files: ['**/*.vue', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest'
      }
    },
    rules: {
      'vue/v-bind-style': ['error', 'shorthand'],
      'vue/v-on-style': ['error', 'shorthand']
    }
  },
  includeIgnoreFile(gitignorePath),
  ...pluginVue.configs['flat/essential'],
  js.configs.recommended,
  configPrettier
]
