<template>
  <div class="post-list">
    <div
      v-for="post in posts"
      :key="post.id"
      class="post"
    >
      <div v-show="userById(post.userId)" class="user-info">
        <a href="#" class="user-name">{{ userById(post.userId)?.name }}</a>

        <a href="#">
          <AppAvatarImage class="avatar-large" :src="userById(post.userId)?.avatar" />
        </a>

        <p class="desktop-only text-small">{{ userById(post.userId)?.postsCount }} posts</p>
        <p class="desktop-only text-small">{{ userById(post.userId)?.threadsCount }} threads</p>
      </div>

      <div class="post-content">
        <div class="col-full">
          <PostEditor
            v-if="editing === post.id"
            :post="post"
            @save="handleUpdate"
          />

          <p v-else>{{ post.text }}</p>
        </div>
        <a
          v-if="post.userId === $store.state.auth.authId"
          href="#"
          style="margin-left: auto; padding-left:10px;"
          class="link-unstyled"
          title="Make a change"
          @click.prevent="toggleEditMode(post.id)"
        >
          <fa icon="pencil" />
        </a>
      </div>

      <div v-if="post && post.publishedAt" class="post-date text-faded">
        <div v-if="post.edited?.at" class="edition-info">edited</div>
        <AppDate :timestamp="post.publishedAt"/>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import PostEditor from '@/components/PostEditor.vue'
import AppAvatarImage from '@/components/AppAvatarImage.vue'

export default {
  name: 'PostList',

  components: {
    PostEditor,
    AppAvatarImage
  },

  props: {
    posts: {
      required: true,
      type: Array
    }
  },

  data () {
    return {
      editing: null
    }
  },

  computed: {
    users () {
      return this.$store.state.users.items
    }
  },

  methods: {
    ...mapActions('posts', ['updatePost']),

    userById (userId) {
      return this.$store.getters['users/user'](userId)
    },

    toggleEditMode (id) {
      this.editing = id === this.editing ? null : id
    },

    handleUpdate (event) {
      this.updatePost(event.post)
      this.editing = null
    }
  }
}
</script>

<style>
</style>
