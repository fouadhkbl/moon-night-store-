
import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Star, Coins, Key, Sword, ArrowUpCircle, Gift, Users, Trophy, Swords, Calendar, Crown, TrendingUp, Sparkles, ShoppingCart, Zap, ShieldCheck, Headphones, Cpu, Scan, Activity, MessageSquare, Target, Terminal, Lightbulb, Smartphone, Rocket, MessageCircle } from 'lucide-react';
import { GameCategory, Product } from '../types';
import { supabase } from '../supabaseClient';

export const HomePage = ({ onNavigate, onSelectCategory, onSearch, language }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void, onSearch: (q: string) => void, language: 'en' | 'fr' }) => {
  
  const [isVip, setIsVip] = useState(false);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [aiPicks, setAiPicks] = useState<Product[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  const DISCORD_LOGO = "https://cdn.discordapp.com/attachments/1459639411728711914/1463587675897462795/moon-edite-png_1_1-ezgif.com-optimize.gif?ex=6975ab7e&is=697459fe&hm=fe3c5242f9e86f2692bfea6aece5c50b46ae757d80cc8d01c9a20ae4e6bf9e19";

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
     en: { premium: "Premium Gaming Hub", browse: "Explore Shop", depts: "Elite Categories", trending: "Hot Items", aiTitle: "Moon AI Selection", discord: "Discord Community" },
     fr: { premium: "Hub Gaming Premium", browse: "Explorer la Boutique", depts: "Catégories d'Élite", trending: "Articles Chauds", aiTitle: "Sélection Moon AI", discord: "Communauté Discord" }
  }[language];

  return (
    <div className="animate-fade-in pb-12">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .shimmer-btn:after {
          content: '';
          position: absolute;
          top: 0; left: 0; width: 50%; height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg);
          animation: shimmer 3s infinite;
        }
        .terminal-glow {
            text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
        }
        .scanline {
            background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.3) 50%);
            background-size: 100% 4px;
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center z-30 bg-[#0b0e14] overflow-hidden pt-10">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&w=1920&q=80" className="w-full h-full object-cover opacity-[0.07] scale-110" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-transparent to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-20 flex flex-col md:flex-row items-center gap-12">
          <div className="max-w-3xl flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.25em] mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <Activity className="w-3 h-3 animate-pulse" /> {t.premium}
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-[0.85] mb-8 uppercase">
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">MOON</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 drop-shadow-[0_0_30px_rgba(34,211,234,0.3)]">NIGHT</span>
            </h1>

            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-10">
              <button 
                onClick={() => onNavigate('shop')} 
                className="shimmer-btn group relative h-16 bg-blue-600 hover:bg-blue-500 text-white px-12 rounded-2xl font-black text-sm transition-all flex items-center gap-4 uppercase tracking-widest shadow-[0_10px_50px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 overflow-hidden"
              >
                <ShoppingCart className="w-5 h-5 relative z-10" />
                <span className="relative z-10">{t.browse}</span>
                <ChevronRight className="w-6 h-6 relative z-10 group-hover:translate-x-2 transition-transform duration-300" />
              </button>

              <a 
                href="https://discord.gg/s4hcCn4s" 
                target="_blank" 
                rel="noreferrer" 
                className="h-16 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-10 rounded-2xl font-black text-[11px] border border-white/10 transition-all flex items-center gap-3 uppercase tracking-widest shadow-xl active:scale-95"
              >
                <MessageSquare className="w-5 h-5 text-[#5865F2]" /> {t.discord}
              </a>
            </div>

            <div className="bg-[#0b0e14] border border-green-500/20 p-6 md:p-8 rounded-2xl shadow-[0_0_30px_rgba(34,197,94,0.05)] max-w-xl mx-auto md:mx-0 overflow-hidden relative group">
                <div className="scanline absolute inset-0 opacity-10 pointer-events-none"></div>
                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-green-500" />
                            <h4 className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em] terminal-glow">
                                WEEKLY COMMUNITY PROGRESS
                            </h4>
                        </div>
                        <span className="text-[8px] text-green-900 font-bold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">LIVE UPDATE</span>
                    </div>
                    
                    <div className="space-y-4 text-left">
                        <div className="flex items-start gap-3">
                            <p className="text-[11px] font-bold text-green-500/80 uppercase">Goal: 200 Total Orders This Week</p>
                        </div>
                        
                        <div className="relative">
                            <div className="h-2 w-full bg-green-900/20 rounded-full overflow-hidden border border-green-500/10">
                                <div className="h-full bg-green-500 transition-all duration-[3000ms] shadow-[0_0_15px_rgba(34,197,94,0.4)]" style={{ width: '64%' }}></div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-green-500/60 font-black uppercase">Current: 128 / 200</span>
                            </div>
                            <span className="text-green-500/40 font-bold uppercase tracking-tight">Weekly reward at 100%</span>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => onNavigate('shop')} 
                        className="mt-6 w-full py-3 bg-green-500/10 hover:bg-green-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-green-500 border border-green-500/20 transition-all"
                    >
                        GO TO SHOP
                    </button>
                </div>
            </div>
          </div>

          <div className="hidden lg:block flex-shrink-0 relative group">
              <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full animate-pulse group-hover:bg-cyan-500/30 transition-colors"></div>
              <div className="relative w-[450px] h-[450px] rounded-full overflow-hidden border-2 border-white/10 shadow-[0_0_80px_rgba(37,99,235,0.2)]">
                  <img src={DISCORD_LOGO} className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-[2s]" alt="Moon GIF" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14]/40 to-transparent"></div>
              </div>
          </div>
        </div>
      </section>

      {/* Category Selection */}
      <section className="py-12 container mx-auto px-4">
        <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3 mb-8"><Sparkles className="w-5 h-5 text-yellow-400" /> {t.depts}</h2>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
            {[
                { id: GameCategory.ACCOUNTS, icon: Users, label: 'Accounts', color: 'text-pink-500' },
                { id: GameCategory.COINS, icon: Coins, label: 'Coins', color: 'text-yellow-500' },
                { id: GameCategory.KEYS, icon: Key, label: 'Keys', color: 'text-cyan-500' },
                { id: GameCategory.ITEMS, icon: Sword, label: 'Items', color: 'text-red-500' },
                { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: 'Boosting', color: 'text-green-500' },
                { id: GameCategory.GIFT_CARD, icon: Gift, label: 'Cards', color: 'text-purple-500' }
            ].map(cat => (
                <button key={cat.id} onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }} className="min-w-[140px] bg-[#151a23] border border-white/5 p-6 rounded-3xl flex flex-col items-center gap-3 hover:border-blue-500/50 hover:bg-[#1e232e] hover:-translate-y-2 transition-all shrink-0 shadow-xl group">
                    <div className={`p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform ${cat.color}`}><cat.icon className="w-6 h-6" /></div>
                    <span className="font-black text-gray-400 group-hover:text-white text-[9px] uppercase tracking-[0.25em] transition-colors">{cat.label}</span>
                </button>
            ))}
        </div>
      </section>

      {/* Featured Grid */}
      <section className="py-12 container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3"><Cpu className="w-5 h-5 text-cyan-400" /> {t.aiTitle}</h2>
              <button onClick={() => onNavigate('shop')} className="text-[10px] font-black uppercase text-blue-500 tracking-widest hover:text-blue-400 transition-colors">View All Items</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {aiPicks.map(p => (
                  <div key={p.id} onClick={() => { onSearch(p.name); onNavigate('shop'); }} className="bg-[#151a23] rounded-[2rem] border border-white/5 overflow-hidden cursor-pointer group transition-all hover:border-cyan-500/40 shadow-2xl hover:-translate-y-2 duration-500">
                      <div className="aspect-[2/3] bg-black relative overflow-hidden">
                          <img src={p.image_url} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-[0.8s]" alt="" />
                          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
                             {p.is_trending && <div className="bg-red-600 text-white text-[7px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-xl flex items-center gap-1.5"><Zap className="w-2.5 h-2.5 fill-current" /> Trending</div>}
                             {p.is_vip && <div className="bg-yellow-500 text-black text-[7px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-xl">Elite</div>}
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity"></div>
                          <div className="absolute bottom-0 left-0 right-0 p-4 pt-10 bg-gradient-to-t from-black via-black/60 to-transparent backdrop-blur-[2px] translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <p className="text-[8px] text-cyan-400 font-black uppercase tracking-[0.2em] mb-1 opacity-80">{p.category}</p>
                                <h3 className="text-white font-black text-sm italic uppercase tracking-tighter truncate leading-tight mb-2">{p.name}</h3>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-[7px] text-gray-400 font-bold uppercase tracking-widest">Price</p>
                                        <p className="text-white font-black italic text-lg tracking-tighter">{p.price.toFixed(2)} DH</p>
                                    </div>
                                    <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform"><ShoppingCart className="w-4 h-4" /></div>
                                </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      {/* OUR FUTURE IDEAS LIST SECTION */}
      <section className="py-24 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest mb-6">
                  <Lightbulb className="w-3.5 h-3.5" /> Project Roadmap
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">OUR FUTURE<br/><span className="text-blue-500">IDEAS</span></h2>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-12 mx-auto max-w-sm">We are constantly improving Moon Night. Here is what we have planned for the community.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
                  {[
                      { icon: Smartphone, title: "Mobile App Development", desc: "Native iOS & Android apps for faster trades.", status: "In Progress", color: "text-blue-400" },
                      { icon: Rocket, title: "Auto-Delivery System", desc: "Get your account details instantly after payment.", status: "Beta Test", color: "text-green-400" },
                      { icon: Crown, title: "VIP Private Auctions", desc: "Exclusive bidding for the rarest accounts.", status: "Planning", color: "text-yellow-400" }
                  ].map((idea, i) => (
                      <div key={i} className="flex gap-4 p-5 rounded-2xl bg-[#151a23] border border-white/5 hover:border-blue-500/20 transition-all group">
                          <div className={`p-3 rounded-xl bg-white/5 ${idea.color}`}><idea.icon className="w-6 h-6" /></div>
                          <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                  <h4 className="text-white font-black uppercase text-sm italic">{idea.title}</h4>
                                  <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5">{idea.status}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{idea.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Community Section */}
      <section className="py-24 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto bg-[#1e232e] border border-white/5 rounded-[4rem] p-12 md:p-20 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
               <div className="absolute top-0 right-0 p-20 opacity-5 pointer-events-none"><Activity className="w-64 h-64" /></div>
               <div className="relative z-10 flex flex-col items-center">
                    <div className="w-24 h-24 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20 shadow-2xl"><img src={DISCORD_LOGO} className="w-16 h-16 rounded-full" alt="" /></div>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">JOIN THE ELITE<br/><span className="text-blue-500">COMMUNITY</span></h2>
                    <p className="text-gray-400 font-bold text-sm md:text-base uppercase tracking-[0.1em] mb-10 max-w-xl leading-relaxed">Access exclusive deals, community giveaways, and 24/7 support. Join 15,000+ members waiting for you.</p>
                    <a href="https://discord.gg/s4hcCn4s" target="_blank" rel="noreferrer" className="bg-white text-black px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-[0_20px_60px_rgba(255,255,255,0.2)] hover:scale-105 transition-all flex items-center gap-4">Launch Discord App <ChevronRight className="w-4 h-4" /></a>
               </div>
          </div>
      </section>
    </div>
  );
};
