<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-grow w-full h-full overflow-auto" ref="scrollable">
      <div class="min-w-0 max-w-[756px] mx-auto px-8">
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
import SimpleBar from 'simplebar'
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
      scrollbar: null,
      scrollable: null,
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
    },
    changes() {
      this.reloadDeviceChanges()
      this.checkScrolledToBottom()
    }
  },
  mounted() {
    this.stopLoading = false
    this.scrollbar = new SimpleBar(this.$refs.scrollable)
    this.scrollable = this.scrollbar.getScrollElement()
    this.scrollable.addEventListener('scroll', this.checkScrolledToBottom)

    this.checkScrolledToBottom()
  },
  unmounted() {
    this.scrollable.removeEventListener('scroll', this.checkScrolledToBottom)
    this.scrollbar.unMount()
    this.stopLoading = true
  },
  methods: {
    reloadDeviceChanges() {
      if (this.model) {
        this.buildsChanges = ApiService.getDeviceChanges(this.model)
      }
    },
    isScrolledToBottom(el) {
      return el.scrollHeight - el.scrollTop - el.clientHeight < 1
    },
    checkScrolledToBottom() {
      if (!this.isScrolledToBottom(this.scrollable)) {
        return
      }

      if (this.stopLoading) {
        return
      }

      this.loadMoreChanges()
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
