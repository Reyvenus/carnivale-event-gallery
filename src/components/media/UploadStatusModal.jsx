
const UploadStatusModal = ({
  isUploading,
  showSuccessModal,
  uploadProgress,
  onNavigateToGallery
}) => {
  if (!isUploading && !showSuccessModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
        {isUploading ? (
          <>
            <div className="mb-6 flex justify-center">
              <div className="text-6xl animate-bounce">🤵👰</div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Subiendo recuerdos...</h3>
            <p className="text-white/60 mb-6">Por favor espera un momento mientras guardamos tus fotos.</p>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
            <p className="text-white/40 text-sm mt-2">{uploadProgress.current} de {uploadProgress.total} fotos</p>
          </>
        ) : (
          <>
            <div className="mb-6 flex justify-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-4xl shadow-lg shadow-green-500/30">
                🎉
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">¡Fotos Cargadas!</h3>
            <p className="text-white/60 mb-8">Tus recuerdos se han guardado correctamente en la galería.</p>
            <button
              onClick={onNavigateToGallery}
              className="w-full py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              Ir a Galería
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadStatusModal;
