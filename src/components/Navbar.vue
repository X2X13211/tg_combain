<script setup lang="ts">
import { ref } from 'vue'
import { Menu, X, LogOut } from '@lucide/vue'

defineProps<{
  currentUser?: { username: string; email: string } | null
}>()

defineEmits<{
  (e: 'open-auth'): void
  (e: 'open-register'): void
  (e: 'open-cabinet'): void
  (e: 'logout'): void
  (e: 'open-checkout', plan?: string): void
}>()

const isMobileOpen = ref(false)
</script>

<template>
  <header class="navbar-wrapper">
    <div class="container navbar-inner">
      <!-- Brand Logo -->
      <a href="#" class="brand-logo">
        <div class="logo-icon-box">
          <svg viewBox="0 0 32 32" fill="none" class="brand-svg">
            <rect width="32" height="32" rx="8" fill="#0b1526" stroke="#0284c7" stroke-width="1.2" />
            <path d="M8 8L15 16L8 24" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M24 8L17 16L24 24" stroke="#0ea5e9" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <span class="brand-name">X2X<span class="brand-accent">-SMM</span></span>
      </a>

      <!-- Desktop Navigation Links -->
      <nav class="nav-links">
        <a href="#demo" class="nav-link">Панель</a>
        <a href="#modules" class="nav-link">Модули</a>
        <a href="#pricing" class="nav-link">Тарифы</a>
        <a href="#tools" class="nav-link">Инструменты</a>
        <a href="#faq" class="nav-link">FAQ</a>
      </nav>

      <!-- Action Buttons -->
      <div class="nav-actions">
        <template v-if="currentUser">
          <button class="btn btn-primary btn-sm" @click="$emit('open-cabinet')">
            Личный кабинет
          </button>
          <button class="btn btn-ghost btn-sm" @click="$emit('logout')" title="Выйти">
            <LogOut :size="15" />
          </button>
        </template>
        <template v-else>
          <button class="btn btn-ghost btn-sm" @click="$emit('open-auth')">
            Войти
          </button>
          <button class="btn btn-primary btn-sm" @click="$emit('open-register')">
            Зарегистрироваться
          </button>
        </template>
      </div>

      <!-- Mobile Hamburger Button -->
      <button class="mobile-toggle" @click="isMobileOpen = !isMobileOpen" aria-label="Меню">
        <Menu v-if="!isMobileOpen" :size="22" />
        <X v-else :size="22" />
      </button>
    </div>

    <!-- Mobile Dropdown Menu -->
    <div v-if="isMobileOpen" class="mobile-menu">
      <div class="mobile-menu-inner">
        <a href="#demo" class="mobile-link" @click="isMobileOpen = false">Панель комбайна</a>
        <a href="#modules" class="mobile-link" @click="isMobileOpen = false">Модули автоматизации</a>
        <a href="#pricing" class="mobile-link" @click="isMobileOpen = false">Тарифы</a>
        <a href="#tools" class="mobile-link" @click="isMobileOpen = false">Инструменты</a>
        <a href="#faq" class="mobile-link" @click="isMobileOpen = false">FAQ</a>
        <div class="mobile-actions">
          <template v-if="currentUser">
            <button class="btn btn-primary btn-sm" @click="isMobileOpen = false; $emit('open-cabinet')">
              Личный кабинет
            </button>
            <button class="btn btn-ghost btn-sm" @click="isMobileOpen = false; $emit('logout')">
              Выйти из аккаунта
            </button>
          </template>
          <template v-else>
            <button class="btn btn-ghost btn-sm" @click="isMobileOpen = false; $emit('open-auth')">
              Войти
            </button>
            <button class="btn btn-primary btn-sm" @click="isMobileOpen = false; $emit('open-register')">
              Зарегистрироваться
            </button>
          </template>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar-wrapper {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  background: rgba(9, 13, 22, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  transition: all 0.25s ease;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}

.logo-icon-box {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-svg {
  width: 100%;
  height: 100%;
}

.brand-name {
  font-size: 1.18rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #ffffff;
}

.brand-accent {
  color: #38bdf8;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: #94a3b8;
  padding: 6px 0;
  transition: color 0.15s ease;
  position: relative;
}

.nav-link:hover {
  color: #ffffff;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(2, 132, 199, 0.14);
  border: 1px solid rgba(56, 189, 248, 0.25);
  color: #38bdf8;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  font-size: 0.85rem;
  font-weight: 600;
}

.user-chip-mobile {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 6px 0;
}

.mobile-toggle {
  display: none;
  background: transparent;
  border: none;
  color: #f8fafc;
  cursor: pointer;
  padding: 6px;
}

.mobile-menu {
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  background: rgba(9, 13, 22, 0.98);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
}

.mobile-menu-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mobile-link {
  font-size: 0.98rem;
  font-weight: 500;
  color: #94a3b8;
  padding: 6px 0;
}

.mobile-link:hover {
  color: #38bdf8;
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 900px) {
  .nav-links, .nav-actions {
    display: none;
  }
  .mobile-toggle {
    display: block;
  }
}
</style>
