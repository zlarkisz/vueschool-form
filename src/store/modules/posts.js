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
  state: {
    items: []
  },

  getters: {},

  actions: {
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

    fetchPost: ({ dispatch }, { id }) => dispatch('fetchItem', { id, resource: 'posts', emoji: '📜' }),

    fetchPosts: ({ dispatch }, { ids }) => dispatch('fetchItems', { ids, resource: 'posts', emoji: '📜' })
  },

  mutations: {}
}
