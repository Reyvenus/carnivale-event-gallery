import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getGalleryPhotos, deletePhoto } from '../services/mediaService';
import PhotoModal from '../components/media/PhotoModal';

const PhotoGallery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // checkeo de autenticacion
    if (isAdmin) {
      const auth = localStorage.getItem('adminAuth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        navigate('/admin');
        return;
      }
    } else {
      setIsAuthenticated(true);
    }

    // estrategia de cache
    const cachedData = sessionStorage.getItem('galleryCache');
    if (cachedData) {
      const { photos: cachedPhotos, timestamp } = JSON.parse(cachedData);
      const now = Date.now();
      // 5 minutos de cache
      if (now - timestamp < 300000) {
        setPhotos(cachedPhotos);
        setLoading(false);
        return;
      }
    }

    fetchPhotos();
  }, [navigate, isAdmin]);

  const handleDelete = async (photo) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta foto de la galería?')) {
      return;
    }

    try {
      await deletePhoto(photo.key);

      // Actualizar estado local
      const newPhotos = photos.filter(p => p.key !== photo.key);
      setPhotos(newPhotos);
      setSelectedPhoto(null);

      // Actualizar caché
      sessionStorage.setItem('galleryCache', JSON.stringify({
        photos: newPhotos,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error("Error deleting photo:", error);
      alert("Error al eliminar la foto");
    }
  };

  const fetchPhotos = async () => {
    try {
      const data = await getGalleryPhotos();
      setPhotos(data);

      // guardar en cache
      sessionStorage.setItem('galleryCache', JSON.stringify({
        photos: data,
        timestamp: Date.now()
      }));

    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated && isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate(isAdmin ? '/admin/mediacenter' : '/mediacenter')}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Galería de Fotos</h1>
              <p className="text-white/50 text-sm">{photos.length} recuerdos capturados</p>
            </div>
          </div>

          <button
            onClick={() => navigate(isAdmin ? '/admin/mediacenter/upload' : '/mediacenter/upload')}
            className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all font-medium flex items-center justify-center gap-2"
          >
            <span>📸</span>
            <span>Subir más fotos</span>
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-white/50">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p>Cargando recuerdos...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-white/30 p-8 text-center border-2 border-dashed border-white/10 rounded-3xl">
            <div className="text-6xl mb-4">🖼️</div>
            <p className="text-xl font-medium mb-2">Aún no hay fotos</p>
            <p className="text-sm">¡Sé el primero en compartir un momento!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 auto-rows-[100px] md:auto-rows-[200px]">
            {photos.map((photo, index) => {
              const getGridClass = (i) => {
                const pos = i % 7;
                if (pos === 0) return 'col-span-4 row-span-3 md:col-span-2 md:row-span-2';
                if (pos === 1 || pos === 2) return 'col-span-2 row-span-2 md:col-span-1 md:row-span-1';
                return 'col-span-1 row-span-1 md:col-span-1 md:row-span-1';
              };

              return (
                <div
                  key={photo.key}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`group relative rounded-xl overflow-hidden cursor-zoom-in bg-white/5 transition-all duration-300 hover:shadow-xl hover:z-10 ${getGridClass(index)}`}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt="boda"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                    <p className="text-white text-xs font-medium">
                      {new Date(photo.lastModified).toLocaleDateString()}
                    </p>
                  </div>

                  {isAdmin && (
                    <button
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 shadow-lg translate-y-2 group-hover:translate-y-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo);
                      }}
                      title="Eliminar de galería"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Componentificado */}
        {selectedPhoto && (
          <PhotoModal
            selectedPhoto={selectedPhoto}
            photos={photos}
            onClose={() => setSelectedPhoto(null)}
            setSelectedPhoto={setSelectedPhoto}
          />
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
