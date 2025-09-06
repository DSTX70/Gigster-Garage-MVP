import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

// Mobile browser compatibility checks
const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Opera Mini/i.test(navigator.userAgent)
const isIOSSafari = /iPhone|iPad|iPod/.test(navigator.userAgent) && /Safari/.test(navigator.userAgent)

// Add mobile-specific error handling
if (isMobile) {
  window.addEventListener('error', (e) => {
    console.error('📱 Mobile error:', e.error)
    const root = document.getElementById('root')
    if (root && root.innerHTML === '') {
      root.innerHTML = `
        <div style="padding: 20px; background: #EF4444; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
          <h2>📱 Mobile Error Detected</h2>
          <p><strong>Device:</strong> ${navigator.userAgent}</p>
          <p><strong>Error:</strong> ${e.error?.message || 'Unknown error'}</p>
          <a href="/mobile" style="display: inline-block; background: #DC2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
            🔄 Try Mobile Version
          </a>
        </div>
      `
    }
  })
}

try {
  console.log('🚀 Starting React app...')
  
  // For iOS Safari, add extra safety checks
  if (isIOSSafari) {
    console.log('📱 iOS Safari detected - using compatibility mode')
  }
  
  createRoot(document.getElementById('root')!).render(<App />)
  console.log('✅ React app rendered successfully')
} catch (error) {
  console.error('💥 React render error:', error)
  document.getElementById('root')!.innerHTML = `
    <div style="padding: 20px; background: #DC2626; color: white; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
      <h2>💥 React Render Error</h2>
      <p><strong>Error:</strong> ${error}</p>
      <a href="/mobile" style="display: inline-block; background: #B91C1C; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 15px;">
        📱 Try Mobile Version
      </a>
    </div>
  `
}