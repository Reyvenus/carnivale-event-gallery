
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import imageCompression from 'browser-image-compression';


const PhotoUpload = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ total: 0, current: 0 });
  const fileInputRef = useRef(null);

  console.log("files", files);
  console.log("uploadProgress", uploadProgress);

  useEffect(() => {
    // Si estamos en ruta de admin, verificamos auth
    if (isAdmin) {
      const auth = localStorage.getItem('adminAuth');
      if (auth === 'true') {
        setIsAuthenticated(true);
      } else {
        navigate('/admin');
      }
    } else {
      // Acceso público desde /media/upload
      setIsAuthenticated(true);
    }

    // Limpiamos la memoria al limpiar el componente
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [navigate, isAdmin]);

  const handleFileSelect = (e) => {
    if (e.target.files) {
      console.log("e.target.files", e.target.files);
      console.log("e.target", e.target);
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
        status: 'pending' // pending, uploading, success, error
      }));
      console.log("newFiles", newFiles);
      setFiles(prev => [...prev, ...newFiles]);
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

      // Actualizamos el estado uploading
      setFiles(prev => prev.map(file => file.id === fileObj.id
        ? { ...file, status: 'uploading' }
        : file));

      try {
        // 1. Comprimimos para el Thumbnail primero
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true
        };
        const compressedFile = await imageCompression(fileObj.file, options);

        // 2. Obtenemos las URLs firmadas del Backend con los tipos de contenido correctos
        const signResponse = await fetch('/api/sign-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: fileObj.file.name,
            originalContentType: fileObj.file.type,
            thumbnailContentType: compressedFile.type
          })
        });

        if (!signResponse.ok) throw new Error('Failed to get upload signature');

        const { original, thumbnail } = await signResponse.json();

        // 3. Subimos ambos archivos (PUT a S3 directamente)
        await Promise.all([
          // Subimos Original
          fetch(original.url, {
            method: 'PUT',
            body: fileObj.file,
            headers: { 'Content-Type': fileObj.file.type }
          }),
          // Subimos Thumbnail
          fetch(thumbnail.url, {
            method: 'PUT',
            body: compressedFile,
            headers: { 'Content-Type': compressedFile.type }
          })
        ]);

        setFiles(prev => prev.map(file => file.id === fileObj.id
          ? { ...file, status: 'success' }
          : file)
        );
      } catch (error) {
        console.error("Upload error:", error);
        setFiles(prev => prev.map(file => file.id === fileObj.id
          ? { ...file, status: 'error' }
          : file)
        );
      }

      setUploadProgress(prev => ({ ...prev, current: prev.current + 1 }));
    }
    setIsUploading(false);

    // Si todo salió bien, redirigir a la galería
    setTimeout(() => {
      // Clear cache so gallery fetches new photos
      sessionStorage.removeItem('galleryCache');
      navigate(isAdmin ? '/admin/media/gallery' : '/media/gallery');
    }, 1000);
  };

  if (!isAuthenticated && isAdmin) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header with Nav */}
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
              <h1 className="text-2xl font-bold text-white">Subir Fotos</h1>
              <p className="text-white/50 text-sm">Carga imágenes a la galería</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isAdmin ? '/admin/media/gallery' : '/media/gallery')}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span className="hidden sm:inline">Ir a Galería</span>
            </button>

            {files.length > 0 && !isUploading && (
              <button
                onClick={() => setFiles([])}
                className="px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={uploadFiles}
              disabled={files.length === 0 || isUploading}
              className={`px-6 py-2 rounded-xl font-semibold transition-all flex items-center gap-2 ${files.length === 0 || isUploading
                ? 'bg-white/10 text-white/30 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 active:scale-95'
                }`}
            >
              {isUploading
                ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Subiendo ({uploadProgress.current}/{files.length})...</span>
                  </>
                )
                :
                (
                  <>
                    <span>Confirmar y Subir</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </>
                )}
            </button>
          </div>
        </div>

        {/* content */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 min-h-[60vh] flex flex-col">

          {/* File Selection Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed border-white/10 rounded-2xl p-8 mb-6 flex flex-col items-center justify-center cursor-pointer transition-all ${isUploading ? 'opacity-50 pointer-events-none' : 'hover:border-purple-500/50 hover:bg-white/5'
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
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-3xl">
              ☁️
            </div>
            <p className="text-white font-medium mb-1">Haz clic para seleccionar fotos</p>
            <p className="text-white/40 text-sm">o suelta aquí</p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => (
              <div key={file.id} className="relative group aspect-square">
                <div className="absolute inset-0 rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <img
                    src={file.preview}
                    alt="Preview"
                    className={`w-full h-full object-cover transition-all ${file.status === 'error' ? 'opacity-50 grayscale' : ''
                      } ${file.status === 'success' ? 'opacity-50' : ''}`}
                  />

                  {/* Status Overlays */}
                  {file.status === 'uploading' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}

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
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;
