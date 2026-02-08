import configPrettier from 'eslint-config-prettier/flat'
import { includeIgnoreFile } from '@eslint/compat'
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const gitignorePath = path.resolve(__dirname, '.gitignore')

export default defineConfigWithVueTs(
  {
    rules: {
      'vue/attributes-order': 'error',
      'vue/v-bind-style': ['error', 'shorthand'],
      'vue/v-on-style': ['error', 'shorthand']
    }
  },
  includeIgnoreFile(gitignorePath),
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommendedTypeChecked,
  configPrettier
)
