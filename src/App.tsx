import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme, Box, CssBaseline } from '@mui/material'
import Sidebar from './components/Sidebar.tsx'
import Dashboard from './components/Dashboard.tsx'
import Resolvers from './components/Resolvers.tsx'
import Logs from './components/Logs.tsx'
import Settings from './components/Settings.tsx'
import About from './components/About.tsx'
import Blocklists from './components/Blocklists.tsx'
import ServiceManager from './components/ServiceManager.tsx'

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