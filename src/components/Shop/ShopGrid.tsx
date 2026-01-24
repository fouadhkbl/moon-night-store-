
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import { ShoppingCart, Plus, Globe, Smartphone, Monitor, Gamepad2, Layers, Crown, Star, Eye, ArrowUpDown, Flame } from 'lucide-react';

export const ShopGrid = ({ category, searchQuery, onProductClick, language }: { category: string | null, searchQuery: string, onProductClick: (p: Product) => void, language: 'en' | 'fr' }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [sortOption, setSortOption] = useState<string>('featured');

   useEffect(() => {
     setIsLoading(true);
     let query = supabase.from('products').select('*').eq('is_hidden', false);
     if (category) query = query.eq('category', category);
     if (searchQuery) query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);

     query.then(({ data }) => { 
       if (data) {
           let sortedData = [...data];
           if (sortOption === 'price-asc') sortedData.sort((a, b) => a.price - b.price);
           else if (sortOption === 'price-desc') sortedData.sort((a, b) => b.price - a.price);
           else sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           setProducts(sortedData);
       } 
       setIsLoading(false);
     }); 
   }, [category, searchQuery, sortOption]);

   return (
      <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{products.length} Items</span>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-[#151a23] border border-gray-800 text-gray-400 text-[9px] font-black uppercase py-1.5 px-3 rounded-lg outline-none">
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price Low</option>
                  <option value="price-desc">Price High</option>
              </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {isLoading ? (
                  [1,2,3,4,5,6].map(n => <div key={n} className="bg-[#151a23] rounded-xl h-56 animate-pulse border border-gray-800"></div>)
              ) : (
                  products.map(p => (
                      <div key={p.id} onClick={() => onProductClick(p)} className="bg-[#151a23] rounded-xl border border-gray-800 overflow-hidden cursor-pointer group hover:border-blue-500/50 transition-all flex flex-col shadow-lg">
                          <div className="aspect-[4/5] relative overflow-hidden bg-black">
                              <img src={p.image_url} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" alt="" />
                              {p.is_vip && <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg">VIP</div>}
                          </div>
                          <div className="p-3 flex-1 flex flex-col justify-between">
                              <h3 className="text-white font-bold text-[11px] truncate uppercase group-hover:text-blue-400 transition-colors leading-tight mb-1">{p.name}</h3>
                              <div className="flex justify-between items-center mt-2">
                                  <span className="text-yellow-400 font-black italic text-sm tracking-tighter">{p.price.toFixed(2)} DH</span>
                                  <div className="p-1.5 bg-blue-600/10 text-blue-500 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all">
                                      <Plus className="w-3 h-3" />
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))
              )}
          </div>
      </div>
   );
};
