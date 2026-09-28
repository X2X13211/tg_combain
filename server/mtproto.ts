// Real Telegram MTProto Client Engine (GramJS)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TelegramClient, Api } from 'telegram'
import { StringSession } from 'telegram/sessions/index.js'
import { readDb, writeDb, type TelegramChatRecord, type TelegramChatMessage } from './db.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SESSION_FILE = path.resolve(__dirname, '../data/telegram_session.txt')

const API_ID = 2040
const API_HASH = 'b18441a1ff607e10a989891a5462e627'

let client: TelegramClient | null = null
let currentPhoneCodeHash: string | null = null
let currentPhone: string = '+16596673133'

function loadSavedSession(): string {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      return fs.readFileSync(SESSION_FILE, 'utf-8').trim()
    }
  } catch {}
  return ''
}

function saveSessionString(sessionStr: string): void {
  try {
    fs.writeFileSync(SESSION_FILE, sessionStr, 'utf-8')
  } catch (err) {
    console.error('Error saving session:', err)
  }
}

export function parseProxy(proxyStr?: string): any {
  if (!proxyStr) return undefined
  try {
    const clean = proxyStr.replace(/^(socks5:\/\/|http:\/\/|https:\/\/)/, '')
    const parts = clean.split('@')
    const hostPort = parts[parts.length - 1]
    const [ip, port] = hostPort.split(':')
    return {
      ip,
      port: parseInt(port, 10) || 8080,
      socksType: 5,
      timeout: 4
    }
  } catch {
    return undefined
  }
}

export async function getOrInitClient(proxyStr?: string, forceDirect = false): Promise<TelegramClient> {
  if (client && client.connected) {
    return client
  }

  const savedSession = loadSavedSession()
  const stringSession = new StringSession(savedSession)
  const proxy = !forceDirect ? parseProxy(proxyStr) : undefined

  if (proxy && proxy.ip) {
    const proxyClient = new TelegramClient(stringSession, API_ID, API_HASH, {
      connectionRetries: 1,
      proxy
    })

    const connectWithTimeout = (targetClient: TelegramClient, ms: number) => {
      return Promise.race([
        targetClient.connect(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Proxy connect timeout')), ms))
      ])
    }

    try {
      await connectWithTimeout(proxyClient, 3500)
      client = proxyClient
      return client
    } catch {
      try { await proxyClient.disconnect() } catch {}
      console.warn(`[MTProto] Прокси ${proxy.ip}:${proxy.port} не ответил за 3.5с. Переключение на прямой шлюз Telegram DC...`)
    }
  }

  client = new TelegramClient(stringSession, API_ID, API_HASH, {
    connectionRetries: 2,
    useWSS: false
  })
  await client.connect()
  return client
}

export async function checkAuthStatus(): Promise<{ authorized: boolean; phone: string; hasSession: boolean }> {
  const saved = loadSavedSession()
  if (!saved) {
    return { authorized: false, phone: currentPhone, hasSession: false }
  }
  try {
    const cl = await getOrInitClient()
    const isAuth = await cl.checkAuthorization()
    return { authorized: Boolean(isAuth), phone: currentPhone, hasSession: true }
  } catch {
    return { authorized: false, phone: currentPhone, hasSession: Boolean(saved) }
  }
}

export async function requestAuthCode(phone: string, proxyStr?: string): Promise<{ success: boolean; phoneCodeHash?: string; error?: string; hint?: string }> {
  try {
    currentPhone = phone.trim().replace(/\s+/g, '')
    const cl = await getOrInitClient(proxyStr)

    const res = await cl.sendCode(
      { apiId: API_ID, apiHash: API_HASH },
      currentPhone
    )

    currentPhoneCodeHash = res.phoneCodeHash
    return {
      success: true,
      phoneCodeHash: res.phoneCodeHash,
      hint: `Код подтверждения отправлен от Telegram на номер ${currentPhone} (в официальное приложение или SMS)`
    }
  } catch (err: any) {
    console.error('sendCode error:', err)
    return {
      success: false,
      error: err.message || 'Ошибка запроса кода авторизации от Telegram'
    }
  }
}

export async function signInWithCode(phone: string, code: string, password?: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cl = await getOrInitClient()
    const cleanPhone = phone.trim().replace(/\s+/g, '')

    try {
      await cl.invoke(
        new Api.auth.SignIn({
          phoneNumber: cleanPhone,
          phoneCodeHash: currentPhoneCodeHash || '',
          phoneCode: code.trim()
        })
      )
    } catch (invokeErr: any) {
      if (invokeErr.errorMessage === 'SESSION_PASSWORD_NEEDED' && password) {
        await cl.signInWithPassword(
          { apiId: API_ID, apiHash: API_HASH },
          { password: async () => password, onError: (err: any) => { throw err } }
        )
      } else {
        throw invokeErr
      }
    }

    const sessionStr = String(cl.session.save())
    saveSessionString(sessionStr)

    // Load real dialogs right after auth
    await syncRealDialogs()

    return { success: true }
  } catch (err: any) {
    console.error('signIn error:', err)
    return {
      success: false,
      error: err.errorMessage || err.message || 'Неверный код подтверждения или ошибка авторизации Telegram'
    }
  }
}

export async function importDirectSession(sessionStr: string): Promise<{ success: boolean; error?: string }> {
  try {
    const stringSession = new StringSession(sessionStr.trim())
    const testClient = new TelegramClient(stringSession, API_ID, API_HASH, { connectionRetries: 2 })
    await testClient.connect()
    const isAuth = await testClient.checkAuthorization()

    if (!isAuth) {
      return { success: false, error: 'Данная сессия не авторизована или отозвана' }
    }

    client = testClient
    saveSessionString(sessionStr.trim())
    await syncRealDialogs()

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Ошибка импорта сессии' }
  }
}

export async function syncRealDialogs(): Promise<TelegramChatRecord[]> {
  try {
    const cl = await getOrInitClient()
    const isAuth = await cl.checkAuthorization()
    if (!isAuth) return []

    const dialogs = await cl.getDialogs({ limit: 40 })
    const realChats: TelegramChatRecord[] = []

    for (const d of dialogs) {
      const name = d.title || d.name || 'Telegram User'
      const id = String(d.id)
      const lastMessageText = d.message?.message || 'Медиа или сервисное сообщение'
      const date = d.date ? new Date(d.date * 1000) : new Date()
      const timeStr = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

      let type: TelegramChatRecord['type'] = 'group'
      if (d.isUser) type = 'bot'
      if (d.isChannel) type = 'channel'
      if (d.isGroup) type = 'group'

      const messages: TelegramChatMessage[] = []
      if (d.message) {
        messages.push({
          id: String(d.message.id),
          text: lastMessageText,
          fromMe: Boolean(d.message.out),
          time: timeStr
        })
      }

      realChats.push({
        id,
        name,
        avatar: name[0]?.toUpperCase() || 'TG',
        verified: Boolean((d.entity as any)?.verified),
        lastMsg: lastMessageText,
        time: timeStr,
        unread: d.unreadCount || 0,
        type,
        messages
      })
    }

    if (realChats.length > 0) {
      const db = readDb()
      db.telegramChats = realChats
      writeDb(db)
    }

    return realChats
  } catch (err) {
    console.error('syncRealDialogs error:', err)
    return []
  }
}

export async function sendMtprotoMessage(peer: string, messageText: string): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    const cl = await getOrInitClient()
    const isAuth = await cl.checkAuthorization()
    if (!isAuth) {
      return { success: false, error: 'MTProto клиент не авторизован' }
    }

    const res = await cl.sendMessage(peer, { message: messageText })
    return { success: true, messageId: String(res.id) }
  } catch (err: any) {
    console.error('sendMtprotoMessage error:', err)
    return { success: false, error: err.message || 'Ошибка отправки через MTProto' }
  }
}
