<template>
  <div class="col-full">
    <VeeForm @submit="save" :key="formKey">
      <AppFormField
        v-model="postCopy.text"
        name="text"
        rules="required"
        as="textarea"
        rows="10"
        cols="30"
      />

      <div class="form-actions">
        <button class="btn-blue">{{ post.id ? 'Update post' : 'Submit post' }}</button>
      </div>
    </VeeForm>
  </div>
</template>

<script>
import AppFormField from '@/components/AppFormField.vue'

export default {
  name: 'PostEditor',

  components: {
    AppFormField
  },

  props: {
    post: {
      type: Object,
      default: () => ({ text: null })
    }
  },

  data () {
    return {
      postCopy: { ...this.post },
      formKey: Math.random()
    }
  },

  methods: {
    save () {
      this.$emit('save', { post: this.postCopy })
      this.postCopy.text = ''
      this.formKey = Math.random()
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
