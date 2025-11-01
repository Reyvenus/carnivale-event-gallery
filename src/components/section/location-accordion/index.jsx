import React, { useState } from 'react';

export default function LocationAccordion({ title, time, address, mapUrl, mapsLink, icon = '📍' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/20 rounded-lg overflow-hidden bg-black/30 backdrop-blur-sm">
      {/* Header - siempre visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between hover:bg-white/5 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="text-2xl">{icon}</span>
          <div>
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-sm text-white/70">{time} (Inicia)</p>
          </div>
        </div>
        <svg
          className={`w-6 h-6 text-white transition-transform duration-300 ${
            isOpen ? 'rotate-180' : 'rotate-0'
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - expandible */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 pb-4 space-y-3">
          {/* Dirección */}
          <div className="pt-2 flex items-start gap-2">
            <span className="text-white/80 text-lg mt-0.5">🔍️</span>
            <p className="text-sm text-white/90 leading-relaxed">{address}</p>
          </div>

          {/* Mapa */}
          <div className="rounded-lg overflow-hidden shadow-lg bg-gray-800 relative min-h-[200px]">
            <iframe
              src={mapUrl}
              className="w-full h-48 border-0"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Mapa de ${title}`}
              sandbox="allow-scripts allow-same-origin allow-popups"
            ></iframe>
          </div>

          {/* Botón Google Maps */}
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-3 
                       bg-gradient-to-r from-blue-400/80 via-blue-500/80 to-blue-600/80
                       text-white 
                       px-6 py-3.5 rounded-xl
                       font-bold text-base
                       hover:from-blue-500/90 hover:via-blue-600/90 hover:to-blue-700/90
                       hover:scale-[1.02] hover:shadow-2xl
                       active:scale-[0.98]
                       transition-all duration-300 ease-out
                       shadow-[0_4px_14px_0_rgba(59,130,246,0.3)]
                       hover:shadow-[0_6px_20px_0_rgba(59,130,246,0.4)]
                       no-underline
                       w-full
                       overflow-hidden"
          >
            {/* Efecto de brillo animado */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                           translate-x-[-100%] group-hover:translate-x-[100%] 
                           transition-transform duration-700 ease-in-out"></span>
            
            {/* Ícono SVG de mapa */}
            <svg 
              className="w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300" 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            
            <span className="relative z-10 group-hover:tracking-wide transition-all duration-300">
              Abrir en Google Maps
            </span>
            
            {/* Flecha animada */}
            <svg 
              className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
