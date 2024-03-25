import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ChakraProvider, ColorModeScript, extendTheme } from '@chakra-ui/react'
import './index.css'

const config = {
  initialColorMode: 'blue',
  useSystemColorMode: false,
}

const theme = extendTheme({
  config,
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
