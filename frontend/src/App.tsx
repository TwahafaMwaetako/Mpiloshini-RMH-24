import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import Analysis from './pages/Analysis';
import Reports from './pages/Reports';
import Upload from './pages/Upload';

function App() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Retrieve the stored preference, or default to not collapsed
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  // Save the user's preference whenever it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
  }, [isCollapsed]);

  return (
    <Router>
      <div className="flex min-h-screen bg-soft-light-gray">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/machines" element={<Machines />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/upload" element={<Upload />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;