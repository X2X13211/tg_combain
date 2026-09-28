import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import { apiApp } from './server/api.ts'

function backendApiPlugin(): Plugin {
  return {
    name: 'backend-api-plugin',
    configureServer(server) {
      server.middlewares.use(apiApp)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), backendApiPlugin()],
})
