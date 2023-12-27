import './css/index.css'
import '@mdi/font/css/materialdesignicons.css'
import 'simplebar'
import 'simplebar/dist/simplebar.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.use(router)

app.use(store)

app.mount('#app')
