<template>
  <div class="profile-card">
    <VeeForm @submit="save">
      <p class="text-center avatar-edit">
        <label for="avatar">
          <AppAvatarImage
            :src="activeUser.avatar"
            :alt="`${user.name} profile picture`"
            class="avatar-xlarge img-update"
          />
          <div class="avatar-upload-overlay">
            <AppSpinner v-if="uploadingImage" color="white" />
            <fa v-else icon="camera" size="3x" :style="{color: 'white', opacity: '8'}" />
          </div>
          <input
            v-show="false"
            id="avatar"
            type="file"
            accept="image/*"
            @change="handleAvatarUpload"
          >
        </label>
      </p>

      <UserProfileCardEditorRandomAvatar @hit="activeUser.avatar = $event" />

      <AppFormField
        v-model="activeUser.username"
        name="username"
        label="Username"
        :rules="`required|unique:users,username${user.username}`"
      />

      <AppFormField
        v-model="activeUser.name"
        rules="required"
        label="Full Name"
        name="name"
      />

      <AppFormField
        v-model="activeUser.bio"
        name="bio"
        label="Bio"
        as="textarea"
        placeholder="Write a few words about yourself."
      />

      <div class="stats">
        <span>{{ user.postsCount }} posts</span>
        <span>{{ user.threadsCount }} threads</span>
      </div>

      <hr />

      <AppFormField
        v-model="activeUser.website"
        name="website"
        label="Website"
        rules="url"
      />

      <AppFormField
        v-model="activeUser.email"
        name="email"
        label="Email"
        :rules="`required|email|unique:esers,email${user.email}`"
      />

      <AppFormField
        v-model="activeUser.location"
        name="location"
        label="Location"
        list="locations"
        @mouseenter="loadLocationOptions"
      />

      <datalist id="locations">
        <option
          v-for="location in locationOptions"
          :key="location.name.common"
          :value="location.name.common"
        />
      </datalist>

      <div class="btn-group space-between">
        <button class="btn-ghost" @click.prevent="cancel">Cancel</button>
        <button type="submit" class="btn-blue">Save</button>
      </div>
    </VeeForm>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import AppSpinner from '@/components/AppSpinner.vue'
import AppAvatarImage from '@/components/AppAvatarImage.vue'
import UserProfileCardEditorRandomAvatar from '@/components/UserProfileCardEditorRandomAvatar.vue'
import AppFormField from '@/components/AppFormField.vue'

export default {
  name: 'UserProfileCardEditor',

  components: {
    AppSpinner,
    AppAvatarImage,
    UserProfileCardEditorRandomAvatar,
    AppFormField
  },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      uploadingImage: false,
      activeUser: { ...this.user },
      locationOptions: []
    }
  },

  methods: {
    ...mapActions('auth', ['uploadAvatar']),

    async loadLocationOptions () {
      if (this.locationOptions.length) return
      const res = await fetch('https://restcountries.com/v3/all')
      this.locationOptions = await res.json()
    },

    async handleAvatarUpload (e) {
      this.uploadingImage = true
      const file = e.target.files[0]
      let uploadedImage

      try {
        uploadedImage = await this.uploadAvatar({ file })
        this.activeUser.avatar = uploadedImage
      } catch (error) {
        this.activeUser.avatar = uploadedImage || this.activeUser.avatar
      }

      this.uploadingImage = false
    },

    async handleRandomAvatarUpload () {
      const randomAvatarGenerated = this.activeUser.avatar.startsWith('https://pixabay')

      if (randomAvatarGenerated) {
        const image = await fetch(this.activeUser.avatar)
        const blob = await image.blob()
        this.activeUser.avatar = await this.uploadAvatar({ file: blob, filename: 'random' })
      }
    },

    async save () {
      await this.handleRandomAvatarUpload()
      this.$store.dispatch('users/updateUser', { ...this.activeUser })
      this.$router.push({ name: 'Profile' })
    },

    cancel () {
      this.$router.push({ name: 'Profile' })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
