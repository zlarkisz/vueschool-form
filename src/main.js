import { createApp } from 'vue'
import App from './App.vue'
import AppDate from '@/components/AppDate'
import router from '@/router'
import store from './store'
import * as firebase from 'firebase/app'
import firebaseConfig from '@/config/firebase'
import FontAwesome from '@/plugins/FontAwesome'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

const forumApp = createApp(App)

forumApp.use(store)
forumApp.use(router)
forumApp.use(FontAwesome)
forumApp.component('AppDate', AppDate)
forumApp.mount('#app')
