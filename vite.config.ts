// 파일 경로: vite.config.ts

import { defineConfig } from 'vite'
import path from "path"
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- 이 부분이 핵심입니다 ---
  // 1. 우리 앱의 진짜 루트는 'client' 폴더임을 명시합니다.
  root: 'client',

  // 2. 빌드 결과물은 프로젝트 최상위의 'dist' 폴더에 생성되도록 경로를 설정합니다.
  build: {
    outDir: '../dist',
    emptyOutDir: true, // 빌드 시 dist 폴더를 깔끔하게 비우는 옵션
  },
  // --- 여기까지 ---

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
    },
  },
})
