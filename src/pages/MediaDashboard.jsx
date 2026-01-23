import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const MediaDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar autenticación solo si estamos en ruta de admin
    if (isAdmin) {
      const auth = localStorage.getItem('adminAuth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        // Si no está autenticado, redirigir al login
        navigate('/admin');
      }
    } else {
      // Ruta pública, permitir acceso
      setIsAuthenticated(true);
    }
  }, [isAdmin, navigate]);

  // Si es ruta de admin y no está autenticado, no mostrar nada (evita flash de contenido)
  if (isAdmin && !isAuthenticated) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 overflow-hidden overflow-y-auto">
      <div className="min-h-full flex justify-center pt-12 pb-8 px-4 md:px-6">
        <div className="max-w-3xl w-full">
        {/* Header */}
        <div className="mb-8 md:mb-10 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-3">
            Momentos de Nuestra Boda
          </h1>
          <p className="text-white/60 text-base md:text-lg px-4">
            Captura y revive cada instante mágico de esta celebración
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">

          {/* Button 1: Upload Photos */}
          <button
            onClick={() => navigate(isAdmin ? '/admin/mediacenter/upload' : '/mediacenter/upload')}
            className="group relative h-44 md:h-48 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden active:scale-95 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl md:text-4xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                📸
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Subir Recuerdos</h2>
              <p className="text-white/50 text-sm md:text-base px-2">Comparte tus fotos de la boda</p>
            </div>
          </button>

          {/* Button 2: View Gallery */}
          <button
            onClick={() => navigate(isAdmin ? '/admin/mediacenter/gallery' : '/mediacenter/gallery')}
            className="group relative h-44 md:h-48 rounded-2xl md:rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden active:scale-95 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl md:text-4xl shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                🖼️
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Explorar Galería</h2>
              <p className="text-white/50 text-sm md:text-base px-2">Revive los momentos especiales</p>
            </div>
          </button>
        </div>

        {/* Admin Navigation (Only if Admin) */}
        {isAdmin && (
          <div className="mt-8 md:mt-10 flex justify-center">
            <button
              onClick={() => navigate('/admin')}
              className="text-white/40 hover:text-white transition-colors text-sm flex items-center gap-2"
            >
              ← Volver al Panel
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default MediaDashboard;
