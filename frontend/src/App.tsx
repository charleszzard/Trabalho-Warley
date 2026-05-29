import React, { useState, useEffect } from 'react';
import { Activity, BrainCircuit, ScanLine } from 'lucide-react';
import WebcamScanner from './components/WebcamScanner';
import PackOpener from './components/PackOpener';
import GaussianChart from './components/GaussianChart';
import Dashboard from './components/Dashboard';
import AcademicExplanation from './components/AcademicExplanation';
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

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 glass-panel p-4">
        <div className="flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-neonBlue" />
          <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neonBlue to-neonPurple">
            Gaussian Sticker Predictor
          </h1>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Vision & Stats */}
        <div className="lg:col-span-4 space-y-6">
          <WebcamScanner onDetect={setDetectedIds} wsUrl={`ws://localhost:8000/ws`} />
          <Dashboard stats={stats} />
        </div>

        {/* Center/Right Column: Pack & Chart */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-panel p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                <div className="absolute top-4 left-4 flex items-center gap-2 text-neonBlue text-sm font-mono">
                  <ScanLine className="w-4 h-4" />
                  <span>SIMULADOR_PACOTES</span>
                </div>
                <PackOpener 
                  detectedIds={detectedIds} 
                  onOpen={handleOpenPack}
                  isOpening={isOpeningPack} 
                />
             </div>
             
             <div className="glass-panel p-6 flex flex-col">
                <h3 className="text-lg font-semibold mb-4 text-gray-200">Inferência de GP em Tempo Real</h3>
                <div className="flex-1 w-full min-h-[250px]">
                  {stats ? <GaussianChart stats={stats} /> : <div className="animate-pulse flex items-center justify-center h-full text-gray-500">Carregando Modelo...</div>}
                </div>
             </div>
          </div>
          
          <AcademicExplanation />
        </div>
      </div>
    </div>
  );
}

export default App;
