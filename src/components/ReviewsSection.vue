<script setup lang="ts">
import { Star, CheckCircle2 } from '@lucide/vue'

const reviews = [
  {
    title: '+2 582 подписчика в VPN-бот',
    sub: 'За 3 недели в режиме тестов',
    text: '2 582 старта бота и 117 первых оплат за 21 день. Связка: парсинг обсуждений криптоканалов + нейрокомментинг с 15 аккаунтов. Трафик чистый, конвертит отлично.',
    author: 'Артем К., Media Buyer',
    tag: 'Нейрокомментинг',
    date: '19 апреля 2026 г.'
  },
  {
    title: '+150 заявок за 1 день',
    sub: 'Бурж-трафик, своя связка',
    text: 'Подключили 30 аккаунтов на прогрев, потом запустили нейрокомментинг по европейским каналам. В первый же день получили 150 целевых диалогов. Расходы на подписку 899 ₽ отбились за 2 часа.',
    author: 'Максим В., Арбитраж СНГ/EU',
    tag: 'Бурж Трафик',
    date: '15 апреля 2026 г.'
  },
  {
    title: '+500 заявок с нейрочаттинга',
    sub: 'Окупились за один день',
    text: 'Запустили связку "Нейрочаттинг": 3 аккаунта вели диалог в 40 тематических чатах. Выглядит органично, админы чатов даже не догадались, что это боты. Лиды идут стабильно.',
    author: 'Дмитрий С., Agency Lead',
    tag: 'Нейрочаттинг',
    date: '8 апреля 2026 г.'
  },
  {
    title: 'Первая оплата спустя час ($23)',
    sub: 'Тест с двух аккаунтов по 40 чатам',
    text: 'Добавил 2 тестовых аккаунта, настроил рассылку по целевым группам через спинтакс. Первая продажа цифрового товара прилетела через 54 минуты после старта!',
    author: 'Илья Р., E-commerce',
    tag: 'Рассылки',
    date: '2 апреля 2026 г.'
  }
]
</script>

<template>
  <section id="reviews" class="reviews-section">
    <div class="container">
      <div class="section-head text-center">
        <div class="badge badge-glow mb-3">
          <Star :size="14" fill="#38bdf8" />
          <span>Реальные результаты</span>
        </div>
        <h2 class="section-title">
          Кейсы и отзывы клиентов <span class="text-gradient-cyan">X2X-SMM</span>
        </h2>
        <p class="section-subtitle">
          Как наши пользователи окупают подписку и масштабируют бизнес без миллионных бюджетов на рекламу.
        </p>
      </div>

      <div class="reviews-grid">
        <div v-for="(rev, idx) in reviews" :key="idx" class="review-card glass-card">
          <div class="rev-top">
            <span class="badge badge-glow">{{ rev.tag }}</span>
            <span class="rev-date">{{ rev.date }}</span>
          </div>

          <h3 class="rev-title text-gradient-cyan">{{ rev.title }}</h3>
          <div class="rev-sub">{{ rev.sub }}</div>

          <p class="rev-text">«{{ rev.text }}»</p>

          <div class="rev-author-box">
            <div class="author-avatar">{{ rev.author[0] }}</div>
            <div>
              <div class="author-name">{{ rev.author }}</div>
              <div class="verified-badge"><CheckCircle2 :size="12" /> Подтвержденный отзыв</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.reviews-section {
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

.reviews-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.review-card {
  padding: 30px;
  display: flex;
  flex-direction: column;
}

.rev-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rev-date {
  font-size: 0.78rem;
  color: #64748b;
}

.rev-title {
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.rev-sub {
  font-size: 0.86rem;
  color: #38bdf8;
  font-weight: 600;
  margin-bottom: 14px;
}

.rev-text {
  font-size: 0.92rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin-bottom: 22px;
  flex: 1;
}

.rev-author-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 136, 204, 0.2);
  color: #38bdf8;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: #ffffff;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.72rem;
  color: #10b981;
}

@media (max-width: 768px) {
  .reviews-grid {
    grid-template-columns: 1fr;
  }
}
</style>
