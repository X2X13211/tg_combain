<script setup lang="ts">
import {
  ShieldCheck, Zap, Bot, Users, CheckCircle2,
  Lock
} from '@lucide/vue'

defineEmits<{
  (e: 'open-checkout'): void
}>()
</script>

<template>
  <section id="free" class="free-section">
    <div class="container">
      <div class="free-card-wrapper glass-card">
        <div class="free-top-strip">
          <div class="free-tag-box">
            <span class="free-zero text-gradient-cyan">0 ₽</span>
            <div>
              <h2 class="free-main-title">Что доступно бесплатно</h2>
            </div>
          </div>
          <button class="btn btn-primary" @click="$emit('open-checkout')">
            <span>Добавить 10 аккаунтов</span>
          </button>
        </div>

        <div class="free-grid">
          <!-- 1. Free Neural Engine -->
          <div class="free-item">
            <div class="free-icon-box">
              <Bot :size="24" class="free-icon" />
            </div>
            <div class="free-content">
              <h3 class="free-item-title">Бесплатная встроенная нейросеть</h3>
              <p class="free-item-desc">
                Встроенный ИИ генерирует комментарии, тексты рассылок, ответы в чатах и профили без списания токенов. Хотите свою модель? Подключите свой API ключ OpenAI, Claude, Gemini, DeepSeek или Grok — ключ хранится только у вас в браузере.
              </p>
              <div class="free-badge-pill">
                <CheckCircle2 :size="14" /> 0 ₽ за генерации
              </div>
            </div>
          </div>

          <!-- 2. Free Captcha Bypass -->
          <div class="free-item">
            <div class="free-icon-box">
              <ShieldCheck :size="24" class="free-icon" />
            </div>
            <div class="free-content">
              <h3 class="free-item-title">Решение капчи без доплаты</h3>
              <p class="free-item-desc">
                Капчи приветственных ботов в чатах (Shieldy, ChatKeeper), капчу @SpamBot и Cloudflare Turnstile система решает автоматически на наших серверах. Подключать RuCaptcha/Anti-Captcha и платить за каждую капчу не нужно.
              </p>
              <div class="free-badge-pill">
                <CheckCircle2 :size="14" /> Встроенный решатель $0
              </div>
            </div>
          </div>

          <!-- 3. Web Telegram in panel -->
          <div class="free-item">
            <div class="free-icon-box">
              <Zap :size="24" class="free-icon" />
            </div>
            <div class="free-content">
              <h3 class="free-item-title">Telegram Web прямо в панели</h3>
              <p class="free-item-desc">
                Любой добавленный аккаунт открывается в официальном Telegram Web в один клик. Переписки, каналы, настройки без конвертации сессий и сторонних приложений. Подключение идёт строго через привязанный прокси.
              </p>
              <div class="free-badge-pill">
                <CheckCircle2 :size="14" /> До 4 сессий одновременно
              </div>
            </div>
          </div>

          <!-- 4. AI Profile Builder -->
          <div class="free-item">
            <div class="free-icon-box">
              <Users :size="24" class="free-icon" />
            </div>
            <div class="free-content">
              <h3 class="free-item-title">ИИ-оформление профилей</h3>
              <p class="free-item-desc">
                Генерация реалистичных имен, красивых био-описаний, юзернеймов и фото аватарок под нужный пол, страну и целевую нишу (крипта, арбитраж, бизнес, лайфстайл).
              </p>
              <div class="free-badge-pill">
                <CheckCircle2 :size="14" /> Для 1 или 100 аккаунтов пачкой
              </div>
            </div>
          </div>

          <!-- 5. SpamBot Liveness Check -->
          <div class="free-item">
            <div class="free-icon-box">
              <Lock :size="24" class="free-icon" />
            </div>
            <div class="free-content">
              <h3 class="free-item-title">Проверка на валидность и спамблок</h3>
              <p class="free-item-desc">
                Быстрая проверка пула аккаунтов на валидность сессий и спамблок через @SpamBot в панели бесплатно. Вы сразу видите, какие аккаунты живы, до запуска трафика.
              </p>
              <div class="free-badge-pill">
                <CheckCircle2 :size="14" /> Мгновенный отчет по статусам
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.free-section {
  padding: 60px 0;
}

.free-card-wrapper {
  padding: 40px;
  background: radial-gradient(circle at 10% 20%, rgba(0, 136, 204, 0.15), transparent 40%),
              radial-gradient(circle at 90% 80%, rgba(0, 229, 255, 0.1), transparent 40%),
              rgba(15, 23, 42, 0.85);
  border: 1px solid rgba(0, 180, 255, 0.35);
  box-shadow: 0 0 50px rgba(0, 136, 204, 0.15);
}

.free-top-strip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(148, 163, 184, 0.15);
  padding-bottom: 28px;
  margin-bottom: 34px;
  gap: 20px;
  flex-wrap: wrap;
}

.free-tag-box {
  display: flex;
  align-items: center;
  gap: 24px;
}

.free-zero {
  font-size: 3.8rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.04em;
}

.free-main-title {
  font-size: clamp(1.6rem, 2.5vw, 2.1rem);
  margin-bottom: 6px;
}

.free-subtitle {
  font-size: 0.95rem;
  color: #94a3b8;
  max-width: 620px;
}

.free-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.free-item {
  background: rgba(12, 19, 34, 0.6);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.25s ease;
}

.free-item:hover {
  background: rgba(18, 28, 50, 0.8);
  border-color: rgba(0, 180, 255, 0.35);
  transform: translateY(-2px);
}

.free-item.highlight-item {
  border-color: rgba(0, 229, 255, 0.4);
  background: rgba(0, 136, 204, 0.12);
}

.free-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(0, 136, 204, 0.15);
  border: 1px solid rgba(0, 180, 255, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 18px;
}

.free-icon-box.special-icon {
  background: linear-gradient(135deg, rgba(0, 210, 255, 0.2), rgba(0, 136, 204, 0.4));
  border-color: #00e5ff;
}

.free-icon {
  color: #38bdf8;
}

.free-item-title {
  font-size: 1.12rem;
  color: #ffffff;
  margin-bottom: 10px;
}

.free-item-desc {
  font-size: 0.86rem;
  color: #94a3b8;
  line-height: 1.55;
  margin-bottom: 18px;
  flex: 1;
}

.free-badge-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #34d399;
  background: rgba(16, 185, 129, 0.1);
  padding: 5px 12px;
  border-radius: var(--radius-pill);
  align-self: flex-start;
}

.highlight-pill {
  color: #38bdf8;
  background: rgba(0, 180, 255, 0.15);
}

@media (max-width: 1024px) {
  .free-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .free-card-wrapper {
    padding: 24px;
  }
  .free-tag-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  .free-grid {
    grid-template-columns: 1fr;
  }
}
</style>
