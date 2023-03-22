<template>
  <div class="downloadable-detail">
    <div class="title">{{ title }}</div>
    <div class="value">{{ value }}</div>
  </div>
</template>

<script>
export default {
  name: 'DownloadableDetail',
  props: {
    title: String,
    value: String,
  },
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
  width: 25%;
  flex-shrink: 0;
  color: rgba(0, 0, 0, 0.5);
}

#app.dark .downloadable-detail .title {
  color: rgba(255, 255, 255, 0.5);
}

.downloadable-detail .value {
  width: 75%;
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