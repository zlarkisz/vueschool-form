import {
  getFirestore,
  doc,
  getDoc,
  query,
  collection,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore'
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL
} from 'firebase/storage'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from 'firebase/auth'
import useNotifications from '@/composables/useNotification'

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

      avatar = await dispatch('uploadAvatar', { authId: result.user.uid, file: avatar })

      await dispatch('users/createUser', { id: result.user.uid, email, name, username, avatar }, { root: true })
    },

    async uploadAvatar ({ state }, { authId, file }) {
      if (!file) return null

      authId = authId ?? state.authId

      let url
      const storage = getStorage()
      const storageRef = ref(storage, `uploads/${authId}/images/${Date.now()}-${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            console.log('Upload is ' + progress + '% done')
            switch (snapshot.state) {
              case 'paused':
                console.log('Upload is paused')
                break
              case 'running':
                console.log('Upload is running')
                break
            }
          },
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            const { addNotification } = useNotifications()
            addNotification({ message: 'Error uploading avatar image', type: 'error' })
            reject(error.code)
            switch (error.code) {
              case 'storage/unauthorized':
                // User doesn't have permission to access the object
                break
              case 'storage/canceled':
                // User canceled the upload
                break

                // ...

              case 'storage/unknown':
                // Unknown error occurred, inspect error.serverResponse
                break
            }
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              console.log('File available at', downloadURL)
              url = downloadURL
              resolve(url)
            })
          }
        )
      })
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

    async fetchAuthUsersPosts ({ commit, state }, { start }) {
      const db = getFirestore()
      let posts = query(
        collection(db, 'posts'),
        where('userId', '==', state.authId),
        orderBy('publishedAt', 'desc'),
        limit(3)
      )

      if (start) {
        const postsDoc = await getDoc(doc(db, 'posts', start.id))

        posts = query(
          collection(db, 'posts'),
          where('userId', '==', state.authId),
          orderBy('publishedAt', 'desc'),
          startAfter(postsDoc),
          limit(3)
        )
      }

      const postsSnapshot = await getDocs(posts)

      postsSnapshot.forEach(doc => {
        commit('setItem', { resource: 'posts', item: { ...doc.data(), id: doc.id } }, { root: true })
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
