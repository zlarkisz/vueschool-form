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
  state: {
    items: []
  },

  getters: {
    thread: state => {
      return (id) => {
        const thread = findById(state.items, id)

        if (!thread) return {}

        return {
          ...thread,

          get author () {
            return findById(state.users, thread.userId)
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
    async createThread ({ commit, state, dispatch }, { text, title, forumId }) {
      const db = getFirestore()
      const batch = writeBatch(db)
      const threadRef = doc(collection(db, 'threads'))
      const userId = state.authId
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

      commit('setItem', { resource: 'threads', item: { ...newThread.data(), id: newThread.id } })
      commit('appendThreadToUser', { parentId: userId, childId: threadRef.id })
      commit('appendThreadToForum', { parentId: forumId, childId: threadRef.id })
      await dispatch('createPost', { text, threadId: threadRef.id })

      return findById(state.items, threadRef.id)
    },

    async updateThread ({ commit, state }, { title, text, id }) {
      const db = getFirestore()
      const batch = writeBatch(db)
      const thread = findById(state.items, id)
      const post = findById(state.posts, thread.posts[0])
      let newThread = { ...thread, title }
      let newPost = { ...post, text }
      const threadRef = doc(db, 'threads', id)
      const postRef = doc(db, 'posts', post.id)

      batch.update(threadRef, newThread)
      batch.update(postRef, newPost)
      await batch.commit()

      newThread = await getDoc(threadRef)
      newPost = await getDoc(postRef)

      commit('setItem', { resource: 'threads', item: newThread })
      commit('setItem', { resource: 'posts', item: newPost })

      return docToResource(newThread)
    },

    fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'threads', emoji: '📄' }),

    fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'threads', emoji: '📄' })
  },

  mutations: {
    appendPostToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'posts' }),

    appendContributorToThread: makeAppendChildToParentMutation({ parent: 'threads', child: 'contributors' })
  }
}
