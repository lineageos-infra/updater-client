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
</template>

<script setup>
import { useTemplateRef } from 'vue'
defineProps({
  title: String,
  value: String
})

const input = useTemplateRef('input')

function compareSha256(event) {
  event.preventDefault()
  input.value.onchange = () => {
    const fileReader = new FileReader()
    fileReader.onload = async () => {
      const hash = await crypto.subtle.digest('SHA-256', fileReader.result)
      const hashString = [...new Uint8Array(hash)]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')

      if (this.$props.value !== hashString) {
        alert(`SHA256: ${this.$props.value} != ${hashString}`)
      } else {
        alert('SHA256: OK')
      }
    }
    fileReader.readAsArrayBuffer(input.value.files[0])
  }
  input.value.click()
}
</script>
