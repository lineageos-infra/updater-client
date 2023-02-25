<template>
  <div class="error-main">
    <span>{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'ErrorMain',
  props: {
    message: {
      type: String,
      default: 'An unknown error-main occurred',
    },
  },
  data() {
    return {
      message: this.$route.meta.message || this.message
    };
  },
}
</script>

<style scoped>
.error-main {
  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 24px;
}
</style>