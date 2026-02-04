<template>
  <div class="builds-tab-page flex h-full w-full flex-col">
    <div v-if="builds.length > 0" class="h-full w-full grow overflow-auto">
      <div class="mx-auto max-w-189 min-w-0 px-8">
        <div class="flex flex-col items-start gap-4 px-4 py-10 @min-[480px]:px-6">
          <h1 class="m-0 flex-none self-stretch text-[32px] leading-9.5 font-medium">
            Download builds
          </h1>
          <p class="order-1 flex-none grow-0 self-stretch">
            Not all images are necessary for installation or upgrades. Check your device's
            <a class="text-brand-primary font-medium no-underline" :href="info_url" target="_blank"
              >wiki guides</a
            >
            for more info.<br />
            You can verify that a file has not been tampered by
            <RouterLink class="tab" :to="{ name: 'home_verify' }">
              checking its signature </RouterLink
            >.
          </p>
        </div>
        <div class="list-label px-4 pt-0 pb-4 text-2xl leading-7 font-medium @min-[480px]:px-6">
          Latest
        </div>
        <DownloadableGroup
          v-for="(build, idx) in builds"
          :key="build.id"
          :items="build.files"
          :class="{ 'rounded-2xl border border-black/25 dark:border-white/25': idx === 0 }"
        />
      </div>
    </div>
    <div v-else class="flex h-100 items-center justify-center text-center text-2xl">
      <span>
        This device doesn't have any builds available, please see
        <a
          class="text-brand-primary no-underline"
          href="https://wiki.lineageos.org/faq#my-device-is-officially-supported-but-theres-no-zips-for-it-on-the-download-page-where-are-they"
          target="_blank"
        >
          FAQ
        </a>
        for more info
      </span>
    </div>
  </div>
</template>

<script>
import ApiService from '../../js/ApiService'
import { beforeTryError } from '../../js/router_utils'
import DownloadableGroup from '../downloadable/DownloadableGroup.vue'

const loadDeviceBuildsBeforeHook = beforeTryError((to) => {
  return ApiService.loadDeviceBuilds(to.params.model)
})

export default {
  name: 'BuildsTab',
  components: {
    DownloadableGroup
  },
  props: {
    model: String
  },
  data() {
    return {
      builds: []
    }
  },
  beforeRouteEnter: loadDeviceBuildsBeforeHook,
  beforeRouteUpdate: loadDeviceBuildsBeforeHook,
  watch: {
    model() {
      this.loadBuilds()
      this.loadDeviceDetails()
    }
  },
  mounted() {
    this.loadBuilds()
    this.loadDeviceDetails()
  },
  methods: {
    async loadBuilds() {
      const data = this.$store.getters.getDeviceBuilds(this.model)
      if (!data) {
        throw new Error('Failed to get device-main builds-tab')
      }

      this.builds = data
    },
    loadDeviceDetails() {
      const data = this.$store.getters.getDevice(this.model)
      if (!data) {
        throw new Error('Failed to get device-main data')
      }

      ;['info_url'].forEach((k) => (this[k] = data[k]))
    }
  }
}
</script>
