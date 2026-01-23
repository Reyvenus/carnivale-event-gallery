
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';
import UploadStatusModal from '../components/media/UploadStatusModal';
import UploadActions from '../components/media/UploadActions';
import { getSignedUploadUrls, uploadFileToS3 } from '../services/mediaService';


const PhotoUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, current: 0 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Si estamos en ruta de admin, verificamos auth
    if (isAdmin) {
      const auth = localStorage.getItem('adminAuth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        // Redirigir al login si no está autenticado
        navigate('/admin');
        return;
      }
    } else {
      // Acceso público desde /media/upload
      setIsAuthenticated(true);
    }

    // Limpiamos la memoria al limpiar el componente
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [navigate, isAdmin, files]); // Added files to dependency array for cleanup

  // PROTECCIÓN 1: Evitar que la pantalla se apague durante la subida (Wake Lock API)
  useEffect(() => {
    let wakeLock = null;

    const requestWakeLock = async () => {
      // Solo intentamos bloquear si el navegador lo soporta y estamos subiendo
      if (isUploading && 'wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
          console.log('Pantalla bloqueada para subida (Wake Lock activo)');
        } catch (err) {
          console.warn('Wake Lock rechazado:', err);
        }
      }
    };

    if (isUploading) {
      requestWakeLock();
    }

    return () => {
      if (wakeLock) {
        wakeLock.release();
        console.log('Wake Lock liberado');
      }
    };
  }, [isUploading]);

  // PROTECCIÓN 2: Advertir si intenta cerrar la pestaña o recargar
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = ''; // Standard para Chrome/Legacy
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const handleFileSelect = async (e) => {
    console.log("e.target.files", e.target.files);
    if (!e.target.files || e.target.files.length === 0) return;

    setIsProcessing(true);

    try {
      const fileArray = Array.from(e.target.files);

      // Procesar archivos inmediatamente para evitar problemas de permisos
      const processedFiles = await Promise.all(
        fileArray.map(async (file) => {
          try {
            // Leer el archivo inmediatamente como ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();

            // Crear un nuevo Blob desde el ArrayBuffer (esto persiste en memoria)
            const blob = new Blob([arrayBuffer], { type: file.type });

            // Crear un objeto File desde el Blob para mantener el nombre
            const persistentFile = new File([blob], file.name, {
              type: file.type,
              lastModified: file.lastModified
            });

            return {
              file: persistentFile,
              preview: URL.createObjectURL(blob),
              id: Math.random().toString(36).substring(7),
              status: 'pending'
            };
          } catch (error) {
            console.error('Error reading file:', file.name, error);
            return null;
          }
        })
      );

      // Filtrar archivos que fallaron
      const validFiles = processedFiles.filter(f => f !== null);

      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }

      // Limpiar el input para permitir seleccionar los mismos archivos de nuevo
      e.target.value = '';
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);

      const next = prev.filter(f => f.id !== id);
      return next;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress({ total: files.length, current: 0 });

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      if (fileObj.status === 'success') {
        setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
        continue; // saltamos si si ya esta agregada
      }

      try {
        // 1. Comprimimos para el Thumbnail primero
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(fileObj.file, options);

        // 2. Obtenemos las URLs firmadas del Backend mediante el servicio
        const { original, thumbnail } = await getSignedUploadUrls(
          fileObj.file.name,
          fileObj.file.type,
          compressedFile.type
        );

        // 3. Subimos ambos archivos (PUT a S3 directamente) mediante el servicio
        await Promise.all([
          uploadFileToS3(original.url, fileObj.file, fileObj.file.type),
          uploadFileToS3(thumbnail.url, compressedFile, compressedFile.type)
        ]);

        setFiles(prev => prev.map(file => file.id === fileObj.id
          ? { ...file, status: 'success' }
          : file)
        );
      } catch (error) {
        console.error("Upload error:", error);
        console.error("Error details:", {
          message: error.message,
          name: error.name,
          fileName: fileObj.file.name,
          fileType: fileObj.file.type,
          fileSize: fileObj.file.size
        });

        setFiles(prev => prev.map(file => file.id === fileObj.id
          ? { ...file, status: 'error', errorMessage: error.message }
          : file)
        );
      }

      setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }

    setIsUploading(false);
    setShowSuccessModal(true);
  };

  if (!isAuthenticated && isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Nav */}
        <div className="flex flex-row items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => navigate(isAdmin ? '/admin/mediacenter' : '/mediacenter')}
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white shrink-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Subir Fotos</h1>
              <p className="text-white/50 text-sm">Carga imágenes a la galería</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAdmin ? '/admin/mediacenter/gallery' : '/mediacenter/gallery')}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Ir a Galería</span>
            </button>

            {/* Desktop Action Buttons Component */}
            <UploadActions
              variant="desktop"
              files={files}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              onUpload={uploadFiles}
              onClear={() => setFiles([])}
            />
          </div>
        </div>

        {/* content */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[60vh] flex flex-col">

          {/* File Selection Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-white/10 rounded-2xl p-4 md:p-8 mb-4 md:mb-6 flex flex-col items-center justify-center cursor-pointer transition-all ${(isUploading || isProcessing) ? 'opacity-50 pointer-events-none' : 'hover:border-purple-500/50 hover:bg-white/5'
              }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
            />
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/5 flex items-center justify-center mb-3 md:mb-4 text-2xl md:text-3xl">
              ☁️
            </div>
            <p className="text-white font-medium mb-1 text-sm md:text-base">Haz clic para seleccionar fotos</p>
            <p className="text-white/40 text-xs md:text-sm">o suelta aquí</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {files.map((file) => (
              <div key={file.id} className="relative group aspect-square">
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <img
                    src={file.preview}
                    alt="Preview"
                    className={`w-full h-full object-cover transition-all ${file.status === 'error' ? 'opacity-50 grayscale' : ''
                      } ${file.status === 'success' ? 'opacity-50' : ''}`}
                  />
                  {file.status === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                        ✓
                      </div>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 backdrop-blur-sm">
                      <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg">
                        ✕
                      </div>
                    </div>
                  )}

                  {/* Remove Button */}
                  {!isUploading && file.status !== 'success' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile Action Buttons - shown only on mobile */}
          {/* Mobile Action Buttons Component */}
          <UploadActions
            variant="mobile"
            files={files}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            onUpload={uploadFiles}
            onClear={() => setFiles([])}
          />
        </div>
      </div>

      {/* Upload/Success Modal */}
      <UploadStatusModal
        isUploading={isUploading}
        showSuccessModal={showSuccessModal}
        uploadProgress={uploadProgress}
        onNavigateToGallery={() => {
          // Clear cache so gallery fetches new photos
          sessionStorage.removeItem('galleryCache');
          navigate(isAdmin ? '/admin/mediacenter/gallery' : '/mediacenter/gallery');
        }}
      />
    </div>
  );
};

export default PhotoUpload;
