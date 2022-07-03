<template>
  <div v-if="asyncDataStatus_ready" class="col-large push-top">
    <h1>
      {{ thread.title }}
      <router-link
        v-if="thread.userId === authUser?.id"
        :to="{ name: 'ThreadEdit', id: this.id }"
        custom
        v-slot="{ href }"
      >
        <button
          class="btn-green btn-small"
          @click="$router.push(href)"
        >
          Edit Thread
        </button>
      </router-link>
    </h1>

    <p v-if="thread && thread.publishedAt">
      By <a href="" class="link-unstyled">{{ thread.author?.name }}</a>, <AppDate :timestamp="thread.publishedAt" />.
      <span
        style="float: right; margin-top: 2px;"
        class="hide-mobile text-fade text-small"
      >
        {{ thread.repliesCount }}
        {{thread.repliesCount === 1 ? 'reply' : 'replies'}}
        by {{ thread.contributorsCount }}
        {{thread.contributorsCount === 1 ? 'contributor' : 'contributors'}}
      </span>
    </p>

    <PostList :posts="threadPosts"/>

    <PostEditor v-if="authUser" @save="addPost" />

    <div v-else class="text-center" style="margin-bottom: 50px;">
      <router-link :to="{name: 'SignIn', query: {redirectTo: $route.path}}">Sign In</router-link>
        or
      <router-link :to="{name: 'Register', query: {redirectTo: $route.path}}">Register</router-link>
        to reply.
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList.vue'
import PostEditor from '@/components/PostEditor.vue'
import { mapActions, mapGetters } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'
import useNotifications from '@/composables/useNotification'
import difference from 'lodash/difference'

export default {
  name: 'TreadShow',

  mixins: [ asyncDataStatus ],

  setup () {
    const { addNotification } = useNotifications()

    return { addNotification }
  },

  components: {
    PostList,
    PostEditor
  },

  props: {
    id: {
      required: true,
      type: String
    }
  },

  computed: {
    ...mapGetters('auth', ['authUser']),

    threads () {
      return this.$store.state.threads.items
    },

    posts () {
      return this.$store.state.posts.items
    },

    thread () {
      return this.$store.getters['threads/thread'](this.id)
    },

    threadPosts () {
      return this.posts.filter(post => post.threadId === this.id)
    }
  },

  methods: {
    ...mapActions('posts', ['createPost', 'fetchPosts']),
    ...mapActions('threads', ['fetchThread']),
    ...mapActions('users', ['fetchUsers']),

    addPost (eventData) {
      const post = {
        ...eventData.post,
        threadId: this.id
      }

      this.createPost(post)
    },

    async fetchPostsWithUsers (ids) {
      // fetch the posts
      const posts = await this.fetchPosts({
        ids: ids,
        onSnapshotFunction: ({ isLocal, previousItem }) => {
          if (
            !this.asyncDataStatus_ready ||
              isLocal ||
              (previousItem?.edited && !previousItem?.edited?.at)
          ) return

          this.addNotification({ message: 'Thread recently updated !', timeout: 5000 })
        }
      })
      // fetch the users accotiated with the posts
      const users = posts.map(post => post.userId).concat(this.thread.userId)

      await this.fetchUsers({ ids: users })
    }
  },

  async created () {
    // fetch the thread
    const thread = await this.fetchThread({
      id: this.id,
      onSnapshotFunction: async ({ isLocal, item, previousItem }) => {
        if (!this.asyncDataStatus_ready || isLocal) return

        const newPosts = difference(item.posts, previousItem.posts)
        const hasNewPosts = newPosts.length > 0

        if (hasNewPosts) {
          await this.fetchPostsWithUsers(newPosts)
        } else {
          this.addNotification({ message: 'Thread recently updated !', timeout: 5000 })
        }
      }
    })

    await this.fetchPostsWithUsers(thread.posts)
    this.asyncDataStatus_fetched()
  }
}
</script>

<style>
</style>
