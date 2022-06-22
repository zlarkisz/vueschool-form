import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore'

export default {
  namespaced: true,

  state: {
    items: []
  },

  getters: {},

  actions: {
    fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem',
      { id, resource: 'categories', emoji: '🏷' },
      { root: true }
    ),

    fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems',
      { ids, resource: 'categories', emoji: '🏷' },
      { root: true }
    ),

    fetchAllCategories ({ commit }) {
      console.log('🔥', '🏷', 'all')
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
