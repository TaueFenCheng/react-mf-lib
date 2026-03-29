import { defineConfig } from '@rsbuild/core'
import { pluginReact } from '@rsbuild/plugin-react'

export default defineConfig({
  plugins: [pluginReact()],
  server: {
    port: 3001,
  },
  html: {
    title: 'Demo Bridge Provider',
  },
  tools: {
    rspack: {
      plugins: [
        new (await import('@rspack/core')).container.ModuleFederationPlugin({
          name: 'demo_provider',
          filename: 'remoteEntry.js',
          exposes: {
            './RemoteButton': './src/RemoteButton.tsx',
            './RemoteCard': './src/RemoteCard.tsx',
          },
          shared: {
            react: { singleton: true, eager: true, requiredVersion: false },
            'react-dom': { singleton: true, eager: true, requiredVersion: false },
          },
        }),
      ],
    },
  },
})
