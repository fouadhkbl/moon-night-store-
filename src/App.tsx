
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Product, CartItem, GameCategory, Tournament } from './types';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastContainer } from './components/ToastContainer';
import { AdminPanel } from './components/Admin/AdminPanel';
import { AdminLockScreen } from './components/Admin/AdminLockScreen';
import { ShopGrid } from './components/Shop/ShopGrid';
import { ProductDetailsModal } from './components/Shop/ProductDetailsModal';
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { Dashboard } from './pages/Dashboard';
import { TopUpPage } from './pages/TopUpPage';
import { PointsShopPage } from './pages/PointsShopPage';
import { DonatePage } from './pages/DonatePage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { TournamentsPage } from './pages/TournamentsPage';
import { TournamentDetailsPage } from './pages/TournamentDetailsPage';
import { LootBoxPage } from './pages/LootBoxPage';
import { ElitePage } from './pages/ElitePage';
import { SpinWheelPage } from './pages/SpinWheelPage';
import { LiveActivitySidebar } from './components/Social/LiveActivitySidebar';
import { Loader2, Bell, Activity, Zap, Users, ShoppingBag, ShieldCheck, Headphones, Filter, ChevronRight, Crown, Sparkles, Star, Search } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [adminRole, setAdminRole] = useState<'none' | 'full' | 'limited' | 'shop'>('none');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'orders' | 'wallet' | 'points'>('overview');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  const addToast = (title: string, message: string, type: 'success'|'error'|'info' = 'info') => {
     const id = Math.random().toString(36).substr(2, 9);
     setToasts(prev => [...prev, { id, title, message, type }]);
     setTimeout(() => setToasts(curr => curr.filter(t => t.id !== id)), 4000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s || { user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
      setIsSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || { user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    supabase.from('orders').select('*', { count: 'exact', head: true }).then(({ count }) => {
      if (count !== null) setOrdersCount(count);
    });
  }, []);

  const handleNavigate = (page: string) => { 
    window.scrollTo(0,0); 
    if (page === 'dashboard-points') { setDashboardTab('points'); setCurrentPage('dashboard'); }
    else if (page === 'dashboard') { if (currentPage !== 'dashboard') setDashboardTab('overview'); setCurrentPage('dashboard'); }
    else if (page === 'shop') {
        setSearchQuery('');
        setCurrentPage('shop');
    }
    else {
        setCurrentPage(page);
        setSelectedCategory(null); 
        setSearchQuery('');
    }
  };

  const handleSearch = (q: string) => { 
    setSearchQuery(q); 
    setSelectedCategory(null); 
    setCurrentPage('shop'); 
    window.scrollTo(0,0); 
  };

  const handleAddToCart = async (product: Product, quantity: number) => {
     const isGuest = session?.user?.id === 'guest-user-123';
     if (isGuest) {
       const existingIndex = cart.findIndex(item => item.product_id === product.id);
       if (existingIndex > -1) {
          const newCart = [...cart];
          newCart[existingIndex].quantity += quantity;
          setCart(newCart);
       } else {
          setCart([...cart, { id: Math.random().toString(36).substr(2,9), product_id: product.id, quantity, product }]);
       }
     } else {
       await supabase.from('cart_items').insert({ user_id: session.user.id, product_id: product.id, quantity });
       const { data } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', session.user.id);
       if (data) setCart(data as CartItem[]);
     }
     addToast('Success', `Added to cart.`, 'success');
  };

  if (isSessionLoading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-10 h-10 animate-spin text-blue-500"/></div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col selection:bg-blue-600/50">
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-container {
          display: flex;
          overflow: hidden;
          white-space: nowrap;
          width: 100%;
        }
        .marquee-content {
          display: flex;
          animation: marquee 30s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .custom-shop-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.3);
          border-radius: 10px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }

        .ambient-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            background: 
                radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 100% 100%, rgba(124, 58, 237, 0.05) 0%, transparent 50%),
                radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.2) 0%, transparent 100%);
            pointer-events: none;
        }
      `}</style>

      <div className="ambient-bg">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03]"></div>
      </div>

      {currentPage !== 'admin' && (
          <Navbar 
            session={session} onNavigate={handleNavigate} cartCount={cart.length} 
            onSearch={handleSearch} language={language} setLanguage={setLanguage}
            onProductSelect={(p) => setSelectedProduct(p)}
          />
      )}
      
      <main className="flex-grow relative z-10 flex">
        <div className="flex-1 min-w-0">
            {currentPage === 'home' && (
                <HomePage 
                    onNavigate={handleNavigate} 
                    onSelectCategory={(cat) => { setSelectedCategory(cat); handleNavigate('shop'); }} 
                    onSearch={handleSearch} 
                    language={language} 
                />
            )}
            
            {currentPage === 'shop' && (
              <div className="container mx-auto px-4 py-8 animate-fade-in pb-24">
                
                {/* GLOBAL INTERACTION BAR */}
                <div className="mb-6">
                    <button 
                        onClick={() => setIsActivityOpen(!isActivityOpen)}
                        className="w-full bg-[#1e232e] border border-white/5 h-10 rounded-xl overflow-hidden flex items-center group shadow-xl hover:border-blue-500/30 transition-all text-left"
                    >
                        <div className="bg-blue-600 h-full px-4 flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.3)]">
                            <Activity className="w-3 h-3 text-white animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">Live Feed</span>
                        </div>
                        <div className="flex-1 marquee-container">
                            <div className="marquee-content items-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-10">Click to toggle the social feed • Global Milestone: Reach 50 orders today for +15% XP • New items added to Accounts depot</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-10">Click to toggle the social feed • Global Milestone: Reach 50 orders today for +15% XP • New items added to Accounts depot</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* ELITE ADVERTISEMENT RIBBON (SMALLER) */}
                <div className="mb-8 relative group cursor-pointer" onClick={() => handleNavigate('elite')}>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-900 rounded-2xl blur-lg opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative bg-[#1e232e] border border-yellow-500/10 rounded-2xl p-4 md:p-6 overflow-hidden flex items-center justify-between shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-[3s]"><Crown className="w-32 h-32 text-yellow-500" /></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,179,8,0.3)] border-2 border-[#0b0e14]">
                                <Crown className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                                <h2 className="text-lg md:text-2xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">Elite Protocol <span className="text-yellow-500">Active</span></h2>
                                <p className="text-yellow-400/60 text-[8px] font-black uppercase tracking-widest">Lifetime VIP Privileges & Points Bonus</p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-2 mr-4">
                            {["-5% OFF", "5K PTS"].map(tag => (
                                <span key={tag} className="bg-yellow-500/5 border border-yellow-500/20 px-3 py-1 rounded-lg text-[8px] font-black text-yellow-500 uppercase tracking-widest">{tag}</span>
                            ))}
                        </div>
                        <button className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 relative z-10">
                            Join <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* HORIZONTAL CATEGORY CEINTURE (SCROLLABLE) */}
                <div className="sticky top-16 z-40 mb-10">
                   <div className="bg-[#151a23]/90 backdrop-blur-3xl border border-white/5 rounded-2xl flex items-center shadow-2xl overflow-hidden">
                      <div className="px-5 border-r border-white/5 hidden md:flex items-center gap-2 text-blue-500 flex-shrink-0">
                         <Filter className="w-3.5 h-3.5" />
                         <span className="text-[9px] font-black uppercase tracking-widest">Depots</span>
                      </div>
                      
                      {/* SCROLLABLE AREA */}
                      <div className="flex-1 flex items-center gap-1 overflow-x-auto custom-shop-scrollbar px-3 py-2">
                        <button 
                            onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} 
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 group ${!selectedCategory && !searchQuery ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Global Depot</span>
                        </button>
                        
                        {Object.values(GameCategory).map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }} 
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 group relative ${selectedCategory === cat ? 'text-blue-400 bg-blue-400/5' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className={`w-1 h-1 rounded-full transition-all ${selectedCategory === cat ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)] scale-100' : 'bg-gray-700 scale-0 group-hover:scale-100'}`}></div>
                                <span className="text-[9px] font-black uppercase tracking-widest">{cat}</span>
                                {selectedCategory === cat && (
                                    <div className="absolute -bottom-2 left-4 right-4 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                )}
                            </button>
                        ))}
                      </div>

                      <div className="px-5 border-l border-white/5 flex items-center flex-shrink-0">
                         <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-lg">
                            <Search className="w-3.5 h-3.5 text-gray-500" />
                         </div>
                      </div>
                   </div>
                </div>

                {/* MAIN CONTENT AREA */}
                <div className="w-full">
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                        <div>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> ACTIVE SYSTEM SCAN
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                            {searchQuery ? `"${searchQuery.toUpperCase()}"` : (selectedCategory?.toUpperCase() || 'GLOBAL DEPOT')}
                        </h1>
                        </div>
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <div className="flex gap-1 mb-1">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />)}
                                </div>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Verified Seller Status</span>
                            </div>
                        </div>
                    </div>
                    
                    <ShopGrid category={selectedCategory} searchQuery={searchQuery} onProductClick={(p) => setSelectedProduct(p)} language={language} />
                </div>
              </div>
            )}
            
            {currentPage === 'dashboard' && <Dashboard session={session} setSession={setSession} addToast={addToast} onNavigate={handleNavigate} initialOrderId={targetOrderId} initialTab={dashboardTab} onSignOut={() => handleNavigate('home')} />}
            {currentPage === 'admin' && (adminRole !== 'none' ? <AdminPanel session={session} addToast={addToast} role={adminRole} /> : <AdminLockScreen onSuccess={setAdminRole} />)}
            
            {currentPage === 'cart' && <CartPage cart={cart} onUpdateQty={() => {}} onRemove={() => {}} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'checkout' && <CheckoutPage cart={cart} session={session} onNavigate={handleNavigate} onViewOrder={() => {}} onClearCart={() => {}} addToast={addToast} />}
            {currentPage === 'topup' && <TopUpPage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'pointsShop' && <PointsShopPage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'donate' && <DonatePage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'leaderboard' && <LeaderboardPage onNavigate={handleNavigate} />}
            {currentPage === 'tournaments' && <TournamentsPage onNavigate={handleNavigate} onSelectTournament={setSelectedTournament as any} />}
            {currentPage === 'tournament-details' && <TournamentDetailsPage tournament={selectedTournament} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'loot' && <LootBoxPage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'elite' && <ElitePage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'spin' && <SpinWheelPage session={session} onNavigate={handleNavigate} addToast={addToast} />}
        </div>

        {/* Real-time Activity Sidebar */}
        {['shop', 'loot', 'spin', 'home'].includes(currentPage) && (
            <LiveActivitySidebar isOpen={isActivityOpen} onClose={() => setIsActivityOpen(false)} />
        )}
      </main>

      {currentPage !== 'admin' && <Footer onNavigate={handleNavigate} session={session} addToast={addToast} />}
      
      {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onSwitchProduct={setSelectedProduct} addToast={addToast} />}
      <ToastContainer toasts={toasts} removeToast={id => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;
