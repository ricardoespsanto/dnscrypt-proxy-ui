import { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', icon: 'tachometer-alt', text: 'Dashboard', color: 'text-sky-300' },
    { path: '/resolvers', icon: 'server', text: 'Resolvers', color: 'text-green-300' },
    { path: '/blocklists', icon: 'ban', text: 'Blocklists', color: 'text-red-300' },
    { path: '/logs', icon: 'clipboard-list', text: 'Logs', color: 'text-yellow-300' },
    { path: '/settings', icon: 'cog', text: 'Settings', color: 'text-purple-300' },
    { path: '/about', icon: 'info-circle', text: 'About', color: 'text-indigo-300' },
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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors duration-150"
            >
              <i className={`fas fa-${item.icon} sidebar-icon ${item.color}`}></i>
              <span>{item.text}</span>
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
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors duration-150"
            >
              <i className={`fas fa-${item.icon} sidebar-icon ${item.color}`}></i>
              <span>{item.text}</span>
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