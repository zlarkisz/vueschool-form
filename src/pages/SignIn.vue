
<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <VeeForm @submit="signIn" class="card card-form">
        <h1 class="text-center">Login</h1>

        <AppFormField
          v-model="form.email"
          name="email"
          label="Email"
          rules="required|email"
          type="email"
        />

        <AppFormField
          v-model="form.password"
          name="password"
          label="Password"
          rules="required"
          type="password"
        />

        <div class="push-top">
          <button type="submit" class="btn-blue btn-block">Log in</button>
        </div>

        <div class="form-actions text-right">
          <router-link :to="{name: 'Register'}">Create an account?</router-link>
        </div>
      </VeeForm>

      <div class="push-top text-center">
        <button class="btn-red btn-xsmall" @click="signInWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign in with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AppFormField from '@/components/AppFormField.vue'
import useNotifications from '@/composables/useNotification'

export default {
  name: 'SignIn',

  components: {
    AppFormField
  },

  data () {
    return {
      form: {
        email: '',
        password: ''
      }
    }
  },

  methods: {
    async signIn () {
      try {
        await this.$store.dispatch('auth/signInWithEmailAndPassword', { ...this.form })
        this.successRedirect()
      } catch (error) {
        const { addNotification } = useNotifications()
        addNotification({ message: error.message, timeout: 5000 })
      }
    },

    async signInWithGoogle () {
      await this.$store.dispatch('auth/signInWithGoogle')
      this.successRedirect()
    },

    successRedirect () {
      const redirectTo = this.$route.query.redirectTo || { name: 'Home' }
      this.$router.push(redirectTo)
    }
  },

  created () {
    this.$emit('ready')
  }
}
</script>

<style lang="scss" scoped>

</style>
