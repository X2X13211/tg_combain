<script setup lang="ts">
import { ArrowRight } from '@lucide/vue'

defineProps<{
  currentUser?: { username: string; email: string } | null
}>()

defineEmits<{
  (e: 'open-register'): void
  (e: 'open-cabinet'): void
  (e: 'open-login'): void
}>()
</script>

<template>
  <section class="hero-section">
    <!-- Ambient Subtle Background Glow -->
    <div class="hero-ambient-glow"></div>

    <div class="container hero-container">
      <!-- Main Headline -->
      <h1 class="hero-title">
        Умный ИИ-комбайн для Telegram
      </h1>

      <!-- Action Buttons -->
      <div class="hero-actions">
        <button
          v-if="currentUser"
          class="btn btn-primary btn-lg"
          @click="$emit('open-cabinet')"
        >
          <span>В личный кабинет</span>
          <ArrowRight :size="17" />
        </button>
        <button
          v-else
          class="btn btn-primary btn-lg"
          @click="$emit('open-register')"
        >
          <span>Зарегистрироваться</span>
          <ArrowRight :size="17" />
        </button>
        <button class="btn btn-secondary btn-lg" @click="$emit('open-login')">
          <span>Попробовать</span>
          <ArrowRight :size="15" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  padding: 56px 0 36px;
  overflow: hidden;
  text-align: center;
}

.hero-ambient-glow {
  position: absolute;
  width: 500px;
  height: 280px;
  background: radial-gradient(circle, rgba(2, 132, 199, 0.14) 0%, rgba(2, 132, 199, 0) 70%);
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
  z-index: 0;
}

.hero-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  font-size: clamp(2.4rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  margin-bottom: 28px;
  max-width: 900px;
  color: #ffffff;
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

@media (max-width: 640px) {
  .hero-section {
    padding: 36px 0 24px;
  }
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  .hero-actions .btn {
    width: 100%;
  }
}
</style>
