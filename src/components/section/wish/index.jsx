import { forwardRef, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';
import supabase from '../../../lib/supabaseClient';

const WishItem = forwardRef(({ id, name, message, color, createdAt, isOwner, onEdit, onDelete }, ref) => {
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
            <div className="flex items-center gap-2">
              {createdAt && (
                <span className="text-white/40 text-[10px] flex-shrink-0">
                  {formatDate(createdAt)}
                </span>
              )}
              {/* Botones de editar/eliminar solo si es el dueño */}
              {isOwner && (
                <div className="flex gap-1">
                  <button
                    onClick={() => onEdit(id, message)}
                    className="p-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded transition-colors"
                    title="Editar mensaje"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(id)}
                    className="p-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded transition-colors"
                    title="Eliminar mensaje"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
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

WishItem.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  createdAt: PropTypes.string,
  isOwner: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};

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

export default function WishSection({ guestName = 'Invitado' }) {
  const lastChildRef = useRef(null);
  const messageCountRef = useRef(0); // Usar ref para evitar problemas de closure

  const [data, setData] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNewMessages, setShowNewMessages] = useState(false);
  const [bannerKey, setBannerKey] = useState(0);
  
  // Estados para editar/eliminar
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState({ id: null, text: '' });
  const [deletingMessageId, setDeletingMessageId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        { name: guestName, message: message, color: randomColor }, // Usar guestName recibido como prop
      ]);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      // Mostrar notificación de éxito
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
      
      // Limpiar formulario (solo el mensaje)
      setMessage('');
      
      // Actualizar lista y scroll
      fetchData();
      setTimeout(scrollToLastChild, 500);
    }
  };

  const fetchData = async () => {
    const { data: newData, error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .select('id, name, message, color, created_at')
      // .eq('approved', true)
      .eq('deleted', false) // Filtrar mensajes no eliminados
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

  // Función para abrir el modal de editar
  const handleEditClick = (id, currentMessage) => {
    setEditingMessage({ id, text: currentMessage });
    setShowEditModal(true);
  };

  // Función para guardar la edición
  const handleSaveEdit = async () => {
    if (editingMessage.text.length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres!');
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .update({ message: editingMessage.text })
      .eq('id', editingMessage.id);

    setLoading(false);

    if (error) {
      setError('Error al actualizar el mensaje: ' + error.message);
    } else {
      setShowEditModal(false);
      setEditingMessage({ id: null, text: '' });
      setError(null);
      fetchData(); // Recargar mensajes
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  // Función para abrir el modal de eliminar
  const handleDeleteClick = (id) => {
    setDeletingMessageId(id);
    setShowDeleteModal(true);
  };

  // Función para confirmar eliminación (lógica)
  const handleConfirmDelete = async () => {
    setLoading(true);
    const { error } = await supabase
      .from(import.meta.env.VITE_APP_TABLE_NAME)
      .update({ deleted: true })
      .eq('id', deletingMessageId);

    setLoading(false);

    if (error) {
      setError('Error al eliminar el mensaje: ' + error.message);
    } else {
      setShowDeleteModal(false);
      setDeletingMessageId(null);
      fetchData(); // Recargar mensajes
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
                  id={item.id}
                  name={item.name}
                  message={item.message}
                  color={item.color}
                  createdAt={item.created_at}
                  isOwner={item.name === guestName}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  key={item.id}
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

            {/* Mostrar el nombre del invitado */}
            {/* <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
              <p className="text-white/60 text-xs">Mensaje de:</p>
              <p className="text-white font-semibold">{guestName}</p>
            </div> */}
            
            <div className="space-y-2">
              {/* <label className="text-white/90 text-sm font-medium">Mensaje</label> */}
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

      {/* Modal de Edición */}
      {showEditModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowEditModal(false);
              setEditingMessage({ id: null, text: '' });
              setError(null);
            }
          }}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
          <div 
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 border border-white/20 w-full max-w-md shadow-2xl"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-full">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Editar Mensaje
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingMessage({ id: null, text: '' });
                  setError(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs px-3 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-white/90 text-sm font-medium">Mensaje</label>
                <textarea
                  value={editingMessage.text}
                  onChange={(e) => setEditingMessage({ ...editingMessage, text: e.target.value })}
                  placeholder="Escribe tu mensaje..."
                  className="w-full focus:outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-black rounded-lg transition-all resize-none"
                  rows={4}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSaveEdit}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-medium border border-blue-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMessage({ id: null, text: '' });
                    setError(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2.5 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-all text-sm font-medium border border-white/10"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDeleteModal(false);
              setDeletingMessageId(null);
            }
          }}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        >
          <div 
            className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl p-6 border border-white/20 w-full max-w-md shadow-2xl"
            style={{ animation: 'slideUp 0.3s ease-out' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/20 rounded-full">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">
                  Eliminar Mensaje
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingMessageId(null);
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-all text-white/60 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-white/80 text-sm">
                ¿Estás seguro de que deseas eliminar este mensaje? Esta acción no se puede deshacer.
              </p>
              
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleConfirmDelete}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium border border-red-400/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingMessageId(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2.5 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 hover:text-white transition-all text-sm font-medium border border-white/10"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

WishSection.propTypes = {
  guestName: PropTypes.string
};
