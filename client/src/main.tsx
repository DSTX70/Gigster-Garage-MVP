// Force immediate HTML fallback for debugging mobile issues
const root = document.getElementById('root')
if (root) {
  root.innerHTML = `
    <div style="padding: 20px; background: #3B82F6; color: white; font-family: Arial, sans-serif; min-height: 100vh;">
      <h1>🔧 Emergency Debug Mode</h1>
      <p>If you can see this, JavaScript is loading on your device.</p>
      <div style="background: #1E40AF; padding: 15px; margin: 15px 0; border-radius: 8px;">
        <h2>Device Test:</h2>
        <p>User Agent: <code style="background: #1E3A8A; padding: 2px 5px;">${navigator.userAgent}</code></p>
        <p>Screen: ${screen.width}x${screen.height}</p>
        <p>Viewport: ${window.innerWidth}x${window.innerHeight}</p>
      </div>
      <div id="react-test" style="background: #059669; padding: 15px; margin: 15px 0; border-radius: 8px;">
        <strong>Testing React loading...</strong>
      </div>
    </div>
  `
}

// Test React loading after a delay
setTimeout(async () => {
  try {
    console.log('🎨 Testing React import...')
    const { createRoot } = await import('react-dom/client')
    const reactTest = document.getElementById('react-test')
    if (reactTest) {
      reactTest.innerHTML = '<strong>✅ React modules loaded! Testing render...</strong>'
    }
    
    // Now try to render React
    setTimeout(async () => {
      try {
        const { default: App } = await import('./App')
        
        const React = await import('react')
        
        const TestApp = () => {
          return React.default.createElement('div', {
            style: { padding: '20px', background: '#10B981', color: 'white', borderRadius: '8px' }
          }, [
            React.default.createElement('h1', { key: 'h1' }, '🎉 React Working!'),
            React.default.createElement('p', { key: 'p' }, 'React is rendering successfully on your device.'),
            React.default.createElement('div', { 
              key: 'div',
              style: { marginTop: '15px', padding: '10px', background: '#047857', borderRadius: '4px' }
            }, 'Loading full app...')
          ])
        }
        
        const newRoot = createRoot(document.getElementById('root')!)
        newRoot.render(React.default.createElement(TestApp))
        
        // If that works, load the full app after 2 seconds
        setTimeout(() => {
          newRoot.render(React.default.createElement(App))
        }, 2000)
        
      } catch (appError: any) {
        console.error('App loading error:', appError)
        const reactTest = document.getElementById('react-test')
        if (reactTest) {
          reactTest.innerHTML = `<strong>❌ App Error:</strong> ${appError?.message || appError}`
        }
      }
    }, 1000)
    
  } catch (reactError: any) {
    console.error('React import error:', reactError)
    const reactTest = document.getElementById('react-test')
    if (reactTest) {
      reactTest.innerHTML = `<strong>❌ React Import Error:</strong> ${reactError?.message || reactError}`
    }
  }
}, 500)