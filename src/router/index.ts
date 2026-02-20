import { createRouter, createWebHistory } from 'vue-router'

import DeviceView from '../views/DeviceView.vue'
import ErrorView from '../views/ErrorView.vue'
import HomeView from '../views/HomeView.vue'
import SideBar from '../components/sidebar/SideBar.vue'
import { useMediaQuery } from '@vueuse/core'

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
          path: 'devices',
          name: 'home_devices',
          component: () => import('@/components/devices-tab/DevicesTab.vue')
        },
        {
          path: 'changes',
          name: 'home_changes',
          component: () => import('@/components/changes-tab/ChangesTab.vue')
        },
        {
          path: 'verify',
          name: 'home_verify',
          component: () => import('@/components/verify-tab/VerifyTab.vue')
        },
        {
          path: 'flash',
          name: 'home_flash_tools',
          component: () => import('@/components/flash-tools-tab/FlashToolsTab.vue')
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
          component: () => import('@/components/builds-tab/BuildsTab.vue'),
          props: true
        },
        {
          path: 'changes',
          name: 'device_changes',
          component: () => import('@/components/changes-tab/ChangesTab.vue'),
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

router.beforeEach(async (to, _, next) => {
  if (to.path === '/') {
    const isMobile = useMediaQuery('(max-width: 1024px)')
    if (isMobile.value) {
      await router.push('/devices')
    } else {
      await router.push('/changes')
    }
  } else {
    next()
  }
})

export default router
