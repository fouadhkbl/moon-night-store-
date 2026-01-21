import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Product, CartItem, GameCategory } from './types';
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
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home'); 
  const [adminRole, setAdminRole] = useState<'none' | 'full' | 'limited'>('none');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const [targetOrderId, setTargetOrderId] = useState<string | null>(null);

  const t = {
    en: {
        shopTitle: "SYSTEM SHOP",
        dept: "Department",
        searching: "Searching",
        allGlobal: "All Global Inventory",
        allDepts: "ALL DEPTS"
    },
    fr: {
        shopTitle: "BOUTIQUE SYSTÈME",
        dept: "Département",
        searching: "Recherche",
        allGlobal: "Inventaire Mondial",
        allDepts: "TOUS DEPTS"
    }
  }[language];

  const addToast = (title: string, message: string, type: 'success'|'error'|'info' = 'info') => {
     const id = Math.random().toString(36).substr(2, 9);
     setToasts(prev => [...prev, { id, title, message, type }]);
     setTimeout(() => setToasts(curr => curr.filter(t => t.id !== id)), 4000);
  };

  // --- VISITOR TRACKING ---
  useEffect(() => {
    const logVisitor = async () => {
        if (sessionStorage.getItem('moonnight_visit_logged')) return;
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            const ip = data.ip;
            await supabase.from('access_logs').insert({
                ip_address: ip,
                user_id: session?.user?.id !== 'guest-user-123' ? session?.user?.id : null
            });
            sessionStorage.setItem('moonnight_visit_logged', 'true');
        } catch (e) {
            console.error("Tracking Error", e);
        }
    };
    if (!isSessionLoading) logVisitor();
  }, [isSessionLoading, session]);

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

  useEffect(() => {
    const fetchCart = async () => {
      const isGuest = session?.user?.id === 'guest-user-123';
      if (!isGuest && session?.user) {
        const { data } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', session.user.id).order('created_at', { ascending: true });
        if (data) setCart(data as CartItem[]);
      } else if (isGuest) {
        setCart([]); 
      }
    };
    fetchCart();
  }, [session]);

  const handleNavigate = (page: string) => { 
    window.scrollTo(0,0); 
    setCurrentPage(page);
    if (page !== 'shop') {
        setSelectedCategory(null);
        setSearchQuery('');
    }
    if (page !== 'dashboard') setTargetOrderId(null);
  };

  const handleSearch = (query: string) => {
      setSearchQuery(query);
      setSelectedCategory(null);
      setCurrentPage('shop');
      window.scrollTo(0, 0);
  };

  const handleViewOrder = (orderId: string) => {
    setTargetOrderId(orderId);
    handleNavigate('dashboard');
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
       const { data: existing } = await supabase.from('cart_items').select('*').eq('user_id', session.user.id).eq('product_id', product.id).single();
       if (existing) {
          await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
       } else {
          await supabase.from('cart_items').insert({ user_id: session.user.id, product_id: product.id, quantity });
       }
       const { data: updatedCart } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', session.user.id).order('created_at', { ascending: true });
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
    if (!isGuest) await supabase.from('cart_items').delete().eq('user_id', session.user.id);
    setCart([]);
  };

  if (isSessionLoading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-blue-500"/></div>;

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      <Navbar 
        session={session} 
        onNavigate={handleNavigate} 
        cartCount={cart.length} 
        onSearch={handleSearch} 
        language={language}
        setLanguage={setLanguage}
      />
      
      <main className="flex-grow">
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate} 
            onSelectCategory={setSelectedCategory} 
            onSearch={handleSearch}
            language={language}
          />
        )}
        
        {currentPage === 'shop' && (
          <div className="container mx-auto px-4 py-24 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-24 gap-8">
               <div>
                  <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">{t.shopTitle}</h1>
                  <p className="text-gray-600 text-[12px] uppercase tracking-[0.4em] font-black">
                      {searchQuery ? `${t.searching}: "${searchQuery}"` : (selectedCategory ? `${t.dept}: ${selectedCategory}` : t.allGlobal)}
                  </p>
               </div>
               <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide max-w-full">
                  <button 
                    onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                    className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-[0.2em] shadow-2xl ${!selectedCategory && !searchQuery ? 'bg-blue-600 text-white' : 'bg-[#1e232e] text-gray-400 hover:text-white border border-gray-800'}`}
                  >
                    {t.allDepts}
                  </button>
                  {Object.values(GameCategory).map((cat: string) => (
                    <button 
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setSearchQuery(''); }}
                      className={`px-8 py-4 rounded-2xl text-[11px] font-black uppercase transition-all whitespace-nowrap tracking-[0.2em] shadow-2xl ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-[#1e232e] text-gray-400 hover:text-white border border-gray-800'}`}
                    >
                      {cat.toUpperCase()}
                    </button>
                  ))}
               </div>
            </div>
            
            <ShopGrid 
              category={selectedCategory} 
              searchQuery={searchQuery}
              onProductClick={(p) => setSelectedProduct(p)} 
              language={language}
            />
          </div>
        )}

        {currentPage === 'cart' && (
          <CartPage 
            cart={cart} 
            onUpdateQty={handleUpdateCartQty} 
            onRemove={handleRemoveFromCart} 
            onNavigate={handleNavigate} 
            addToast={addToast}
          />
        )}

        {currentPage === 'checkout' && (
          <CheckoutPage 
            cart={cart}
            session={session}
            onNavigate={handleNavigate}
            onViewOrder={handleViewOrder}
            onClearCart={handleClearCart}
            addToast={addToast}
          />
        )}

        {currentPage === 'topup' && (
          <TopUpPage 
            session={session} 
            onNavigate={handleNavigate} 
            addToast={addToast} 
          />
        )}
        
        {currentPage === 'dashboard' && (
          <Dashboard 
            session={session} 
            setSession={setSession} 
            addToast={addToast} 
            onNavigate={handleNavigate} 
            initialOrderId={targetOrderId}
            onSignOut={() => { 
              supabase.auth.signOut(); 
              setSession({ user: { id: 'guest-user-123', email: 'guest@moonnight.com' } }); 
              handleNavigate('home'); 
            }} 
          />
        )}

        {currentPage === 'admin' && (
          adminRole !== 'none' ? (
            <AdminPanel session={session} addToast={addToast} role={adminRole} />
          ) : (
            <AdminLockScreen onSuccess={(role) => setAdminRole(role)} />
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