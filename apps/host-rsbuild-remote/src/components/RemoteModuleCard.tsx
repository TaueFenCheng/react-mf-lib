import { loadRemoteMultiVersion } from 'remote-reload-utils';
import React, { useEffect, useState, useCallback } from 'react';

interface RemoteModuleState {
  loading: boolean;
  error: Error | null;
  component: React.ComponentType<any> | null;
}

interface RemoteModuleCardProps {
  pkg: string;
  version: string;
  moduleName: string;
  scopeName: string;
}

/**
 * 远程模块卡片组件
 * 负责加载和渲染远程模块，处理加载状态和错误
 */
export function RemoteModuleCard({
  pkg,
  version,
  moduleName,
  scopeName,
}: RemoteModuleCardProps) {
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
