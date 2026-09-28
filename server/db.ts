import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

const DB_FILE = path.join(DATA_DIR, 'db.json')

export interface UserRecord {
  id: string
  username: string
  email: string
  password: string
  token?: string
  plan: string
  createdAt: string
}

export interface AccountRecord {
  id: string
  userId?: string
  phone: string
  name: string
  status: 'valid' | 'spamblock' | 'warming' | 'checking'
  proxy: string
  geo: string
  ggr: number
  role: string
  updatedAt: string
}

export interface LogRecord {
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

export interface TelegramChatRecord {
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

export interface DbSchema {
  users: UserRecord[]
  accounts: AccountRecord[]
  logs: LogRecord[]
  telegramChats: TelegramChatRecord[]
}

const defaultData: DbSchema = {
  users: [
    {
      id: 'usr_main',
      username: 'client_admin',
      email: 'admin@x2x-smm.cloud',
      password: 'password123',
      plan: 'pro_full',
      createdAt: new Date().toISOString()
    }
  ],
  accounts: [
    {
      id: '1',
      phone: '+1 659 667 3133',
      name: 'Target Agent',
      status: 'valid',
      proxy: 'socks5://180.254.199.250:8080',
      geo: 'US 🇺🇸',
      ggr: 98,
      role: 'Нейрокомментинг & Парсинг',
      updatedAt: new Date().toISOString()
    }
  ],
  logs: [
    { id: '1', time: '20:00:12', type: 'info', text: '[ProxyPool] Прокси 180.254.199.250:8080 подключен (HTTPS, SOCKS4/5). Пинг: 38ms' },
    { id: '2', time: '20:00:15', type: 'success', text: '[Account: +1 659 667 3133] MTProto сессия авторизована через US DC5 кластер' },
    { id: '3', time: '20:00:18', type: 'success', text: '[SpamBot] Аккаунт +1 659 667 3133 проверен: ограничений нет, GGR Траст 98/100' },
    { id: '4', time: '20:01:05', type: 'ai', text: '[AI-Engine] Нейрокомментинг и автопарсинг активированы в фоновом режиме' }
  ],
  telegramChats: [
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
  ]
}

export function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(defaultData)
      return defaultData
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (err) {
    console.error('Error reading db:', err)
    return defaultData
  }
}

export function writeDb(data: DbSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing db:', err)
  }
}
