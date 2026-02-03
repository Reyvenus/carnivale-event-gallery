import React from 'react';


const UploadActions = ({
  files,
  isUploading,
  uploadProgress,
  onUpload,
  onClear,
  variant = 'desktop' // 'desktop' | 'mobile'
}) => {
  const isDisabled = files.length === 0 || isUploading;

  // Clases contenedor:
  // desktop: visible en sm+, oculto en sm- (mobile), layout horizontal
  // mobile: visible en sm- (mobile), oculto en sm+, layout vertical
  const containerClasses = variant === 'desktop'
    ? "hidden sm:flex items-center gap-3"
    : "sm:hidden flex flex-col gap-3 mt-6";

  // Estilos de botón Cancelar
  const cancelButtonClasses = variant === 'desktop'
    ? "px-4 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium"
    : "w-full px-4 py-2.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-medium";

  // Estilos de botón Subir
  const uploadButtonClasses = variant === 'desktop'
    ? "px-6 py-2 rounded-xl font-semibold transition-all items-center gap-2 border text-sm"
    : "w-full px-6 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2";

  // Estilos de estado (deshabilitado/habilitado)
  const stateStyles = isDisabled
    ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
    : 'border-transparent bg-gradient-to-r from-yellow-600 to-amber-600 text-white hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95';

  return (
    <div className={containerClasses}>
      {files.length > 0 && !isUploading && (
        <button
          onClick={onClear}
          className={cancelButtonClasses}
        >
          Cancelar
        </button>
      )}

      <button
        onClick={onUpload}
        disabled={isDisabled}
        className={`${uploadButtonClasses} ${stateStyles}`}
      >
        {isUploading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Subiendo ({uploadProgress.current}/{files.length})...</span>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span>Confirmar y Subir</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
};

export default UploadActions;
