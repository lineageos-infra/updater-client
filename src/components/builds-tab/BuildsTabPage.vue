<template>
  <div class="builds-tab-page tab-page">
    <div
        class="banner"
        v-if="!bannerHidden"
    >
      <div class="text">
        You can verify that a file has not been tampered with by checking its signature.
      </div>
      <div class="buttons">
        <a
            class="button"
            href="https://wiki.lineageos.org/verifying-builds.html"
            target="_blank"
        >
          Learn more
          <span class="mdi mdi-open-in-new"></span>
        </a>
        <a
            class="button"
            v-on:click="hideBanner"
        >
          Got it
        </a>
      </div>
    </div>
    <div
        class="list-container"
        data-simplebar
    >
      <div class="list">
        <template v-for="build in builds">
          <downloadable-group
              v-bind="{
                items: [
                    build,
                    build.recovery,
                ].filter((e) => e !== undefined),
              }"
          ></downloadable-group>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import ApiService from '../../js/ApiService';
import {beforeTryError} from '../../js/router_utils';
import DownloadableGroup from '../downloadable/DownloadableGroup.vue';

const VERIFY_BUILD_BANNER_HIDE = 'verify-build-banner-hide';

const loadDeviceBuildsBeforeHook = beforeTryError((to) => {
  return ApiService.loadDeviceBuilds(to.params.model);
});

export default {
  name: 'Builds',
  components: {
    DownloadableGroup,
  },
  props: {
    model: String,
  },
  data() {
    return {
      builds: [],
      bannerHidden: false,
    };
  },
  beforeRouteEnter: loadDeviceBuildsBeforeHook,
  beforeRouteUpdate: loadDeviceBuildsBeforeHook,
  watch: {
    model() {
      this.loadBuilds();
    },
  },
  mounted() {
    this.bannerHidden = this.isBannerHidden();
    this.loadBuilds();
  },
  methods: {
    isBannerHidden() {
      return localStorage.getItem(VERIFY_BUILD_BANNER_HIDE) === '1';
    },
    hideBanner() {
      localStorage.setItem(VERIFY_BUILD_BANNER_HIDE, '1');
      this.bannerHidden = true;
    },
    async loadBuilds() {
      const data = this.$store.getters.getDeviceBuilds(this.model);
      if (!data) {
        throw new Error('Failed to get device-main builds-tab');
      }

      this.builds = data;
    },
  },
}
</script>

<style scoped>
@import '../../css/tab-page.css';

.builds-tab-page .banner {
  flex-shrink: 0;

  display: flex;
  justify-content: space-between;
  align-items: center;

  line-height: 24px;

  padding: 16px 16px 15px 16px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

#app.dark .builds-tab-page .banner {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.builds-tab-page .banner.hidden {
  display: none;
}

.builds-tab-page .banner .text {
  padding: 4px 0;
}
.builds-tab-page .banner .buttons {
  text-decoration: none;
  text-transform: uppercase;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
}

.builds-tab-page .banner .button {
  padding: 0 16px;
  margin: 0 8px;
  border-radius: 2px;

  display: inline-block;
  vertical-align: top;

  color: #167c80;
  text-decoration: none;

  transition: background 0.25s ease-out;

  cursor: pointer;
  user-select: none;
}

.builds-tab-page .banner .button:hover {
  background: rgba(22, 124, 128, 0.15);
}

.builds-tab-page .banner .button:active {
  background: rgba(22, 124, 128, 0.35);
}

@media (max-width: 1024px) {
  .builds-tab-page .banner {
    display: block;
  }

  .builds-tab-page .banner .buttons {
    text-align: right;
  }
}

</style>