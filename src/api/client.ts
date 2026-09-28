// Frontend API Client for X2X-SMM Backend

const API_BASE = '' // uses same-origin /api/*

export interface AccountData {
  id: string
  phone: string
  name: string
  status: 'valid' | 'spamblock' | 'warming' | 'checking'
  proxy: string
  geo: string
  ggr: number
  role: string
  updatedAt?: string
}

export interface LogItem {
  id: string
  time: string
  type: 'info' | 'success' | 'ai' | 'warning' | 'error'
  text: string
}

export interface TelegramChatMessage {
  id: string
  text: string
  fromMe: boolean
  time: string
}

export interface TelegramChat {
  id: string
  name: string
  avatar: string
  verified: boolean
  lastMsg: string
  time: string
  unread: number
  type: 'service' | 'bot' | 'channel' | 'saved' | 'group'
  messages: TelegramChatMessage[]
}

export const apiClient = {
  // 1. Auth API
  auth: {
    async register(username: string, email: string, password: string) {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Ошибка регистрации')
      }
      return res.json()
    },

    async login(email: string, password: string) {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Ошибка входа')
      }
      return res.json()
    }
  },

  // 2. Accounts API
  accounts: {
    async getAll(): Promise<{ accounts: AccountData[] }> {
      const res = await fetch(`${API_BASE}/api/accounts`)
      if (!res.ok) throw new Error('Ошибка загрузки аккаунтов')
      return res.json()
    },

    async add(accountData: { phone?: string; name?: string; proxy?: string; role?: string; autoWarm?: boolean }): Promise<{ account: AccountData }> {
      const res = await fetch(`${API_BASE}/api/accounts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      })
      if (!res.ok) throw new Error('Ошибка добавления аккаунта')
      return res.json()
    },

    async check(id: string): Promise<{ account: AccountData }> {
      const res = await fetch(`${API_BASE}/api/accounts/${id}/check`, { method: 'POST' })
      if (!res.ok) throw new Error('Ошибка проверки аккаунта')
      return res.json()
    },

    async checkAll(): Promise<{ accounts: AccountData[] }> {
      const res = await fetch(`${API_BASE}/api/accounts/check-all`, { method: 'POST' })
      if (!res.ok) throw new Error('Ошибка массовой проверки')
      return res.json()
    },

    async delete(id: string): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/api/accounts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Ошибка удаления аккаунта')
      return res.json()
    },

    async updateRole(id: string, role: string): Promise<{ account: AccountData }> {
      const res = await fetch(`${API_BASE}/api/accounts/${id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      })
      if (!res.ok) throw new Error('Ошибка обновления роли')
      return res.json()
    }
  },

  // 3. AI Neurocommenting API
  ai: {
    async generateComment(niche: string, tone: string): Promise<{ comment: string; confidence: number }> {
      const res = await fetch(`${API_BASE}/api/ai/comment/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, tone })
      })
      if (!res.ok) throw new Error('Ошибка генерации комментария')
      return res.json()
    },

    async getChatMessages(): Promise<{ messages: any[] }> {
      const res = await fetch(`${API_BASE}/api/ai/chat/messages`)
      if (!res.ok) throw new Error('Ошибка загрузки сообщений')
      return res.json()
    },

    async sendChatMessage(text: string, author?: string) {
      const res = await fetch(`${API_BASE}/api/ai/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, author })
      })
      if (!res.ok) throw new Error('Ошибка отправки сообщения')
      return res.json()
    }
  },

  // 4. Parser API
  parser: {
    async start(keywords: string) {
      const res = await fetch(`${API_BASE}/api/parser/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords })
      })
      if (!res.ok) throw new Error('Ошибка запуска парсера')
      return res.json()
    },

    async getStatus() {
      const res = await fetch(`${API_BASE}/api/parser/status`)
      if (!res.ok) throw new Error('Ошибка получения статуса парсера')
      return res.json()
    },

    getExportUrl(format: 'txt' | 'csv') {
      return `${API_BASE}/api/parser/export?format=${format}`
    }
  },

  // 5. Warming API
  warming: {
    async getStatus() {
      const res = await fetch(`${API_BASE}/api/warming/status`)
      if (!res.ok) throw new Error('Ошибка получения статуса прогрева')
      return res.json()
    }
  },

  // 6. Logs API
  logs: {
    async getAll(): Promise<{ logs: LogItem[] }> {
      const res = await fetch(`${API_BASE}/api/logs`)
      if (!res.ok) throw new Error('Ошибка получения логов')
      return res.json()
    },

    async clear(): Promise<{ success: boolean }> {
      const res = await fetch(`${API_BASE}/api/logs/clear`, { method: 'POST' })
      if (!res.ok) throw new Error('Ошибка очистки логов')
      return res.json()
    }
  },

  // 7. Telegram Web API
  telegram: {
    async getChats(): Promise<{ chats: TelegramChat[] }> {
      const res = await fetch(`${API_BASE}/api/telegram/chats`)
      if (!res.ok) throw new Error('Ошибка загрузки чатов')
      return res.json()
    },

    async addChat(username: string): Promise<{ chat: TelegramChat }> {
      const res = await fetch(`${API_BASE}/api/telegram/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      })
      if (!res.ok) throw new Error('Ошибка подключения чата')
      return res.json()
    },

    async sendMessage(chatId: string, text: string): Promise<{ message: TelegramChatMessage; botReply?: TelegramChatMessage; chat: TelegramChat }> {
      const res = await fetch(`${API_BASE}/api/telegram/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, text })
      })
      if (!res.ok) throw new Error('Ошибка отправки сообщения')
      return res.json()
    }
  }
}
