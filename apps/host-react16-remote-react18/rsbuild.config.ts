import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

// 如需启用下方 workspace link 配置，需取消注释以下导入：
// import path from 'node:path'
// import { fileURLToPath } from 'node:url'
// const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        // React 16 不支持 automatic JSX runtime，使用 classic
        runtime: 'classic',
      },
    }),
  ],
  // workspace link 开发时，mf-runtime-libs 中的 import react from "react"
  // 会从真实路径（packages/mf-runtime-libs/dist/）解析，找不到 peer dep 的 react。
  // 从 npm 安装正式包后不需要此配置。
  // 如需启用，同时取消上方 import path / fileURLToPath 的注释：
  // tools: {
  //   rspack: {
  //     resolve: {
  //       modules: [
  //         path.resolve(__dirname, 'node_modules'),
  //         'node_modules',
  //       ],
  //     },
  //   },
  // },
  server: {
    port: 3004,
  },
  html: {
    title: 'Host React 16 - Consuming React 18 Remote',
  },
})
