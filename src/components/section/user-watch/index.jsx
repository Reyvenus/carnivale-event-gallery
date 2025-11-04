import { useState } from 'react';
import './userwatch.css';

export default function UserWatch({ onClick, guestData }) {
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Obtener el nombre del invitado desde guestData
  const guestName = guestData 
    ? (guestData.nickname || `${guestData.first_name} ${guestData.last_name}`)
    : 'Invitado';

  const handleClick = () => {
    // Reproducir el sonido
    const sound = new Audio('/audio/netflix.mp3');
    sound.volume = 0.6; // Reducir volumen para que no sea tan abrupto
    
    sound.play()
      .then(() => {
        console.log('✅ Sonido reproducido');
      })
      .catch((error) => {
        console.log('⚠️ Error al reproducir:', error.message);
      });

    // Iniciar la animación de fade out
    setIsTransitioning(true);

    // Navegar después de que termine la animación de fade out
    setTimeout(() => {
      onClick();
    }, 800); // Tiempo suficiente para el fade out suave
  };

  return (
    <div 
      className={`py-10 text-center space-y-28 transition-all duration-700 ${
        isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <img
        className="mx-auto w-64 sm:w-80 md:w-96 max-w-full px-4 netflix-impact"
        src="images/bodafix.png"
        alt="boda-ivi-coco"
      />
      <div>
        <p className="mb-10 text-2xl">Quien anda allí?</p>
        <div onClick={handleClick} className="group cursor-pointer">
          <img
            className="mx-auto group-hover:scale-125 transition-transform duration-300"
            src="images/guest-icon.png"
            width={100}
            height={100}
            alt="boda-ivi-coco"
          />
          <p className="text-xl mt-2 group-hover:scale-125 group-hover:pt-5 transition-all duration-300">
            {guestName}
          </p>
        </div>
      </div>
    </div>
  );
}
