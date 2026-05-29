import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, PackageOpen } from 'lucide-react';

interface PackOpenerProps {
  detectedIds: number[];
  onOpen: (stickers: number[]) => void;
  isOpening: boolean;
}

// 48 teams for 2026 World Cup (Placeholder popular ISO codes)
const TEAMS = [
  "ar","br","fr","de","it","es","pt","en","nl","be","uy","hr","sn","ma","us","mx",
  "jp","kr","ir","sa","au","ca","cr","ec","co","cl","pe","pl","ch","dk","se","rs",
  "ua","ng","eg","dz","ci","cm","gh","za","tn","ml","tr","gr","cz","ro","hu","at"
];

const PackOpener: React.FC<PackOpenerProps> = ({ detectedIds, onOpen, isOpening }) => {
  const [packStickers, setPackStickers] = useState<number[]>([]);
  const [showStickers, setShowStickers] = useState(false);
  const playSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const handleSimulateOpen = () => {
    playSound();
    let toOpen = detectedIds;
    // Se a câmera não detectar nenhuma figurinha (0), geramos um pacote de 5 aleatórias para simular
    // Se a câmera detectar 1, 2, 3 ou mais, nós abrimos exatamente a quantidade que a câmera viu!
    if (toOpen.length === 0) {
      toOpen = Array.from({length: 5}, () => Math.floor(Math.random() * 682) + 1);
    }
    setPackStickers(toOpen);
    setShowStickers(true);
    onOpen(toOpen);
    
    setTimeout(() => {
      setShowStickers(false);
    }, 4000);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <AnimatePresence mode="wait">
        {!showStickers ? (
          <motion.div
            key="pack"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0, filter: 'blur(10px)' }}
            className="flex flex-col items-center cursor-pointer group"
            onClick={!isOpening ? handleSimulateOpen : undefined}
          >
            <div className="w-32 h-48 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-neon-blue border-2 border-white/20 flex flex-col items-center justify-center relative overflow-hidden group-hover:shadow-neon-purple transition-all duration-500">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 blur-3xl rounded-full" />
              <PackageOpen className="w-12 h-12 text-white mb-2" />
              <span className="font-bold text-white tracking-widest uppercase text-sm">2026</span>
              <span className="text-white/80 text-xs font-mono text-center leading-tight">COPA DO MUNDO<br/>FIFA</span>
            </div>
            <div className="mt-6 flex items-center gap-2 text-neonBlue bg-neonBlue/10 px-4 py-2 rounded-full font-mono text-sm border border-neonBlue/30 hover:bg-neonBlue/20 transition-colors">
              <Sparkles className="w-4 h-4" />
              {isOpening ? 'ANALISANDO...' : 'ABRIR PACOTE'}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="stickers"
            className="flex flex-wrap gap-3 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {packStickers.map((id, index) => {
              const teamCode = TEAMS[id % TEAMS.length];
              
              // Map our 1-682 IDs to the football-api player IDs (which usually start around 1-2000 for top players)
              // We add a small offset to avoid the very first IDs which might be empty or old
              const playerId = id + 150; 
              
              // Rarity System
              let rarity = { name: 'COMUM', color: 'from-gray-700 to-gray-900', border: 'border-white/20', shadow: 'shadow-lg' };
              if (id % 50 === 0) {
                rarity = { name: 'LENDÁRIA', color: 'from-yellow-500 to-yellow-700', border: 'border-yellow-400', shadow: 'shadow-[0_0_30px_rgba(250,204,21,0.8)]' };
              } else if (id % 15 === 0) {
                rarity = { name: 'ÉPICA', color: 'from-purple-600 to-purple-900', border: 'border-neonPurple', shadow: 'shadow-[0_0_20px_rgba(184,0,255,0.8)]' };
              }

              return (
                <motion.div
                  key={`${id}-${index}`}
                  initial={{ y: 50, opacity: 0, rotateY: 90, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, rotateY: 0, scale: 1 }}
                  transition={{ delay: index * 0.15, type: "spring", damping: 12 }}
                  className={`w-24 h-32 md:w-28 md:h-40 bg-gradient-to-b ${rarity.color} rounded-lg ${rarity.shadow} flex flex-col items-center relative overflow-hidden border-2 ${rarity.border} group cursor-pointer hover:scale-110 transition-transform`}
                >
                  {/* Player Image from Real Football API */}
                  <div className="absolute bottom-0 w-full h-[85%] flex justify-center items-end bg-black/20">
                    <img 
                      src={`https://media.api-sports.io/football/players/${playerId}.png`} 
                      alt="Player" 
                      className="w-[90%] h-[90%] object-contain drop-shadow-2xl transition-all duration-300 group-hover:brightness-125"
                      onError={(e) => {
                        // Fallback to silhouette if this specific ID doesn't have a photo in the API
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" class="w-16 h-16 mb-2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>`;
                      }}
                    />
                  </div>
                  
                  {/* Holographic overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_2s_infinite] opacity-60 mix-blend-overlay pointer-events-none z-20" />
                  
                  {/* Top Bar with Flag and ID */}
                  <div className="absolute top-0 w-full p-1 bg-black/50 backdrop-blur-md border-b border-white/20 flex justify-between items-center z-10">
                    <img src={`https://flagcdn.com/w40/${teamCode}.png`} alt={teamCode} className="w-5 h-3.5 object-cover rounded-sm shadow-sm" />
                    <span className="text-[10px] font-bold text-white bg-black/50 px-1 rounded shadow-inner">{id}</span>
                  </div>
                  
                  {/* Bottom Rarity / Name Bar */}
                  <div className="absolute bottom-0 w-full p-1 bg-gradient-to-t from-black via-black/80 to-transparent z-10 flex flex-col items-center">
                    <span className={`text-[8px] font-bold tracking-widest uppercase ${rarity.name === 'LENDÁRIA' ? 'text-yellow-400' : rarity.name === 'ÉPICA' ? 'text-neonPurple' : 'text-gray-300'}`}>
                      {rarity.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PackOpener;
