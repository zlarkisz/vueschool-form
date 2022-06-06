<template>
  <div v-if="asyncDataStatus_ready" class="col-large push-top">
    <h1>
      {{ thread.title }}
      <router-link
        v-if="id"
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
        {{ thread.repliesCount }} replies by {{ thread.contributorsCount }} contributors
      </span>
    </p>

    <PostList :posts="threadPosts"/>

    <PostEditor @save="addPost" />
  </div>
</template>

<script>
import PostList from '@/components/PostList.vue'
import PostEditor from '@/components/PostEditor.vue'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  name: 'TreadShow',

  mixins: [ asyncDataStatus ],

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
    threads () {
      return this.$store.state.threads
    },

    posts () {
      return this.$store.state.posts
    },

    thread () {
      return this.$store.getters.thread(this.id)
    },

    threadPosts () {
      return this.posts.filter(post => post.threadId === this.id)
    }
  },

  methods: {
    ...mapActions([
      'createPost',
      'fetchThread',
      'fetchPost',
      'fetchUsers',
      'fetchPosts'
    ]),

    addPost (eventData) {
      const post = {
        ...eventData.post,
        threadId: this.id
      }

      this.createPost(post)
    }
  },

  async created () {
    // fetch the thread
    const thread = await this.fetchThread({ id: this.id })
    // fetch the posts
    const posts = await this.fetchPosts({ ids: thread.posts })
    // fetch the users accotiated with the posts
    const users = posts.map(post => post.userId).concat(thread.userId)

    await this.fetchUsers({ ids: users })
    this.asyncDataStatus_fetched()
  }
}
</script>

<style>
</style>
