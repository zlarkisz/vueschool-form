<template>
  <span :title="humanFriendlyDate">
    {{ diffForHumans }}
  </span>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import localizedDate from 'dayjs/plugin/localizedFormat'
dayjs.extend(localizedDate)
dayjs.extend(relativeTime)

export default {
  name: 'AppDate',

  props: {
    timestamp: {
      required: true,
      type: [Number, Object]
    }
  },

  computed: {
    normalizedTimestamp () {
      return this.timestamp?.seconds || this.timestamp
    },

    diffForHumans () {
      return dayjs.unix(this.normalizedTimestamp).fromNow()
    },

    humanFriendlyDate () {
      return dayjs.unix(this.normalizedTimestamp).format('llll')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
