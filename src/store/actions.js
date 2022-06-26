import {
  getFirestore,
  doc,
  onSnapshot
} from 'firebase/firestore'

export default {
  async fetchItem (
    { commit },
    {
      id,
      emoji,
      resource,
      handleUnsubscribe = null,
      onsce = false
    }
  ) {
    console.log('🔥', emoji, id)
    const db = getFirestore()

    return new Promise(resolve => {
      const unsubscribe = onSnapshot(doc(db, resource, id), doc => {
        if (onsce) unsubscribe()

        if (doc.exists()) {
          const item = { ...doc.data(), id: doc.id }
          commit('setItem', { resource, id, item })
          resolve(item)
        } else {
          resolve(null)
        }
      })

      if (handleUnsubscribe) {
        handleUnsubscribe(unsubscribe)
      } else {
        commit('appendUnsubscribe', { unsubscribe })
      }
    })
  },

  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    return Promise.all(ids?.map(id => dispatch('fetchItem', { id, resource, emoji })))
  },

  async unsubscribeAllSnapshots ({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe())
    commit('clearAllUnsubsribe')
  }
}
