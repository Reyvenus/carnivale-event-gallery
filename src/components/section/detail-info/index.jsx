import React from 'react';
import { createPortal } from 'react-dom';
import TitleInfo from '../title-info';
import BreakingNews from '../breaking-news';
import Bridegroom from '../bride-groom';
import LoveStory from '../love-story';
import OurGallery from '../our-gallery';
import WishSection from '../wish';
import Footer from '../footer';
import LocationAccordion from '../location-accordion';
import GiftAccordion from '../gift-accordion';
import GoldenTicket from '../golden-ticket';
import SongButton from '../../ui/song-button';
import data from '../../../data/config.json';

export default function DetailInfo() {
  const [isVideoLoading, setIsVideoLoading] = React.useState(true);

  return (
    <>
      <div className="space-y-5 pb-10">
        {/* Video preview estilo Netflix */}
        <div className="w-full bg-black py-4">
          <div className="relative w-full px-4">
            {/* Loading spinner estilo Netflix */}
            {isVideoLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black rounded-lg z-10">
                <div className="relative">
                  <div className="w-12 h-12 border-4 border-gray-800 border-t-red-600 rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            <video 
              className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-2xl mx-auto" 
              autoPlay 
              muted 
              playsInline
              loop
              onLoadedData={() => setIsVideoLoading(false)}
              onCanPlay={() => setIsVideoLoading(false)}
            >
              <source src={data.url_video} type="video/mp4" />
              Su Navegador no soporta esta Reproducción. Intente con otro.
            </video>
          </div>
        </div>
        <div className="px-4 space-y-4">
          <TitleInfo />
          {data.show_menu.breaking_news && <BreakingNews />}
          {data.show_menu.bride_and_groom && <Bridegroom />}
          {data.show_menu.love_story && <LoveStory />}
          {/* {data.show_menu.gallery && (
          <OurGallery gallery={data.gallery} show_menu={data.show_menu} />
        )} */}
        
          {/* Sección de ubicaciones con acordeón */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-white text-center mb-4">
              🌐 Ubicaciones del Evento
            </h2>
            <LocationAccordion
              title={data.locations.ceremony.title}
              time={data.locations.ceremony.time}
              address={data.locations.ceremony.address}
              mapUrl={data.locations.ceremony.mapUrl}
              mapsLink={data.locations.ceremony.mapsLink}
              icon={data.locations.ceremony.icon}
            />
            <LocationAccordion
              title={data.locations.reception.title}
              time={data.locations.reception.time}
              address={data.locations.reception.address}
              mapUrl={data.locations.reception.mapUrl}
              mapsLink={data.locations.reception.mapsLink}
              icon={data.locations.reception.icon}
            />
          </div>

          {/* Sección de regalos */}
          <div className="space-y-3">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-white mb-2">
                🎁 Regalos
              </h2>
              <p className="text-sm text-white/80 leading-relaxed px-2">
                {data.gifts.message}{' '}
                <span className="font-semibold text-white text-lg">
                  ${data.gifts.costPerPerson}
                </span>
                {' '}por persona.
              </p>
              <p className="text-xs text-white/70 px-4 mt-2 leading-relaxed">
                💬 <span className="font-medium">Tip:</span> Podés hacerlo en 2 cuotas si te resulta más cómodo. Si tenés algún inconveniente, no dudes en escribirnos! 😊
              </p>
              <p className="text-xs text-white/60 px-4 italic">
                💳 Puedes realizar la transferencia a cualquiera de las siguientes cuentas:
              </p>
            </div>
            <GiftAccordion
              name={data.gifts.groom.name}
              bankName={data.gifts.groom.bankName}
              cbu={data.gifts.groom.cbu}
              alias={data.gifts.groom.alias}
              icon={data.gifts.groom.icon}
              whatsappNumber={data.gifts.groom.whatsappNumber}
              whatsappMessage={data.gifts.groom.whatsappMessage}
            />
            <GiftAccordion
              name={data.gifts.bride.name}
              bankName={data.gifts.bride.bankName}
              cbu={data.gifts.bride.cbu}
              alias={data.gifts.bride.alias}
              icon={data.gifts.bride.icon}
              whatsappNumber={data.gifts.bride.whatsappNumber}
              whatsappMessage={data.gifts.bride.whatsappMessage}
            />
          </div>

          {/* Golden Ticket Button */}
          <GoldenTicket 
            guestName={`${data.pegantin.pria.panggilan} & ${data.pegantin.wanita.panggilan}`}
            eventDate={data.tanggal_pernikahan.toUpperCase()}
            eventTime={data.locations.reception.time}
            eventLocation="NIZA EVENTOS"
            eventAddress={data.locations.reception.address}
          />

          {data.show_menu.wish && import.meta.env.VITE_APP_TABLE_NAME ? (
            <WishSection />
          ) : null}
        </div>
        <Footer />
      </div>
      {createPortal(<SongButton />, document.body)}
    </>
  );
}
