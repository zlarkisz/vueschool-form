<template>
  <div class="form-group">
    <label v-if="label" :for="name">{{ label }}</label>

    <VeeField
      :modalValue="modalValue"
      :name="name"
      :label="label"
      :id="name"
      class="form-input"
      v-bind="$attrs"
      @input="$emit('modelUpdate', $event)"
    />

    <VeeErrorMessage :name="name" class="form-error" />
  </div>
</template>

<script>
export default {
  name: 'AppFormField',

  inheritAttrs: false,

  props: {
    name: {
      type: String,
      required: true
    },
    label: {
      type: String,
      default: ''
    },
    modalValue: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
