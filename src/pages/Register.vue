<template>
  <div class="flex-grid justify-center">
    <div class="col-2">
      <VeeForm
        @submit="register"
        class="card card-form"
      >
        <h1 class="text-center">Register</h1>

        <div class="form-group">
          <label for="name">Full Name</label>
          <VeeField
            v-model="form.name"
            name="name"
            id="name"
            type="text"
            class="form-input"
            rules="required"
          />
          <VeeErrorMessage name="name" class="form-error" />
        </div>

        <div class="form-group">
          <label for="username">Username</label>
          <VeeField
            v-model="form.username"
            name="username"
            id="username"
            type="text"
            class="form-input"
            rules="required"
          />
          <VeeErrorMessage name="username" class="form-error" />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <VeeField
            v-model="form.email"
            name="email"
            id="email"
            type="email"
            class="form-input"
            rules="required|email"
          />
          <VeeErrorMessage name="email" class="form-error" />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <VeeField
            v-model="form.password"
            name="password"
            label="Password"
            id="password"
            type="password"
            class="form-input"
            rules="required|min:8"
          />
          <VeeErrorMessage name="password" class="form-error" />
        </div>

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
export default {
  name: 'Register',

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
