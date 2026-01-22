import React from 'react';
import { ChevronRight, Star, Coins, Key, Sword, ArrowUpCircle, Gift, Users, Trophy, Swords } from 'lucide-react';
import { GameCategory } from '../types';

export const HomePage = ({ onNavigate, onSelectCategory, onSearch, language }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void, onSearch: (q: string) => void, language: 'en' | 'fr' }) => {

  const t = {
     en: {
         premium: "Premium Gaming Marketplace",
         desc: "Elite gaming inventory, instant fulfillment, and 24/7 security since 2014.",
         browse: "Browse Full Shop",
         depts: "Elite Departments",
         products: "Global Products",
         cats: {
             [GameCategory.ACCOUNTS]: "Accounts",
             [GameCategory.COINS]: "Coins",
             [GameCategory.KEYS]: "Keys",
             [GameCategory.ITEMS]: "Items",
             [GameCategory.BOOSTING]: "Boosting",
             [GameCategory.GIFT_CARD]: "Cards"
         }
     },
     fr: {
         premium: "Marché Gaming Premium",
         desc: "Inventaire d'élite, livraison instantanée et sécurité 24/7 depuis 2014.",
         browse: "Voir la Boutique",
         depts: "Départements d'Élite",
         products: "Produits Mondiaux",
         cats: {
             [GameCategory.ACCOUNTS]: "Comptes",
             [GameCategory.COINS]: "Pièces",
             [GameCategory.KEYS]: "Clés",
             [GameCategory.ITEMS]: "Objets",
             [GameCategory.BOOSTING]: "Boost",
             [GameCategory.GIFT_CARD]: "Cartes"
         }
     }
  };

  const text = t[language];

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
              <Star className="w-4 h-4 fill-blue-400" /> {text.premium}
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter text-white leading-[0.85] mb-10 uppercase">
              MOON <span className="text-blue-500">NIGHT</span><br />
              <span className="text-cyan-400">STORE</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-xl opacity-80">
              {text.desc}
            </p>
            
            <div className="flex flex-wrap gap-6 items-center">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-transparent border-2 border-gray-700 hover:border-white hover:bg-white hover:text-black text-white px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 uppercase tracking-tighter"
              >
                {text.browse} <ChevronRight className="w-5 h-5" />
              </button>
              
              <button 
                onClick={() => onNavigate('pointsShop')}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-12 py-4 rounded-2xl font-black text-lg transition-all flex items-center gap-3 uppercase tracking-tighter shadow-2xl shadow-purple-600/30"
              >
                <Trophy className="w-5 h-5" /> Points Shop
              </button>

              <button 
                onClick={() => onNavigate('tournaments')}
                className="bg-pink-900/10 hover:bg-pink-600 text-pink-400 hover:text-white border border-pink-500/30 px-8 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 uppercase tracking-widest shadow-xl"
              >
                <Swords className="w-4 h-4" /> Competitions
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#0b0e14]">
        <div className="container mx-auto px-4">
          <div className="mb-24 text-center md:text-left">
            <p className="text-blue-500 font-black uppercase text-[12px] tracking-[0.4em] mb-4">{text.depts}</p>
            <h2 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">{text.products}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { id: GameCategory.ACCOUNTS, icon: Users, label: text.cats[GameCategory.ACCOUNTS], color: 'from-pink-400/20' },
              { id: GameCategory.COINS, icon: Coins, label: text.cats[GameCategory.COINS], color: 'from-yellow-400/20' },
              { id: GameCategory.KEYS, icon: Key, label: text.cats[GameCategory.KEYS], color: 'from-cyan-400/20' },
              { id: GameCategory.ITEMS, icon: Sword, label: text.cats[GameCategory.ITEMS], color: 'from-red-400/20' },
              { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: text.cats[GameCategory.BOOSTING], color: 'from-green-400/20' },
              { id: GameCategory.GIFT_CARD, icon: Gift, label: text.cats[GameCategory.GIFT_CARD], color: 'from-purple-400/20' },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }}
                className="group relative bg-[#1e232e] border border-gray-800 p-10 rounded-[2.5rem] flex flex-col items-center gap-6 hover:border-blue-500 transition-all duration-500 overflow-hidden shadow-2xl hover:-translate-y-4"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10 text-gray-500 group-hover:text-blue-400 transition-all duration-500 group-hover:scale-125">
                  <cat.icon size={48} strokeWidth={1.5} />
                </div>
                <span className="relative z-10 font-black text-gray-400 group-hover:text-white uppercase tracking-[0.3em] text-[10px]">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};