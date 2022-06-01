import {
  getFirestore,
  getDoc,
  doc,
  collection,
  getDocs,
  arrayUnion,
  writeBatch,
  serverTimestamp,
  increment,
  updateDoc,
  onSnapshot
} from 'firebase/firestore'
import { findById } from '@/helpers'

export default {
  async createPost ({ commit, state }, post) {
    const db = getFirestore()
    const batch = writeBatch(db)
    const postRef = doc(collection(db, 'posts'))
    const threadRef = doc(db, 'threads', post.threadId)
    const userRef = doc(db, 'users', state.authId)

    post.userId = state.authId
    post.publishedAt = serverTimestamp()

    batch.set(postRef, post)
    batch.update(threadRef, {
      posts: arrayUnion(postRef.id),
      contributors: arrayUnion(state.authId)
    })
    batch.update(userRef, {
      postsCount: increment(1)
    })

    await batch.commit()

    const newPost = await getDoc(postRef)

    commit('setItem', { resource: 'posts', item: { ...newPost.data(), id: newPost.id } }) // set the post
    commit('appendPostToThread', { childId: newPost.id, parentId: post.threadId }) // append post to thread
    commit('appendContributorToThread', { child: state.authId, parentId: post.threadId })
  },

  async updatePost ({ commit, state }, { text, id }) {
    const db = getFirestore()
    const post = {
      text,
      edited: {
        at: serverTimestamp(),
        by: state.authId,
        moderated: false
      }
    }
    const postRef = doc(db, 'posts', id)

    await updateDoc(postRef, post)

    const updatedPost = await getDoc(postRef)
    commit('setItem', { resource: 'posts', item: updatedPost })
  },

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

    return findById(state.threads, threadRef.id)
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

    return new Promise(resolve => {
      const unsubscribe = onSnapshot(doc(db, resource, id), doc => {
        const item = { ...doc.data(), id: doc.id }
        commit('setItem', { resource, id, item })
        resolve(item)
      })
      commit('appendUnsubscribe', { unsubscribe })
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
