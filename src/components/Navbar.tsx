
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard, X, Languages, ShoppingBag, Trophy, Heart, Medal, Home, Swords, LogOut, Crown, Package, Zap, Sparkles, UserPlus, LogIn, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Product, Profile } from '../types';

interface NavbarProps {
  session: any;
  onNavigate: (page: string) => void;
  cartCount: number;
  onSearch: (query: string) => void;
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
  onProductSelect?: (product: Product) => void;
}

const Navbar: React.FC<NavbarProps> = ({ session, onNavigate, cartCount, onSearch, language, setLanguage, onProductSelect }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  // Live Search States
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isGuest = session?.user?.id === 'guest-user-123';
  
  useEffect(() => {
    if (session?.user) {
      if (isGuest) {
          setProfile({
                id: 'guest-user-123',
                email: 'guest@moonnight.com',
                username: 'Guest',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00,
                vip_level: 0,
                vip_points: 0,
                discord_points: 0,
                total_donated: 0,
                spins_count: 0
          });
          return;
      }

      const fetchProfile = async () => {
         const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
         if (profileData) {
             setProfile(profileData);
         }
      };
      
      fetchProfile();
      
      const channel = supabase.channel(`public:profiles:${session.user.id}`)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, payload => {
              setProfile(payload.new as Profile);
          })
          .subscribe();
          
      return () => { supabase.removeChannel(channel); }
    } else {
        setProfile(null);
    }
  }, [session?.user?.id, isGuest]);

  // Handle outside click to close search results
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
              setShowResults(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search Effect
  useEffect(() => {
      if (searchTimeoutRef.current) {
          clearTimeout(searchTimeoutRef.current);
      }

      if (searchTerm.trim().length >= 2) {
          setIsSearching(true);
          setShowResults(true);
          searchTimeoutRef.current = setTimeout(async () => {
              const { data } = await supabase
                  .from('products')
                  .select('*')
                  .ilike('name', `%${searchTerm}%`)
                  .eq('is_hidden', false)
                  .limit(5);
              
              if (data) setSearchResults(data);
              setIsSearching(false);
          }, 400); // 400ms debounce
      } else {
          setSearchResults([]);
          setShowResults(false);
          setIsSearching(false);
      }
  }, [searchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
          onSearch(searchTerm);
          setIsMobileSearchOpen(false);
          setShowResults(false);
      }
  };

  const handleProductResultClick = (product: Product) => {
      if (onProductSelect) {
          onProductSelect(product);
      } else {
          onSearch(product.name);
      }
      setSearchTerm('');
      setShowResults(false);
      setIsMobileSearchOpen(false);
  };

  const handleMenuClick = (page: string) => {
      onNavigate(page);
      setIsMenuOpen(false);
  };

  const placeholder = language === 'en' ? "Search Game..." : "Rechercher...";

  return (
    <>
    <nav className="sticky top-0 z-50 bg-[#0b0e14]/80 backdrop-blur-xl border-b border-gray-800 h-20 flex items-center shadow-2xl">
      <div className="container mx-auto px-4 flex justify-between items-center relative h-full">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4 md:gap-6 relative z-10">
          <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="text-gray-400 hover:text-white p-2 transition-colors bg-[#151a23] rounded-xl border border-gray-800 hover:border-gray-600"
              >
                <Menu className="w-5 h-5" />
              </button>
          </div>

          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
             {/* Logo Block */}
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform border border-white/10">
                 <span className="text-white font-black italic text-lg">M</span>
             </div>
             {/* Text visible on mobile but smaller */}
             <div className="hidden sm:flex flex-col">
                 <span className="text-lg font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors">
                    Moon Night
                 </span>
                 <span className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.3em]">Store</span>
             </div>
          </div>
        </div>

        {/* Center: Live Search Bar (Desktop) */}
        <div ref={searchContainerRef} className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-20 flex-col">
          <form onSubmit={handleSearchSubmit} className="relative w-full group">
            <input
              type="text"
              placeholder={placeholder}
              className={`w-full bg-[#151a23] text-gray-200 py-3 pl-5 pr-14 focus:outline-none border border-gray-800 focus:border-blue-600 transition-all font-medium placeholder:text-gray-600 shadow-inner text-sm ${showResults && searchTerm.length >= 2 ? 'rounded-t-xl border-b-0' : 'rounded-xl'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => { if(searchTerm.length >= 2) setShowResults(true); }}
            />
            <button type="submit" className="absolute right-1 top-1 bottom-1 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all flex items-center justify-center shadow-lg">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {/* Live Results Dropdown */}
          {showResults && searchTerm.length >= 2 && (
              <div className="absolute top-full left-0 w-full bg-[#1e232e] border border-gray-800 border-t-0 rounded-b-xl shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto animate-fade-in custom-scrollbar">
                  {searchResults.length > 0 ? (
                      <div className="py-2">
                          <p className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">Products Found</p>
                          {searchResults.map(product => (
                              <div 
                                key={product.id} 
                                onClick={() => handleProductResultClick(product)}
                                className="px-4 py-3 hover:bg-[#2a303c] cursor-pointer flex items-center gap-3 group transition-colors border-b border-gray-800/50 last:border-0"
                              >
                                  <img src={product.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-900 border border-gray-700" />
                                  <div className="flex-1 min-w-0">
                                      <p className="text-white font-bold text-sm truncate group-hover:text-blue-400 transition-colors">{product.name}</p>
                                      <p className="text-[10px] text-gray-500 uppercase tracking-widest">{product.category}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-yellow-400 font-black italic text-sm">{product.price.toFixed(2)} DH</p>
                                  </div>
                              </div>
                          ))}
                          <button onClick={handleSearchSubmit} className="w-full text-center py-3 text-xs font-bold text-blue-500 hover:text-white uppercase tracking-widest bg-[#151a23] mt-1 hover:bg-blue-600 transition-colors">
                              View All Results
                          </button>
                      </div>
                  ) : (
                      !isSearching && (
                          <div className="p-6 text-center text-gray-500">
                              <p className="text-xs font-bold uppercase tracking-widest">No matched products.</p>
                          </div>
                      )
                  )}
              </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4 relative z-10">
          
          {/* PACKS BUTTON (DESKTOP) */}
          <button 
            onClick={() => onNavigate('loot')}
            className="hidden md:flex bg-[#1e232e] border border-gray-700 hover:border-yellow-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest items-center gap-2 transition-all group"
          >
             <Package className="w-4 h-4 text-yellow-500 group-hover:animate-bounce" /> Packs
          </button>

          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white bg-[#151a23] rounded-xl border border-gray-800"
          >
            <Search className="w-5 h-5" />
          </button>

          <button 
            onClick={() => onNavigate('cart')}
            className="relative p-2.5 text-gray-300 hover:text-white bg-[#151a23] rounded-xl border border-gray-800 hover:border-blue-500 transition group"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg border border-[#0b0e14]">
                {cartCount}
              </span>
            )}
          </button>

          {/* Profile / Login */}
          <div className="relative group z-50">
            <button 
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center gap-3 border text-white p-1.5 pr-1.5 md:pr-4 rounded-full transition shadow-lg ${profile?.vip_level && profile.vip_level > 0 ? 'bg-yellow-900/10 border-yellow-500/50 hover:border-yellow-400' : 'bg-[#151a23] border-gray-800 hover:border-blue-500'}`}
            >
                <div className={`w-8 h-8 rounded-full overflow-hidden border ${profile?.vip_level && profile.vip_level > 0 ? 'border-yellow-500' : 'border-gray-700 bg-gray-800'}`}>
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600"><User className="w-4 h-4" /></div>
                    )}
                </div>
                <span className={`text-xs font-bold max-w-[80px] truncate hidden md:block ${profile?.vip_level && profile.vip_level > 0 ? 'text-yellow-400' : ''}`}>{profile?.username || 'Guest'}</span>
            </button>
            
            <div className="absolute right-0 mt-3 w-64 bg-[#1e232e] border border-gray-800 rounded-2xl shadow-2xl py-2 hidden group-hover:block animate-fade-in overflow-hidden origin-top-right">
                <div className="px-5 py-4 border-b border-gray-800 bg-[#151a23]">
                    <p className={`text-sm font-bold truncate ${profile?.vip_level && profile.vip_level > 0 ? 'text-yellow-400' : 'text-white'}`}>
                        {profile?.username || 'Guest Gamer'} 
                        {profile?.vip_level && profile.vip_level > 0 && <span className="ml-2 text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">ELITE</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'Not logged in'}</p>
                </div>
                
                {!isGuest && (
                    <div className="px-5 py-3 border-b border-gray-800 bg-blue-900/10 flex justify-between items-center">
                        <div>
                            <p className="text-[9px] text-blue-300 uppercase font-black tracking-widest mb-0.5">Wallet</p>
                            <p className="text-sm font-mono text-white font-bold">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-purple-300 uppercase font-black tracking-widest mb-0.5">Points</p>
                            <p className="text-sm font-mono text-white font-bold">{profile?.discord_points || 0}</p>
                        </div>
                    </div>
                )}

                <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors">
                    <LayoutDashboard className="w-4 h-4" /> {isGuest ? 'Login / Sign Up' : 'Dashboard'}
                </button>
                
                {!isGuest && (
                    <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-300 hover:bg-red-600 hover:text-white flex items-center gap-3 transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isMobileSearchOpen && (
          <div className="absolute top-20 left-0 w-full bg-[#0b0e14] border-b border-gray-800 lg:hidden animate-slide-up z-40 shadow-2xl flex flex-col max-h-[80vh]">
              <div className="p-4 border-b border-gray-800">
                  <form onSubmit={handleSearchSubmit} className="relative">
                      <input
                        type="text"
                        placeholder={placeholder}
                        className="w-full bg-[#1e232e] text-white rounded-xl py-4 px-5 pl-12 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-800 text-sm font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                      />
                      <Search className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                      {isSearching && <Loader2 className="absolute right-4 top-4 w-5 h-5 text-blue-500 animate-spin" />}
                  </form>
              </div>
              
              {/* Mobile Results */}
              {showResults && searchTerm.length >= 2 && searchResults.length > 0 && (
                  <div className="overflow-y-auto bg-[#151a23]">
                      <p className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest bg-[#0b0e14]">Matches</p>
                      {searchResults.map(product => (
                          <div 
                            key={product.id} 
                            onClick={() => handleProductResultClick(product)}
                            className="px-4 py-3 border-b border-gray-800 flex items-center gap-3 active:bg-[#2a303c]"
                          >
                              <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-900" />
                              <div className="flex-1">
                                  <p className="text-white font-bold text-sm">{product.name}</p>
                                  <p className="text-yellow-400 font-black italic text-xs">{product.price.toFixed(2)} DH</p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                          </div>
                      ))}
                  </div>
              )}
          </div>
      )}
    </nav>

    {/* FULL SCREEN MENU OVERLAY */}
    {isMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-[#0b0e14]/95 backdrop-blur-2xl animate-fade-in flex flex-col">
            {/* Menu Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800/50">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-blue-600/20">M</div>
                    <span className="text-xl font-black text-white italic uppercase tracking-tighter">Moon Night</span>
                </div>
                <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="w-10 h-10 bg-[#1e232e] rounded-full flex items-center justify-center text-gray-400 hover:text-white border border-gray-700"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Menu Links Grid */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 gap-4 content-start">
                <button onClick={() => handleMenuClick('home')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform"><Home className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Home</span>
                </button>
                <button onClick={() => handleMenuClick('shop')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-cyan-900/20 rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform"><ShoppingBag className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Shop</span>
                </button>
                <button onClick={() => handleMenuClick('spin')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform"><Sparkles className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Spin & Win</span>
                </button>
                <button onClick={() => handleMenuClick('loot')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-yellow-900/20 rounded-2xl flex items-center justify-center text-yellow-400 group-hover:scale-110 transition-transform"><Package className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Moon Packs</span>
                </button>
                <button onClick={() => handleMenuClick('tournaments')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-green-900/20 rounded-2xl flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform"><Swords className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Tournaments</span>
                </button>
                <button onClick={() => handleMenuClick('elite')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-yellow-500/20 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="w-12 h-12 bg-yellow-500 rounded-2xl flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-lg shadow-yellow-500/20"><Crown className="w-6 h-6" /></div>
                    <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs">Elite Club</span>
                </button>
                <button onClick={() => handleMenuClick('pointsShop')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Trophy className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Rewards</span>
                </button>
                <button onClick={() => handleMenuClick('donate')} className="bg-[#1e232e] p-6 rounded-3xl flex flex-col items-center justify-center gap-4 hover:bg-[#252b36] transition-all border border-gray-800 group">
                    <div className="w-12 h-12 bg-red-900/20 rounded-2xl flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform"><Heart className="w-6 h-6" /></div>
                    <span className="text-white font-bold uppercase tracking-widest text-xs">Donate</span>
                </button>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-gray-800/50 bg-[#151a23] flex flex-col gap-4">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                        className="flex-1 bg-[#0b0e14] border border-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 text-gray-400 hover:text-white transition"
                    >
                        <Languages className="w-4 h-4" /> {language === 'en' ? 'English' : 'Français'}
                    </button>
                    {profile ? (
                        <button 
                            onClick={() => handleMenuClick('dashboard')}
                            className="flex-1 bg-blue-600 rounded-xl p-4 flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20"
                        >
                            <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </button>
                    ) : (
                        <button 
                            onClick={() => handleMenuClick('dashboard')}
                            className="flex-1 bg-blue-600 rounded-xl p-4 flex items-center justify-center gap-2 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-blue-600/20"
                        >
                            <LogIn className="w-4 h-4" /> Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    )}
    </>
  );
};

export default Navbar;
