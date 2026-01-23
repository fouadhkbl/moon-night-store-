
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

// New Component: Dynamic Announcement Bar
const AnnouncementBar = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            const { data } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });
            
            if (data && data.length > 0) {
                setAnnouncements(data);
            }
        };
        fetchAnnouncements();
    }, []);

    useEffect(() => {
        if (announcements.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % announcements.length);
            }, 5000); // Rotate every 5 seconds
            return () => clearInterval(interval);
        }
    }, [announcements]);

    if (!visible || announcements.length === 0) return null;

    const current = announcements[currentIndex];

    return (
        <div 
            style={{ background: current.background_color, color: current.text_color }} 
            className="py-2 px-4 relative overflow-hidden shadow-2xl z-[60] transition-all duration-1000 min-h-[40px] flex items-center"
        >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-2 md:gap-6 text-[10px] md:text-xs font-black uppercase tracking-widest relative z-10 animate-fade-in" key={current.id}>
                <div className="flex items-center gap-2">
                    <Megaphone className="w-4 h-4" />
                    <span className="tracking-widest">{current.message}</span>
                </div>
            </div>
            
            <button 
                onClick={() => setVisible(false)} 
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 opacity-60 hover:opacity-100 transition-opacity"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

// New Component: Live Sales Notification
const LiveSalesNotification = () => {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    
    const locations = ['Casablanca', 'Rabat', 'Marrakech', 'Tangier', 'Agadir', 'Fes', 'Paris', 'Dubai'];
    const items = ['Valorant Points', 'Steam Key', 'Netflix Account', 'Discord Nitro', 'GTA V Account', 'PUBG UC'];

    useEffect(() => {
        const showNotification = () => {
            const randomLocation = locations[Math.floor(Math.random() * locations.length)];
            const randomItem = items[Math.floor(Math.random() * items.length)];
            setMessage(`Someone in ${randomLocation} purchased ${randomItem}`);
            setVisible(true);

            setTimeout(() => {
                setVisible(false);
            }, 5000); 
        };

        // First notification after 5 sec
        const initialTimer = setTimeout(showNotification, 5000);

        // Then every 45 sec
        const interval = setInterval(showNotification, 45000);

        return () => {
            clearTimeout(initialTimer);
            clearInterval(interval);
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[90] bg-[#1e232e]/90 backdrop-blur-md border border-blue-500/30 p-4 rounded-2xl shadow-2xl animate-slide-up max-w-xs flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors">
            <button onClick={(e) => { e.stopPropagation(); setVisible(false); }} className="absolute -top-2 -right-2 bg-black text-gray-400 rounded-full p-1 border border-gray-700 hover:text-white"><X className="w-3 h-3" /></button>
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg animate-pulse">
                <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-0.5">Live Activity</p>
                <p className="text-xs font-bold text-white leading-tight">{message}</p>
                <p className="text-[9px] text-gray-500 mt-1">Just now</p>
            </div>
        </div>
    );
};

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
  
  // App Config State
  const [backgroundUrl, setBackgroundUrl] = useState('');

  const t = {
    en: {
        shopTitle: "SHOP",
        dept: "Department",
        searching: "Searching",
        allGlobal: "All Global Inventory",
        allDepts: "ALL DEPTS"
    },
    fr: {
        shopTitle: "BOUTIQUE",
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

  // --- HANDLE DEEP LINKS ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const tournamentId = params.get('tournament_id');
      
      if (tournamentId) {
          const fetchTournament = async () => {
              const { data } = await supabase.from('tournaments').select('*').eq('id', tournamentId).single();
              if (data) {
                  setSelectedTournament(data);
                  setCurrentPage('tournament-details');
              }
          };
          fetchTournament();
      }
  }, []);

  // --- SEO MANAGEMENT ---
  useEffect(() => {
    let title = "Moon Night | #1 Gaming Marketplace";
    let desc = "Buy and sell gaming accounts, coins, keys, and items securely. The best marketplace for gamers.";

    switch(currentPage) {
        case 'home':
            title = "Moon Night | Home - Elite Gaming Store";
            desc = "Welcome to Moon Night. The premier destination for gaming accounts, boosting, and top-ups.";
            break;
        case 'shop':
            title = `${selectedCategory ? selectedCategory : (searchQuery ? `Search: ${searchQuery}` : 'Shop')} | Moon Night Marketplace`;
            desc = "Browse our extensive catalog of gaming products. Accounts, Keys, Gold, and more with instant delivery.";
            break;
        case 'cart':
            title = "My Shopping Cart | Moon Night";
            desc = "Review your items and proceed to secure checkout.";
            break;
        case 'checkout':
            title = "Secure Checkout | Moon Night";
            desc = "Complete your purchase securely using PayPal or Wallet balance.";
            break;
        case 'dashboard':
            title = "Gamer Dashboard | Moon Night";
            desc = "Manage your orders, wallet balance, and rewards.";
            break;
        case 'topup':
            title = "Add Funds | Moon Night Wallet";
            desc = "Top up your Moon Night wallet instantly via PayPal.";
            break;
        case 'pointsShop':
            title = "Rewards Shop | Moon Night";
            desc = "Redeem your Discord Points for exclusive rewards and items.";
            break;
        case 'tournaments':
            title = "Gaming Tournaments | Moon Night";
            desc = "Join competitive tournaments, prove your skills, and win cash prizes.";
            break;
        case 'loot':
            title = "Moon Packs | Mystery Loot Boxes";
            desc = "Open Moon Packs for a chance to win massive rewards and jackpots.";
            break;
        case 'elite':
            title = "Moon Elite | VIP Membership";
            desc = "Upgrade to Elite status for exclusive discounts, badges, and priority support.";
            break;
        case 'spin':
            title = "Spin & Win | Moon Night";
            desc = "Spin the wheel daily for free rewards and bonuses.";
            break;
        case 'donate':
            title = "Support Us | Moon Night";
            desc = "Support the Moon Night project and get recognized on our leaderboard.";
            break;
        case 'leaderboard':
            title = "Top Donators | Moon Night";
            break;
        case 'leaderboard-points':
            title = "Top Players | Moon Night";
            break;
        case 'tournament-details':
            title = selectedTournament ? `${selectedTournament.title} | Moon Night Tournaments` : "Tournament Details | Moon Night";
            desc = selectedTournament ? `Join the ${selectedTournament.title} tournament for ${selectedTournament.game_name}. Win cash prizes!` : desc;
            break;
        default:
            title = "Moon Night | Gaming Marketplace";
    }

    document.title = title;
    
    // Update Meta Description
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // Update Open Graph tags if possible (optional, good for sharing links if SPA routing is handled by server or pre-renderer)
    let ogTitle = document.querySelector("meta[property='og:title']");
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    let ogDesc = document.querySelector("meta[property='og:description']");
    if (ogDesc) ogDesc.setAttribute('content', desc);

  }, [currentPage, selectedCategory, searchQuery, selectedTournament]);

  // --- FETCH APP SETTINGS ---
  useEffect(() => {
      const fetchSettings = async () => {
          const { data } = await supabase.from('app_settings').select('*');
          if (data) {
              let bg = '';
              data.forEach((item: any) => {
                  if (item.key === 'site_background') bg = item.value;
              });
              setBackgroundUrl(bg);
          }
      };
      fetchSettings();
  }, []);

  // --- CAPTURE REFERRAL LINK ---
  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) {
          sessionStorage.setItem('moonnight_referral', ref);
      }
  }, []);

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

  // --- AUTH & PROFILE SYNC ---
  useEffect(() => {
    const syncUserProfile = async (currentSession: any) => {
        if (!currentSession?.user) return;
        
        const { user } = currentSession;
        if (user.id === 'guest-user-123') return;

        const provider = user.app_metadata?.provider || 'email';
        
        try {
            const { data: profile } = await supabase.from('profiles').select('auth_provider, username, avatar_url').eq('id', user.id).single();
            const updates: any = {};
            let needsUpdate = false;

            if (!profile || profile.auth_provider !== provider) {
                updates.auth_provider = provider;
                needsUpdate = true;
            }

            if (provider !== 'email') {
                const meta = user.user_metadata;
                const newAvatar = meta.avatar_url || meta.picture; 
                const newName = meta.full_name || meta.name || meta.custom_claims?.global_name;

                if (profile) {
                    if ((!profile.username || profile.username === 'New User' || profile.username === 'Guest') && newName) {
                        updates.username = newName;
                        needsUpdate = true;
                    }
                    if (newAvatar && (!profile.avatar_url || profile.avatar_url.includes('unsplash'))) {
                        updates.avatar_url = newAvatar;
                        needsUpdate = true;
                    }
                }
            }

            if (needsUpdate) {
                await supabase.from('profiles').upsert({
                    id: user.id,
                    email: user.email,
                    updated_at: new Date().toISOString(),
                    ...updates
                }, { onConflict: 'id' });
            }
        } catch (err) {
            console.error("Profile Sync Error:", err);
        }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
          setSession(session);
          syncUserProfile(session);
      } else {
          setSession({ user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
      }
      setIsSessionLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
          setSession(session);
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
              syncUserProfile(session);
          }
      } else {
          setSession({ user: { id: 'guest-user-123', email: 'guest@moonnight.com' } });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const isGuest = session?.user?.id === 'guest-user-123';
      if (!isGuest && session?.user) {
        const { data } = await supabase.from('cart_items').select('*, product:products(*)').eq('user_id', session.user.id).order('created_at', { ascending: true });
        
        if (data) {
             const validItems = data.filter(item => item.product !== null);
             setCart(validItems as CartItem[]);
        }
      } else if (isGuest) {
        setCart([]); 
      }
    };
    fetchCart();
  }, [session]);

  const handleNavigate = (page: string) => { 
    window.scrollTo(0,0); 
    if (page === 'dashboard-points') {
        setDashboardTab('points');
        setCurrentPage('dashboard');
    } else if (page === 'dashboard') {
        if (currentPage !== 'dashboard') setDashboardTab('overview');
        setCurrentPage('dashboard');
    } else {
        setCurrentPage(page);
    }

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
       if (updatedCart) {
           const validItems = updatedCart.filter(item => item.product !== null);
           setCart(validItems as CartItem[]);
       }
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
    if (item && item.product) addToast('Removed', `${item.product.name} removed.`, 'info');
  };

  const handleClearCart = async () => {
    const isGuest = session?.user?.id === 'guest-user-123';
    if (!isGuest) await supabase.from('cart_items').delete().eq('user_id', session.user.id);
    setCart([]);
  };

  if (isSessionLoading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-blue-500"/></div>;

  const isAdminPage = currentPage === 'admin';

  return (
    <div 
        className="min-h-screen bg-[#0b0e14] text-white font-sans flex flex-col selection:bg-blue-600 selection:text-white"
        style={backgroundUrl && !isAdminPage ? { 
            backgroundImage: `url(${backgroundUrl})`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center', 
            backgroundAttachment: 'fixed',
            boxShadow: 'inset 0 0 0 2000px rgba(11, 14, 20, 0.9)' // Dark Overlay
        } : {}}
    >
      {!isAdminPage && <AnnouncementBar />}
      {!isAdminPage && (
          <Navbar 
            session={session} 
            onNavigate={handleNavigate} 
            cartCount={cart.length} 
            onSearch={handleSearch} 
            language={language}
            setLanguage={setLanguage}
            onProductSelect={(p) => setSelectedProduct(p)}
          />
      )}
      
      <main className={`flex-grow ${isAdminPage ? 'h-screen overflow-hidden' : ''}`}>
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate} 
            onSelectCategory={setSelectedCategory} 
            onSearch={handleSearch}
            language={language}
          />
        )}

        {currentPage === 'pointsShop' && (
            <PointsShopPage 
                session={session}
                onNavigate={handleNavigate}
                addToast={addToast}
            />
        )}

        {currentPage === 'tournaments' && (
            <TournamentsPage 
                onNavigate={handleNavigate}
                onSelectTournament={setSelectedTournament}
            />
        )}

        {currentPage === 'loot' && (
            <LootBoxPage 
                session={session}
                onNavigate={handleNavigate}
                addToast={addToast}
            />
        )}

        {currentPage === 'elite' && (
            <ElitePage 
                session={session}
                onNavigate={handleNavigate}
                addToast={addToast}
            />
        )}

        {currentPage === 'spin' && (
            <SpinWheelPage 
                session={session}
                onNavigate={handleNavigate}
                addToast={addToast}
            />
        )}

        {currentPage === 'tournament-details' && (
            <TournamentDetailsPage
                tournament={selectedTournament}
                onNavigate={handleNavigate}
                addToast={addToast}
            />
        )}

        {currentPage === 'donate' && (
            <DonatePage 
                session={session}
                onNavigate={handleNavigate}
                addToast={addToast}
            />
        )}

        {currentPage === 'leaderboard' && (
            <LeaderboardPage onNavigate={handleNavigate} type="donations" />
        )}

        {currentPage === 'leaderboard-points' && (
            <LeaderboardPage onNavigate={handleNavigate} type="points" />
        )}
        
        {currentPage === 'shop' && (
          <div className="container mx-auto px-4 py-12 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-8">
               <div>
                  <h1 className="text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">{t.shopTitle}</h1>
                  <p className="text-gray-600 text-[12px] uppercase tracking-[0.4em] font-black">
                      {searchQuery ? `${t.searching}: "${searchQuery}"` : (selectedCategory ? `${t.dept}: ${selectedCategory}` : t.allGlobal)}
                  </p>
               </div>
               <div className="flex items-center gap-4 overflow-x-auto overflow-y-hidden pb-4 custom-scrollbar max-w-full">
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
            initialTab={dashboardTab}
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

      {!isAdminPage && <Footer onNavigate={handleNavigate} session={session} addToast={addToast} />}
      {!isAdminPage && <LiveSalesNotification />}
      
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCart}
          onSwitchProduct={(p) => setSelectedProduct(p)}
        />
      )}
      
      <ToastContainer toasts={toasts} removeToast={id => setToasts(toasts.filter(t => t.id !== id))} />
    </div>
  );
};

export default App;
