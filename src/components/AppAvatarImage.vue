<template>
  <img :src="src || '/user-placeholder.jpeg'">
</template>

<script>
export default {
  name: 'AppAvatarImage',

  props: {
    src: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
img {
  object-fit: cover;
}
</style>
