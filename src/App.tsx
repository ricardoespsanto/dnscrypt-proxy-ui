import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material'
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
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <Sidebar />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { md: `calc(100% - 240px)` },
              ml: { md: '240px' },
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/resolvers" element={<Resolvers />} />
              <Route path="/blocklists" element={<Blocklists />} />
              <Route path="/logs" element={<Logs />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/about" element={<About />} />
              <Route path="/service" element={<ServiceManager />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  )
}

export default App