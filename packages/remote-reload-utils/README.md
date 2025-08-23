# Rslib project

## Setup

Install the dependencies:

```bash
pnpm install
```

## Get started

Build the library:

```bash
pnpm build
```

Build the library in watch mode:

```bash
pnpm dev
```

### 使用方式

```ts
import { loadRemoteMultiVersion } from 'remote-reload-utils';
const scope = await loadRemoteMultiVersion({
  name: 'my-lib',
  pkg: 'my-lib',
  version: 'latest',
});

// scope 形如 "my-lib@1.2.3"
const { Button } = await loadRemote(`${scope}/Button`);
```
