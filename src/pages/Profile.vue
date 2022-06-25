<template>
  <div class="container" style="width: 100%;">
    <div class="flex-grid">
      <div class="col-3 push-top">
        <UserProfileCard v-if="!edit" :user="user" />

        <UserProfileCardEditor v-else :user="user" />
      </div>

      <div class="col-7 push-top">
        <div class="profile-header">
          <span class="text-lead"> {{ user.username }} recent activity </span>
          <a href="#">See only started threads?</a>
        </div>
        <hr />

        <PostList :posts="user.posts" />

        <AppInfiniteScroll
          @load="fetchAuthUsersPosts({ start: lastPostFetched })"
          :done="user.posts.length === user.postsCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PostList from '@/components/PostList'
import UserProfileCard from '@/components/UserProfileCard'
import UserProfileCardEditor from '@/components/UserProfileCardEditor'
import AppInfiniteScroll from '@/components/AppInfiniteScroll'

import { mapGetters, mapActions } from 'vuex'

import asyncDataStatus from '@/mixins/asyncDataStatus'

export default {
  name: 'Profile',

  mixins: [asyncDataStatus],

  components: {
    PostList,
    UserProfileCard,
    UserProfileCardEditor,
    AppInfiniteScroll
  },

  props: {
    edit: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('auth', { user: 'authUser' }),

    lastPostFetched () {
      if (this.user.posts.length === 0) return null

      return this.user.posts[this.user.posts.length - 1]
    }
  },

  methods: {
    ...mapActions('auth', ['fetchAuthUsersPosts'])
  },

  async created () {
    await this.fetchAuthUsersPosts({ start: this.lastPostFetched })

    this.asyncDataStatus_fetched()
  }
}
</script>

<style lang="scss" scoped>

</style>
