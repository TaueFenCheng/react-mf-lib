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
const [comp, setComp] = useState(null);
useEffect(() => {
  async function init() {
    const { scopeName, mf } = await loadRemoteMultiVersion({
      name: 'react_mf_lib',
      pkg: 'test-mf-unpkg',
      version: '1.0.5',
      // version: 'latest',
    });
    if (!mf) {
      return;
    }
    if (mf) {
      console.log(mf);
      const mod = await mf.loadRemote(`${scopeName}/Button`);
      console.log(mod.default); // 这里就是远程组件
      setComp(mod.default);
    }
    // 用 mf 实例加载暴露的模块
    // const mod = await mf.loadRemote(`${scopeName}/Button`);
    // const mod = await mf.loadRemote(`react_mf_lib/Button`);
    // console.log(mod.default);
  }
  init();
}, []);
```
