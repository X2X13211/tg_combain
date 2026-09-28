<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown, MessageCircle } from '@lucide/vue'

const openIndex = ref<number | null>(0)

const toggleFaq = (idx: number) => {
  openIndex.value = openIndex.value === idx ? null : idx
}

const faqs = [
  {
    q: 'Что такое комбайн ТГ и зачем он нужен?',
    a: 'Telegram-комбайн — это облачный софт, который делает в Telegram то, на что у одного человека уходят дни: собирает каналы и группы, фильтрует аудиторию, рассылает сообщения, комментирует и ведёт переписки. X2X-SMM оснащён ИИ-надстройкой, чтобы комментарии и диалоги выглядели абсолютно как живые. Сервис используют арбитражники, маркетологи, владельцы Telegram-каналов и онлайн-бизнеса.'
  },
  {
    q: 'Сколько стоит Telegram-комбайн X2X-SMM и что входит в тариф?',
    a: 'Стоимость X2X-SMM максимально доступная: 899 рублей в месяц, 1 999 рублей за 3 месяца (выгода 26%) и 4 999 рублей в год (выгода 54%). Самое главное — во всех трёх тарифных планах ДОСТУПНО ВСЁ: все 15 модулей автоматизации, безлимитная нейросеть, авторешение капч и неограниченное число задач.'
  },
  {
    q: 'Нужно ли дополнительно платить за нейросеть и токены?',
    a: 'Нет! Встроенная нейросеть X2X-SMM полностью бесплатна: за генерацию комментариев, сообщений, ответов и профилей токены не списываются. Если вы хотите использовать свою модель — вы можете в один клик подключить свой API ключ: OpenAI (ChatGPT), Claude, Gemini, Grok, DeepSeek, OpenRouter или любой OpenAI-совместимый адрес. Ключ хранится локально в вашем профиле.'
  },
  {
    q: 'Как раскрутить Телеграм-канал с помощью X2X-SMM?',
    a: 'X2X-SMM собирает целевую аудиторию по вашей нише, запускает нейрокомментинг под свежими постами каналов и ведёт лидов в вашу воронку или канал без вашего участия. Парсер находит открытые каналы и чаты по любым ключевым словам. На раскрутку канала с нуля до первой тысячи активных подписчиков обычно уходит от 1 до 3 недель.'
  },
  {
    q: 'На каких устройствах работает комбайн?',
    a: 'Весь функционал комбайна работает через современный облачный веб-интерфейс. Вы можете управлять всеми задачами с любого устройства: ПК на Windows, Mac, планшета или смартфона. Держать компьютер включенным не нужно: задачи круглосуточно исполняются на наших защищенных серверах.'
  },
  {
    q: 'Какие функции включены в комбайн X2X-SMM?',
    a: 'В подписку входят 15 модулей: Нейрокомментинг, Нейроворонки, МассРеакции, Масслукинг сторис, Нейрочаттинг в группах, НейроДиалоги в личке, ЛС-Рассылки, Чат-Рассылки, Масстегинг, Автопрогрев свежих аккаунтов, Менеджер аккаунтов, ИИ Защита аккаунтов, GGR Проверка живучести, Парсер каналов и Парсер участников.'
  },
  {
    q: 'Есть ли обучение и поддержка для новичков?',
    a: 'Да! Вы получаете доступ к подробной базе знаний и видеоурокам, где пошагово показана настройка от добавления аккаунтов до запуска трафика. Кроме того, наша команда техподдержки отвечает в Telegram в среднем за 2–5 минут и помогает с любыми вопросами по связкам и прокси.'
  },
  {
    q: 'Как устроено решение капчи, нужно ли доплачивать?',
    a: 'Капчи решаются бесплатно и автоматически! Приветственные капчи ботов-охранников в чатах (Shieldy, ChatKeeper), капча @SpamBot и Cloudflare Turnstile обходятся нашими встроенными нейроалгоритмами прямо в сценарии. Подключать сервисы антикапчи и платить за каждую капчу не нужно.'
  },
  {
    q: 'Есть ли встроенный Telegram Web?',
    a: 'Да. Любой добавленный аккаунт можно открыть в официальном Telegram Web прямо из браузера в один клик. Вы можете вести личные диалоги, отвечать клиентам и проверять каналы без переноса сессий. Соединение идёт строго через прокси данного аккаунта.'
  },
  {
    q: 'Сколько аккаунтов можно добавить бесплатно без подписки?',
    a: 'Вы можете добавить до 10 аккаунтов навсегда бесплатно без ввода платежных данных. Их можно проверить на валидность, спамблок, оформить профили с помощью ИИ и открывать в Telegram Web без ограничений.'
  }
]
</script>

<template>
  <section id="faq" class="faq-section">
    <div class="container">
      <div class="section-head text-center">
        <h2 class="section-title">
          Частые вопросы
        </h2>
        <p class="section-subtitle">
          Ответы на популярные вопросы о работе платформы.
        </p>
      </div>

      <div class="faq-accordion">
        <div
          v-for="(item, idx) in faqs"
          :key="idx"
          class="faq-card glass-card"
          :class="{ 'faq-open': openIndex === idx }"
          @click="toggleFaq(idx)"
        >
          <div class="faq-header">
            <span class="faq-num font-mono">{{ (idx + 1).toString().padStart(2, '0') }}</span>
            <h3 class="faq-q">{{ item.q }}</h3>
            <div class="faq-icon-arrow" :class="{ 'rotated': openIndex === idx }">
              <ChevronDown :size="20" />
            </div>
          </div>

          <div v-if="openIndex === idx" class="faq-body">
            <p class="faq-answer">{{ item.a }}</p>
          </div>
        </div>
      </div>

      <!-- Support CTA Banner -->
      <div class="support-cta-box glass-card">
        <div class="support-info">
          <MessageCircle :size="28" class="text-gradient-cyan" />
          <div>
            <h4>Не нашли ответ на свой вопрос?</h4>
            <p>Техническая поддержка X2X-SMM на связи в Telegram 24/7. Отвечаем в среднем за 3 минуты.</p>
          </div>
        </div>
        <a href="https://t.me/telegram" target="_blank" class="btn btn-outline-cyan">
          <span>Написать в поддержку</span>
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq-section {
  padding: 60px 0 80px;
}

.section-head {
  max-width: 780px;
  margin: 0 auto 40px;
}

.section-title {
  font-size: clamp(2rem, 3.8vw, 3rem);
  margin-bottom: 12px;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted);
}

.faq-accordion {
  max-width: 860px;
  margin: 0 auto 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.faq-card {
  padding: 22px 26px;
  cursor: pointer;
  border-radius: var(--radius-lg);
  transition: all 0.25s ease;
}

.faq-card:hover {
  border-color: rgba(0, 180, 255, 0.4);
}

.faq-open {
  border-color: rgba(0, 229, 255, 0.45);
  background: rgba(18, 28, 50, 0.85);
  box-shadow: 0 0 25px rgba(0, 136, 204, 0.15);
}

.faq-header {
  display: flex;
  align-items: center;
  gap: 18px;
}

.faq-num {
  font-size: 1.15rem;
  font-weight: 800;
  color: #38bdf8;
  opacity: 0.85;
}

.faq-q {
  font-size: 1.08rem;
  color: #ffffff;
  flex: 1;
  line-height: 1.4;
}

.faq-icon-arrow {
  color: #94a3b8;
  transition: transform 0.25s ease;
  display: flex;
  align-items: center;
}

.faq-icon-arrow.rotated {
  transform: rotate(180deg);
  color: #38bdf8;
}

.faq-body {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding-left: 38px;
}

.faq-answer {
  font-size: 0.94rem;
  color: #cbd5e1;
  line-height: 1.65;
}

.support-cta-box {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
  background: rgba(13, 21, 38, 0.85);
  border: 1px solid rgba(0, 180, 255, 0.3);
}

.support-info {
  display: flex;
  align-items: center;
  gap: 18px;
}

.support-info h4 {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 4px;
}

.support-info p {
  font-size: 0.85rem;
  color: #94a3b8;
}

@media (max-width: 640px) {
  .faq-card {
    padding: 16px;
  }
  .faq-body {
    padding-left: 0;
  }
  .support-cta-box {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
