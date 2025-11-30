import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

console.log('main.jsx loaded')
const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (!rootElement) {
  document.body.innerHTML = '<div style="padding:20px;color:red;"><h1>Error: Root element not found!</h1></div>'
  throw new Error('Root element not found')
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  console.log('React app rendered')
} catch (error) {
  console.error('Error rendering app:', error)
  document.body.innerHTML = '<div style="padding:20px;color:red;"><h1>Error rendering React app</h1><pre>' + error.message + '</pre></div>'
}

