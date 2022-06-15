<template>
  <div v-if="asyncDataStatus_ready" class="col-full push-top">
    <h1>
      Create new thread in <i>{{ forum.name }}</i>
    </h1>

    <ThreadEditor
      @save="save"
      @cencel="cencel"
      @dirty="formIsDirty = true"
      @clean="formIsDirty = false"
    />
  </div>
</template>

<script>
import ThreadEditor from '@/components/ThreadEditor.vue'
import { findById } from '@/helpers'
import { mapActions } from 'vuex'
import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  name: 'ThreadCreate',

  mixins: [ asyncDataStatus ],

  components: {
    ThreadEditor
  },

  props: {
    forumId: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      formIsDirty: false
    }
  },

  computed: {
    forum () {
      return findById(this.$store.state.forums, this.forumId)
    }
  },

  methods: {
    ...mapActions(['createThread', 'fetchForum']),

    async save ({ title, text }) {
      const thread = await this.createThread({
        forumId: this.forum.id,
        title,
        text
      })
      this.$router.push({ name: 'ThreadShow', params: { id: thread.id } })
    },

    cencel () {
      this.$router.push({ name: 'Forum', params: { id: this.forum.id } })
    }
  },

  async created () {
    await this.fetchForum({ id: this.forumId })
    this.asyncDataStatus_fetched()
  },

  beforeRouteLeave () {
    if (this.formIsDirty) {
      const confirmed = window.confirm('Are you shure you want to leave ? Unsaved changes will be lost !')

      if (!confirmed) return false
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
