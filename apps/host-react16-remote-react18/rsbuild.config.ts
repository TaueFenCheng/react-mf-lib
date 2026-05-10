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
        // mf-runtime-libs 的构建产物中有 import { jsx } from 'react/jsx-runtime'，
        // React 16 不提供此模块，通过 shim 转发到 React.createElement
        'react/jsx-runtime': path.resolve(__dirname, './src/jsx-runtime-shim.ts'),
        'react/jsx-dev-runtime': path.resolve(
          __dirname,
          './src/jsx-runtime-shim.ts',
        ),
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
