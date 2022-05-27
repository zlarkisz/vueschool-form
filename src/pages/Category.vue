<template>
  <h1>{{ category.name }}</h1>
  <ForumList
    :title="category.name"
    :forums="getForumsForCategory(category)"
  />
</template>

<script>
import ForumList from '@/components/ForumList.vue'
import { findById } from '@/helpers'
import { mapActions } from 'vuex'

export default {
  name: 'Category',

  components: {
    ForumList
  },

  props: {
    id: {
      required: true,
      type: String
    }
  },

  computed: {
    category () {
      return findById(this.$store.state.categories, this.id) || {}
    }
  },

  methods: {
    ...mapActions(['fetchForums', 'fetchCategory']),

    getForumsForCategory (category) {
      return this.$store.state.forums.filter(forum => forum.categoryId === category.id)
    }
  },

  async created () {
    const category = await this.fetchCategory({ id: this.id })
    this.fetchForums({ ids: category.forums })
  }
}
</script>

<style lang="scss" scoped>

</style>
