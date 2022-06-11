import { createApp } from 'vue'
import App from './App.vue'
import AppDate from '@/components/AppDate'
import router from '@/router'
import store from './store'
import * as firebase from 'firebase/app'
import firebaseConfig from '@/config/firebase'
import FontAwesome from '@/plugins/FontAwesome'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)
const auth = getAuth()
onAuthStateChanged(auth, user => {
  store.dispatch('unsubscribeAuthUserSnapshot')

  if (user) {
    store.dispatch('fetchAuthUser')
  }
})

const forumApp = createApp(App)

forumApp.use(store)
forumApp.use(router)
forumApp.use(FontAwesome)
forumApp.component('AppDate', AppDate)
forumApp.mount('#app')
