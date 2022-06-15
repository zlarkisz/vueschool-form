import { findById, upsert } from '@/helpers'

export default {
  setItem (state, { resource, item }) {
    upsert(state[resource], item)
  },

  setAuthId (state, id) {
    state.authId = id
  },

  setAuthUserUnsubscribe (state, unsubscribe) {
    state.setAuthUserUnsubscribe = unsubscribe
  },

  setAuthObservereUnsubscribe (state, unsubscribe) {
    state.authObservereUnsubscribe = unsubscribe
  },

  appendUnsubscribe (state, { unsubscribe }) {
    state.unsubscribes.push(unsubscribe)
  },

  clearAllUnsubsribe (state) {
    state.unsubscribes = []
  },

  appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),

  appendThreadToForum: makeAppendChildToParentMutation({ parent: 'forums', child: 'threads' }),

  appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' }),

  appendContributorToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'contributors' })
}

function makeAppendChildToParentMutation ({ parent, child }) {
  return (state, { childId, parentId }) => {
    const resource = findById(state[parent], parentId)

    if (!resource) {
      console.warn(`Appending ${child} ${childId} to ${parent} ${parentId} feild because the parent didn't exist`)
      return
    }

    resource[child] = resource[child] || []

    if (!resource[child].includes(childId)) {
      resource[child].push(childId)
    }
  }
}
