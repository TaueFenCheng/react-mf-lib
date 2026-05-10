import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

console.log('[Host React 16] React version:', React.version)

ReactDOM.render(
  React.createElement(App),
  document.getElementById('root'),
)
