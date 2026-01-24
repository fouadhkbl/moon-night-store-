
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
import { Loader2, ShoppingBag, X, Megaphone } from 'lucide-react';

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
    else setCurrentPage(page);
    if (page !== 'shop') { setSelectedCategory(null); setSearchQuery(''); }
  };

  const handleSearch = (q: string) => { setSearchQuery(q); setSelectedCategory(null); setCurrentPage('shop'); window.scrollTo(0,0); };

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
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col selection:bg-blue-600">
      {currentPage !== 'admin' && (
          <Navbar 
            session={session} onNavigate={handleNavigate} cartCount={cart.length} 
            onSearch={handleSearch} language={language} setLanguage={setLanguage}
            onProductSelect={(p) => setSelectedProduct(p)}
          />
      )}
      
      <main className="flex-grow">
        {currentPage === 'home' && <HomePage onNavigate={handleNavigate} onSelectCategory={setSelectedCategory} onSearch={handleSearch} language={language} />}
        {currentPage === 'shop' && (
          <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
               <div>
                  <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none mb-1">SYSTEM SHOP</h1>
                  <p className="text-gray-500 text-[9px] uppercase tracking-[0.2em] font-black">
                      {searchQuery ? `Searching: "${searchQuery}"` : (selectedCategory ? `Dept: ${selectedCategory}` : 'All Global Inventory')}
                  </p>
               </div>
               <div className="flex items-center gap-2 overflow-x-auto no-scrollbar max-w-full pb-1">
                  <button onClick={() => { setSelectedCategory(null); setSearchQuery(''); }} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${!selectedCategory && !searchQuery ? 'bg-blue-600 text-white' : 'bg-[#151a23] text-gray-500 border border-gray-800'}`}>ALL DEPTS</button>
                  {Object.values(GameCategory).map(cat => (
                    <button key={cat} onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }} className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all whitespace-nowrap ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-[#151a23] text-gray-500 border border-gray-800'}`}>{cat.toUpperCase()}</button>
                  ))}
               </div>
            </div>
            <ShopGrid category={selectedCategory} searchQuery={searchQuery} onProductClick={(p) => setSelectedProduct(p)} language={language} />
          </div>
        )}
        {currentPage === 'dashboard' && <Dashboard session={session} setSession={setSession} addToast={addToast} onNavigate={handleNavigate} initialOrderId={targetOrderId} initialTab={dashboardTab} onSignOut={() => handleNavigate('home')} />}
        {currentPage === 'admin' && (adminRole !== 'none' ? <AdminPanel session={session} addToast={addToast} role={adminRole} /> : <AdminLockScreen onSuccess={setAdminRole} />)}
        {/* Other Pages: Minimal versions assumed to follow this scale */}
      </main>

      {currentPage !== 'admin' && <Footer onNavigate={handleNavigate} session={session} addToast={addToast} />}
      
      {selectedProduct && <ProductDetailsModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={handleAddToCart} onSwitchProduct={setSelectedProduct} addToast={addToast} />}
      <ToastContainer toasts={toasts} removeToast={id => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;
