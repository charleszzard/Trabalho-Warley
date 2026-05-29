import { useState, useEffect } from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import { Activity, BrainCircuit, LayoutDashboard, ScanLine } from 'lucide-react';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import type { AppState } from './types';

const API_URL = 'http://localhost:8000';

function App() {
  const [stats, setStats] = useState<AppState | null>(null);
  const [detectedIds, setDetectedIds] = useState<number[]>([]);
  const [isOpeningPack, setIsOpeningPack] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Error fetching stats:", e);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleOpenPack = async (stickers: number[]) => {
    setIsOpeningPack(true);
    try {
      const res = await fetch(`${API_URL}/open_pack`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stickers })
      });
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Error opening pack:", e);
    }
    setTimeout(() => setIsOpeningPack(false), 2000);
  };

  const handleReset = async () => {
    try {
      await fetch(`${API_URL}/reset`, { method: 'POST' });
      fetchStats();
    } catch (e) {
      console.error("Error resetting:", e);
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
      isActive
        ? 'bg-neonBlue/15 text-neonBlue border-neonBlue/40'
        : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'
    }`;

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 glass-panel p-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-neonBlue" />
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neonBlue to-neonPurple">
            Gaussian Sticker Predictor
          </h1>
        </div>

        <nav className="flex items-center gap-2">
          <NavLink to="/" end className={navLinkClass}>
            <ScanLine className="w-4 h-4" />
            Scanner
          </NavLink>
          <NavLink to="/dashboard" className={navLinkClass}>
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </NavLink>
        </nav>

        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Activity className="w-4 h-4 text-green-400 animate-pulse" />
            Sistema Online
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition-all"
          >
            Resetar BD
          </button>
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              stats={stats}
              detectedIds={detectedIds}
              onDetect={setDetectedIds}
              onOpenPack={handleOpenPack}
              isOpeningPack={isOpeningPack}
            />
          }
        />
        <Route path="/dashboard" element={<DashboardPage stats={stats} />} />
      </Routes>
    </div>
  );
}

export default App;
