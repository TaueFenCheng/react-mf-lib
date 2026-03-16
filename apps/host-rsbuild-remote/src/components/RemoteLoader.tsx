import React from 'react';
import { RemoteModuleCard } from 'remote-reload-utils';

interface RemoteLoaderProps {
  pkg: string;
  version: string;
  moduleName: string;
  scopeName: string;
  fallback?: React.ReactNode;
}

/**
 * 远程组件加载器
 * 使用 Suspense 和 ErrorBoundary 包装远程模块加载
 * 注意：RemoteModuleCard 已内置 Suspense 和 ErrorBoundary
 */
export function RemoteLoader({
  pkg,
  version,
  moduleName,
  scopeName,
  fallback,
}: RemoteLoaderProps) {
  return (
    <RemoteModuleCard
      pkg={pkg}
      version={version}
      moduleName={moduleName}
      scopeName={scopeName}
      loadingFallback={fallback || (
        <div className="module-card module-card--loading">
          <div className="loading-spinner" />
          <span>Loading {moduleName}...</span>
        </div>
      )}
    />
  );
}
