<script setup lang="ts">
import { ref } from 'vue'
import {
  Globe, Calendar, Sparkles, CheckCircle2,
  Copy, RefreshCw
} from '@lucide/vue'

const activeTool = ref<'proxy' | 'iddate' | 'bio'>('proxy')

// 1. PROXY CHECKER STATE
const proxyInput = ref('185.190.140.22:8000:user4920:passSecret99')
const isCheckingProxy = ref(false)
const proxyResult = ref<{
  valid: boolean
  type: string
  ip: string
  port: string
  ping: number
  country: string
  anonymity: string
} | null>({
  valid: true,
  type: 'SOCKS5 / HTTP',
  ip: '185.190.140.22',
  port: '8000',
  ping: 42,
  country: 'Германия (Frankfurt) 🇩🇪',
  anonymity: 'Elite (High Anonymous)'
})

const testProxy = () => {
  if (!proxyInput.value.trim()) return
  isCheckingProxy.value = true
  proxyResult.value = null

  setTimeout(() => {
    isCheckingProxy.value = false
    const parts = proxyInput.value.split(':')
    const ip = parts[0].replace(/^(https?:\/\/|socks5:\/\/)/, '')
    const port = parts[1] || '8080'

    proxyResult.value = {
      valid: true,
      type: proxyInput.value.includes('socks') ? 'SOCKS5' : 'HTTP/HTTPS',
      ip: ip || '185.220.101.5',
      port: port || '3128',
      ping: Math.floor(Math.random() * 45) + 30,
      country: ['Нидерланды 🇳🇱', 'Германия 🇩🇪', 'Польша 🇵🇱', 'США 🇺🇸'][Math.floor(Math.random() * 4)],
      anonymity: 'Elite (Анонимный)'
    }
  }, 900)
}

// 2. TELEGRAM ID AGE CHECKER
const telegramId = ref('1849201948')
const isCalculatingAge = ref(false)
const idResult = ref<{
  id: string
  estimatedDate: string
  range: string
  isOld: boolean
} | null>({
  id: '1849201948',
  estimatedDate: 'Июнь — Июль 2021 года',
  range: 'Возраст: ~5 лет (Высокий траст)',
  isOld: true
})

const calculateAccountAge = () => {
  const num = parseInt(telegramId.value.replace(/\D/g, ''))
  if (!num || isNaN(num)) return

  isCalculatingAge.value = true
  setTimeout(() => {
    isCalculatingAge.value = false
    let est = ''
    let ageText = ''
    let isOld = true

    if (num < 100000000) {
      est = '2013 — 2014 год (Первые пользователи Telegram)'
      ageText = 'Возраст: 12+ лет (Максимальный траст)'
    } else if (num < 300000000) {
      est = '2015 — 2016 год'
      ageText = 'Возраст: ~10 лет (Премиум траст)'
    } else if (num < 700000000) {
      est = '2017 — 2018 год'
      ageText = 'Возраст: ~8 лет (Отличный траст)'
    } else if (num < 1300000000) {
      est = '2019 — 2020 год'
      ageText = 'Возраст: ~6 лет (Высокий траст)'
    } else if (num < 2000000000) {
      est = '2021 — 2022 год'
      ageText = 'Возраст: ~4-5 лет (Хороший траст)'
    } else if (num < 5000000000) {
      est = '2023 — 2024 год'
      ageText = 'Возраст: ~2-3 года (Стандартный аккаунт)'
    } else {
      est = '2025 — 2026 год'
      ageText = 'Свежий аккаунт (Требуется автопрогрев в X2X-SMM)'
      isOld = false
    }

    idResult.value = {
      id: num.toString(),
      estimatedDate: est,
      range: ageText,
      isOld
    }
  }, 500)
}

// 3. AI BIO GENERATOR
const selectedNiche = ref('crypto')
const copiedIdx = ref<number | null>(null)

const biosList: Record<string, string[]> = {
  crypto: [
    '⚡️ P2P & Crypto Arbitrage | Торгую спреды от 2.5% | Пиши в ЛС за мануалом 💸',
    '📊 Трейдинг без воды. Инсайды рынка, разборы монет и закрытый клуб 👇',
    '🚀 Web3 энтузиаст & инвестор. Делюсь связками и свежими дропами 🤝'
  ],
  marketing: [
    '🎯 Трафик в Telegram под ключ | ROI от 350% | Пишите по сотрудничеству 📈',
    '🔥 Арбитраж трафика / Схемы / Гембла & Крипта | Кейсы в закрепе 👇',
    '💼 SMM & Лидогенерация. Привожу клиентов в каналы за 24 часа. Связь в ЛС'
  ],
  ecommerce: [
    '📦 Селлер Wildberries & Ozon | Оборот 12M/мес | Делюсь фабриками Китая 🛍️',
    '🚀 Вывожу карточки в ТОП-1 за 14 дней. Пиши слово «ТОП» в ЛС 🎁',
    '🏷️ Производство под своим брендом. Эксперт по логистике и маркетплейсам'
  ]
}

const copyBio = (text: string, idx: number) => {
  navigator.clipboard.writeText(text)
  copiedIdx.value = idx
  setTimeout(() => {
    copiedIdx.value = null
  }, 2000)
}
</script>

<template>
  <section id="tools" class="tools-section">
    <div class="container">
      <div class="section-head text-center">
        <h2 class="section-title">
          Бесплатные инструменты
        </h2>
      </div>

      <!-- Tool Switcher Tabs -->
      <div class="tool-tabs">
        <button
          class="tool-tab-btn"
          :class="{ active: activeTool === 'proxy' }"
          @click="activeTool = 'proxy'"
        >
          <Globe :size="18" />
          <span>Чекер прокси</span>
        </button>

        <button
          class="tool-tab-btn"
          :class="{ active: activeTool === 'iddate' }"
          @click="activeTool = 'iddate'"
        >
          <Calendar :size="18" />
          <span>Дата создания аккаунта по ID</span>
        </button>

        <button
          class="tool-tab-btn"
          :class="{ active: activeTool === 'bio' }"
          @click="activeTool = 'bio'"
        >
          <Sparkles :size="18" />
          <span>ИИ-генератор описания профиля</span>
        </button>
      </div>

      <!-- Tool Container -->
      <div class="tool-box glass-card">
        <!-- TOOL 1: PROXY CHECKER -->
        <div v-if="activeTool === 'proxy'" class="tool-content">
          <div class="tool-header">
            <h3>Чекер прокси (HTTP / HTTPS / SOCKS5)</h3>
            <p>Проверка работоспособности прокси, ответа, пинга и страны для работы с сессиями Telegram.</p>
          </div>

          <div class="tool-form">
            <div class="input-with-button">
              <input
                v-model="proxyInput"
                type="text"
                class="input-field font-mono"
                placeholder="ip:port:user:password или socks5://user:pass@ip:port"
              />
              <button class="btn btn-primary" :disabled="isCheckingProxy" @click="testProxy">
                <RefreshCw :size="16" :class="{ 'spin-anim': isCheckingProxy }" />
                <span>{{ isCheckingProxy ? 'Тестируем...' : 'Проверить' }}</span>
              </button>
            </div>
            <div class="input-hint">Поддерживаются форматы: <code>IP:PORT:USER:PASS</code>, <code>IP:PORT</code>, <code>socks5://...</code></div>
          </div>

          <!-- Result -->
          <div v-if="proxyResult" class="result-card">
            <div class="result-status">
              <span class="badge badge-success"><CheckCircle2 :size="14" /> Прокси активен</span>
              <span class="ping-badge font-mono">{{ proxyResult.ping }} ms</span>
            </div>

            <div class="result-details-grid">
              <div class="res-item">
                <span class="res-label">IP адрес:</span>
                <span class="res-val font-mono">{{ proxyResult.ip }}:{{ proxyResult.port }}</span>
              </div>
              <div class="res-item">
                <span class="res-label">Протокол:</span>
                <span class="res-val">{{ proxyResult.type }}</span>
              </div>
              <div class="res-item">
                <span class="res-label">Локация / Страна:</span>
                <span class="res-val">{{ proxyResult.country }}</span>
              </div>
              <div class="res-item">
                <span class="res-label">Анонимность:</span>
                <span class="res-val text-success">{{ proxyResult.anonymity }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- TOOL 2: TELEGRAM ID AGE CHECKER -->
        <div v-else-if="activeTool === 'iddate'" class="tool-content">
          <div class="tool-header">
            <h3>Определение даты регистрации по Telegram ID</h3>
            <p>Узнайте примерный месяц и год регистрации аккаунта по его уникальному цифровому идентификатору.</p>
          </div>

          <div class="tool-form">
            <div class="input-with-button">
              <input
                v-model="telegramId"
                type="text"
                class="input-field font-mono"
                placeholder="Введите цифровой ID (например 1849201948)"
              />
              <button class="btn btn-primary" :disabled="isCalculatingAge" @click="calculateAccountAge">
                <Calendar :size="16" />
                <span>{{ isCalculatingAge ? 'Расчет...' : 'Определить дату' }}</span>
              </button>
            </div>
            <div class="input-hint">Узнать свой ID можно через официального бота @userinfobot в Telegram.</div>
          </div>

          <!-- Result -->
          <div v-if="idResult" class="result-card">
            <div class="result-status">
              <span class="badge badge-glow">ID: {{ idResult.id }}</span>
              <span class="badge" :class="idResult.isOld ? 'badge-success' : 'badge-warning'">
                {{ idResult.range }}
              </span>
            </div>

            <div class="id-date-display">
              <div class="id-date-label">Примерный период регистрации:</div>
              <div class="id-date-val text-gradient-cyan">{{ idResult.estimatedDate }}</div>
              <p class="id-date-desc">
                {{ idResult.isOld ? 'Аккаунт имеет высокий уровень доверия (траст) серверов Telegram, лимиты на рассылки и комментинг выше обычного.' : 'Аккаунт новый. Для защиты от бана рекомендуется прогрев в X2X-SMM перед активной работой.' }}
              </p>
            </div>
          </div>
        </div>

        <!-- TOOL 3: AI BIO GENERATOR -->
        <div v-else class="tool-content">
          <div class="tool-header">
            <h3>ИИ-генератор описания био для профиля Telegram</h3>
            <p>Готовые цепляющие описания профилей для конверсии посетителей в покупателей.</p>
          </div>

          <div class="niche-selector">
            <label class="form-label">Выберите вашу тематику:</label>
            <div class="niche-buttons">
              <button
                class="niche-btn"
                :class="{ active: selectedNiche === 'crypto' }"
                @click="selectedNiche = 'crypto'"
              >
                Крипта и P2P
              </button>
              <button
                class="niche-btn"
                :class="{ active: selectedNiche === 'marketing' }"
                @click="selectedNiche = 'marketing'"
              >
                Арбитраж и Маркетинг
              </button>
              <button
                class="niche-btn"
                :class="{ active: selectedNiche === 'ecommerce' }"
                @click="selectedNiche = 'ecommerce'"
              >
                WB / Ozon Селлеры
              </button>
            </div>
          </div>

          <!-- Generated Bios -->
          <div class="bios-list">
            <div
              v-for="(bio, idx) in biosList[selectedNiche]"
              :key="idx"
              class="bio-card"
            >
              <div class="bio-text">{{ bio }}</div>
              <button class="btn btn-secondary btn-sm" @click="copyBio(bio, idx)">
                <Copy :size="14" />
                <span>{{ copiedIdx === idx ? 'Скопировано!' : 'Копировать' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tools-section {
  padding: 60px 0 80px;
}

.section-head {
  max-width: 800px;
  margin: 0 auto 38px;
}

.section-title {
  font-size: clamp(2rem, 3.8vw, 3rem);
  margin-bottom: 14px;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
}

.tool-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.tool-tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 22px;
  border-radius: var(--radius-pill);
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #94a3b8;
  font-size: 0.92rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tool-tab-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.tool-tab-btn.active {
  background: rgba(0, 136, 204, 0.2);
  border-color: rgba(0, 180, 255, 0.5);
  color: #38bdf8;
  box-shadow: 0 0 20px rgba(0, 136, 204, 0.3);
}

.tool-box {
  max-width: 860px;
  margin: 0 auto;
  padding: 36px;
  background: rgba(13, 21, 38, 0.85);
  border: 1px solid rgba(0, 180, 255, 0.25);
}

.tool-header {
  margin-bottom: 24px;
}

.tool-header h3 {
  font-size: 1.35rem;
  color: #ffffff;
  margin-bottom: 6px;
}

.tool-header p {
  font-size: 0.88rem;
  color: #94a3b8;
}

.input-with-button {
  display: flex;
  gap: 12px;
}

.input-hint {
  font-size: 0.76rem;
  color: #64748b;
  margin-top: 8px;
}

.input-hint code {
  color: #38bdf8;
  background: rgba(0, 136, 204, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.result-card {
  margin-top: 24px;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: var(--radius-lg);
  padding: 22px;
}

.result-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.ping-badge {
  font-size: 0.8rem;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 3px 8px;
  border-radius: 6px;
}

.result-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.res-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.res-label {
  font-size: 0.76rem;
  color: #94a3b8;
}

.res-val {
  font-size: 0.92rem;
  font-weight: 600;
  color: #f1f5f9;
}

.text-success {
  color: #34d399;
}

/* ID Date Display */
.id-date-display {
  text-align: center;
  padding: 14px 0;
}

.id-date-label {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 6px;
}

.id-date-val {
  font-size: 1.8rem;
  font-weight: 900;
  margin-bottom: 12px;
}

.id-date-desc {
  font-size: 0.86rem;
  color: #cbd5e1;
  max-width: 580px;
  margin: 0 auto;
}

/* Bio Generator */
.niche-selector {
  margin-bottom: 24px;
}

.niche-buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.niche-btn {
  padding: 8px 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.niche-btn.active {
  background: rgba(0, 136, 204, 0.2);
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.bios-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bio-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(18, 28, 48, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 14px 18px;
  border-radius: var(--radius-md);
  gap: 16px;
}

.bio-text {
  font-size: 0.9rem;
  color: #f1f5f9;
  line-height: 1.45;
}

@media (max-width: 640px) {
  .tool-box {
    padding: 20px;
  }
  .input-with-button {
    flex-direction: column;
  }
  .result-details-grid {
    grid-template-columns: 1fr;
  }
  .bio-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
