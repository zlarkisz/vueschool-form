import {
  getFirestore,
  writeBatch,
  doc,
  collection,
  serverTimestamp,
  arrayUnion,
  increment,
  getDoc,
  updateDoc
} from 'firebase/firestore'

export default {
  namespaced: true,

  state: {
    items: []
  },

  getters: {},

  actions: {
    async createPost ({ commit, state, rootState }, post) {
      const db = getFirestore()
      const batch = writeBatch(db)
      const postRef = doc(collection(db, 'posts'))
      const threadRef = doc(db, 'threads', post.threadId)
      const userRef = doc(db, 'users', rootState.auth.authId)

      post.userId = rootState.auth.authId
      post.publishedAt = serverTimestamp()

      batch.set(postRef, post)
      batch.update(threadRef, {
        posts: arrayUnion(postRef.id),
        contributors: arrayUnion(rootState.auth.authId)
      })
      batch.update(userRef, {
        postsCount: increment(1)
      })

      await batch.commit()

      const newPost = await getDoc(postRef)

      commit('setItem',
        { resource: 'posts', item: { ...newPost.data(), id: newPost.id } },
        { root: true }
      ) // set the post
      commit('threads/appendPostToThread',
        { childId: newPost.id, parentId: post.threadId },
        { root: true }
      ) // append post to thread
      commit('threads/appendContributorToThread',
        { child: rootState.auth.authId, parentId: post.threadId },
        { root: true }
      )
    },

    async updatePost ({ commit, state, rootState }, { text, id }) {
      const db = getFirestore()
      const post = {
        text,
        edited: {
          at: serverTimestamp(),
          by: rootState.auth.authId,
          moderated: false
        }
      }
      const postRef = doc(db, 'posts', id)

      await updateDoc(postRef, post)

      const updatedPost = await getDoc(postRef)
      commit('setItem', { resource: 'posts', item: updatedPost }, { root: true })
    },

    fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem',
      { id, resource: 'posts', emoji: '📜' },
      { root: true }
    ),

    fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems',
      { ids, resource: 'posts', emoji: '📜' },
      { root: true }
    )
  },

  mutations: {}
}
