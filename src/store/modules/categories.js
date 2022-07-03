import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore'
import { makeFetchItemAction, makeFetchItemsAction } from '@/helpers'

export default {
  namespaced: true,

  state: {
    items: []
  },

  getters: {},

  actions: {
    fetchCategory: makeFetchItemAction({ emoji: '🏷', resource: 'categories' }),

    fetchCategories: makeFetchItemsAction({ emoji: '🏷', resource: 'categories' }),

    fetchAllCategories ({ commit }) {
      const db = getFirestore()
      const colRef = collection(db, 'categories')

      return new Promise(resolve => {
        getDocs(colRef)
          .then(snapshot => {
            const categories = snapshot.docs.map(doc => {
              const item = { id: doc.id, ...doc.data() }
              commit('setItem', { resource: 'categories', item }, { root: true })
              return item
            })

            resolve(categories)
          })
      })
    }
  },

  mutations: {}
}
