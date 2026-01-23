
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import { ShoppingCart, Plus, Globe, Smartphone, Monitor, Gamepad2, Layers, Crown, Star, Eye } from 'lucide-react';

export const ShopGrid = ({ category, searchQuery, onProductClick, language }: { category: string | null, searchQuery: string, onProductClick: (p: Product) => void, language: 'en' | 'fr' }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedRegion, setSelectedRegion] = useState<string>('All');
   const [selectedPlatform, setSelectedPlatform] = useState<string>('All');
   const [userVipLevel, setUserVipLevel] = useState(0);

   const t = {
       en: {
           allPlat: "All Devices",
           allReg: "All Regions",
           noSupply: "No Supply Found",
           restock: "Restocking system scheduled.",
           noMatch: "No items match",
           cross: "All Devices"
       },
       fr: {
           allPlat: "Tous les Appareils",
           allReg: "Toutes Régions",
           noSupply: "Aucun Stock Trouvé",
           restock: "Système de réapprovisionnement programmé.",
           noMatch: "Aucun article ne correspond à",
           cross: "Tous Appareils"
       }
   }[language];

   useEffect(() => {
       const checkVip = async () => {
           const { data: { user } } = await supabase.auth.getUser();
           if (user) {
               const { data } = await supabase.from('profiles').select('vip_level').eq('id', user.id).single();
               if (data) setUserVipLevel(data.vip_level);
           }
       };
       checkVip();
   }, []);

   useEffect(() => {
     setIsLoading(true);
     let query = supabase.from('products').select('*').eq('is_hidden', false);
     
     if (category) query = query.eq('category', category);
     if (selectedRegion !== 'All') query = query.eq('country', selectedRegion);
     if (selectedPlatform !== 'All') query = query.in('platform', [selectedPlatform, 'All Platforms']);
     if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);

     query.then(({ data }) => { 
       if (data) {
           const sortedData = [...data].sort((a, b) => {
               const aVip = a.is_vip ? 1 : 0;
               const bVip = b.is_vip ? 1 : 0;
               if (aVip !== bVip) return bVip - aVip;
               return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
           });
           setProducts(sortedData);
       } 
       setIsLoading(false);
     }); 
   }, [category, searchQuery, selectedRegion, selectedPlatform]);

   const handleProductClick = (p: Product) => {
       onProductClick(p);
   };

   const regions = ['All', 'Global', 'Africa', 'Europe', 'Asia', 'North America', 'South America', 'Morocco'];
   const platforms = ['All', 'PC', 'Mobile', 'Console'];

   const getPlatformIcon = (plat: string) => {
       if (plat === 'PC') return <Monitor className="w-3 h-3" />;
       if (plat === 'Mobile') return <Smartphone className="w-3 h-3" />;
       if (plat === 'Console') return <Gamepad2 className="w-3 h-3" />;
       return <Layers className="w-3 h-3" />;
   };

   // Mock generators
   const getRating = (id: string) => (4 + (id.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%10)/10).toFixed(1);
   const getViewers = (id: string) => (id.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%15)+3;

   return (
      <div className="animate-slide-up">
          <div className="flex overflow-x-auto overflow-y-hidden pb-2 mb-6 gap-4 md:justify-end no-scrollbar">
              <div className="relative group flex-shrink-0">
                 <select 
                    value={selectedPlatform} 
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    className="bg-[#1e232e] border border-gray-800 text-gray-300 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:text-white transition-colors"
                 >
                     {platforms.map(p => <option key={p} value={p}>{p === 'All' ? t.allPlat : p}</option>)}
                 </select>
                 <div className="absolute right-3 top-3 text-gray-500 pointer-events-none group-hover:text-blue-500 transition-colors">
                     {getPlatformIcon(selectedPlatform === 'All' ? 'All Platforms' : selectedPlatform)}
                 </div>
              </div>

              <div className="relative group flex-shrink-0">
                 <select 
                    value={selectedRegion} 
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="bg-[#1e232e] border border-gray-800 text-gray-300 text-[10px] font-black uppercase tracking-widest py-3 pl-4 pr-10 rounded-xl focus:outline-none focus:border-blue-500 appearance-none cursor-pointer hover:text-white transition-colors"
                 >
                     {regions.map(r => <option key={r} value={r}>{r === 'All' ? t.allReg : r}</option>)}
                 </select>
                 <Globe className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none group-hover:text-blue-500 transition-colors" />
              </div>
          </div>

          <div className="pb-20">
            {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1,2,3,4,5,6,7,8].map(n => (
                    <div key={n} className="bg-[#1e232e] rounded-[2.5rem] h-80 md:h-[30rem] animate-pulse border border-gray-800"></div>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="py-40 text-center animate-fade-in">
                <div className="bg-[#1e232e] w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 text-gray-800 border border-gray-800 shadow-3xl">
                    <ShoppingCart className="w-16 h-16" />
                </div>
                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{t.noSupply}</h3>
                <p className="text-gray-600 text-[11px] font-black uppercase tracking-[0.4em] mt-4">
                    {searchQuery ? `${t.noMatch} "${searchQuery}"` : t.restock}
                </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                    {products.map(p => (
                        <div 
                        key={p.id} 
                        className={`bg-[#1e232e] rounded-2xl overflow-hidden border transition-all duration-500 cursor-pointer group shadow-2xl flex flex-col h-full active:scale-95 ${p.is_vip ? 'border-yellow-500/30 hover:border-yellow-500/60' : 'border-gray-800 hover:border-blue-500/60'}`}
                        onClick={() => handleProductClick(p)}
                        >
                            <div className="relative aspect-[3/4] overflow-hidden">
                            <img 
                                src={p.image_url} 
                                className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 brightness-75 group-hover:brightness-100" 
                                alt={p.name} 
                            />
                            
                            {/* Live Viewers (FOMO) */}
                            <div className="absolute top-3 right-3 z-10">
                                <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 flex items-center gap-1.5 animate-pulse">
                                    <Eye className="w-3 h-3 text-red-400" />
                                    <span className="text-[9px] font-black text-white tracking-wide">{getViewers(p.id)} viewing</span>
                                </div>
                            </div>

                            <div className="absolute top-3 left-3 flex flex-col gap-1 items-start z-10">
                                <div className="bg-black/70 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-white/10 uppercase tracking-widest shadow-2xl flex items-center gap-1">
                                    {getPlatformIcon(p.platform)} {p.platform === 'All Platforms' ? t.cross : p.platform}
                                </div>
                            </div>
                            
                            <div className="absolute bottom-12 right-3 flex flex-col gap-2 z-10 items-end">
                                {p.is_vip && (
                                    <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-2.5 py-1 rounded-lg text-[8px] font-black text-black border border-yellow-300 uppercase tracking-widest shadow-2xl flex items-center gap-1 animate-pulse">
                                        <Crown className="w-2 h-2" /> VIP
                                    </div>
                                )}
                                {p.is_trending && (
                                    <div className="bg-blue-600 px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-blue-400 uppercase tracking-widest shadow-2xl">
                                    HOT
                                    </div>
                                )}
                            </div>
                            
                            {/* Rating Badge */}
                            <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                                <Star className="w-2.5 h-2.5 text-yellow-400 fill-yellow-400" />
                                <span className="text-[9px] font-bold text-white">{getRating(p.id)}</span>
                            </div>

                            </div>
                            <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#1e232e] to-[#151a23]">
                            <div>
                                <h3 className={`font-black text-sm md:text-base truncate transition-colors uppercase italic tracking-tighter mb-1 leading-none ${p.is_vip ? 'text-yellow-400 group-hover:text-yellow-200' : 'text-white group-hover:text-blue-400'}`}>{p.name}</h3>
                                <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em]">{p.category.toUpperCase()}</p>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-yellow-400 font-black italic text-xl md:text-2xl tracking-tighter leading-none">{p.price.toFixed(2)} <span className="text-[10px] md:text-xs">DH</span></div>
                                <div className={`p-2.5 rounded-xl transition-all shadow-xl active:scale-90 ${p.is_vip ? 'bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black' : 'bg-blue-600/10 text-blue-400 group-hover:bg-blue-600 group-hover:text-white'}`}>
                                    <Plus className="w-4 h-4" />
                                </div>
                            </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
      </div>
   );
};
