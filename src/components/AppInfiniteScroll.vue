<template>
  <div class="intersection-observer" />
</template>

<script>
export default {
  name: 'AppInfiniteScroll',

  props: {
    done: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      observer: null
    }
  },

  watch: {
    done () {
      if (this.done) this.observer.unobserve(this.$el)
    }
  },

  mounted () {
    this.observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) this.$emit('load')
      })
    },
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.9
    })

    this.observer.observe(this.$el)
  },

  unmounted () {
    this.observer.unobserve(this.$el)
  }
}
</script>

<style scoped>
div {
  position: relative;
  z-index: -1;
  pointer-events: none;
  bottom: 200px;
}
</style>
