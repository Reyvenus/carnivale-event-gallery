
const UploadStatusModal = ({
  isUploading,
  showSuccessModal,
  uploadProgress,
  onNavigateToGallery
}) => {
  if (!isUploading && !showSuccessModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all duration-500">
      <div className="bg-[#0a0a0a] border border-yellow-500/20 rounded-2xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(234,179,8,0.1)] relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent" />

        {isUploading ? (
          <>
            <div className="mb-8 flex justify-center">
              <div className="relative">
                <div className="text-7xl animate-pulse filter drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                  💃
                </div>
                {/* Decorative sparkles or circles could go here */}
                <div className="absolute -inset-4 border border-yellow-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
              </div>
            </div>

            <h3 className="text-2xl font-serif text-yellow-100 mb-2 tracking-wide font-light">
              Subiendo <span className="text-yellow-500 font-normal">Fotos</span>
            </h3>
            <p className="text-yellow-200/50 mb-8 text-sm uppercase tracking-widest font-light">
              Preparando la pista de baile...
            </p>

            <div className="relative w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-600 to-amber-400 h-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(234,179,8,0.4)]"
                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-3">
              <p className="text-yellow-500/40 text-[10px] uppercase tracking-widest">Cargando Fotos</p>
              <p className="text-yellow-200/60 text-xs font-medium tabular-nums">
                {uploadProgress.current} / {uploadProgress.total}
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="mb-8 flex justify-center">
              <div className="w-24 h-24 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-5xl shadow-[0_0_30px_rgba(234,179,8,0.15)] animate-[bounce_2s_infinite]">
                ✨
              </div>
            </div>

            <h3 className="text-2xl font-serif text-yellow-100 mb-2 tracking-wide font-light">
              ¡Fotos <span className="text-yellow-500 font-normal">Guardadas!</span>
            </h3>
            <p className="text-yellow-200/50 mb-10 text-sm font-light">
              Tus fotos ya forman parte de esta gran celebración.
            </p>

            <button
              onClick={() => {
                const isAdmin = window.location.pathname.startsWith('/admin');
                onNavigateToGallery(isAdmin);
              }}
              className="w-full py-4 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-xl font-bold hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
            >
              Ir a la Galería
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadStatusModal;
