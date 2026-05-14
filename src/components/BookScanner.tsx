import { useState, useRef, useEffect } from 'react';
import { Camera, RefreshCw, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BookScannerProps {
  onScan: (base64: string) => void;
  onClose: () => void;
}

export default function BookScanner({ onScan, onClose }: BookScannerProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        onScan(base64);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-lg flex flex-col items-center justify-center pt-10"
    >
      <div className="relative w-full max-w-sm aspect-[3/4] bg-slate-800 rounded-[2.5rem] border-8 border-slate-800 overflow-hidden shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
            <p className="text-white text-lg font-display">{error}</p>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Modern Corners */}
        <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-playful-teal rounded-tl-xl" />
        <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-playful-teal rounded-tr-xl" />
        <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-playful-teal rounded-bl-xl" />
        <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-playful-teal rounded-br-xl" />
        
        {/* Scanning line animation */}
        <motion.div 
          animate={{ top: ['15%', '85%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute left-8 right-8 h-1 bg-playful-teal shadow-[0_0_20px_rgba(20,184,166,1)] z-10 rounded-full"
        />
      </div>

      <div className="flex items-center gap-8 mt-12 mb-8">
        <button 
          onClick={onClose}
          className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        <button 
          onClick={captureFrame}
          disabled={!!error}
          className="bubbly-button w-24 h-24 p-0 flex items-center justify-center shadow-playful-teal/40"
          title="Scan Book"
        >
          <Camera className="w-10 h-10" />
        </button>

        <button 
          onClick={() => window.location.reload()}
          className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
        >
          <RefreshCw className="w-6 h-6" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      
      <p className="text-white/60 text-sm font-display tracking-wide px-8 text-center bg-white/5 py-2 rounded-full backdrop-blur-sm">
        ✨ Align the book cover within the frame ✨
      </p>
    </motion.div>
  );
}
