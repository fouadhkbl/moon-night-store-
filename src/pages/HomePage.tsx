
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Star, Coins, Key, Sword, ArrowUpCircle, Gift, Users, Trophy, Swords, Calendar, Crown, TrendingUp, Sparkles, ShoppingCart, Zap, ShieldCheck, Headphones } from 'lucide-react';
import { GameCategory, Product } from '../types';
import { supabase } from '../supabaseClient';

export const HomePage = ({ onNavigate, onSelectCategory, onSearch, language }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void, onSearch: (q: string) => void, language: 'en' | 'fr' }) => {
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isVip, setIsVip] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  useEffect(() => {
      const fetchData = async () => {
          // Check VIP
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
              const { data } = await supabase.from('profiles').select('vip_level').eq('id', user.id).single();
              if (data && data.vip_level > 0) {
                  setIsVip(true);
              }
          }

          // Fetch Trending
          const { data: products } = await supabase
            .from('products')
            .select('*')
            .eq('is_trending', true)
            .eq('is_hidden', false)
            .limit(4)
            .order('created_at', { ascending: false });
          
          if (products) setTrendingProducts(products);
      };
      fetchData();
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
         trending: "Trending Now",
         viewItem: "View Item",
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
         competeDesc: "Join Tournaments",
         servicesTitle: "Our Services",
         deliveryTitle: "Instant Delivery",
         deliveryDesc: "Get your items automatically within seconds of purchase.",
         secureTitle: "Secure Payments",
         secureDesc: "100% encrypted transactions with buyer protection guarantee.",
         supportTitle: "24/7 Support",
         supportDesc: "Our team is always online to help you with any issues."
     },
     fr: {
         premium: "Marché Gaming Premium",
         desc: "Inventaire d'élite, livraison instantanée et sécurité 24/7 depuis 2014.",
         browse: "Voir la Boutique",
         depts: "Départements d'Élite",
         products: "Produits Mondiaux",
         trending: "Tendance Actuelle",
         viewItem: "Voir l'article",
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
         competeDesc: "Rejoindre les Tournois",
         servicesTitle: "Nos Services",
         deliveryTitle: "Livraison Instantanée",
         deliveryDesc: "Recevez vos articles automatiquement quelques secondes après l'achat.",
         secureTitle: "Paiements Sécurisés",
         secureDesc: "Transactions 100% cryptées avec garantie de protection.",
         supportTitle: "Support 24/7",
         supportDesc: "Notre équipe est toujours en ligne pour vous aider."
     }
  };

  const text = t[language];

  return (
    <div className="animate-fade-in pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center z-30 bg-[#0b0e14] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-20 scale-105 animate-[pulse_10s_ease-in-out_infinite]"
            alt="Gaming Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/90 to-blue-900/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b0e14]/60 to-[#0b0e14]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20 pt-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 shadow-[0_0_20px_rgba(59,130,246,0.2)] backdrop-blur-md">
              <Star className="w-3 h-3 fill-blue-400" /> {text.premium}
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-9xl font-black italic tracking-tighter leading-[0.9] mb-8 uppercase drop-shadow-2xl">
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">MOON</span><br />
              <span className="text-blue-600">NIGHT</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-b from-cyan-400 to-cyan-700">STORE</span>
            </h1>
            
            <p className="text-xs md:text-sm text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-lg opacity-80 border-l-4 border-blue-600 pl-6">
              {text.desc}
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <button 
                onClick={() => onNavigate('shop')}
                className="h-[60px] md:h-[80px] bg-blue-600 hover:bg-blue-700 text-white px-10 md:px-16 rounded-2xl font-black text-sm md:text-xl transition-all flex items-center gap-4 uppercase tracking-widest shadow-[0_0_40px_rgba(37,99,235,0.5)] group hover:scale-105 active:scale-95"
              >
                {text.browse} <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
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
                className="h-[50px] md:h-[60px] bg-[#1e232e] border border-gray-800 hover:border-pink-500 text-white px-8 md:px-10 rounded-xl font-black text-xs md:text-sm transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl hover:text-pink-500"
              >
                <Swords className="w-4 h-4" /> {text.compete}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-[#0b0e14] relative z-20 -mt-20">
        <div className="container mx-auto px-4">
          <div className="bg-[#151a23]/80 backdrop-blur-xl border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8 px-4">
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-400" /> {text.depts}
                </h2>
                <div className="flex gap-2 hidden md:flex">
                    <button onClick={() => scroll('left')} className="bg-[#0b0e14] border border-gray-700 hover:border-white text-white p-3 rounded-xl transition-all active:scale-95"><ChevronLeft className="w-4 h-4" /></button>
                    <button onClick={() => scroll('right')} className="bg-[#0b0e14] border border-gray-700 hover:border-white text-white p-3 rounded-xl transition-all active:scale-95"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div ref={scrollContainerRef} className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x snap-mandatory scroll-smooth">
                {[
                  { id: GameCategory.ACCOUNTS, icon: Users, label: text.cats[GameCategory.ACCOUNTS], color: 'from-pink-500', accent: 'text-pink-500' },
                  { id: GameCategory.COINS, icon: Coins, label: text.cats[GameCategory.COINS], color: 'from-yellow-500', accent: 'text-yellow-500' },
                  { id: GameCategory.KEYS, icon: Key, label: text.cats[GameCategory.KEYS], color: 'from-cyan-500', accent: 'text-cyan-500' },
                  { id: GameCategory.ITEMS, icon: Sword, label: text.cats[GameCategory.ITEMS], color: 'from-red-500', accent: 'text-red-500' },
                  { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: text.cats[GameCategory.BOOSTING], color: 'from-green-500', accent: 'text-green-500' },
                  { id: GameCategory.GIFT_CARD, icon: Gift, label: text.cats[GameCategory.GIFT_CARD], color: 'from-purple-500', accent: 'text-purple-500' },
                  { id: GameCategory.SUBSCRIPTION, icon: Calendar, label: text.cats[GameCategory.SUBSCRIPTION], color: 'from-blue-500', accent: 'text-blue-500' },
                ].map((cat) => (
                  <button 
                    key={cat.id}
                    onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }}
                    className="min-w-[160px] md:min-w-[200px] snap-center group relative bg-[#0b0e14] border border-gray-800 p-6 rounded-3xl flex flex-col items-center gap-4 hover:border-gray-600 transition-all duration-300 shadow-xl overflow-hidden hover:-translate-y-1"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${cat.color} to-transparent opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                    <div className={`p-4 bg-[#1e232e] rounded-2xl ${cat.accent} group-hover:scale-110 transition-transform shadow-inner`}>
                      <cat.icon size={28} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-gray-400 group-hover:text-white uppercase tracking-widest text-[10px]">{cat.label}</span>
                  </button>
                ))}
              </div>
          </div>
        </div>
      </section>

      {/* Trending Products Section */}
      {trendingProducts.length > 0 && (
          <section className="py-12 container mx-auto px-4">
              <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><TrendingUp className="w-6 h-6" /></div>
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">{text.trending}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trendingProducts.map((product, index) => (
                      <div 
                        key={product.id}
                        onClick={() => { onSearch(product.name); onNavigate('shop'); }}
                        className={`bg-[#1e232e] rounded-3xl border border-gray-800 overflow-hidden cursor-pointer group transition-all shadow-xl hover:-translate-y-2 ${index === 0 ? 'hover:border-blue-500 shadow-blue-500/10' : 'hover:border-red-500/50'}`}
                      >
                          <div className="relative h-80 bg-black">
                              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                              <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-2 py-1 rounded uppercase tracking-widest shadow-lg">Hot</div>
                          </div>
                          <div className="p-5">
                              <h3 className="text-white font-black italic uppercase tracking-tighter truncate text-lg mb-1">{product.name}</h3>
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-4">{product.category}</p>
                              <div className="flex justify-between items-center">
                                  <span className="text-yellow-400 font-mono font-bold text-xl">{product.price.toFixed(2)} DH</span>
                                  <div className="w-8 h-8 bg-[#0b0e14] rounded-full flex items-center justify-center text-white group-hover:bg-blue-600 transition-colors">
                                      <ChevronRight className="w-4 h-4" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </section>
      )}

      {/* Services Section */}
      <section className="py-16 container mx-auto px-4 border-t border-gray-800/50">
          <div className="flex items-center justify-center gap-3 mb-12">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Sparkles className="w-6 h-6" /></div>
              <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">{text.servicesTitle}</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 hover:border-yellow-500/50 transition-all group text-center hover:-translate-y-2 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                      <div className="w-20 h-20 bg-yellow-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-yellow-500 transition-colors border border-yellow-500/20 group-hover:border-yellow-500">
                          <Zap className="w-10 h-10 text-yellow-500 group-hover:text-black transition-colors" />
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">{text.deliveryTitle}</h3>
                      <p className="text-gray-400 text-sm font-bold leading-relaxed uppercase tracking-wide">{text.deliveryDesc}</p>
                  </div>
              </div>

              <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 hover:border-green-500/50 transition-all group text-center hover:-translate-y-2 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                      <div className="w-20 h-20 bg-green-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors border border-green-500/20 group-hover:border-green-500">
                          <ShieldCheck className="w-10 h-10 text-green-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">{text.secureTitle}</h3>
                      <p className="text-gray-400 text-sm font-bold leading-relaxed uppercase tracking-wide">{text.secureDesc}</p>
                  </div>
              </div>

              <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 hover:border-purple-500/50 transition-all group text-center hover:-translate-y-2 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                      <div className="w-20 h-20 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500 transition-colors border border-purple-500/20 group-hover:border-purple-500">
                          <Headphones className="w-10 h-10 text-purple-500 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-3">{text.supportTitle}</h3>
                      <p className="text-gray-400 text-sm font-bold leading-relaxed uppercase tracking-wide">{text.supportDesc}</p>
                  </div>
              </div>
          </div>
      </section>
    </div>
  );
};
