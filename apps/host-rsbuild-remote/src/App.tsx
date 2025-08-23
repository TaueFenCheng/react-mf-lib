import './App.css';
import { loadRemoteMultiVersion } from 'remote-reload-utils';
import { useEffect } from 'react';

const App = () => {
  useEffect(() => {
    async function init() {
      const { scopeName, mf } = await loadRemoteMultiVersion({
        name: 'react_mf_lib',
        pkg: 'test-mf-unpkg',
        version: 'latest',
      });
      if (!mf) {
        return;
      }
      // 用 mf 实例加载暴露的模块
      // const mod = await mf.loadRemote(`${scopeName}/Button`);
      const mod = await mf.loadRemote(`react_mf_lib/Button`);
      console.log(mod.default);
    }
    init();
  }, []);

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
