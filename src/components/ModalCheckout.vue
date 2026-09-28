<script setup lang="ts">
import { ref, computed } from 'vue'
import { ShieldCheck, ArrowRight, Lock } from '@lucide/vue'

const props = defineProps<{
  initialPlan?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const selectedPlan = ref(props.initialPlan || '3m')
const promoInput = ref('')
const promoApplied = ref(false)
const isSubmitting = ref(false)
const isPaidSuccess = ref(false)

const plansData: Record<string, { title: string; price: number; period: string; save: string | null }> = {
  '1m': { title: '1 Месяц', price: 899, period: 'за 1 месяц', save: null },
  '3m': { title: '3 Месяца', price: 1999, period: 'за 3 месяца (666 ₽/мес)', save: 'Выгода 26%' },
  '1y': { title: '1 Год', price: 4999, period: 'за 1 год (416 ₽/мес)', save: 'Выгода 54%' }
}

const finalPrice = computed(() => {
  const base = plansData[selectedPlan.value].price
  if (promoApplied.value) {
    return Math.round(base * 0.9)
  }
  return base
})

const applyPromo = () => {
  if (promoInput.value.trim().toLowerCase() === 'x2x' || promoInput.value.trim().toLowerCase() === 'start') {
    promoApplied.value = true
  }
}

const handlePay = () => {
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    isPaidSuccess.value = true
  }, 1200)
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content checkout-modal">
      <button class="modal-close-btn" @click="$emit('close')">✕</button>

      <!-- SUCCESS SCREEN -->
      <div v-if="isPaidSuccess" class="success-screen text-center">
        <div class="success-icon-box">
          <ShieldCheck :size="48" class="text-gradient-cyan" />
        </div>
        <h3 class="success-title">Подписка успешно активирована!</h3>
        <p class="success-text">
          Тариф <strong>{{ plansData[selectedPlan].title }}</strong> подключен. Вам доступны все 15 модулей комбайна, безлимитная ИИ и авторешение капчи.
        </p>
        <div class="success-creds-box font-mono">
          <div>Лицензионный ключ: <span class="text-gradient-cyan">X2X-PRO-{{ Math.floor(Math.random() * 89999 + 10000) }}-ACT</span></div>
          <div>Срок действия: {{ selectedPlan === '1y' ? '365 дней' : selectedPlan === '3m' ? '90 дней' : '30 дней' }}</div>
        </div>
        <button class="btn btn-primary btn-block" @click="$emit('close')">
          <span>Перейти в панель управления</span>
          <ArrowRight :size="16" />
        </button>
      </div>

      <!-- CHECKOUT FORM -->
      <div v-else class="checkout-form">
        <div class="checkout-header">
          <h3 class="checkout-title">Выберите тариф</h3>
          <p class="checkout-subtitle">Все 15 модулей включены в любой тариф. Мгновенная активация.</p>
        </div>

        <!-- Plan Selector -->
        <div class="plans-selector">
          <div
            v-for="(p, pKey) in plansData"
            :key="pKey"
            class="plan-select-card"
            :class="{ active: selectedPlan === pKey }"
            @click="selectedPlan = pKey"
          >
            <div class="p-select-top">
              <span class="p-select-title">{{ p.title }}</span>
              <span v-if="p.save" class="p-save-pill">{{ p.save }}</span>
            </div>
            <div class="p-select-price">{{ p.price.toLocaleString('ru-RU') }} ₽</div>
            <div class="p-select-period">{{ p.period }}</div>
          </div>
        </div>

        <!-- Promo Code -->
        <div class="promo-box">
          <div class="promo-input-row">
            <input
              v-model="promoInput"
              type="text"
              class="input-field"
              placeholder="Промокод (введите X2X для скидки 10%)"
              :disabled="promoApplied"
            />
            <button class="btn btn-secondary btn-sm" :disabled="promoApplied" @click="applyPromo">
              {{ promoApplied ? 'Применен -10%' : 'Применить' }}
            </button>
          </div>
        </div>

        <!-- Summary & CTA -->
        <div class="checkout-footer">
          <div class="total-row">
            <span>Итого к оплате:</span>
            <div class="total-amount">
              <span v-if="promoApplied" class="old-price">{{ plansData[selectedPlan].price }} ₽</span>
              <span class="final-price text-gradient-cyan">{{ finalPrice.toLocaleString('ru-RU') }} ₽</span>
            </div>
          </div>

          <button class="btn btn-primary btn-block btn-lg" :disabled="isSubmitting" @click="handlePay">
            <Lock :size="18" />
            <span>{{ isSubmitting ? 'Обработка платежа...' : 'Оплатить ' + finalPrice.toLocaleString('ru-RU') + ' ₽' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.checkout-modal {
  max-width: 580px;
  padding: 32px;
}

.modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 6px;
}

.checkout-title {
  font-size: 1.45rem;
  color: #ffffff;
  margin-bottom: 4px;
}

.checkout-subtitle {
  font-size: 0.88rem;
  color: #94a3b8;
  margin-bottom: 22px;
}

.plans-selector {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.plan-select-card {
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: var(--radius-md);
  padding: 14px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
}

.plan-select-card.active {
  border-color: #38bdf8;
  background: rgba(0, 136, 204, 0.18);
  box-shadow: 0 0 20px rgba(0, 136, 204, 0.25);
}

.p-select-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.p-select-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

.p-save-pill {
  font-size: 0.65rem;
  font-weight: 800;
  background: #10b981;
  color: #050b14;
  padding: 1px 6px;
  border-radius: 4px;
}

.p-select-price {
  font-size: 1.25rem;
  font-weight: 900;
  color: #ffffff;
  margin-bottom: 4px;
}

.p-select-period {
  font-size: 0.7rem;
  color: #94a3b8;
}

.btn-block {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 18px 28px;
  font-size: 1.15rem;
  font-weight: 800;
  border-radius: var(--radius-md);
  box-shadow: 0 4px 20px rgba(2, 132, 199, 0.4);
  transition: all 0.2s ease;
}

.btn-block:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 25px rgba(56, 189, 248, 0.5);
}

.promo-box {
  margin-bottom: 24px;
}

.promo-input-row {
  display: flex;
  gap: 8px;
}

.checkout-footer {
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 1.05rem;
  font-weight: 600;
  color: #ffffff;
}

.total-amount {
  display: flex;
  align-items: center;
  gap: 10px;
}

.old-price {
  text-decoration: line-through;
  color: #64748b;
  font-size: 1.1rem;
}

.final-price {
  font-size: 1.8rem;
  font-weight: 900;
}

/* Success Screen */
.success-screen {
  padding: 30px 10px;
}

.success-icon-box {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.success-title {
  font-size: 1.5rem;
  color: #ffffff;
  margin-bottom: 10px;
}

.success-text {
  font-size: 0.92rem;
  color: #94a3b8;
  max-width: 440px;
  margin: 0 auto 24px;
  line-height: 1.5;
}

.success-creds-box {
  background: rgba(8, 14, 26, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 16px;
  border-radius: var(--radius-md);
  margin-bottom: 24px;
  font-size: 0.85rem;
  color: #cbd5e1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 640px) {
  .plans-selector {
    grid-template-columns: 1fr;
  }
}
</style>
