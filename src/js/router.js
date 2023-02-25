import {createRouter, createWebHashHistory} from 'vue-router';

import Sidebar from '../components/sidebar/Sidebar.vue';
import HomeMain from '../components/home-main/HomeMain.vue';
import ChangesTabPage from '../components/changes-tab/ChangesTabPage.vue';
import DeviceMain from '../components/device-main/DeviceMain.vue';
import Builds from '../components/builds-tab/BuildsTabPage.vue';
import ErrorMain from '../components/error-main/ErrorMain.vue';
import DevicesTabPage from '../components/devices-tab/DevicesTabPage.vue';
import MediaQueryUtils from './MediaQueryUtils';

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
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: 'home-main',
            components: {
                sidebar: Sidebar,
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
                }
            ],
        },
        {
            path: '/devices/:model',
            name: 'device-main',
            components: {
                sidebar: Sidebar,
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
            path: '/error',
            name: 'error',
            props: true,
            components: {
                sidebar: Sidebar,
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
