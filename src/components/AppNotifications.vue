<template>
  <div class="notifications">
    <transition-group name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
      >
        <span>{{notification.message}}</span>

        <button @click="removeNotification(notification.id)">🐌</button>
      </div>
    </transition-group>
  </div>
</template>

<script>
import useNotifications from '@/composables/useNotification'

export default {
  setup () {
    const { notifications, removeNotification } = useNotifications()

    return { notifications, removeNotification }
  }
}
</script>

<style scoped>
.notification-enter-active,
.notification-leave-active {
  transition: all 0.5s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.notification-move {
  transition: transform 0.8s ease;
}
</style>
