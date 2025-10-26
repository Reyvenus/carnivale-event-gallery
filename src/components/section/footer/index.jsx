import React from 'react';

export default function Footer() {
  return (
    <div>
      <div className="mt-8 flex flex-col  items-center">
        <p className="text-white text-sm">
          ¡Gracias por ver haber llegado hasta aqui!
        </p>
        <p className="text-white text-sm">¡No podemos esperar para verte de nuevo! 💫</p>
      </div>
      <div className="mt-8 flex flex-col items-center">
        <p className="text-[10px] text-[#A3A1A1] mb-6">
          E-Invitación hecha con ♥{' '}
          <a
            className="underline"
            target="_blank"
            rel="noreferrer"
            href=""
          >
          </a>
        </p>
      </div>
    </div>
  );
}
