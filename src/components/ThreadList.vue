<template>
  <div class="col-full">

    <div class="thread-list">

      <h2 class="list-title">Threads</h2>

      <div v-for="thread in threads" :key="thread.id" class="thread">
        <div>
          <p v-if="thread && thread.id">
            <router-link :to="{ name: 'ThreadShow', params: { id: thread.id } }">{{ thread.title }}</router-link>
          </p>
          <p v-if="thread && thread.publishedAt" class="text-faded text-xsmall">
            By <a href="#">{{ userById(thread.userId).name }}</a>, <AppDate :timestamp="thread.publishedAt"/>.
          </p>
        </div>

        <div class="activity">
          <p class="replies-count">
            {{ thread.repliesCount }} replies
          </p>

          <AppAvatarImage class="avatar-medium" :src="userById(thread.userId).avatar" />

          <div>
            <p class="text-xsmall">
              <a href="#">{{ userById(thread.userId).name }}</a>
            </p>
            <p v-if="thread && thread.publishedAt" class="text-xsmall text-faded">
              <AppDate :timestamp="thread.publishedAt"/>
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import { findById } from '@/helpers'
import AppAvatarImage from '@/components/AppAvatarImage.vue'

export default {
  components: {
    AppAvatarImage
  },

  props: {
    threads: {
      type: Array,
      required: true
    }
  },

  computed: {
    posts () {
      return this.$store.state.posts.items
    },

    users () {
      return this.$store.state.users.items
    }
  },

  methods: {
    postById (postId) {
      return findById(this.posts, postId) || {}
    },

    userById (userId) {
      return findById(this.users, userId) || {}
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
