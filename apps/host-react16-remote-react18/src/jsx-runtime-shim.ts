/**
 * React 16 的 react/jsx-runtime shim
 *
 * React 16 没有自动 JSX 运行时（react/jsx-runtime），但 mf-runtime-libs
 * 的构建产物中包含 import { jsx } from 'react/jsx-runtime'。
 * 这个 shim 将 jsx/jsxs 委托给 React.createElement。
 *
 * 在 rsbuild.config.ts 中通过 resolve.alias 将 react/jsx-runtime 指向此文件。
 */
import React from 'react'

export const jsx = (
  type: React.ElementType,
  props: Record<string, unknown> | null,
  key?: string | null,
): React.ReactElement => {
  let finalProps = props ? { ...props } : {}
  if (key != null) {
    finalProps.key = key
  }
  return React.createElement(type, finalProps)
}

export const jsxs = (
  type: React.ElementType,
  props: Record<string, unknown> | null,
  key?: string | null,
): React.ReactElement => {
  let finalProps = props ? { ...props } : {}
  if (key != null) {
    finalProps.key = key
  }
  return React.createElement(type, finalProps)
}

export const jsxDEV = (
  type: React.ElementType,
  props: Record<string, unknown> | null,
  key: string | null | undefined,
): React.ReactElement => {
  return jsx(type, props, key)
}

export const Fragment = React.Fragment
