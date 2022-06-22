import { makeAppendChildToParentMutation } from '@/helpers'

export default {
  namespaced: true,

  state: {
    items: []
  },

  getters: {},

  actions: {
    fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem',
      { id, resource: 'forums', emoji: '🏁' },
      { root: true }
    ),

    fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems',
      { ids, resource: 'forums', emoji: '🏁' },
      { root: true }
    )
  },

  mutations: {
    appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' })
  }
}
