import { findById } from '@/helpers'
import {
  getFirestore,
  doc,
  onSnapshot
} from 'firebase/firestore'

export default {
  async fetchItem (
    {
      commit,
      state
    },
    {
      id,
      emoji,
      resource,
      handleUnsubscribe = null,
      onsce = false,
      onSnapshotFunction = null
    }
  ) {
    const db = getFirestore()

    return new Promise(resolve => {
      const unsubscribe = onSnapshot(doc(db, resource, id), doc => {
        if (onsce) unsubscribe()

        if (doc.exists()) {
          const item = { ...doc.data(), id: doc.id }
          let previousItem = findById(state[resource].items, id)
          previousItem = previousItem ? { ...previousItem } : null

          commit('setItem', { resource, item })

          if (typeof onSnapshotFunction === 'function') {
            const isLocal = doc.metadata.hasPendingWrites

            onSnapshotFunction({ item: { ...item }, previousItem, isLocal })
          }

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

  fetchItems (
    { dispatch },
    {
      ids,
      resource,
      emoji,
      onSnapshotFunction = null
    }
  ) {
    ids = ids || []

    return Promise.all(ids?.map(id => dispatch('fetchItem', { id, resource, emoji, onSnapshotFunction })))
  },

  async unsubscribeAllSnapshots ({ state, commit }) {
    state.unsubscribes.forEach(unsubscribe => unsubscribe())
    commit('clearAllUnsubsribe')
  },

  clearItems ({ commit }, { modules = [] }) {
    commit('clearItems', { modules })
  }
}
