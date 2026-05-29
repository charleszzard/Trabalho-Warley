import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera } from 'lucide-react';

interface WebcamScannerProps {
  onDetect: (ids: number[]) => void;
  wsUrl: string;
}

const WebcamScanner: React.FC<WebcamScannerProps> = ({ onDetect, wsUrl }) => {
  const webcamRef = useRef<Webcam>(null);
  const [processedFrame, setProcessedFrame] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket
    ws.current = new WebSocket(wsUrl);
    
    ws.current.onopen = () => setIsConnected(true);
    ws.current.onclose = () => setIsConnected(false);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.frame) {
        setProcessedFrame(data.frame);
      }
      if (data.detected_ids && data.detected_ids.length > 0) {
        onDetect(data.detected_ids);
      }
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [wsUrl, onDetect]);

  useEffect(() => {
    // Send frames to backend every 100ms
    const intervalId = setInterval(() => {
      if (ws.current && isConnected && webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          ws.current.send(imageSrc);
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isConnected]);

  return (
    <div className="glass-panel overflow-hidden relative border border-neonBlue/30 shadow-neon-blue">
      <div className="absolute top-0 left-0 w-full h-1 bg-neonBlue shadow-neon-blue z-20 animate-scanline opacity-50" />
      
      <div className="bg-black/50 absolute top-4 left-4 z-20 px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 backdrop-blur-md">
        <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
        <span className="text-xs font-mono">{isConnected ? 'CV_ATIVO' : 'DESCONECTADO'}</span>
      </div>

      <div className="relative aspect-video bg-black flex items-center justify-center">
        {/* Hidden webcam, we only show the processed frame from backend */}
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          width={640}
          height={480}
          videoConstraints={{ facingMode: "environment" }}
          className="hidden"
        />
        
        {processedFrame ? (
          <img src={processedFrame} alt="CV Stream" className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="flex flex-col items-center text-gray-500">
            <Camera className="w-12 h-12 mb-2 opacity-50" />
            <p className="font-mono text-sm">INICIALIZANDO_OPTICA...</p>
          </div>
        )}
      </div>
      
      {/* HUD overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 border-2 border-neonBlue/20" />
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-neonBlue z-10" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-neonBlue z-10" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-neonBlue z-10" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-neonBlue z-10" />
    </div>
  );
};

export default WebcamScanner;
