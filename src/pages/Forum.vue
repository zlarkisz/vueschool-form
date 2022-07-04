<template>
  <div v-if="asyncDataStatus_ready" class="container col-full">
    <div v-if="forum" class="col-full push-top">
      <AppHead>
        <title>{{ forum?.name }}</title>
        <meta property="og:title" :content="forum?.name">
        <meta name="twitter:title" :content="forum?.name">
      </AppHead>

      <div class="forum-header">
        <div class="forum-details">
          <h1>{{ forum.name }}</h1>
          <p class="text-lead">{{ forum.description }}</p>
        </div>
        <router-link
          v-if="forum && forum.id"
          :to="{name: 'ThreadCreate', params: { forumId: forum.id }}"
          class="btn-green btn-small"
        >
          Start a thread
        </router-link>
      </div>
    </div>

    <div class="col-full push-top">
      <ThreadList :threads="threads" />

      <v-pagination
        v-model="page"
        :pages="totalPages"
        active-color="#57AD8D"
      />
    </div>
  </div>
</template>

<script>
import ThreadList from '@/components/ThreadList.vue'
import { findById } from '@/helpers'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  name: 'Forum',

  mixins: [ asyncDataStatus ],

  components: {
    ThreadList
  },

  props: {
    id: {
      required: true,
      type: String
    }
  },

  data () {
    return {
      page: parseInt(this.$route.query.page) || 1,
      perPage: 3
    }
  },

  computed: {
    forum () {
      return findById(this.$store.state.forums.items, this.id)
    },

    threads () {
      if (!this.forum && !this.forum.threads) return []
      return this.$store.state.threads.items
        .filter(thread => thread.forumId === this.forum.id)
        .map(thread => this.$store.getters['threads/thread'](thread.id))
    },

    threadCount () {
      return this.forum.threads?.length || 0
    },

    totalPages () {
      if (!this.threadCount) return 0

      return Math.ceil(this.threadCount / this.perPage)
    }
  },

  watch: {
    async page (page) {
      this.$router.push({ query: { page: this.page } })
    }
  },

  methods: {
    ...mapActions('threads', ['fetchThreadsByPage']),
    ...mapActions('forums', ['fetchForum']),
    ...mapActions('users', ['fetchUsers'])
  },

  async created  () {
    const forum = await this.fetchForum({ id: this.id })
    const threads = await this.fetchThreadsByPage({
      ids: forum.threads,
      page: this.page,
      perPage: this.perPage
    })
    const usersId = threads.map(thread => thread.userId)
    await this.fetchUsers({ ids: usersId })
    this.asyncDataStatus_fetched()
  }
}
</script>

<style lang="scss" scoped>

</style>
