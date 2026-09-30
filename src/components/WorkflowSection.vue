<script setup lang="ts">
import { UploadCloud, Shield, Search, Rocket } from '@lucide/vue'

const steps = [
  {
    num: '01',
    title: 'Залить аккаунты',
    desc: 'Импорт форматов .session, tdata или авторизация по номеру телефона с привязкой прокси.',
    icon: UploadCloud,
    tag: 'Мгновенный импорт'
  },
  {
    num: '02',
    title: 'Автопрогрев и Защита',
    desc: 'Умный алгоритм имитирует чтение ленты, реакции и диалоги, чтобы Telegram присвоил аккаунтам высокий траст.',
    icon: Shield,
    tag: 'Антибан GGR'
  },
  {
    num: '03',
    title: 'Собрать аудиторию',
    desc: 'Парсер находит целевые каналы и группы с открытыми комментариями и активными участниками по вашей нише.',
    icon: Search,
    tag: 'База в 1 клик'
  },
  {
    num: '04',
    title: 'Запустить поток трафика',
    desc: 'Включайте нейрокомментинг, умный парсер или рассылки. Комбайн работает в облаке 24/7 без нагрузки на ваш компьютер.',
    icon: Rocket,
    tag: 'Всё включено'
  }
]
</script>

<template>
  <section class="workflow-section">
    <div class="container">
      <div class="section-head workflow-head-left">
        <h2 class="section-title">
          Как работает <span class="text-gradient-cyan">X2X-SMM</span>
        </h2>
      </div>

      <div class="workflow-grid">
        <div v-for="(step, idx) in steps" :key="idx" class="workflow-card glass-card">
          <div class="card-step-header">
            <span class="step-num text-gradient-cyan font-mono">{{ step.num }}</span>
            <span class="badge badge-glow">{{ step.tag }}</span>
          </div>

          <div class="step-icon-wrapper">
            <component :is="step.icon" :size="26" class="step-icon" />
          </div>

          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-desc">{{ step.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.workflow-section {
  padding: 60px 0;
}

.workflow-head-left {
  text-align: left;
  max-width: 100%;
  margin: 0 0 32px 0;
}

.section-title {
  font-size: clamp(2rem, 3.8vw, 3rem);
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
}

.workflow-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.workflow-card {
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
}

.card-step-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.step-num {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
}

.step-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.step-icon {
  color: #38bdf8;
}

.step-title {
  font-size: 1.18rem;
  color: #ffffff;
  margin-bottom: 10px;
}

.step-desc {
  font-size: 0.86rem;
  color: #94a3b8;
  line-height: 1.55;
}

@media (max-width: 1024px) {
  .workflow-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .workflow-grid {
    grid-template-columns: 1fr;
  }
}
</style>
