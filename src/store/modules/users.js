import {
  findById,
  docToResource,
  makeAppendChildToParentMutation,
  makeFetchItemAction,
  makeFetchItemsAction
} from '@/helpers'
import {
  getFirestore,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore'

export default {
  namespaced: true,

  state: {
    items: []
  },

  getters: {
    user: (state, getters, rootState) => {
      return id => {
        const user = findById(state.items, id)

        if (!user) return null

        return {
          ...user,

          // authUser.posts
          get posts () {
            return rootState.posts.items.filter(post => post.userId === user.id)
          },

          // authUser.postsCount
          get postsCount () {
            return user.postsCount || 0
          },

          // authUser.threads
          get threads () {
            return rootState.threads.items.filter(thread => thread.userId === user.id)
          },

          get threadIds () {
            return user.threads
          },

          // authUser.threadsCount
          get threadsCount () {
            return user.threads?.length || 0
          }
        }
      }
    }
  },

  actions: {
    async createUser ({ commit }, { id, email, name, username, avatar = null }) {
      const db = getFirestore()
      const registeredAt = serverTimestamp()
      const usernameLower = username.toLowerCase()
      email = email.toLowerCase()
      const user = { avatar, email, name, username, usernameLower, registeredAt }
      const userRef = doc(db, 'users', id)

      await setDoc(userRef, user)

      const newUser = await getDoc(userRef)
      commit('setItem', { resource: 'users', item: newUser }, { root: true })

      return docToResource(newUser)
    },

    async updateUser ({ commit }, user) {
      const db = getFirestore()
      const updates = {
        avatar: user.avatar || null,
        username: user.username || null,
        name: user.name || null,
        bio: user.bio || null,
        website: user.website || null,
        email: user.email || null,
        location: user.location || null
      }
      const userRef = doc(db, 'users', user.id)

      await updateDoc(userRef, updates)
      commit('setItem', { resource: 'users', item: user }, { root: true })
    },

    fetchUser: makeFetchItemAction({ emoji: '🙋', resource: 'users' }),
    fetchUsers: makeFetchItemsAction({ resource: 'users', emoji: '🙋' })
  },

  mutations: {
    appendThreadToUser: makeAppendChildToParentMutation({ parent: 'users', child: 'threads' })
  }
}
