<template>
  <div class="flex h-full w-full flex-col">
    <div
      class="h-full w-full flex-grow overflow-auto"
      @scroll.passive="handleScroll"
      ref="scrollContainer"
    >
      <div class="mx-auto min-w-0 max-w-[756px] px-8">
        <template v-if="model">
          <template v-for="change in buildsChanges" :key="change.id">
            <changes-group v-bind="change"></changes-group>
          </template>
        </template>
        <template v-else>
          <changes-group
            v-bind="{
              items: changes
            }"
          ></changes-group>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ChangesGroup from './ChangesGroup.vue'
import ApiService from '../../js/ApiService'
import { beforeTryError } from '../../js/router_utils'

const loadDeviceBuildsBeforeHook = beforeTryError((to) => {
  if (!to.params.model) {
    return
  }

  return ApiService.loadDeviceBuilds(to.params.model)
})

export default {
  name: 'ChangesTabPage',
  components: {
    ChangesGroup
  },
  props: {
    model: String
  },
  data() {
    return {
      buildsChanges: [],
      stopLoading: false
    }
  },
  computed: {
    changes() {
      return this.$store.getters.changes
    }
  },
  beforeRouteEnter: loadDeviceBuildsBeforeHook,
  beforeRouteUpdate: loadDeviceBuildsBeforeHook,
  watch: {
    model() {
      this.reloadDeviceChanges()
      this.loadMoreChanges()
    },
    changes() {
      this.reloadDeviceChanges()
    }
  },
  mounted() {
    this.loadMoreChanges()
  },
  methods: {
    reloadDeviceChanges() {
      if (this.model) {
        this.buildsChanges = ApiService.getDeviceChanges(this.model)
      }
    },
    handleScroll() {
      const scrollContainer = this.$refs.scrollContainer
      const isAtBottom =
        scrollContainer.scrollTop + scrollContainer.clientHeight === scrollContainer.scrollHeight
      if (isAtBottom && !this.stopLoading) {
        this.loadMoreChanges()
      }
    },
    async loadMoreChanges() {
      try {
        await ApiService.loadMoreChanges()
      } catch (err) {
        console.error(err)
      }
    }
  }
}
</script>
