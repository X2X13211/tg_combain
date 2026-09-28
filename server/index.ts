import { apiApp } from './api'

const PORT = process.env.PORT || 3001

apiApp.listen(PORT, () => {
  console.log(`[X2X-SMM Backend] Сервер запущен на http://localhost:${PORT}`)
})
