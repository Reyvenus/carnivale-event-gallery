import data from '../data/config.json';

export default function NotFound() {
  return (
    <div className="bg-black text-white min-h-screen">
      <div className="max-w-sm container mx-auto px-4">
        {/* Logo Netflix Style */}
        <div className="pt-10 mb-8">
          <img
            src="/images/bodafix.png"
            alt="BODAFIX"
            width={120}
            className="mx-auto"
          />
        </div>

        {/* Main Content */}
        <div className="py-10 text-center space-y-8">
          {/* Emoji grande */}
          <div className="text-8xl mb-6 animate-bounce">
            💔
          </div>

          {/* Título principal */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              ¡Oops!
            </h1>
            <p className="text-xl text-white/90">
              No encontramos tu invitación
            </p>
          </div>

          {/* Descripción */}
          <div className="bg-[#141414] rounded-lg p-6 space-y-4 text-left">
            <p className="text-white/80 leading-relaxed">
              Parece que el código de tu invitación no es válido o ha expirado. 
            </p>
            <p className="text-white/80 leading-relaxed">
              Por favor, verifica que hayas ingresado correctamente el enlace que 
              <span className="font-semibold text-white"> {data.pegantin.pria.panggilan} & {data.pegantin.wanita.panggilan} </span>
              te compartieron.
            </p>
          </div>

          {/* Qué hacer */}
          <div className="bg-[#141414] rounded-lg p-6 text-left space-y-4">
            <h3 className="text-white font-semibold text-lg flex items-center gap-2">
              <span>💡</span>
              <span>¿Qué puedes hacer?</span>
            </h3>
            <ul className="space-y-3 text-white/80 text-sm">
              <li className="flex items-start gap-3">
                <span className="text-red-500 flex-shrink-0 mt-1">▸</span>
                <span>Verifica que copiaste el enlace completo de tu invitación</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 flex-shrink-0 mt-1">▸</span>
                <span>Contacta a los novios si necesitas que te reenvíen tu invitación personal</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-500 flex-shrink-0 mt-1">▸</span>
                <span>Asegúrate de estar usando el link más reciente que te compartieron</span>
              </li>
            </ul>
          </div>

          {/* Footer con nombres */}
          <div className="pt-6 space-y-2">
            <div className="flex items-center justify-center gap-3 text-white/60">
              <span className="text-2xl">💒</span>
              <span className="text-lg font-semibold">
                {data.pegantin.pria.panggilan} & {data.pegantin.wanita.panggilan}
              </span>
              <span className="text-2xl">💒</span>
            </div>
            <p className="text-white/50 text-sm">
              {data.tanggal_pernikahan}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

