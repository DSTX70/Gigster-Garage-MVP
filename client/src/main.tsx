import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Add error boundary for debugging
window.addEventListener('error', (e) => {
  console.error('🚨 Global error:', e.error)
  const root = document.getElementById('root')
  if (root && root.innerHTML === '') {
    root.innerHTML = `
      <div style="padding: 20px; background: #EF4444; color: white; font-family: sans-serif;">
        <h2>JavaScript Error Detected:</h2>
        <pre style="background: #DC2626; padding: 10px; overflow: auto; font-size: 14px;">${e.error?.stack || e.error || 'Unknown error'}</pre>
      </div>
    `
  }
})

try {
  console.log('🚀 Creating React root...')
  createRoot(document.getElementById('root')!).render(<App />)
  console.log('✅ React app rendered successfully')
} catch (error) {
  console.error('💥 React render error:', error)
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; background: #DC2626; color: white; font-family: sans-serif;">
      <h2>React Render Error:</h2>
      <pre style="background: #B91C1C; padding: 10px; overflow: auto;">${error}</pre>
    </div>
  `
}