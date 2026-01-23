import React from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import DetailInfo from '../detail-info';
import data from '../../../data/config.json';

const TagItem = ({ title }) => {
  return (
    <li className="bg-[#4D4D4D] py-1 px-2 rounded-xl text-xs text-white">
      {title}
    </li>
  );
};

TagItem.propTypes = {
  title: PropTypes.string.isRequired
};

function Thumbnail({ guestData }) {
  const navigate = useNavigate();
  const [isOpenDetail, setIsOpenDetail] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  if (isOpenDetail) {
    return (
      <div className="animate-fade-in">
        <DetailInfo guestData={guestData} />
      </div>
    );
  }
  return (
    <div
      style={{
        backgroundImage: `url(${data.thumbnail_image_url})`,
        marginTop: '-80px',
      }}
      className={`min-h-screen bg-cover bg-center bg-no-repeat flex flex-col justify-end mb-10 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
    >
      <div className="pb-10  pt-2 bg-gradient-to-b from-transparent via-black to-black">
        <div className="px-5 mb-10 space-y-2">
          <img
            src="/images/bodafix.png"
            alt="BODAFIX"
            width={56}
            height={15}
          />
          <div>
            <h1 className="font-bold text-3xl leading-none">
              {data.pegantin.wanita.panggilan} & {data.pegantin.pria.panggilan}:{' '}
              <br />
              Antes del dia D
            </h1>
          </div>
          <div>
            <div className="flex gap-3 items-center">
              <span className="bg-[#E50913] text-xs text-white rounded-md px-2 py-1">
                Proximamente
              </span>
              <p className="text-sm">{data.tanggal_pernikahan}</p>
            </div>
          </div>
          <div>
            <ul className="flex gap-2 items-center">
              <TagItem title="#romantic" />
              <TagItem title="#getmarried" />
              <TagItem title="#family" />
              <TagItem title="#documenter" />
            </ul>
          </div>
        </div>
        <div className="w-full flex flex-col items-center gap-3">
          <button
            onClick={() => {
              setIsAnimating(true);
              // Scroll suave hacia arriba
              window.scrollTo({ top: 0, behavior: 'smooth' });
              setTimeout(() => setIsOpenDetail(true), 300);
            }}
            className="flex items-center gap-2 
                       bg-white text-black 
                       px-8 py-3 rounded-full
                       font-semibold text-base
                       hover:bg-white/90 hover:scale-105 
                       active:scale-95
                       transition-all duration-200 
                       animate-pulse-slow
                       shadow-lg"
          >
            <span className="uppercase">Ver Detalles</span>
            <svg
              className="w-5 h-5 rotate-180"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 8"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7 7.674 1.3a.91.91 0 0 0-1.348 0L1 7"
              ></path>
            </svg>
          </button>

          <button
            onClick={() => navigate('/media')}
            className="flex items-center gap-2 
                       bg-white/10 text-white 
                       px-6 py-2 rounded-full
                       font-medium text-sm
                       hover:bg-white/20 hover:scale-105 
                       backdrop-blur-sm
                       transition-all duration-200"
            disabled={true}
          >
            <span>📸</span>
            <span>Galería de Fotos</span>
          </button>
        </div>
      </div>
    </div>
  );
}

Thumbnail.propTypes = {
  guestData: PropTypes.object
};

export default Thumbnail;
