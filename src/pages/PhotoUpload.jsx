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

  // Empezamos en true para evitar pantalla negra en rutas públicas
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, current: 0 });
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      const auth = localStorage.getItem('adminAuth');
      if (auth !== 'true') {
        navigate('/admin');
      }
    }
  }, [navigate, isAdmin]);

  // Limpieza de memoria para las previews
  useEffect(() => {
    return () => {
      files.forEach(file => {
        if (file.preview) URL.revokeObjectURL(file.preview);
      });
    };
  }, []);

  // PROTECCIÓN: Wake Lock API
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      if (isUploading && 'wakeLock' in navigator) {
        try {
          wakeLock = await navigator.wakeLock.request('screen');
        } catch (err) {
          console.warn('Wake Lock rejected:', err);
        }
      }
    };

    if (isUploading) requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [isUploading]);

  // PROTECCIÓN: BeforeUnload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUploading) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUploading]);

  const handleFileSelect = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsProcessing(true);

    try {
      const fileArray = Array.from(e.target.files);
      const processedFiles = await Promise.all(
        fileArray.map(async (file) => {
          try {
            const arrayBuffer = await file.arrayBuffer();
            const blob = new Blob([arrayBuffer], { type: file.type });
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

      const validFiles = processedFiles.filter(f => f !== null);
      if (validFiles.length > 0) {
        setFiles(prev => [...prev, ...validFiles]);
      }
      e.target.value = '';
    } finally {
      setIsProcessing(false);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const removed = prev.find(f => f.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter(f => f.id !== id);
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
        continue;
      }

      try {
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(fileObj.file, options);

        const { original, thumbnail } = await getSignedUploadUrls(
          fileObj.file.name,
          fileObj.file.type,
          compressedFile.type
        );

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
        setFiles(prev => prev.map(file => file.id === fileObj.id
          ? { ...file, status: 'error', errorMessage: error.message }
          : file)
        );
      }

      setUploadProgress(prev => ({ ...prev, current: i + 1 }));
    }

    setIsUploading(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden font-sans">
      {/* Background - Fixed */}
      <div
        className="fixed inset-0 bg-[length:100%_auto] bg-no-repeat bg-top"
        style={{ backgroundImage: `url('/images/ablande.png')` }}
      />
      <div className="fixed inset-0 bg-black/90" />

      <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8">
        {/* Header - Gold Theme */}
        <div className="flex flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="w-12 h-12 rounded-full border border-yellow-500/20 bg-black/40 flex items-center justify-center hover:bg-yellow-500/10 transition-all text-yellow-500/80 shrink-0 backdrop-blur-md"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-3xl font-serif text-yellow-100 tracking-wider font-light drop-shadow-md">
                Subir <span className="text-yellow-500 font-semibold">Fotos</span>
              </h1>
              <p className="text-yellow-200/50 text-xs uppercase tracking-[0.2em] mt-1">Comparte tus Recuerdos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAdmin ? '/admin/gallery' : '/gallery')}
              className="px-4 py-2 border border-yellow-500/30 text-yellow-200/80 hover:text-white hover:bg-yellow-500/10 transition-all text-sm font-medium flex items-center gap-2 backdrop-blur-md uppercase tracking-wider rounded-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Galería</span>
            </button>

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

        {/* Content Area */}
        <div className="bg-black/40 border border-yellow-500/10 backdrop-blur-xl rounded-2xl p-6 min-h-[60vh] flex flex-col shadow-2xl">
          {/* Drop Zone */}
          <div
            onClick={() => !isUploading && !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed border-yellow-500/20 rounded-xl p-8 mb-8 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-500/50 hover:bg-yellow-500/5'
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
            <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mb-4 text-4xl text-yellow-300 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
              ✨
            </div>
            <p className="text-yellow-100 font-serif text-xl mb-1">Haz clic para seleccionar fotos</p>
            <p className="text-yellow-500/40 text-sm uppercase tracking-[0.2em]">Inmortaliza el momento</p>
          </div>

          {/* Grid Layout: Fixed 4 Column Grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {files.map((file) => {
              return (
                <div
                  key={file.id}
                  className="relative group overflow-hidden bg-black/50 border border-yellow-500/10 shadow-lg col-span-1 aspect-square rounded-lg"
                >
                  <img
                    src={file.preview}
                    alt="Preview"
                    className={`w-full h-full object-cover transition-all duration-500 ${file.status === 'error' ? 'grayscale opacity-30' : ''
                      } ${file.status === 'success' ? 'opacity-40' : 'group-hover:scale-110'}`}
                  />

                  {/* Status Overlays */}
                  {file.status === 'success' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-yellow-900/20 backdrop-blur-[2px]">
                      <div className="w-10 h-10 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center text-black font-bold">
                        ✓
                      </div>
                    </div>
                  )}

                  {file.status === 'error' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 backdrop-blur-[2px]">
                      <div className="w-10 h-10 rounded-full bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] flex items-center justify-center text-white font-bold">
                        ✕
                      </div>
                    </div>
                  )}

                  {/* Delete Button */}
                  {!isUploading && file.status !== 'success' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100 backdrop-blur-md border border-white/20"
                    >
                      ✕
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Actions */}
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

      <UploadStatusModal
        isUploading={isUploading}
        showSuccessModal={showSuccessModal}
        uploadProgress={uploadProgress}
        onNavigateToGallery={(isRedirectAdmin) => {
          sessionStorage.removeItem('galleryCache');
          navigate(isRedirectAdmin ? '/admin/gallery' : '/gallery');
        }}
      />
    </div>
  );
};

export default PhotoUpload;
