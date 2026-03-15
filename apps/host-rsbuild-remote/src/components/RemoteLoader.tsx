import React, { Suspense } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { RemoteModuleCard } from './RemoteModuleCard';

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
 */
export function RemoteLoader({
  pkg,
  version,
  moduleName,
  scopeName,
  fallback,
}: RemoteLoaderProps) {
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
