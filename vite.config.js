import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins:[react()],
  base:'./',
  build:{
    target:'es2020',
    sourcemap:false,
    chunkSizeWarningLimit:800,
    rollupOptions:{input:resolve(process.cwd(),'source.html')}
  }
})
