import './App.css';
import { loadRemoteMultiVersion } from 'remote-reload-utils';
import React, { useEffect, useState, Suspense, useCallback } from 'react';

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Remote module load error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 远程模块加载状态
interface RemoteModuleState {
  loading: boolean;
  error: Error | null;
  component: React.ComponentType<any> | null;
}

// 远程模块卡片组件
function RemoteModuleCard({
  pkg,
  version,
  moduleName,
  scopeName,
}: {
  pkg: string;
  version: string;
  moduleName: string;
  scopeName: string;
}) {
  const [moduleState, setModuleState] = useState<RemoteModuleState>({
    loading: true,
    error: null,
    component: null,
  });

  useEffect(() => {
    let mounted = true;

    async function loadModule() {
      try {
        setModuleState(prev => ({ ...prev, loading: true, error: null }));

        const { mf } = await loadRemoteMultiVersion({
          name: scopeName,
          pkg,
          version,
        }, []);

        if (!mf || !mounted) return;

        const mod = await mf.loadRemote(`${scopeName}/${moduleName}`);
        console.log(`Loaded remote module ${scopeName}/${moduleName}:`, mod);
        if (mounted && mod && typeof mod === 'object' && 'default' in mod) {
          setModuleState({
            loading: false,
            error: null,
            component: (mod as { default: React.ComponentType<any> }).default,
          });
        }
      } catch (err) {
        if (mounted) {
          setModuleState({
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
            component: null,
          });
        }
      }
    }

    loadModule();

    return () => {
      mounted = false;
    };
  }, [pkg, version, moduleName, scopeName]);

  const handleRetry = useCallback(() => {
    setModuleState({ loading: true, error: null, component: null });
  }, []);

  if (moduleState.loading) {
    return (
      <div className="module-card module-card--loading">
        <div className="loading-spinner" />
        <span>Loading {moduleName}...</span>
      </div>
    );
  }

  if (moduleState.error) {
    return (
      <div className="module-card module-card--error">
        <span className="error-icon">!</span>
        <span>Failed to load {moduleName}</span>
        <button onClick={handleRetry} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!moduleState.component) {
    return null;
  }

  const Component = moduleState.component;

  return (
    <div className="module-card">
      <Component />
    </div>
  );
}

// 远程组件加载器（使用 Suspense）
function RemoteLoader({
  pkg,
  version,
  moduleName,
  scopeName,
  fallback,
}: {
  pkg: string;
  version: string;
  moduleName: string;
  scopeName: string;
  fallback?: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      fallback={
        <div className="module-card module-card--error">
          <span>Component unavailable</span>
        </div>
      }
    >
      <Suspense fallback={fallback || (
        <div className="module-card module-card--loading">
          <div className="loading-spinner" />
          <span>Loading {moduleName}...</span>
        </div>
      )}>
        <RemoteModuleCard
          pkg={pkg}
          version={version}
          moduleName={moduleName}
          scopeName={scopeName}
        />
      </Suspense>
    </ErrorBoundary>
  );
}

// 远程 Button 组件
function RemoteButton() {
  return (
    <RemoteLoader
      pkg="test-mf-unpkg"
      version="1.0.5"
      moduleName="Button"
      scopeName="react_mf_lib"
      fallback={<div className="module-card module-card--loading">Loading Button...</div>}
    />
  );
}

// 远程 Card 组件（带 props）
function RemoteCard() {
  return (
    <RemoteLoader
      pkg="test-mf-unpkg"
      version="1.0.5"
      moduleName="Card"
      scopeName="react_mf_lib"
      fallback={<div className="module-card module-card--loading">Loading Card...</div>}
    />
  );
}

// 主应用组件
function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>React Module Federation Demo</h1>
        <p>Remote components loaded with remote-reload-utils</p>
      </header>

      <main className="app-main">
        <section className="demo-section">
          <h2>Remote Button Component</h2>
          <RemoteButton />
        </section>

        <section className="demo-section">
          <h2>Remote Card Component</h2>
          <RemoteCard />
        </section>
      </main>
    </div>
  );
}

export default App;
