import { useState } from 'react';

const Dashboard = () => {
  const [serviceEnabled, setServiceEnabled] = useState(true);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-700">Dashboard</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Service Status</h2>
        <div className="flex items-center space-x-4">
          <div className={`w-8 h-8 rounded-full ${serviceEnabled ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
          <div>
            <p className="text-lg font-medium">
              dnscrypt-proxy is {serviceEnabled ? 'Active' : 'Inactive'}
            </p>
            <p className="text-sm text-gray-500">Current Resolver: Cloudflare (DoH)</p>
          </div>
        </div>
        <div className="mt-6 space-x-3">
          <button
            onClick={() => setServiceEnabled(!serviceEnabled)}
            className={`${
              serviceEnabled
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            } text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150`}
          >
            <i className={`fas fa-${serviceEnabled ? 'stop' : 'play'}-circle mr-2`}></i>
            {serviceEnabled ? 'Disable' : 'Enable'} Service
          </button>
          <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150">
            <i className="fas fa-redo mr-2"></i>Restart Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Encrypted Queries</h3>
          <p className="text-3xl font-bold text-sky-500">1,234,567</p>
          <p className="text-sm text-gray-400">Today</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Blocked Queries</h3>
          <p className="text-3xl font-bold text-red-500">8,765</p>
          <p className="text-sm text-gray-400">Today (Ads & Trackers)</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">Average Latency</h3>
          <p className="text-3xl font-bold text-green-500">25<span className="text-xl">ms</span></p>
          <p className="text-sm text-gray-400">Current Resolver</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;