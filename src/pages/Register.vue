<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <VeeForm
        @submit="register"
        class="card card-form"
      >
        <h1 class="text-center">Register</h1>

        <AppFormField
          v-model="form.name"
          name="name"
          label="Name"
          rules="required"
        />

        <AppFormField
          v-model="form.username"
          name="username"
          label="Username"
          rules="required|unique:users,username"
        />

        <AppFormField
          v-model="form.email"
          name="email"
          label="Email"
          rules="required|email|unique:users,email"
          type="email"
        />

        <AppFormField
          v-model="form.password"
          name="password"
          label="Password"
          rules="required|min:8"
          type="password"
        />

        <div class="form-group">
          <label for="avatar">
            Avatar
            <div v-if="avatarPreview">
              <img :src="avatarPreview" class="avatar-xlarge">
            </div>
          </label>

          <VeeField
            v-show="!avatarPreview"
            name="avatar"
            label="Avatar"
            id="avatar"
            type="file"
            accept="image/*"
            class="form-input"
            @change="handleImageUpload"
          />
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-blue btn-block">Register</button>
        </div>
      </VeeForm>

      <div class="text-center push-top">
        <button class="btn-red btn-xsmall" @click="registerWithGoogle">
          <i class="fa fa-google fa-btn"></i>Sign up with Google
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AppFormField from '@/components/AppFormField.vue'

export default {
  name: 'Register',

  components: {
    AppFormField
  },

  data () {
    return {
      form: {
        name: '',
        username: '',
        email: '',
        password: '',
        avatar: ''
      },
      avatarPreview: null
    }
  },

  methods: {
    async register () {
      await this.$store.dispatch('auth/registerUserWithEmailAndPassword', this.form)
      this.$router.push('/')
    },

    async registerWithGoogle () {
      await this.$store.dispatch('auth/signInWithGoogle')
      this.$router.push('/')
    },

    handleImageUpload (e) {
      this.form.avatar = e.target.files[0]
      const read = new FileReader()

      read.onload = (event) => {
        this.avatarPreview = event.target.result
      }
      read.readAsDataURL(this.form.avatar)
    }
  },

  created () {
    this.$emit('ready')
  }
}
</script>
