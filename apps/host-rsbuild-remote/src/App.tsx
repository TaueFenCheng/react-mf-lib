import './App.css';
import { loadRemoteMultiVersion, loadRemote } from 'remote-reload-utils';
import { useEffect } from 'react';

const App =  () => {
  useEffect(() => {
    async function init() {
      const scope = await loadRemoteMultiVersion({
        name: 'test-mf-unpkg',
        pkg: 'test-mf-unpkg',
        version: 'latest',
      });
      const { Button } = await loadRemote<any>(`${scope}/Button`);
      console.log(Button)
    }
    init()
  }, [])
  
  // const scope = await loadRemoteMultiVersion({
  //   name: 'test-mf-unpkg',
  //   pkg: 'test-mf-unpkg',
  //   version: 'latest',
  // });

  // scope 形如 "my-lib@1.2.3"

  return (
    <div className="content">
      <h1>Rsbuild with React</h1>
      <p>Start building amazing things with Rsbuild.</p>
    </div>
  );
};

export default App;
