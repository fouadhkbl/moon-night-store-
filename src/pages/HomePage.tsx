import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Star, Coins, Key, Sword, ArrowUpCircle, Gift, Users, Trophy, Swords, Calendar } from 'lucide-react';
import { GameCategory } from '../types';

export const HomePage = ({ onNavigate, onSelectCategory, onSearch, language }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void, onSearch: (q: string) => void, language: 'en' | 'fr' }) => {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const { current } = scrollContainerRef;
        const scrollAmount = 300;
        if (direction === 'left') {
            current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
  };

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
             [GameCategory.GIFT_CARD]: "Cards",
             [GameCategory.SUBSCRIPTION]: "Subscription"
         },
         compete: "Competitions",
         competeDesc: "Join Tournaments"
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
             [GameCategory.GIFT_CARD]: "Cartes",
             [GameCategory.SUBSCRIPTION]: "Abonnement"
         },
         compete: "Compétitions",
         competeDesc: "Rejoindre les Tournois"
     }
  };

  const text = t[language];

  return (
    <div className="animate-fade-in">
      {/* Increased min-height to 1050px and z-index to 30 to ensure full visibility and proper layering over the next section */}
      <section className="relative min-h-[1050px] flex items-center z-30">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-50"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0e14]"></div>
        </div>
        {/* Increased bottom padding to pb-72 to push the boundary well below the buttons */}
        <div className="container mx-auto px-4 relative z-20 pt-32 pb-72">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-600/40 text-blue-400 text-[11px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl">
              <Star className="w-4 h-4 fill-blue-400" /> {text.premium}
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-[9rem] font-black italic tracking-tighter text-white leading-[0.85] mb-10 uppercase">
              MOON <span className="text-blue-500">NIGHT</span><br />
              <span className="text-cyan-400">STORE</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-xl opacity-80">
              {text.desc}
            </p>
            
            <div className="flex flex-col gap-6 max-w-fit relative z-30">
              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={() => onNavigate('shop')}
                  className="h-[64px] bg-transparent border-2 border-red-600 hover:border-red-500 hover:bg-red-500 hover:text-white text-red-500 px-10 rounded-2xl font-black text-lg transition-all flex items-center gap-3 uppercase tracking-tighter shadow-lg shadow-red-600/10 hover:shadow-red-600/30"
                >
                  {text.browse} <ChevronRight className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={() => onNavigate('pointsShop')}
                  className="h-[64px] bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-10 rounded-2xl font-black text-lg transition-all flex items-center gap-3 uppercase tracking-tighter shadow-2xl shadow-purple-600/30"
                >
                  <Trophy className="w-5 h-5" /> Points Shop
                </button>
              </div>

              <div className="flex justify-center w-full">
                <button 
                    onClick={() => onNavigate('tournaments')}
                    className="h-[52px] bg-[#1e232e] border border-pink-500 hover:bg-pink-600 hover:border-pink-600 text-white px-10 rounded-xl font-black text-sm transition-all flex items-center gap-2 uppercase tracking-widest shadow-[0_0_15px_rgba(236,72,153,0.2)] hover:shadow-[0_0_25px_rgba(236,72,153,0.4)] active:scale-95 group relative z-40"
                >
                    <Swords className="w-4 h-4 text-pink-500 group-hover:text-white transition-colors" /> 
                    <span>{text.compete}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#0b0e14] relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-24 text-center md:text-left">
            <p className="text-blue-500 font-black uppercase text-[12px] tracking-[0.4em] mb-4">{text.depts}</p>
            <h2 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">{text.products}</h2>
          </div>
          
          <div className="relative group">
              {/* Navigation Arrows for PC */}
              <button 
                  onClick={() => scroll('left')}
                  className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-40 bg-[#1e232e] border border-gray-800 text-white p-4 rounded-full shadow-2xl hover:bg-blue-600 hover:border-blue-600 transition-all hidden md:flex items-center justify-center group-hover:scale-110 active:scale-95"
                  aria-label="Scroll Left"
              >
                  <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                  onClick={() => scroll('right')}
                  className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-40 bg-[#1e232e] border border-gray-800 text-white p-4 rounded-full shadow-2xl hover:bg-blue-600 hover:border-blue-600 transition-all hidden md:flex items-center justify-center group-hover:scale-110 active:scale-95"
                  aria-label="Scroll Right"
              >
                  <ChevronRight className="w-6 h-6" />
              </button>

              {/* Flex Container for Scrolling */}
              <div 
                  ref={scrollContainerRef} 
                  className="flex overflow-x-auto gap-6 pb-12 custom-scrollbar snap-x snap-mandatory scroll-smooth"
              >
                {[
                  { id: GameCategory.ACCOUNTS, icon: Users, label: text.cats[GameCategory.ACCOUNTS], color: 'from-pink-400/20' },
                  { id: GameCategory.COINS, icon: Coins, label: text.cats[GameCategory.COINS], color: 'from-yellow-400/20' },
                  { id: GameCategory.KEYS, icon: Key, label: text.cats[GameCategory.KEYS], color: 'from-cyan-400/20' },
                  { id: GameCategory.ITEMS, icon: Sword, label: text.cats[GameCategory.ITEMS], color: 'from-red-400/20' },
                  { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: text.cats[GameCategory.BOOSTING], color: 'from-green-400/20' },
                  { id: GameCategory.GIFT_CARD, icon: Gift, label: text.cats[GameCategory.GIFT_CARD], color: 'from-purple-400/20' },
                  { id: GameCategory.SUBSCRIPTION, icon: Calendar, label: text.cats[GameCategory.SUBSCRIPTION], color: 'from-blue-400/20' },
                ].map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }}
                    className="min-w-[200px] md:min-w-[240px] snap-center group relative bg-[#1e232e] border border-gray-800 p-10 rounded-[2.5rem] flex flex-col items-center gap-6 hover:border-blue-500 transition-all duration-500 overflow-hidden shadow-2xl hover:-translate-y-4"
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
        </div>
      </section>
    </div>
  );
};