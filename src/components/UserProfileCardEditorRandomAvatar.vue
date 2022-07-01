<template>
  <div class="text-center" style="margin-bottom: 15px;">
    <button class="btn-green btn-xsmall" @click.prevent="getRandomImage">
      Random Avatar
    </button>
    <br>
    <small style="opacity: .5">Powered by <a href="https://pixabay.com">Pixabay</a></small>
  </div>
</template>

<script>
import { arrayRandom } from '@/helpers'

export default {
  name: 'UserProfileCardEditorRandomAvatar',

  methods: {
    async getRandomImage () {
      const searchTerms = [
        'abstract',
        'cars',
        'mountains',
        'beach',
        'landscape',
        'bee',
        'food',
        'flowers',
        'architecture',
        'patterns',
        'animal',
        'code',
        'morning'
      ]
      const randomWord = arrayRandom(searchTerms)
      const res = await fetch(`https://pixabay.com/api/?key=28378325-655610fdb1b247735be0ed429&q=${randomWord}`)
      const data = await res.json()
      const getRandomImage = arrayRandom(data.hits)
      this.$emit('hit', getRandomImage.webformatURL)
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
