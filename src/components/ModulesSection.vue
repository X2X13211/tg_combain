<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  MessageSquare, Flame, Eye, Bot, Send, Users, ShieldCheck,
  Search, Shield, Tag, MessageCircle, BarChart3, Sliders, CheckCircle2,
  Sparkles, ArrowRight
} from '@lucide/vue'

defineEmits<{
  (e: 'select-module', module: any): void
}>()

const activeCategory = ref<'all' | 'traffic' | 'chat' | 'broadcast' | 'accounts' | 'parser'>('all')

interface ModuleItem {
  id: string
  title: string
  category: 'traffic' | 'chat' | 'broadcast' | 'accounts' | 'parser'
  categoryName: string
  icon: any
  badge: string
  summary: string
  demoText: string
  highlight: string
  stats: string
}

const modules = ref<ModuleItem[]>([
  {
    id: 'neurocommenting',
    title: 'Нейрокомментинг',
    category: 'traffic',
    categoryName: 'Трафик из каналов',
    icon: MessageSquare,
    badge: 'ИИ Генерация',
    summary: 'Отслеживает новые посты в каналах вашей ниши и публикует органичные комментарии от ваших аккаунтов со смыслом.',
    demoText: '«Согласен, но при входе в лонг лучше перепроверить объемы на споте…»',
    highlight: 'Контекстный ответ на основе поста, а не типовой спам.',
    stats: '+350-800 переходов в день'
  },
  {
    id: 'inviting',
    title: 'Инвайтинг в группы',
    category: 'traffic',
    categoryName: 'Трафик из каналов',
    icon: Flame,
    badge: 'Инвайтинг',
    summary: 'Безопасное добавление целевых участников из спарсенных каналов в ваши группы с соблюдением суточных лимитов.',
    demoText: '«+45 целевых участников добавлено в группу за час»',
    highlight: 'Умная пауза и ротация аккаунтов для максимальной безопасности.',
    stats: 'До 1 500 инвайтов/день'
  },
  {
    id: 'reactions',
    title: 'МассРеакции',
    category: 'traffic',
    categoryName: 'Трафик из каналов',
    icon: Sparkles,
    badge: 'Реакции',
    summary: 'Автоматические реакции на комментарии в целевых каналах и сообщения в группах для привлечения внимания пользователей к вашему аккаунту.',
    demoText: '🔥 18   👍 12   ❤️ 9 под ключевыми сообщениями аудитории',
    highlight: 'Поддержка кастомных эмодзи и Telegram Premium реакций.',
    stats: 'До 5 000 реакций/день'
  },
  {
    id: 'masslooking',
    title: 'Масслукинг',
    category: 'traffic',
    categoryName: 'Трафик из каналов',
    icon: Eye,
    badge: 'Сторис',
    summary: 'Массовый просмотр историй (Stories) собранной целевой базы с простановкой огоньков и лайков.',
    demoText: 'Просмотрено 1 840 сторис целевых предпринимателей за 2 часа',
    highlight: 'Пользователи видят ваш аккаунт в списке зрителей и переходят в профиль.',
    stats: 'До 10 000 просмотров/день'
  },
  {
    id: 'chatfilter',
    title: 'Фильтрация чатов',
    category: 'chat',
    categoryName: 'Общение и продажи',
    icon: Bot,
    badge: 'Анализ',
    summary: 'Автоматический анализ активности чатов, отсев спама и ботов, проверка открытых комментариев перед запуском.',
    demoText: '«Проанализировано 120 чатов: 85 активных, 35 отсеяно как накрученные»',
    highlight: 'Глубокий скоринг активности перед запуском любых связок.',
    stats: 'Экономия 80% времени'
  },
  {
    id: 'neurodialogs',
    title: 'НейроДиалоги (ЛС)',
    category: 'chat',
    categoryName: 'Общение и продажи',
    icon: MessageCircle,
    badge: 'Личные сообщения',
    summary: 'Автоматически отвечает в личке всем, кто написал вашим аккаунтам, по заложенной воронке продаж до получения заявки.',
    demoText: '«Привет! Да, держи ссылку на бота и промокод на первый месяц 🙂»',
    highlight: 'Интеграция с OpenAI, Gemini, DeepSeek или встроенной моделью бесплатно.',
    stats: 'Автоответ 24/7 за 3 секунды'
  },
  {
    id: 'pm-broadcast',
    title: 'ЛС-Рассылки',
    category: 'broadcast',
    categoryName: 'Рассылки',
    icon: Send,
    badge: 'Инвайтинг & ЛС',
    summary: 'Рассылка сообщений в личку по спарсенной базе пользователей с рандомизацией текста, спинтаксом и умными задержками.',
    demoText: '«{Привет|Здравствуйте}, {вижу вы в теме арбитража|интересует крипта?}»',
    highlight: 'Автоматический учет дневных лимитов Telegram для предотвращения спамблока.',
    stats: 'До 40 сообщений с аккаунта/день'
  },
  {
    id: 'chat-broadcast',
    title: 'Чат-Рассылки',
    category: 'broadcast',
    categoryName: 'Рассылки',
    icon: Users,
    badge: 'Группы',
    summary: 'Отправка сообщений по кругу в отобранные группы и чаты с автоответом на встречные вопросы в личку.',
    demoText: '«Ищем арбитражников в команду под крипту и гемблинг, пишите в ЛС»',
    highlight: 'Умная ротация аккаунтов и текстов объявлений.',
    stats: 'Охват до 50 000 человек'
  },
  {
    id: 'masstagging',
    title: 'Масстегинг в сторис',
    category: 'broadcast',
    categoryName: 'Рассылки',
    icon: Tag,
    badge: 'Отметки',
    summary: 'Публикация историй с невидимыми или органичными отметками пользователей целевой базы с пуш-уведомлением.',
    demoText: '«Вас отметили в истории»: переход сразу в ваш продающий оффер',
    highlight: 'Высочайший CTR уведомлений в Telegram.',
    stats: 'CTR до 28%'
  },
  {
    id: 'warming',
    title: 'Автопрогрев аккаунтов',
    category: 'accounts',
    categoryName: 'Безопасность',
    icon: ShieldCheck,
    badge: '7 дней прогрева',
    summary: 'Подписки, чтение ленты, реакции и переписки между своими аккаунтами, чтобы свежие сессии жили годами.',
    demoText: 'День 3 из 7 · 24 аккаунта успешно читают каналы и ставят реакции',
    highlight: 'Имитация поведения настоящего владельца смартфона.',
    stats: 'Защита от банов'
  },
  {
    id: 'account-manager',
    title: 'Менеджер аккаунтов',
    category: 'accounts',
    categoryName: 'Аккаунты',
    icon: Sliders,
    badge: '50+ действий',
    summary: 'Массовое оформление профилей (имя, био, аватарки), смена паролей 2FA, смена прокси и встроенный Telegram Web.',
    demoText: 'Оформлено 24 профиля: имена, аватары, био сгенерированы ИИ за 1 минуту',
    highlight: 'Поддержка форматов session + json, tdata и авторизации по SMS.',
    stats: 'Управление до 10 000 аккаунтов'
  },
  {
    id: 'ai-protection',
    title: 'ИИ-Защита аккаунтов',
    category: 'accounts',
    categoryName: 'Безопасность',
    icon: Shield,
    badge: 'Антибан',
    summary: 'Рандомизирует интервалы между задачами, имитирует задержки печати текста и обходит антифрод системы Telegram.',
    demoText: 'Прочитано 12 постов, эмуляция ввода текста, пауза 4.2 мин',
    highlight: 'Динамические отпечатки устройств (Desktop, Android, iOS).',
    stats: 'Снижение банов в 7 раз'
  },
  {
    id: 'ggr-check',
    title: 'GGR Проверка живучести',
    category: 'accounts',
    categoryName: 'Безопасность',
    icon: BarChart3,
    badge: 'ИИ Аналитика',
    summary: 'ИИ-оценка здоровья аккаунта: прогнозирует оставшийся срок жизни и риск бана до запуска массовых рассылок.',
    demoText: 'Рейтинг доверия: 94 из 100 · Риск бана минимальный · Готов к работе',
    highlight: 'Бесплатная проверка спамблока через официальный @SpamBot.',
    stats: 'Точность прогноза 98%'
  },
  {
    id: 'channel-parser',
    title: 'Парсер каналов и чатов',
    category: 'parser',
    categoryName: 'Сбор базы',
    icon: Search,
    badge: 'Поиск каналов',
    summary: 'Сбор каналов и групп по ключевым словам, гео, объему подписчиков и наличию открытых комментариев.',
    demoText: 'Найдено 1 420 каналов в нише "Криптовалюта" с открытыми комментариями',
    highlight: 'Фильтрация накрученных каналов с мертвой аудиторией.',
    stats: 'Сбор 5 000 каналов за 2 мин'
  },
  {
    id: 'user-parser',
    title: 'Парсер пользователей',
    category: 'parser',
    categoryName: 'Сбор базы',
    icon: Users,
    badge: 'Сбор ЦА',
    summary: 'Сбор активной базы пользователей: участников чатов, авторов комментариев под постами и авторов сообщений.',
    demoText: 'Собрано 6 400 активных участников, писавших в чаты за последние 7 дней',
    highlight: 'Фильтрация ботов, удаленных аккаунтов и админов.',
    stats: 'Экспорт в .TXT / .CSV'
  }
])

const filteredModules = computed(() => {
  if (activeCategory.value === 'all') return modules.value
  return modules.value.filter(m => m.category === activeCategory.value)
})

const selectedModule = ref<ModuleItem | null>(null)
</script>

<template>
  <section id="modules" class="modules-section">
    <div class="container">
      <div class="section-head text-center">
        <h2 class="section-title">
          15 модулей автоматизации
        </h2>
        <p class="section-subtitle">
          Все модули включены в подписку без скрытых доплат и покупок отдельных плагинов.
        </p>
      </div>

      <!-- Categories Filter Tabs -->
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'all' }"
          @click="activeCategory = 'all'"
        >
          Все модули (15)
        </button>
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'traffic' }"
          @click="activeCategory = 'traffic'"
        >
          Трафик из каналов (4)
        </button>
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'chat' }"
          @click="activeCategory = 'chat'"
        >
          Общение и продажи (2)
        </button>
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'broadcast' }"
          @click="activeCategory = 'broadcast'"
        >
          Рассылки (3)
        </button>
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'accounts' }"
          @click="activeCategory = 'accounts'"
        >
          Аккаунты и Защита (4)
        </button>
        <button
          class="filter-tab"
          :class="{ active: activeCategory === 'parser' }"
          @click="activeCategory = 'parser'"
        >
          Сбор базы (2)
        </button>
      </div>

      <!-- Modules Grid -->
      <div class="modules-grid">
        <div
          v-for="item in filteredModules"
          :key="item.id"
          class="module-card glass-card"
          @click="selectedModule = item"
        >
          <div class="mod-top">
            <div class="mod-icon-wrapper">
              <component :is="item.icon" :size="22" class="mod-icon" />
            </div>
            <div class="mod-badges">
              <span class="badge badge-glow">{{ item.badge }}</span>
            </div>
          </div>

          <div class="mod-category">{{ item.categoryName }}</div>
          <h3 class="mod-title">{{ item.title }}</h3>
          <p class="mod-summary">{{ item.summary }}</p>

          <div class="mod-demo-box">
            <span class="mod-demo-label">Пример работы:</span>
            <div class="mod-demo-quote font-mono">{{ item.demoText }}</div>
          </div>

          <div class="mod-footer">
            <div class="mod-stat">
              <CheckCircle2 :size="14" class="stat-icon" />
              <span>{{ item.stats }}</span>
            </div>
            <span class="mod-included-tag">Включен в тариф</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedModule" class="modal-overlay" @click.self="selectedModule = null">
      <div class="modal-content">
        <div class="modal-header">
          <div class="mod-modal-title-box">
            <component :is="selectedModule.icon" :size="26" class="text-gradient-cyan" />
            <div>
              <h3>{{ selectedModule.title }}</h3>
              <span class="text-muted text-sm">{{ selectedModule.categoryName }}</span>
            </div>
          </div>
          <button class="close-btn" @click="selectedModule = null">✕</button>
        </div>

        <div class="modal-body">
          <p class="modal-desc">{{ selectedModule.summary }}</p>

          <div class="modal-highlight-box">
            <Sparkles :size="18" class="text-gradient-cyan" />
            <div>
              <strong>Ключевое преимущество:</strong>
              <p>{{ selectedModule.highlight }}</p>
            </div>
          </div>

          <div class="modal-example">
            <h4>Живой пример из сценария работы:</h4>
            <div class="example-quote font-mono">{{ selectedModule.demoText }}</div>
          </div>

          <div class="modal-perk-row">
            <div class="perk-badge"><CheckCircle2 :size="16" /> Бесплатные токены ИИ</div>
            <div class="perk-badge"><CheckCircle2 :size="16" /> Автоматическое решение капчи</div>
            <div class="perk-badge"><CheckCircle2 :size="16" /> Облачная работа 24/7</div>
          </div>
        </div>

        <div class="modal-footer">
          <a href="#pricing" class="btn btn-primary" @click="selectedModule = null">
            <span>Подключить модуль в тарифе (от 899 ₽)</span>
            <ArrowRight :size="16" />
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.modules-section {
  padding: 80px 0;
  position: relative;
}

.section-head {
  max-width: 820px;
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

.filter-tabs {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.filter-tab {
  padding: 10px 18px;
  border-radius: var(--radius-pill);
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.14);
  color: #94a3b8;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
}

.filter-tab.active {
  background: rgba(0, 136, 204, 0.2);
  border-color: rgba(0, 180, 255, 0.5);
  color: #38bdf8;
  box-shadow: 0 0 15px rgba(0, 136, 204, 0.25);
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.module-card {
  padding: 24px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.mod-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.mod-icon-wrapper {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mod-icon {
  color: #38bdf8;
}

.mod-category {
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #00d2ff;
  margin-bottom: 4px;
}

.mod-title {
  font-size: 1.22rem;
  color: #ffffff;
  margin-bottom: 8px;
}

.mod-summary {
  font-size: 0.86rem;
  color: #94a3b8;
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
}

.mod-demo-box {
  background: rgba(8, 14, 26, 0.85);
  border: 1px solid rgba(148, 163, 184, 0.08);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  margin-bottom: 16px;
}

.mod-demo-label {
  display: block;
  font-size: 0.68rem;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.mod-demo-quote {
  font-size: 0.78rem;
  color: #38bdf8;
  line-height: 1.4;
}

.mod-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  font-size: 0.8rem;
}

.mod-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cbd5e1;
  font-weight: 600;
}

.stat-icon {
  color: #10b981;
}

.mod-included-tag {
  color: #38bdf8;
  font-weight: 700;
  font-size: 0.74rem;
}

/* Modal */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.mod-modal-title-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

.close-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 6px;
}

.modal-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.modal-desc {
  font-size: 0.95rem;
  color: #e2e8f0;
  line-height: 1.6;
}

.modal-highlight-box {
  display: flex;
  gap: 12px;
  background: rgba(0, 136, 204, 0.12);
  border: 1px solid rgba(0, 180, 255, 0.3);
  padding: 14px 16px;
  border-radius: var(--radius-md);
  font-size: 0.88rem;
}

.modal-example {
  background: rgba(15, 23, 42, 0.8);
  padding: 14px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.modal-example h4 {
  font-size: 0.85rem;
  margin-bottom: 8px;
  color: #94a3b8;
}

.example-quote {
  color: #38bdf8;
  font-size: 0.84rem;
}

.modal-perk-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.perk-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: var(--radius-pill);
}

.modal-footer {
  padding: 18px 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .modules-grid {
    grid-template-columns: 1fr;
  }
}
</style>
