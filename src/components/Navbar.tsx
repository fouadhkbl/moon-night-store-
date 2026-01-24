
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard, X, ShoppingBag, Trophy, Heart, Home, Swords, LogOut, Crown, Package, Zap, Sparkles, Command, RefreshCw, Loader2, Wallet, Coins, LogIn, UserPlus, ArrowRight } from 'lucide-react';
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
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const DISCORD_LOGO = "https://cdn.discordapp.com/attachments/1459639411728711914/1463587675897462795/moon-edite-png_1_1-ezgif.com-optimize.gif?ex=6975ab7e&is=697459fe&hm=fe3c5242f9e86f2692bfea6aece5c50b46ae757d80cc8d01c9a20ae4e6bf9e19";

  const isGuest = session?.user?.id === 'guest-user-123';

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
          setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (session?.user) {
      if (isGuest) {
          setProfile({
                id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0, total_donated: 0, spins_count: 0
          } as any);
          return;
      }
      const fetchProfile = async () => {
         const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
         if (profileData) setProfile(profileData);
      };
      fetchProfile();
    }
  }, [session, isGuest]);

  useEffect(() => {
      if (searchTerm.trim().length >= 2) {
          setIsSearching(true);
          const timer = setTimeout(async () => {
              const { data } = await supabase.from('products').select('*').ilike('name', `%${searchTerm}%`).eq('is_hidden', false).limit(5);
              if (data) setSearchResults(data);
              setIsSearching(false);
          }, 300);
          return () => clearTimeout(timer);
      } else {
          setSearchResults([]);
      }
  }, [searchTerm]);

  const handleGlobalSearchSubmit = (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      if (searchTerm.trim()) {
          onSearch(searchTerm);
          setIsSearchModalOpen(false);
      }
  };

  const handleResultClick = (product: Product) => {
      if (onProductSelect) onProductSelect(product);
      setIsSearchModalOpen(false);
  };

  const vipProgress = profile ? Math.min(100, (profile.vip_points / 5000) * 100) : 0;

  const handleLinkClick = (page: string) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <>
    <nav className="sticky top-0 z-50 bg-[#0b0e14]/90 backdrop-blur-md border-b border-white/5 h-14 flex items-center shadow-2xl">
      <div className="container mx-auto px-4 flex justify-between items-center relative">
        <div className="flex items-center gap-3">
          <button onClick={() => setIsMenuOpen(true)} className="text-gray-400 hover:text-white p-1.5 bg-white/5 rounded-lg border border-white/10 transition-all active:scale-95">
            <Menu className="w-4 h-4" />
          </button>
          <div onClick={() => onNavigate('home')} className="flex items-center gap-2 cursor-pointer group">
             <div className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)] flex items-center justify-center overflow-hidden border border-white/20">
                 <img src={DISCORD_LOGO} className="w-full h-full object-cover" alt="Logo" />
             </div>
             <span className="hidden sm:inline text-[11px] font-black text-white italic tracking-tighter uppercase group-hover:text-blue-400 transition-colors">Moon Night</span>
          </div>
        </div>

        <button 
          onClick={() => setIsSearchModalOpen(true)}
          className="flex-1 max-w-[400px] mx-4 bg-[#151a23] border border-white/5 rounded-full py-1.5 px-4 flex items-center justify-between text-gray-500 hover:border-blue-500/50 hover:bg-[#1e232e] transition-all group"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3 group-hover:text-blue-400 transition-colors" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Search Shop...</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <Command className="w-2.5 h-2.5" />
            <span className="text-[9px] font-black">K</span>
          </div>
        </button>

        <div className="flex items-center gap-1.5">
          <button onClick={() => onNavigate('cart')} className="relative p-1.5 text-gray-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition">
            <ShoppingCart className="w-4 h-4" />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] font-black w-3 h-3 flex items-center justify-center rounded-full border border-[#0b0e14]">{cartCount}</span>}
          </button>

          <div className="relative group">
            <button onClick={() => onNavigate('dashboard')} className={`flex items-center gap-2 border p-0.5 pr-3 rounded-full transition shadow-lg relative ${profile?.vip_level ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-[#151a23] border-white/5'}`}>
                <div className={`w-6 h-6 rounded-full overflow-hidden ${profile?.vip_level ? 'border border-yellow-500' : 'bg-gray-800'}`}>
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center bg-blue-600"><User className="w-3 h-3 text-white" /></div>}
                </div>
                <span className={`text-[9px] font-black max-w-[60px] truncate hidden md:block ${profile?.vip_level ? 'text-yellow-400' : 'text-white'}`}>{profile?.username || 'GUEST'}</span>
            </button>
            
            {!isGuest && profile && (
               <div className="absolute right-0 mt-2 w-64 bg-[#1e232e] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0 z-50">
                  <div className="p-4 bg-[#151a23] border-b border-gray-800">
                    <p className="text-[10px] text-gray-500 font-black uppercase mb-3 flex items-center justify-between">
                      VIP Status <span>{profile.vip_level > 0 ? 'ELITE' : 'MEMBER'}</span>
                    </p>
                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-1000" style={{ width: `${vipProgress}%` }}></div>
                    </div>
                    <p className="text-[8px] text-gray-600 font-bold uppercase mt-2 text-right">XP: {profile.vip_points}/5000</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => onNavigate('dashboard')} className="w-full text-left px-3 py-2 text-[10px] font-black uppercase text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all flex items-center gap-2">
                      <LayoutDashboard className="w-3.5 h-3.5" /> My Profile
                    </button>
                    <button onClick={() => onNavigate('elite')} className="w-full text-left px-3 py-2 text-[10px] font-black uppercase text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-all flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5" /> Elite Perks
                    </button>
                  </div>
               </div>
            )}
          </div>
        </div>
      </div>
    </nav>

    {/* SEARCH MODAL */}
    {isSearchModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-20 bg-[#0b0e14]/95 backdrop-blur-xl animate-fade-in">
            <div className="w-full max-w-2xl bg-[#1e232e] border border-white/5 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-slide-up">
                <form onSubmit={handleGlobalSearchSubmit} className="p-6 border-b border-white/5 flex items-center gap-4">
                    <Search className="w-6 h-6 text-blue-500" />
                    <input 
                        autoFocus
                        type="text" 
                        placeholder="Search for items, games, etc..."
                        className="flex-1 bg-transparent text-xl font-black text-white italic placeholder:text-gray-700 outline-none uppercase tracking-tighter"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={() => setIsSearchModalOpen(false)}
                        className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </form>

                <div className="p-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {isSearching ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-blue-500">
                            <Loader2 className="w-10 h-10 animate-spin" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Searching Shop...</span>
                        </div>
                    ) : searchTerm.length < 2 ? (
                        <div className="py-20 text-center text-gray-600">
                            <Command className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Enter at least 2 characters to begin</p>
                        </div>
                    ) : searchResults.length === 0 ? (
                        <div className="py-20 text-center text-gray-600">
                            <X className="w-12 h-12 mx-auto mb-4 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">No items found</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-4 mb-2">Matches found</p>
                            {searchResults.map(p => (
                                <button 
                                    key={p.id}
                                    onClick={() => handleResultClick(p)}
                                    className="w-full p-4 rounded-2xl bg-[#0b0e14]/50 border border-white/5 hover:border-blue-500/30 hover:bg-[#1e232e] transition-all flex items-center gap-4 group"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-900 overflow-hidden border border-white/5">
                                        <img src={p.image_url} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h4 className="text-white font-black uppercase italic tracking-tighter group-hover:text-blue-400 transition-colors">{p.name}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">{p.category} • {p.platform}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-yellow-400 font-black italic">{p.price.toFixed(2)} DH</p>
                                        <div className="flex items-center justify-end gap-1 text-blue-500 group-hover:translate-x-1 transition-transform">
                                            <span className="text-[8px] font-black uppercase tracking-widest">View</span>
                                            <ArrowRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </button>
                            ))}
                            <button 
                                onClick={handleGlobalSearchSubmit}
                                className="w-full p-4 mt-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-600/20"
                            >
                                <Search className="w-4 h-4" /> Show all results for "{searchTerm}"
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )}

    {/* SIDE DRAWER */}
    <div className={`fixed inset-0 z-[150] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
        <div className={`absolute top-0 left-0 h-full w-full max-w-[300px] bg-[#0b0e14] border-r border-white/5 shadow-3xl transition-transform duration-500 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                    <img src={DISCORD_LOGO} className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]" alt="" />
                    <span className="text-white font-black uppercase italic tracking-tighter">Menu</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mb-2 mt-4">Main Shop</p>
                {[
                    { l: 'Home', i: Home, p: 'home' },
                    { l: 'Market', i: ShoppingBag, p: 'shop' },
                    { l: 'Luck Packs', i: Package, p: 'loot' },
                    { l: 'Win Wheel', i: RefreshCw, p: 'spin' },
                    { l: 'Elite Tier', i: Crown, p: 'elite' },
                    { l: 'Tournaments', i: Swords, p: 'tournaments' },
                    { l: 'Points Rewards', i: Trophy, p: 'pointsShop' }
                ].map(link => (
                    <button key={link.p} onClick={() => handleLinkClick(link.p)} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-blue-600/10 hover:text-blue-400 text-gray-400 font-black uppercase text-[10px] tracking-widest transition-all group">
                        <link.i className="w-5 h-5 group-hover:scale-110 transition-transform" /> {link.l}
                    </button>
                ))}

                <div className="h-px bg-white/5 my-6 mx-4" />
                <p className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] px-4 mb-2">Account</p>
                <button onClick={() => handleLinkClick('dashboard')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                    <User className="w-5 h-5" /> My Profile
                </button>
                <button onClick={() => handleLinkClick('cart')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest">
                    <ShoppingCart className="w-5 h-5" /> Cart
                </button>
            </div>

            <div className="p-6 bg-[#151a23]/50 border-t border-white/5">
                {!isGuest ? (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                                {profile?.avatar_url ? <img src={profile.avatar_url} className="w-full h-full object-cover rounded-xl" alt=""/> : <User className="w-5 h-5"/>}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-white font-black truncate text-xs uppercase italic">{profile?.username || 'Member'}</h4>
                                <p className="text-yellow-500 font-black text-[10px] italic">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => { supabase.auth.signOut(); handleLinkClick('home'); }} 
                          className="w-full py-3 bg-red-900/20 text-red-500 rounded-xl font-black uppercase text-[9px] tracking-widest border border-red-500/10 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                    </>
                ) : (
                    <div className="space-y-3">
                        <button 
                            onClick={() => handleLinkClick('dashboard')} 
                            className="w-full py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-blue-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                        >
                            <LogIn className="w-3.5 h-3.5" /> Login
                        </button>
                        <button 
                            onClick={() => handleLinkClick('dashboard')} 
                            className="w-full py-3 bg-white/5 text-white rounded-xl font-black uppercase text-[9px] tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                        >
                            <UserPlus className="w-3.5 h-3.5" /> Sign Up
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
    </>
  );
};

export default Navbar;
