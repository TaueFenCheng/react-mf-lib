import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    pluginReact({
      swcReactOptions: {
        // React 16 不支持 automatic JSX runtime，使用 classic
        runtime: 'classic',
      },
    }),
  ],
  source: {
    resolve: {
      alias: {
        // mf-runtime-libs 的构建产物中有 import ... from "react"，
        // workspace link 会导致从 dist 目录解析失败，通过 alias 强制指定宿主 node_modules
        'react/jsx-runtime': path.resolve(__dirname, './src/jsx-runtime-shim.ts'),
        'react/jsx-dev-runtime': path.resolve(
          __dirname,
          './src/jsx-runtime-shim.ts',
        ),
      },
    },
  },
  tools: {
    rspack: {
      resolve: {
        // workspace 链接的包中 import react 时，优先从宿主应用的 node_modules 解析
        modules: [
          path.resolve(__dirname, 'node_modules'),
          'node_modules',
        ],
      },
    },
  },
  server: {
    port: 3004,
  },
  html: {
    title: 'Host React 16 - Consuming React 18 Remote',
  },
})
