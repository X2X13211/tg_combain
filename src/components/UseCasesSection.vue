<script setup lang="ts">
import { CheckCircle2, TrendingUp, Briefcase, Megaphone } from '@lucide/vue'

const cases = [
  {
    role: 'Арбитражник трафика',
    icon: TrendingUp,
    badge: 'Media Buying',
    problem: 'Льёте трафик в крипту, гемблинг или инфобизнес и устали переплачивать за закуп рекламы в Telegram каналах.',
    pipeline: ['Парсер каналов', 'Автопрогрев', 'Нейрокомментинг', 'ЛС-Рассылки'],
    result: 'Собственный бесконечный поток целевых лидов прямо из обсуждений каналов вместо выгорающего рекламного бюджета.'
  },
  {
    role: 'SMM-Агентство & Команда',
    icon: Briefcase,
    badge: 'Agency Mode',
    problem: 'Ведёте продвижение сразу нескольких проектов и клиентов, сложно следить за сессиями и прокси вручную.',
    pipeline: ['Менеджер аккаунтов', 'Нейрочаттинг', 'МассРеакции', 'Журнал задач'],
    result: 'Все аккаунты, связки и аналитика в единой панели. Прозрачные логи и безопасность клиентских ресурсов.'
  },
  {
    role: 'Владелец канала или бота',
    icon: Megaphone,
    badge: 'Channel Growth',
    problem: 'Нужен активный живой фон под новыми постами, органические реакции и привлечение новой теплой аудитории.',
    pipeline: ['Нейрочаттинг', 'Масслукинг сторис', 'Масстегинг', 'Нейродиалоги'],
    result: 'Сотни реакций, осмысленные дискуссии в комментариях и приток подписчиков за счет вирусного внимания.'
  }
]
</script>

<template>
  <section class="use-cases-section">
    <div class="container">
      <div class="section-head text-center">
        <h2 class="section-title">
          Кому подходит <span class="text-gradient-cyan">X2X-SMM</span>
        </h2>
        <p class="section-subtitle">
          Готовые связки для решения типовых задач продвижения в Telegram.
        </p>
      </div>

      <div class="cases-grid">
        <div v-for="(item, idx) in cases" :key="idx" class="case-card glass-card">
          <div class="case-header">
            <div class="case-icon-box">
              <component :is="item.icon" :size="24" class="text-gradient-cyan" />
            </div>
            <div>
              <span class="badge badge-glow">{{ item.badge }}</span>
              <h3 class="case-title">{{ item.role }}</h3>
            </div>
          </div>

          <p class="case-problem">{{ item.problem }}</p>

          <div class="pipeline-box">
            <div class="pipeline-label">Готовая связка модулей:</div>
            <div class="pipeline-chain">
              <template v-for="(step, sIdx) in item.pipeline" :key="sIdx">
                <span class="chain-step">{{ step }}</span>
                <span v-if="sIdx < item.pipeline.length - 1" class="chain-arrow">→</span>
              </template>
            </div>
          </div>

          <div class="result-box">
            <div class="result-title"><CheckCircle2 :size="16" class="text-success" /> Что получаете:</div>
            <p class="result-text">{{ item.result }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.use-cases-section {
  padding: 60px 0;
}

.section-head {
  max-width: 780px;
  margin: 0 auto 40px;
}

.section-title {
  font-size: clamp(2rem, 3.8vw, 3rem);
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.case-card {
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.case-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.case-icon-box {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.case-title {
  font-size: 1.25rem;
  color: #ffffff;
  margin-top: 4px;
}

.case-problem {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 22px;
}

.pipeline-box {
  background: rgba(8, 14, 26, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: var(--radius-md);
  padding: 14px;
  margin-bottom: 22px;
}

.pipeline-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  color: #64748b;
  font-weight: 700;
  margin-bottom: 8px;
}

.pipeline-chain {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.chain-step {
  font-size: 0.78rem;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.25);
  color: #38bdf8;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.chain-arrow {
  color: #64748b;
  font-size: 0.8rem;
}

.result-box {
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.result-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 6px;
}

.result-text {
  font-size: 0.85rem;
  color: #cbd5e1;
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .cases-grid {
    grid-template-columns: 1fr;
    max-width: 600px;
    margin: 0 auto;
  }
}
</style>
