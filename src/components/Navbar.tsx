import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard, X, Languages, ShoppingBag, Trophy, Heart, Medal, Home } from 'lucide-react';
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

  useEffect(() => {
    // If we have a user, fetch/set the profile
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
         // Simple fetch without loop
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
      
      // Subscribe to profile changes for real-time updates (e.g. balance)
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

  const placeholder = language === 'en' ? "Search Game, Item, or Category..." : "Rechercher un jeu, un objet ou une catégorie...";

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0e14] border-b border-gray-800 h-16 flex items-center shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center relative h-full">
        <div className="flex items-center gap-4 relative z-10">
          <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-gray-400 hover:text-white p-2"
              >
                {isMenuOpen ? <X /> : <Menu />}
              </button>
              
              {/* Dropdown Menu (3 lines in corner) */}
              {isMenuOpen && (
                  <div className="absolute top-12 left-0 w-64 bg-[#1e232e] border border-gray-800 rounded-2xl shadow-2xl p-2 z-[60] animate-slide-up">
                      <button onClick={() => handleMenuClick('home')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Home className="w-4 h-4 text-blue-500" /> Home
                      </button>
                      <button onClick={() => handleMenuClick('shop')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <ShoppingBag className="w-4 h-4 text-cyan-500" /> Shop
                      </button>
                      <button onClick={() => handleMenuClick('pointsShop')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Trophy className="w-4 h-4 text-purple-500" /> Points Shop
                      </button>
                      <div className="h-px bg-gray-800 my-1"></div>
                      <button onClick={() => handleMenuClick('donate')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Heart className="w-4 h-4 text-red-500" /> Donate
                      </button>
                      <button onClick={() => handleMenuClick('leaderboard')} className="w-full text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-[#0b0e14] hover:text-white rounded-xl transition-all flex items-center gap-3">
                          <Medal className="w-4 h-4 text-yellow-500" /> Donation Leaderboard
                      </button>
                  </div>
              )}
          </div>

          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer"
          >
             <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 italic tracking-tighter">
                Moon Night
             </span>
          </div>
        </div>

        {/* Search Bar - Desktop (Centered) */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-0">
          <div className="relative w-full">
            <input
              type="text"
              placeholder={placeholder}
              className="w-full bg-[#1e232e] text-gray-300 rounded-md py-2 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700 font-medium placeholder:text-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-blue-600 rounded-r-md text-white hover:bg-blue-700 transition">
              <Search className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="flex items-center gap-4 relative z-10">
          {/* Mobile Search Toggle */}
          <button 
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="lg:hidden p-2 text-gray-400 hover:text-white"
          >
            {isMobileSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          {/* Language Switcher */}
          <button 
            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
            className="p-2 text-gray-400 hover:text-white transition flex items-center gap-1 bg-[#1e232e] rounded-md border border-gray-800 hover:border-blue-500"
            title={language === 'en' ? 'Switch to French' : 'Passer en Anglais'}
          >
            <Languages className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase hidden sm:block">{language.toUpperCase()}</span>
          </button>

          <button 
            onClick={() => onNavigate('cart')}
            className="relative p-2 text-gray-300 hover:text-white bg-[#1e232e] rounded-md border border-gray-700 hover:border-blue-500 transition"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          <div className="relative group z-50">
            <button 
                onClick={() => onNavigate('dashboard')}
                className="flex items-center gap-2 bg-[#1e232e] border border-gray-700 text-white p-1 pr-3 rounded-full hover:border-blue-500 transition"
            >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600"><User className="w-4 h-4" /></div>
                    )}
                </div>
                <span className="text-xs font-bold max-w-[80px] truncate hidden md:block">{profile?.username || 'User'}</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-56 bg-[#1e232e] border border-gray-800 rounded-xl shadow-2xl py-2 hidden group-hover:block animate-fade-in overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-800 bg-[#151a23]">
                <p className="text-sm font-bold text-white truncate">{profile?.username || 'Gamer'}</p>
                <p className="text-xs text-gray-500 truncate">{session?.user?.email}</p>
                </div>
                <div className="px-4 py-2 border-b border-gray-800 bg-blue-900/10">
                    <p className="text-xs text-blue-300 uppercase font-bold mb-1">Wallet</p>
                    <p className="text-lg font-mono text-white font-bold tracking-tight">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                </div>
                <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-blue-600 hover:text-white flex items-center gap-3 transition-colors">
                <LayoutDashboard className="w-4 h-4" /> My Profile
                </button>
                <button onClick={() => onNavigate('donate')} className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-red-600 hover:text-white flex items-center gap-3 transition-colors border-t border-gray-800">
                <Heart className="w-4 h-4" /> Donate
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar Overlay */}
      {isMobileSearchOpen && (
          <div className="absolute top-16 left-0 w-full bg-[#0b0e14] p-4 border-b border-gray-800 lg:hidden animate-slide-up">
              <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    placeholder={placeholder}
                    className="w-full bg-[#1e232e] text-white rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                  <button type="submit" className="absolute right-2 top-2 p-1.5 bg-blue-600 rounded-md text-white">
                      <Search className="w-4 h-4" />
                  </button>
              </form>
          </div>
      )}
    </nav>
  );
};

export default Navbar;