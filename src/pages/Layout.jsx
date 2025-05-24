import { Outlet, Link } from 'react-router-dom'
import { AppBar, Toolbar, Typography, Container } from '@mui/material'

export default function Layout({ children }) {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            dnscrypt-proxy Manager
          </Typography>
          <nav>
            <Link to="/" style={{ color: 'white', marginRight: '15px' }}>Dashboard</Link>
            <Link to="/logs" style={{ color: 'white', marginRight: '15px' }}>Logs</Link>
            <Link to="/settings" style={{ color: 'white' }}>Settings</Link>
          </nav>
        </Toolbar>
      </AppBar>

      <Outlet />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {children} {/* This will render the current page content */}
      </Container>
    </>
  )
}