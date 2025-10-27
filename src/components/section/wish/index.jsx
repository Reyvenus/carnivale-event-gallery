import React, { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import supabase from '../../../lib/supabaseClient';

const WishItem = forwardRef(({ name, message, color }, ref) => (
  <div ref={ref} className="flex gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
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
      <p className="text-white font-semibold text-sm mb-1">{name}</p>
      <p className="text-[#A3A1A1] text-xs leading-relaxed break-words">{message}</p>
    </div>
  </div>
));

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

  const [data, setData] = useState([]);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

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
    const { data, error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME) // Replace 'your_table' with the actual table name
      .select('name, message, color')
      .eq('approved', true);

    if (error) console.error('Error fetching data: ', error);
    else setData(data);
  };

  const scrollToLastChild = () => {
    if (lastChildRef.current) {
      lastChildRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetchData();
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
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
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
