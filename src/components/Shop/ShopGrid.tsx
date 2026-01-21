import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import { ShoppingCart, Plus, Globe, Smartphone, Monitor, Gamepad2, Layers } from 'lucide-react';

export const ShopGrid = ({ category, searchQuery, onProductClick, language }: { category: string | null, searchQuery: string, onProductClick: (p: Product) => void, language: 'en' | 'fr' }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [selectedRegion, setSelectedRegion] = useState<string>('All');
   const [selectedPlatform, setSelectedPlatform] = useState<string>('All');

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
     setIsLoading(true);
     let query = supabase.from('products').select('*');
     
     if (category) {
         query = query.eq('category', category);
     }
     
     // Filter by Region if selected
     if (selectedRegion !== 'All') {
         query = query.eq('country', selectedRegion);
     }

     // Filter by Platform
     // If user selects specific platform (e.g. PC), show "PC" items AND "All Platforms" items
     if (selectedPlatform !== 'All') {
         query = query.in('platform', [selectedPlatform, 'All Platforms']);
     }
     
     if (searchQuery) {
         // Filter by Name OR Category using ILIKE
         query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
     }

     query.then(({ data }) => { 
       if (data) setProducts(data); 
       setIsLoading(false);
     }); 
   }, [category, searchQuery, selectedRegion, selectedPlatform]);

   const regions = ['All', 'Global', 'Africa', 'Europe', 'Asia', 'North America', 'South America', 'Morocco'];
   const platforms = ['All', 'PC', 'Mobile', 'Console'];

   const getPlatformIcon = (plat: string) => {
       if (plat === 'PC') return <Monitor className="w-3 h-3" />;
       if (plat === 'Mobile') return <Smartphone className="w-3 h-3" />;
       if (plat === 'Console') return <Gamepad2 className="w-3 h-3" />;
       return <Layers className="w-3 h-3" />;
   };

   return (
      <div className="animate-slide-up">
          {/* Filters Bar */}
          <div className="flex flex-wrap justify-end mb-6 gap-4">
              {/* Platform Filter */}
              <div className="relative group">
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

              {/* Region Filter */}
              <div className="relative group">
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
                       className="bg-[#1e232e] rounded-2xl overflow-hidden border border-gray-800 hover:border-blue-500/60 transition-all duration-500 cursor-pointer group shadow-2xl flex flex-col h-full active:scale-95" 
                       onClick={() => onProductClick(p)}
                     >
                        <div className="relative aspect-[3/4] overflow-hidden">
                           <img 
                            src={p.image_url} 
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-1000 brightness-75 group-hover:brightness-100" 
                            alt={p.name} 
                           />
                           <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                               {/* Platform Badge */}
                               <div className="bg-black/70 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-white/10 uppercase tracking-widest shadow-2xl flex items-center gap-1">
                                  {getPlatformIcon(p.platform)} {p.platform === 'All Platforms' ? t.cross : p.platform}
                               </div>
                               {/* Country Badge */}
                               {p.country && p.country !== 'Global' && (
                                   <div className="bg-blue-900/80 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[8px] font-black text-blue-100 border border-blue-500/30 uppercase tracking-widest shadow-2xl flex items-center gap-1">
                                       <Globe className="w-2 h-2" /> {p.country}
                                   </div>
                               )}
                           </div>
                           
                           {p.is_trending && (
                             <div className="absolute top-3 right-3 bg-blue-600 px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-blue-400 uppercase tracking-widest shadow-2xl animate-pulse">
                               HOT
                             </div>
                           )}
                        </div>
                        <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-[#1e232e] to-[#151a23]">
                           <div>
                             <h3 className="font-black text-white text-sm md:text-base truncate group-hover:text-blue-400 transition-colors uppercase italic tracking-tighter mb-1 leading-none">{p.name}</h3>
                             <p className="text-gray-600 text-[9px] font-black uppercase tracking-[0.2em]">{p.category.toUpperCase()}</p>
                           </div>
                           <div className="flex items-center justify-between mt-4">
                              <div className="text-yellow-400 font-black italic text-xl md:text-2xl tracking-tighter leading-none">{p.price.toFixed(2)} <span className="text-[10px] md:text-xs">DH</span></div>
                              <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xl active:scale-90">
                                <Plus className="w-4 h-4" />
                              </div>
                           </div>
                        </div>
                     </div>
                 ))}
              </div>
           )}
      </div>
   );
};