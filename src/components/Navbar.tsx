
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard, X, ShoppingBag, Trophy, Heart, Home, Swords, LogOut, Crown, Package, Zap, Sparkles, UserPlus, LogIn, Loader2, Wallet, Coins, Activity } from 'lucide-react';
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
  
  const DISCORD_LOGO = "https://cdn.discordapp.com/attachments/1459639411728711914/1463587675897462795/moon-edite-png_1_1-ezgif.com-optimize.gif?ex=6975ab7e&is=697459fe&hm=fe3c5242f9e86f2692bfea6aece5c50b46ae757d80cc8d01c9a20ae4e6bf9e19";

  const [liveActivity, setLiveActivity] = useState<{user: string, action: string} | null>(null);
  const activities = [
    {user: "Zakaria", action: "won 200 PTS on Spin!"},
    {user: "Amine", action: "purchased 1000 Kamas"},
    {user: "Sarah", action: "joined Elite Club!"},
    {user: "15,420+", action: "Members on Discord"}
  ];

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const isGuest = session?.user?.id === 'guest-user-123';
  
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
        setLiveActivity(activities[idx]);
        idx = (idx + 1) % activities.length;
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (isGuest) {
          setProfile({
                id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0, total_donated: 0, spins_count: 0
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

  const menuItems = [
    { id: 'home', icon: Home, label: 'Home', color: 'text-blue-400' },
    { id: 'shop', icon: ShoppingBag, label: 'Marketplace', color: 'text-cyan-400' },
    { id: 'spin', icon: Sparkles, label: 'Spin & Win', color: 'text-pink-400' },
    { id: 'loot', icon: Package, label: 'Moon Packs', color: 'text-yellow-400' },
    { id: 'tournaments', icon: Swords, label: 'Tournaments', color: 'text-green-400' },
    { id: 'elite', icon: Crown, label: 'Elite Club', color: 'text-yellow-500' },
    { id: 'pointsShop', icon: Trophy, label: 'Redeem Shop', color: 'text-purple-400' }
  ];

  return (
    <>
    <nav className="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/5 h-14 flex items-center shadow-2xl">
      <div className="container mx-auto px-4 flex justify-between items-center relative">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)} 
            className="text-gray-400 hover:text-white p-1.5 bg-white/5 rounded-lg border border-white/10 transition-all active:scale-95"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer group">
             <div className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center overflow-hidden border border-white/20">
                 <img src={DISCORD_LOGO} className="w-full h-full object-cover" alt="Logo" />
             </div>
             <div className="hidden sm:flex flex-col">
                 <span className="text-[11px] font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors">Moon Night</span>
                 <span className="text-[7px] font-bold text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1">
                    <Activity className="w-2 h-2 text-green-500" /> 15K+ ONLINE
                 </span>
             </div>
          </div>
        </div>

        {/* Center: Live Ticker (Desktop only) */}
        <div className="hidden xl:flex items-center gap-3 bg-white/5 border border-white/5 px-4 py-1.5 rounded-full overflow-hidden w-64 h-8">
            <Activity className="w-3 h-3 text-cyan-500 shrink-0 animate-pulse" />
            <div className="relative w-full overflow-hidden h-4">
                {liveActivity && (
                    <p key={liveActivity.user} className="text-[9px] font-bold uppercase tracking-widest text-gray-400 animate-slide-up whitespace-nowrap">
                        <span className="text-blue-400">{liveActivity.user}</span> {liveActivity.action}
                    </p>
                )}
            </div>
        </div>

        {/* Search (Desktop) */}
        <div ref={searchContainerRef} className="hidden lg:flex flex-1 max-w-[280px] flex-col mx-4">
          <form onSubmit={handleSearchSubmit} className="relative group">
            <input
              type="text"
              placeholder={language === 'en' ? "Search for items..." : "Rechercher..."}
              className="w-full bg-[#151a23] text-gray-200 py-1.5 pl-3 pr-10 focus:outline-none border border-white/5 focus:border-blue-600 transition-all text-[10px] rounded-lg shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="absolute right-0.5 top-0.5 bottom-0.5 px-2 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white rounded-md transition-all flex items-center justify-center">
              {isSearching ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Search className="w-2.5 h-2.5" />}
            </button>
          </form>
          {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 w-full bg-[#1e232e] border border-gray-800 rounded-b-xl shadow-2xl overflow-hidden z-50 mt-1">
                  {searchResults.map(p => (
                      <div key={p.id} onClick={() => { onProductSelect ? onProductSelect(p) : onSearch(p.name); setShowResults(false); }} className="px-3 py-2 hover:bg-blue-600/10 cursor-pointer flex items-center gap-3 border-b border-gray-800/50 last:border-0 transition-colors">
                          <img src={p.image_url} alt="" className="w-7 h-7 rounded object-cover bg-gray-900 border border-white/5" />
                          <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-[10px] truncate uppercase">{p.name}</p>
                              <p className="text-[8px] text-cyan-400 font-black italic">{p.price.toFixed(2)} DH</p>
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

          <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 border p-0.5 pr-2 rounded-full transition shadow-lg relative group ${profile?.vip_level ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-[#151a23] border-white/5'}`}>
                {profile?.vip_level ? (
                    <div className="absolute -inset-[2px] rounded-full bg-gradient-to-r from-yellow-500 via-amber-200 to-yellow-500 animate-spin-slow opacity-30"></div>
                ) : null}
                <div className={`w-6 h-6 rounded-full overflow-hidden relative z-10 ${profile?.vip_level ? 'border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]' : 'bg-gray-800 border border-white/10'}`}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-600"><User className="w-3 h-3 text-white" /></div>}
                </div>
                <span className={`text-[9px] font-black max-w-[60px] truncate hidden md:block relative z-10 ${profile?.vip_level ? 'text-yellow-400' : 'text-white'}`}>{profile?.username || 'GUEST'}</span>
          </button>
        </div>
      </div>
    </nav>

    {/* Sider Drawer Menu */}
    <div className={`fixed inset-0 z-[100] transition-all duration-500 ${isMenuOpen ? 'visible' : 'invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-[280px] bg-[#0b0e14] border-r border-white/5 shadow-2xl flex flex-col transition-transform duration-500 ease-out transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-5 border-b border-white/5 bg-[#151a23] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <img src={DISCORD_LOGO} className="w-6 h-6 rounded-full" alt="" />
                    <span className="text-[10px] font-black text-white italic uppercase tracking-widest">Moon Navigation</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="w-7 h-7 bg-white/5 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            <div className="p-5 bg-gradient-to-b from-[#151a23] to-[#0b0e14] border-b border-white/5">
                {!isGuest && profile ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 rounded-xl border-2 overflow-hidden shadow-xl relative ${profile.vip_level ? 'border-yellow-500' : 'border-blue-500'}`}>
                                {profile.vip_level ? <div className="absolute inset-0 bg-yellow-500/10 animate-pulse"></div> : null}
                                <img src={profile.avatar_url} className="w-full h-full object-cover relative z-10" alt="" />
                            </div>
                            <div className="min-w-0">
                                <p className={`text-[12px] font-black truncate leading-none mb-1 ${profile.vip_level ? 'text-yellow-400' : 'text-white'}`}>
                                    {profile.username}
                                    {profile.vip_level > 0 && <Crown className="w-3 h-3 inline-block ml-1 mb-0.5" />}
                                </p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">verified member</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="bg-[#0b0e14] p-2.5 rounded-xl border border-white/5">
                                <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Balance</p>
                                <div className="flex items-center gap-1">
                                    <Wallet className="w-3 h-3 text-blue-500" />
                                    <span className="text-[11px] font-black text-yellow-400">{profile.wallet_balance.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="bg-[#0b0e14] p-2.5 rounded-xl border border-white/5">
                                <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Points</p>
                                <div className="flex items-center gap-1">
                                    <Coins className="w-3 h-3 text-purple-500" />
                                    <span className="text-[11px] font-black text-white">{profile.discord_points}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-2">
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-4 text-center">Enter the Night Marketplace</p>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="bg-blue-600 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/20"><LogIn className="w-3 h-3" /> Login</button>
                            <button onClick={() => { onNavigate('dashboard'); setIsMenuOpen(false); }} className="bg-white/10 text-white py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 border border-white/10"><UserPlus className="w-3 h-3" /> Join</button>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
                <div className="px-5 py-3">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.25em] mb-4">Market Exploration</p>
                    <nav className="space-y-1.5">
                        {menuItems.map(item => (
                            <button key={item.id} onClick={() => { onNavigate(item.id); setIsMenuOpen(false); }} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
                                <div className={`p-1.5 rounded-lg bg-white/5 group-hover:scale-110 transition-transform ${item.color}`}><item.icon className="w-4 h-4" /></div>
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em]">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="px-5 py-5 mt-2 border-t border-white/5">
                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.25em] mb-4">Discord Hub</p>
                    <a href="https://discord.gg/s4hcCn4s" target="_blank" rel="noreferrer" className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-gray-400 hover:text-[#5865F2] hover:bg-[#5865F2]/10 transition-all group">
                        <div className="p-1.5 rounded-lg bg-white/5 group-hover:scale-110 transition-transform"><Activity className="w-4 h-4 text-[#5865F2]" /></div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Join 15K+ Members</span>
                    </a>
                </div>
            </div>

            <div className="p-5 border-t border-white/5 bg-[#151a23]">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">© 2024 MOON NIGHT</span>
                    <div className="flex gap-3">
                        <button onClick={() => setLanguage('en')} className={`text-[8px] font-black uppercase tracking-widest transition-all ${language === 'en' ? 'text-blue-500' : 'text-gray-600'}`}>EN</button>
                        <button onClick={() => setLanguage('fr')} className={`text-[8px] font-black uppercase tracking-widest transition-all ${language === 'fr' ? 'text-blue-500' : 'text-gray-600'}`}>FR</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </>
  );
};

export default Navbar;
