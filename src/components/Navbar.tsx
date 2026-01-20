import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, Menu, LayoutDashboard } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types';

interface NavbarProps {
  session: any;
  onNavigate: (page: string) => void;
  cartCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ session, onNavigate, cartCount }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
                vip_points: 0
          });
          return;
      }

      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setProfile(data);
      };
      fetchProfile();
      
      const channel = supabase.channel('public:profiles')
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` }, payload => {
              setProfile(payload.new as Profile);
          })
          .subscribe();
          
      return () => { supabase.removeChannel(channel); }
    }
  }, [session, isGuest]);

  return (
    <nav className="sticky top-0 z-50 bg-[#0b0e14] border-b border-gray-800 h-16 flex items-center shadow-lg">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu />
          </button>
          <div 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-2 cursor-pointer"
          >
             <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 italic tracking-tighter">
                Moon Night
             </span>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 max-w-2xl mx-8 relative">
          <input
            type="text"
            placeholder="Search Game..."
            className="w-full bg-[#1e232e] text-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-gray-700"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <button className="absolute right-0 top-0 h-full px-4 bg-blue-600 rounded-r-md text-white hover:bg-blue-700 transition">
            <Search className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-gray-400">
            <Search className="w-5 h-5" />
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
            </div>
            </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;