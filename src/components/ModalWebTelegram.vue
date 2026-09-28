<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import {
  Send,
  CheckCheck,
  Smile,
  Paperclip,
  Search,
  CheckCircle2,
  RefreshCw,
  Key,
  ShieldCheck,
  AlertCircle,
  Smartphone
} from '@lucide/vue'
import { apiClient, type TelegramChat, type TelegramChatMessage } from '../api/client'

const props = defineProps<{
  account: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

// State
const activeChatId = ref<string>('spambot')
const newMessage = ref('')
const searchQuery = ref('')
const isAddingChat = ref(false)
const messagesContainer = ref<HTMLElement | null>(null)

// MTProto Auth & Sync State
const isAuthorized = ref(false)
const authPhone = ref(props.account?.phone || '+1 659 667 3133')
const authStep = ref<'idle' | 'code_sent' | 'session_input'>('idle')
const authCode = ref('')
const authPassword = ref('')
const sessionInput = ref('')
const authLoading = ref(false)
const authError = ref('')
const authHint = ref('')
const isSyncing = ref(false)

const chats = ref<TelegramChat[]>([
  {
    id: 'tg_service',
    name: 'Telegram',
    avatar: 'T',
    verified: true,
    lastMsg: 'Успешный вход через MTProto US DC5 (IP: 180.254.199.250)',
    time: '20:00',
    unread: 0,
    type: 'service',
    messages: [
      {
        id: 'm1',
        text: 'Уведомление безопасности Telegram:\nУспешная авторизация в аккаунт.\nСессия: Target Agent (+1 659 667 3133)\nПрокси: socks5://180.254.199.250:8080 (DC5 US)\nКлиент: X2X Combine Web MTProto Engine v3.9',
        fromMe: false,
        time: '20:00'
      }
    ]
  },
  {
    id: 'spambot',
    name: 'SpamBot',
    avatar: 'S',
    verified: true,
    lastMsg: 'Ваш аккаунт полностью чист. Никаких жалоб или ограничений не зафиксировано.',
    time: '20:19',
    unread: 0,
    type: 'bot',
    messages: [
      { id: 'm2', text: '/start', fromMe: true, time: '20:00' },
      { id: 'm3', text: 'Доброго времени суток! Рад сообщить, что на Ваш аккаунт сейчас не наложено никаких ограничений. Вы можете свободно отправлять сообщения в группы и писать в ЛС.', fromMe: false, time: '20:01' }
    ]
  },
  {
    id: 'saved',
    name: 'Избранное',
    avatar: '★',
    verified: false,
    lastMsg: 'Конфигурация комбайна X2X-SMM',
    time: '20:02',
    unread: 0,
    type: 'saved',
    messages: [
      {
        id: 'm4',
        text: 'Рабочая связка X2X-SMM:\n• Аккаунт: +1 659 667 3133\n• Прокси: socks5://180.254.199.250:8080\n• Статус: Валидный (GGR 98/100)\n• Назначенная роль: Нейрокомментинг & Парсинг',
        fromMe: true,
        time: '20:02'
      }
    ]
  },
  {
    id: 'durov',
    name: 'Durov\'s Channel',
    avatar: 'D',
    verified: true,
    lastMsg: 'Telegram ecosystem updates and decentralized features',
    time: '19:45',
    unread: 0,
    type: 'channel',
    messages: [
      {
        id: 'm5',
        text: 'Telegram has reached over 950 million monthly active users. We continue improving our developer API, mini apps platform, and high-speed channels.',
        fromMe: false,
        time: '19:45'
      }
    ]
  }
])

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const loadChats = async () => {
  try {
    const res = await apiClient.telegram.getChats()
    if (res.chats && res.chats.length > 0) {
      chats.value = res.chats
      // Keep activeChatId valid
      if (!chats.value.some(c => c.id === activeChatId.value)) {
        activeChatId.value = chats.value[0].id
      }
      scrollToBottom()
    }
  } catch (err) {
    console.warn('loadChats err:', err)
  }
}

const checkMtproto = async () => {
  try {
    const st = await apiClient.telegram.getMtprotoStatus()
    isAuthorized.value = st.authorized
    if (st.phone) {
      authPhone.value = st.phone
    }
  } catch {}
}

onMounted(async () => {
  await checkMtproto()
  await loadChats()
  scrollToBottom()
})

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value
  const q = searchQuery.value.toLowerCase().trim()
  return chats.value.filter(c => c.name.toLowerCase().includes(q) || (c.lastMsg && c.lastMsg.toLowerCase().includes(q)))
})

const activeChat = computed(() => {
  return chats.value.find(c => c.id === activeChatId.value) || chats.value[0] || null
})

const selectChat = (chatId: string) => {
  activeChatId.value = chatId
  scrollToBottom()
}

const addNewChat = async () => {
  if (!searchQuery.value.trim()) return
  const query = searchQuery.value.trim()
  isAddingChat.value = true
  try {
    const res = await apiClient.telegram.addChat(query)
    if (res.chat) {
      const existing = chats.value.find(c => c.id === res.chat.id)
      if (!existing) {
        chats.value.push(res.chat)
      }
      activeChatId.value = res.chat.id
      searchQuery.value = ''
      scrollToBottom()
    }
  } catch (err) {
    console.error('addNewChat err:', err)
  }
  isAddingChat.value = false
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value) return
  const currentChat = activeChat.value
  const textToSend = newMessage.value.trim()
  newMessage.value = ''

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const newMsg: TelegramChatMessage = {
    id: 'local_' + Date.now(),
    text: textToSend,
    fromMe: true,
    time: timeStr
  }

  if (!currentChat.messages) currentChat.messages = []
  currentChat.messages.push(newMsg)
  currentChat.lastMsg = textToSend
  currentChat.time = timeStr
  scrollToBottom()

  try {
    const res = await apiClient.telegram.sendMessage(currentChat.id, textToSend)
    if (res.botReply) {
      setTimeout(() => {
        currentChat.messages.push(res.botReply!)
        currentChat.lastMsg = res.botReply!.text
        scrollToBottom()
      }, 350)
    }
  } catch (err) {
    console.error('sendMessage err:', err)
  }
}

// MTProto Live Methods
const handleRequestCode = async () => {
  authLoading.value = true
  authError.value = ''
  authHint.value = ''
  try {
    const phone = props.account?.phone || '+16596673133'
    const proxy = props.account?.proxy || 'socks5://180.254.199.250:8080'
    const res = await apiClient.telegram.sendMtprotoCode(phone, proxy)
    if (res.success) {
      authStep.value = 'code_sent'
      authHint.value = res.hint || 'Telegram отправил 5-значный код в приложение на ' + phone
    } else {
      authError.value = res.error || 'Ошибка запроса кода'
    }
  } catch (err: any) {
    authError.value = err.message || 'Сбой подключения MTProto'
  }
  authLoading.value = false
}

const handleSignIn = async () => {
  if (!authCode.value.trim()) {
    authError.value = 'Введите 5-значный код подтверждения'
    return
  }
  authLoading.value = true
  authError.value = ''
  try {
    const phone = props.account?.phone || '+16596673133'
    const res = await apiClient.telegram.signInMtproto(phone, authCode.value.trim(), authPassword.value.trim() || undefined)
    if (res.success) {
      isAuthorized.value = true
      authStep.value = 'idle'
      authCode.value = ''
      authPassword.value = ''
      await loadChats()
    } else {
      authError.value = res.error || 'Неверный код авторизации'
    }
  } catch (err: any) {
    authError.value = err.message || 'Ошибка авторизации'
  }
  authLoading.value = false
}

const handleImportSession = async () => {
  if (!sessionInput.value.trim()) {
    authError.value = 'Вставьте строку сессии'
    return
  }
  authLoading.value = true
  authError.value = ''
  try {
    const res = await apiClient.telegram.importSession(sessionInput.value.trim())
    if (res.success) {
      isAuthorized.value = true
      authStep.value = 'idle'
      sessionInput.value = ''
      await loadChats()
    } else {
      authError.value = res.error || 'Не удалось импортировать сессию'
    }
  } catch (err: any) {
    authError.value = err.message || 'Ошибка импорта'
  }
  authLoading.value = false
}

const handleSyncDialogs = async () => {
  isSyncing.value = true
  try {
    const res = await apiClient.telegram.syncDialogs()
    if (res.chats && res.chats.length > 0) {
      chats.value = res.chats
      activeChatId.value = chats.value[0].id
      scrollToBottom()
    }
  } catch (err) {
    console.error('sync err:', err)
  }
  isSyncing.value = false
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content web-tg-modal">
      <!-- Top Window Bar -->
      <div class="web-tg-bar">
        <div class="tg-info">
          <div class="tg-icon-circle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
            </svg>
          </div>
          <div>
            <div class="tg-title-row">
              <span class="tg-title">Telegram Web MTProto</span>
              <span class="tg-proxy-badge font-mono">{{ account?.proxy || 'socks5://180.254.199.250:8080' }}</span>
              <span class="tg-ping-badge">38ms · Online</span>
            </div>
            <div class="tg-acc-row">
              <span>Сессия: <strong>{{ account?.name || 'Target Agent' }}</strong> ({{ account?.phone || '+1 659 667 3133' }})</span>
            </div>
          </div>
        </div>

        <button class="tg-close-btn" @click="$emit('close')">✕</button>
      </div>

      <!-- Real MTProto Session & Dialog Sync Bar -->
      <div class="mtproto-bar" :class="{ 'mtproto-active': isAuthorized }">
        <div class="mtproto-status-left">
          <div class="status-indicator-dot" :class="{ live: isAuthorized }"></div>
          <span v-if="isAuthorized" class="status-text font-mono">
            MTProto подключен: {{ authPhone }} (US DC1 / DC5)
          </span>
          <span v-else class="status-text text-amber">
            Для загрузки 100% личных чатов с серверов Telegram подтвердите вход:
          </span>
        </div>

        <div class="mtproto-actions">
          <template v-if="isAuthorized">
            <button
              class="btn-sync-dialogs"
              :disabled="isSyncing"
              @click="handleSyncDialogs"
            >
              <RefreshCw :size="13" :class="{ 'spin-anim': isSyncing }" />
              <span>{{ isSyncing ? 'Синхронизация...' : 'Обновить чаты с аккаунта' }}</span>
            </button>
          </template>

          <template v-else-if="authStep === 'idle'">
            <button
              class="btn-auth-action primary"
              :disabled="authLoading"
              @click="handleRequestCode"
            >
              <Smartphone :size="13" />
              <span>{{ authLoading ? 'Запрос в Telegram...' : 'Запросить код в Telegram' }}</span>
            </button>
            <button
              class="btn-auth-action secondary"
              @click="authStep = 'session_input'"
            >
              <Key :size="13" />
              <span>Вставить .session</span>
            </button>
          </template>
        </div>
      </div>

      <!-- MTProto Code Input Dropdown / Banner -->
      <div v-if="authStep === 'code_sent'" class="mtproto-input-panel">
        <div class="input-panel-header">
          <ShieldCheck :size="15" class="text-sky" />
          <span>{{ authHint || 'Telegram отправил 5-значный код авторизации на ' + (account?.phone || '+1 659 667 3133') }}</span>
        </div>
        <div class="input-panel-form">
          <input
            v-model="authCode"
            type="text"
            maxlength="8"
            placeholder="Код из Telegram (5 цифр)"
            class="input-code font-mono"
            @keyup.enter="handleSignIn"
          />
          <input
            v-model="authPassword"
            type="password"
            placeholder="2FA пароль (если включен)"
            class="input-pwd"
            @keyup.enter="handleSignIn"
          />
          <button
            class="btn-submit-code"
            :disabled="authLoading"
            @click="handleSignIn"
          >
            {{ authLoading ? 'Вход...' : 'Подтвердить вход' }}
          </button>
          <button class="btn-cancel-auth" @click="authStep = 'idle'">Отмена</button>
        </div>
        <div v-if="authError" class="auth-error-msg">
          <AlertCircle :size="13" />
          <span>{{ authError }}</span>
        </div>
      </div>

      <!-- StringSession Input Banner -->
      <div v-if="authStep === 'session_input'" class="mtproto-input-panel">
        <div class="input-panel-header">
          <Key :size="15" class="text-emerald" />
          <span>Импорт готовой сессии Telethon / GramJS (StringSession)</span>
        </div>
        <div class="input-panel-form">
          <input
            v-model="sessionInput"
            type="text"
            placeholder="Вставьте строку 1B... или Telethon session string"
            class="input-session-str font-mono"
            @keyup.enter="handleImportSession"
          />
          <button
            class="btn-submit-code"
            :disabled="authLoading"
            @click="handleImportSession"
          >
            {{ authLoading ? 'Проверка...' : 'Импортировать' }}
          </button>
          <button class="btn-cancel-auth" @click="authStep = 'idle'">Отмена</button>
        </div>
        <div v-if="authError" class="auth-error-msg">
          <AlertCircle :size="13" />
          <span>{{ authError }}</span>
        </div>
      </div>

      <!-- Telegram Web Layout -->
      <div class="tg-web-body">
        <!-- Left Chats List -->
        <aside class="tg-chats-sidebar">
          <div class="tg-search-bar">
            <Search :size="14" class="search-ic" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск или @username чата..."
              class="tg-search-input"
              @keyup.enter="addNewChat"
            />
            <button
              v-if="searchQuery.trim()"
              class="btn-add-chat-inline"
              title="Подключить этот чат/канал"
              @click="addNewChat"
            >
              +
            </button>
          </div>

          <div class="tg-chats-list">
            <div
              v-for="chat in filteredChats"
              :key="chat.id"
              class="tg-chat-item"
              :class="{ active: activeChat?.id === chat.id }"
              @click="selectChat(chat.id)"
            >
              <div class="tg-chat-avatar">{{ chat.avatar }}</div>
              <div class="tg-chat-meta">
                <div class="tg-chat-name-row">
                  <span class="tg-chat-name">
                    {{ chat.name }}
                    <CheckCircle2 v-if="chat.verified" :size="13" class="verified-ic" />
                  </span>
                  <span class="tg-chat-time">{{ chat.time }}</span>
                </div>
                <div class="tg-chat-last-row">
                  <span class="tg-chat-last">{{ chat.lastMsg }}</span>
                  <span v-if="chat.unread" class="tg-unread-badge">{{ chat.unread }}</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Right Active Chat Window -->
        <main class="tg-chat-window">
          <div class="tg-chat-head">
            <div>
              <div class="active-chat-name">
                {{ activeChat?.name || 'Чат' }}
                <CheckCircle2 v-if="activeChat?.verified" :size="14" class="verified-ic" />
              </div>
              <div class="active-chat-status">
                <span class="online-indicator"></span> в сети через {{ account?.proxy || 'socks5://180.254.199.250:8080' }} (DC5 US)
              </div>
            </div>
          </div>

          <div ref="messagesContainer" class="tg-messages-area">
            <div
              v-for="m in activeChat?.messages"
              :key="m.id"
              class="tg-msg-bubble"
              :class="{ 'from-me': m.fromMe, 'from-them': !m.fromMe }"
            >
              <div class="tg-msg-text">{{ m.text }}</div>
              <div class="tg-msg-time">
                <span>{{ m.time }}</span>
                <CheckCheck v-if="m.fromMe" :size="13" class="check-ic" />
              </div>
            </div>
          </div>

          <div class="tg-input-bar">
            <button class="tg-tool-btn" title="Прикрепить файл"><Paperclip :size="18" /></button>
            <input
              v-model="newMessage"
              type="text"
              placeholder="Написать сообщение..."
              class="tg-msg-input"
              @keyup.enter="sendMessage"
            />
            <button class="tg-tool-btn" title="Смайлы"><Smile :size="18" /></button>
            <button class="tg-send-btn" title="Отправить" @click="sendMessage">
              <Send :size="16" />
            </button>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.web-tg-modal {
  max-width: 950px;
  width: 96%;
  height: 680px;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.web-tg-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background: #0b1324;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.tg-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tg-icon-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #0088cc;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 12px rgba(0, 136, 204, 0.4);
}

.tg-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tg-title {
  font-weight: 700;
  color: #ffffff;
  font-size: 0.95rem;
}

.tg-proxy-badge {
  font-size: 0.72rem;
  background: rgba(0, 136, 204, 0.2);
  border: 1px solid rgba(0, 136, 204, 0.35);
  color: #38bdf8;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.tg-ping-badge {
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: #34d399;
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.tg-acc-row {
  font-size: 0.76rem;
  color: #94a3b8;
  margin-top: 2px;
}

.tg-acc-row strong {
  color: #f1f5f9;
}

.tg-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.25rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.tg-close-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* MTProto Bar */
.mtproto-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 18px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  font-size: 0.78rem;
}

.mtproto-bar.mtproto-active {
  background: rgba(6, 78, 59, 0.2);
  border-bottom-color: rgba(16, 185, 129, 0.25);
}

.mtproto-status-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f59e0b;
  box-shadow: 0 0 6px #f59e0b;
}

.status-indicator-dot.live {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.status-text {
  color: #cbd5e1;
}

.text-amber {
  color: #fbbf24;
}

.mtproto-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-sync-dialogs {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #34d399;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-sync-dialogs:hover:not(:disabled) {
  background: rgba(16, 185, 129, 0.25);
}

.btn-auth-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-auth-action.primary {
  background: #0088cc;
  border: 1px solid #0099e6;
  color: #ffffff;
}

.btn-auth-action.primary:hover:not(:disabled) {
  background: #0099e6;
}

.btn-auth-action.secondary {
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #cbd5e1;
}

.btn-auth-action.secondary:hover {
  background: rgba(148, 163, 184, 0.2);
  color: #ffffff;
}

/* MTProto Input Panel */
.mtproto-input-panel {
  padding: 10px 18px;
  background: #111e38;
  border-bottom: 1px solid rgba(0, 136, 204, 0.3);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #e2e8f0;
}

.text-sky {
  color: #38bdf8;
}

.text-emerald {
  color: #34d399;
}

.input-panel-form {
  display: flex;
  gap: 8px;
  align-items: center;
}

.input-code {
  width: 170px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #090f1d;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #ffffff;
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 2px;
  outline: none;
}

.input-pwd {
  width: 180px;
  padding: 6px 12px;
  border-radius: 6px;
  background: #090f1d;
  border: 1px solid rgba(148, 163, 184, 0.25);
  color: #ffffff;
  font-size: 0.84rem;
  outline: none;
}

.input-session-str {
  flex: 1;
  padding: 6px 12px;
  border-radius: 6px;
  background: #090f1d;
  border: 1px solid rgba(56, 189, 248, 0.4);
  color: #ffffff;
  font-size: 0.82rem;
  outline: none;
}

.btn-submit-code {
  background: #0088cc;
  border: none;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.78rem;
  padding: 7px 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-submit-code:hover:not(:disabled) {
  background: #0099e6;
}

.btn-cancel-auth {
  background: transparent;
  border: 1px solid rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.78rem;
  cursor: pointer;
}

.btn-cancel-auth:hover {
  color: #ffffff;
  border-color: rgba(148, 163, 184, 0.5);
}

.auth-error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #f87171;
  font-size: 0.78rem;
}

/* Telegram Web Layout */
.tg-web-body {
  display: grid;
  grid-template-columns: 290px 1fr;
  flex: 1;
  overflow: hidden;
}

.tg-chats-sidebar {
  background: #0b1220;
  border-right: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  flex-direction: column;
}

.tg-search-bar {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(15, 23, 42, 0.6);
  border-bottom: 1px solid rgba(148, 163, 184, 0.08);
}

.search-ic {
  color: #64748b;
  flex-shrink: 0;
}

.tg-search-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.84rem;
  color: #ffffff;
  width: 100%;
}

.btn-add-chat-inline {
  background: #0088cc;
  border: none;
  color: #ffffff;
  font-weight: 700;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.95rem;
  line-height: 1;
  flex-shrink: 0;
  transition: all 0.2s;
}

.btn-add-chat-inline:hover {
  background: #00a0e9;
  transform: scale(1.08);
}

.tg-chats-list {
  flex: 1;
  overflow-y: auto;
}

.tg-chat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  cursor: pointer;
  border-bottom: 1px solid rgba(148, 163, 184, 0.05);
  transition: background 0.15s;
}

.tg-chat-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.tg-chat-item.active {
  background: rgba(0, 136, 204, 0.2);
  border-left: 3px solid #0088cc;
}

.tg-chat-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc, #00b4d8);
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tg-chat-meta {
  flex: 1;
  min-width: 0;
}

.tg-chat-name-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.tg-chat-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #f1f5f9;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 3px;
}

.tg-chat-time {
  font-size: 0.72rem;
  color: #64748b;
  flex-shrink: 0;
}

.tg-chat-last-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 6px;
}

.tg-chat-last {
  font-size: 0.78rem;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tg-unread-badge {
  font-size: 0.68rem;
  background: #0088cc;
  color: #ffffff;
  padding: 1px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.verified-ic {
  color: #38bdf8;
  flex-shrink: 0;
}

.online-indicator {
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px #10b981;
  margin-right: 4px;
}

/* Chat Window */
.tg-chat-window {
  display: flex;
  flex-direction: column;
  background: #090e1a;
  background-image: radial-gradient(rgba(0, 136, 204, 0.04) 1px, transparent 1px);
  background-size: 20px 20px;
}

.tg-chat-head {
  padding: 12px 18px;
  background: #0d1526;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.active-chat-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 4px;
}

.active-chat-status {
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 2px;
}

.tg-messages-area {
  flex: 1;
  padding: 18px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tg-msg-bubble {
  max-width: 72%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
  gap: 4px;
  word-break: break-word;
}

.tg-msg-bubble.from-me {
  align-self: flex-end;
  background: #0088cc;
  color: #ffffff;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 6px rgba(0, 136, 204, 0.3);
}

.tg-msg-bubble.from-them {
  align-self: flex-start;
  background: #182438;
  color: #f1f5f9;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.tg-msg-text {
  white-space: pre-wrap;
}

.tg-msg-time {
  align-self: flex-end;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 4px;
}

.check-ic {
  color: #a5f3fc;
}

.tg-input-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  background: #0d1526;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.tg-tool-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tg-tool-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.tg-msg-input {
  flex: 1;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: var(--radius-pill);
  padding: 10px 18px;
  font-size: 0.88rem;
  color: #ffffff;
  outline: none;
  transition: border-color 0.2s;
}

.tg-msg-input:focus {
  border-color: #0088cc;
}

.tg-send-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #0088cc;
  border: none;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}

.tg-send-btn:hover {
  transform: scale(1.06);
  background: #0099e6;
}

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 640px) {
  .tg-web-body {
    grid-template-columns: 1fr;
  }
  .tg-chats-sidebar {
    display: none;
  }
}
</style>
