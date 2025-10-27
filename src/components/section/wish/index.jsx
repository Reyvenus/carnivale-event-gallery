import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import supabase from '../../../lib/supabaseClient';

const WishItem = forwardRef(({ name, message, color, createdAt }, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const textRef = useRef(null);

  useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const height = textRef.current.scrollHeight;
      const lines = height / lineHeight;
      setShowButton(lines > 3); // Mostrar botón si tiene más de 3 líneas
    }
  }, [message]);

  const formatDate = (createdAt) => {
    if (!createdAt) return '';
    const date = new Date(createdAt);
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  return (
    <div ref={ref} className="p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <img
            width={32}
            height={32}
            src="images/face.png"
            style={{
              backgroundColor: color,
              minWidth: 32,
              minHeight: 32,
            }}
            className="rounded-md shadow-md"
            alt="Avatar"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <p className="text-white font-semibold text-sm">{name}</p>
            {createdAt && (
              <span className="text-white/40 text-[10px] flex-shrink-0">
                {formatDate(createdAt)}
              </span>
            )}
          </div>
          <div className="relative">
            <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? '' : 'max-h-[3.3rem]'}`}>
              <p 
                ref={textRef}
                className="text-[#A3A1A1] text-xs leading-relaxed break-words"
              >
                {message}
              </p>
            </div>
            {!isExpanded && showButton && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-t from-[#0f0f0f]/80 to-transparent pointer-events-none"></div>
            )}
          </div>
          {showButton && (
            <div className="flex justify-start mt-1">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors"
              >
                <span>{isExpanded ? 'Ver menos' : 'Ver más'}</span>
                <svg 
                  className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

WishItem.displayName = 'WishItem';

const colorList = [
  '#EF4444', // Rojo moderno
  '#F59E0B', // Amber/Naranja
  '#10B981', // Verde esmeralda
  '#3B82F6', // Azul brillante
  '#8B5CF6', // Púrpura
  '#EC4899', // Rosa/Pink
  '#14B8A6', // Teal/Turquesa
  '#F97316', // Naranja intenso
  '#06B6D4', // Cyan
  '#A855F7', // Violeta
  '#EAB308', // Amarillo dorado
  '#6366F1', // Indigo
];

export default function WishSection() {
  const lastChildRef = useRef(null);
  const messageCountRef = useRef(0); // Usar ref para evitar problemas de closure

  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [bannerKey, setBannerKey] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (name.length < 3) {
      setError('El nombre debe tener al menos 3 caracteres!');
      return;
    }

    if (message.length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres!');
      return;
    }

    setLoading(true);
    setError(null);

    // random color - totalmente aleatorio
    const randomColor = colorList[Math.floor(Math.random() * colorList.length)];
    const { error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME) // Replace with your actual table name
      .insert([
        { name, message: message, color: randomColor }, // Assuming your table has a "name" column
      ]);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Mostrar notificación de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
      // Limpiar formulario
      setName('');
      setMessage('');
      
      // Actualizar lista y scroll
      fetchData();
      setTimeout(scrollToLastChild, 500);
    }
  };

  const fetchData = async () => {
    const { data: newData, error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME) // Replace 'your_table' with the actual table name
      .select('name, message, color, created_at')
      .eq('approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching data: ', error);
    } else {
      const previousCount = messageCountRef.current;
      const newCount = newData.length;
      
      // Solo detectar nuevos mensajes si ya teníamos mensajes antes
      // Y si la nueva cantidad es MAYOR (no igual)
      if (previousCount > 0 && newCount > previousCount) {
        console.log('🔔 Nuevos mensajes detectados! Antes:', previousCount, 'Ahora:', newCount);
        setShowNewMessages(true);
        setBannerKey(prev => prev + 1); // Cambiar key para forzar re-render
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
          setShowNewMessages(false);
        }, 8000);
      }
      
      // Actualizar el ref con el nuevo conteo
      messageCountRef.current = newCount;
      setData(newData);
    }
  };

  const scrollToLastChild = () => {
    if (lastChildRef.current) {
      lastChildRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    // Cargar mensajes inicialmente
    fetchData();
    
    // Auto-refresh cada 5 segundos para obtener nuevos mensajes aprobados
    const interval = setInterval(() => {
      fetchData();
    }, 5000); // 5 segundos
    
    // Cleanup: limpiar el interval cuando el componente se desmonte
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Toast de éxito - Banner estilo moderno */}
      {showSuccess && createPortal(
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-fade-in-up">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-4 shadow-2xl">
            <div className="max-w-sm mx-auto flex items-center justify-center gap-3">
              <div className="flex-shrink-0 bg-white/20 rounded-full p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1 text-center">
                <p className="font-semibold text-base">¡Mensaje enviado! ✨</p>
                <p className="text-xs text-white/90 mt-0.5">Pronto aparecerá en el listado</p>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="space-y-6">
        {/* Título principal con diseño mejorado */}
        <div className="text-center space-y-2">
          <h2 className="text-xl leading-6 text-white font-bold">
            💌 Deseos para la Pareja 💌
          </h2>
          <p className="text-white/60 text-xs">
            Comparte tus buenos deseos y felicitaciones
          </p>
        </div>

        {/* Lista de mensajes integrada */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 relative">
          {/* Banner de nuevos mensajes */}
          {showNewMessages && (
            <div 
              key={bannerKey}
              className="mb-4 bg-gradient-to-r from-blue-500/20 to-purple-600/20 border border-blue-400/30 rounded-lg p-3 animate-fade-in-up relative z-10"
            >
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 bg-blue-500/20 rounded-full p-1">
                  <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="text-blue-200 font-semibold text-sm">🎉 ¡Nuevo mensaje!</p>
                  <p className="text-blue-300/80 text-xs">Alguien mando un deseo para los novios!</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white/90 text-sm font-semibold">
              📝 Mensajes ({data.length})
            </h3>
            {data.length > 0 && (
              <span className="text-xs text-white/50">
                {data.length} {data.length === 1 ? 'mensaje' : 'mensajes'}
              </span>
            )}
          </div>
          
          <div className="max-h-[20rem] overflow-y-auto space-y-3 wish-container pr-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {data.length === 0 ? (
              <div className="text-center py-12 text-white/40 text-sm">
                <div className="mb-2">✨</div>
                <p>Aún no hay mensajes</p>
                <p className="text-xs mt-1">¡Sé el primero en dejar uno!</p>
              </div>
            ) : (
              data.map((item, index) => (
                <WishItem
                  name={item.name}
                  message={item.message}
                  color={item.color}
                  createdAt={item.created_at}
                  key={index}
                  ref={index === data.length - 1 ? lastChildRef : null}
                />
              ))
            )}
          </div>
        </div>

        {/* Formulario mejorado */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
            <span>✍️</span>
            <span>Deja tu mensaje</span>
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">Nombre</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre..."
                className="w-full focus:outline-none focus:ring-2 focus:ring-white/30 px-3 py-2 text-black rounded-lg transition-all"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">Mensaje</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tus buenos deseos..."
                className="w-full focus:outline-none focus:ring-2 focus:ring-white/30 px-3 py-2 text-black rounded-lg transition-all resize-none"
                rows={4}
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? '✉️ Enviando...' : '💝 Enviar Mensaje'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
