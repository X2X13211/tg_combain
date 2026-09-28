<script setup lang="ts">
import { ref } from 'vue'
import Navbar from './components/Navbar.vue'
import HeroSection from './components/HeroSection.vue'
import FreeFeaturesSection from './components/FreeFeaturesSection.vue'
import PricingSection from './components/PricingSection.vue'
import ToolsSection from './components/ToolsSection.vue'
import WorkflowSection from './components/WorkflowSection.vue'
import UseCasesSection from './components/UseCasesSection.vue'
import FaqSection from './components/FaqSection.vue'
import FooterSection from './components/FooterSection.vue'
import UserCabinet from './components/UserCabinet.vue'

import ModalCheckout from './components/ModalCheckout.vue'
import ModalWebTelegram from './components/ModalWebTelegram.vue'
import ModalAddAccount from './components/ModalAddAccount.vue'
import ModalAuth from './components/ModalAuth.vue'

// View & Navigation State ('landing' | 'cabinet')
const currentView = ref<'landing' | 'cabinet'>('landing')

// Auth State
const isAuthOpen = ref(false)
const authMode = ref<'login' | 'register'>('login')
const currentUser = ref<{ username: string; email: string } | null>(null)

try {
  const saved = localStorage.getItem('x2x_user')
  if (saved) {
    currentUser.value = JSON.parse(saved)
  }
} catch {}

if (currentUser.value && window.location.hash === '#cabinet') {
  currentView.value = 'cabinet'
}

window.addEventListener('hashchange', () => {
  if (window.location.hash === '#cabinet' && currentUser.value) {
    currentView.value = 'cabinet'
  } else if (!window.location.hash || window.location.hash === '#' || window.location.hash.startsWith('#demo') || window.location.hash.startsWith('#pricing') || window.location.hash.startsWith('#tools') || window.location.hash.startsWith('#faq')) {
    currentView.value = 'landing'
  }
})

const openLogin = () => {
  authMode.value = 'login'
  isAuthOpen.value = true
}

const openRegister = () => {
  authMode.value = 'register'
  isAuthOpen.value = true
}

const openCabinet = () => {
  if (!currentUser.value) {
    openLogin()
    return
  }
  currentView.value = 'cabinet'
  window.location.hash = '#cabinet'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const closeCabinet = () => {
  currentView.value = 'landing'
  window.location.hash = '#'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleAuthSuccess = (user: { username: string; email: string }) => {
  currentUser.value = user
  currentView.value = 'cabinet'
  window.location.hash = '#cabinet'
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleLogout = () => {
  currentUser.value = null
  currentView.value = 'landing'
  window.location.hash = '#'
  try {
    localStorage.removeItem('x2x_user')
  } catch {}
}

// Modal States
const isCheckoutOpen = ref(false)
const checkoutPlan = ref('3m')

const isWebTelegramOpen = ref(false)
const selectedAccountForWeb = ref<any>(null)

const isAddAccountOpen = ref(false)
const cabinetRef = ref<any>(null)

const onAccountAdded = () => {
  if (cabinetRef.value?.loadAccounts) {
    cabinetRef.value.loadAccounts()
  }
}

const openCheckout = (plan: string = '3m') => {
  checkoutPlan.value = plan
  isCheckoutOpen.value = true
}

const openWebTelegram = (acc: any) => {
  selectedAccountForWeb.value = acc
  isWebTelegramOpen.value = true
}
</script>

<template>
  <div class="app-root">
    <!-- User Personal Cabinet View -->
    <template v-if="currentView === 'cabinet' && currentUser">
      <UserCabinet
        ref="cabinetRef"
        :current-user="currentUser"
        @go-home="closeCabinet"
        @logout="handleLogout"
        @open-add-account="isAddAccountOpen = true"
        @open-web-telegram="openWebTelegram"
        @open-checkout="openCheckout"
      />
    </template>

    <!-- Public Landing Page View -->
    <template v-else>
      <!-- Main Top Navigation -->
      <Navbar
        :current-user="currentUser"
        @open-auth="openLogin"
        @open-register="openRegister"
        @open-cabinet="openCabinet"
        @logout="handleLogout"
        @open-checkout="openCheckout"
      />

      <!-- Hero Section -->
      <HeroSection
        :current-user="currentUser"
        @open-register="openRegister"
        @open-login="openLogin"
        @open-cabinet="openCabinet"
      />

      <!-- 4-Step Workflow -->
      <WorkflowSection />

      <!-- 100% Free Capabilities ($0 / 0 ₽) -->
      <FreeFeaturesSection />

      <!-- Transparent Pricing Section (899 ₽ / 1999 ₽ / 4999 ₽) -->
      <PricingSection
        @select-plan="openCheckout"
      />

      <!-- Free Browser Tools (Proxy Checker, TG ID Date, Bio Generator) -->
      <ToolsSection />

      <!-- 3 Ideal User Scenarios (Arbitrage, Agency, Channel) -->
      <UseCasesSection />

      <!-- Detailed FAQ Section -->
      <FaqSection />

      <!-- Comprehensive Footer -->
      <FooterSection />
    </template>

    <!-- Modals -->
    <ModalCheckout
      v-if="isCheckoutOpen"
      :initial-plan="checkoutPlan"
      @close="isCheckoutOpen = false"
    />

    <ModalWebTelegram
      v-if="isWebTelegramOpen"
      :account="selectedAccountForWeb"
      @close="isWebTelegramOpen = false"
    />

    <ModalAddAccount
      v-if="isAddAccountOpen"
      @close="isAddAccountOpen = false"
      @account-added="onAccountAdded"
    />

    <ModalAuth
      v-if="isAuthOpen"
      :initial-mode="authMode"
      @close="isAuthOpen = false"
      @auth-success="handleAuthSuccess"
    />

    <!-- Floating Telegram Support Button -->
    <a
      href="https://t.me/telegram"
      target="_blank"
      class="floating-tg-btn"
      title="Написать в Telegram поддержку 24/7"
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="white">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
      </svg>
      <span class="pulse-ring"></span>
    </a>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  position: relative;
  display: flex;
  flex-direction: column;
}

.floating-tg-btn {
  position: fixed;
  bottom: 28px;
  right: 28px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0088cc 0%, #00d2ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 30px rgba(0, 136, 204, 0.6);
  z-index: 99;
  transition: transform 0.25s, box-shadow 0.25s;
}

.floating-tg-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 38px rgba(0, 210, 255, 0.8);
}

.pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 1px solid rgba(0, 210, 255, 0.5);
  animation: pulse-ring 2.5s infinite;
  pointer-events: none;
}
</style>
