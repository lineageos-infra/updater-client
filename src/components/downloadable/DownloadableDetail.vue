<template>
  <div class="downloadable-detail">
    <div class="title opacity-50">{{ title }}</div>
    <div class="value">
      {{ value }}
      <div v-if="title == 'SHA256'">
        <a href="#" @click="compareSha256">Compare</a>
        <input ref="input" class="hidden" type="file" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DownloadableDetail',
  props: {
    title: String,
    value: String
  },
  methods: {
    compareSha256(event) {
      event.preventDefault()

      const input = this.$refs.input
      input.onchange = () => {
        const fileReader = new FileReader()
        fileReader.onload = async () => {
          const hash = await crypto.subtle.digest('SHA-256', await fileReader.result)
          const hashString = [...new Uint8Array(hash)]
            .map((x) => x.toString(16).padStart(2, '0'))
            .join('')

          if (this.$props.value !== hashString) {
            alert(`SHA256: ${this.$props.value} != ${hashString}`)
          } else {
            alert('SHA256: OK')
          }
        }
        fileReader.readAsArrayBuffer(input.files[0])
      }
      input.click()
    }
  }
}
</script>

<style scoped>
.downloadable-detail {
  display: flex;
}

.downloadable-detail .title,
.downloadable-detail .value {
  display: inline-block;
}

.downloadable-detail .title {
  width: 20%;
  flex-shrink: 0;
}

.downloadable-detail .value a {
  color: #167c80;
  text-decoration: none;
}

.downloadable-detail .value {
  width: 80%;
  flex-shrink: 0;
  word-wrap: break-word;
}

@media (max-width: 1024px) {
  .downloadable-detail {
    display: block;
  }

  .downloadable-detail .title,
  .downloadable-detail .value {
    display: block;
    width: 100%;
  }
}
</style>
