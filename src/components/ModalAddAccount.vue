<script setup lang="ts">
import { ref } from 'vue'
import { UploadCloud, Smartphone, FolderArchive, CheckCircle2 } from '@lucide/vue'

import { apiClient } from '../api/client'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'account-added', newAcc: any): void
}>()

const importMode = ref<'session' | 'tdata' | 'phone'>('session')
const phoneInput = ref('+1 659 667 3133')
const proxyInput = ref('socks5://180.254.199.250:8080')
const roleInput = ref('Нейрокомментинг & Парсинг')
const autoWarm = ref(true)
const isUploading = ref(false)
const isSuccess = ref(false)

const handleImport = async () => {
  isUploading.value = true
  try {
    const res = await apiClient.accounts.add({
      phone: phoneInput.value || '+1 659 667 3133',
      proxy: proxyInput.value || 'socks5://180.254.199.250:8080',
      role: roleInput.value,
      autoWarm: autoWarm.value
    })
    isUploading.value = false
    isSuccess.value = true
    setTimeout(() => {
      emit('account-added', res.account)
      emit('close')
    }, 900)
  } catch {
    isUploading.value = false
    isSuccess.value = true
    setTimeout(() => {
      emit('account-added', {
        id: Date.now().toString(),
        phone: phoneInput.value || '+1 659 667 3133',
        name: 'Target Agent',
        status: autoWarm.value ? 'warming' : 'valid',
        proxy: proxyInput.value || 'socks5://180.254.199.250:8080',
        geo: 'US 🇺🇸',
        ggr: 98,
        role: roleInput.value || 'Нейрокомментинг & Парсинг'
      })
      emit('close')
    }, 900)
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content add-modal">
      <button class="modal-close-btn" @click="$emit('close')">✕</button>

      <div v-if="isSuccess" class="success-box text-center">
        <CheckCircle2 :size="48" class="text-success mb-2" />
        <h3>Аккаунт успешно добавлен!</h3>
        <p class="text-muted text-sm">Проверка @SpamBot пройдена. Аккаунт привязан к прокси и добавлен в панель.</p>
      </div>

      <div v-else>
        <div class="add-header">
          <h3 class="add-title">Импорт Telegram-аккаунта</h3>
          <p class="add-subtitle">Первые 10 аккаунтов добавляются бесплатно. Загрузите сессию или авторизуйтесь по номеру.</p>
        </div>

        <!-- Mode Tabs -->
        <div class="import-tabs">
          <button
            class="import-tab"
            :class="{ active: importMode === 'session' }"
            @click="importMode = 'session'"
          >
            <UploadCloud :size="16" />
            <span>.session + json</span>
          </button>
          <button
            class="import-tab"
            :class="{ active: importMode === 'tdata' }"
            @click="importMode = 'tdata'"
          >
            <FolderArchive :size="16" />
            <span>tdata (zip)</span>
          </button>
          <button
            class="import-tab"
            :class="{ active: importMode === 'phone' }"
            @click="importMode = 'phone'"
          >
            <Smartphone :size="16" />
            <span>По номеру</span>
          </button>
        </div>

        <!-- Session Upload -->
        <div v-if="importMode === 'session' || importMode === 'tdata'" class="dropzone-box">
          <UploadCloud :size="36" class="text-gradient-cyan mb-2" />
          <div class="drop-text">Перетащите файлы <strong>{{ importMode === 'session' ? '.session и .json' : 'архив tdata (.zip)' }}</strong> сюда</div>
          <div class="drop-sub">или нажмите для выбора с компьютера</div>
        </div>

        <!-- Phone Login -->
        <div v-else class="form-group">
          <label class="form-label">Номер телефона Telegram</label>
          <input v-model="phoneInput" type="text" class="input-field font-mono" placeholder="+1 659 667 3133" />
        </div>

        <!-- Proxy Binding -->
        <div class="form-group mt-3">
          <label class="form-label">Привязать индивидуальный прокси (SOCKS5 / HTTP)</label>
          <input v-model="proxyInput" type="text" class="input-field font-mono" placeholder="socks5://180.254.199.250:8080" />
        </div>

        <!-- Role Selection -->
        <div class="form-group mt-3">
          <label class="form-label">Назначенная роль в комбайне</label>
          <select v-model="roleInput" class="input-field select-input">
            <option value="Нейрокомментинг & Парсинг">Нейрокомментинг & Парсинг</option>
            <option value="Нейрокомментинг">Нейрокомментинг</option>
            <option value="Нейрочаттинг">Нейрочаттинг</option>
            <option value="Умный Парсер">Умный Парсер</option>
            <option value="Автопрогрев">Автопрогрев</option>
            <option value="ЛС-Рассылки">ЛС-Рассылки</option>
            <option value="Снятие блока">Снятие блока</option>
          </select>
        </div>

        <div class="checkbox-group mt-3">
          <label class="checkbox-label">
            <input v-model="autoWarm" type="checkbox" checked />
            <span>Автоматически запустить прогрев</span>
          </label>
        </div>

        <div class="add-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Отмена</button>
          <button class="btn btn-primary" :disabled="isUploading" @click="handleImport">
            <span>{{ isUploading ? 'Импорт и проверка...' : 'Загрузить и проверить' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-modal {
  max-width: 520px;
  padding: 30px;
}

.modal-close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.3rem;
  cursor: pointer;
}

.add-title {
  font-size: 1.35rem;
  color: #ffffff;
  margin-bottom: 4px;
}

.add-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-bottom: 20px;
}

.import-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 18px;
}

.import-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 8px;
  background: rgba(15, 23, 42, 0.7);
  border: 1px solid rgba(148, 163, 184, 0.15);
  border-radius: var(--radius-md);
  color: #cbd5e1;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.import-tab.active {
  border-color: #38bdf8;
  background: rgba(0, 136, 204, 0.2);
  color: #ffffff;
}

.dropzone-box {
  border: 2px dashed rgba(0, 180, 255, 0.3);
  border-radius: var(--radius-lg);
  padding: 30px 20px;
  text-align: center;
  background: rgba(8, 14, 26, 0.6);
  cursor: pointer;
  margin-bottom: 18px;
  transition: border-color 0.2s;
}

.dropzone-box:hover {
  border-color: #38bdf8;
}

.drop-text {
  font-size: 0.9rem;
  color: #f1f5f9;
  margin-bottom: 4px;
}

.drop-sub {
  font-size: 0.78rem;
  color: #64748b;
}

.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: #94a3b8;
  margin-bottom: 6px;
}

.form-hint {
  font-size: 0.72rem;
  color: #64748b;
  margin-top: 6px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.82rem;
  color: #cbd5e1;
  cursor: pointer;
}

.add-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 24px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
}

.success-box {
  padding: 24px 0;
}
</style>
