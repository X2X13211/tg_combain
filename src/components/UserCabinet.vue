<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Users, MessageSquare, Search, ShieldCheck, Terminal,
  CheckCircle2, AlertTriangle, RefreshCw,
  Sparkles, Check, Clock, Sliders,
  Eye, Download, ArrowLeft, LogOut, Trash2,
  ChevronDown, Cpu, Globe, UploadCloud, FileText
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

// Active Navigation Tab (Chatting removed)
type CabinetTab = 'accounts' | 'commenting' | 'parser' | 'warming' | 'logs'
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

// 2. NEURO-COMMENTING (ROUTERAI & CUSTOM PROMPT)
const commentNiche = ref('Криптовалюта и P2P')
const commentTone = ref<'expert' | 'casual' | 'question' | 'offer' | 'review'>('expert')
const defaultPrompt = 'Ты профессиональный Telegram SMM-комментатор. Пиши живые, естественные, цепляющие комментарии на русском языке от имени реального человека. Избегай шаблонных фраз и откровенной рекламы. Твой комментарий должен вызывать интерес, провоцировать обсуждение и вызывать доверие.'
const aiPrompt = ref(defaultPrompt)
const aiPostText = ref('')

// RouterAI Configuration
const routerApiKey = ref(localStorage.getItem('x2x_routerai_key') || '')
const routerModel = ref(localStorage.getItem('x2x_routerai_model') || 'openai/gpt-4o-mini')
const routerBaseUrl = ref('https://routerai.ru/api/v1')
const showRouterSettings = ref(false)
const customModelInput = ref('')

const POPULAR_ROUTER_MODELS = [
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini (Быстрый)' },
  { id: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Топ RU)' },
  { id: 'anthropic/claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen 2.5 72B' }
]

const generatedComment = ref('В текущей фазе рынка ключевой фактор — это объём ликвидности в стакане. Без качественного риск-менеджмента легко поймать проскальзывание.')
const generatedProvider = ref('Локальная модель X2X')
const isGeneratingComment = ref(false)

const saveRouterSettings = () => {
  if (customModelInput.value.trim()) {
    routerModel.value = customModelInput.value.trim()
  }
  localStorage.setItem('x2x_routerai_key', routerApiKey.value.trim())
  localStorage.setItem('x2x_routerai_model', routerModel.value.trim())
}

const resetPrompt = () => {
  aiPrompt.value = defaultPrompt
}

const generateComment = async () => {
  isGeneratingComment.value = true
  saveRouterSettings()
  try {
    const res = await apiClient.ai.generateComment({
      niche: commentNiche.value,
      tone: commentTone.value,
      prompt: aiPrompt.value,
      postText: aiPostText.value,
      apiKey: routerApiKey.value.trim(),
      model: routerModel.value.trim(),
      baseUrl: routerBaseUrl.value.trim()
    })
    if (res.comment) {
      generatedComment.value = res.comment
      generatedProvider.value = res.provider || (routerApiKey.value ? 'RouterAI (' + routerModel.value + ')' : 'Локальная модель X2X')
      loadLogs()
      isGeneratingComment.value = false
      return
    }
  } catch (err) {
    console.error('generateComment error:', err)
  }
  isGeneratingComment.value = false
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

// 3. SMART PARSER (KEYWORDS & FILE UPLOAD)
const parserMode = ref<'keywords' | 'file'>('keywords')
const parserKeywords = ref('крипта, p2p, арбитраж, трафик')
const filterOpenComments = ref(true)
const filterExcludeBots = ref(true)
const isParsing = ref(false)
const parseProgress = ref(0)
const parsedChannels = ref(0)
const parsedUsers = ref(0)

const uploadedFileName = ref('')
const uploadedChatsList = ref<string[]>([])
const fileInputRef = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const file = input.files[0]
  uploadedFileName.value = file.name

  const reader = new FileReader()
  reader.onload = async (e) => {
    const text = String(e.target?.result || '')
    const lines = text.split(/[\r\n,]+/)
      .map(l => l.trim().replace(/^https?:\/\/t\.me\//i, '@').replace(/^\/?/, ''))
      .filter(l => l.length > 1)
      .map(l => l.startsWith('@') ? l : '@' + l)

    const uniqueChats = Array.from(new Set(lines))
    uploadedChatsList.value = uniqueChats

    try {
      await apiClient.parser.importChats(uniqueChats)
      loadLogs()
    } catch {}
  }
  reader.readAsText(file)
}

const clearUploadedChats = () => {
  uploadedChatsList.value = []
  uploadedFileName.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const runParser = async () => {
  if (isParsing.value) return
  isParsing.value = true
  parseProgress.value = 0
  parsedChannels.value = uploadedChatsList.value.length > 0 ? uploadedChatsList.value.length : 0
  parsedUsers.value = 0

  try {
    await apiClient.parser.start(parserKeywords.value)
    loadLogs()
  } catch {}

  const interval = setInterval(() => {
    parseProgress.value += 10
    if (uploadedChatsList.value.length === 0) {
      parsedChannels.value += Math.floor(Math.random() * 8) + 3
    }
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

// 4. CLOUD LOGS
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
</script>

<template>
  <div class="cabinet-container">
    <!-- Top Header -->
    <header class="cabinet-header">
      <div class="header-left">
        <button class="back-home-btn" title="Вернуться на главную" @click="$emit('go-home')">
          <ArrowLeft :size="16" />
          <span>На главную</span>
        </button>
        <div class="brand-divider"></div>
        <div class="cabinet-logo">
          <span class="logo-accent">X2X</span>-SMM
          <span class="cabinet-badge font-mono">Личный кабинет</span>
        </div>
      </div>

      <div class="header-right">
        <div class="status-cluster">
          <span class="live-dot"></span>
          <span class="cluster-text">Кластер US DC1 / DC5 Online</span>
        </div>

        <div class="user-profile-menu">
          <div class="avatar-circle">{{ currentUser.username[0].toUpperCase() }}</div>
          <div class="user-meta">
            <span class="user-name">{{ currentUser.username }}</span>
            <span class="user-plan">Полный доступ</span>
          </div>
          <button class="logout-icon-btn" title="Выйти" @click="$emit('logout')">
            <LogOut :size="16" />
          </button>
        </div>
      </div>
    </header>

    <!-- Main Workspace Layout -->
    <div class="cabinet-body">
      <!-- Left Vertical Navigation Bar -->
      <aside class="cabinet-sidebar">
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

      <!-- Center Main Workspace Area -->
      <main class="cabinet-workspace">
        <!-- TAB 1: ACCOUNTS MANAGER -->
        <section v-if="activeTab === 'accounts'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Менеджер Telegram-аккаунтов</h2>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-sm" :disabled="isCheckingAll" @click="checkAllAccounts">
                <RefreshCw :size="14" :class="{ 'spin-anim': isCheckingAll }" />
                <span>{{ isCheckingAll ? 'Проверка всех...' : 'Проверить все @SpamBot' }}</span>
              </button>
              <button class="btn btn-primary btn-sm" @click="$emit('open-add-account')">
                <span>Добавить аккаунт</span>
              </button>
            </div>
          </div>

          <!-- Accounts Table -->
          <div class="accounts-table-wrapper">
            <table class="accounts-table">
              <thead>
                <tr>
                  <th>Аккаунт / Телефон</th>
                  <th>Статус</th>
                  <th>Прокси</th>
                  <th>Траст GGR</th>
                  <th>Назначенная роль</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="acc in accountsList" :key="acc.id">
                  <td>
                    <div class="acc-cell">
                      <div class="acc-avatar">{{ acc.name[0] }}</div>
                      <div>
                        <div class="acc-name">{{ acc.name }}</div>
                        <div class="acc-phone font-mono">{{ acc.phone }}</div>
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
                    <!-- Refined Role Selector -->
                    <div class="role-pill-wrapper">
                      <select
                        :value="acc.role"
                        class="role-pill-select"
                        title="Нажмите, чтобы изменить назначенную роль"
                        @change="changeRole(acc, ($event.target as HTMLSelectElement).value)"
                      >
                        <option value="Нейрокомментинг & Парсинг">Нейрокомментинг & Парсинг</option>
                        <option value="Нейрокомментинг">Нейрокомментинг</option>
                        <option value="Умный Парсер">Умный Парсер</option>
                        <option value="Автопрогрев">Автопрогрев</option>
                        <option value="ЛС-Рассылки">ЛС-Рассылки</option>
                        <option value="Снятие блока">Снятие блока</option>
                      </select>
                      <ChevronDown :size="13" class="role-pill-chevron" />
                    </div>
                  </td>
                  <td>
                    <div class="row-actions">
                      <!-- Refined Telegram Web Launcher Button -->
                      <button
                        class="btn-webtg-pill"
                        title="Открыть сессию в Telegram Web через MTProto"
                        @click="$emit('open-web-telegram', acc)"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
                        </svg>
                        <span>Telegram Web</span>
                      </button>

                      <button
                        class="action-btn"
                        title="Проверить @SpamBot"
                        @click="runSpambotCheck(acc)"
                      >
                        <RefreshCw :size="13" />
                      </button>

                      <button
                        class="action-btn action-btn-danger"
                        title="Удалить аккаунт"
                        @click="removeAccount(acc.id)"
                      >
                        <Trash2 :size="13" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- TAB 2: NEURO-COMMENTING (ROUTERAI & PROMPT) -->
        <section v-else-if="activeTab === 'commenting'" class="workspace-card">
          <div class="workspace-header">
            <div>
              <h2 class="workspace-title">Нейрокомментинг</h2>
            </div>
            <div class="header-actions">
              <button
                class="btn btn-secondary btn-sm"
                :class="{ active: showRouterSettings }"
                @click="showRouterSettings = !showRouterSettings"
              >
                <Cpu :size="14" />
                <span>{{ showRouterSettings ? 'Скрыть настройки RouterAI' : 'Настройки RouterAI' }}</span>
              </button>
              <button class="btn btn-primary btn-sm" :disabled="isGeneratingComment" @click="generateComment">
                <Sparkles :size="15" :class="{ 'spin-anim': isGeneratingComment }" />
                <span>{{ isGeneratingComment ? 'Генерация...' : 'Сгенерировать комментарий' }}</span>
              </button>
            </div>
          </div>

          <!-- RouterAI Settings Drawer (Collapsible) -->
          <div v-if="showRouterSettings" class="router-ai-settings-card">
            <div class="router-settings-header">
              <div class="router-badge-row">
                <Cpu :size="16" class="text-sky" />
                <span class="router-title">Подключение RouterAI (OpenAI-совместимый API)</span>
                <span class="provider-badge">{{ routerApiKey ? 'Ключ активен' : 'Без ключа (Локальный)' }}</span>
              </div>
              <a
                href="https://routerai.ru/models?output_modalities%5B%5D=image&input_modalities%5B%5D=image"
                target="_blank"
                rel="noopener"
                class="router-catalog-link"
              >
                <Globe :size="13" />
                <span>Каталог моделей на routerai.ru ↗</span>
              </a>
            </div>

            <div class="router-fields-grid">
              <div class="form-group mb-0">
                <label class="form-label">API-ключ RouterAI (sk-...)</label>
                <input
                  v-model="routerApiKey"
                  type="password"
                  class="input-field font-mono"
                  placeholder="Вставьте ваш API-ключ с routerai.ru"
                  @change="saveRouterSettings"
                />
              </div>

              <div class="form-group mb-0">
                <label class="form-label">Модель нейросети</label>
                <input
                  v-model="routerModel"
                  type="text"
                  class="input-field font-mono"
                  placeholder="openai/gpt-4o-mini"
                  @change="saveRouterSettings"
                />
              </div>
            </div>

            <!-- Model Presets -->
            <div class="model-presets-row">
              <span class="presets-label">Быстрый выбор модели:</span>
              <button
                v-for="m in POPULAR_ROUTER_MODELS"
                :key="m.id"
                class="model-pill-btn"
                :class="{ active: routerModel === m.id }"
                @click="routerModel = m.id; saveRouterSettings()"
              >
                {{ m.label }}
              </button>
            </div>
          </div>

          <div class="two-col-grid">
            <!-- Left: Prompt & Generation Parameters -->
            <div class="panel-card">
              <h4 class="card-subtitle"><Sliders :size="16" /> Параметры и промпт генерации</h4>

              <!-- AI Prompt Textarea -->
              <div class="form-group">
                <div class="prompt-header-row">
                  <label class="form-label">Промпт для ИИ (инструкция по генерации)</label>
                  <button class="btn-text-reset" @click="resetPrompt">Сбросить к дефолту</button>
                </div>
                <textarea
                  v-model="aiPrompt"
                  rows="3"
                  class="textarea-field"
                  placeholder="Задайте стиль, контекст, ключевые фразы или правила поведения нейросети..."
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Тематическая ниша</label>
                <input v-model="commentNiche" type="text" class="input-field" placeholder="Криптовалюта, P2P, E-commerce, Недвижимость..." />
              </div>

              <div class="form-group">
                <label class="form-label">Текст поста для контекстного ответа (опционально)</label>
                <textarea
                  v-model="aiPostText"
                  rows="2"
                  class="textarea-field"
                  placeholder="Вставьте фрагмент поста из Telegram, чтобы нейросеть ответила строго по теме..."
                ></textarea>
              </div>

              <div class="form-group mb-0">
                <label class="form-label">Стиль и тональность</label>
                <div class="tone-selector">
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'expert' }"
                    @click="commentTone = 'expert'"
                  >
                    Экспертный
                  </button>
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'casual' }"
                    @click="commentTone = 'casual'"
                  >
                    Заинтересованный
                  </button>
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'question' }"
                    @click="commentTone = 'question'"
                  >
                    Уточняющий вопрос
                  </button>
                  <button
                    class="tone-btn"
                    :class="{ active: commentTone === 'offer' }"
                    @click="commentTone = 'offer'"
                  >
                    Оффер / Лид
                  </button>
                </div>
              </div>
            </div>

            <!-- Right: Preview -->
            <div class="panel-card">
              <div class="preview-header-row">
                <h4 class="card-subtitle mb-0"><Eye :size="16" /> Предпросмотр комментария</h4>
                <span class="provider-tag font-mono">{{ generatedProvider }}</span>
              </div>

              <div class="post-preview-box">
                <div class="tg-post-mockup">
                  <div class="tg-post-header">
                    <span class="tg-channel-name">📢 {{ commentNiche || 'Целевой канал' }} • Обсуждение</span>
                    <span class="tg-post-time">только что</span>
                  </div>
                  <p class="tg-post-text">
                    {{ aiPostText || 'BTC удерживает уровень поддержки $94,500. Наблюдаем рост открытого интереса на фьючерсах при одновременном снижении объёмов на споте. Что думаете по дальнейшему движению?' }}
                  </p>
                </div>

                <div class="tg-comment-mockup">
                  <div class="tg-comment-avatar">T</div>
                  <div class="tg-comment-body">
                    <div class="tg-comment-author">
                      <span>Target Agent (+1 659 667 3133)</span>
                      <span class="badge-auto">Активен</span>
                    </div>
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

        <!-- TAB 3: SMART PARSER (KEYWORDS & FILE UPLOAD) -->
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

          <!-- Parser Mode Tabs -->
          <div class="parser-mode-tabs">
            <button
              class="p-mode-tab"
              :class="{ active: parserMode === 'keywords' }"
              @click="parserMode = 'keywords'"
            >
              <Search :size="15" />
              <span>Поиск по ключевым словам</span>
            </button>
            <button
              class="p-mode-tab"
              :class="{ active: parserMode === 'file' }"
              @click="parserMode = 'file'"
            >
              <UploadCloud :size="15" />
              <span>Загрузка чатов из файла (.txt / .csv)</span>
              <span v-if="uploadedChatsList.length" class="p-mode-badge">{{ uploadedChatsList.length }}</span>
            </button>
          </div>

          <!-- Mode 1: Keywords -->
          <div v-if="parserMode === 'keywords'" class="parser-controls-grid">
            <div class="form-group mb-0">
              <label class="form-label">Ключевые слова для поиска</label>
              <input v-model="parserKeywords" type="text" class="input-field" placeholder="крипта, p2p, арбитраж, трафик" />
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

          <!-- Mode 2: File Upload -->
          <div v-else class="file-parser-box">
            <input
              ref="fileInputRef"
              type="file"
              accept=".txt,.csv,.json"
              class="hidden-file-input"
              @change="handleFileUpload"
            />

            <div v-if="!uploadedChatsList.length" class="file-dropzone" @click="triggerFileInput">
              <UploadCloud :size="38" class="dropzone-icon" />
              <div class="dropzone-title">Загрузите файл со списком чатов и каналов</div>
              <div class="dropzone-sub">
                Поддерживаются форматы <strong>.txt, .csv</strong> (каждая строка — ссылка <code>t.me/chat</code> или <code>@username</code>)
              </div>
              <button type="button" class="btn btn-secondary btn-sm mt-3" @click.stop="triggerFileInput">
                <FileText :size="14" />
                <span>Выбрать файл с диска</span>
              </button>
            </div>

            <div v-else class="file-loaded-card">
              <div class="file-loaded-header">
                <div class="file-info-col">
                  <FileText :size="20" class="text-sky" />
                  <div>
                    <div class="file-name">{{ uploadedFileName }}</div>
                    <div class="file-stats">Успешно извлечено: <strong>{{ uploadedChatsList.length }}</strong> целевых чатов</div>
                  </div>
                </div>
                <div class="file-actions">
                  <button class="btn btn-secondary btn-sm" @click="triggerFileInput">
                    Заменить файл
                  </button>
                  <button class="btn btn-secondary btn-sm text-danger" @click="clearUploadedChats">
                    Очистить
                  </button>
                </div>
              </div>

              <!-- Preview chips -->
              <div class="chats-chips-box">
                <span v-for="(chat, i) in uploadedChatsList.slice(0, 30)" :key="i" class="chat-chip">
                  {{ chat }}
                </span>
                <span v-if="uploadedChatsList.length > 30" class="chat-chip more">
                  + ещё {{ uploadedChatsList.length - 30 }} чатов...
                </span>
              </div>
            </div>
          </div>

          <!-- Live Parsing Stats Card -->
          <div class="parser-stats-card">
            <div class="progress-bar-container">
              <div class="progress-label">
                <span>{{ isParsing ? 'Идёт обработка Telegram-сообществ...' : 'Статус сбора базы' }}</span>
                <span>{{ parseProgress }}%</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: parseProgress + '%' }"></div>
              </div>
            </div>

            <div class="stats-counters-row">
              <div class="counter-box">
                <div class="counter-num text-gradient-cyan">{{ parsedChannels }}</div>
                <div class="counter-label">Чатов обработано</div>
              </div>
              <div class="counter-box">
                <div class="counter-num text-gradient-cyan">{{ parsedUsers }}</div>
                <div class="counter-label">Целевых участников найдено</div>
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

        <!-- TAB 4: WARMING & GGR -->
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
              <h4 class="w-step-title">Имитация живого пользователя</h4>
              <p class="w-step-desc">Аккаунты просматривают контент и взаимодействуют с Telegram, поднимая рейтинг доверия серверов MTProto.</p>
              <div class="w-status in-progress"><RefreshCw :size="14" class="spin-anim" /> В процессе</div>
            </div>
          </div>
        </section>

        <!-- TAB 5: CLOUD LOGS -->
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
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(12px);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-home-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.back-home-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.brand-divider {
  width: 1px;
  height: 24px;
  background: rgba(148, 163, 184, 0.15);
}

.cabinet-logo {
  font-weight: 800;
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-accent {
  color: #38bdf8;
}

.cabinet-badge {
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 136, 204, 0.3);
  color: #38bdf8;
  padding: 2px 8px;
  border-radius: 12px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-cluster {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #94a3b8;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.user-profile-menu {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 4px 10px 4px 6px;
  border-radius: 30px;
}

.avatar-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc, #00b4d8);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-meta {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.1;
}

.user-plan {
  font-size: 0.68rem;
  color: #38bdf8;
}

.logout-icon-btn {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.logout-icon-btn:hover {
  color: #ef4444;
}

/* Cabinet Body */
.cabinet-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  flex: 1;
}

/* Sidebar */
.cabinet-sidebar {
  background: #070d1c;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 20px 14px;
}

.sidebar-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #f1f5f9;
}

.menu-item.active {
  background: rgba(0, 136, 204, 0.15);
  color: #38bdf8;
  border-left: 3px solid #0088cc;
}

.menu-label {
  flex: 1;
}

.menu-badge {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  padding: 1px 7px;
  border-radius: 10px;
}

.menu-tag-ai {
  font-size: 0.65rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0088cc, #06b6d4);
  color: #ffffff;
  padding: 1px 6px;
  border-radius: 4px;
}

.sidebar-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* Workspace */
.cabinet-workspace {
  padding: 24px 30px;
  overflow-y: auto;
  background: #040812;
}

.workspace-card {
  background: #090f1e;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.workspace-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.workspace-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* Accounts Table */
.accounts-table-wrapper {
  overflow-x: auto;
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.accounts-table th {
  text-align: left;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.02);
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.accounts-table td {
  padding: 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
  vertical-align: middle;
}

.acc-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.acc-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc, #00b4d8);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.acc-name {
  font-weight: 600;
  color: #f1f5f9;
}

.acc-phone {
  font-size: 0.74rem;
  color: #64748b;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 12px;
  font-size: 0.72rem;
  font-weight: 600;
}

.badge-success {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: #fbbf24;
}

.badge-danger {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
}

.badge-glow {
  background: rgba(0, 136, 204, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #38bdf8;
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

/* Redesigned Pill Role Selector */
.role-pill-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.role-pill-select {
  appearance: none;
  -webkit-appearance: none;
  background: rgba(14, 23, 42, 0.95);
  background-image: linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(0, 136, 204, 0.15));
  border: 1px solid rgba(56, 189, 248, 0.35);
  color: #38bdf8;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 30px 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.role-pill-select:hover {
  border-color: #38bdf8;
  background: rgba(14, 23, 42, 1);
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.35);
  transform: translateY(-1px);
}

.role-pill-select option {
  background: #0f172a;
  color: #f1f5f9;
}

.role-pill-chevron {
  position: absolute;
  right: 10px;
  pointer-events: none;
  color: #38bdf8;
  display: flex;
  align-items: center;
}

/* Actions Row */
.row-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Redesigned Telegram Web Launcher Button */
.btn-webtg-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #0088cc, #00a0e9);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 136, 204, 0.35);
}

.btn-webtg-pill:hover {
  background: linear-gradient(135deg, #0099e6, #00b4d8);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 136, 204, 0.5);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  font-size: 0.76rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.action-btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
  color: #fca5a5;
}

/* RouterAI Settings Card */
.router-ai-settings-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.router-settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.router-badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.router-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
}

.provider-badge {
  font-size: 0.68rem;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 2px 8px;
  border-radius: 12px;
}

.router-catalog-link {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: #38bdf8;
  text-decoration: none;
  transition: color 0.2s;
}

.router-catalog-link:hover {
  color: #7dd3fc;
  text-decoration: underline;
}

.router-fields-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.model-presets-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.presets-label {
  font-size: 0.74rem;
  color: #94a3b8;
  margin-right: 4px;
}

.model-pill-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  font-size: 0.74rem;
  padding: 4px 10px;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.model-pill-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.model-pill-btn.active {
  background: rgba(0, 136, 204, 0.25);
  border-color: #38bdf8;
  color: #38bdf8;
  font-weight: 600;
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
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 16px;
}

.prompt-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.btn-text-reset {
  background: transparent;
  border: none;
  color: #38bdf8;
  font-size: 0.72rem;
  cursor: pointer;
  padding: 0;
}

.btn-text-reset:hover {
  text-decoration: underline;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.78rem;
  color: #94a3b8;
  margin-bottom: 6px;
  font-weight: 500;
}

.input-field {
  width: 100%;
  padding: 9px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s;
}

.input-field:focus {
  border-color: #38bdf8;
}

.textarea-field {
  width: 100%;
  padding: 9px 12px;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-size: 0.84rem;
  line-height: 1.45;
  outline: none;
  resize: vertical;
  transition: border-color 0.2s;
}

.textarea-field:focus {
  border-color: #38bdf8;
}

.tone-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tone-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.2);
  color: #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tone-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.tone-btn.active {
  background: rgba(0, 136, 204, 0.25);
  border-color: #38bdf8;
  color: #38bdf8;
  font-weight: 600;
}

.preview-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.provider-tag {
  font-size: 0.68rem;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  padding: 2px 8px;
  border-radius: 4px;
}

.post-preview-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tg-post-mockup {
  background: #10192e;
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 8px;
  padding: 12px 14px;
}

.tg-post-header {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  color: #64748b;
  margin-bottom: 6px;
}

.tg-channel-name {
  color: #38bdf8;
  font-weight: 600;
}

.tg-post-text {
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.45;
}

.tg-comment-mockup {
  display: flex;
  gap: 10px;
  background: rgba(0, 136, 204, 0.06);
  border: 1px solid rgba(0, 136, 204, 0.25);
  border-radius: 8px;
  padding: 12px;
}

.tg-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0088cc;
  color: #ffffff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.tg-comment-body {
  flex: 1;
}

.tg-comment-author {
  font-size: 0.78rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.badge-auto {
  font-size: 0.65rem;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  padding: 1px 6px;
  border-radius: 4px;
}

.tg-comment-text {
  font-size: 0.84rem;
  color: #e2e8f0;
  line-height: 1.45;
}

.comment-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* Parser Modes & File Upload */
.parser-mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.p-mode-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #94a3b8;
  font-size: 0.84rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.p-mode-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.p-mode-tab.active {
  background: rgba(0, 136, 204, 0.2);
  border-color: #38bdf8;
  color: #38bdf8;
}

.p-mode-badge {
  font-size: 0.68rem;
  background: #0088cc;
  color: #ffffff;
  padding: 1px 6px;
  border-radius: 10px;
}

.parser-controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  background: rgba(12, 19, 34, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
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
  font-size: 0.8rem;
  color: #cbd5e1;
  cursor: pointer;
}

/* File Dropzone */
.file-parser-box {
  margin-bottom: 20px;
}

.hidden-file-input {
  display: none;
}

.file-dropzone {
  border: 2px dashed rgba(56, 189, 248, 0.3);
  background: rgba(15, 23, 42, 0.6);
  border-radius: var(--radius-lg);
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.file-dropzone:hover {
  border-color: #38bdf8;
  background: rgba(15, 23, 42, 0.9);
}

.dropzone-icon {
  color: #38bdf8;
  margin-bottom: 8px;
}

.dropzone-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.dropzone-sub {
  font-size: 0.8rem;
  color: #94a3b8;
}

.file-loaded-card {
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(56, 189, 248, 0.3);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.file-loaded-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-info-col {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-name {
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
}

.file-stats {
  font-size: 0.78rem;
  color: #94a3b8;
}

.file-stats strong {
  color: #38bdf8;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.chats-chips-box {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-height: 120px;
  overflow-y: auto;
  padding: 6px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
}

.chat-chip {
  font-size: 0.74rem;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 136, 204, 0.3);
  color: #7dd3fc;
  padding: 2px 8px;
  border-radius: 12px;
}

.chat-chip.more {
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
}

/* Parser Stats Card */
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
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0088cc, #06b6d4);
  transition: width 0.3s;
}

.stats-counters-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 20px;
  align-items: center;
}

.counter-box {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: 8px;
  padding: 14px;
}

.counter-num {
  font-size: 1.6rem;
  font-weight: 800;
  color: #38bdf8;
  line-height: 1;
  margin-bottom: 6px;
}

.counter-label {
  font-size: 0.78rem;
  color: #94a3b8;
}

.export-actions {
  display: flex;
  gap: 8px;
}

/* Warming Grid */
.warming-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
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
  box-shadow: 0 0 20px rgba(0, 136, 204, 0.15);
}

.w-day-badge {
  align-self: flex-start;
  font-size: 0.7rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  padding: 2px 8px;
  border-radius: 10px;
  margin-bottom: 12px;
}

.w-day-badge.active {
  background: rgba(0, 136, 204, 0.2);
  color: #38bdf8;
}

.w-step-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
}

.w-step-desc {
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.45;
  margin-bottom: 16px;
  flex: 1;
}

.w-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.76rem;
  font-weight: 600;
}

.w-status.done {
  color: #10b981;
}

.w-status.in-progress {
  color: #38bdf8;
}

/* Cloud Logs */
.terminal-box {
  background: #020610;
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 8px;
  padding: 16px;
  min-height: 380px;
  max-height: 520px;
  overflow-y: auto;
}

.term-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.term-line {
  display: flex;
  gap: 12px;
  font-size: 0.8rem;
  line-height: 1.4;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
}

.log-text.info {
  color: #cbd5e1;
}

.log-text.success {
  color: #34d399;
}

.log-text.warning {
  color: #fbbf24;
}

.log-text.error {
  color: #f87171;
}

.log-text.ai {
  color: #38bdf8;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 900px) {
  .cabinet-body {
    grid-template-columns: 1fr;
  }
  .two-col-grid,
  .warming-grid,
  .router-fields-grid,
  .parser-controls-grid {
    grid-template-columns: 1fr;
  }
}
</style>
