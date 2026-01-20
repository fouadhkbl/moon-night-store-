import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
import { Gamepad2, Wallet, LogOut } from 'lucide-react';

export const Dashboard = ({ session, addToast, onSignOut, onNavigate, setSession }: { session: any, addToast: any, onSignOut: () => void, onNavigate: (p: string) => void, setSession: (s: any) => void }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet'>('overview');
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');

  const isGuest = session?.user?.id === 'guest-user-123';

  const fetchData = useCallback(async () => {
    if (session?.user) {
        if (isGuest) {
            setProfile({
                id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Gamer',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00, vip_level: 0, vip_points: 0
            });
            setOrders([]);
        } else {
            const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (pData) setProfile(pData);
            const { data: oData } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (oData) setOrders(oData);
        }
    }
  }, [session, isGuest]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (isGuest && authMode === 'login') return (
    <div className="py-20 container mx-auto px-4">
      <LoginForm 
        onAuthSuccess={s => { 
          setSession(s); 
          setAuthMode('none'); 
          onNavigate('dashboard'); // Explicitly stay/refresh dashboard view
        }} 
        onToggle={() => setAuthMode('signup')} 
      />
    </div>
  );

  if (isGuest && authMode === 'signup') return (
    <div className="py-20 container mx-auto px-4">
      <SignupForm 
        addToast={addToast} 
        onAuthSuccess={s => { 
          if(s) setSession(s); 
          setAuthMode('none'); 
          onNavigate('dashboard'); 
        }} 
        onToggle={() => setAuthMode('login')} 
      />
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in pb-20">
       <div className="relative rounded-[2rem] overflow-hidden mb-12 shadow-2xl bg-[#1e232e]">
          <div className="h-48 bg-gradient-to-r from-blue-900 via-purple-900 to-[#1e232e]"></div>
          <div className="px-8 pb-10 flex flex-col md:flex-row items-end -mt-16 gap-8">
              <div className="w-40 h-40 rounded-3xl border-8 border-[#0b0e14] bg-[#1e232e] overflow-hidden shadow-2xl flex-shrink-0">
                 <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="Profile Avatar" />
              </div>
              <div className="flex-1 pb-2">
                 <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-1 leading-none">{profile?.username}</h1>
                 <p className="text-gray-500 font-bold text-sm tracking-wide">{profile?.email}</p>
                 {!isGuest && <span className="bg-blue-600/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase mt-3 inline-block border border-blue-600/30 tracking-widest shadow-lg">Verified System Player</span>}
              </div>
               <div className="flex flex-col items-end gap-3 pb-2 w-full md:w-auto">
                 <div className="bg-[#0b0e14]/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-blue-500/30 flex items-center gap-4 shadow-2xl w-full md:w-auto">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Solde Balance</p>
                        <p className="text-3xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                    </div>
                    <Wallet className="w-10 h-10 text-blue-500 opacity-80"/>
                 </div>
                 {isGuest ? (
                     <div className="flex gap-3 mt-2 w-full">
                        <button onClick={() => setAuthMode('login')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-2xl font-black shadow-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Log In</button>
                        <button onClick={() => setAuthMode('signup')} className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-4 rounded-2xl font-black shadow-2xl text-[10px] uppercase tracking-widest transition-all active:scale-95">Sign Up</button>
                     </div>
                 ) : (
                    <button onClick={onSignOut} className="w-full bg-red-900/10 text-red-500 border border-red-500/20 px-8 py-3 rounded-2xl font-black hover:bg-red-900/20 transition text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"><LogOut className="w-4 h-4"/> Logout System</button>
                 )}
              </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-[#1e232e] rounded-[2rem] overflow-hidden border border-gray-800 shadow-2xl h-fit">
             <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Dashboard</button>
             <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Orders</button>
             <button onClick={() => setActiveTab('wallet')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'wallet' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Wallet</button>
          </div>
          <div className="lg:col-span-3">
             {activeTab === 'overview' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><Gamepad2 className="w-48 h-48" /></div>
                        <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase relative z-10 leading-none">Welcome, {profile?.username}!</h2>
                        <p className="text-blue-100 font-black uppercase text-[11px] tracking-[0.3em] relative z-10 opacity-80">{isGuest ? "GUEST MODE: PROFILE NOT SYNCED" : "SECURE MARKETPLACE HUB ACTIVE"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl hover:border-blue-500/20 transition-all">
                           <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3">Verified Commands</p>
                           <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none">{orders.length}</h3>
                        </div>
                        <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl hover:border-yellow-500/20 transition-all">
                           <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-3">Live Solde</p>
                           <h3 className="text-5xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2)} DH</h3>
                        </div>
                    </div>
                </div>
             )}
             {activeTab === 'orders' && (
                <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl">
                   <h3 className="font-black text-white text-2xl mb-8 italic uppercase tracking-tighter">Trade History</h3>
                   {orders.length === 0 ? <p className="text-gray-600 uppercase text-[10px] font-black tracking-widest py-10 text-center border-2 border-dashed border-gray-800 rounded-3xl">No logs found.</p> : (
                       <div className="space-y-4">
                           {orders.map(o => (
                               <div key={o.id} className="p-6 bg-[#0b0e14] rounded-3xl flex justify-between items-center border border-gray-800 hover:border-blue-500/30 transition-all shadow-xl">
                                   <div>
                                     <p className="font-black text-white uppercase tracking-tighter text-lg leading-none mb-1">Trade #{o.id.slice(0,8)}</p>
                                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="font-black text-green-400 italic text-2xl tracking-tighter leading-none">{o.total_amount.toFixed(2)} DH</p>
                                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Status: {o.status}</p>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};