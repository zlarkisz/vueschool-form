<template>
<VueFinalModal v-model="showModal" classes="modal-container" content-class="modal">
  <div class="modal-content">
    <h4>Login again to change your email</h4>
    <VeeForm @submit="reauthenticate">
      <AppFormField name="reauth-email" label="Email" v-model="email" rules="email" />
      <AppFormField name="reauth-password" label="Password" v-model="password" type="password" />

      <button class="btn btn-green btn-small">Login</button>
    </VeeForm>
  </div>
</VueFinalModal>
</template>

<script>
import AppFormField from '@/components/AppFormField.vue'
import { VueFinalModal } from 'vue-final-modal'

export default {
  name: 'UserProfileCardEditorReauthenticate',

  props: {
    modalValue: {
      type: Boolean,
      default: false
    }
  },

  components: {
    AppFormField,
    VueFinalModal
  },

  data () {
    return {
      email: '',
      password: ''
    }
  },

  computed: {
    showModal: {
      get () {
        return this.modalValue
      },
      set (value) {
        this.$emit('update:modalValue', value)
      }
    }
  },

  methods: {
    async reauthenticate () {
      try {
        await this.$store.dispatch('auth/reauthenticate', { email: this.email, password: this.password })
        this.$emit('success')
      } catch (error) {
        console.log(error)
        this.$emit('fail', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
