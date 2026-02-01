
import React, { useState, useEffect, useCallback } from 'react';
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
import { TournamentApplyPage } from './pages/TournamentApplyPage';
import { LootBoxPage } from './pages/LootBoxPage';
import { ElitePage } from './pages/ElitePage';
import { SpinWheelPage } from './pages/SpinWheelPage';
import { FaqPage } from './pages/FaqPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { LiveActivitySidebar } from './components/Social/LiveActivitySidebar';
import { Loader2, Activity, Zap, ShoppingBag, Filter, ChevronRight, Crown, Star, Search, X } from 'lucide-react';

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
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'orders' | 'wallet' | 'points' | 'events'>('overview');
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [isActivityOpen, setIsActivityOpen] = useState(false);

  // Live Feed Settings
  const [liveFeedText, setLiveFeedText] = useState('Welcome to the Shop • System Active • New items added daily');
  const [liveFeedBadge, setLiveFeedBadge] = useState('Status');
  const [liveFeedColor, setLiveFeedColor] = useState('#2563eb');
  const [liveFeedSpeed, setLiveFeedSpeed] = useState('30s');

  const addToast = (title: string, message: string, type: 'success'|'error'|'info' = 'info') => {
     const id = Math.random().toString(36).substr(2, 9);
     setToasts(prev => [...prev, { id, title, message, type }]);
     setTimeout(() => setToasts(curr => curr.filter(t => t.id !== id)), 4000);
  };

  // IP Logging Logic
  const logAuditEntry = useCallback(async (userId?: string) => {
    try {
      const res = await fetch('https://api64.ipify.org?format=json');
      const { ip } = await res.json();
      await supabase.from('access_logs').insert({
        ip_address: ip,
        user_id: userId || null,
        user_agent: navigator.userAgent
      });
    } catch (e) {
      console.error("Audit log failed:", e);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      const guestSess = { user: { id: 'guest-user-123', email: 'guest@moonnight.com' } };
      setSession(s || guestSess);
      logAuditEntry(s?.user?.id);
      setIsSessionLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s || { user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
    });
    return () => subscription.unsubscribe();
  }, [logAuditEntry]);

  // Fetch Live Feed Settings
  useEffect(() => {
    const fetchLiveFeedSettings = async () => {
        const { data } = await supabase.from('app_settings').select('*').in('key', ['live_feed_text', 'live_feed_badge', 'live_feed_color', 'live_feed_speed']);
        if (data) {
            data.forEach(setting => {
                if (setting.key === 'live_feed_text') setLiveFeedText(setting.value);
                if (setting.key === 'live_feed_badge') setLiveFeedBadge(setting.value);
                if (setting.key === 'live_feed_color') setLiveFeedColor(setting.value);
                if (setting.key === 'live_feed_speed') setLiveFeedSpeed(setting.value);
            });
        }
    };
    fetchLiveFeedSettings();
    
    const channel = supabase.channel('live-settings-update')
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings' }, () => {
            fetchLiveFeedSettings();
        }).subscribe();
        
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleNavigate = (page: string) => { 
    window.scrollTo(0,0); 
    if (page === 'dashboard-points') { setDashboardTab('points'); setCurrentPage('dashboard'); }
    else if (page === 'dashboard-events') { setDashboardTab('events'); setCurrentPage('dashboard'); }
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
     addToast('Success', `Item added to cart.`, 'success');
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
          animation: marquee ${liveFeedSpeed} linear infinite;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        
        .custom-shop-scrollbar::-webkit-scrollbar {
          height: 6px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-shop-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.4);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .custom-shop-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(37, 99, 235, 0.7);
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

        .gold-shimmer {
          background: linear-gradient(110deg, #bf953f 8%, #fcf6ba 18%, #b38728 33%);
          background-size: 200% 100%;
          animation: gold-shimmer-anim 3s linear infinite;
        }
        @keyframes gold-shimmer-anim {
          to { background-position: -200% 0; }
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
                
                {/* GLOBAL INTERACTION BAR (LIVE FEED) */}
                <div className="mb-6">
                    <button 
                        onClick={() => setIsActivityOpen(!isActivityOpen)}
                        className="w-full bg-[#1e232e] border border-white/5 h-10 rounded-xl overflow-hidden flex items-center group shadow-xl hover:border-white/20 transition-all text-left"
                    >
                        <div 
                            style={{ backgroundColor: liveFeedColor }}
                            className="h-full px-4 flex items-center gap-2 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.3)]"
                        >
                            <Activity className="w-3 h-3 text-white animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap">{liveFeedBadge}</span>
                        </div>
                        <div className="flex-1 marquee-container">
                            <div className="marquee-content items-center">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-10">{liveFeedText}</span>
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-10">{liveFeedText}</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* ELITE ADVERTISEMENT RIBBON - GOLD TO ATTRACT */}
                <div className="mb-8 relative group cursor-pointer" onClick={() => handleNavigate('elite')}>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-[#1e232e] border border-yellow-500/20 rounded-[2rem] p-5 md:p-8 overflow-hidden flex items-center justify-between shadow-3xl">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-[4s]"><Crown className="w-40 h-40 text-yellow-500" /></div>
                        <div className="flex items-center gap-6 relative z-10">
                            <div className="w-14 h-14 gold-shimmer rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(234,179,8,0.5)] border-2 border-[#0b0e14]">
                                <Crown className="w-8 h-8 fill-current" />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-none mb-1">
                                  MOON <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728]">ELITE TIER</span>
                                </h2>
                                <p className="text-yellow-400/80 text-[10px] font-black uppercase tracking-[0.3em]">Unlock Secret Inventory & Lifetime Boosts</p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-4 mr-8">
                            <div className="flex flex-col items-end">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Plan</span>
                                <span className="text-sm font-black text-yellow-500 italic uppercase">VIP ONLY</span>
                            </div>
                            <div className="h-10 w-px bg-white/10 mx-2"></div>
                            {["-5% OFF", "+5K XP"].map(tag => (
                                <span key={tag} className="bg-yellow-500/10 border border-yellow-500/30 px-4 py-2 rounded-xl text-[10px] font-black text-yellow-500 uppercase tracking-widest shadow-lg">{tag}</span>
                            ))}
                        </div>
                        <button className="gold-shimmer text-black px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative z-10 border border-black/20">
                            ASCEND NOW <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* HORIZONTAL CATEGORY BELT - Improved Spacing & Fixed PC Scroll */}
                <div className="sticky top-16 z-40 mb-10">
                   <div className="bg-[#151a23]/90 backdrop-blur-3xl border border-white/5 rounded-2xl flex items-center shadow-2xl">
                      <div className="px-4 py-4 border-r border-white/5 hidden md:flex items-center gap-3 text-blue-500 flex-shrink-0">
                         <Filter className="w-4 h-4" />
                         <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                      </div>
                      <div className="flex-1 flex items-center gap-1 overflow-x-auto custom-shop-scrollbar py-3.5 px-2">
                        <button 
                            onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} 
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 group ${!selectedCategory && !searchQuery ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <ShoppingBag className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-[0.15em]">Global Feed</span>
                        </button>
                        
                        {Object.values(GameCategory).map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }} 
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap flex-shrink-0 group relative ${selectedCategory === cat ? 'text-blue-400 bg-blue-500/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedCategory === cat ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)] scale-100' : 'bg-gray-700 scale-0 group-hover:scale-100'}`}></div>
                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">{cat}</span>
                                {selectedCategory === cat && (
                                    <div className="absolute -bottom-[1px] left-6 right-6 h-0.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                                )}
                            </button>
                        ))}
                      </div>
                      <div className="px-4 flex items-center flex-shrink-0 gap-3 border-l border-white/5 ml-1">
                         <div className="w-9 h-9 flex items-center justify-center bg-white/5 rounded-xl text-gray-500 hover:text-blue-400 transition-colors cursor-pointer border border-white/5">
                            <Search className="w-4 h-4" />
                         </div>
                      </div>
                   </div>
                </div>

                <div className="w-full">
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
                        <div>
                        <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.3em] mb-1 flex items-center gap-2">
                            <Activity className="w-3 h-3" /> SHOP SCAN ACTIVE
                        </p>
                        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                            {searchQuery ? `"${searchQuery.toUpperCase()}"` : (selectedCategory?.toUpperCase() || 'SHOP ALL')}
                        </h1>
                        </div>
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery('')}
                                className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white flex items-center gap-2"
                            >
                                <X className="w-3 h-3" /> Clear Search
                            </button>
                        )}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <div className="flex gap-1 mb-1">
                                    {[1,2,3,4,5].map(i => <Star key={i} className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />)}
                                </div>
                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Trusted Shop</span>
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
            {currentPage === 'tournament-apply' && <TournamentApplyPage tournament={selectedTournament} session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'loot' && <LootBoxPage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'elite' && <ElitePage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'spin' && <SpinWheelPage session={session} onNavigate={handleNavigate} addToast={addToast} />}
            {currentPage === 'faq' && <FaqPage session={session} onNavigate={handleNavigate} />}
            {currentPage === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}
            {currentPage === 'terms' && <TermsPage onNavigate={handleNavigate} />}
        </div>

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
