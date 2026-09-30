<script setup lang="ts">
import { ref, computed } from 'vue'
import { Check, Zap, ArrowRight } from '@lucide/vue'

defineEmits<{
  (e: 'select-plan', planId: string): void
}>()

// ROI Calculator State
const adSpend = ref(35000)

const calculatedSavings = computed(() => {
  const annualCost = 4999
  const monthlyAd = adSpend.value
  const annualAd = monthlyAd * 12
  const saved = Math.max(0, annualAd - annualCost)
  return saved.toLocaleString('ru-RU')
})

const plans = [
  {
    id: '1m',
    duration: '1 Месяц',
    price: 899,
    period: '/ месяц',
    equivalent: '899 ₽ в месяц',
    discount: null,
    popular: false,
    tag: 'Базовый',
    description: 'Идеально для тестирования связок и первого знакомства с комбайном.',
    features: [
      'Доступ ко ВСЕМ 15 модулям комбайна',
      'Встроенная нейросеть (токены бесплатно)',
      'Авторешение капч без доплат',
      'Менеджер аккаунтов + Telegram Web',
      'Умный парсер каналов и чатов',
      'ИИ-Защита аккаунтов от банов',
      'Техническая поддержка 24/7'
    ]
  },
  {
    id: '3m',
    duration: '3 Месяца',
    price: 1999,
    period: '/ за 3 месяца',
    equivalent: 'всего 666 ₽ в месяц',
    discount: 'Выгода 26%',
    popular: true,
    tag: 'Популярно',
    description: 'Самый популярный выбор арбитражников и маркетологов для стабильного потока лидов.',
    features: [
      'Доступ ко ВСЕМ 15 модулям комбайна',
      'Встроенная нейросеть (токены бесплатно)',
      'Авторешение капч без доплат',
      'Менеджер аккаунтов + Telegram Web',
      'Умный парсер каналов и чатов',
      'Приоритетная очередь генерации ИИ',
      'Готовые проверенные пресеты промптов',
      'Приоритетная поддержка в Telegram'
    ]
  },
  {
    id: '1y',
    duration: '1 Год',
    price: 4999,
    period: '/ за 12 месяцев',
    equivalent: 'всего 416 ₽ в месяц',
    discount: 'Выгода 54%',
    popular: false,
    tag: 'Выгода 54%',
    description: 'Для агентств, команд и каналов: год непрерывного трафика по цене одного рекламного поста.',
    features: [
      'Доступ ко ВСЕМ 15 модулям комбайна',
      'Встроенная нейросеть (токены бесплатно)',
      'Авторешение капч без доплат',
      'Все будущие обновления и новые модули',
      'Персональная VIP-линия поддержки',
      'Консультация по настройке безопасных связок',
      'Максимальная экономия 54%'
    ]
  }
]
</script>

<template>
  <section id="pricing" class="pricing-section">
    <div class="container">
      <!-- Section Header -->
      <div class="section-head text-center">
        <h2 class="section-title">
          Тарифные планы <span class="text-gradient-cyan">X2X-SMM</span>
        </h2>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="pricing-grid">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="pricing-card glass-card"
          :class="{ 'card-popular': plan.popular }"
        >
          <!-- Popular / VIP Ribbon -->
          <div v-if="plan.tag" class="plan-tag-strip" :class="{ 'tag-popular': plan.popular, 'tag-vip': plan.id === '1y' }">
            {{ plan.tag }}
          </div>

          <div class="card-top">
            <h3 class="plan-title">{{ plan.duration }}</h3>
            <p class="plan-desc">{{ plan.description }}</p>

            <div class="price-box">
              <div class="price-row">
                <span class="currency">₽</span>
                <span class="price-val">{{ plan.price.toLocaleString('ru-RU') }}</span>
                <span class="price-period">{{ plan.period }}</span>
              </div>
              <div class="price-sub">
                <span class="equivalent-text">{{ plan.equivalent }}</span>
                <span v-if="plan.discount" class="discount-pill">{{ plan.discount }}</span>
              </div>
            </div>
          </div>

          <div class="card-features">
            <div class="features-label">Что входит в подписку:</div>
            <ul class="features-list">
              <li v-for="(feat, fIdx) in plan.features" :key="fIdx" class="feature-line">
                <div class="check-icon-box">
                  <Check :size="14" />
                </div>
                <span>{{ feat }}</span>
              </li>
            </ul>
          </div>

          <div class="card-bottom">
            <button
              class="btn btn-block"
              :class="plan.popular ? 'btn-primary' : 'btn-secondary'"
              @click="$emit('select-plan', plan.id)"
            >
              <span>Выбрать тариф</span>
              <ArrowRight :size="16" />
            </button>
            <div class="bottom-guarantee">
              <Zap :size="13" />
              <span>Мгновенный доступ сразу после оплаты</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Interactive ROI / Savings Calculator -->
      <div class="roi-calculator-box glass-card">
        <div class="roi-head">
          <div class="roi-icon-wrapper">
            <Zap :size="24" class="text-gradient-cyan" />
          </div>
          <div>
            <h3 class="roi-title">Калькулятор экономии бюджета на рекламу</h3>
            <p class="roi-desc">Сравните стоимость классического закупа рекламы в каналах с автоматизацией через X2X-SMM.</p>
          </div>
        </div>

        <div class="roi-body">
          <div class="roi-slider-block">
            <div class="slider-label-row">
              <span>Сколько вы тратите на закуп рекламы в Telegram в месяц:</span>
              <span class="slider-value font-mono">{{ adSpend.toLocaleString('ru-RU') }} ₽/мес</span>
            </div>
            <input
              v-model.number="adSpend"
              type="range"
              min="5000"
              max="200000"
              step="5000"
              class="range-slider"
            />
            <div class="slider-ticks">
              <span>5 000 ₽</span>
              <span>50 000 ₽</span>
              <span>100 000 ₽</span>
              <span>200 000 ₽</span>
            </div>
          </div>

          <div class="roi-result-block">
            <div class="roi-result-label">Ваша годовая экономия с X2X-SMM:</div>
            <div class="roi-result-amount text-gradient-cyan font-mono">{{ calculatedSavings }} ₽</div>
            <div class="roi-result-note">
              Годовой тариф X2X-SMM стоит всего <strong>4 999 ₽</strong> и работает круглосуточно без усталости и человеческого фактора.
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pricing-section {
  padding: 80px 0;
  position: relative;
}

.section-head {
  max-width: 820px;
  margin: 0 auto 44px;
}

.section-title {
  font-size: clamp(2rem, 3.8vw, 3rem);
  margin-bottom: 14px;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.all-included-banner {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: rgba(2, 132, 199, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.2);
  padding: 10px 20px;
  border-radius: var(--radius-pill);
  font-size: 0.9rem;
  color: #e2e8f0;
}

.banner-icon {
  color: #38bdf8;
  flex-shrink: 0;
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  align-items: stretch;
  margin-bottom: 50px;
}

.pricing-card {
  padding: 32px 28px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: all 0.25s ease;
}

.card-popular {
  border-color: rgba(56, 189, 248, 0.35);
  background: rgba(14, 22, 38, 0.9);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
}

.card-popular:hover {
  transform: translateY(-4px);
}

.plan-tag-strip {
  position: absolute;
  top: 16px;
  right: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.tag-popular {
  background: rgba(2, 132, 199, 0.2);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.35);
  box-shadow: none;
}

.tag-vip {
  background: rgba(5, 150, 105, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.35);
}

.plan-title {
  font-size: 1.55rem;
  color: #ffffff;
  margin-bottom: 8px;
}

.plan-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.45;
  margin-bottom: 24px;
  min-height: 40px;
}

.price-box {
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  margin-bottom: 24px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: #38bdf8;
}

.price-val {
  font-size: 3rem;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  letter-spacing: -0.03em;
}

.price-period {
  font-size: 0.88rem;
  color: #94a3b8;
  margin-left: 4px;
}

.price-sub {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.equivalent-text {
  font-size: 0.82rem;
  color: #cbd5e1;
  font-weight: 600;
}

.discount-pill {
  font-size: 0.72rem;
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.12);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.features-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
  margin-bottom: 16px;
}

.features-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 30px;
}

.feature-line {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.88rem;
  color: #e2e8f0;
  line-height: 1.4;
}

.check-icon-box {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.btn-block {
  width: 100%;
}

.bottom-guarantee {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 14px;
}

/* ROI Calculator */
.roi-calculator-box {
  padding: 36px;
  background: rgba(13, 21, 38, 0.8);
  border: 1px solid rgba(0, 180, 255, 0.3);
}

.roi-head {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 28px;
}

.roi-icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.roi-title {
  font-size: 1.35rem;
  color: #ffffff;
  margin-bottom: 4px;
}

.roi-desc {
  font-size: 0.9rem;
  color: #94a3b8;
}

.roi-body {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 36px;
  align-items: center;
}

.slider-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.92rem;
  color: #cbd5e1;
  margin-bottom: 14px;
}

.slider-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: #38bdf8;
}

.range-slider {
  width: 100%;
  -webkit-appearance: none;
  height: 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  cursor: pointer;
}

.range-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #00d2ff;
  box-shadow: 0 0 15px rgba(0, 210, 255, 0.8);
  cursor: pointer;
  border: 2px solid #ffffff;
}

.slider-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 8px;
}

.roi-result-block {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(0, 180, 255, 0.25);
  border-radius: var(--radius-lg);
  padding: 24px;
  text-align: center;
}

.roi-result-label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.roi-result-amount {
  font-size: 2.4rem;
  font-weight: 900;
  line-height: 1.1;
  margin-bottom: 8px;
}

.roi-result-note {
  font-size: 0.78rem;
  color: #cbd5e1;
  line-height: 1.45;
}

.roi-result-note strong {
  color: #38bdf8;
}

@media (max-width: 1024px) {
  .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
  }
  .card-popular {
    transform: none;
  }
  .roi-body {
    grid-template-columns: 1fr;
  }
}
</style>
