import React, { useEffect, useState } from 'react';

export default function UserWatch({ onClick }) {
  const [to, setTo] = useState('Invitado');
  const audioRef = React.useRef(null);

  useEffect(() => {
    if (window) {
      const url = new URL(window.location.href);
      const to = url.searchParams.get('to');
      setTo(to ? to : 'Invitado');
    }

    // Reproducir sonido automáticamente al cargar
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Si falla, no hacer nada (el navegador bloqueó el autoplay)
      });
    }
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio/netflix.mp3" preload="auto" />
      <div className="py-10 text-center space-y-28">
      <img
        className="mx-auto w-64 sm:w-80 md:w-96 max-w-full px-4"
        src="images/bodafix.png"
        alt="boda-ivi-coco"
      />
      <div>
        <p className="mb-10 text-2xl">Quien es el Invitado?</p>
        <div onClick={onClick} className="group cursor-pointer">
          <img
            className="mx-auto group-hover:scale-125"
            src="images/guest-icon.png"
            width={100}
            height={100}
            alt="boda-ivi-coco"
          />
          <p className="text-xl mt-2 group-hover:scale-125 group-hover:pt-5">
            {to}
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
