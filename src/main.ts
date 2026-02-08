import './style.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@mdi/font/css/materialdesignicons.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

app.use(router)

app.use(pinia)

app.mount('#app')
