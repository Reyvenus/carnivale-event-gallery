import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import confetti from 'canvas-confetti';
import PropTypes from 'prop-types';
import './styles.css';

export default function GoldenTicket({ 
  guestName,
  eventDate,
  eventTime,
  eventLocation,
  eventAddress
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const canvasRef = useRef(null);
  const confettiIntervalRef = useRef(null);
  const myConfettiRef = useRef(null);

  const stopConfetti = useCallback(() => {
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }
  }, []);

  const startContinuousConfetti = useCallback(() => {
    if (!myConfettiRef.current) return;

    // Explosión inicial más grande
    myConfettiRef.current({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 },
      colors: ['#d4af37', '#f0db7d', '#c9a961', '#f4e4b0', '#b8860b']
    });

    // Confetti continuo cayendo
    confettiIntervalRef.current = setInterval(() => {
      if (!myConfettiRef.current) return;
      
      myConfettiRef.current({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.4 },
        colors: ['#d4af37', '#f0db7d', '#c9a961', '#f4e4b0']
      });
      myConfettiRef.current({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.4 },
        colors: ['#d4af37', '#f0db7d', '#c9a961', '#f4e4b0']
      });
    }, 100);
  }, []);

  useEffect(() => {
    if (isModalOpen && canvasRef.current) {
      // Configurar canvas confetti
      myConfettiRef.current = confetti.create(canvasRef.current, {
        resize: true,
        useWorker: true
      });
      
      // Delay de 0.5 segundos antes de iniciar el confetti
      const confettiTimeout = setTimeout(() => {
        startContinuousConfetti();
      }, 500);

      return () => {
        clearTimeout(confettiTimeout);
        stopConfetti();
      };
    }

    return () => {
      stopConfetti();
    };
  }, [isModalOpen, startContinuousConfetti, stopConfetti]);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    stopConfetti();
  }, [stopConfetti]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen, closeModal]);

  const modalContent = isModalOpen && (
    <div 
      className={`modal-overlay ${isModalOpen ? 'active' : ''}`}
      onClick={(e) => {
        if (e.target.className.includes('modal-overlay')) {
          closeModal();
        }
      }}
    >
      <button className="close-btn" onClick={closeModal}>
        ×
      </button>
      <canvas ref={canvasRef} id="confetti-canvas"></canvas>

      <div className="ticket-wrapper">
        <div className="golden-ticket">
          <div className="content">
            <p className="wonka-logo">Nuestra Boda</p>
            <h1 className="main-title">GOLDEN TICKET</h1>

            <div className="info-row">
              <div className="info-item">
                <p className="info-label">FECHA</p>
                <p className="info-value">{eventDate}</p>
              </div>
              <div className="info-item">
                <p className="info-label">HORA</p>
                <p className="info-value">{eventTime}</p>
              </div>
              <div className="info-item">
                <p className="info-label">LUGAR</p>
                <p className="info-value">{eventLocation}</p>
              </div>
            </div>

            <p className="guest-name">{guestName}</p>

            <div className="subtitle">CELEBREMOS JUNTOS</div>

            <p className="venue-details">
              {eventAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Botón para abrir el ticket */}
      <div className="golden-ticket-container">
        <button className="open-ticket-btn" onClick={openModal}>
          VER MI GOLDEN TICKET
        </button>
      </div>

      {/* Modal overlay usando createPortal para renderizar en body */}
      {modalContent && createPortal(modalContent, document.body)}
    </>
  );
}

GoldenTicket.propTypes = {
  guestName: PropTypes.string,
  eventDate: PropTypes.string,
  eventTime: PropTypes.string,
  eventLocation: PropTypes.string,
  eventAddress: PropTypes.string
};

GoldenTicket.defaultProps = {
  guestName: "María & Juan García",
  eventDate: "24 DE ENERO, 2026",
  eventTime: "4:00 PM",
  eventLocation: "SALÓN DE EVENTOS",
  eventAddress: "Tu lugar especial para celebrar"
};
