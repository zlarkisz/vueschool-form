import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore'

export default {
  state: {
    items: []
  },

  getters: {},

  actions: {
    fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'categories', emoji: '🏷' }),

    fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'categories', emoji: '🏷' }),

    fetchAllCategories ({ commit }) {
      console.log('🔥', '🏷', 'all')
      const db = getFirestore()
      const colRef = collection(db, 'categories')

      return new Promise(resolve => {
        getDocs(colRef)
          .then(snapshot => {
            const categories = snapshot.docs.map(doc => {
              const item = { id: doc.id, ...doc.data() }
              commit('setItem', { resource: 'categories', item })
              return item
            })

            resolve(categories)
          })
      })
    }
  },

  mutations: {}
}
