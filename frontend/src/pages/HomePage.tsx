import React from 'react';
import { ScanLine } from 'lucide-react';
import WebcamScanner from '../components/WebcamScanner';
import PackOpener from '../components/PackOpener';
import GaussianChart from '../components/GaussianChart';
import Dashboard from '../components/Dashboard';
import AcademicExplanation from '../components/AcademicExplanation';
import type { AppState } from '../types';

interface HomePageProps {
  stats: AppState | null;
  detectedIds: number[];
  onDetect: (ids: number[]) => void;
  onOpenPack: (stickers: number[]) => void;
  isOpeningPack: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ stats, detectedIds, onDetect, onOpenPack, isOpeningPack }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Vision & Stats */}
      <div className="lg:col-span-4 space-y-6">
        <WebcamScanner onDetect={onDetect} wsUrl={`ws://localhost:8000/ws`} />
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
            <PackOpener detectedIds={detectedIds} onOpen={onOpenPack} isOpening={isOpeningPack} />
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
  );
};

export default HomePage;
