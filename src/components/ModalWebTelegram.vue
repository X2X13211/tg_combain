<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Send, CheckCheck, Smile, Paperclip, Search, CheckCircle2 } from '@lucide/vue'
import { apiClient, type TelegramChat } from '../api/client'

const props = defineProps<{
  account: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const activeChatIndex = ref(0)
const newMessage = ref('')
const searchQuery = ref('')
const isAddingChat = ref(false)

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
    lastMsg: 'Ваш аккаунт свободен от каких-либо ограничений.',
    time: '20:01',
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

const loadChats = async () => {
  try {
    const res = await apiClient.telegram.getChats()
    if (res.chats && res.chats.length > 0) {
      chats.value = res.chats
    }
  } catch {}
}

onMounted(() => {
  loadChats()
})

const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value
  const q = searchQuery.value.toLowerCase().trim()
  return chats.value.filter(c => c.name.toLowerCase().includes(q) || c.lastMsg.toLowerCase().includes(q))
})

const activeChat = computed(() => {
  return chats.value[activeChatIndex.value] || chats.value[0]
})

const addNewChat = async () => {
  if (!searchQuery.value.trim()) return
  isAddingChat.value = true
  try {
    const res = await apiClient.telegram.addChat(searchQuery.value.trim())
    if (res.chat) {
      const idx = chats.value.findIndex(c => c.id === res.chat.id)
      if (idx !== -1) {
        activeChatIndex.value = idx
      } else {
        chats.value.push(res.chat)
        activeChatIndex.value = chats.value.length - 1
      }
      searchQuery.value = ''
    }
  } catch {}
  isAddingChat.value = false
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeChat.value) return
  const textToSend = newMessage.value.trim()
  newMessage.value = ''

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  activeChat.value.messages.push({
    id: 'local_' + Date.now(),
    text: textToSend,
    fromMe: true,
    time: timeStr
  })
  activeChat.value.lastMsg = textToSend
  activeChat.value.time = timeStr

  try {
    const res = await apiClient.telegram.sendMessage(activeChat.value.id, textToSend)
    if (res.botReply) {
      setTimeout(() => {
        activeChat.value.messages.push(res.botReply!)
        activeChat.value.lastMsg = res.botReply!.text
      }, 500)
    }
  } catch {}
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
              <span class="tg-title">Telegram Web</span>
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
              @click="activeChatIndex = chats.findIndex(c => c.id === chat.id)"
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
                {{ activeChat?.name }}
                <CheckCircle2 v-if="activeChat?.verified" :size="14" class="verified-ic" />
              </div>
              <div class="active-chat-status">
                <span class="online-indicator"></span> в сети через {{ account?.proxy || 'socks5://180.254.199.250:8080' }} (DC5 US)
              </div>
            </div>
          </div>

          <div class="tg-messages-area">
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
            <button class="tg-tool-btn"><Paperclip :size="18" /></button>
            <input
              v-model="newMessage"
              type="text"
              placeholder="Написать сообщение..."
              class="tg-msg-input"
              @keyup.enter="sendMessage"
            />
            <button class="tg-tool-btn"><Smile :size="18" /></button>
            <button class="tg-send-btn" @click="sendMessage">
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
  max-width: 900px;
  width: 95%;
  height: 650px;
  padding: 0;
  display: flex;
  flex-direction: column;
  background: #0f172a;
  border-radius: var(--radius-lg);
  overflow: hidden;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #0088cc;
  display: flex;
  align-items: center;
  justify-content: center;
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
  transition: all 0.2s;
}

.btn-add-chat-inline:hover {
  background: #00a0e9;
  transform: scale(1.08);
}

.verified-ic {
  color: #38bdf8;
  display: inline-block;
  vertical-align: middle;
  margin-left: 3px;
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

.tg-acc-row {
  font-size: 0.76rem;
  color: #94a3b8;
}

.tg-acc-row strong {
  color: #f1f5f9;
}

.tg-close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 4px;
}

.tg-web-body {
  display: grid;
  grid-template-columns: 280px 1fr;
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
}

.tg-search-input {
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.84rem;
  color: #ffffff;
  width: 100%;
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
  background: rgba(0, 136, 204, 0.18);
}

.tg-chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc, #00b4d8);
  color: #ffffff;
  font-weight: 700;
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
}

.tg-chat-time {
  font-size: 0.72rem;
  color: #64748b;
}

.tg-chat-last-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.active-chat-status {
  font-size: 0.75rem;
  color: #10b981;
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
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 0.88rem;
  line-height: 1.45;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tg-msg-bubble.from-me {
  align-self: flex-end;
  background: #0088cc;
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.tg-msg-bubble.from-them {
  align-self: flex-start;
  background: #182438;
  color: #f1f5f9;
  border-bottom-left-radius: 4px;
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
  padding: 4px;
}

.tg-tool-btn:hover {
  color: #ffffff;
}

.tg-msg-input {
  flex: 1;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: var(--radius-pill);
  padding: 10px 18px;
  font-size: 0.88rem;
  color: #ffffff;
  outline: none;
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
  transition: transform 0.2s;
}

.tg-send-btn:hover {
  transform: scale(1.05);
  background: #0099e6;
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
