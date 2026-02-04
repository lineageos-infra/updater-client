<template>
  <RouterView id="sidebar" name="sidebar"></RouterView>
  <RouterView id="main" name="main"></RouterView>
  <horizontal-loader v-if="anyLoading" id="loader"></horizontal-loader>
</template>

<script setup>
import HorizontalLoader from './components/utils/HorizontalLoader.vue'
import store from './store'
import { computed } from 'vue'

const anyLoading = computed(() => !!store.getters.ongoingRequests)
</script>

<style>
#app {
  height: 100%;
  width: 100%;

  display: flex;

  font-family: 'Roboto', sans-serif;
}

#sidebar {
  width: 300px;
  max-width: 30%;
  min-width: 128px;
  height: 100%;
}

#main {
  flex-grow: 1;
  height: 100%;
  width: 100%;
}

#loader {
  position: absolute;
  bottom: 0;
  left: 0;
}

@media (max-width: 1024px) {
  #sidebar {
    display: none;
  }
}
</style>
