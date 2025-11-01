import { defineConfig } from '@rslib/core'
import { pluginPublint } from 'rsbuild-plugin-publint'
export default defineConfig({
  plugins: [pluginPublint()],
  source: {
    entry: {
      main: './src/loadRemote.ts',
    },
  },
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
      dts: true,
    },
  ],
})
