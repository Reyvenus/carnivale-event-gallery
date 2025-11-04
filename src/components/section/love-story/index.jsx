import React from 'react';
import data from '../../../data/config.json';

const LoveItem = ({ imageUrl, title, duration, description }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [showButton, setShowButton] = React.useState(false);
  const textRef = React.useRef(null);

  React.useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const height = textRef.current.scrollHeight;
      const lines = height / lineHeight;
      setShowButton(lines > 2);
    }
  }, [description]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <img
            className="w-full rounded-md object-cover"
            height={100}
            style={{
              maxHeight: '100px',
            }}
            src={imageUrl}
            alt="dummy"
          />
        </div>
        <div className="flex justify-center">
          <div className="my-auto">
            <p className="text-white mb-2 tracking-tighter">{title}</p>
            <p className="text-xs text-[#A3A1A1]">{duration}</p>
          </div>
        </div>
      </div>
      <div className="relative mt-2">
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? '' : 'max-h-[2.1rem]'}`}>
          <p 
            ref={textRef}
            className="text-[#A3A1A1] text-xs leading-relaxed"
          >
            {description}
          </p>
        </div>
        {!isExpanded && showButton && (
          <>
            {/* Gradiente de desvanecimiento sobre la segunda línea */}
            <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none"></div>
            {/* Botón Ver más */}
            <div className="relative mt-1 h-6 flex items-end justify-center pb-0.5">
              <button
                onClick={() => setIsExpanded(true)}
                className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
              >
                <span>Ver más</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
      {isExpanded && showButton && (
        <div className="flex justify-center mt-1">
          <button
            onClick={() => setIsExpanded(false)}
            className="text-white/80 hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            <span>Ver menos</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default function LoveStory() {
  return (
    <div>
      <h2 className="text-lg leading-5 text-white font-bold mb-4">
        Our Love Story
      </h2>
      <div className="space-y-4">
        {data.love_story.map((item, index) => (
          <LoveItem
            key={index}
            imageUrl={item.image_url}
            title={item.title}
            duration={item.duration}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
}
