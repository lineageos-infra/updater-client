import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useDark } from '@vueuse/core'
import App from './App.vue'
import router from './router'

const app = createApp(App)
const pinia = createPinia()

useDark()

app.use(router)

app.use(pinia)

app.mount('#app')
