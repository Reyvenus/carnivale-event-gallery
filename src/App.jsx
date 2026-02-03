import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import SongButton from './components/ui/song-button';

function App() {
  const [entered, setEntered] = useState(false);
  const navigate = useNavigate();
  // State to hold the play function from SongButton
  const [playMusic, setPlayMusic] = useState(null);

  const handleEnter = () => {
    setEntered(true);
    // Trigger music playback if available
    if (playMusic) {
      playMusic();
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      {/* Dynamic Background - Mobile Optimized: 'bg-contain' ensures full visibility */}
      <div
        className={`absolute inset-0 bg-[length:100%_auto] bg-no-repeat bg-top transition-all duration-1000 ease-in-out ${entered ? 'blur-sm opacity-30' : ''}`}
        style={{ backgroundImage: `url('/images/ablande.png')` }}
      />

      {/* Dark Overlay for Landing State */}
      <div className={`absolute inset-0 bg-black/60 transition-opacity duration-1000 ${entered ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} />

      {/* Persistent Music Player - Passing the setter to capture the play function */}
      {createPortal(<SongButton onAutoPlayRequest={setPlayMusic} />, document.body)}

      {/* Main Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-end pb-12 p-4">

        {!entered ? (
          /* LANDING VIEW */
          <div className="text-center px-4 space-y-4 animate-fade-in-up w-full max-w-lg">
            <h2 className="text-base sm:text-xl font-light text-pink-200 tracking-[0.3em] uppercase border-b border-pink-500/50 inline-block pb-1">
              Master Class
            </h2>

            <div className="pt-6">
              <button
                onClick={handleEnter}
                className="group relative inline-flex items-center justify-center px-8 py-3 text-lg sm:text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full focus:outline-none focus:ring-4 focus:ring-pink-500/30 hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 shadow-xl animate-pulse-slow"
              >
                <span className="relative flex items-center gap-3 tracking-widest">
                  ENTRAR
                  <span className="text-2xl animate-bounce">💃</span>
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* MENU VIEW (After Entering) */
          <div className="text-center space-y-8 animate-fade-in w-full max-w-md">
            <div className="space-y-4">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent drop-shadow-sm">
                ¡Bienvenidas!
              </h2>
              <p className="text-gray-200 text-lg font-light leading-relaxed">
                Preparate para vivir la mejor<br /> <span className="font-semibold text-pink-300">Master Class de Carnaval</span>
              </p>
            </div>

            <div className="grid gap-4 w-full px-6 pt-6">
              <button
                onClick={() => navigate('/gallery')}
                className="w-full bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 backdrop-blur-md text-white font-medium py-5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-between group shadow-lg"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">📸</span>
                  <span>Galería de Fotos</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-white/50 group-hover:text-white">→</span>
              </button>

              <button
                onClick={() => navigate('/upload')}
                className="w-full bg-pink-600/80 hover:bg-pink-600 active:bg-pink-700 border border-transparent backdrop-blur-md text-white font-medium py-5 px-6 rounded-2xl transition-all duration-200 flex items-center justify-between group shadow-lg shadow-pink-900/20"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">📤</span>
                  <span>Subir mis Fotos</span>
                </span>
                <span className="group-hover:translate-x-1 transition-transform text-white/50 group-hover:text-white">→</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App;
