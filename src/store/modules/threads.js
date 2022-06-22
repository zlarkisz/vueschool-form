import { findById, docToResource, makeAppendChildToParentMutation } from '@/helpers'
import {
  getFirestore,
  writeBatch,
  doc,
  collection,
  serverTimestamp,
  arrayUnion,
  getDoc
} from 'firebase/firestore'

export default {
  namespaced: true,

  state: {
    items: []
  },

  getters: {
    thread: (state, getters, rootState) => {
      return (id) => {
        const thread = findById(state.items, id)

        if (!thread) return {}

        return {
          ...thread,

          get author () {
            return findById(rootState.users.items, thread.userId)
          },

          get repliesCount () {
            return thread.posts.length - 1
          },

          get contributorsCount () {
            return thread.contributors?.length || 0
          }
        }
      }
    }
  },

  actions: {
    async createThread ({ commit, state, dispatch, rootState }, { text, title, forumId }) {
      const db = getFirestore()
      const batch = writeBatch(db)
      const threadRef = doc(collection(db, 'threads'))
      const userId = rootState.auth.authId
      const publishedAt = serverTimestamp()
      const thread = {
        forumId,
        title,
        publishedAt,
        userId,
        id: threadRef.id
      }
      const userRef = doc(db, 'users', userId)
      const forumRef = doc(db, 'forums', forumId)

      batch.set(threadRef, thread)
      batch.update(userRef, {
        threads: arrayUnion(threadRef.id)
      })
      batch.update(forumRef, {
        threads: arrayUnion(threadRef.id)
      })

      await batch.commit()

      const newThread = await getDoc(threadRef)

      commit('setItem',
        {
          resource: 'threads',
          item: { ...newThread.data(), id: newThread.id }
        },
        { root: true }
      )
      commit('users/appendThreadToUser', { parentId: userId, childId: threadRef.id }, { root: true })
      commit('forums/appendThreadToForum', { parentId: forumId, childId: threadRef.id }, { root: true })
      await dispatch('posts/createPost', { text, threadId: threadRef.id }, { root: true })

      return findById(state.items, threadRef.id)
    },

    async updateThread ({ commit, state, rootState }, { title, text, id }) {
      const db = getFirestore()
      const batch = writeBatch(db)
      const thread = findById(state.items, id)
      const post = findById(rootState.posts.items, thread.posts[0])
      let newThread = { ...thread, title }
      let newPost = { ...post, text }
      const threadRef = doc(db, 'threads', id)
      const postRef = doc(db, 'posts', post.id)

      batch.update(threadRef, newThread)
      batch.update(postRef, newPost)
      await batch.commit()

      newThread = await getDoc(threadRef)
      newPost = await getDoc(postRef)

      commit('setItem', { resource: 'threads', item: newThread }, { root: true })
      commit('setItem', { resource: 'posts', item: newPost }, { root: true })

      return docToResource(newThread)
    },

    fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'threads', emoji: '📄' }, { root: true }),

    fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'threads', emoji: '📄' }, { root: true })
  },

  mutations: {
    appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),

    appendContributorToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'contributors' })
  }
}
