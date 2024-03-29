import 'primevue/resources/themes/saga-blue/theme.css'
import 'primeicons/primeicons.css'
import 'primeflex/primeflex.css'

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config';
import DialogService from 'primevue/dialogservice';
import Tooltip from 'primevue/tooltip';
import ToastService from 'primevue/toastservice';

import * as PDFJS from "pdfjs-dist";
PDFJS.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS.version}/pdf.worker.js`;


import App from './App.vue'
import router from './router'

const app = createApp(App)

app.directive('tooltip', Tooltip);

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(DialogService)
app.use(ToastService)

app.mount('#app')
