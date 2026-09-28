<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Users, MessageSquare, Bot, Search, ShieldCheck, Terminal,
  CheckCircle2, AlertTriangle, RefreshCw, ExternalLink,
  Sparkles, Send, Check, Clock, Sliders,
  Eye, Download, ArrowLeft, LogOut, Trash2
} from '@lucide/vue'
import { apiClient, type AccountData, type LogItem } from '../api/client'

const props = defineProps<{
  currentUser: { username: string; email: string }
}>()

const emit = defineEmits<{
  (e: 'go-home'): void
  (e: 'logout'): void
  (e: 'open-add-account'): void
  (e: 'open-web-telegram', account: any): void
  (e: 'open-checkout'): void
}>()

// Active Navigation Tab
type CabinetTab = 'accounts' | 'commenting' | 'chatting' | 'parser' | 'warming' | 'logs'
const activeTab = ref<CabinetTab>('accounts')

// 1. ACCOUNTS MANAGER
const accountsList = ref<AccountData[]>([
  {
    id: '1',
    phone: '+1 659 667 3133',
    name: 'Target Agent',
    status: 'valid',
    proxy: 'socks5://180.254.199.250:8080',
    geo: 'US 🇺🇸',
    ggr: 98,
    role: 'Нейрокомментинг & Парсинг'
  }
])

const isCheckingAll = ref(false)

const loadAccounts = async () => {
  try {
    const res = await apiClient.accounts.getAll()
    if (res.accounts && res.accounts.length > 0) {
      accountsList.value = res.accounts
    }
  } catch {}
}

const runSpambotCheck = async (acc: AccountData) => {
  acc.status = 'checking'
  try {
    const res = await apiClient.accounts.check(acc.id)
    if (res.account) {
      acc.status = res.account.status
      acc.ggr = res.account.ggr
      loadLogs()
      return
    }
  } catch {}
  setTimeout(() => {
    acc.status = 'valid'
    acc.ggr = Math.min(100, acc.ggr + 5)
  }, 1000)
}

const checkAllAccounts = async () => {
  isCheckingAll.value = true
  accountsList.value.forEach(a => a.status = 'checking')
  try {
    const res = await apiClient.accounts.checkAll()
    if (res.accounts) {
      accountsList.value = res.accounts
      loadLogs()
      isCheckingAll.value = false
      return
    }
  } catch {}
  setTimeout(() => {
    accountsList.value.forEach(a => {
      if (a.status !== 'spamblock') a.status = 'valid'
    })
    isCheckingAll.value = false
  }, 1000)
}

const removeAccount = async (id: string) => {
  try {
    await apiClient.accounts.delete(id)
    loadLogs()
  } catch {}
  accountsList.value = accountsList.value.filter(a => a.id !== id)
}

const changeRole = async (acc: AccountData, newRole: string) => {
  acc.role = newRole
  try {
    await apiClient.accounts.updateRole(acc.id, newRole)
    loadLogs()
  } catch {}
}

// 2. NEURO-COMMENTING
const commentNiche = ref('Криптовалюта и P2P')
const commentTone = ref<'expert' | 'casual' | 'question'>('expert')
const generatedComment = ref('В текущей фазе рынка ключевой фактор — это объём ликвидности в стакане. Без качественного риск-менеджмента легко поймать проскальзывание.')
const isGeneratingComment = ref(false)

const generateComment = async () => {
  isGeneratingComment.value = true
  try {
    const res = await apiClient.ai.generateComment(commentNiche.value, commentTone.value)
    if (res.comment) {
      generatedComment.value = res.comment
      loadLogs()
      isGeneratingComment.value = false
      return
    }
  } catch {}
  setTimeout(() => {
    isGeneratingComment.value = false
  }, 600)
}

const isCopied = ref(false)
const isPublished = ref(false)

const copyComment = () => {
  navigator.clipboard.writeText(generatedComment.value)
  isCopied.value = true
  setTimeout(() => isCopied.value = false, 1500)
}

const publishComment = () => {
  isPublished.value = true
  loadLogs()
  setTimeout(() => isPublished.value = false, 2000)
}

// 3. NEURO-CHATTING
const chatMessages = ref([
  { id: 1, author: 'Target Agent (+1 659 667 3133)', time: '20:00', text: 'Сессия MTProto активна через socks5://180.254.199.250:8080. Чат-модуль готов к работе.' }
])

const customChatMsg = ref('')

const sendChatMsg = async () => {
  if (!customChatMsg.value.trim()) return
  const textToSend = customChatMsg.value.trim()
  customChatMsg.value = ''

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  chatMessages.value.push({
    id: Date.now(),
    author: 'Вы',
    time: timeStr,
    text: textToSend
  })

  try {
    const res = await apiClient.ai.sendChatMessage(textToSend, 'Вы')
    if (res.botReply) {
      setTimeout(() => {
        chatMessages.value.push(res.botReply)
        loadLogs()
      }, 700)
    }
  } catch {}
}

// 4. SMART PARSER
const parserKeywords = ref('крипта, p2p, арбитраж, трафик')
const filterOpenComments = ref(true)
const filterExcludeBots = ref(true)
const isParsing = ref(false)
const parseProgress = ref(0)
const parsedChannels = ref(0)
const parsedUsers = ref(0)

const runParser = async () => {
  if (isParsing.value) return
  isParsing.value = true
  parseProgress.value = 0
  parsedChannels.value = 0
  parsedUsers.value = 0

  try {
    await apiClient.parser.start(parserKeywords.value)
    loadLogs()
  } catch {}

  const interval = setInterval(() => {
    parseProgress.value += 10
    parsedChannels.value += Math.floor(Math.random() * 8) + 3
    parsedUsers.value += Math.floor(Math.random() * 45) + 15

    if (parseProgress.value >= 100) {
      clearInterval(interval)
      isParsing.value = false
      loadLogs()
    }
  }, 350)
}

const exportData = (format: 'txt' | 'csv') => {
  const url = apiClient.parser.getExportUrl(format)
  const a = document.createElement('a')
  a.href = url
  a.download = `x2x_audience_${Date.now()}.${format}`
  a.click()
}

// 5. CLOUD LOGS
const logs = ref<LogItem[]>([])

const loadLogs = async () => {
  try {
    const res = await apiClient.logs.getAll()
    if (res.logs) {
      logs.value = res.logs
    }
  } catch {}
}

const clearLogs = async () => {
  logs.value = []
  try {
    await apiClient.logs.clear()
  } catch {}
}

// Real-time log sync and polling
let logTimer: any = null
onMounted(() => {
  loadAccounts()
  loadLogs()
  logTimer = setInterval(() => {
    if (activeTab.value === 'logs') {
      loadLogs()
    }
  }, 4000)
})

onUnmounted(() => {
  if (logTimer) clearInterval(logTimer)
})

defineExpose({
  loadAccounts,
  loadLogs
})
</script>

<template>
  <div class="cabinet-container">
    <!-- Top Cabinet Header -->
    <header class="cabinet-header">
      <div class="cabinet-brand">
        <a href="#" class="brand-logo" @click.prevent="$emit('go-home')">
          <div class="logo-icon-box">
            <svg viewBox="0 0 32 32" fill="none" class="brand-svg">
              <rect width="32" height="32" rx="8" fill="#0b1526" stroke="#0284c7" stroke-width="1.2" />
              <path d="M8 8L15 16L8 24" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M24 8L17 16L24 24" stroke="#0ea5e9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="brand-name">X2X<span class="brand-accent">-SMM</span></span>
        </a>
        <div class="cabinet-badge">Личный кабинет</div>
      </div>

      <div class="cabinet-top-actions">
        <button class="btn btn-secondary btn-sm" @click="$emit('go-home')">
          <ArrowLeft :size="15" />
          <span>На сайт</span>
        </button>

        <button class="btn btn-ghost btn-sm btn-logout" @click="$emit('logout')" title="Выйти из аккаунта">
          <LogOut :size="16" />
        </button>
      </div>
    </header>

    <!-- Main Cabinet Grid (Left Navigation + Center Workspace) -->
    <div class="cabinet-main-layout">
      <!-- Left Navigation Sidebar -->
      <aside class="cabinet-sidebar">
        <div class="sidebar-section-title">Функции комбайна</div>

        <nav class="sidebar-menu">
          <button
            class="menu-item"
            :class="{ active: activeTab === 'accounts' }"
            @click="activeTab = 'accounts'"
          >
            <Users :size="18" />
            <span class="menu-label">Менеджер аккаунтов</span>
            <span class="menu-badge">{{ accountsList.length }}</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: activeTab === 'commenting' }"
            @click="activeTab = 'commenting'"
          >
            <MessageSquare :size="18" />
            <span class="menu-label">Нейрокомментинг</span>
            <span class="menu-tag-ai">ИИ</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: activeTab === 'chatting' }"
            @click="activeTab = 'chatting'"
          >
            <Bot :size="18" />
            <span class="menu-label">Нейрочаттинг</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: activeTab === 'parser' }"
            @click="activeTab = 'parser'"
          >
            <Search :size="18" />
            <span class="menu-label">Умный Парсер</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: activeTab === 'warming' }"
            @click="activeTab = 'warming'"
          >
            <ShieldCheck :size="18" />
            <span class="menu-label">Автопрогрев & GGR</span>
          </button>

          <button
            class="menu-item"
            :class="{ active: activeTab === 'logs' }"
            @click="activeTab = 'logs'"
          >
            <Terminal :size="18" />
            <span class="menu-label">Живые логи</span>
          </button>
        </nav>

        <!-- Bottom Sidebar Actions -->
        <div class="sidebar-footer">
          <button class="btn btn-primary btn-sm btn-full" @click="$emit('open-add-account')">
            <span>Добавить сессию</span>
          </button>

          <button class="btn btn-primary btn-sm btn-full" @click="$emit('open-checkout')">
            <span>Полный доступ</span>
          </button>
        </div>
      </aside>

      <!-- Center Function Workspace -->
      <main class="cabinet-workspace">
        <!-- TAB 1: ACCOUNTS MANAGER -->
        <section v-if="activeTab === 'accounts'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Менеджер аккаунтов</h2>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" :disabled="isCheckingAll" @click="checkAllAccounts">
                <RefreshCw :size="15" :class="{ 'spin-anim': isCheckingAll }" />
                <span>{{ isCheckingAll ? 'Проверка...' : 'Проверить @SpamBot' }}</span>
              </button>
              <button class="btn btn-primary btn-sm" @click="$emit('open-add-account')">
                <span>Добавить сессию</span>
              </button>
            </div>
          </div>

          <div class="table-container">
            <table class="accounts-table">
              <thead>
                <tr>
                  <th>Номер / Имя</th>
                  <th>Статус @SpamBot</th>
                  <th>Прокси / Гео</th>
                  <th>GGR Рейтинг</th>
                  <th>Назначенная роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="acc in accountsList" :key="acc.id">
                  <td>
                    <div class="acc-cell-main">
                      <div class="acc-avatar">{{ acc.name[0] }}</div>
                      <div>
                        <div class="acc-phone font-mono">{{ acc.phone }}</div>
                        <div class="acc-name">{{ acc.name }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span v-if="acc.status === 'valid'" class="badge badge-success">
                      <CheckCircle2 :size="13" /> Валидный
                    </span>
                    <span v-else-if="acc.status === 'warming'" class="badge badge-warning">
                      <Clock :size="13" /> Прогрев
                    </span>
                    <span v-else-if="acc.status === 'checking'" class="badge badge-glow">
                      <RefreshCw :size="13" class="spin-anim" /> Проверка...
                    </span>
                    <span v-else class="badge badge-danger">
                      <AlertTriangle :size="13" /> Спамблок
                    </span>
                  </td>
                  <td>
                    <div class="proxy-text font-mono">{{ acc.geo }} · {{ acc.proxy.split('@')[0] }}</div>
                  </td>
                  <td>
                    <div class="ggr-bar-wrapper">
                      <div class="ggr-val">{{ acc.ggr }}/100</div>
                      <div class="ggr-progress">
                        <div class="ggr-fill" :style="{ width: acc.ggr + '%', background: acc.ggr > 80 ? '#10b981' : '#f59e0b' }"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="role-select-box">
                      <select
                        :value="acc.role"
                        class="role-select"
                        @change="changeRole(acc, ($event.target as HTMLSelectElement).value)"
                        title="Нажмите, чтобы изменить назначенную роль"
                      >
                        <option value="Нейрокомментинг & Парсинг">Нейрокомментинг & Парсинг</option>
                        <option value="Нейрокомментинг">Нейрокомментинг</option>
                        <option value="Нейрочаттинг">Нейрочаттинг</option>
                        <option value="Умный Парсер">Умный Парсер</option>
                        <option value="Автопрогрев">Автопрогрев</option>
                        <option value="ЛС-Рассылки">ЛС-Рассылки</option>
                        <option value="Снятие блока">Снятие блока</option>
                      </select>
                    </div>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button
                        class="action-btn"
                        title="Открыть в Telegram Web через этот прокси"
                        @click="$emit('open-web-telegram', acc)"
                      >
                        <ExternalLink :size="15" />
                        <span>Web TG</span>
                      </button>
                      <button
                        class="action-btn"
                        title="Проверить @SpamBot"
                        @click="runSpambotCheck(acc)"
                      >
                        <RefreshCw :size="14" />
                      </button>
                      <button
                        class="action-btn action-btn-danger"
                        title="Удалить аккаунт"
                        @click="removeAccount(acc.id)"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- TAB 2: NEURO-COMMENTING -->
        <section v-else-if="activeTab === 'commenting'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Нейрокомментинг</h2>
            </div>
            <button class="btn btn-primary btn-sm" :disabled="isGeneratingComment" @click="generateComment">
              <Sparkles :size="16" />
              <span>{{ isGeneratingComment ? 'Генерация...' : 'Сгенерировать комментарий' }}</span>
            </button>
          </div>

          <div class="two-col-grid">
            <!-- Left: Settings -->
            <div class="panel-card">
              <h4 class="card-subtitle"><Sliders :size="16" /> Настройки генерации</h4>

              <div class="form-group">
                <label class="form-label">Тематическая ниша</label>
                <input v-model="commentNiche" type="text" class="input-field" />
              </div>

              <div class="form-group">
                <label class="form-label">Стиль и тональность ответа</label>
                <div class="tone-selector">
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'expert' }"
                    @click="commentTone = 'expert'; generateComment()"
                  >
                    Экспертный
                  </button>
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'casual' }"
                    @click="commentTone = 'casual'; generateComment()"
                  >
                    Заинтересованный
                  </button>
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'question' }"
                    @click="commentTone = 'question'; generateComment()"
                  >
                    Уточняющий вопрос
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Preview -->
            <div class="panel-card">
              <h4 class="card-subtitle"><Eye :size="16" /> Предпросмотр комментария</h4>

              <div class="post-preview-box">
                <div class="tg-post-mockup">
                  <div class="tg-post-header">
                    <span class="tg-channel-name">📢 Целевой канал • Обсуждение</span>
                    <span class="tg-post-time">только что</span>
                  </div>
                  <p class="tg-post-text">
                    BTC удерживает уровень поддержки $94,500. Наблюдаем рост открытого интереса на фьючерсах при одновременном снижении объёмов на споте. Что думаете по дальнейшему движению?
                  </p>
                </div>

                <div class="tg-comment-mockup">
                  <div class="tg-comment-avatar">T</div>
                  <div class="tg-comment-body">
                    <div class="tg-comment-author">Target Agent (+1 659 667 3133) <span class="badge-auto">Активен</span></div>
                    <p class="tg-comment-text">{{ generatedComment }}</p>
                  </div>
                </div>

                <div class="comment-actions-row">
                  <button class="btn btn-secondary btn-sm" @click="copyComment">
                    <Check v-if="isCopied" :size="14" class="text-success" />
                    <span>{{ isCopied ? 'Скопировано!' : 'Копировать' }}</span>
                  </button>
                  <button class="btn btn-primary btn-sm" :disabled="isPublished" @click="publishComment">
                    <span>{{ isPublished ? 'Опубликовано!' : 'Опубликовать от сессии' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 3: NEURO-CHATTING -->
        <section v-else-if="activeTab === 'chatting'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Нейрочаттинг в группах</h2>
            </div>
            <div class="badge badge-success">
              <CheckCircle2 :size="14" /> Сессия активна (+1 659 667 3133)
            </div>
          </div>

          <div class="chat-simulator-wrapper">
            <div class="chat-header-bar">
              <div class="chat-group-title">💬 Telegram Чат: Обсуждения целевой аудитории (активен)</div>
            </div>

            <div class="chat-messages-box">
              <div
                v-for="msg in chatMessages"
                :key="msg.id"
                class="sim-message"
              >
                <div class="msg-avatar">{{ msg.author[0] }}</div>
                <div class="msg-content">
                  <div class="msg-top">
                    <span class="msg-author">{{ msg.author }}</span>
                    <span class="msg-time">{{ msg.time }}</span>
                  </div>
                  <div class="msg-text">{{ msg.text }}</div>
                </div>
              </div>
            </div>

            <form class="chat-sim-footer" @submit.prevent="sendChatMsg">
              <input
                v-model="customChatMsg"
                type="text"
                class="input-field"
                placeholder="Напишите реплику или отправьте сообщение от аккаунта..."
              />
              <button type="submit" class="btn btn-primary btn-sm" :disabled="!customChatMsg.trim()">
                <Send :size="16" />
              </button>
            </form>
          </div>
        </section>

        <!-- TAB 4: SMART PARSER -->
        <section v-else-if="activeTab === 'parser'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Умный Парсер</h2>
            </div>
            <button class="btn btn-primary btn-sm" :disabled="isParsing" @click="runParser">
              <Search :size="16" />
              <span>{{ isParsing ? 'Парсинг...' : 'Запустить сбор базы' }}</span>
            </button>
          </div>

          <div class="parser-controls-grid">
            <div class="form-group">
              <label class="form-label">Ключевые слова для поиска</label>
              <input v-model="parserKeywords" type="text" class="input-field" />
            </div>

            <div class="parser-options">
              <label class="checkbox-label">
                <input v-model="filterOpenComments" type="checkbox" />
                <span>Только каналы с открытыми комментариями</span>
              </label>
              <label class="checkbox-label">
                <input v-model="filterExcludeBots" type="checkbox" />
                <span>Исключать ботов и неактивных участников</span>
              </label>
            </div>
          </div>

          <!-- Live Parsing Stats Card -->
          <div class="parser-stats-card">
            <div class="progress-bar-container">
              <div class="progress-label">
                <span>Прогресс поиска по Telegram API</span>
                <span>{{ parseProgress }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: parseProgress + '%' }"></div>
              </div>
            </div>

            <div class="stats-counters-row">
              <div class="counter-box">
                <div class="counter-num text-gradient-cyan">{{ parsedChannels }}</div>
                <div class="counter-label">Каналов с комментариями</div>
              </div>
              <div class="counter-box">
                <div class="counter-num text-gradient-cyan">{{ parsedUsers }}</div>
                <div class="counter-label">Активных участников найдено</div>
              </div>
              <div class="counter-box export-actions">
                <button class="btn btn-secondary btn-sm" :disabled="parsedChannels === 0" @click="exportData('txt')">
                  <Download :size="15" />
                  <span>TXT</span>
                </button>
                <button class="btn btn-secondary btn-sm" :disabled="parsedChannels === 0" @click="exportData('csv')">
                  <Download :size="15" />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- TAB 5: WARMING & GGR -->
        <section v-else-if="activeTab === 'warming'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Автопрогрев & GGR</h2>
            </div>
          </div>

          <div class="warming-grid">
            <div class="warming-card">
              <div class="w-day-badge">День 1 - 2</div>
              <h4 class="w-step-title">Подписки и чтение ленты</h4>
              <p class="w-step-desc">Вступление в 3-5 каналов вашей ниши, плавный скроллинг постов, паузы между кликами от 30 до 90 сек.</p>
              <div class="w-status done"><Check :size="14" /> Завершено</div>
            </div>

            <div class="warming-card">
              <div class="w-day-badge">День 3 - 4</div>
              <h4 class="w-step-title">Эмодзи-реакции и просмотры</h4>
              <p class="w-step-desc">Постановка органичных реакций на новые посты, просмотр сторис целевой аудитории (масслукинг).</p>
              <div class="w-status done"><Check :size="14" /> Завершено</div>
            </div>

            <div class="warming-card active-card">
              <div class="w-day-badge active">День 5 - 7</div>
              <h4 class="w-step-title">Нейродиалоги и подготовка</h4>
              <p class="w-step-desc">Аккаунты переписываются между собой по закрытым связкам, поднимая рейтинг доверия серверов Telegram.</p>
              <div class="w-status in-progress"><RefreshCw :size="14" class="spin-anim" /> В процессе</div>
            </div>
          </div>
        </section>

        <!-- TAB 6: CLOUD LOGS -->
        <section v-else-if="activeTab === 'logs'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Живые логи</h2>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" @click="clearLogs">
                <span>Очистить</span>
              </button>
            </div>
          </div>

          <div class="terminal-box font-mono">
            <div class="term-body">
              <div v-for="(log, idx) in logs" :key="idx" class="term-line">
                <span class="log-time">{{ log.time }}</span>
                <span :class="'log-text ' + log.type">{{ log.text }}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.cabinet-container {
  min-height: 100vh;
  background: #040812;
  color: #f1f5f9;
  display: flex;
  flex-direction: column;
}

/* Header */
.cabinet-header {
  height: 64px;
  background: rgba(11, 17, 30, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(12px);
}

.cabinet-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-svg {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.02em;
}

.brand-accent {
  color: #38bdf8;
}

.cabinet-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(2, 132, 199, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 2px 10px;
  border-radius: var(--radius-pill);
}

.cabinet-top-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-profile-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 12px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-pill);
}

.user-mini-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0284c7, #38bdf8);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.78rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.1;
}

.user-sub {
  font-size: 0.68rem;
  color: #94a3b8;
}

.btn-logout {
  color: #94a3b8;
  padding: 8px;
}

.btn-logout:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

/* Layout */
.cabinet-main-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  flex: 1;
  min-height: calc(100vh - 64px);
}

/* Sidebar */
.cabinet-sidebar {
  background: #070d19;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
}

.sidebar-section-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 0 10px 12px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 14px;
  border-radius: 10px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease;
  width: 100%;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.menu-item.active {
  background: rgba(2, 132, 199, 0.16);
  border-color: rgba(56, 189, 248, 0.28);
  color: #38bdf8;
}

.menu-label {
  flex: 1;
}

.menu-badge {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 7px;
  border-radius: var(--radius-pill);
}

.menu-tag-ai {
  font-size: 0.65rem;
  background: #0284c7;
  color: #ffffff;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}

.sidebar-footer {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* Workspace */
.cabinet-workspace {
  padding: 28px 36px;
  background: #060a14;
  overflow-y: auto;
}

.workspace-card {
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.workspace-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.workspace-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* Accounts Table */
.table-container {
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-md);
  overflow-x: auto;
  background: rgba(12, 19, 34, 0.7);
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.86rem;
}

.accounts-table th {
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.9);
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.accounts-table td {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
}

.acc-cell-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.acc-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #38bdf8;
}

.acc-phone {
  font-weight: 600;
  color: #f1f5f9;
}

.acc-name {
  font-size: 0.78rem;
  color: #64748b;
}

.proxy-text {
  font-size: 0.78rem;
  color: #cbd5e1;
}

.ggr-bar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ggr-val {
  font-size: 0.78rem;
  font-weight: 700;
  color: #f1f5f9;
  min-width: 44px;
}

.ggr-progress {
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.ggr-fill {
  height: 100%;
}

.role-tag {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 4px;
  color: #94a3b8;
}

.role-select-box {
  position: relative;
  display: inline-block;
}

.role-select {
  font-size: 0.78rem;
  font-weight: 600;
  color: #38bdf8;
  background: rgba(14, 23, 42, 0.85);
  border: 1px solid rgba(56, 189, 248, 0.25);
  padding: 4px 10px;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.role-select:hover,
.role-select:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.2);
  background: rgba(14, 23, 42, 1);
}

.role-select option {
  background: #0f172a;
  color: #f1f5f9;
}

.row-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(0, 136, 204, 0.2);
  border-color: #38bdf8;
  color: #ffffff;
}

.action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

/* Two col grid for Neurocommenting */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.panel-card {
  background: rgba(12, 19, 34, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.card-subtitle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 6px;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 10px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.88rem;
  outline: none;
}

.input-field:focus {
  border-color: #38bdf8;
}

.tone-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tone-btn {
  text-align: left;
  padding: 9px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  color: #cbd5e1;
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tone-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.tone-btn.active {
  background: rgba(2, 132, 199, 0.2);
  border-color: #38bdf8;
  color: #ffffff;
}

.post-preview-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tg-post-mockup {
  background: #1e293b;
  border-radius: 10px;
  padding: 14px;
  border-left: 3px solid #38bdf8;
}

.tg-post-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.tg-channel-name {
  font-weight: 700;
  color: #38bdf8;
}

.tg-post-text {
  font-size: 0.84rem;
  line-height: 1.4;
  color: #e2e8f0;
}

.tg-comment-mockup {
  display: flex;
  gap: 10px;
  background: rgba(15, 23, 42, 0.8);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.tg-comment-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #0284c7;
  color: #ffffff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.tg-comment-author {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.badge-auto {
  font-size: 0.65rem;
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
}

.tg-comment-text {
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.comment-actions-row {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

/* Chat Simulator */
.chat-simulator-wrapper {
  background: rgba(12, 19, 34, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chat-header-bar {
  padding: 12px 18px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.chat-group-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

.chat-messages-box {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 240px;
  max-height: 380px;
  overflow-y: auto;
}

.sim-message {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #334155;
  color: #38bdf8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.76rem;
  flex-shrink: 0;
}

.msg-content {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 8px 12px;
  border-radius: 10px;
  max-width: 80%;
}

.msg-top {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 3px;
}

.msg-author {
  font-size: 0.76rem;
  font-weight: 700;
  color: #38bdf8;
}

.msg-time {
  font-size: 0.68rem;
  color: #64748b;
}

.msg-text {
  font-size: 0.82rem;
  color: #e2e8f0;
  line-height: 1.35;
}

.chat-sim-footer {
  display: flex;
  gap: 10px;
  padding: 12px 18px;
  background: rgba(15, 23, 42, 0.9);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

/* Parser */
.parser-controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.parser-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.84rem;
  color: #cbd5e1;
  cursor: pointer;
}

.parser-stats-card {
  background: rgba(12, 19, 34, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
}

.progress-bar-container {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #94a3b8;
  margin-bottom: 8px;
}

.progress-track {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0284c7, #38bdf8);
  transition: width 0.3s ease;
}

.stats-counters-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
}

.counter-box {
  background: rgba(15, 23, 42, 0.6);
  padding: 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.counter-num {
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.counter-label {
  font-size: 0.76rem;
  color: #94a3b8;
}

.export-actions {
  display: flex;
  gap: 8px;
}

/* Warming */
.warming-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.warming-card {
  background: rgba(12, 19, 34, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.warming-card.active-card {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(2, 132, 199, 0.08);
}

.w-day-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 8px;
  border-radius: 4px;
  margin-bottom: 12px;
  align-self: flex-start;
}

.w-day-badge.active {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.15);
}

.w-step-title {
  font-size: 0.95rem;
  color: #ffffff;
  margin-bottom: 8px;
}

.w-step-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
  margin-bottom: 16px;
  flex: 1;
}

.w-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  align-self: flex-start;
}

.w-status.done {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
}

.w-status.in-progress {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

/* Logs */
.terminal-box {
  background: #020611;
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.term-header {
  padding: 10px 14px;
  background: rgba(15, 23, 42, 0.9);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  font-size: 0.75rem;
  color: #64748b;
}

.term-body {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 380px;
  overflow-y: auto;
  font-size: 0.8rem;
}

.term-line {
  display: flex;
  gap: 12px;
  align-items: baseline;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
}

.log-text.info { color: #cbd5e1; }
.log-text.success { color: #34d399; }
.log-text.ai { color: #38bdf8; }
.log-text.warning { color: #fbbf24; }

/* Spin animation */
.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .cabinet-main-layout {
    grid-template-columns: 1fr;
  }
  .cabinet-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .two-col-grid,
  .parser-controls-grid,
  .stats-counters-row,
  .warming-grid {
    grid-template-columns: 1fr;
  }
  .cabinet-workspace {
    padding: 20px 16px;
  }
}
</style>
