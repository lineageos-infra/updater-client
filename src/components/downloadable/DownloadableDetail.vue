<template>
  <div class="block lg:flex">
    <div class="block w-full shrink-0 opacity-50 lg:inline-block lg:w-1/5">{{ title }}</div>
    <div class="block w-full shrink-0 break-all lg:inline-block lg:w-4/5">
      {{ value }}
      <div v-if="title == 'SHA256'">
        <a class="text-brand-primary no-underline" href="#" @click="compareSha256">Compare</a>
        <input ref="input" class="hidden" type="file" />
      </div>
    </div>
  </div>
  <ConfirmDialog
    :open="dialog.open"
    :title="dialog.title"
    confirm-label="OK"
    @confirm="dialog.open = false"
    @cancel="dialog.open = false"
  >
    {{ dialog.message }}
  </ConfirmDialog>
</template>

<script setup lang="ts">
import { useTemplateRef, reactive } from 'vue'
import ConfirmDialog from '@/components/utils/ConfirmDialog.vue'
import CryptoService from '@/services/CryptoService'

const props = defineProps<{
  title: string
  value: string
}>()

const input = useTemplateRef('input')
const dialog = reactive({ open: false, title: '', message: '' })

function showDialog(title: string, message: string) {
  dialog.title = title
  dialog.message = message
  dialog.open = true
}

function compareSha256(event: PointerEvent) {
  event.preventDefault()
  if (!input.value) return
  input.value.onchange = async () => {
    const file = input.value?.files?.[0]
    if (!file) return
    try {
      const hashString = await CryptoService.sha256(file)
      if (props.value !== hashString) {
        showDialog('SHA256 Mismatch', `Expected: ${props.value}\n\nGot: ${hashString}`)
      } else {
        showDialog('SHA256', 'Matches')
      }
    } catch (err) {
      showDialog('SHA256 Error', err instanceof Error ? err.message : String(err))
    }
  }
  input.value.value = ''
  input.value.click()
}
</script>
