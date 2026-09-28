<script setup lang="ts">
// Footer component
</script>

<template>
  <footer class="footer-wrapper">
    <div class="container">
      <div class="footer-top">
        <!-- Brand Info -->
        <div class="footer-brand-col">
          <div class="brand-logo">
            <div class="logo-icon-box">
              <svg viewBox="0 0 36 36" fill="none" class="brand-svg">
                <rect width="36" height="36" rx="9" fill="#0A1628" stroke="#0088cc" stroke-width="1.2" />
                <path d="M9 10L16 18L9 26" stroke="#00d2ff" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="18" cy="18" r="3" fill="#0088cc" stroke="#38bdf8" stroke-width="1.8" />
                <path d="M27 10L20 18L27 26" stroke="#0088cc" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="brand-text">
              <div class="brand-title">
                <span class="x2x">X2X</span><span class="smm">-SMM</span>
              </div>
            </div>
          </div>

          <p class="footer-desc">
            Облачный ИИ-комбайн для Telegram: парсинг каналов и чатов, нейрокомментинг, прогрев и защита сессий. Все модули включены в любой тариф от 899 ₽/мес.
          </p>
        </div>

        <!-- Links Columns -->
        <div class="footer-links-grid">
          <div class="footer-col">
            <h4 class="col-title">Возможности</h4>
            <ul class="col-links">
              <li><a href="#demo">Нейрокомментинг</a></li>
              <li><a href="#demo">Инвайтинг в группы</a></li>
              <li><a href="#demo">Автопрогрев и GGR</a></li>
              <li><a href="#demo">Парсер каналов и чатов</a></li>
              <li><a href="#demo">Встроенный Telegram Web</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Инструменты</h4>
            <ul class="col-links">
              <li><a href="#tools">Чекер прокси онлайн</a></li>
              <li><a href="#tools">Определение возраста по TG ID</a></li>
              <li><a href="#tools">ИИ-генератор описания профиля</a></li>
              <li><a href="#demo">Встроенный Telegram Web</a></li>
              <li><a href="#free">10 аккаунтов бесплатно</a></li>
              <li><a href="#pricing">Калькулятор экономии</a></li>
            </ul>
          </div>

          <div class="footer-col">
            <h4 class="col-title">Тарифы и сервис</h4>
            <ul class="col-links">
              <li><a href="#pricing">1 Месяц — 899 ₽</a></li>
              <li><a href="#pricing">3 Месяца — 1 999 ₽</a></li>
              <li><a href="#pricing">1 Год — 4 999 ₽</a></li>
              <li><a href="#faq">База знаний и FAQ</a></li>
              <li><a href="https://t.me/telegram" target="_blank">Техподдержка 24/7</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="copyright-text">
          © 2026 X2X-SMM. Все права защищены. Облачный Telegram-комбайн с ИИ.
        </div>
        <div class="footer-legal-links">
          <a href="#">Политика конфиденциальности</a>
          <span class="sep">•</span>
          <a href="#">Пользовательское соглашение</a>
          <span class="sep">•</span>
          <a href="#">Безопасность сессий</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-wrapper {
  background: #05080f;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  padding: 70px 0 35px;
  position: relative;
}

.footer-top {
  display: grid;
  grid-template-columns: 1.3fr 2fr;
  gap: 60px;
  margin-bottom: 50px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon-box {
  width: 36px;
  height: 36px;
}

.brand-svg {
  width: 100%;
  height: 100%;
}

.brand-title {
  font-size: 1.25rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.brand-title .x2x {
  color: #ffffff;
}

.brand-title .smm {
  color: #00d2ff;
}

.brand-tag {
  font-size: 0.65rem;
  font-weight: 700;
  color: #38bdf8;
  letter-spacing: 0.1em;
}

.footer-desc {
  font-size: 0.88rem;
  color: #94a3b8;
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 20px;
}

.footer-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  color: #cbd5e1;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.12);
  padding: 6px 14px;
  border-radius: var(--radius-pill);
}

.footer-links-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.col-title {
  font-size: 0.95rem;
  color: #ffffff;
  font-weight: 700;
  margin-bottom: 18px;
}

.col-links {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.col-links a {
  font-size: 0.85rem;
  color: #94a3b8;
}

.col-links a:hover {
  color: #38bdf8;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 30px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
  font-size: 0.82rem;
  color: #64748b;
  flex-wrap: wrap;
  gap: 16px;
}

.footer-legal-links {
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-legal-links a {
  color: #94a3b8;
}

.footer-legal-links a:hover {
  color: #ffffff;
}

.sep {
  color: #475569;
}

@media (max-width: 980px) {
  .footer-top {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 640px) {
  .footer-links-grid {
    grid-template-columns: 1fr;
    gap: 26px;
  }
  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
