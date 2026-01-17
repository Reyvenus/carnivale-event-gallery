import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    // if (cachedData) {
    //   const { photos: cachedPhotos, timestamp } = JSON.parse(cachedData);
    //   const now = Date.now();
    //   if (now - timestamp < 300000) {
    //     setPhotos(cachedPhotos);
    //     setLoading(false);
    //     return;
    //   }
    // }

    fetchPhotos();
  }, [navigate, isAdmin]);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery');
      if (!response.ok) {
        throw new Error('Failed to fetch gallery');
      }
      const data = await response.json();
      console.log("data", data);
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
              onClick={() => navigate(isAdmin ? '/admin/media' : '/media')}
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
            onClick={() => navigate(isAdmin ? '/admin/media/upload' : '/media/upload')}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {photos.map((photo, index) => (
              <div
                key={photo.key}
                onClick={() => setSelectedPhoto(photo)}
                className={`group relative rounded-2xl overflow-hidden cursor-zoom-in bg-white/5 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${index % 5 === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
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
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {selectedPhoto && (
          <div
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <button
              className="absolute top-4 right-4 w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all mb-4"
              onClick={() => setSelectedPhoto(null)}
            >
              ✕
            </button>

            <img
              src={selectedPhoto.originalUrl}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoGallery;
