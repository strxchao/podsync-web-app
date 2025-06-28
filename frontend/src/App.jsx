// File: frontend/src/App.jsx - UPDATE YANG ADA

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Schedule } from './pages/Schedule';
import { SignageContent } from './pages/SignageContent';
import { Analytics } from './pages/Analytics'; // NEW IMPORT

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/signage-content" element={<SignageContent />} />
            <Route path="/analytics" element={<Analytics />} /> {/* NEW ROUTE */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;