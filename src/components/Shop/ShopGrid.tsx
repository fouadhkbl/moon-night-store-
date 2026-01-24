
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Product } from '../../types';
import { Plus, SearchX, RotateCcw } from 'lucide-react';

export const ShopGrid = ({ category, searchQuery, onProductClick, language }: { category: string | null, searchQuery: string, onProductClick: (p: Product) => void, language: 'en' | 'fr' }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [sortOption, setSortOption] = useState<string>('featured');

   useEffect(() => {
     const fetchProducts = async () => {
         setIsLoading(true);
         // Start with a clean query
         let query = supabase.from('products').select('*').eq('is_hidden', false);
         
         // Use ILIKE for case-insensitive category matching (fixes "nothing showing" bug)
         if (category) {
             query = query.ilike('category', category);
         }
         
         // If there is a search term, filter by name or category
         if (searchQuery) {
             query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
         }

         const { data, error } = await query;
         
         if (error) {
             console.error("Shop Query Error:", error);
             setProducts([]);
         } else if (data) {
             let sortedData = [...data];
             if (sortOption === 'price-asc') sortedData.sort((a, b) => a.price - b.price);
             else if (sortOption === 'price-desc') sortedData.sort((a, b) => b.price - a.price);
             else sortedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
             setProducts(sortedData);
         } 
         setIsLoading(false);
     };

     fetchProducts();
   }, [category, searchQuery, sortOption]);

   const SkeletonCard = () => (
    <div className="bg-[#151a23] rounded-xl border border-gray-800 overflow-hidden flex flex-col animate-pulse">
        <div className="aspect-[4/5] bg-gray-800/50"></div>
        <div className="p-3 space-y-2">
            <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            <div className="flex justify-between items-center mt-4">
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                <div className="h-6 w-6 bg-gray-800 rounded-lg"></div>
            </div>
        </div>
    </div>
   );

   if (!isLoading && products.length === 0) {
       return (
           <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
               <div className="w-20 h-20 bg-[#1e232e] rounded-3xl flex items-center justify-center mb-6 border border-gray-800">
                   <SearchX className="w-10 h-10 text-gray-600" />
               </div>
               <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-2">No Items Found</h3>
               <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-8">
                   {category ? `No products available in the ${category} department.` : "No products match your search criteria."}
               </p>
               <button 
                  onClick={() => window.location.reload()} 
                  className="flex items-center gap-2 bg-[#1e232e] hover:bg-[#252b36] text-white px-6 py-3 rounded-xl border border-gray-800 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
               >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Inventory
               </button>
           </div>
       );
   }

   return (
      <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  {isLoading ? 'Scanning Inventory...' : `${products.length} Units Available`}
              </span>
              <select 
                value={sortOption} 
                onChange={(e) => setSortOption(e.target.value)} 
                className="bg-[#151a23] border border-gray-800 text-gray-400 text-[9px] font-black uppercase py-1.5 px-3 rounded-lg outline-none cursor-pointer hover:border-gray-600 transition-all"
              >
                  <option value="featured">Default Priority</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
              </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {isLoading ? (
                  [1,2,3,4,5,6,7,8,9,10,11,12].map(n => <SkeletonCard key={n} />)
              ) : (
                  products.map(p => (
                      <div key={p.id} onClick={() => onProductClick(p)} className="bg-[#151a23] rounded-xl border border-gray-800 overflow-hidden cursor-pointer group hover:border-blue-500/50 transition-all flex flex-col shadow-lg hover:-translate-y-1 duration-300">
                          <div className="aspect-[4/5] relative overflow-hidden bg-black">
                              <img src={p.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="" />
                              {p.is_vip && <div className="absolute top-2 left-2 bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded shadow-lg z-10">ELITE</div>}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
