import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Dashboard as DashboardIcon,
  Dns as DnsIcon,
  Block as BlockIcon,
  Settings as SettingsIcon,
  List as ListIcon,
  Info as InfoIcon,
  Power as PowerIcon,
} from '@mui/icons-material';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: <DashboardIcon />, label: 'Dashboard' },
    { path: '/resolvers', icon: <DnsIcon />, label: 'Resolvers' },
    { path: '/blocklists', icon: <BlockIcon />, label: 'Denylists & Allowlists' },
    { path: '/settings', icon: <SettingsIcon />, label: 'Settings' },
    { path: '/logs', icon: <ListIcon />, label: 'Logs' },
    { path: '/service', icon: <PowerIcon />, label: 'Service' },
    { path: '/about', icon: <InfoIcon />, label: 'About' },
  ];

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 text-white rounded-md"
      >
        <i className="fas fa-bars"></i>
      </button>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 bg-gray-800 text-white p-6 space-y-6 z-40 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="text-2xl font-semibold flex items-center space-x-2">
            <i className="fas fa-shield-alt text-sky-400"></i>
            <span>DNSCrypt UI</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors duration-150 ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 space-y-6 fixed top-0 left-0 h-full shadow-lg hidden md:block">
        <div className="text-2xl font-semibold flex items-center space-x-2">
          <i className="fas fa-shield-alt text-sky-400"></i>
          <span>DNSCrypt UI</span>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors duration-150 ${
                location.pathname === item.path ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          UI Version 0.1.0
        </div>
      </aside>
    </>
  );
};

export default Sidebar; 