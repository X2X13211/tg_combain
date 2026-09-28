import express, { type Request, type Response } from 'express'
import cors from 'cors'
import { readDb, writeDb, type AccountRecord, type LogRecord, type UserRecord, type TelegramChatRecord, type TelegramChatMessage } from './db.ts'

export const apiApp = express()

apiApp.use(cors())
apiApp.use(express.json())

function addLog(type: LogRecord['type'], text: string) {
  const db = readDb()
  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  const newLog: LogRecord = {
    id: Date.now().toString(),
    time: timeStr,
    type,
    text
  }
  db.logs.push(newLog)
  if (db.logs.length > 100) {
    db.logs = db.logs.slice(-100)
  }
  writeDb(db)
}

// ----------------------------------------------------
// 1. Health check
// ----------------------------------------------------
apiApp.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '3.9.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
})

// ----------------------------------------------------
// 2. Authentication API
// ----------------------------------------------------
apiApp.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' })
  }

  const db = readDb()
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (existing) {
    return res.status(409).json({ error: 'Пользователь с такой почтой уже зарегистрирован' })
  }

  const newUser: UserRecord = {
    id: 'usr_' + Date.now().toString(36),
    username: String(username).trim(),
    email: String(email).trim().toLowerCase(),
    password: String(password),
    plan: 'full_access',
    createdAt: new Date().toISOString()
  }

  db.users.push(newUser)
  writeDb(db)

  addLog('success', `[Auth] Новый пользователь зарегистрирован: ${newUser.username} (${newUser.email})`)

  res.json({
    user: { id: newUser.id, username: newUser.username, email: newUser.email, plan: newUser.plan },
    token: 'jwt_' + Buffer.from(newUser.id).toString('base64')
  })
})

apiApp.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' })
  }

  const db = readDb()
  const user = db.users.find(
    u => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === String(password)
  )

  if (!user) {
    // If not found in demo database, auto-create account for seamless UX
    const newUser: UserRecord = {
      id: 'usr_' + Date.now().toString(36),
      username: String(email).split('@')[0],
      email: String(email).trim().toLowerCase(),
      password: String(password),
      plan: 'full_access',
      createdAt: new Date().toISOString()
    }
    db.users.push(newUser)
    writeDb(db)
    addLog('info', `[Auth] Создан профиль для входа: ${newUser.username}`)

    return res.json({
      user: { id: newUser.id, username: newUser.username, email: newUser.email, plan: newUser.plan },
      token: 'jwt_' + Buffer.from(newUser.id).toString('base64')
    })
  }

  addLog('info', `[Auth] Успешный вход в систему: ${user.username}`)

  res.json({
    user: { id: user.id, username: user.username, email: user.email, plan: user.plan },
    token: 'jwt_' + Buffer.from(user.id).toString('base64')
  })
})

apiApp.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Не авторизован' })
  }
  const token = authHeader.replace('Bearer ', '').trim()
  const db = readDb()
  const user = db.users.find(u => u.token === token) || db.users[0] || null
  res.json({ user })
})

// ----------------------------------------------------
// 3. Accounts Management API
// ----------------------------------------------------
apiApp.get('/api/accounts', (_req: Request, res: Response) => {
  const db = readDb()
  res.json({ accounts: db.accounts })
})

apiApp.post('/api/accounts', (req: Request, res: Response) => {
  const { phone, name, proxy, role, autoWarm } = req.body
  const db = readDb()

  const isUs = phone && (phone.startsWith('+1') || phone.startsWith('1'))
  const newAcc: AccountRecord = {
    id: Date.now().toString(),
    phone: phone || '+1 659 667 3133',
    name: name || (isUs ? 'US Agent ' : 'Аккаунт №') + (db.accounts.length + 1),
    status: autoWarm ? 'warming' : 'valid',
    proxy: proxy || 'socks5://180.254.199.250:8080',
    geo: isUs ? 'US 🇺🇸' : 'EU 🇪🇺',
    ggr: 98,
    role: role || (autoWarm ? 'Автопрогрев' : 'Нейрокомментинг'),
    updatedAt: new Date().toISOString()
  }

  db.accounts.push(newAcc)
  writeDb(db)

  addLog('success', `[Accounts] Добавлен аккаунт ${newAcc.name} (${newAcc.phone}), привязан прокси ${newAcc.proxy}`)

  res.status(201).json({ account: newAcc })
})

apiApp.post('/api/accounts/:id/check', (req: Request, res: Response) => {
  const { id } = req.params
  const db = readDb()
  const acc = db.accounts.find(a => a.id === id)

  if (!acc) {
    return res.status(404).json({ error: 'Аккаунт не найден' })
  }

  acc.status = 'valid'
  acc.ggr = Math.min(100, acc.ggr + 4)
  acc.updatedAt = new Date().toISOString()
  writeDb(db)

  addLog('success', `[SpamBot] Аккаунт ${acc.name} проверен: статус Валидный, GGR ${acc.ggr}/100`)

  res.json({ account: acc })
})

apiApp.post('/api/accounts/check-all', (_req: Request, res: Response) => {
  const db = readDb()
  db.accounts.forEach(a => {
    if (a.status !== 'spamblock') {
      a.status = 'valid'
      a.ggr = Math.min(100, a.ggr + 2)
    }
  })
  writeDb(db)

  addLog('success', `[SpamBot] Массовая проверка завершена для ${db.accounts.length} аккаунтов. Ограничений нет`)

  res.json({ accounts: db.accounts })
})

apiApp.delete('/api/accounts/:id', (req: Request, res: Response) => {
  const { id } = req.params
  const db = readDb()
  const initialLen = db.accounts.length
  db.accounts = db.accounts.filter(a => a.id !== id)
  writeDb(db)

  if (db.accounts.length < initialLen) {
    addLog('warning', `[Accounts] Аккаунт ID ${id} удален из пула`)
    res.json({ success: true })
  } else {
    res.status(404).json({ error: 'Аккаунт не найден' })
  }
})

apiApp.patch('/api/accounts/:id/role', (req: Request, res: Response) => {
  const { id } = req.params
  const { role } = req.body
  const db = readDb()
  const acc = db.accounts.find(a => a.id === id)
  if (!acc) {
    return res.status(404).json({ error: 'Аккаунт не найден' })
  }
  acc.role = role || acc.role
  acc.updatedAt = new Date().toISOString()
  writeDb(db)

  addLog('info', `[Accounts: ${acc.phone}] Назначена роль «${acc.role}»`)
  res.json({ account: acc })
})

// ----------------------------------------------------
// 4. AI Neurocommenting API
// ----------------------------------------------------
const AI_COMMENT_TEMPLATES = {
  expert: [
    'В текущей фазе рынка ключевой фактор — это объём ликвидности в стакане. Без качественного риск-менеджмента легко поймать проскальзывание.',
    'Фундаментально ситуация выглядит стабильно, но локально индикаторы перегреты. Рекомендую фиксировать часть позиций лесенкой.',
    'Сравнивали с аналогичными решениями в нише — здесь алгоритм маршрутизации отрабатывает с минимальной задержкой.',
    'Грамотный подход. Главное учитывать корреляцию со смежными индексами перед входом в сделку.'
  ],
  casual: [
    'Отличный разбор! Сам присматриваюсь к этой теме уже пару недель, результаты радуют 🔥',
    'Кстати, тоже заметил эту тенденцию во вчерашней активности. Тема реально набирает обороты.',
    'Полезный материал, сохранил себе в закладки 👍',
    'Согласен с автором, на практике это работает именно так.'
  ],
  question: [
    'А какая средняя комиссия выходит при таком объёме транзакций на круг?',
    'Подскажите, используете ли динамический стоп-лосс или контролируете строго вручную?',
    'Интересно, как эта модель покажет себя при резком скачке волатильности в канале?',
    'С какими прокси-пулами связка показывает наименьший пинг?'
  ]
}

apiApp.post('/api/ai/comment/generate', (req: Request, res: Response) => {
  const { tone = 'expert', niche = 'Криптовалюта' } = req.body
  const list = AI_COMMENT_TEMPLATES[tone as keyof typeof AI_COMMENT_TEMPLATES] || AI_COMMENT_TEMPLATES.expert
  const comment = list[Math.floor(Math.random() * list.length)]

  addLog('ai', `[NeuroComment] Сгенерирован комментарий (стиль: ${tone}, ниша: ${niche})`)

  res.json({
    comment,
    niche,
    tone,
    confidence: 0.98,
    generatedAt: new Date().toISOString()
  })
})

// ----------------------------------------------------
// 5. AI Neurochatting API
// ----------------------------------------------------
const DEFAULT_CHAT_MESSAGES = [
  { id: 1, author: 'Target Agent (+1 659 667 3133)', time: '20:00', text: 'Сессия MTProto активна через socks5://180.254.199.250:8080. Чат-модуль готов к работе.' }
]

apiApp.get('/api/ai/chat/messages', (_req: Request, res: Response) => {
  res.json({ messages: DEFAULT_CHAT_MESSAGES })
})

apiApp.post('/api/ai/chat/send', (req: Request, res: Response) => {
  const { text, author = 'Вы' } = req.body
  if (!text) {
    return res.status(400).json({ error: 'Текст сообщения не может быть пустым' })
  }

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const userMsg = {
    id: Date.now(),
    author,
    time: timeStr,
    text
  }

  addLog('info', `[NeuroChat: +1 659 667 3133] Отправлено сообщение в чат: "${text}"`)

  // Automated bot response simulation
  const replies = [
    'Да, полностью согласен с этим наблюдением.',
    'Кстати, у нас по той же связке конверсия выросла почти вдвое.',
    'Главное соблюдать интервалы между отправками сообщений.',
    'Принято в обработку, диалог продолжается.'
  ]
  const botReplyText = replies[Math.floor(Math.random() * replies.length)]
  const botReply = {
    id: Date.now() + 100,
    author: 'Telegram Network',
    time: timeStr,
    text: botReplyText
  }

  res.json({
    userMessage: userMsg,
    botReply
  })
})

// ----------------------------------------------------
// 6. Smart Parser API
// ----------------------------------------------------
interface ParserState {
  isParsing: boolean
  progress: number
  channelsCount: number
  usersCount: number
  keywords: string
}

let parserState: ParserState = {
  isParsing: false,
  progress: 0,
  channelsCount: 0,
  usersCount: 0,
  keywords: 'крипта, p2p, арбитраж, трафик'
}

apiApp.post('/api/parser/start', (req: Request, res: Response) => {
  const { keywords } = req.body
  parserState.isParsing = true
  parserState.progress = 0
  parserState.channelsCount = 0
  parserState.usersCount = 0
  parserState.keywords = keywords || parserState.keywords

  addLog('info', `[Parser] Запущен парсер целевой аудитории по ключевым словам: "${parserState.keywords}"`)

  const interval = setInterval(() => {
    parserState.progress = Math.min(100, parserState.progress + 20)
    parserState.channelsCount += Math.floor(Math.random() * 8) + 4
    parserState.usersCount += Math.floor(Math.random() * 60) + 25

    if (parserState.progress >= 100) {
      clearInterval(interval)
      parserState.isParsing = false
      addLog('success', `[Parser] Сбор завершен: ${parserState.channelsCount} каналов с комментариями, ${parserState.usersCount} активных пользователей`)
    }
  }, 400)

  res.json({ status: 'started', state: parserState })
})

apiApp.get('/api/parser/status', (_req: Request, res: Response) => {
  res.json({ state: parserState })
})

apiApp.get('/api/parser/export', (req: Request, res: Response) => {
  const format = req.query.format === 'csv' ? 'csv' : 'txt'
  if (format === 'csv') {
    const csv = 'ID,Channel,Username,CommentsOpen,MembersCount\n1,Crypto Insights,@crypto_inside,true,18420\n2,P2P Arbitrage Hub,@p2p_hub,true,9450\n3,Traffic Secrets SNG,@traffic_secrets,true,12100'
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename=x2x_audience_${Date.now()}.csv`)
    return res.send(csv)
  }
  const txt = '@crypto_inside\n@p2p_hub\n@traffic_secrets\n@arbitrage_sng\n@web3_growth'
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Content-Disposition', `attachment; filename=x2x_audience_${Date.now()}.txt`)
  res.send(txt)
})

// ----------------------------------------------------
// 7. Warming & GGR API
// ----------------------------------------------------
apiApp.get('/api/warming/status', (_req: Request, res: Response) => {
  res.json({
    currentPhase: 3,
    totalPhases: 3,
    phases: [
      { id: 1, name: 'Подписки и чтение ленты', days: '1 - 2', status: 'completed' },
      { id: 2, name: 'Эмодзи-реакции и просмотры', days: '3 - 4', status: 'completed' },
      { id: 3, name: 'Нейродиалоги и подготовка', days: '5 - 7', status: 'in_progress' }
    ],
    safeLimits: {
      delayRangeSec: [30, 90],
      maxReactionsDaily: 50,
      readingDurationMin: 15
    }
  })
})

// ----------------------------------------------------
// 8. Logs API
// ----------------------------------------------------
apiApp.get('/api/logs', (_req: Request, res: Response) => {
  const db = readDb()
  res.json({ logs: db.logs })
})

apiApp.post('/api/logs/clear', (_req: Request, res: Response) => {
  const db = readDb()
  db.logs = []
  writeDb(db)
  res.json({ success: true })
})

// ----------------------------------------------------
// 9. Telegram Web Real Chats API
// ----------------------------------------------------
apiApp.get('/api/telegram/chats', (_req: Request, res: Response) => {
  const db = readDb()
  res.json({ chats: db.telegramChats || [] })
})

apiApp.post('/api/telegram/chats', (req: Request, res: Response) => {
  const { username, name } = req.body
  if (!username && !name) {
    return res.status(400).json({ error: 'Укажите username или название канала' })
  }

  const cleanName = (username || name).trim().replace(/^@/, '')
  const db = readDb()
  if (!db.telegramChats) db.telegramChats = []

  const existing = db.telegramChats.find(c => c.name.toLowerCase().includes(cleanName.toLowerCase()) || c.id === cleanName.toLowerCase())
  if (existing) {
    return res.json({ chat: existing })
  }

  const isChannel = cleanName.toLowerCase().includes('channel') || cleanName.toLowerCase().includes('news') || cleanName.toLowerCase().includes('chat')
  const newChat: TelegramChatRecord = {
    id: 'chat_' + Date.now(),
    name: '@' + cleanName,
    avatar: cleanName[0].toUpperCase(),
    verified: false,
    lastMsg: 'Канал успешно подключен через MTProto',
    time: 'только что',
    unread: 0,
    type: isChannel ? 'channel' : 'group',
    messages: [
      {
        id: 'm_' + Date.now(),
        text: `Подключение к @${cleanName} через прокси socks5://180.254.199.250:8080 успешно выполнено. История сообщений синхронизирована.`,
        fromMe: false,
        time: 'только что'
      }
    ]
  }

  db.telegramChats.push(newChat)
  writeDb(db)
  addLog('success', `[Telegram Web: +1 659 667 3133] Подключен новый чат @${cleanName} через socks5://180.254.199.250:8080`)
  res.status(201).json({ chat: newChat })
})

apiApp.post('/api/telegram/messages', (req: Request, res: Response) => {
  const { chatId, text } = req.body
  if (!chatId || !text) {
    return res.status(400).json({ error: 'chatId и text обязательны' })
  }

  const db = readDb()
  if (!db.telegramChats) db.telegramChats = []
  const chat = db.telegramChats.find(c => c.id === chatId)
  if (!chat) {
    return res.status(404).json({ error: 'Чат не найден' })
  }

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const userMsg: TelegramChatMessage = {
    id: 'msg_' + Date.now(),
    text,
    fromMe: true,
    time: timeStr
  }

  chat.messages.push(userMsg)
  chat.lastMsg = text
  chat.time = timeStr

  addLog('info', `[Telegram Web: +1 659 667 3133] Отправлено сообщение в «${chat.name}»: "${text}"`)

  // Automated bot response for @SpamBot
  let botReply: TelegramChatMessage | null = null
  if (chat.id === 'spambot') {
    const replyText = text.trim() === '/start' || text.toLowerCase().includes('start')
      ? 'Доброго времени суток! Рад сообщить, что на Ваш аккаунт сейчас не наложено никаких ограничений. Вы можете свободно отправлять сообщения в группы и писать в ЛС.'
      : 'Ваш аккаунт полностью чист. Никаких жалоб или ограничений не зафиксировано.'

    botReply = {
      id: 'msg_bot_' + Date.now(),
      text: replyText,
      fromMe: false,
      time: timeStr
    }
    chat.messages.push(botReply)
    chat.lastMsg = replyText
  }

  writeDb(db)
  res.json({ message: userMsg, botReply, chat })
})
