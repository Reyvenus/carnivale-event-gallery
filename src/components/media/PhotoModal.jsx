import { useState, useEffect, useRef } from 'react';

const PhotoModal = ({ selectedPhoto, photos, onClose, setSelectedPhoto }) => {
  // Ref para gestos táctiles (Swipe)
  const touchStartRef = useRef(0);

  // Estado para loading de la imagen individual en el modal
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Estados para zoom con pinch y desplazamiento
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomTranslate, setZoomTranslate] = useState({ x: 0, y: 0 });
  const pinchStartDistance = useRef(null);
  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const isPinching = useRef(false);
  const lastTapTime = useRef(0);
  const doubleTapDelay = 300;
  const hasTouchMovement = useRef(false);

  // Estado para saber si el usuario está moviendo activamente (para desactivar transiciones y ganar precisión)
  const [isActivelyMoving, setIsActivelyMoving] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Resetea el loading state y zoom cuando cambia la foto
  useEffect(() => {
    setIsImageLoading(true);
    setZoomScale(1);
    setZoomTranslate({ x: 0, y: 0 });
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };
    pinchStartDistance.current = null;
    isPinching.current = false;
    setIsActivelyMoving(false);
  }, [selectedPhoto]);

  // Función para limitar el movimiento dentro de los bordes
  const constrainBoundaries = (x, y, scale) => {
    if (!imageRef.current || !containerRef.current) return { x, y };

    const containerRect = containerRef.current.getBoundingClientRect();
    const imageRect = imageRef.current.getBoundingClientRect();

    const currentW = imageRect.width;
    const currentH = imageRect.height;
    const Cw = containerRect.width;
    const Ch = containerRect.height;

    let maxX = 0;
    if (currentW > Cw) maxX = (currentW - Cw) / (2 * scale);

    let maxY = 0;
    if (currentH > Ch) maxY = (currentH - Ch) / (2 * scale);

    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY)
    };
  };

  // Pre-carga inteligente de imágenes vecinas (Buffer de 3 imagenes)
  useEffect(() => {
    if (selectedPhoto && photos.length > 0) {
      const currentIndex = photos.findIndex(p => p.key === selectedPhoto.key);

      // Precargar 3 siguientes y 3 anteriores para navegación mas rápida
      for (let i = 1; i <= 3; i++) {
        if (currentIndex + i < photos.length) {
          const imgNext = new Image();
          imgNext.src = photos[currentIndex + i].originalUrl;
        }
        if (currentIndex - i >= 0) {
          const imgPrev = new Image();
          imgPrev.src = photos[currentIndex - i].originalUrl;
        }
      }
    }
  }, [selectedPhoto, photos]);

  // Función auxiliar para calcular distancia entre dos puntos táctiles
  const getDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e) => {
    hasTouchMovement.current = false;
    if (e.touches.length === 2) {
      setIsActivelyMoving(true);
      isPinching.current = true;
      pinchStartDistance.current = getDistance(e.touches[0], e.touches[1]);
    } else if (e.touches.length === 1 && !isPinching.current) {
      touchStartRef.current = e.touches[0].screenX;
      // Iniciar rastro para desplazamiento si hay zoom
      if (zoomScale > 1) {
        setIsActivelyMoving(true);
        panStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }
  };

  const handleTouchMove = (e) => {
    hasTouchMovement.current = true;
    if (e.cancelable) e.preventDefault();

    if (e.touches.length === 2 && isPinching.current) {
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scaleFactor = currentDistance / pinchStartDistance.current;
      const newScale = Math.min(Math.max(lastScale.current * scaleFactor, 1), 5); // Hasta 5x
      setZoomScale(newScale);

      // Validar límites al hacer zoom
      const limited = constrainBoundaries(zoomTranslate.x, zoomTranslate.y, newScale);
      setZoomTranslate(limited);
    } else if (e.touches.length === 1 && zoomScale > 1 && !isPinching.current) {
      // Manejar desplazamiento (pan) cuando hay zoom
      const deltaX = e.touches[0].clientX - panStart.current.x;
      const deltaY = e.touches[0].clientY - panStart.current.y;

      const newX = lastTranslate.current.x + deltaX;
      const newY = lastTranslate.current.y + deltaY;

      // Aplicar límites para no ver fondo negro
      const limited = constrainBoundaries(newX, newY, zoomScale);
      setZoomTranslate(limited);
    }
  };

  const handleTouchEnd = (e) => {
    setIsActivelyMoving(false); // Al soltar, permitimos transiciones suaves para el "landing"

    if (isPinching.current && e.touches.length < 2) {
      lastScale.current = zoomScale;
      isPinching.current = false;
      pinchStartDistance.current = null;
      // Al terminar pinch, asegurar límites
      const limited = constrainBoundaries(zoomTranslate.x, zoomTranslate.y, zoomScale);
      setZoomTranslate(limited);
      lastTranslate.current = limited;
    } else if (zoomScale > 1 && !isPinching.current) {
      // Guardar la última posición de desplazamiento
      lastTranslate.current = zoomTranslate;
      touchStartRef.current = 0;
    } else if (e.changedTouches.length === 1 && touchStartRef.current !== 0 && !isPinching.current) {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartRef.current - touchEndX;
      const currentIndex = photos.findIndex(p => p.key === selectedPhoto.key);

      if (diff > 50 && currentIndex < photos.length - 1) {
        setSelectedPhoto(photos[currentIndex + 1]);
      }
      if (diff < -50 && currentIndex > 0) {
        setSelectedPhoto(photos[currentIndex - 1]);
      }
      touchStartRef.current = 0;
    }
  };

  const handleImageDoubleTap = (e) => {
    // Quitamos stopPropagation para que el swipe pueda llegar al modal
    if (hasTouchMovement.current) return;

    const now = Date.now();
    if (now - lastTapTime.current < doubleTapDelay) {
      setIsActivelyMoving(false);
      setZoomScale(1);
      setZoomTranslate({ x: 0, y: 0 });
      lastScale.current = 1;
      lastTranslate.current = { x: 0, y: 0 };
      // Si reseteamos zoom, nos aseguramos de limpiar el ref de inicio para no disparar swipe accidental
      touchStartRef.current = 0;
    }
    lastTapTime.current = now;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col h-screen"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Bar - Espacio reservado para controles */}
      <div className="w-full flex justify-end p-4 md:p-6 shrink-0 z-50">
        <button
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all shadow-lg backdrop-blur-md border border-white/5"
          onClick={onClose}
        >
          <span className="text-2xl leading-none">✕</span>
        </button>
      </div>

      {/* Main Body - Área de la imagen */}
      <div className="flex-1 relative w-full flex items-center justify-center p-2 mb-8 overflow-hidden select-none">

        {/* Navigation Buttons - Libres en los laterales del body */}
        {photos.findIndex(p => p.key === selectedPhoto.key) > 0 && (
          <button
            className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-all z-20 backdrop-blur-md border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = photos.findIndex(p => p.key === selectedPhoto.key);
              if (currentIndex > 0) setSelectedPhoto(photos[currentIndex - 1]);
            }}
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {photos.findIndex(p => p.key === selectedPhoto.key) < photos.length - 1 && (
          <button
            className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-white/20 transition-all z-20 backdrop-blur-md border border-white/10"
            onClick={(e) => {
              e.stopPropagation();
              const currentIndex = photos.findIndex(p => p.key === selectedPhoto.key);
              if (currentIndex < photos.length - 1) setSelectedPhoto(photos[currentIndex + 1]);
            }}
          >
            <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Image Container */}
        <div
          ref={containerRef}
          className="relative max-w-full max-h-full w-full h-full flex items-center justify-center overflow-hidden"
          style={{ touchAction: 'none' }}
        >
          {/* Wedding Loading Spinner */}
          {isImageLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-0">
              <div className="text-6xl animate-bounce filter drop-shadow-lg">🤵👰
                <div className="text-center">
                  <span className="text-white text-xl">Cargando...</span>
                </div>
              </div>
            </div>
          )}

          {/* imagen original*/}
          <img
            ref={imageRef}
            src={selectedPhoto.originalUrl}
            alt="Preview"
            loading="eager"
            className={`relative z-10 max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto ${isImageLoading ? 'opacity-0' : 'opacity-100'}`}
            style={{
              transform: `scale(${zoomScale}) translate(${zoomTranslate.x / zoomScale}px, ${zoomTranslate.y / zoomScale}px)`,
              transformOrigin: 'center center',
              transition: isActivelyMoving ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0, 0.2, 1), opacity 0.3s ease'
            }}
            onTouchEnd={handleImageDoubleTap}
            onClick={(e) => e.stopPropagation()}
            onLoad={() => setIsImageLoading(false)}
          />
        </div>
      </div>
    </div>
  );

};

export default PhotoModal;
