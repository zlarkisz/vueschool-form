<template>
  <VeeForm @submit="save">
    <AppFormField
      v-model="form.title"
      name="title"
      label="Title"
      rules="required"
    />

    <AppFormField
      v-model="form.text"
      name="text"
      label="Content"
      rules="required"
      as="textarea"
      rows="8"
      cols="140"
    />

    <div class="btn-group">
      <button type="button" class="btn btn-ghost" @click.prevent="$emit('cencel')">Cancel</button>
      <button class="btn btn-blue" type="submit" name="Publish">
        {{ existing ? 'Update' : 'Publish'}}
      </button>
    </div>
  </VeeForm>
</template>

<script>
import AppFormField from '@/components/AppFormField.vue'

export default {
  name: 'ThreadEditor',

  components: {
    AppFormField
  },

  props: {
    title: {
      type: String,
      default: ''
    },

    text: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      form: {
        title: this.title,
        text: this.text
      }
    }
  },

  watch: {
    form: {
      handler () {
        if (this.form.title !== this.title || this.form.text !== this.text) {
          this.$emit('dirty')
        } else {
          this.$emit('clean')
        }
      },
      deep: true
    }
  },

  computed: {
    existing () {
      return !!this.title
    }
  },

  methods: {
    save () {
      this.$emit('clean')
      this.$emit('save', { ...this.form })
    }
  }
}
</script>
