
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard, X, Languages, ShoppingBag, Trophy, Heart, Medal, Home, Swords, LogOut, Crown, Package, Zap, Sparkles, UserPlus, LogIn, ChevronRight, Loader2, Wallet, Coins } from 'lucide-react';
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
         const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         if (profileData) setProfile(profileData);
      };
      fetchProfile();
    } else {
        setProfile(null);
    }
  }, [session?.user?.id, isGuest]);

  useEffect(() => {
      if (searchTerm.trim().length >= 2) {
          setIsSearching(true);
          setShowResults(true);
          if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
          searchTimeoutRef.current = setTimeout(async () => {
              const { data } = await supabase.from('products').select('*').ilike('name', `%${searchTerm}%`).eq('is_hidden', false).limit(5);
              if (data) setSearchResults(data);
              setIsSearching(false);
          }, 300);
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
          setShowResults(false);
      }
  };

  const handleProductResultClick = (product: Product) => {
      if (onProductSelect) onProductSelect(product);
      else onSearch(product.name);
      setSearchTerm('');
      setShowResults(false);
  };

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', color: 'text-blue-400' },
    { id: 'shop', icon: ShoppingBag, label: 'Marketplace', color: 'text-cyan-400' },
    { id: 'spin', icon: Sparkles, label: 'Spin & Win', color: 'text-pink-400' },
    { id: 'loot', icon: Package, label: 'Moon Packs', color: 'text-yellow-400' },
    { id: 'tournaments', icon: Swords, label: 'Tournaments', color: 'text-green-400' },
    { id: 'elite', icon: Crown, label: 'Elite Club', color: 'text-yellow-500' },
    { id: 'pointsShop', icon: Trophy, label: 'Redeem Shop', color: 'text-purple-400' },
    { id: 'donate', icon: Heart, label: 'Support Us', color: 'text-red-400' }
  ];

  return (
    <>
    <nav className="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-gray-800 h-14 flex items-center shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center relative">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="text-gray-400 hover:text-white p-1.5 bg-white/5 rounded-lg border border-white/10 transition-all active:scale-95"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div onClick={() => onNavigate('home')} className="flex items-center gap-1.5 cursor-pointer group">
             <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-cyan-500 rounded shadow-lg flex items-center justify-center border border-white/10">
                 <span className="text-white font-black italic text-[10px]">MN</span>
             </div>
             <div className="hidden sm:flex flex-col">
                 <span className="text-[11px] font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors">Moon Night</span>
                 <span className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.2em]">Market</span>
             </div>
          </div>
        </div>

        {/* Center: Search (Desktop) */}
        <div ref={searchContainerRef} className="hidden lg:flex absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm flex-col">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              placeholder={language === 'en' ? "Search..." : "Rechercher..."}
              className="w-full bg-[#151a23] text-gray-200 py-1.5 pl-3 pr-10 focus:outline-none border border-gray-800 focus:border-blue-600 transition-all text-[10px] rounded shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-0.5 top-0.5 bottom-0.5 px-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-all flex items-center justify-center">
              {isSearching ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Search className="w-2.5 h-2.5" />}
            </button>
          </form>
          {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[#1e232e] border border-gray-800 rounded-b shadow-2xl overflow-hidden z-50">
                  {searchResults.map(p => (
                      <div key={p.id} onClick={() => handleProductResultClick(p)} className="px-2 py-1.5 hover:bg-[#2a303c] cursor-pointer flex items-center gap-2 border-b border-gray-800/50 last:border-0">
                          <img src={p.image_url} alt="" className="w-6 h-6 rounded object-cover bg-gray-900" />
                          <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-[10px] truncate">{p.name}</p>
                              <p className="text-[8px] text-yellow-400 font-black italic">{p.price.toFixed(2)} DH</p>
                          </div>
                      </div>
                  ))}
              </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5">
          <button onClick={() => onNavigate('cart')} className="relative p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition">
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] font-black w-3 h-3 flex items-center justify-center rounded-full border border-[#0b0e14]">{cartCount}</span>}
          </button>

          <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 border p-0.5 pr-2 rounded-full transition shadow-lg ${profile?.vip_level ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-[#151a23] border-gray-800'}`}>
                <div className={`w-6 h-6 rounded-full overflow-hidden ${profile?.vip_level ? 'border border-yellow-500' : 'bg-gray-800'}`}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-600"><User className="w-3 h-3 text-white" /></div>}
                </div>
                <span className={`text-[9px] font-black max-w-[50px] truncate hidden md:block ${profile?.vip_level ? 'text-yellow-400' : 'text-white'}`}>{profile?.username || 'GUEST'}</span>
          </button>
        </div>
      </div>
    </nav>

    {/* Sider Drawer Menu */}
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        {/* Backdrop */}
        <div 
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setIsMenuOpen(false)}
        />
        
        {/* Drawer Panel */}
        <div className={`absolute top-0 left-0 h-full w-[260px] bg-[#0b0e14] border-r border-gray-800 shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            
            {/* Header / Logo Area */}
            <div className="p-4 border-b border-gray-800 bg-[#151a23] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center text-white font-black italic text-[9px]">M</div>
                    <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Navigation</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="w-6 h-6 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                    <X className="w-3 h-3" />
                </button>
            </div>

            {/* Profile / Asset Section */}
            <div className="p-4 bg-gradient-to-b from-[#151a23] to-[#0b0e14] border-b border-gray-800">
                {!isGuest && profile ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl border-2 overflow-hidden shadow-lg ${profile.vip_level ? 'border-yellow-500' : 'border-blue-500'}`}>
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-[11px] font-black truncate leading-none mb-0.5 ${profile.vip_level ? 'text-yellow-400' : 'text-white'}`}>
                                    {profile.username}
                                    {profile.vip_level > 0 && <Crown className="w-2.5 h-2.5 inline-block ml-1 mb-0.5" />}
                                </p>
                                <p className="text-[8px] text-gray-500 font-bold truncate">Member ID: #{profile.id.slice(0, 6)}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#0b0e14] p-2 rounded-lg border border-gray-800">
                                <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Solde</p>
                                <div className="flex items-center gap-1">
                                    <Wallet className="w-2.5 h-2.5 text-blue-500" />
                                    <span className="text-[10px] font-black text-yellow-400">{profile.wallet_balance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="bg-[#0b0e14] p-2 rounded-lg border border-gray-800">
                                <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-0.5">Points</p>
                                <div className="flex items-center gap-1">
                                    <Coins className="w-2.5 h-2.5 text-purple-500" />
                                    <span className="text-[10px] font-black text-white">{profile.discord_points}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-2">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3 text-center">Join the Marketplace</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="bg-blue-600 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-95">
                                <LogIn className="w-2.5 h-2.5" /> Login
                            </button>
                            <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="bg-white/10 text-white py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all active:scale-95 border border-white/10">
                                <UserPlus className="w-2.5 h-2.5" /> Join
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                <div className="px-4 py-2">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] mb-3">Main Menu</p>
                    <nav className="space-y-1">
                        {menuItems.map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }} 
                                className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/5"
                            >
                                <div className={`p-1.5 rounded-md bg-white/5 group-hover:scale-110 transition-transform ${item.color}`}>
                                    <item.icon className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="px-4 py-4 mt-2 border-t border-gray-800/50">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.2em] mb-3">System</p>
                    <nav className="space-y-1">
                        <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all group">
                            <LayoutDashboard className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">My Dashboard</span>
                        </button>
                        {!isGuest && (
                            <button onClick={() => { supabase.auth.signOut(); window.location.reload(); }} className="w-full flex items-center gap-3 p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-all group">
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Sign Out</span>
                            </button>
                        )}
                    </nav>
                </div>
            </div>

            {/* Footer Area */}
            <div className="p-4 border-t border-gray-800 bg-[#151a23]">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">© 2024 Moon Night</span>
                    <div className="flex gap-2">
                        <button onClick={() => setLanguage('en')} className={`text-[8px] font-black uppercase transition-all ${language === 'en' ? 'text-blue-500' : 'text-gray-600'}`}>EN</button>
                        <button onClick={() => setLanguage('fr')} className={`text-[8px] font-black uppercase transition-all ${language === 'fr' ? 'text-blue-500' : 'text-gray-600'}`}>FR</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default Navbar;
