import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Dns as DnsIcon,
  Block as BlockIcon,
  Settings as SettingsIcon,
  List as ListIcon,
  Info as InfoIcon,
  Power as PowerIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

interface MenuItem {
  path: string;
  icon: JSX.Element;
  label: string;
}

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems: MenuItem[] = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/resolvers', icon: <DnsIcon />, label: 'Resolvers' },
    { path: '/blocklists', icon: <BlockIcon />, label: 'Denylists & Allowlists' },
    { path: '/settings', icon: <SettingsIcon />, label: 'Settings' },
    { path: '/logs', icon: <ListIcon />, label: 'Logs' },
    { path: '/service', icon: <PowerIcon />, label: 'Service' },
    { path: '/about', icon: <InfoIcon />, label: 'About' },
  ];

  const drawerContent = (
    <>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          DNSCrypt UI
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setIsMobileMenuOpen(false)} color="inherit">
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color: 'inherit',
              textDecoration: 'none',
              '&.Mui-selected': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ position: 'absolute', bottom: 16, left: 16 }}>
        <Typography variant="caption" color="text.secondary">
          UI Version 0.1.0
        </Typography>
      </Box>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setIsMobileMenuOpen(true)}
          sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1200 }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? isMobileMenuOpen : true}
        onClose={() => setIsMobileMenuOpen(false)}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: theme.palette.grey[900],
            color: theme.palette.common.white,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar; 