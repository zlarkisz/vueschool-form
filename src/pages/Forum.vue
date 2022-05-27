<template>
  <div v-if="forum" class="col-full push-top">
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

  <div v-if="threads && threads.length" class="col-full push-top">
    <ThreadList :threads="threads" />
  </div>
</template>

<script>
import ThreadList from '@/components/ThreadList.vue'
import { findById } from '@/helpers'
import { mapActions } from 'vuex'

export default {
  name: 'Forum',

  components: {
    ThreadList
  },

  props: {
    id: {
      required: true,
      type: String
    }
  },

  computed: {
    forum () {
      return findById(this.$store.state.forums, this.id) || {}
    },

    threads () {
      if (!this.forum && !this.forum.threads) return []
      return this.forum.threads?.map(threadId => this.$store.getters.thread(threadId))
    }
  },

  methods: {
    ...mapActions(['fetchThreads', 'fetchForum', 'fetchUsers'])
  },

  async created  () {
    const forum = await this.fetchForum({ id: this.id })
    const threads = await this.fetchThreads({ ids: forum.threads })
    const usersId = threads.map(thread => thread.userId)
    this.fetchUsers({ ids: usersId })
  }
}
</script>

<style lang="scss" scoped>

</style>
