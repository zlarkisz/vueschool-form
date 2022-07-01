import { createApp } from 'vue'
import App from './App.vue'
import AppDate from '@/components/AppDate'
import router from '@/router'
import store from './store'
import * as firebase from 'firebase/app'
import firebaseConfig from '@/config/firebase'
import FontAwesome from '@/plugins/FontAwesome'
import ClickOutsideDirective from '@/plugins/ClickOutsideDirective'
import PageScrollDirective from '@/plugins/PageScrollDirective'
import Vue3Pagination from '@/plugins/Vue3Pagination'
import VeeValidatePlugin from '@/plugins/VeeValidatePlugin'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const forumApp = createApp(App)

forumApp.use(store)
forumApp.use(router)
forumApp.use(FontAwesome)
forumApp.use(ClickOutsideDirective)
forumApp.use(PageScrollDirective)
forumApp.use(Vue3Pagination)
forumApp.use(VeeValidatePlugin)
forumApp.component('AppDate', AppDate)
forumApp.mount('#app')
