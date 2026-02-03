import React from 'react';
import data from '../../../data/config.json';

export default function SongButton({ onAutoPlayRequest }) {
  const [isPlaying, setIsPlaying] = React.useState(false); // Start false to sync with reality
  const audioRef = React.useRef(null);

  // Expose play functionality to parent
  React.useEffect(() => {
    if (onAutoPlayRequest) {
      onAutoPlayRequest(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(console.error);
        }
      });
    }
  }, [onAutoPlayRequest]);

  // Intentar reproducir automáticamente al montar
  React.useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0.5; // Start slightly in

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Autoplay success");
          })
          .catch((error) => {
            console.log("Autoplay blocked by browser:", error);
            setIsPlaying(false);

            // Fallback: Play on first user interaction
            const handleFirstInteraction = () => {
              audio.play()
                .then(() => setIsPlaying(true))
                .catch(console.error);

              document.removeEventListener('click', handleFirstInteraction);
              document.removeEventListener('touchstart', handleFirstInteraction);
              document.removeEventListener('keydown', handleFirstInteraction);
            };

            document.addEventListener('click', handleFirstInteraction);
            document.addEventListener('touchstart', handleFirstInteraction);
            document.addEventListener('keydown', handleFirstInteraction);
          });
      }
    }
  }, []);

  // Handle visibility change
  React.useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (audioRef.current) audioRef.current.pause();
        setIsPlaying(false);
      } else {
        if (audioRef.current && isPlaying) {
          audioRef.current.play().catch(console.error);
          setIsPlaying(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Toggle function
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(console.error);
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <audio
        ref={audioRef}
        loop
        autoPlay
        src={data.audio_url}
        preload="auto"
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className={`w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-full flex justify-center items-center hover:scale-110 transition-transform duration-200 ${isPlaying ? 'animate-pulse-slow' : ''}`}
      >
        {isPlaying ? (
          /* Icono de Sonido/Pausa */
          <span className="text-2xl animate-spin">💿</span>
        ) : (
          /* Icono de Play/Mute */
          <span className="text-2xl grayscale opacity-50">💿</span>
        )}
      </button>
    </div>
  );
}
