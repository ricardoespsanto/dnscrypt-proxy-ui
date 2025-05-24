import { useState } from 'react';

const Resolvers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [protocolFilter, setProtocolFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('any');
  const [noLogsFilter, setNoLogsFilter] = useState(false);

  const resolvers = [
    {
      name: 'Cloudflare DNS',
      protocol: 'DoH',
      location: 'USA',
      noLogs: true,
      dnssec: true,
      latency: '15 ms',
      isFavorite: false,
    },
    {
      name: 'Quad9 (Filtered)',
      protocol: 'DNSCrypt',
      location: 'Switzerland',
      noLogs: true,
      dnssec: true,
      latency: '30 ms',
      isFavorite: false,
    },
    {
      name: 'AdGuard DNS',
      protocol: 'DoH',
      location: 'Cyprus',
      noLogs: false,
      dnssec: true,
      latency: '45 ms',
      isFavorite: true,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-700">Manage Resolvers</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Active Resolver</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-medium">Cloudflare DNS (DoH)</p>
            <p className="text-sm text-gray-500">1.1.1.1 / doh.cloudflare-dns.com</p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-200 rounded-full">
            Connected
          </span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search resolvers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-shadow"
          />
          <select
            value={protocolFilter}
            onChange={(e) => setProtocolFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-shadow"
          >
            <option value="all">All Protocols</option>
            <option value="DNSCrypt">DNSCrypt</option>
            <option value="DoH">DoH</option>
            <option value="DoH3">DoH3</option>
          </select>
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-shadow"
          >
            <option value="any">Any Location</option>
            <option value="USA">USA</option>
            <option value="Germany">Germany</option>
            <option value="Japan">Japan</option>
          </select>
          <label className="flex items-center space-x-2 p-3 border border-gray-300 rounded-lg">
            <input
              type="checkbox"
              checked={noLogsFilter}
              onChange={(e) => setNoLogsFilter(e.target.checked)}
              className="form-checkbox h-5 w-5 text-sky-600 rounded focus:ring-sky-500"
            />
            <span>No Logs</span>
          </label>
        </div>
        <button className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-colors duration-150">
          <i className="fas fa-plus mr-2"></i>Add Custom Resolver
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-600">Name</th>
              <th className="p-4 font-semibold text-gray-600">Protocol</th>
              <th className="p-4 font-semibold text-gray-600">Location</th>
              <th className="p-4 font-semibold text-gray-600">No Logs</th>
              <th className="p-4 font-semibold text-gray-600">DNSSEC</th>
              <th className="p-4 font-semibold text-gray-600">Latency</th>
              <th className="p-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {resolvers.map((resolver, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors duration-100">
                <td className="p-4">{resolver.name}</td>
                <td className="p-4">
                  <span className="px-2 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
                    {resolver.protocol}
                  </span>
                </td>
                <td className="p-4">{resolver.location}</td>
                <td className="p-4">
                  <i className={`fas fa-${resolver.noLogs ? 'check' : 'times'}-circle ${
                    resolver.noLogs ? 'text-green-500' : 'text-red-500'
                  }`}></i>
                </td>
                <td className="p-4">
                  <i className="fas fa-check-circle text-green-500"></i>
                </td>
                <td className="p-4">{resolver.latency}</td>
                <td className="p-4">
                  <button className="text-sky-600 hover:text-sky-800 font-medium" title="Connect">
                    <i className="fas fa-plug"></i>
                  </button>
                  <button className="text-yellow-500 hover:text-yellow-700 ml-2" title="Favorite">
                    <i className={`${resolver.isFavorite ? 'fas' : 'far'} fa-star`}></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Resolvers; 