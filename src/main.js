import './style.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = createApp(App)

app.use(router)

app.use(store)

app.mount('#app')
