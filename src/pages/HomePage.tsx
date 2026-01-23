
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Star, Coins, Key, Sword, ArrowUpCircle, Gift, Users, Trophy, Swords, Calendar, Crown } from 'lucide-react';
import { GameCategory } from '../types';
import { supabase } from '../supabaseClient';

export const HomePage = ({ onNavigate, onSelectCategory, onSearch, language }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void, onSearch: (q: string) => void, language: 'en' | 'fr' }) => {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVip, setIsVip] = useState(false);

  useEffect(() => {
      const checkVipStatus = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data } = await supabase.from('profiles').select('vip_level').eq('id', user.id).single();
              if (data && data.vip_level > 0) {
                  setIsVip(true);
              }
          }
      };
      checkVipStatus();
  }, []);

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
      {/* Hero Section - Updated to match screenshot */}
      <section className="relative min-h-[90vh] flex items-center z-30 bg-[#0b0e14]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* Using a darker arcade/neon image to match the vibe */}
          <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-40"
            alt="Arcade Background"
          />
          {/* Strong dark blue gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/80 to-blue-900/20"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0e14]/50 to-[#0b0e14]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20 pt-20 pb-40">
          <div className="max-w-4xl">
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#151a23] border border-blue-900/50 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-2xl">
              <Star className="w-3 h-3 fill-blue-400" /> {text.premium}
            </div>
            
            {/* Main Title - Stacked Typography matching screenshot */}
            {/* Adjusted font size for mobile (text-5xl) to prevent clipping */}
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black italic tracking-tighter leading-[0.9] mb-8 uppercase drop-shadow-2xl">
              <span className="text-gray-600">MOON</span><br />
              <span className="text-blue-900">NIGHT</span><br />
              <span className="text-cyan-500">STORE</span>
            </h1>
            
            <p className="text-xs md:text-base text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-[0.25em] max-w-xl opacity-80 border-l-2 border-blue-600 pl-6">
              {text.desc}
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => onNavigate('shop')}
                className="h-[50px] md:h-[60px] bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-10 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-3 uppercase tracking-widest shadow-2xl shadow-blue-600/20 group"
              >
                {text.browse} <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              {!isVip && (
                  <button 
                    onClick={() => onNavigate('elite')}
                    className="h-[50px] md:h-[60px] bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-white px-8 md:px-10 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl shadow-yellow-600/20 active:scale-95 border border-yellow-500/30"
                  >
                    <Crown className="w-4 h-4 text-yellow-200" /> Join Elite
                  </button>
              )}

              <button 
                onClick={() => onNavigate('tournaments')}
                className="h-[50px] md:h-[60px] bg-[#1e232e] border border-gray-800 hover:border-pink-500 text-white px-8 md:px-10 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl"
              >
                <Swords className="w-4 h-4 text-pink-500" /> {text.compete}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#0b0e14] relative z-10">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <p className="text-blue-600 font-black uppercase text-[10px] tracking-[0.4em] mb-2">{text.depts}</p>
                <h2 className="text-4xl md:text-7xl font-black text-white italic uppercase tracking-tighter leading-none">{text.products}</h2>
            </div>
            
            {/* Scroll Controls */}
            <div className="flex gap-2 hidden md:flex">
                <button 
                    onClick={() => scroll('left')}
                    className="bg-[#1e232e] border border-gray-800 hover:border-blue-500 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                    onClick={() => scroll('right')}
                    className="bg-[#1e232e] border border-gray-800 hover:border-blue-500 text-white p-4 rounded-xl transition-all shadow-lg active:scale-95"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
          </div>
          
          <div className="relative group">
              {/* Flex Container for Scrolling */}
              <div 
                  ref={scrollContainerRef} 
                  className="flex overflow-x-auto gap-6 pb-12 custom-scrollbar snap-x snap-mandatory scroll-smooth no-scrollbar"
              >
                {[
                  { id: GameCategory.ACCOUNTS, icon: Users, label: text.cats[GameCategory.ACCOUNTS], color: 'from-pink-500/20', accent: 'text-pink-500' },
                  { id: GameCategory.COINS, icon: Coins, label: text.cats[GameCategory.COINS], color: 'from-yellow-500/20', accent: 'text-yellow-500' },
                  { id: GameCategory.KEYS, icon: Key, label: text.cats[GameCategory.KEYS], color: 'from-cyan-500/20', accent: 'text-cyan-500' },
                  { id: GameCategory.ITEMS, icon: Sword, label: text.cats[GameCategory.ITEMS], color: 'from-red-500/20', accent: 'text-red-500' },
                  { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: text.cats[GameCategory.BOOSTING], color: 'from-green-500/20', accent: 'text-green-500' },
                  { id: GameCategory.GIFT_CARD, icon: Gift, label: text.cats[GameCategory.GIFT_CARD], color: 'from-purple-500/20', accent: 'text-purple-500' },
                  { id: GameCategory.SUBSCRIPTION, icon: Calendar, label: text.cats[GameCategory.SUBSCRIPTION], color: 'from-blue-500/20', accent: 'text-blue-500' },
                ].map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }}
                    className="min-w-[220px] snap-center group relative bg-[#1e232e] border border-gray-800 p-8 rounded-[2rem] flex flex-col items-center gap-6 hover:border-blue-500/50 transition-all duration-500 overflow-hidden shadow-2xl hover:-translate-y-2"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    <div className={`relative z-10 ${cat.accent} transition-all duration-500 group-hover:scale-110 p-4 bg-[#0b0e14] rounded-2xl border border-gray-800`}>
                      <cat.icon size={32} strokeWidth={2} />
                    </div>
                    <span className="relative z-10 font-black text-gray-400 group-hover:text-white uppercase tracking-[0.2em] text-[10px]">{cat.label}</span>
                  </button>
                ))}
              </div>
          </div>
        </div>
      </section>
    </div>
  );
};
