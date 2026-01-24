
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Star, Coins, Key, Sword, ArrowUpCircle, Gift, Users, Trophy, Swords, Calendar, Crown, TrendingUp, Sparkles, ShoppingCart, Zap, ShieldCheck, Headphones, Cpu, Scan } from 'lucide-react';
import { GameCategory, Product } from '../types';
import { supabase } from '../supabaseClient';

export const HomePage = ({ onNavigate, onSelectCategory, onSearch, language }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void, onSearch: (q: string) => void, language: 'en' | 'fr' }) => {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVip, setIsVip] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [aiPicks, setAiPicks] = useState<Product[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
      const fetchData = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data } = await supabase.from('profiles').select('vip_level').eq('id', user.id).single();
              if (data && data.vip_level > 0) setIsVip(true);
          }
          const { data: products } = await supabase.from('products').select('*').eq('is_trending', true).eq('is_hidden', false).limit(4).order('created_at', { ascending: false });
          if (products) setTrendingProducts(products);

          setAnalyzing(true);
          setTimeout(async () => {
              const { data: aiData } = await supabase.from('products').select('*').eq('is_hidden', false).limit(4);
              if (aiData) setAiPicks(aiData);
              setAnalyzing(false);
          }, 800);
      };
      fetchData();
  }, []);

  const t = {
     en: {
         premium: "Premium Gaming Hub",
         browse: "Explore Shop",
         depts: "Elite Categories",
         trending: "Hot Items",
         aiTitle: "Moon AI Selection"
     },
     fr: {
         premium: "Hub Gaming Premium",
         browse: "Explorer la Boutique",
         depts: "Catégories d'Élite",
         trending: "Articles Chauds",
         aiTitle: "Sélection Moon AI"
     }
  }[language];

  return (
    <div className="animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center z-30 bg-[#0b0e14] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-10" alt="" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mb-4">
              <Star className="w-2.5 h-2.5 fill-blue-400" /> {t.premium}
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none mb-6 uppercase">
              <span className="text-white">MOON</span> <span className="text-blue-600">NIGHT</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-3xl md:text-5xl">MARKETPLACE</span>
            </h1>
            <div className="flex gap-3">
              <button onClick={() => onNavigate('shop')} className="h-12 bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl font-black text-xs transition-all flex items-center gap-2 uppercase tracking-widest shadow-xl">
                {t.browse} <ChevronRight className="w-4 h-4" />
              </button>
              {!isVip && (
                  <button onClick={() => onNavigate('elite')} className="h-12 bg-yellow-600/20 border border-yellow-600/30 text-yellow-500 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-600/30 transition-all">
                    <Crown className="w-3.5 h-3.5" /> Elite
                  </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Compact Categories */}
      <section className="py-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-white italic uppercase tracking-tighter flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" /> {t.depts}
            </h2>
        </div>
        <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
            {[
                { id: GameCategory.ACCOUNTS, icon: Users, label: 'Accounts', color: 'text-pink-500' },
                { id: GameCategory.COINS, icon: Coins, label: 'Coins', color: 'text-yellow-500' },
                { id: GameCategory.KEYS, icon: Key, label: 'Keys', color: 'text-cyan-500' },
                { id: GameCategory.ITEMS, icon: Sword, label: 'Items', color: 'text-red-500' },
                { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: 'Boosting', color: 'text-green-500' },
                { id: GameCategory.GIFT_CARD, icon: Gift, label: 'Cards', color: 'text-purple-500' }
            ].map(cat => (
                <button key={cat.id} onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }} className="min-w-[120px] bg-[#151a23] border border-gray-800 p-4 rounded-2xl flex flex-col items-center gap-2 hover:border-gray-600 transition-all shrink-0">
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                    <span className="font-black text-gray-400 text-[8px] uppercase tracking-widest">{cat.label}</span>
                </button>
            ))}
        </div>
      </section>

      {/* AI Picks */}
      <section className="py-8 container mx-auto px-4">
          <h2 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> {t.aiTitle}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {aiPicks.map(p => (
                  <div key={p.id} onClick={() => { onSearch(p.name); onNavigate('shop'); }} className="bg-[#151a23] rounded-2xl border border-gray-800 overflow-hidden cursor-pointer group transition-all">
                      <div className="h-32 bg-black relative">
                          <img src={p.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
                      </div>
                      <div className="p-3">
                          <h3 className="text-white font-bold text-xs truncate mb-1">{p.name}</h3>
                          <p className="text-yellow-400 font-black italic text-sm">{p.price.toFixed(2)} DH</p>
                      </div>
                  </div>
              ))}
          </div>
      </section>
    </div>
  );
};
