import { useState } from 'react';

export default function GiftAccordion({ name, bankName, cbu, alias, icon = '💳', whatsappNumber, whatsappMessage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [isLoadingWhatsapp, setIsLoadingWhatsapp] = useState(false);

  const copyToClipboard = async (text, field) => {
    try {
      if (!navigator.clipboard) {
        // Fallback para navegadores sin clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
      alert('No se pudo copiar. Por favor, copia manualmente.');
    }
  };

  const handleWhatsappClick = (e) => {
    e.preventDefault();
    setIsLoadingWhatsapp(true);
    
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage || '¡Hola! Confirmo mi asistencia a la boda.')}`;
    
    // Simular un pequeño delay para mostrar la animación
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      // Resetear el estado después de un momento
      setTimeout(() => {
        setIsLoadingWhatsapp(false);
      }, 1500);
    }, 300);
  };

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
            <h3 className="text-lg font-bold text-white">{name}</h3>
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
          isOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden`}
      >
        <div className="px-4 pb-4 pt-3 space-y-3">
          {/* Box unificado con todos los datos bancarios */}
          <div className="bg-white/5 rounded-lg p-3 space-y-3">
            {/* CBU/CVU */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-white/60 uppercase font-semibold">CBU/CVU</span>
                <button
                  onClick={() => copyToClipboard(cbu, 'cbu')}
                  className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                >
                  {copiedField === 'cbu' ? (
                    <>
                      <span className="text-green-400">✓</span> Copiado
                    </>
                  ) : (
                    <>
                      📋 Copiar
                    </>
                  )}
                </button>
              </div>
              <p className="text-white/90 font-mono text-xs break-all leading-relaxed">{cbu}</p>
            </div>

            {/* Separador sutil */}
            <div className="border-t border-white/10"></div>

            {/* Alias */}
            {alias && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-white/60 uppercase font-semibold">Alias</span>
                    <button
                      onClick={() => copyToClipboard(alias, 'alias')}
                      className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full transition-colors duration-200 flex items-center gap-1"
                    >
                      {copiedField === 'alias' ? (
                        <>
                          <span className="text-green-400">✓</span> Copiado
                        </>
                      ) : (
                        <>
                          📋 Copiar
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-white/90 text-sm">{alias}</p>
                </div>
                <div className="border-t border-white/10"></div>
              </>
            )}

            {/* Titular y Banco */}
            <div>
              <span className="text-xs text-white/60 uppercase font-semibold block mb-1.5">
                Titular
              </span>
              <p className="text-white/90 text-sm font-medium">{name}</p>
              <p className="text-white/60 text-xs mt-1">{bankName}</p>
            </div>
          </div>

          {/* Botón de WhatsApp para confirmar */}
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage || '¡Hola! Confirmo mi asistencia a la boda.')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsappClick}
              className={`group relative flex items-center justify-center gap-3 
                         bg-gradient-to-r from-green-500/80 via-green-600/80 to-green-700/80
                         text-white 
                         px-5 py-3 rounded-xl
                         font-bold text-sm
                         hover:from-green-600/90 hover:via-green-700/90 hover:to-green-800/90
                         hover:scale-[1.02] hover:shadow-2xl
                         active:scale-[0.98]
                         transition-all duration-300 ease-out
                         shadow-[0_4px_14px_0_rgba(34,197,94,0.3)]
                         hover:shadow-[0_6px_20px_0_rgba(34,197,94,0.4)]
                         no-underline
                         w-full
                         overflow-hidden
                         ${isLoadingWhatsapp ? 'pointer-events-none opacity-80' : ''}`}
            >
              {/* Efecto de brillo animado */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                             translate-x-[-100%] group-hover:translate-x-[100%] 
                             transition-transform duration-700 ease-in-out"></span>
              
              {/* Overlay de carga */}
              {isLoadingWhatsapp && (
                <span className="absolute inset-0 bg-green-600/90 flex items-center justify-center z-20">
                  <svg 
                    className="animate-spin h-6 w-6 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                  >
                    <circle 
                      className="opacity-25" 
                      cx="12" 
                      cy="12" 
                      r="10" 
                      stroke="currentColor" 
                      strokeWidth="4"
                    ></circle>
                    <path 
                      className="opacity-75" 
                      fill="currentColor" 
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </span>
              )}
              
              {/* Ícono de WhatsApp */}
              <svg 
                className={`w-5 h-5 relative z-10 group-hover:rotate-12 transition-transform duration-300 ${isLoadingWhatsapp ? 'scale-0' : 'scale-100'}`}
                fill="currentColor" 
                viewBox="0 0 24 24"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              
              <span className={`relative z-10 group-hover:tracking-wide transition-all duration-300 ${isLoadingWhatsapp ? 'opacity-0' : 'opacity-100'}`}>
                {isLoadingWhatsapp ? 'Abriendo WhatsApp...' : `Confirmar asistencia a ${name.split(' ')[0]}`}
              </span>
              
              {/* Icono de envío */}
              <svg 
                className={`w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300 ${isLoadingWhatsapp ? 'scale-0' : 'scale-100'}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
