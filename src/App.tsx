
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Product, CartItem, GameCategory, Tournament, Announcement } from './types';
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
import { Loader2, Zap, AlertCircle, TrendingUp, Users, ShoppingBag, Bell, Activity, ArrowRight } from 'lucide-react';

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
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 20s linear infinite;
        }
        .animate-marquee-slow {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 30s linear infinite;
        }
        .animate-marquee-fast {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 15s linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      {currentPage !== 'admin' && (
          <Navbar 
            session={session} onNavigate={handleNavigate} cartCount={cart.length} 
            onSearch={handleSearch} language={language} setLanguage={setLanguage}
            onProductSelect={(p) => setSelectedProduct(p)}
          />
      )}
      
      <main className="flex-grow">
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
            
            {/* 3-LINE NOTIFICATION BAR SECTION */}
            <div className="mb-12 space-y-2">
                {/* Line 1: Global Status */}
                <div className="bg-blue-600/10 border border-blue-500/20 h-8 rounded-full overflow-hidden flex items-center group">
                    <div className="bg-blue-600 h-full px-4 flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                        <Activity className="w-3 h-3 text-white animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">Global Status</span>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        <div className="animate-marquee whitespace-nowrap py-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em] px-8">System fully operational • Instant delivery active for all digital items • 2,400+ trades completed today • New LoL accounts restocked</span>
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-[0.1em] px-8">System fully operational • Instant delivery active for all digital items • 2,400+ trades completed today • New LoL accounts restocked</span>
                        </div>
                    </div>
                </div>

                {/* Line 2: Hot Deals / Promotions */}
                <div className="bg-pink-600/10 border border-pink-500/20 h-8 rounded-full overflow-hidden flex items-center group">
                    <div className="bg-pink-600 h-full px-4 flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                        <Zap className="w-3 h-3 text-white fill-current" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">Hot Deals</span>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        <div className="animate-marquee-slow whitespace-nowrap py-1">
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.1em] px-8">Flash Sale: 20% OFF on all Gift Cards with code MOON20 • Elite members get double points this weekend • Refer a friend and earn 10 DH instantly</span>
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.1em] px-8">Flash Sale: 20% OFF on all Gift Cards with code MOON20 • Elite members get double points this weekend • Refer a friend and earn 10 DH instantly</span>
                        </div>
                    </div>
                </div>

                {/* Line 3: Community / Recent activity */}
                <div className="bg-cyan-600/10 border border-cyan-500/20 h-8 rounded-full overflow-hidden flex items-center group">
                    <div className="bg-cyan-600 h-full px-4 flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
                        <Users className="w-3 h-3 text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">Live Feed</span>
                    </div>
                    <div className="flex-1 relative overflow-hidden">
                        <div className="animate-marquee-fast whitespace-nowrap py-1">
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.1em] px-8">User Zakaria just won 500 PTS on Spin Wheel • Welcome new Elite member: FouadGaming • Discord community reached 15,400 members!</span>
                            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.1em] px-8">User Zakaria just won 500 PTS on Spin Wheel • Welcome new Elite member: FouadGaming • Discord community reached 15,400 members!</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SHOP HEADER & CATEGORY GRID (3 LINES) */}
            <div className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-16">
               <div className="max-w-md">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-600/10 border border-blue-500/20 text-blue-500 text-[8px] font-black uppercase tracking-[0.2em] mb-4">
                     <Bell className="w-3 h-3" /> Core Inventory
                  </div>
                  <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-4">MOON<br/><span className="text-blue-500">MARKET</span></h1>
                  <p className="text-gray-500 text-[11px] font-bold uppercase tracking-widest leading-relaxed">
                      {searchQuery ? `SCANNING SYSTEM FOR: "${searchQuery}"` : (selectedCategory ? `ACTIVE DEPOT: ${selectedCategory.toUpperCase()}` : 'SCANNING GLOBAL INVENTORY HUBS...')}
                  </p>
               </div>

               {/* REFINED 3-COLUMN CATEGORY GRID */}
               <div className="w-full lg:max-w-2xl grid grid-cols-2 md:grid-cols-3 gap-3">
                  <button 
                    onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} 
                    className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 group shadow-2xl ${!selectedCategory && !searchQuery ? 'bg-blue-600 border-blue-400 text-white scale-[1.02]' : 'bg-[#151a23] border-white/5 text-gray-500 hover:border-blue-500/30'}`}
                  >
                    <ShoppingBag className={`w-5 h-5 ${!selectedCategory && !searchQuery ? 'text-white' : 'text-gray-600 group-hover:text-blue-400'}`} />
                    <span className="text-[9px] font-black uppercase tracking-widest">All Core</span>
                  </button>
                  
                  {Object.values(GameCategory).map(cat => (
                    <button 
                        key={cat} 
                        onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }} 
                        className={`h-20 rounded-2xl border transition-all flex flex-col items-center justify-center gap-1 group shadow-2xl relative overflow-hidden ${selectedCategory === cat ? 'bg-white/5 border-blue-500 text-blue-400' : 'bg-[#151a23] border-white/5 text-gray-500 hover:border-white/20'}`}
                    >
                        {selectedCategory === cat && <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
                        <span className={`text-[10px] font-black uppercase tracking-tighter text-center px-2 leading-tight ${selectedCategory === cat ? 'text-white' : 'group-hover:text-gray-300'}`}>{cat}</span>
                        <span className="text-[7px] font-bold opacity-40 uppercase tracking-widest">Verified</span>
                    </button>
                  ))}
               </div>
            </div>
            
            <ShopGrid category={selectedCategory} searchQuery={searchQuery} onProductClick={(p) => setSelectedProduct(p)} language={language} />
          </div>
        )}
        
        {currentPage === 'dashboard' && <Dashboard session={session} setSession={setSession} addToast={addToast} onNavigate={handleNavigate} initialOrderId={targetOrderId} initialTab={dashboardTab} onSignOut={() => handleNavigate('home')} />}
        {currentPage === 'admin' && (adminRole !== 'none' ? <AdminPanel session={session} addToast={addToast} role={adminRole} /> : <AdminLockScreen onSuccess={setAdminRole} />)}
        
        {/* Other Pages */}
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
      </main>

      {currentPage !== 'admin' && <Footer onNavigate={handleNavigate} session={session} addToast={addToast} />}
      
      {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onSwitchProduct={setSelectedProduct} addToast={addToast} />}
      <ToastContainer toasts={toasts} removeToast={id => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;
