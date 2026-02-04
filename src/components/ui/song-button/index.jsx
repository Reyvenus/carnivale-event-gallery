import React, { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import data from '../../../data/config.json';

export default function SongButton({ onAutoPlayRequest }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);

  useEffect(() => {
    // Inicializar Howl
    soundRef.current = new Howl({
      src: [data.audio_url],
      loop: true,
      html5: true, // Importante para Chrome y archivos largos
      volume: 0.8,
      onplay: () => setIsPlaying(true),
      onpause: () => setIsPlaying(false),
      onstop: () => setIsPlaying(false),
      onloaderror: (id, err) => console.error("Howl load error:", err),
      onplayerror: (id, err) => {
        console.error("Howl play error:", err);
        // Si hay error de reproducción, Howl intentará reproducir en la próxima interacción
        soundRef.current.once('unlock', () => {
          soundRef.current.play();
        });
      }
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
    };
  }, []);

  // Exponer función de reproducción al padre (App.jsx)
  useEffect(() => {
    if (onAutoPlayRequest) {
      onAutoPlayRequest(() => {
        if (soundRef.current) {
          // Intentar reproducir. Howler maneja internamente el bloqueo en móviles
          if (!soundRef.current.playing()) {
            soundRef.current.play();
          }
        }
      });
    }
  }, [onAutoPlayRequest]);

  // Manejar cambio de visibilidad
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (soundRef.current && soundRef.current.playing()) {
          soundRef.current.pause();
        }
      } else {
        // Opcional: retomar si estaba sonando
        if (soundRef.current && isPlaying) {
          soundRef.current.play();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPlaying]);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!soundRef.current) return;

    if (soundRef.current.playing()) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <button
        onClick={togglePlay}
        className={`w-14 h-14 bg-black/40 backdrop-blur-xl border border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.3)] rounded-full flex justify-center items-center hover:scale-110 active:scale-90 transition-all duration-300 group ${isPlaying ? 'animate-pulse-slow ring-2 ring-pink-500/30' : ''}`}
        aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
      >
        <div className="relative flex items-center justify-center">
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <div className="w-0.5 bg-pink-400 animate-[music-bar_0.6s_ease-in-out_infinite]" />
              <div className="w-0.5 bg-pink-400 animate-[music-bar_0.8s_ease-in-out_infinite_0.1s]" />
              <div className="w-0.5 bg-pink-400 animate-[music-bar_0.7s_ease-in-out_infinite_0.2s]" />
              <div className="w-0.5 bg-pink-400 animate-[music-bar_0.9s_ease-in-out_infinite_0.3s]" />
            </div>
          ) : (
            <span className="text-2xl grayscale opacity-40 group-hover:opacity-100 group-hover:grayscale-0 transition-all">💿</span>
          )}
        </div>
      </button>

      <style jsx="true font-sans">{`
        @keyframes music-bar {
          0%, 100% { height: 4px; }
          50% { height: 16px; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
