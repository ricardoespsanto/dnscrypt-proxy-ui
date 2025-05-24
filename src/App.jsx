import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Resolvers from './components/Resolvers'
import Logs from './components/Logs'
import Settings from './components/Settings'

function App() {
  return (
    <Router>
      <div className="bg-gray-100 text-gray-800 flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 md:ml-64 p-6 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/resolvers" element={<Resolvers />} />
            <Route path="/blocklists" element={<div className="space-y-6"><h1 className="text-3xl font-semibold">Blocklists</h1><p className="mt-4 bg-white p-6 rounded-xl shadow-lg">Content for Blocklists section...</p></div>} />
            <Route path="/logs" element={<Logs />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/about" element={<div className="space-y-6"><h1 className="text-3xl font-semibold">About</h1><p className="mt-4 bg-white p-6 rounded-xl shadow-lg">Content for About section...</p></div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App