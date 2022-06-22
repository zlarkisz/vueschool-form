import {
  getFirestore,
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs
} from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth'

export default {
  namespaced: true,

  state: {
    authId: null,
    authUserUnsubscribe: null,
    authObservereUnsubscribe: null
  },

  getters: {
    authUser: (state, getters, rootState, rootGetters) => {
      return rootGetters['users/user'](state.authId)
    }
  },

  actions: {
    initAuthentication ({ dispatch, commit, state }) {
      if (state.authObservereUnsubscribe) state.authObservereUnsubscribe()

      return new Promise(resolve => {
        const auth = getAuth()

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
          console.log('👣 the user has changed')
          dispatch('unsubscribeAuthUserSnapshot')

          if (user) {
            await dispatch('fetchAuthUser')
            resolve(user)
          } else {
            resolve(null)
          }
        })

        commit('setAuthObservereUnsubscribe', unsubscribe)
      })
    },

    async registerUserWithEmailAndPassword ({ dispatch }, { avatar = null, email, name, username, password }) {
      const auth = getAuth()
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await dispatch('users/createUser', { id: result.user.uid, email, name, username, avatar }, { root: true })
    },

    signInWithEmailAndPassword (context, { email, password }) {
      const auth = getAuth()
      return signInWithEmailAndPassword(auth, email, password)
    },

    async signInWithGoogle ({ dispatch }) {
      const db = getFirestore()
      const auth = getAuth()
      const provider = new GoogleAuthProvider()
      const response = await signInWithPopup(auth, provider)
      const user = response.user
      const userRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userRef)

      if (!userDoc.exists()) {
        return dispatch('users/createUser',
          {
            id: user.uid,
            name: user.displayName,
            email: user.email,
            username: user.email,
            avatar: user.photoURL
          },
          { root: true }
        )
      }
    },

    async signOut ({ commit }) {
      const auth = getAuth()
      await signOut(auth)
      commit('setAuthId', null)
    },

    fetchAuthUser: async ({ dispatch, commit }) => {
      const auth = getAuth()
      const userId = auth.currentUser?.uid

      if (!userId) return

      await dispatch('fetchItem',
        { id: userId,
          resource: 'users',
          emoji: '🙋🏻‍♂️',
          handleUnsubscribe: (unsubscribe) => {
            commit('setAuthUserUnsubscribe', unsubscribe)
          }
        },
        { root: true }
      )
      commit('setAuthId', userId)
    },

    async fetchAuthUsersPosts ({ commit, state }) {
      const db = getFirestore()
      const posts = query(collection(db, 'posts'), where('userId', '==', state.authId))
      const postsSnapshot = await getDocs(posts)

      postsSnapshot.forEach(doc => {
        commit('setItem', { resource: 'posts', item: doc.data() }, { root: true })
      })
    },

    async unsubscribeAuthUserSnapshot ({ state, commit }) {
      if (state.authUserUnsubscribe) {
        state.authUserUnsubscribe()
        commit('setAuthUserUnsubscribe', null)
      }
    }
  },

  mutations: {
    setAuthId (state, id) {
      state.authId = id
    },

    setAuthUserUnsubscribe (state, unsubscribe) {
      state.setAuthUserUnsubscribe = unsubscribe
    },

    setAuthObservereUnsubscribe (state, unsubscribe) {
      state.authObservereUnsubscribe = unsubscribe
    }
  }
}
