import React from 'react';
import { ChevronRight, Star, Coins, Zap, Sword, ArrowUpCircle, Gift } from 'lucide-react';
import { GameCategory } from '../types';

export const HomePage = ({ onNavigate, onSelectCategory }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void }) => {
  return (
    <div className="animate-fade-in">
      <section className="relative h-[750px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-50"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0e14]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-600/40 text-blue-400 text-[11px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl">
              <Star className="w-4 h-4 fill-blue-400" /> Premium Gaming Marketplace
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter text-white leading-[0.85] mb-10 uppercase">
              MOON <span className="text-blue-500">NIGHT</span><br />
              <span className="text-cyan-400">STORE</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-xl opacity-80">
              Elite gaming inventory, instant fulfillment, and 24/7 security since 2014.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-6 rounded-3xl font-black text-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex items-center gap-4 uppercase tracking-tighter"
              >
                Browse Shop <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#0b0e14]">
        <div className="container mx-auto px-4">
          <div className="mb-24 text-center md:text-left">
            <p className="text-blue-500 font-black uppercase text-[12px] tracking-[0.4em] mb-4">Elite Departments</p>
            <h2 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">Global Inventory</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { id: GameCategory.COINS, icon: Coins, label: 'Coins', color: 'from-yellow-400/20' },
              { id: GameCategory.TOP_UP, icon: Zap, label: 'Top-Ups', color: 'from-blue-400/20' },
              { id: GameCategory.ITEMS, icon: Sword, label: 'Items', color: 'from-red-400/20' },
              { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: 'Boosting', color: 'from-green-400/20' },
              { id: GameCategory.GIFT_CARD, icon: Gift, label: 'Cards', color: 'from-purple-400/20' },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }}
                className="group relative bg-[#1e232e] border border-gray-800 p-12 rounded-[3rem] flex flex-col items-center gap-8 hover:border-blue-500 transition-all duration-500 overflow-hidden shadow-2xl hover:-translate-y-4"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10 text-gray-500 group-hover:text-blue-400 transition-all duration-500 group-hover:scale-125">
                  <cat.icon size={64} strokeWidth={1.5} />
                </div>
                <span className="relative z-10 font-black text-gray-400 group-hover:text-white uppercase tracking-[0.3em] text-[11px]">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};