import React from 'react';
import data from '../../../data/config.json';

export default function Bridegroom() {
  return (
    <div>
      <h2 className="text-xl leading-6 text-white font-bold mb-6 text-center">
        💍 Los Novios 💍
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {/* Novia */}
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <img
              src={data.pegantin.wanita.foto}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              alt={data.pegantin.wanita.nama}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          <div className="mt-3 text-center">
            <h4 className="text-base text-white font-bold">
              {data.pegantin.wanita.nama}
            </h4>
          </div>
        </div>

        {/* Novio */}
        <div className="relative group">
          <div className="relative overflow-hidden rounded-xl shadow-lg">
            <img
              src={data.pegantin.pria.foto}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              alt={data.pegantin.pria.nama}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          <div className="mt-3 text-center">
            <h4 className="text-base text-white font-bold">
              {data.pegantin.pria.nama}
            </h4>
          </div>
        </div>
      </div>
      
      {/* Padres de Elvis y Benji */}
      <div className="mt-6 text-center">
        <p className="text-white/70 text-sm mb-3">
          Orgullosos Padres de
        </p>
        <div className="flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐩</span>
            <span className="text-white text-base font-semibold">Elvis</span>
          </div>
          <span className="text-white/50 text-xl">•</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <span className="text-white text-base font-semibold">Benji</span>
          </div>
        </div>
      </div>
    </div>
  );
}
