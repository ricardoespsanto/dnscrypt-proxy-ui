import React from 'react';
import { Box } from '@mui/material';
import { Dashboard, Assignment, Settings, Dns, Block } from '@mui/icons-material';

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Logs', icon: <Assignment />, path: '/logs' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
  { text: 'Resolvers', icon: <Dns />, path: '/resolvers' },
  { text: 'Domain Lists', icon: <Block />, path: '/blocklists' },
];

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      {/* This component seems to be a placeholder or incomplete. */}
      {/* It's not currently used in App.tsx for layout. */}
      {/* Consider if this component is still needed or should be removed. */}
      {children}
    </Box>
  );
};

export default Layout;