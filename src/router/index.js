import {createRouter, createWebHistory} from 'vue-router';

import SideBar from '../components/sidebar/SideBar.vue';
import HomeMain from '../components/home-main/HomeMain.vue';
import ChangesTabPage from '../components/changes-tab/ChangesTabPage.vue';
import DeviceMain from '../components/device-main/DeviceMain.vue';
import Builds from '../components/builds-tab/BuildsTabPage.vue';
import ErrorMain from '../components/error-main/ErrorMain.vue';
import VerifyTabPage from '../components/verify-tab/VerifyTabPage.vue';
import DevicesTabPage from '../components/devices-tab/DevicesTabPage.vue';
import MediaQueryUtils from '../js/MediaQueryUtils';

const getRedirectForHomeIndex = (deviceType) => {
    if (deviceType !== MediaQueryUtils.DESKTOP_TYPE) {
        return {
            name: 'home_devices',
        };
    } else {
        return {
            name: 'home_changes',
        };
    }
};

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'home-main',
            components: {
                sidebar: SideBar,
                main: HomeMain,
            },
            children: [
                {
                    path: '',
                    name: 'home_index',
                    redirect: () => getRedirectForHomeIndex(MediaQueryUtils.getDeviceType()),
                },
                {
                    path: 'devices',
                    name: 'home_devices',
                    component: DevicesTabPage,
                },
                {
                    path: 'changes',
                    name: 'home_changes',
                    component: ChangesTabPage,
                },
                {
                    path: 'verify',
                    name: 'home_verify',
                    component: VerifyTabPage,
                }
            ],
        },
        {
            path: '/devices/:model',
            name: 'device-main',
            components: {
                sidebar: SideBar,
                main: DeviceMain,
            },
            props: {
                sidebar(route) {
                    return {
                        activeModel: route.params.model,
                    };
                },
                main: true,
            },
            children: [
                {
                    path: '',
                    name: 'device_index',
                    redirect: {
                        name: 'device_builds',
                    },
                },
                {
                    path: 'builds',
                    name: 'device_builds',
                    component: Builds,
                    props: true,
                },
                {
                    path: 'changes',
                    name: 'device_changes',
                    component: ChangesTabPage,
                    props: true,
                },
            ],
        },
        {
            path: '/:model',
            children: [
                {
                    path: '',
                    redirect: {
                        name: 'device_builds',
                    },
                },
                {
                    path: 'changes',
                    redirect: {
                        name: 'device_changes',
                    },
                }
            ],
        },
        {
            path: '/error',
            name: 'error',
            props: true,
            components: {
                sidebar: SideBar,
                main: ErrorMain,
            },
        },
        {
            path: '/:pathMatch(.*)*',
            name: '404',
            props: {
                main: {
                    message: '404 Not Found'
                },
            },
            components: {
                sidebar: SideBar,
                main: ErrorMain,
            },
        }
    ],
});
export default router;

MediaQueryUtils.onDeviceTypeChange(async (deviceType) => {
    const name = router.currentRoute.value.name;
    if (name === 'home_devices' || name === 'home_changes') {
        const newRoute = getRedirectForHomeIndex(deviceType);
        try {
            await router.push(newRoute);
        } catch (err) {
            console.error(err);
        }
    }
});
