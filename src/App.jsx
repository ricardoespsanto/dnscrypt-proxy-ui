import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Resolvers from './components/Resolvers'
import Logs from './components/Logs'
import Settings from './components/Settings'
import About from './components/About'
import Blocklists from './components/Blocklists'
import ServiceManager from './components/ServiceManager'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
})

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="bg-gray-100 text-gray-800 flex h-screen overflow-hidden">
          <Sidebar />
          <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resolvers" element={<Resolvers />} />
              <Route path="/blocklists" element={<Blocklists />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/service" element={<ServiceManager />} />
            </Routes>
          </main>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App