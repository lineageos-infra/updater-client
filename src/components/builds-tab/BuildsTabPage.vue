<template>
  <div class="builds-tab-page flex h-full w-full flex-col">
    <div class="h-full w-full flex-grow overflow-y-auto" v-if="builds.length > 0">
      <div class="mx-auto min-w-0 max-w-[756px] px-8">
        <div class="header">
          <h1>Download builds</h1>
          <p>
            Not all images are necessary for installation or upgrades. Check your device's
            <a v-bind:href="info_url" target="_blank">wiki guides</a> for more info.<br />
            You can verify that a file has not been tampered by
            <router-link
              class="tab"
              v-bind:to="{
                name: 'home_verify'
              }"
            >
              checking its signature</router-link
            >.
          </p>
        </div>
        <div class="list-label">Latest</div>
        <downloadable-group
          v-for="(build, idx) in builds"
          :key="build.id"
          :items="build.files"
          :class="{ 'rounded-2xl border border-opacity-25 dark:border-opacity-25': idx === 0 }"
        >
        </downloadable-group>
      </div>
    </div>
    <div class="list-placeholder" v-else>
      <span>
        This device doesn't have any builds available, please see
        <a
          href="https://wiki.lineageos.org/faq#my-device-is-officially-supported-but-theres-no-zips-for-it-on-the-download-page-where-are-they"
          target="_blank"
        >
          wiki
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

<style scoped>
.builds-tab-page .list-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 24px;
  height: 100%;
}

.builds-tab-page .list-placeholder a {
  text-decoration: none;
  color: #167c80;
}

.builds-tab-page .header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 40px 24px;
  gap: 16px;
}

.builds-tab-page .header h1 {
  flex: none;
  align-self: stretch;
  font-size: 32px;
  line-height: 38px;
  margin: 0;
  font-weight: 500;
}

.builds-tab-page .header p {
  flex: none;
  order: 1;
  align-self: stretch;
  flex-grow: 0;
}

.builds-tab-page .header a {
  color: #167c80;
  text-decoration: none;
  font-weight: 500;
}

.builds-tab-page .list-label {
  font-size: 24px;
  line-height: 28px;
  padding: 0px 24px 16px;
  font-weight: 500;
}

@media (max-width: 479px) {
  .builds-tab-page .header {
    padding: 40px 16px;
  }

  .builds-tab-page .list-label {
    padding: 0px 16px 16px;
  }
}
</style>
