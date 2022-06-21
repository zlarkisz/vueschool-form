import { createStore } from 'vuex'
import getters from '@/store/getters'
import actions from '@/store/actions'
import mutations from '@/store/mutations'
import auth from './modules/auth'
import categories from './modules/categories'
import forums from './modules/forums'
import posts from './modules/posts'
import threads from './modules/threads'
import users from './modules/users'

export default createStore({
  modules: {
    auth,
    categories,
    forums,
    posts,
    threads,
    users
  },

  state: {
    unsubscribes: []
  },

  getters,

  actions,

  mutations
})
