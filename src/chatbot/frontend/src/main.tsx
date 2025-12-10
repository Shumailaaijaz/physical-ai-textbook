import React from 'react'
import ReactDOM from 'react-dom/client'
import ChatbotWidget from './components/ChatbotWidget'

// Create a root and render the ChatbotWidget
// This can be integrated into Docusaurus using swizzling
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChatbotWidget apiUrl={process.env.REACT_APP_API_URL || 'http://localhost:8000'} />
  </React.StrictMode>,
)
