import { makeAppendChildToParentMutation } from '@/helpers'

export default {
  state: {
    items: []
  },

  getters: {},

  actions: {
    fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'forums', emoji: '🏁' }),

    fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'forums', emoji: '🏁' })
  },

  mutations: {
    appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' })
  }
}
