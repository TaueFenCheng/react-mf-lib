export interface LoadRemoteOptions {
  name: string; // 模块联邦 name（基础名）
  pkg: string; // npm 包名
  version?: string; // 指定版本 or "latest"
  retries?: number; // 重试次数
  delay?: number; // 重试间隔
  localFallback?: string; // 本地兜底
  cacheTTL?: number; // 缓存时间
  revalidate?: boolean; // 灰度更新
}

export interface VersionCache {
  [pkg: string]: {
    [version: string]: {
      timestamp: number;
    };
  };
}
