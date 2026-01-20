import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Product, Profile, CartItem, Order, GameCategory } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { 
  CreditCard, ShieldCheck, Headset, 
  Coins, ArrowUpCircle, Sword, Zap, Gift, 
  ChevronRight, Star, Trash2, Plus, Minus,
  Gamepad2, User, Wallet, ShoppingBag, Lock,
  Edit2, Save, X, Check, Loader2, PlusCircle, Users,
  Filter, Settings, Camera, Mail, LogOut, CreditCard as CardIcon,
  Activity, Calendar, LayoutDashboard, UserPlus, LogIn, ShoppingCart,
  ArrowLeft, Receipt, Rocket, BarChart3, Package, TrendingUp, Search, Key,
  MoreVertical, ShieldAlert, DollarSign
} from 'lucide-react';

// --- UTILS ---

const ToastContainer = ({ toasts, removeToast }: { toasts: any[], removeToast: (id: string) => void }) => {
  return (
    <div className="fixed bottom-4 right-4 z-[100] space-y-2">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border transition-all duration-300 transform translate-y-0 opacity-100 ${
            toast.type === 'success' ? 'bg-green-900/90 border-green-500 text-white' : 
            toast.type === 'error' ? 'bg-red-900/90 border-red-500 text-white' : 
            'bg-blue-900/90 border-blue-500 text-white'
          }`}
        >
          {toast.type === 'success' && <Check className="w-5 h-5 text-green-400" />}
          {toast.type === 'error' && <X className="w-5 h-5 text-red-400" />}
          {toast.type === 'info' && <ShieldCheck className="w-5 h-5 text-blue-400" />}
          <div>
            <h4 className="font-bold text-sm">{toast.title}</h4>
            <p className="text-xs text-gray-200">{toast.message}</p>
          </div>
          <button onClick={() => removeToast(toast.id)} className="ml-4 opacity-50 hover:opacity-100"><X className="w-4 h-4"/></button>
        </div>
      ))}
    </div>
  );
};

// --- ADMIN MODALS ---

const BalanceEditorModal = ({ user, onClose, onSave }: { user: Profile, onClose: () => void, onSave: (id: string, amount: number) => void }) => {
  const [amount, setAmount] = useState(user.wallet_balance);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(user.id, amount);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-sm rounded-[2rem] border border-gray-800 shadow-3xl p-8 animate-slide-up">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-500 border border-yellow-500/20">
              <DollarSign className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit Solde</h2>
           <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Updating balance for {user.username}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">New Balance (DH)</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              autoFocus
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-3xl font-black text-yellow-400 italic outline-none focus:border-yellow-500 transition-all shadow-inner" 
              value={amount} 
              onChange={e => setAmount(parseFloat(e.target.value))} 
            />
          </div>
          <div className="flex gap-3">
             <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition uppercase text-xs">Cancel</button>
             <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 uppercase text-xs shadow-xl shadow-blue-600/30">
               {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Update
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProductFormModal = ({ product, onClose, onSave }: { product: Partial<Product> | null, onClose: () => void, onSave: (p: any) => void }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    price: 0,
    category: GameCategory.COINS,
    platform: 'PC',
    image_url: '',
    description: '',
    is_trending: false,
    stock: 999
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
            {product?.id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Product Name</label>
            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price (DH)</label>
              <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock</label>
              <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.stock ?? 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
              <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {Object.values(GameCategory).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
            <input required type="url" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
            <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="hidden" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_trending ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'}`}>
              {formData.is_trending && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-white">Mark as Trending</span>
          </label>
        </form>

        <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Item
          </button>
        </div>
      </div>
    </div>
  );
};

// --- ADMIN PANEL COMPONENT ---

const AdminPanel = ({ session, addToast }: { session: any, addToast: any }) => {
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users'>('stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);

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

  const filteredUsers = profiles.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-7xl pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">ADMIN <span className="text-blue-500">CONTROL</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Live Database Manager • Connected</p>
        </div>
        
        {/* Responsive Section Switcher */}
        <div className="flex w-full md:w-auto bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto scrollbar-hide">
          <button 
            onClick={() => setActiveSection('stats')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" /> Stats
          </button>
          <button 
            onClick={() => setActiveSection('products')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Package className="w-4 h-4" /> Shop
          </button>
          <button 
            onClick={() => setActiveSection('users')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
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
                      <button 
                        onClick={() => { setEditingProduct(p); setIsModalOpen(true); }}
                        className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-gray-700"
                      >
                         <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/30 text-red-500 font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-red-500/20"
                      >
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
          <div className="relative">
             <input 
                type="text" 
                placeholder="Search players by email or username..." 
                className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none shadow-xl"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
             />
             <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredUsers.map(u => (
                <div key={u.id} className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col gap-4 hover:border-purple-500/30 transition-all group">
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0b0e14] shadow-lg flex-shrink-0">
                         <img src={u.avatar_url} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="min-w-0 flex-1">
                         <h3 className="text-white font-black italic uppercase tracking-tighter truncate">{u.username || 'Anon User'}</h3>
                         <p className="text-gray-500 text-[10px] font-bold truncate">{u.email}</p>
                         {/* Display Password if available */}
                         {u.password && (
                           <div className="flex items-center gap-2 mt-1">
                             <Key className="w-3 h-3 text-red-500" />
                             <p className="text-red-400 text-[10px] font-mono tracking-widest">{u.password}</p>
                           </div>
                         )}
                      </div>
                   </div>
                   <div className="flex items-center justify-between bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
                      <div>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Solde</p>
                        <p className="text-lg font-black text-yellow-400 italic tracking-tighter leading-none mt-1">{u.wallet_balance.toFixed(2)} DH</p>
                      </div>
                      <button 
                        onClick={() => setEditingUser(u)}
                        className="p-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-500/20 shadow-lg active:scale-90"
                      >
                         <Edit2 className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             ))}
          </div>
          
          {filteredUsers.length === 0 && (
             <div className="py-20 text-center">
                <Users className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 font-black uppercase tracking-widest">No matching players found.</p>
             </div>
          )}
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

// --- COMPONENTS ---

const CartPage = ({ cart, session, onUpdateQty, onRemove, onNavigate, onClearCart, addToast }: { 
  cart: CartItem[], 
  session: any,
  onUpdateQty: (id: string, delta: number) => void, 
  onRemove: (id: string) => void, 
  onNavigate: (p: string) => void,
  onClearCart: () => void,
  addToast: any
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0), [cart]);
  const isGuest = session?.user?.id === 'guest-user-123';

  const handleCheckout = async () => {
    if (isGuest) {
      addToast('Auth Required', 'Please login or signup to complete your order.', 'error');
      onNavigate('dashboard');
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: total,
          status: 'completed',
          payment_method: 'PayPal'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product?.price || 0
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setShowSuccess(true);
      onClearCart();
    } catch (err: any) {
      addToast('Checkout Failed', err.message || 'There was an error processing your payment.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 border border-green-500/50 animate-bounce-slow">
          <Check className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white italic mb-4">PAYMENT SUCCESSFUL!</h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">Your epic loot is being delivered instantly to your game account. Check your orders for details.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => onNavigate('dashboard')} className="bg-[#1e232e] border border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            <Receipt className="w-5 h-5" /> View Orders
          </button>
          <button onClick={() => onNavigate('shop')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
             Continue Shopping <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#1e232e] rounded-full flex items-center justify-center mx-auto mb-8 text-gray-600 border border-gray-800">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-white italic mb-4 uppercase tracking-tighter leading-none">Cart is Empty</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Explore the shop to find gear.</p>
        <button 
          onClick={() => onNavigate('shop')}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30 uppercase tracking-tighter"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in max-w-6xl pb-32 md:pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('shop')} className="p-2 bg-[#1e232e] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">MY <span className="text-blue-500">CART</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-[#1e232e] rounded-3xl border border-gray-800 p-5 md:p-6 flex gap-4 md:gap-6 items-center shadow-2xl">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-black text-sm md:text-xl italic truncate leading-none mb-2 uppercase tracking-tighter">{item.product?.name}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{item.product?.category} • {item.product?.platform}</p>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="text-yellow-400 font-black italic text-lg md:text-2xl tracking-tighter">
                    {item.product?.price.toFixed(2)} DH
                  </div>
                  <div className="flex items-center gap-3 bg-[#0b0e14] px-3 py-2 rounded-xl border border-gray-800">
                    <button 
                      onClick={() => onUpdateQty(item.id, -1)}
                      className="text-gray-400 hover:text-blue-500 transition p-1"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-white font-black w-6 text-center text-sm md:text-base">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQty(item.id, 1)}
                      className="text-gray-400 hover:text-blue-500 transition p-1"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block bg-[#1e232e] rounded-[2rem] border border-gray-800 p-8 shadow-2xl sticky top-24">
          <h2 className="text-xl font-black text-white italic mb-6 border-b border-gray-800 pb-4 uppercase tracking-tighter">Order Totals</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-400">
              <span className="font-bold text-[10px] uppercase tracking-widest">Subtotal</span>
              <span className="font-mono">{total.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span className="font-bold text-[10px] uppercase tracking-widest">Fee</span>
              <span className="font-mono">0.00 DH</span>
            </div>
            <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
              <span className="text-white font-black italic text-lg uppercase tracking-tighter">Total</span>
              <span className="text-3xl font-black text-yellow-400 italic tracking-tighter">{total.toFixed(2)} DH</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30 mb-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Check className="w-6 h-6" /> Secure Checkout
              </>
            )}
          </button>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1e232e]/95 backdrop-blur-lg border-t border-gray-800 p-4 px-6 flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Payment</p>
          <p className="text-2xl font-black text-yellow-400 italic tracking-tighter leading-none">{total.toFixed(2)} DH</p>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-2xl shadow-blue-600/30 active:scale-95 transition-transform disabled:opacity-50 uppercase tracking-tighter"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Pay <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const ProductDetailsModal = ({ product, onClose, onAddToCart }: { product: Product, onClose: () => void, onAddToCart: (p: Product, qty: number) => void }) => {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-gray-800 flex flex-col md:flex-row relative animate-slide-up max-h-[90vh] overflow-y-auto md:overflow-hidden">
        <button onClick={onClose} className="absolute top-4 right-4 z-10 p-3 bg-black/40 rounded-full text-white hover:bg-red-500 transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        </div>

        <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-600/30">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-lg bg-gray-800 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                {product.platform}
              </span>
            </div>
            <h2 className="text-4xl font-black text-white italic mb-6 leading-tight uppercase tracking-tighter">{product.name}</h2>
            <p className="text-gray-400 mb-10 leading-relaxed text-sm font-medium">
              {product.description || "Enhance your gaming journey with this premium digital asset. Safe delivery and satisfaction guaranteed."}
            </p>

            <div className="flex items-center justify-between mb-10 pb-10 border-b border-gray-800">
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Unit Price</p>
                 <p className="text-4xl font-black text-yellow-400 italic tracking-tighter">{product.price.toFixed(2)} DH</p>
               </div>
               <div>
                 <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Shipment</p>
                 <p className="text-sm font-black text-green-400 flex items-center gap-1 uppercase tracking-widest">
                   <Zap className="w-4 h-4" /> Ready
                 </p>
               </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between bg-[#0b0e14] p-4 rounded-2xl border border-gray-800">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Select Qty</span>
                <div className="flex items-center gap-5">
                   <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="p-1 hover:text-blue-400 transition">
                     <Minus className="w-6 h-6" />
                   </button>
                   <span className="text-2xl font-black text-white w-8 text-center">{quantity}</span>
                   <button onClick={() => setQuantity(q => q + 1)} className="p-1 hover:text-blue-400 transition">
                     <Plus className="w-6 h-6" />
                   </button>
                </div>
             </div>

             <button 
               onClick={() => { onAddToCart(product, quantity); onClose(); }}
               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30 uppercase tracking-widest"
             >
               <ShoppingCart className="w-6 h-6" /> Add to Cart — {(product.price * quantity).toFixed(2)} DH
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AUTH SUB-COMPONENTS ---

const LoginForm = ({ onAuthSuccess, onToggle }: { onAuthSuccess: (s: any) => void, onToggle: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (data.session) onAuthSuccess(data.session);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e232e] p-10 rounded-[2rem] border border-gray-800 shadow-2xl animate-fade-in max-w-md mx-auto">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
        <LogIn className="text-blue-500" /> Member Login
      </h2>
      {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" 
            placeholder="player@moonnight.com" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" 
            placeholder="••••••••" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-blue-600/30"
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Enter Marketplace'}
        </button>
      </form>
      
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-800 flex-1"></div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">OR</span>
        <div className="h-px bg-gray-800 flex-1"></div>
      </div>

      <button 
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading} 
        className="w-full bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-widest shadow-xl mb-4 group active:scale-95"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign in with Google
      </button>

      <button onClick={onToggle} className="w-full text-center mt-4 text-[10px] text-gray-500 hover:text-blue-400 transition font-black uppercase tracking-[0.2em]">New to the system? Create Profile</button>
    </div>
  );
};

const SignupForm = ({ onAuthSuccess, onToggle, addToast }: { onAuthSuccess: (s: any) => void, onToggle: () => void, addToast: any }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // --- CLIENT-SIDE VALIDATION ---
    if (!username || username.trim() === '') {
        setError('Gamertag cannot be empty.');
        setLoading(false);
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        setError('Invalid email format.');
        setLoading(false);
        return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
    }

    try {
      // 1. Check if email already exists in Profiles
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email)
        .maybeSingle();

      if (existingUser) {
        throw new Error('User already exists. Attempting login...');
      }

      // 2. Register User
      const { data, error: signupError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { username } }
      });
      
      if (signupError) throw signupError;
      
      let session = data.session;

      // 3. Ensure Session & Save Data (Including Password)
      if (session) {
        const { error: profileError } = await supabase.from('profiles').upsert({ 
          id: session.user.id, 
          email, 
          username, 
          password: password, // SAVING PASSWORD HERE AS REQUESTED
          wallet_balance: 0, 
          vip_level: 0, 
          vip_points: 0,
          avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
        });

        if (profileError) {
           console.error("Profile save error:", profileError);
        }

        addToast('Success', `Welcome, ${username}! Account created.`, 'success');
        onAuthSuccess(session);
      } else {
        // Fallback: If no session, try manual login immediately
        // Note: If 'Confirm Email' is ON in Supabase, this login will fail with "Email not confirmed".
        const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (!signinError && signinData.session) {
             // Save profile if needed (it should be saved by trigger, but just in case)
             await supabase.from('profiles').upsert({ 
                id: signinData.session.user.id, 
                email, 
                username, 
                password: password, 
                wallet_balance: 0, 
                vip_level: 0, 
                vip_points: 0,
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
             });
             addToast('Success', `Welcome, ${username}!`, 'success');
             onAuthSuccess(signinData.session);
        } else {
             // If sign in fails, it likely means email confirmation is required.
             if (signinError?.message?.includes('Email not confirmed')) {
                 addToast('Check Email', 'Confirmation link sent to your email.', 'info');
                 setError('Please confirm your email address to log in.');
             } else {
                 addToast('Account Created', 'Please check your email or try logging in.', 'info');
                 onToggle(); 
             }
        }
      }
    } catch (err: any) {
      let msg = err.message || 'Signup failed. Try again.';
      
      // CHECK FOR RATE LIMIT OR 429 STATUS
      const isRateLimit = msg.toUpperCase().includes('RATE LIMIT') || 
                          msg.toUpperCase().includes('TOO MANY REQUESTS') || 
                          err.status === 429;
                          
      const isUserExists = msg.toUpperCase().includes('USER ALREADY EXISTS') || msg.includes('User already exists');
      const isAlreadyRegistered = msg.toLowerCase().includes('already registered');

      if (isRateLimit) {
         msg = "System busy (Rate Limit). Please wait a moment or log in.";
         // Do not auto-login if rate limited, it just causes more errors.
      } else if (isUserExists || isAlreadyRegistered) {
         try {
            // Only try auto-login if the error was purely about existence, not rate limiting.
            const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
            if (!loginError && loginData.session) {
               addToast('Welcome', 'Account existed. Logged in successfully.', 'success');
               onAuthSuccess(loginData.session);
               return;
            } else {
               msg = "User already exists. Please log in.";
            }
         } catch (innerErr) {
            // ignore internal login error
         }
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e232e] p-10 rounded-[2rem] border border-gray-800 shadow-2xl animate-fade-in max-w-md mx-auto">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
        <UserPlus className="text-purple-500" /> New Profile
      </h2>
      {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Gamertag</label>
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none transition-all shadow-inner" placeholder="Choose username" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none transition-all shadow-inner" placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-purple-600/30">
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Register Now'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-800 flex-1"></div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">OR</span>
        <div className="h-px bg-gray-800 flex-1"></div>
      </div>

      <button 
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading} 
        className="w-full bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-4 uppercase tracking-widest shadow-xl mb-4 group active:scale-95"
      >
        <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
        Sign up with Google
      </button>

      <button onClick={onToggle} className="w-full text-center mt-8 text-[10px] text-gray-500 hover:text-purple-400 transition font-black uppercase tracking-[0.2em]">Already registered? Log In</button>
    </div>
  );
};

// --- Dashboard Component ---

const Dashboard = ({ session, addToast, onSignOut, onNavigate, setSession }: { session: any, addToast: any, onSignOut: () => void, onNavigate: (p: string) => void, setSession: (s: any) => void }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet'>('overview');
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');

  const isGuest = session?.user?.id === 'guest-user-123';

  const fetchData = useCallback(async () => {
    if (session?.user) {
        if (isGuest) {
            setProfile({
                id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Gamer',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00, vip_level: 0, vip_points: 0
            });
            setOrders([]);
        } else {
            const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (pData) setProfile(pData);
            const { data: oData } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (oData) setOrders(oData);
        }
    }
  }, [session, isGuest]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isGuest && authMode === 'login') return <div className="py-20"><LoginForm onAuthSuccess={s => { setSession(s); setAuthMode('none'); }} onToggle={() => setAuthMode('signup')} /></div>;
  if (isGuest && authMode === 'signup') return <div className="py-20"><SignupForm addToast={addToast} onAuthSuccess={s => { if(s) setSession(s); setAuthMode('none'); }} onToggle={() => setAuthMode('login')} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in pb-20">
       <div className="relative rounded-[2rem] overflow-hidden mb-12 shadow-2xl bg-[#1e232e]">
          <div className="h-48 bg-gradient-to-r from-blue-900 via-purple-900 to-[#1e232e]"></div>
          <div className="px-8 pb-10 flex flex-col md:flex-row items-end -mt-16 gap-8">
              <div className="w-40 h-40 rounded-3xl border-8 border-[#0b0e14] bg-[#1e232e] overflow-hidden shadow-2xl flex-shrink-0">
                 <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="Profile Avatar" />
              </div>
              <div className="flex-1 pb-2">
                 <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1 leading-none">{profile?.username}</h1>
                 <p className="text-gray-500 font-bold text-sm tracking-wide">{profile?.email}</p>
                 {!isGuest && <span className="bg-blue-600/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase mt-3 inline-block border border-blue-600/30 tracking-widest shadow-lg">Verified System Player</span>}
              </div>
               <div className="flex flex-col items-end gap-3 pb-2 w-full md:w-auto">
                 <div className="bg-[#0b0e14]/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-blue-500/30 flex items-center gap-4 shadow-2xl w-full md:w-auto">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Solde Balance</p>
                        <p className="text-3xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                    </div>
                    <Wallet className="w-10 h-10 text-blue-500 opacity-80"/>
                 </div>
                 {isGuest ? (
                     <div className="flex gap-3 mt-2 w-full">
                        <button onClick={() => setAuthMode('login')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black shadow-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Log In</button>
                        <button onClick={() => setAuthMode('signup')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-black shadow-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Sign Up</button>
                     </div>
                 ) : (
                    <button onClick={onSignOut} className="w-full bg-red-900/10 text-red-500 border border-red-500/20 px-8 py-3 rounded-2xl font-black hover:bg-red-900/20 transition text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"><LogOut className="w-4 h-4"/> Logout System</button>
                 )}
              </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-[#1e232e] rounded-[2rem] overflow-hidden border border-gray-800 shadow-2xl h-fit">
             <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Dashboard</button>
             <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Orders</button>
             <button onClick={() => setActiveTab('wallet')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'wallet' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Wallet</button>
          </div>
          <div className="lg:col-span-3">
             {activeTab === 'overview' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><Gamepad2 className="w-48 h-48" /></div>
                        <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase relative z-10 leading-none">Welcome, {profile?.username}!</h2>
                        <p className="text-blue-100 font-black uppercase text-[11px] tracking-[0.3em] relative z-10 opacity-80">{isGuest ? "GUEST MODE: PROFILE NOT SYNCED" : "SECURE MARKETPLACE HUB ACTIVE"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl hover:border-blue-500/20 transition-all">
                           <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3">Verified Commands</p>
                           <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{orders.length}</h3>
                        </div>
                        <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl hover:border-yellow-500/20 transition-all">
                           <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3">Live Solde</p>
                           <h3 className="text-5xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2)} DH</h3>
                        </div>
                    </div>
                </div>
             )}
             {activeTab === 'orders' && (
                <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl">
                   <h3 className="font-black text-white text-2xl mb-8 italic uppercase tracking-tighter">Trade History</h3>
                   {orders.length === 0 ? <p className="text-gray-600 uppercase text-[10px] font-black tracking-widest py-10 text-center border-2 border-dashed border-gray-800 rounded-3xl">No logs found.</p> : (
                       <div className="space-y-4">
                           {orders.map(o => (
                               <div key={o.id} className="p-6 bg-[#0b0e14] rounded-3xl flex justify-between items-center border border-gray-800 hover:border-blue-500/30 transition-all shadow-xl">
                                   <div>
                                     <p className="font-black text-white uppercase tracking-tighter text-lg leading-none mb-1">Trade #{o.id.slice(0,8)}</p>
                                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="font-black text-green-400 italic text-2xl tracking-tighter leading-none">{o.total_amount.toFixed(2)} DH</p>
                                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Status: {o.status}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

// --- HomePage Component ---

const HomePage = ({ onNavigate, onSelectCategory }: { onNavigate: (p: string) => void, onSelectCategory: (c: string) => void }) => {
  return (
    <div className="animate-fade-in">
      <section className="relative h-[750px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover opacity-50"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0e14] via-[#0b0e14]/90 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0b0e14]"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-blue-600/10 border border-blue-600/40 text-blue-400 text-[11px] font-black uppercase tracking-[0.4em] mb-10 shadow-2xl">
              <Star className="w-4 h-4 fill-blue-400" /> Premium Gaming Marketplace
            </div>
            <h1 className="text-7xl md:text-[10rem] font-black italic tracking-tighter text-white leading-[0.85] mb-10 uppercase">
              MOON <span className="text-blue-500">NIGHT</span><br />
              <span className="text-cyan-400">STORE</span>
            </h1>
            <p className="text-base md:text-xl text-gray-400 mb-12 leading-relaxed font-bold uppercase tracking-[0.2em] max-w-xl opacity-80">
              Elite gaming inventory, instant fulfillment, and 24/7 security since 2014.
            </p>
            <div className="flex flex-wrap gap-6">
              <button 
                onClick={() => onNavigate('shop')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-16 py-6 rounded-3xl font-black text-2xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_60px_rgba(37,99,235,0.4)] flex items-center gap-4 uppercase tracking-tighter"
              >
                Browse Shop <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#0b0e14]">
        <div className="container mx-auto px-4">
          <div className="mb-24 text-center md:text-left">
            <p className="text-blue-500 font-black uppercase text-[12px] tracking-[0.4em] mb-4">Elite Departments</p>
            <h2 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-none">Global Inventory</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {[
              { id: GameCategory.COINS, icon: Coins, label: 'Coins', color: 'from-yellow-400/20' },
              { id: GameCategory.TOP_UP, icon: Zap, label: 'Top-Ups', color: 'from-blue-400/20' },
              { id: GameCategory.ITEMS, icon: Sword, label: 'Items', color: 'from-red-400/20' },
              { id: GameCategory.BOOSTING, icon: ArrowUpCircle, label: 'Boosting', color: 'from-green-400/20' },
              { id: GameCategory.GIFT_CARD, icon: Gift, label: 'Cards', color: 'from-purple-400/20' },
            ].map((cat) => (
              <button 
                key={cat.id}
                onClick={() => { onSelectCategory(cat.id); onNavigate('shop'); }}
                className="group relative bg-[#1e232e] border border-gray-800 p-12 rounded-[3rem] flex flex-col items-center gap-8 hover:border-blue-500 transition-all duration-500 overflow-hidden shadow-2xl hover:-translate-y-4"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                <div className="relative z-10 text-gray-500 group-hover:text-blue-400 transition-all duration-500 group-hover:scale-125">
                  <cat.icon size={64} strokeWidth={1.5} />
                </div>
                <span className="relative z-10 font-black text-gray-400 group-hover:text-white uppercase tracking-[0.3em] text-[11px]">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- ADMIN PASSWORD COMPONENT ---

const AdminLockScreen = ({ onSuccess }: { onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fouad12jad1///') {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#1e232e] p-16 rounded-[3.5rem] border border-gray-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-red-500 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
           <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">SYSTEM LOCK</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Authorization Required</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
             <input 
              type="password" 
              required 
              autoFocus
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className={`w-full bg-[#0b0e14] border ${error ? 'border-red-500' : 'border-gray-800'} rounded-[1.5rem] p-6 text-center text-white focus:border-blue-500 outline-none transition-all font-mono tracking-[0.8em] text-2xl shadow-inner placeholder:opacity-20`}
              placeholder="••••••••"
             />
             {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 animate-pulse tracking-[0.3em]">Access Denied: Invalid Key</p>}
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[1.5rem] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 text-[12px]">
             Unlock Core <Key className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

// --- ShopGrid Component ---

const ShopGrid = ({ category, onProductClick }: { category: string | null, onProductClick: (p: Product) => void }) => {
   const [products, setProducts] = useState<Product[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
     setIsLoading(true);
     let query = supabase.from('products').select('*');
     if (category) query = query.eq('category', category);
     query.then(({ data }) => { 
       if (data) setProducts(data); 
       setIsLoading(false);
     }); 
   }, [category]);

   if (isLoading) return (
     <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[1,2,3,4,5,6,7,8].map(n => (
          <div key={n} className="bg-[#1e232e] rounded-[2.5rem] h-80 md:h-[30rem] animate-pulse border border-gray-800"></div>
        ))}
     </div>
   );

   if (products.length === 0) return (
     <div className="py-40 text-center">
       <div className="bg-[#1e232e] w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 text-gray-800 border border-gray-800 shadow-3xl">
         <ShoppingCart className="w-16 h-16" />
       </div>
       <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">No Supply Found</h3>
       <p className="text-gray-600 text-[11px] font-black uppercase tracking-[0.4em] mt-4"> restocking system scheduled.</p>
     </div>
   );

   return (
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
                   <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xl px-2.5 py-1 rounded-lg text-[8px] font-black text-white border border-white/10 uppercase tracking-widest shadow-2xl">
                      {p.platform.toUpperCase()}
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
   );
};

// --- App Root ---

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);

  const addToast = (title: string, message: string, type: 'success'|'error'|'info' = 'info') => {
     const id = Math.random().toString(36).substr(2, 9);
     setToasts(prev => [...prev, { id, title, message, type }]);
     setTimeout(() => setToasts(curr => curr.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setSession(session);
      else setSession({ user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
      setIsSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s) setSession(s);
      else setSession({ user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
    });
    return () => subscription.unsubscribe();
  }, []);

  // NEW: Fetch Cart from Database when session changes
  useEffect(() => {
    const fetchCart = async () => {
      const isGuest = session?.user?.id === 'guest-user-123';
      if (!isGuest && session?.user) {
        const { data } = await supabase
          .from('cart_items')
          .select('*, product:products(*)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: true });
        
        if (data) setCart(data as CartItem[]);
      } else if (isGuest) {
        setCart([]); // Reset local cart on guest/logout
      }
    };
    fetchCart();
  }, [session]);

  const handleNavigate = (page: string) => { 
    window.scrollTo(0,0); 
    setCurrentPage(page);
    if (page !== 'shop') setSelectedCategory(null);
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
     const isGuest = session?.user?.id === 'guest-user-123';
     
     if (isGuest) {
       // Guest: Local State Only
       const existingIndex = cart.findIndex(item => item.product_id === product.id);
       if (existingIndex > -1) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += quantity;
          setCart(newCart);
       } else {
          setCart([...cart, { id: Math.random().toString(36).substr(2,9), product_id: product.id, quantity, product }]);
       }
     } else {
       // Authenticated: Save to Supabase
       // 1. Check if item exists
       const { data: existing } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('product_id', product.id)
          .single();

       if (existing) {
          // Update Qty
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + quantity })
            .eq('id', existing.id);
       } else {
          // Insert New
          await supabase
            .from('cart_items')
            .insert({
               user_id: session.user.id,
               product_id: product.id,
               quantity
            });
       }

       // Refresh Cart
       const { data: updatedCart } = await supabase
         .from('cart_items')
         .select('*, product:products(*)')
         .eq('user_id', session.user.id)
         .order('created_at', { ascending: true });
         
       if (updatedCart) setCart(updatedCart as CartItem[]);
     }
     
     addToast('Success', `Inventory added to cart.`, 'success');
  };

  const handleUpdateCartQty = async (itemId: string, delta: number) => {
    const isGuest = session?.user?.id === 'guest-user-123';
    
    if (isGuest) {
      setCart(prev => prev.map(item => {
        if (item.id === itemId) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }));
    } else {
      const item = cart.find(i => i.id === itemId);
      if (item) {
        const newQty = Math.max(1, item.quantity + delta);
        await supabase.from('cart_items').update({ quantity: newQty }).eq('id', itemId);
        
        // Optimistic update locally
        setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: newQty } : i));
      }
    }
  };

  const handleRemoveFromCart = async (itemId: string) => {
    const isGuest = session?.user?.id === 'guest-user-123';
    const item = cart.find(i => i.id === itemId);

    if (isGuest) {
       setCart(prev => prev.filter(i => i.id !== itemId));
    } else {
       await supabase.from('cart_items').delete().eq('id', itemId);
       setCart(prev => prev.filter(i => i.id !== itemId));
    }
    
    if (item) addToast('Removed', `${item.product?.name} removed.`, 'info');
  };

  const handleClearCart = async () => {
    const isGuest = session?.user?.id === 'guest-user-123';
    if (!isGuest) {
      await supabase.from('cart_items').delete().eq('user_id', session.user.id);
    }
    setCart([]);
  };

  if (isSessionLoading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-blue-500"/></div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar session={session} onNavigate={handleNavigate} cartCount={cart.length} />
      
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate} 
            onSelectCategory={setSelectedCategory} 
          />
        )}
        
        {currentPage === 'shop' && (
          <div className="container mx-auto px-4 py-24 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-8">
               <div>
                  <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">SYSTEM SHOP</h1>
                  <p className="text-gray-600 text-[12px] uppercase tracking-[0.4em] font-black">{selectedCategory ? `Department: ${selectedCategory}` : 'All Global Inventory'}</p>
               </div>
               <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide max-w-full">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-[0.2em] shadow-2xl ${!selectedCategory ? 'bg-blue-600 text-white' : 'bg-[#1e232e] text-gray-400 hover:text-white border border-gray-800'}`}
                  >
                    ALL DEPTS
                  </button>
                  {Object.values(GameCategory).map(cat => (
                    <button 
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-[0.2em] shadow-2xl ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-[#1e232e] text-gray-400 hover:text-white border border-gray-800'}`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>
            
            <ShopGrid 
              category={selectedCategory} 
              onProductClick={(p) => setSelectedProduct(p)} 
            />
          </div>
        )}

        {currentPage === 'cart' && (
          <CartPage 
            cart={cart} 
            session={session}
            onUpdateQty={handleUpdateCartQty} 
            onRemove={handleRemoveFromCart} 
            onNavigate={handleNavigate} 
            onClearCart={handleClearCart}
            addToast={addToast}
          />
        )}
        
        {currentPage === 'dashboard' && (
          <Dashboard 
            session={session} 
            setSession={setSession} 
            addToast={addToast} 
            onNavigate={handleNavigate} 
            onSignOut={() => { 
              supabase.auth.signOut(); 
              setSession({ user: { id: 'guest-user-123', email: 'guest@moonnight.com' } }); 
              handleNavigate('home'); 
            }} 
          />
        )}

        {currentPage === 'admin' && (
          isAdminAuthenticated ? (
            <AdminPanel session={session} addToast={addToast} />
          ) : (
            <AdminLockScreen onSuccess={() => setIsAdminAuthenticated(true)} />
          )
        )}
      </main>

      <Footer onNavigate={handleNavigate} />
      
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart}
        />
      )}
      
      <ToastContainer toasts={toasts} removeToast={id => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;