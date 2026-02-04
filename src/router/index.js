import { createRouter, createWebHistory } from 'vue-router'

import DeviceView from '../views/DeviceView.vue'
import ErrorView from '../views/ErrorView.vue'
import FastbootView from '../views/FastbootView.vue'
import HomeView from '../views/HomeView.vue'
import SideBar from '../components/sidebar/SideBar.vue'
import ChangesTab from '../components/changes-tab/ChangesTab.vue'
import BuildsTab from '../components/builds-tab/BuildsTab.vue'
import VerifyTab from '../components/verify-tab/VerifyTab.vue'
import DevicesTab from '../components/devices-tab/DevicesTab.vue'
import MediaQueryUtils from '../js/MediaQueryUtils'

const getRedirectForHomeIndex = (deviceType) => {
  if (deviceType !== MediaQueryUtils.DESKTOP_TYPE) {
    return {
      name: 'home_devices'
    }
  } else {
    return {
      name: 'home_changes'
    }
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home_view',
      components: {
        sidebar: SideBar,
        main: HomeView
      },
      children: [
        {
          path: '',
          name: 'home_index',
          redirect: () => getRedirectForHomeIndex(MediaQueryUtils.getDeviceType())
        },
        {
          path: 'devices',
          name: 'home_devices',
          component: DevicesTab
        },
        {
          path: 'changes',
          name: 'home_changes',
          component: ChangesTab
        },
        {
          path: 'verify',
          name: 'home_verify',
          component: VerifyTab
        }
      ]
    },
    {
      path: '/devices/:model',
      name: 'device_view',
      components: {
        sidebar: SideBar,
        main: DeviceView
      },
      props: {
        sidebar(route) {
          return {
            activeModel: route.params.model
          }
        },
        main: true
      },
      children: [
        {
          path: '',
          name: 'device_index',
          redirect: {
            name: 'device_builds'
          }
        },
        {
          path: 'builds',
          name: 'device_builds',
          component: BuildsTab,
          props: true
        },
        {
          path: 'changes',
          name: 'device_changes',
          component: ChangesTab,
          props: true
        }
      ]
    },
    {
      path: '/:model',
      children: [
        {
          path: '',
          redirect: {
            name: 'device_builds'
          }
        },
        {
          path: 'changes',
          redirect: {
            name: 'device_changes'
          }
        }
      ]
    },
    {
      path: '/fastboot',
      name: 'fastboot',
      props: true,
      components: {
        sidebar: SideBar,
        main: FastbootView
      }
    },
    {
      path: '/error',
      name: 'error',
      props: true,
      components: {
        sidebar: SideBar,
        main: ErrorView
      }
    },
    {
      path: '/:pathMatch(.*)*',
      name: '404',
      props: {
        main: {
          message: '404 Not Found'
        }
      },
      components: {
        sidebar: SideBar,
        main: ErrorView
      }
    }
  ]
})
export default router

MediaQueryUtils.onDeviceTypeChange(async (deviceType) => {
  const name = router.currentRoute.value.name
  if (name === 'home_devices' || name === 'home_changes') {
    const newRoute = getRedirectForHomeIndex(deviceType)
    try {
      await router.push(newRoute)
    } catch (err) {
      console.error(err)
    }
  }
})
