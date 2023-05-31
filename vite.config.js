import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'


// https://vitejs.dev/config/
export default defineConfig({
    server: {
        //使用IP能访问
        host: '0.0.0.0',
        https: {
            key: 'key.pem',
            cert: 'cert.pem'
        }
    },
  plugins: [
      vue(),
      AutoImport({
      resolvers: [ElementPlusResolver()],
      }),
      Components({
      resolvers: [ElementPlusResolver()],
      }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },


})
