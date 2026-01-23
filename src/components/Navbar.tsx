
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard, X, Languages, ShoppingBag, Trophy, Heart, Medal, Home, Swords, LogOut, Crown, Package, Zap } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types';

interface NavbarProps {
  session: any;
  onNavigate: (page: string) => void;
  cartCount: number;
  onSearch: (query: string) => void;
  language: 'en' | 'fr';
  setLanguage: (lang: 'en' | 'fr') => void;
}

const Navbar: React.FC<NavbarProps> = ({ session, onNavigate, cartCount, onSearch, language, setLanguage }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const isGuest = session?.user?.id === 'guest-user-123';
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
                total_donated: 0
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (searchTerm.trim()) {
          onSearch(searchTerm);
          setIsMobileSearchOpen(false);
      }
  };

  const handleMenuClick = (page: string) => {
      onNavigate(page);
      setIsMenuOpen(false);
  };

  const placeholder = language === 'en' ? "Search Game..." : "Rechercher...";

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0e14] border-b border-gray-800 h-20 flex items-center shadow-2xl">
      <div className="container mx-auto px-4 flex justify-between items-center relative h-full">
        {/* Left: Menu & Logo */}
        <div className="flex items-center gap-4 md:gap-6 relative z-10">
          <div className="relative">
              <button 
                ref={buttonRef}
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-400 hover:text-white p-2 transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              {isMenuOpen && (
                  <div ref={menuRef} className="absolute top-14 left-0 w-64 bg-[#1e232e] border border-gray-800 rounded-2xl shadow-2xl p-2 z-[60] animate-slide-up">
                      <button onClick={() => handleMenuClick('home')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Home className="w-4 h-4 text-blue-500" /> Home
                      </button>
                      <button onClick={() => handleMenuClick('shop')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <ShoppingBag className="w-4 h-4 text-cyan-500" /> Shop
                      </button>
                      <button onClick={() => handleMenuClick('loot')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-yellow-600/20 to-yellow-900/20 hover:from-yellow-600 hover:to-yellow-700 rounded-xl transition-all flex items-center gap-3 border border-yellow-500/30">
                          <Package className="w-4 h-4 text-yellow-400" /> Moon Loot
                      </button>
                      <button onClick={() => handleMenuClick('elite')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-yellow-700/20 to-yellow-900/20 hover:from-yellow-700 hover:to-yellow-800 rounded-xl transition-all flex items-center gap-3 border border-yellow-500/30">
                          <Crown className="w-4 h-4 text-yellow-400" /> Moon Elite
                      </button>
                      <button onClick={() => handleMenuClick('tournaments')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Swords className="w-4 h-4 text-green-500" /> Competitions
                      </button>
                      <button onClick={() => handleMenuClick('pointsShop')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Trophy className="w-4 h-4 text-purple-500" /> Points Shop
                      </button>
                      <div className="h-px bg-gray-800 my-1"></div>
                      <button onClick={() => handleMenuClick('donate')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Heart className="w-4 h-4 text-red-500" /> Donate
                      </button>
                      <button onClick={() => handleMenuClick('leaderboard')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Medal className="w-4 h-4 text-yellow-500" /> Best Donators
                      </button>
                      <button onClick={() => handleMenuClick('leaderboard-points')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Crown className="w-4 h-4 text-purple-500" /> Points Leaderboard
                      </button>
                  </div>
              )}
          </div>

          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
             {/* Logo Block */}
             <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg shadow-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                 <span className="text-white font-black italic text-lg">M</span>
             </div>
             {/* Text visible on mobile but smaller */}
             <span className="hidden sm:block text-lg md:text-xl font-black text-white italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">
                Moon Night
             </span>
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl z-0">
          <div className="relative w-full group">
            <input
              type="text"
              placeholder={placeholder}
              className="w-full bg-[#151a23] text-gray-200 rounded-lg py-3 pl-5 pr-14 focus:outline-none border border-gray-800 focus:border-blue-600 transition-all font-medium placeholder:text-gray-600 shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 bottom-0 px-5 bg-blue-600 hover:bg-blue-700 rounded-r-lg text-white transition-all flex items-center justify-center">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-4 relative z-10">
          
          {/* ELITE BUTTON (DESKTOP) */}
          <button 
            onClick={() => onNavigate('elite')}
            className="hidden md:flex bg-gradient-to-r from-yellow-600 to-yellow-800 hover:from-yellow-500 hover:to-yellow-700 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest items-center gap-2 shadow-lg shadow-yellow-600/20 active:scale-95 transition-all"
          >
             <Crown className="w-4 h-4 text-yellow-200" /> Elite
          </button>

          {/* LOOT BUTTON (DESKTOP) */}
          <button 
            onClick={() => onNavigate('loot')}
            className="hidden md:flex bg-[#1e232e] border border-gray-700 hover:border-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest items-center gap-2 transition-all"
          >
             <Package className="w-4 h-4 text-blue-400" /> Loot
          </button>

          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Switcher */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="p-2 text-gray-400 hover:text-white transition flex items-center gap-2 bg-[#151a23] rounded-lg border border-gray-800 hover:border-gray-600"
          >
            <Languages className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase hidden md:block">{language.toUpperCase()}</span>
          </button>

          <button 
            onClick={() => onNavigate('cart')}
            className="relative p-2.5 text-gray-300 hover:text-white bg-[#151a23] rounded-lg border border-gray-800 hover:border-blue-500 transition group"
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
            
            <div className="absolute right-0 mt-2 w-64 bg-[#1e232e] border border-gray-800 rounded-xl shadow-2xl py-2 hidden group-hover:block animate-fade-in overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-800 bg-[#151a23]">
                    <p className={`text-sm font-bold truncate ${profile?.vip_level && profile.vip_level > 0 ? 'text-yellow-400' : 'text-white'}`}>
                        {profile?.username || 'Guest Gamer'} 
                        {profile?.vip_level && profile.vip_level > 0 && <span className="ml-2 text-[9px] bg-yellow-500 text-black px-1.5 py-0.5 rounded font-black">ELITE</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{session?.user?.email || 'Not logged in'}</p>
                </div>
                
                {!isGuest && (
                    <div className="px-5 py-3 border-b border-gray-800 bg-blue-900/10">
                        <p className="text-[10px] text-blue-300 uppercase font-black tracking-widest mb-1">Wallet Balance</p>
                        <p className="text-lg font-mono text-white font-bold tracking-tight">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
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
          <div className="absolute top-20 left-0 w-full bg-[#0b0e14] p-4 border-b border-gray-800 lg:hidden animate-slide-up z-40 shadow-2xl">
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
                  <button type="submit" className="absolute right-2 top-2 p-2 bg-blue-600 rounded-lg text-white shadow-lg">
                      <Search className="w-4 h-4" />
                  </button>
              </form>
          </div>
      )}
    </nav>
  );
};

export default Navbar;
