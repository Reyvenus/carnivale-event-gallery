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
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      {/* Background - Fixed */}
      <div
        className="fixed inset-0 bg-[length:100%_auto] bg-no-repeat bg-top"
        style={{ backgroundImage: `url('/images/ablande.png')` }}
      />
      <div className="fixed inset-0 bg-black/90" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 pb-24">
        {/* Header - Rediseñado */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button
              onClick={() => navigate(isAdmin ? '/admin/media' : '/')}
              className="w-12 h-12 rounded-full border border-yellow-500/20 bg-black/40 flex items-center justify-center hover:bg-yellow-500/10 transition-all text-yellow-500/80 shrink-0 backdrop-blur-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-left">
              <h1 className="text-3xl md:text-4xl font-serif text-yellow-100 tracking-wider font-light drop-shadow-md">
                Galería de <span className="text-yellow-500 font-semibold">Fotos</span>
              </h1>
              <p className="text-yellow-200/50 text-xs uppercase tracking-[0.2em] mt-1">{photos.length} Momentos Inolvidables</p>
            </div>
          </div>

          <button
            onClick={() => navigate(isAdmin ? '/admin/media/upload' : '/upload')}
            className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-sm hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all font-serif tracking-widest uppercase text-sm flex items-center justify-center gap-2 border border-yellow-400/30"
          >
            <span>Subir Fotos</span>
            <span className="text-lg">✨</span>
          </button>
        </div>

        {/* Gallery Grid - 1 Grande y 3 Chicas */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-yellow-200/30">
            <div className="w-16 h-16 border-4 border-yellow-500/20 border-t-yellow-500 rounded-full animate-spin mb-6"></div>
            <p className="font-serif tracking-widest text-sm">Cargando...</p>
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] text-yellow-100/30 p-10 text-center border border-yellow-500/10 bg-black/20 backdrop-blur-sm rounded-lg">
            <div className="text-6xl mb-6 opacity-30">✨</div>
            <p className="text-2xl font-serif mb-2 text-yellow-100">La galería está vacía</p>
            <p className="text-sm font-light text-yellow-200/50">¡Comparte el primer recuerdo de esta noche!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 md:gap-2">
            {photos.map((photo, index) => {
              // Patrón: 1 Grande cada 4 fotos
              const isLarge = index % 4 === 0;

              return (
                <div
                  key={photo.key}
                  onClick={() => setSelectedPhoto(photo)}
                  className={`group relative overflow-hidden bg-white/5 cursor-zoom-in transition-all duration-500 hover:z-10 ${isLarge
                    ? 'col-span-3 aspect-[16/9] md:aspect-[21/9]' // Foto Grande (Ocupa 3 columnas)
                    : 'col-span-1 aspect-square'          // Foto Chica (Ocupa 1 columna)
                    }`}
                >
                  <img
                    src={photo.thumbnailUrl}
                    alt="boda"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-90 group-hover:brightness-110"
                  />

                  {/* Overlay elegante */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                    <div className="border-l-2 border-yellow-500 pl-2">
                      <p className="text-yellow-100 text-[10px] uppercase tracking-wider font-medium">
                        {new Date(photo.lastModified).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-700 backdrop-blur-sm border border-red-500/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(photo);
                      }}
                      title="Eliminar de galería"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal */}
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
