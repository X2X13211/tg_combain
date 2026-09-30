<script setup lang="ts">
import { ref } from 'vue'
import { Mail, Lock, User, ShieldCheck, X, CheckCircle2, ArrowRight } from '@lucide/vue'

const props = defineProps<{
  initialMode?: 'login' | 'register'
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'auth-success', user: { username: string; email: string }): void
}>()

import { apiClient } from '../api/client'

const mode = ref<'login' | 'register'>(props.initialMode || 'login')

// Login form state
const loginEmail = ref('')
const loginPassword = ref('')

// Register form state
const registerUsername = ref('')
const registerEmail = ref('')
const registerPassword = ref('')
const registerPasswordConfirm = ref('')

// UI state
const errorMessage = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const successUser = ref({ username: '', email: '' })

const switchMode = (newMode: 'login' | 'register') => {
  mode.value = newMode
  errorMessage.value = ''
}

const handleLogin = async () => {
  errorMessage.value = ''
  if (!loginEmail.value.trim() || !loginEmail.value.includes('@')) {
    errorMessage.value = 'Пожалуйста, введите корректный адрес почты'
    return
  }
  if (!loginPassword.value) {
    errorMessage.value = 'Пожалуйста, введите пароль'
    return
  }

  isSubmitting.value = true
  try {
    const res = await apiClient.auth.login(loginEmail.value.trim(), loginPassword.value)
    if (res && (res.user || res.success)) {
      const u = res.user || { username: loginEmail.value.split('@')[0], email: loginEmail.value.trim() }
      successUser.value = { username: u.username, email: u.email }
      isSuccess.value = true

      try {
        localStorage.setItem('x2x_user', JSON.stringify(successUser.value))
      } catch {}

      setTimeout(() => {
        emit('auth-success', successUser.value)
        emit('close')
      }, 700)
    } else {
      errorMessage.value = res?.error || 'Неверный логин или пароль'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Ошибка соединения с сервером'
  } finally {
    isSubmitting.value = false
  }
}

const handleRegister = async () => {
  errorMessage.value = ''
  if (!registerUsername.value.trim()) {
    errorMessage.value = 'Пожалуйста, введите имя пользователя'
    return
  }
  if (!registerEmail.value.trim() || !registerEmail.value.includes('@')) {
    errorMessage.value = 'Пожалуйста, введите корректный адрес почты'
    return
  }
  if (!registerPassword.value || registerPassword.value.length < 6) {
    errorMessage.value = 'Пароль должен содержать не менее 6 символов'
    return
  }
  if (registerPassword.value !== registerPasswordConfirm.value) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  isSubmitting.value = true
  try {
    const res = await apiClient.auth.register(registerUsername.value.trim(), registerEmail.value.trim(), registerPassword.value)
    if (res && (res.user || res.success)) {
      const u = res.user || { username: registerUsername.value.trim(), email: registerEmail.value.trim() }
      successUser.value = {
        username: u.username,
        email: u.email
      }
      isSuccess.value = true

      try {
        localStorage.setItem('x2x_user', JSON.stringify(successUser.value))
      } catch {}

      setTimeout(() => {
        emit('auth-success', successUser.value)
        emit('close')
      }, 700)
    } else {
      errorMessage.value = res?.error || 'Ошибка при создании аккаунта'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Ошибка соединения с сервером'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content auth-modal">
      <button class="modal-close-btn" @click="$emit('close')">
        <X :size="18" />
      </button>

      <!-- SUCCESS SCREEN -->
      <div v-if="isSuccess" class="auth-success-screen text-center">
        <div class="success-icon-box">
          <CheckCircle2 :size="48" class="text-success-icon" />
        </div>
        <h3 class="success-title">
          {{ mode === 'login' ? 'Вход выполнен!' : 'Регистрация завершена!' }}
        </h3>
        <p class="success-subtitle">
          Добро пожаловать в X2X-SMM, <strong>{{ successUser.username }}</strong>
        </p>
      </div>

      <!-- FORM SCREEN -->
      <div v-else class="auth-form-wrapper">
        <!-- Mode Tabs -->
        <div class="auth-tabs">
          <button
            class="auth-tab"
            :class="{ active: mode === 'login' }"
            @click="switchMode('login')"
          >
            Вход
          </button>
          <button
            class="auth-tab"
            :class="{ active: mode === 'register' }"
            @click="switchMode('register')"
          >
            Регистрация
          </button>
        </div>

        <h3 class="auth-heading">
          {{ mode === 'login' ? 'Вход в аккаунт' : 'Создание аккаунта' }}
        </h3>

        <!-- Error Notification -->
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <!-- LOGIN FORM -->
        <form v-if="mode === 'login'" @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label class="form-label">Почта</label>
            <div class="input-with-icon">
              <Mail :size="16" class="field-icon" />
              <input
                v-model="loginEmail"
                type="email"
                placeholder="name@example.com"
                class="input-field"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Пароль</label>
            <div class="input-with-icon">
              <Lock :size="16" class="field-icon" />
              <input
                v-model="loginPassword"
                type="password"
                placeholder="Введите пароль"
                class="input-field"
                required
                autocomplete="current-password"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isSubmitting">
            <span>{{ isSubmitting ? 'Вход...' : 'Войти' }}</span>
            <ArrowRight v-if="!isSubmitting" :size="16" />
          </button>

          <div class="switch-mode-text">
            <span>Нет аккаунта?</span>
            <button type="button" class="switch-link" @click="switchMode('register')">
              Зарегистрироваться
            </button>
          </div>
        </form>

        <!-- REGISTER FORM -->
        <form v-else @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label class="form-label">Имя пользователя</label>
            <div class="input-with-icon">
              <User :size="16" class="field-icon" />
              <input
                v-model="registerUsername"
                type="text"
                placeholder="Ваше имя или никнейм"
                class="input-field"
                required
                autocomplete="username"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Почта</label>
            <div class="input-with-icon">
              <Mail :size="16" class="field-icon" />
              <input
                v-model="registerEmail"
                type="email"
                placeholder="name@example.com"
                class="input-field"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Пароль</label>
            <div class="input-with-icon">
              <Lock :size="16" class="field-icon" />
              <input
                v-model="registerPassword"
                type="password"
                placeholder="Минимум 6 символов"
                class="input-field"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Подтверждение пароля</label>
            <div class="input-with-icon">
              <ShieldCheck :size="16" class="field-icon" />
              <input
                v-model="registerPasswordConfirm"
                type="password"
                placeholder="Повторите пароль"
                class="input-field"
                required
                autocomplete="new-password"
              />
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" :disabled="isSubmitting">
            <span>{{ isSubmitting ? 'Регистрация...' : 'Зарегистрироваться' }}</span>
            <ArrowRight v-if="!isSubmitting" :size="16" />
          </button>

          <div class="switch-mode-text">
            <span>Уже зарегистрированы?</span>
            <button type="button" class="switch-link" @click="switchMode('login')">
              Войти
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-modal {
  max-width: 440px;
  width: 100%;
  padding: 28px 28px 32px;
  position: relative;
  background: #0d1424;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  overflow: visible;
  box-sizing: border-box;
}

.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 50;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.auth-tabs {
  display: flex;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 22px;
  margin-right: 40px;
}

.auth-tab {
  flex: 1;
  padding: 8px 14px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #94a3b8;
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-tab.active {
  background: #0088cc;
  color: #ffffff;
}

.auth-heading {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 18px;
  text-align: center;
}

.error-banner {
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #f87171;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 0.85rem;
  margin-bottom: 16px;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.form-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 12px;
  color: #64748b;
  pointer-events: none;
}

.input-with-icon .input-field {
  padding-left: 38px;
}

.btn-block {
  width: 100%;
  margin-top: 6px;
}

.switch-mode-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 8px;
}

.switch-link {
  background: transparent;
  border: none;
  color: #38bdf8;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  font-size: 0.85rem;
}

.switch-link:hover {
  text-decoration: underline;
}

.auth-success-screen {
  padding: 24px 12px;
}

.success-icon-box {
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.text-success-icon {
  color: #34d399;
}

.success-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
}

.success-subtitle {
  font-size: 0.95rem;
  color: #94a3b8;
}

.success-subtitle strong {
  color: #f1f5f9;
}
</style>
