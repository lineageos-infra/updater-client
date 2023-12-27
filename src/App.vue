<template>
  <router-view id="sidebar" name="sidebar"></router-view>
  <router-view id="main" name="main"></router-view>
  <horizontal-loader id="loader" v-if="anyLoading"></horizontal-loader>
</template>

<script>
import HorizontalLoader from './components/utils/HorizontalLoader.vue'
import { applyAppTheme } from './js/ThemeUtils'

export default {
  name: 'App',
  components: {
    HorizontalLoader
  },
  mounted() {
    applyAppTheme()
  },
  computed: {
    anyLoading() {
      return !!this.$store.getters.ongoingRequests
    }
  }
}
</script>

<style>
#app {
  height: 100%;
  width: 100%;

  display: flex;

  font-family: 'Roboto', sans-serif;
  color: rgba(0, 0, 0, 0.87);
}

#app.dark {
  background: #121212;
  color: rgba(255, 255, 255, 0.87);
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
