import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { useDark } from '@vueuse/core'
import { createHead } from '@unhead/vue/client'
import App from './App.vue'
import router from './router'
import { applyBranding } from './services/branding'

applyBranding()

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

useDark()

app.use(pinia)

app.use(router)

app.use(head)

app.mount('#app')
