import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

// 暴露 React 到全局，让 mf-runtime-libs 的 getFinalSharedConfig
// 能够自动拾取宿主版本的 React，避免加载 remote 端自己的 React
;(window as any).React = React
;(window as any).ReactDOM = ReactDOM

console.log('[Host React 16] React version:', React.version)
console.log('[Host React 16] Exposed window.React:', (window as any).React.version)

ReactDOM.render(
  React.createElement(App),
  document.getElementById('root'),
)
