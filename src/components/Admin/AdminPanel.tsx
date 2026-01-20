import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, Profile } from '../../types';
import { BarChart3, Package, Users, Search, Mail, Edit2, Trash2, PlusCircle, Wallet, ShoppingCart, Key } from 'lucide-react';
import { ProductFormModal, BalanceEditorModal } from './AdminModals';

export const AdminPanel = ({ session, addToast }: { session: any, addToast: any }) => {
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users'>('stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  
  const [providerFilter, setProviderFilter] = useState<'all' | 'email' | 'google' | 'discord'>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch Products
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);

    // Fetch Profiles (Users)
    const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (userData) setProfiles(userData);

    // Fetch Real Stats
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: ordersData, count: orderCount } = await supabase.from('orders').select('total_amount', { count: 'exact' });
    const totalRevenue = ordersData?.reduce((acc, curr) => acc + Number(curr.total_amount), 0) || 0;

    setStats({ users: userCount || 0, orders: orderCount || 0, revenue: totalRevenue });
    setIsLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('WARNING: Are you sure you want to delete this product forever?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      addToast('Deleted', 'Item permanently removed.', 'success');
      fetchData();
    } else {
      addToast('Error', error.message, 'error');
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        const { error } = await supabase.from('products').update(productData).eq('id', productData.id);
        if (error) throw error;
        addToast('Updated', 'Inventory synced.', 'success');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        addToast('Created', 'Added to shop.', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  const handleUpdateBalance = async (userId: string, newBalance: number) => {
    const { error } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', userId);
    if (!error) {
      addToast('Success', 'Player solde updated.', 'success');
      setEditingUser(null);
      fetchData();
    } else {
      addToast('Error', error.message, 'error');
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = profiles.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (providerFilter === 'all') return matchesSearch;
    return matchesSearch && u.auth_provider === providerFilter;
  });

  const ProviderIcon = ({ provider }: { provider?: string }) => {
    if (provider === 'google') return (
      <svg className="w-3 h-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
    );
    if (provider === 'discord') return (
      <svg className="w-3 h-3 fill-[#5865F2]" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z"/></svg>
    );
    return <Mail className="w-3 h-3 text-gray-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-7xl pb-24">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">ADMIN <span className="text-blue-500">CONTROL</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Live Database Manager • Connected</p>
        </div>
        
        <div className="flex w-full md:w-auto bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto scrollbar-hide">
          <button onClick={() => setActiveSection('stats')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
          <button onClick={() => setActiveSection('products')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <Package className="w-4 h-4" /> Shop
          </button>
          <button onClick={() => setActiveSection('users')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <Users className="w-4 h-4" /> Users
          </button>
        </div>
      </div>

      {activeSection === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-blue-500/30 transition-all">
              <Users className="text-blue-500 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Registered Gamers</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stats.users}</h3>
           </div>
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-yellow-500/30 transition-all">
              <Wallet className="text-yellow-400 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Real Cash Volume</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stats.revenue.toFixed(2)} <span className="text-sm">DH</span></h3>
           </div>
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-purple-500/30 transition-all">
              <ShoppingCart className="text-purple-500 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Sales</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stats.orders}</h3>
           </div>
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-cyan-500/30 transition-all">
              <Package className="text-cyan-400 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Active Items</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{products.length}</h3>
           </div>
        </div>
      )}

      {activeSection === 'products' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Filter inventory..." 
                  className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all shadow-xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
             </div>
             <button 
                onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest"
             >
                <PlusCircle className="w-5 h-5" /> Add Product
             </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredProducts.map(p => (
                <div key={p.id} className="bg-[#1e232e] rounded-3xl border border-gray-800 p-5 shadow-2xl flex flex-col group hover:border-blue-500/30 transition-all">
                   <div className="flex gap-4 mb-6 items-start">
                      <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover border border-gray-700 shadow-lg" alt="" />
                      <div className="min-w-0 flex-1">
                         <h3 className="text-white font-black italic truncate leading-tight mb-2 uppercase tracking-tighter text-lg">{p.name}</h3>
                         <div className="flex gap-2 flex-wrap mb-2">
                            <span className="px-2 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[8px] font-black uppercase border border-blue-500/20">{p.category}</span>
                            <span className="px-2 py-1 rounded-lg bg-gray-800 text-gray-300 text-[8px] font-black uppercase border border-gray-700">Stock: {p.stock}</span>
                         </div>
                         <p className="text-xl font-black text-yellow-400 italic tracking-tighter mt-1">{p.price.toFixed(2)} DH</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button onClick={() => { setEditingProduct(p); setIsModalOpen(true); }} className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-gray-700">
                         <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/30 text-red-500 font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-red-500/20">
                         <Trash2 className="w-4 h-4" /> Delete
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeSection === 'users' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
             <div className="relative flex-1 w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Search players by email or username..." 
                    className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none shadow-xl"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
             </div>
             
             <div className="flex gap-2 bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto scrollbar-hide flex-shrink-0">
                <button onClick={() => setProviderFilter('all')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${providerFilter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>All</button>
                <button onClick={() => setProviderFilter('email')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${providerFilter === 'email' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-white'}`}><Mail className="w-3 h-3" /> Email</button>
                <button onClick={() => setProviderFilter('google')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${providerFilter === 'google' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-white'}`}><ProviderIcon provider="google" /> Google</button>
                <button onClick={() => setProviderFilter('discord')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${providerFilter === 'discord' ? 'bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30' : 'text-gray-500 hover:text-white'}`}><ProviderIcon provider="discord" /> Discord</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredUsers.map(u => (
                <div key={u.id} className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col gap-4 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-4 right-4">
                      <div className="p-2 bg-[#0b0e14] rounded-xl border border-gray-800 shadow-lg" title={`Signed up via ${u.auth_provider}`}><ProviderIcon provider={u.auth_provider} /></div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0b0e14] shadow-lg flex-shrink-0"><img src={u.avatar_url} className="w-full h-full object-cover" alt="" /></div>
                      <div className="min-w-0 flex-1 pr-8">
                         <h3 className="text-white font-black italic uppercase tracking-tighter truncate">{u.username || 'Anon User'}</h3>
                         <p className="text-gray-500 text-[10px] font-bold truncate">{u.email}</p>
                         {u.password && (
                           <div className="flex items-center gap-2 mt-1"><Key className="w-3 h-3 text-red-500" /><p className="text-red-400 text-[10px] font-mono tracking-widest truncate">{u.password}</p></div>
                         )}
                      </div>
                   </div>
                   <div className="flex items-center justify-between bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
                      <div><p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Solde</p><p className="text-lg font-black text-yellow-400 italic tracking-tighter leading-none mt-1">{u.wallet_balance.toFixed(2)} DH</p></div>
                      <button onClick={() => setEditingUser(u)} className="p-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-500/20 shadow-lg active:scale-90"><Edit2 className="w-4 h-4" /></button>
                   </div>
                </div>
             ))}
          </div>
          {filteredUsers.length === 0 && (<div className="py-20 text-center"><Users className="w-16 h-16 text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-black uppercase tracking-widest">No matching players found.</p></div>)}
        </div>
      )}

      {isModalOpen && (activeSection === 'products') && (
        <ProductFormModal 
          product={editingProduct} 
          onClose={() => { setIsModalOpen(false); setEditingProduct(null); }} 
          onSave={handleSaveProduct} 
        />
      )}

      {editingUser && (
        <BalanceEditorModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleUpdateBalance} 
        />
      )}
    </div>
  );
};