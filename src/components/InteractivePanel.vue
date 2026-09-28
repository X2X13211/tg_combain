<script setup lang="ts">
import { ref } from 'vue'
import {
  Users, User, MessageSquare, Search, ShieldCheck, Terminal,
  CheckCircle2, AlertTriangle, RefreshCw, ExternalLink,
  Sparkles, Check, Clock, Sliders,
  Eye, Download
} from '@lucide/vue'

const emit = defineEmits<{
  (e: 'open-web-telegram', account: any): void
  (e: 'open-add-account'): void
}>()

// Active tab
const activeTab = ref<'accounts' | 'commenting' | 'parser' | 'warming' | 'logs'>('accounts')

// 1. ACCOUNTS MANAGER DATA & STATE
interface Account {
  id: string
  phone: string
  name: string
  status: 'valid' | 'spamblock' | 'warming' | 'checking'
  proxy: string
  geo: string
  ggr: number
  role: string
}

const accountsList = ref<Account[]>([
  { id: '1', phone: '+7 916 ••• 42 18', name: 'Александр В.', status: 'valid', proxy: 'socks5://de-static:8080', geo: 'DE 🇩🇪', ggr: 94, role: 'Нейрокомментинг' },
  { id: '2', phone: '+48 512 ••• 907', name: 'Marek Nowak', status: 'valid', proxy: 'socks5://pl-static:8080', geo: 'PL 🇵🇱', ggr: 91, role: 'Умный Парсер' },
  { id: '3', phone: '+52 55 ••• 3310', name: 'Carlos Mendez', status: 'warming', proxy: 'socks5://mx-mobile:4120', geo: 'MX 🇲🇽', ggr: 86, role: 'Прогрев (День 4)' },
  { id: '4', phone: '+44 7700 ••• 514', name: 'David Smith', status: 'valid', proxy: 'socks5://gb-static:9050', geo: 'GB 🇬🇧', ggr: 98, role: 'ЛС-Рассылки' },
  { id: '5', phone: '+34 612 ••• 882', name: 'Sofia Rodriguez', status: 'spamblock', proxy: 'socks5://es-res:3128', geo: 'ES 🇪🇸', ggr: 64, role: 'Снятие блока' }
])

const isCheckingAll = ref(false)

const runSpambotCheck = (acc: Account) => {
  acc.status = 'checking'
  setTimeout(() => {
    acc.status = 'valid'
    acc.ggr = Math.min(100, acc.ggr + 5)
  }, 1200)
}

const checkAllAccounts = () => {
  isCheckingAll.value = true
  accountsList.value.forEach((acc, i) => {
    setTimeout(() => {
      acc.status = 'checking'
      setTimeout(() => {
        if (acc.status === 'checking') acc.status = 'valid'
        if (i === accountsList.value.length - 1) isCheckingAll.value = false
      }, 1000)
    }, i * 300)
  })
}

// 2. NEURO-COMMENTING STATE
const postCategory = ref('crypto')
const commentTone = ref<'expert' | 'friendly' | 'shill' | 'curious'>('expert')
const isGeneratingComment = ref(false)
const generatedComment = ref('Кстати, по графику на 4H видна сильная компрессия у сопротивления. В такие моменты обычно выбивают стопы перед импульсом. Кто уже держит позицию?')

const samplePosts: Record<string, { channel: string; text: string; time: string }> = {
  crypto: {
    channel: 'Crypto Hub Insights (142 000 подписчиков)',
    text: 'Биткоин тестирует уровень $94 500 после рекордных притоков в ETF. Аналитики прогнозируют пробой отметки 100k уже к концу недели. Лонгуем или ждем коррекцию?',
    time: '2 мин назад'
  },
  marketing: {
    channel: 'Арбитраж и Трафик PRO (88 500 подписчиков)',
    text: 'Каналы в Telegram продолжают дорожать: CPM на закупах вырос на 40% за полгода. Приходится искать альтернативные связки под бурж и крипту.',
    time: '5 мин назад'
  },
  ecommerce: {
    channel: 'WB / Ozon Селлеры и Запуски (65 000 подписчиков)',
    text: 'Как вы защищаете карточки от скликивания рекламы конкурентами? Бюджет улетает за полдня, а конверсия в заказ нулевая.',
    time: '12 мин назад'
  }
}

const generateComment = () => {
  isGeneratingComment.value = true
  setTimeout(() => {
    isGeneratingComment.value = false
    if (commentTone.value === 'expert') {
      generatedComment.value = postCategory.value === 'crypto' 
        ? 'Смотрите не только на притоки, но и на funding rate. Если шортистов перегрузят, пробой будет резким сквизом без отката.'
        : 'У нас похожая ситуация была: снизили CPL в 3.2 раза, когда переключили трафик с прямых закупов на автоворонку с нейрокомментингом через X2X-SMM.'
    } else if (commentTone.value === 'friendly') {
      generatedComment.value = 'О, актуальная тема! Сам на прошлой неделе тестировал этот подход, результат приятно удивил. Могу в ЛС поделиться связкой, если интересно 🙂'
    } else if (commentTone.value === 'shill') {
      generatedComment.value = 'Зачем сливать бюджет на закупку рекламы по оверпрайсу, когда софт делает 150+ лидов в день на полном автомате? Загуглите X2X-SMM, комбайн решает.'
    } else {
      generatedComment.value = 'А вы учитываете комиссии биржи и спред при таком входе? На каком таймфрейме отслеживаете сигнал?'
    }
  }, 750)
}



// 4. PARSER STATE
const parserKeywords = ref('криптовалюта, p2p, арбитраж, трейдинг')
const filterOpenComments = ref(true)
const isParsing = ref(false)
const parseProgress = ref(0)
const parsedChannels = ref(1248)
const parsedUsers = ref(4390)

const runParser = () => {
  if (isParsing.value) return
  isParsing.value = true
  parseProgress.value = 10
  parsedChannels.value = 0
  parsedUsers.value = 0

  const interval = setInterval(() => {
    parseProgress.value += 18
    parsedChannels.value += Math.floor(Math.random() * 250) + 100
    parsedUsers.value += Math.floor(Math.random() * 800) + 400

    if (parseProgress.value >= 100) {
      clearInterval(interval)
      parseProgress.value = 100
      isParsing.value = false
    }
  }, 350)
}

// 5. CLOUD LOGS
const logs = ref([
  { time: '18:12:04', type: 'info', text: '[ProxyPool] Ротация 24 прокси успешна. Средний пинг: 48ms' },
  { time: '18:12:15', type: 'success', text: '[Account-02] SpamBot проверка пройдена: ограничений нет (GGR: 96)' },
  { time: '18:12:28', type: 'ai', text: '[NeuroComment] Сгенерирован контекстный ответ для канала "Crypto Hub"' },
  { time: '18:12:30', type: 'success', text: '[Telegram-Engine] Комментарий опубликован, получено 4 перехода в профиль' },
  { time: '18:12:45', type: 'info', text: '[CaptchaSolver] Капча чат-бота успешно решена за 0.8с (Стоимость: 0 ₽)' },
  { time: '18:13:01', type: 'warning', text: '[WarmUp] Аккаунт +52 55 ••• выполнил дневной лимит реакций. Пауза 25 мин' },
  { time: '18:13:20', type: 'success', text: '[Parser] Собрано 1 248 целевых каналов с открытыми комментариями' }
])
</script>

<template>
  <section id="demo" class="panel-section">
    <div class="container">
      <!-- Section Header -->
      <div class="section-head text-center">
        <h2 class="section-title">
          Попробуйте панель <span class="text-gradient-cyan">X2X-SMM в действии</span>
        </h2>
      </div>

      <!-- Browser Mockup Window -->
      <div class="browser-frame">
        <!-- Browser Top Bar -->
        <div class="browser-topbar">
          <div class="browser-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>

          <div class="browser-address">
            <ShieldCheck :size="14" class="lock-icon" />
            <span class="url-text">https://x2x-smm.cloud/app/dashboard</span>
          </div>

          <div class="browser-controls"></div>
        </div>

        <!-- Combine Main Interface -->
        <div class="panel-layout">
          <!-- Left Sidebar Navigation -->
          <aside class="panel-sidebar-left">
            <div class="sidebar-user-brief">
              <div class="user-avatar-circle">
                <User :size="15" />
              </div>
              <div class="user-brief-info">
                <div class="user-brief-name">Кабинет пользователя</div>
                <div class="user-brief-status">Telegram Combine</div>
              </div>
            </div>

            <nav class="sidebar-nav">
              <button
                class="nav-tab-btn"
                :class="{ active: activeTab === 'accounts' }"
                @click="activeTab = 'accounts'"
              >
                <Users :size="16" />
                <span>Менеджер аккаунтов</span>
                <span class="tab-counter">{{ accountsList.length }}</span>
              </button>

              <button
                class="nav-tab-btn"
                :class="{ active: activeTab === 'commenting' }"
                @click="activeTab = 'commenting'"
              >
                <MessageSquare :size="16" />
                <span>Нейрокомментинг</span>
                <span class="tab-badge">ИИ</span>
              </button>

              <button
                class="nav-tab-btn"
                :class="{ active: activeTab === 'parser' }"
                @click="activeTab = 'parser'"
              >
                <Search :size="16" />
                <span>Умный Парсер</span>
              </button>

              <button
                class="nav-tab-btn"
                :class="{ active: activeTab === 'warming' }"
                @click="activeTab = 'warming'"
              >
                <ShieldCheck :size="16" />
                <span>Автопрогрев & GGR</span>
              </button>

              <button
                class="nav-tab-btn"
                :class="{ active: activeTab === 'logs' }"
                @click="activeTab = 'logs'"
              >
                <Terminal :size="16" />
                <span>Живые логи</span>
              </button>
            </nav>
          </aside>

          <!-- Middle User Cabinet Workspace -->
          <main class="panel-body">
            <!-- TAB 1: ACCOUNTS MANAGER -->
            <div v-if="activeTab === 'accounts'" class="tab-content">
              <div class="content-header">
                <div>
                  <h3 class="tab-title">Подключенные аккаунты</h3>
                </div>
                <div class="header-actions">
                  <button class="btn btn-secondary btn-sm" :disabled="isCheckingAll" @click="checkAllAccounts">
                    <RefreshCw :size="15" :class="{ 'spin-anim': isCheckingAll }" />
                    <span>{{ isCheckingAll ? 'Проверка...' : 'Проверить @SpamBot' }}</span>
                  </button>
                </div>
              </div>

              <!-- Accounts Table -->
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
                        <span class="role-tag">{{ acc.role }}</span>
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
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- TAB 2: NEURO-COMMENTING -->
            <div v-else-if="activeTab === 'commenting'" class="tab-content">
              <div class="content-header">
                <div>
                  <h3 class="tab-title">ИИ-Нейрокомментинг каналов</h3>
                  <p class="tab-desc">Нейросеть мгновенно читает новый пост в целевом канале и оставляет органичный комментарий со смыслом.</p>
                </div>
                <button class="btn btn-primary btn-sm" :disabled="isGeneratingComment" @click="generateComment">
                  <Sparkles :size="16" />
                  <span>{{ isGeneratingComment ? 'ИИ думает...' : 'Сгенерировать тест' }}</span>
                </button>
              </div>

              <div class="two-col-grid">
                <!-- Settings Card -->
                <div class="panel-card">
                  <h4 class="card-subtitle"><Sliders :size="16" /> Настройки генерации</h4>
                  <div class="form-group">
                    <label class="form-label">Тематика канала</label>
                    <select v-model="postCategory" class="input-field">
                      <option value="crypto">Криптовалюта и трейдинг</option>
                      <option value="marketing">Арбитраж трафика и маркетинг</option>
                      <option value="ecommerce">Маркетплейсы и E-commerce</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Стиль и роль комментария</label>
                    <div class="tone-buttons">
                      <button
                        class="tone-btn"
                        :class="{ active: commentTone === 'expert' }"
                        @click="commentTone = 'expert'"
                      >
                        Эксперт
                      </button>
                      <button
                        class="tone-btn"
                        :class="{ active: commentTone === 'friendly' }"
                        @click="commentTone = 'friendly'"
                      >
                        Дружелюбный
                      </button>
                      <button
                        class="tone-btn"
                        :class="{ active: commentTone === 'shill' }"
                        @click="commentTone = 'shill'"
                      >
                        Нативный оффер
                      </button>
                      <button
                        class="tone-btn"
                        :class="{ active: commentTone === 'curious' }"
                        @click="commentTone = 'curious'"
                      >
                        Вопрос
                      </button>
                    </div>
                  </div>

                  <div class="form-group">
                    <label class="form-label">Задержка после публикации поста</label>
                    <div class="delay-slider-box">
                      <span>Случайно: <strong>15 - 45 сек</strong></span>
                      <span class="badge badge-glow">Имитация живого чтения</span>
                    </div>
                  </div>
                </div>

                <!-- Simulation Live Preview -->
                <div class="panel-card preview-card">
                  <h4 class="card-subtitle"><Eye :size="16" /> Симуляция в реальном времени</h4>
                  <div class="tg-post-mockup">
                    <div class="tg-post-header">
                      <div class="tg-channel-name">{{ samplePosts[postCategory].channel }}</div>
                      <div class="tg-post-time">{{ samplePosts[postCategory].time }}</div>
                    </div>
                    <p class="tg-post-text">{{ samplePosts[postCategory].text }}</p>
                  </div>

                  <div class="comment-arrow">
                    <span>↓ ИИ мгновенно оставил комментарий:</span>
                  </div>

                  <div class="tg-comment-mockup">
                    <div class="tg-comment-avatar">A</div>
                    <div class="tg-comment-body">
                      <div class="tg-comment-author">Александр В. <span class="badge-auto">X2X Бот</span></div>
                      <p class="tg-comment-text">{{ generatedComment }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>



            <!-- TAB 4: PARSER -->
            <div v-else-if="activeTab === 'parser'" class="tab-content">
              <div class="content-header">
                <div>
                  <h3 class="tab-title">Умный ИИ-Парсер каналов и чатов</h3>
                  <p class="tab-desc">Сбор каналов с открытыми комментариями, фильтрация по странам, активности и ключевым словам.</p>
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
                    <input v-model="filterOpenComments" type="checkbox" checked />
                    <span>Только каналы с открытыми комментариями</span>
                  </label>
                  <label class="checkbox-label">
                    <input type="checkbox" checked />
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
                  <div class="counter-box">
                    <button class="btn btn-secondary btn-sm" :disabled="parsedChannels === 0">
                      <Download :size="16" />
                      <span>Экспорт базы (.TXT / .CSV)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 5: WARMING & PROTECTION -->
            <div v-else-if="activeTab === 'warming'" class="tab-content">
              <div class="content-header">
                <div>
                  <h3 class="tab-title">Автопрогрев и ИИ-Защита аккаунтов (GGR)</h3>
                  <p class="tab-desc">Свежие аккаунты живут годами: алгоритм имитирует поведение живого пользователя через чтение каналов, реакции и диалоги.</p>
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
            </div>

            <!-- TAB 6: LOGS -->
            <div v-else-if="activeTab === 'logs'" class="tab-content">
              <div class="content-header">
                <div>
                  <h3 class="tab-title">Облачные логи задач 24/7</h3>
                  <p class="tab-desc">Непрерывный мониторинг выполнения заданий в облаке. Ваш компьютер может быть выключен.</p>
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
            </div>
          </main>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.panel-section {
  padding: 40px 0 80px;
}

.section-head {
  max-width: 780px;
  margin: 0 auto 36px;
  text-align: center;
}

.section-title {
  font-size: clamp(2rem, 3.8vw, 2.9rem);
  margin-bottom: 14px;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
}

/* Browser Frame */
.browser-frame {
  background: #090e1a;
  border: 1px solid rgba(0, 180, 255, 0.28);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 136, 204, 0.2);
}

.browser-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #0b1324;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
  gap: 16px;
}

.browser-dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
}
.dot.red { background: #ef4444; }
.dot.yellow { background: #f59e0b; }
.dot.green { background: #10b981; }

.browser-address {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.15);
  padding: 6px 18px;
  border-radius: var(--radius-pill);
  font-size: 0.84rem;
  color: #cbd5e1;
  flex: 1;
  max-width: 580px;
}

.lock-icon {
  color: #10b981;
}

.url-badge {
  margin-left: auto;
  font-size: 0.72rem;
  color: #38bdf8;
  font-weight: 700;
  background: rgba(0, 136, 204, 0.15);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

.browser-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #94a3b8;
}

/* Panel Layout */
.panel-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  min-height: 580px;
}

/* Left Sidebar */
.panel-sidebar-left {
  background: #080d19;
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  padding: 16px 12px;
  display: flex;
  flex-direction: column;
}

.sidebar-user-brief {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 12px;
}

.user-avatar-circle {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(2, 132, 199, 0.2);
  border: 1px solid rgba(56, 189, 248, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
  flex-shrink: 0;
}

.user-brief-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
}

.user-brief-status {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 2px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.nav-tab-btn:hover {
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
}

.nav-tab-btn.active {
  background: rgba(2, 132, 199, 0.16);
  border-color: rgba(56, 189, 248, 0.28);
  color: #38bdf8;
}

.tab-counter {
  margin-left: auto;
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 1px 6px;
  border-radius: var(--radius-pill);
}

.tab-badge {
  margin-left: auto;
  font-size: 0.65rem;
  background: #0284c7;
  color: #ffffff;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 4px;
}

@media (max-width: 900px) {
  .panel-layout {
    grid-template-columns: 1fr;
  }
  .panel-sidebar-left {
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
}

.live-indicator {
  margin-left: auto;
  font-size: 0.65rem;
  color: #10b981;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.sidebar-footer {
  margin-top: 20px;
}

.plan-card {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(0, 180, 255, 0.2);
  border-radius: var(--radius-md);
  padding: 12px;
}

.plan-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.plan-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #f1f5f9;
}

.plan-price {
  font-size: 0.82rem;
  font-weight: 800;
  color: #38bdf8;
}

.plan-status {
  font-size: 0.72rem;
  color: #94a3b8;
}

/* Panel Body */
.panel-body {
  padding: 24px;
  background: #090e1a;
  overflow-y: auto;
}

.content-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 22px;
  gap: 16px;
  flex-wrap: wrap;
}

.tab-title {
  font-size: 1.25rem;
  color: #ffffff;
  margin-bottom: 4px;
}

.tab-desc {
  font-size: 0.86rem;
  color: #94a3b8;
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
  background: rgba(12, 19, 34, 0.6);
}

.accounts-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
  font-size: 0.85rem;
}

.accounts-table th {
  padding: 12px 14px;
  background: rgba(15, 23, 42, 0.9);
  color: #94a3b8;
  font-weight: 600;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.accounts-table td {
  padding: 12px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.06);
  color: #e2e8f0;
}

.acc-cell-main {
  display: flex;
  align-items: center;
  gap: 10px;
}

.acc-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(0, 136, 204, 0.2);
  color: #38bdf8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.acc-phone {
  font-weight: 600;
  color: #f1f5f9;
}

.acc-name {
  font-size: 0.74rem;
  color: #94a3b8;
}

.proxy-text {
  font-size: 0.8rem;
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
  border-radius: 3px;
}

.role-tag {
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  color: #cbd5e1;
}

.row-actions {
  display: flex;
  gap: 6px;
}

.action-btn {
  display: inline-flex;
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
  margin-bottom: 16px;
  color: #f1f5f9;
}

.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 6px;
}

.tone-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.tone-btn {
  padding: 8px 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(148, 163, 184, 0.15);
  color: #cbd5e1;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tone-btn:hover {
  background: rgba(255, 255, 255, 0.08);
}

.tone-btn.active {
  background: rgba(0, 136, 204, 0.2);
  border-color: #38bdf8;
  color: #ffffff;
  font-weight: 600;
}

.delay-slider-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.6);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  color: #cbd5e1;
}

.tg-post-mockup {
  background: #182232;
  border-radius: var(--radius-md);
  padding: 14px;
  border: 1px solid rgba(0, 180, 255, 0.15);
}

.tg-post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.tg-channel-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #38bdf8;
}

.tg-post-time {
  font-size: 0.72rem;
  color: #64748b;
}

.tg-post-text {
  font-size: 0.84rem;
  line-height: 1.5;
  color: #f1f5f9;
}

.comment-arrow {
  text-align: center;
  font-size: 0.78rem;
  color: #94a3b8;
  margin: 12px 0;
  font-weight: 600;
}

.tg-comment-mockup {
  display: flex;
  gap: 10px;
  background: rgba(0, 136, 204, 0.1);
  border: 1px solid rgba(0, 180, 255, 0.3);
  padding: 12px;
  border-radius: var(--radius-md);
}

.tg-comment-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc, #00d2ff);
  color: #ffffff;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tg-comment-author {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
}

.badge-auto {
  font-size: 0.65rem;
  background: #0088cc;
  padding: 1px 6px;
  border-radius: 4px;
}

.tg-comment-text {
  font-size: 0.83rem;
  color: #e2e8f0;
  line-height: 1.45;
}

/* Chat Simulator */
.chat-simulator-wrapper {
  background: rgba(12, 19, 34, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chat-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 18px;
  background: rgba(15, 23, 42, 0.95);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.chat-group-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

.chat-messages-box {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 320px;
  overflow-y: auto;
}

.sim-message {
  display: flex;
  gap: 10px;
  background: rgba(18, 28, 48, 0.6);
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(148, 163, 184, 0.08);
}

.msg-avatar {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(0, 136, 204, 0.2);
  color: #38bdf8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.msg-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 3px;
}

.msg-author {
  font-size: 0.8rem;
  font-weight: 700;
  color: #38bdf8;
}

.msg-time {
  font-size: 0.7rem;
  color: #64748b;
}

.msg-text {
  font-size: 0.84rem;
  color: #f1f5f9;
  line-height: 1.45;
}

.chat-sim-footer {
  display: flex;
  gap: 10px;
  padding: 14px 18px;
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

/* Parser */
.parser-controls-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
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
  font-size: 0.82rem;
  color: #cbd5e1;
  cursor: pointer;
}

.parser-stats-card {
  background: rgba(12, 19, 34, 0.7);
  border: 1px solid rgba(0, 180, 255, 0.2);
  border-radius: var(--radius-lg);
  padding: 22px;
}

.progress-bar-container {
  margin-bottom: 20px;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.84rem;
  color: #cbd5e1;
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
  background: linear-gradient(90deg, #0088cc, #00e5ff);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.stats-counters-row {
  display: flex;
  align-items: center;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.counter-box {
  text-align: center;
}

.counter-num {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
  margin-bottom: 6px;
}

.counter-label {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* Warming Grid */
.warming-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.warming-card {
  background: rgba(12, 19, 34, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 20px;
  position: relative;
}

.warming-card.active-card {
  border-color: rgba(0, 180, 255, 0.4);
  background: rgba(15, 25, 48, 0.85);
  box-shadow: 0 0 25px rgba(0, 136, 204, 0.2);
}

.w-day-badge {
  font-size: 0.72rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.05);
  padding: 3px 8px;
  border-radius: 6px;
  display: inline-block;
  margin-bottom: 10px;
}

.w-day-badge.active {
  background: rgba(0, 136, 204, 0.2);
  color: #38bdf8;
}

.w-step-title {
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: 8px;
}

.w-step-desc {
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.45;
  margin-bottom: 14px;
}

.w-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 600;
}

.w-status.done {
  color: #10b981;
}

.w-status.in-progress {
  color: #38bdf8;
}

/* Terminal */
.terminal-box {
  background: #030712;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.term-header {
  background: #0b1324;
  padding: 8px 14px;
  font-size: 0.78rem;
  color: #64748b;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.term-body {
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
  font-size: 0.82rem;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.term-line {
  display: flex;
  gap: 12px;
}

.log-time {
  color: #64748b;
  flex-shrink: 0;
}

.log-text.info { color: #cbd5e1; }
.log-text.success { color: #34d399; }
.log-text.ai { color: #38bdf8; }
.log-text.warning { color: #fbbf24; }

.spin-anim {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 980px) {
  .panel-layout {
    grid-template-columns: 1fr;
  }
  .panel-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  }
  .sidebar-nav {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }
  .two-col-grid, .parser-controls-grid, .warming-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .sidebar-nav {
    grid-template-columns: 1fr;
  }
  .browser-address {
    display: none;
  }
}
</style>
