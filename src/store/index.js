import { createStore } from 'vuex'
import getters from '@/store/getters'
import actions from '@/store/actions'
import mutations from '@/store/mutations'

export default createStore({
  state: {
    categories: [],
    forums: [],
    threads: [],
    posts: [],
    users: [],
    // authId: 'ZFi2O9GTDbNaGxNih6KgGUa6kE23',
    authId: null,
    unsubscribes: [],
    authUserUnsubscribe: null
  },
  getters,
  actions,
  mutations
})
