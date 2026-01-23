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
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
            Galería de Recuerdos
          </h1>
          <p className="text-white/60 text-lg">
            Comparte y revive los momentos más especiales de la boda
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* Button 1: Upload Photos */}
          <button
            onClick={() => navigate(isAdmin ? '/admin/mediacenter/upload' : '/mediacenter/upload')}
            className="group relative h-52 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden hover:scale-105 active:scale-95 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                📸
              </div>
              <h2 className="text-2xl font-bold text-white">Subir Fotos</h2>
              <p className="text-white/50 text-sm">Comparte tus mejores momentos</p>
            </div>
          </button>

          {/* Button 2: View Gallery */}
          <button
            onClick={() => navigate(isAdmin ? '/admin/mediacenter/gallery' : '/mediacenter/gallery')}
            className="group relative h-52 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden hover:scale-105 active:scale-95 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="text-6xl animate-bounce">🤵👰
              </div>
              <h2 className="text-2xl font-bold text-white">Ver Galería</h2>
              <p className="text-white/50 text-sm">Explora todos los recuerdos</p>
            </div>
          </button>
        </div>

        {/* Admin Navigation (Only if Admin) */}
        {isAdmin && (
          <div className="mt-12 flex justify-center">
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
  );
};

export default MediaDashboard;
