
import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
  arrayUnion,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { findById } from '@/helpers'

export default {
  async createPost ({ commit, state }, post) {
    const db = getFirestore()
    const batch = writeBatch(db)
    const postRef = doc(collection(db, 'posts'))
    const threadRef = doc(db, 'threads', post.threadId)

    post.userId = state.authId
    post.publishedAt = serverTimestamp()

    batch.set(postRef, post)
    batch.update(threadRef, {
      posts: arrayUnion(postRef.id),
      contributors: arrayUnion(state.authId)
    })

    await batch.commit()

    const newPost = await getDoc(postRef)

    commit('setItem', { resource: 'posts', item: { ...newPost.data(), id: newPost.id } }) // set the post
    commit('appendPostToThread', { childId: newPost.id, parentId: post.threadId }) // append post to thread
    commit('appendContributorToThread', { child: state.authId, parentId: post.threadId })
  },

  async createThread ({ commit, state, dispatch }, { text, title, forumId }) {
    const id = 'gggg' + Math.random()
    const userId = state.authId
    const publishedAt = Math.floor(Date.now() / 1000)
    const thread = {
      forumId,
      title,
      publishedAt,
      userId,
      id
    }

    commit('setItem', { resource: 'threads', item: thread })
    commit('appendThreadToUser', { parentId: userId, childId: id })
    commit('appendThreadToForum', { parentId: forumId, childId: id })
    dispatch('createPost', { text, threadId: id })

    return findById(state.threads, id)
  },

  async updateThread ({ commit, state }, { title, text, id }) {
    const thread = findById(state.threads, id)
    const post = findById(state.posts, thread.posts[0])
    const newThread = { ...thread, title }
    const newPost = { ...post, text }
    commit('setItem', { resource: 'threads', item: newThread })
    commit('setItem', { resource: 'posts', item: newPost })
    return newThread
  },

  updateUser ({ commit }, user) {
    commit('setItem', { resource: 'users', item: user })
  },

  // -------------------
  // Fetch Single Resource
  // -------------------

  fetchCategory: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'categories', emoji: '🏷' }),

  fetchForum: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'forums', emoji: '🏁' }),

  fetchThread: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'threads', emoji: '📄' }),

  fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'posts', emoji: '📜' }),

  fetchUser: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'users', emoji: '🙋🏻‍♂️' }),

  fetchAuthUser: ({ dispatch, state }) => dispatch('fetchItem', { id: state.authId, resource: 'users', emoji: '🙋🏻‍♂️' }),

  // -------------------
  // Fetch All of a Resource
  // -------------------

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
  },

  fetchCategories: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'categories', emoji: '🏷' }),

  fetchForums: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'forums', emoji: '🏁' }),

  fetchThreads: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'threads', emoji: '📄' }),

  fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'posts', emoji: '📜' }),

  fetchUsers: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'users', emoji: '🙋🏻‍♂️' }),

  async fetchItem ({ commit }, { id, emoji, resource }) {
    console.log('🔥', emoji, id)
    const db = getFirestore()
    let item

    try {
      const snap = await getDoc(doc(db, resource, id))
      item = { ...snap.data(), id: snap.id }
      commit('setItem', { resource, id, item })
    } catch (error) {
      console.error(error)
    }

    return new Promise(resolve => resolve(item))
  },

  fetchItems ({ dispatch }, { ids, resource, emoji }) {
    return Promise.all(ids?.map(id => dispatch('fetchItem', { id, resource, emoji })))
  }
}
