
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order, OrderItem, OrderMessage, TournamentApplication } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
import { 
  Wallet, LogIn, LogOut, MessageSquare, 
  Send, X, Clock, CheckCircle, Coins, LayoutDashboard, 
  ClipboardList, Copy, Users, Crown, Timer, Loader2, Edit3, 
  ChevronRight, Zap, Activity, UserPlus, User, ShieldCheck,
  Smartphone, Monitor, Globe, ShoppingCart, Plus, Swords, AlertCircle
} from 'lucide-react';

const OrderDetailsModal = ({ order, currentUser, onClose }: { order: Order, currentUser: Profile, onClose: () => void }) => {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [messages, setMessages] = useState<OrderMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const { data: itemsData } = await supabase.from('order_items').select('*, product:products(*)').eq('order_id', order.id);
            if (itemsData) setItems(itemsData);
            const { data: msgData } = await supabase.from('order_messages').select('*').eq('order_id', order.id).order('created_at', { ascending: true });
            if (msgData) setMessages(msgData);
            setLoading(false);
            scrollToBottom();
        };
        fetchDetails();
        const channel = supabase.channel(`order_chat:${order.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${order.id}` }, (payload) => {
                const newMsg = payload.new as OrderMessage;
                setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                scrollToBottom();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [order.id]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const msgText = newMessage.trim();
        setNewMessage(''); 
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: OrderMessage = { id: tempId, order_id: order.id, sender_id: currentUser.id, message: msgText, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, optimisticMsg]);
        const { data, error } = await supabase.from('order_messages').insert({ order_id: order.id, sender_id: currentUser.id, message: msgText }).select().single();
        if (error) setMessages(prev => prev.filter(m => m.id !== tempId));
        else if (data) setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    };

    if (loading) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-5xl md:rounded-[2.5rem] border border-white/5 shadow-3xl flex flex-col md:flex-row overflow-hidden h-full md:h-[85vh]">
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-white/5 overflow-y-auto custom-scrollbar">
                    <div className="flex justify-between items-center md:hidden mb-6">
                         <h3 className="font-black text-white italic uppercase tracking-tighter">Order Info</h3>
                         <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X className="w-5 h-5"/></button>
                    </div>
                    <h3 className="hidden md:block text-xl font-black text-white italic uppercase tracking-tighter mb-6">Order Summary</h3>
                    
                    <div className={`p-5 rounded-2xl mb-8 border flex items-center gap-4 ${order.status === 'completed' ? 'bg-green-500/5 border-green-500/20 text-green-400' : order.status === 'canceled' ? 'bg-red-500/5 border-red-500/20 text-red-400' : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400'}`}>
                        {order.status === 'completed' ? <CheckCircle className="w-6 h-6" /> : order.status === 'canceled' ? <X className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Status</p>
                            <p className="text-sm font-black uppercase tracking-tighter italic">{order.status}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Inventory Data</p>
                        {items.map(item => (
                            <div key={item.id} className="flex gap-4 bg-[#0b0e14]/50 p-3 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-900 border border-white/5">
                                    <img src={item.product?.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt="" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-black text-white truncate uppercase italic">{item.product?.name}</p>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase">Qty: {item.quantity} • {item.price_at_purchase.toFixed(2)} DH</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Amount</p>
                                <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{order.total_amount.toFixed(2)} DH</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Method</p>
                                <p className="text-white font-bold text-xs uppercase">{order.payment_method || 'System'}</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="hidden md:block mt-10 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition uppercase text-[10px] font-black tracking-[0.2em]">Close Access</button>
                </div>

                <div className="w-full md:w-7/12 flex flex-col h-full bg-[#1e232e]">
                    <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between bg-[#1e232e]">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">Support Core Channel</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Order ID: {order.id.slice(0,8)}</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0b0e14]/40 custom-scrollbar">
                         {messages.length === 0 && (
                             <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                                 <MessageSquare className="w-12 h-12 mb-4" />
                                 <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Transmission...</p>
                             </div>
                         )}
                         {messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-xl ${msg.sender_id === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#151a23] text-gray-200 border border-white/5 rounded-tl-none'}`}>
                                     {msg.message}
                                     <p className={`text-[7px] mt-2 font-black uppercase tracking-widest ${msg.sender_id === currentUser.id ? 'text-blue-200' : 'text-gray-500'}`}>
                                         {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </p>
                                 </div>
                             </div>
                         ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 md:p-6 border-t border-white/5 bg-[#1e232e] flex gap-3">
                        <input 
                            type="text" 
                            className="flex-1 bg-[#0b0e14] border border-white/5 rounded-2xl px-6 py-4 text-white text-sm focus:border-blue-500 outline-none placeholder:text-gray-700" 
                            placeholder="Type command or message..." 
                            value={newMessage} 
                            onChange={(e) => setNewMessage(e.target.value)} 
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50" disabled={!newMessage.trim()}>
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = ({ session, addToast, onSignOut, onNavigate, setSession, initialOrderId, initialTab }: { 
    session: any, addToast: any, onSignOut: () => void, onNavigate: (p: string) => void, setSession: (s: any) => void, initialOrderId?: string | null, initialTab?: 'overview' | 'orders' | 'wallet' | 'points' | 'events'
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'points' | 'referrals' | 'events'>(initialTab || 'overview');
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');
  const [loading, setLoading] = useState(true);
  
  const isGuest = session?.user?.id === 'guest-user-123';
  const isVip = profile?.vip_level && profile.vip_level > 0;

  const calculateClaimStatus = (lastClaim: string | undefined) => {
      if (!lastClaim) return { canClaim: true, timeLeft: '' };
      const next = new Date(new Date(lastClaim).getTime() + 24 * 60 * 60 * 1000);
      const diff = next.getTime() - new Date().getTime();
      if (diff <= 0) return { canClaim: true, timeLeft: '' };
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return { canClaim: false, timeLeft: `${hours}h ${minutes}m` };
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    if (session?.user) {
        if (isGuest) {
            setProfile({ id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Player', avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80', wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0, total_donated: 0, spins_count: 0 } as any);
        } else {
            const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (pData) {
                setProfile(pData);
                const { canClaim, timeLeft } = calculateClaimStatus(pData.last_daily_claim);
                setCanClaimDaily(canClaim);
                setTimeUntilNextClaim(timeLeft);
            }
            const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', session.user.id);
            setReferralCount(count || 0);
            
            const { data: oData } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (oData) {
                setOrders(oData);
                if (initialOrderId) {
                    const target = oData.find(o => o.id === initialOrderId);
                    if (target) { setSelectedOrder(target); setActiveTab('orders'); }
                }
            }

            const { data: appData } = await supabase.from('tournament_applications').select('*, tournament:tournaments(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (appData) setApplications(appData);
        }
    }
    setLoading(false);
  }, [session, isGuest, initialOrderId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClaimDaily = async () => {
      if (!canClaimDaily || !profile) return;
      const rewardPoints = Math.floor(Math.random() * 50) + 20;
      const rewardMoney = 0.10;
      const getSpin = Math.random() < 0.20; 
      
      try {
          const newPoints = (profile.discord_points || 0) + rewardPoints;
          const newBalance = (profile.wallet_balance || 0) + rewardMoney;
          const newSpins = (profile.spins_count || 0) + (getSpin ? 1 : 0);
          const now = new Date().toISOString();

          const { error } = await supabase.from('profiles').update({
              discord_points: newPoints,
              wallet_balance: newBalance,
              spins_count: newSpins,
              last_daily_claim: now
          }).eq('id', profile.id);

          if (error) throw error;
          setProfile({ ...profile, discord_points: newPoints, wallet_balance: newBalance, spins_count: newSpins, last_daily_claim: now });
          setCanClaimDaily(false);
          addToast('Neural Drop Acquired!', `Matrix synced: +${rewardPoints} PTS, +${rewardMoney} DH${getSpin ? ' & 1 FREE SPIN!' : '!'}`, 'success');
      } catch (err) { addToast('Error', 'Link failed.', 'error'); }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      addToast('Link Copied', 'Url copied to clipboard.', 'success');
  };

  const vipProgress = profile ? Math.min(100, (profile.vip_points / 5000) * 100) : 0;

  if (isGuest && authMode === 'none') {
    return (
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center animate-fade-in">
            <div className="bg-[#1e232e] p-12 md:p-20 rounded-[4rem] border border-white/5 shadow-3xl max-w-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none"><ShieldCheck className="w-64 h-64" /></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-600/30">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">LOGIN <br/><span className="text-blue-500">REQUIRED</span></h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-12 max-w-sm mx-auto">Access your secure vault, track trade history, and manage your assets.</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={() => setAuthMode('login')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <LogIn className="w-4 h-4" /> Login
                        </button>
                        <button 
                            onClick={() => setAuthMode('signup')}
                            className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 active:scale-95"
                        >
                            <UserPlus className="w-4 h-4" /> Sign Up
                        </button>
                    </div>
                </div>
            </div>
            
            <button onClick={() => onNavigate('shop')} className="mt-12 text-gray-600 hover:text-white font-black uppercase tracking-[0.4em] text-[10px] transition-colors">
                Continue as Guest
            </button>
        </div>
    );
  }

  if (isGuest && authMode === 'login') return <div className="py-20 container mx-auto px-4"><LoginForm onAuthSuccess={s => { setSession(s); setAuthMode('none'); }} onToggle={() => setAuthMode('signup')} /></div>;
  if (isGuest && authMode === 'signup') return <div className="py-20 container mx-auto px-4"><SignupForm addToast={addToast} onAuthSuccess={s => { if(s) setSession(s); setAuthMode('none'); }} onToggle={() => setAuthMode('login')} /></div>;

  if (loading && !profile) return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  return (
    <div className="container mx-auto px-4 py-6 md:py-12 animate-fade-in max-w-7xl pb-24">
       <style>{`
         .gold-metallic {
           background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 45%, #b38728 70%, #fbf5b7 100%);
           -webkit-background-clip: text;
           -webkit-text-fill-color: transparent;
         }
         .gold-progress {
           background: linear-gradient(90deg, #bf953f 0%, #fcf6ba 45%, #b38728 100%);
           box-shadow: 0 0 10px rgba(184, 134, 11, 0.5);
         }
       `}</style>
       
       <div className="flex lg:grid lg:grid-cols-12 gap-6 mb-12">
            
            <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-24 h-fit">
                <div className="bg-[#1e232e] rounded-[3rem] border border-white/5 p-8 shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                        {isVip ? <Crown className="w-32 h-32 text-yellow-500" /> : <ShieldCheck className="w-32 h-32 text-blue-500" />}
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative mb-6">
                            <div className={`w-32 h-32 rounded-[2.5rem] border-[8px] border-[#0b0e14] bg-[#1e232e] overflow-hidden shadow-2xl transition-all duration-500 group-hover:scale-[1.05] ${isVip ? 'ring-4 ring-yellow-500/30' : 'ring-4 ring-blue-500/10'}`}>
                                <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="" />
                                <button className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit3 className="w-6 h-6 text-white" />
                                </button>
                            </div>
                            {isVip && (
                                <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#bf953f] to-[#b38728] text-black px-3 py-1 rounded-xl font-black text-[8px] uppercase italic tracking-widest shadow-xl flex items-center gap-1 border-4 border-[#0b0e14]">
                                    <Crown className="w-3 h-3 fill-black" /> ELITE
                                </div>
                            )}
                        </div>

                        <h2 className={`text-3xl font-black italic uppercase tracking-tighter mb-1 ${isVip ? 'gold-metallic' : 'text-white'}`}>{profile?.username}</h2>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-6">Verified Gaming ID</p>

                        <div className="w-full space-y-4 mb-8">
                            <div className="flex justify-between items-center px-4 py-2 rounded-xl bg-[#0b0e14]/50 border border-white/5">
                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Current Rank</span>
                                <span className={`text-xs font-black italic ${isVip ? 'text-yellow-500' : 'text-white'}`}>LVL {Math.floor((profile?.vip_points || 0) / 1000) + 1}</span>
                            </div>
                            <div className="space-y-1.5 px-1">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-500">
                                    <span>XP PROGRESS</span>
                                    <span className="text-white">{profile?.vip_points || 0} / 5000</span>
                                </div>
                                <div className="h-2 w-full bg-[#0b0e14] rounded-full overflow-hidden p-0.5 border border-white/5">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${isVip ? 'gold-progress' : 'bg-blue-500'}`} style={{ width: `${vipProgress}%` }}></div>
                                </div>
                            </div>
                        </div>

                        {!isGuest && (
                            <button onClick={onSignOut} className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition-colors text-[9px] font-black uppercase tracking-[0.3em]">
                                <LogOut className="w-3 h-3" /> Logout
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-[#1e232e] rounded-[2.5rem] border border-white/5 p-4 shadow-2xl space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Control Center', color: 'blue' },
                        { id: 'orders', icon: ClipboardList, label: 'Trade History', color: 'blue' },
                        { id: 'events', icon: Swords, label: 'My Tournaments', color: 'blue' },
                        { id: 'wallet', icon: Wallet, label: 'Digital Vault', color: 'blue' },
                        { id: 'points', icon: Coins, label: 'Loyalty Matrix', color: 'purple' },
                        { id: 'referrals', icon: Users, label: 'Affiliates', color: 'green' }
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)} 
                            className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group ${
                                activeTab === item.id 
                                ? 'bg-[#0b0e14] border border-white/5 text-white shadow-xl translate-x-1'
                                : 'text-gray-500 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <div className="flex items-center gap-4">
                                <item.icon className={`w-4 h-4 ${activeTab === item.id ? (item.color === 'purple' ? 'text-purple-400' : item.color === 'green' ? 'text-green-400' : 'text-blue-400') : ''}`} />
                                <span className="uppercase text-[9px] font-black tracking-[0.2em]">{item.label}</span>
                            </div>
                            <ChevronRight className={`w-3 h-3 transition-transform ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 lg:col-span-8 space-y-6">
                
                <div className="lg:hidden bg-[#1e232e] rounded-[2.5rem] border border-white/5 p-5 md:p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10">
                        <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[1.25rem] md:rounded-[1.75rem] overflow-hidden border-2 flex-shrink-0 ${isVip ? 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'border-white/10 shadow-lg'}`}>
                            <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="min-w-0">
                            <h2 className={`font-black italic uppercase tracking-tighter text-lg md:text-2xl truncate ${isVip ? 'gold-metallic' : 'text-white'}`}>{profile?.username}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[7px] md:text-[9px] font-black bg-white/5 text-gray-400 px-2 py-0.5 rounded uppercase tracking-widest border border-white/5">LVL {Math.floor((profile?.vip_points || 0) / 1000) + 1}</span>
                                {isVip && <Crown className="w-3 h-3 text-yellow-500 animate-pulse" />}
                            </div>
                        </div>
                    </div>
                    <button onClick={onSignOut} className="relative z-10 p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 active:scale-90 transition-transform shadow-lg"><LogOut className="w-4 h-4 md:w-5 md:h-5" /></button>
                </div>

                <div className="lg:hidden flex overflow-x-auto gap-2 md:gap-3 pb-2 no-scrollbar px-1">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Control' },
                        { id: 'orders', icon: ClipboardList, label: 'Trades' },
                        { id: 'events', icon: Swords, label: 'Battles' },
                        { id: 'wallet', icon: Wallet, label: 'Vault' },
                        { id: 'points', icon: Coins, label: 'Rewards' },
                        { id: 'referrals', icon: Users, label: 'Partners' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-none px-5 md:px-7 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all flex items-center gap-2.5 ${
                                activeTab === tab.id ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/30' : 'bg-[#1e232e] text-gray-500 border-white/5'
                            }`}
                        >
                            <tab.icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase">{tab.label}</span>
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-[#1e232e] p-5 md:p-6 rounded-[1.75rem] md:rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><Wallet className="w-12 h-12 md:w-14 md:h-14" /></div>
                            <p className="text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 md:mb-2">Balance</p>
                            <h4 className="text-xl md:text-2xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2)} <span className="text-[10px]">DH</span></h4>
                    </div>
                    <div className="bg-[#1e232e] p-5 md:p-6 rounded-[1.75rem] md:rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><Coins className="w-12 h-12 md:w-14 md:h-14" /></div>
                            <p className="text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 md:mb-2">Points</p>
                            <h4 className="text-xl md:text-2xl font-black text-purple-400 italic tracking-tighter leading-none">{profile?.discord_points?.toLocaleString()} <span className="text-[10px]">PTS</span></h4>
                    </div>
                    <div className="bg-[#1e232e] p-5 md:p-6 rounded-[1.75rem] md:rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><ClipboardList className="w-12 h-12 md:w-14 md:h-14" /></div>
                            <p className="text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 md:mb-2">Trades</p>
                            <h4 className="text-xl md:text-2xl font-black text-blue-400 italic tracking-tighter leading-none">{orders.length}</h4>
                    </div>
                    <div className="bg-[#1e232e] p-5 md:p-6 rounded-[1.75rem] md:rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><Users className="w-12 h-12 md:w-14 md:h-14" /></div>
                            <p className="text-[7px] md:text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1.5 md:mb-2">Partners</p>
                            <h4 className="text-xl md:text-2xl font-black text-green-400 italic tracking-tighter leading-none">{referralCount}</h4>
                    </div>
                </div>

                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-14 text-white shadow-3xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-4 md:mb-6">
                                        <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,234,1)]"></div>
                                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-cyan-200">System Link Active</span>
                                    </div>
                                    <h2 className="text-3xl md:text-7xl font-black italic uppercase leading-none tracking-tighter mb-4 md:mb-6">
                                        Hello,<br/><span className={`drop-shadow-lg ${isVip ? 'gold-metallic' : 'text-white'}`}>{profile?.username}</span>
                                    </h2>
                                    <p className="text-blue-100 font-bold text-[10px] md:text-sm max-w-sm mb-8 md:mb-10 opacity-80 leading-relaxed uppercase tracking-widest">
                                        {isGuest ? "Welcome observer. Log in to start trading." : "Welcome back to your control center. All systems are operational."}
                                    </p>
                                    <div className="flex flex-wrap gap-3 md:gap-4">
                                        <button onClick={() => onNavigate('shop')} className="bg-white text-blue-900 px-7 md:px-10 py-3.5 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase tracking-widest text-[9px] md:text-[11px] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-2">
                                            <ShoppingCart className="w-3.5 h-3.5 md:w-4 h-4" /> Market
                                        </button>
                                        <button onClick={handleClaimDaily} disabled={!canClaimDaily} className={`flex items-center gap-3 px-6 md:px-8 py-3.5 md:py-4 rounded-[1.25rem] md:rounded-[1.5rem] font-black uppercase text-[9px] md:text-[11px] tracking-widest transition-all ${canClaimDaily ? 'bg-cyan-400 text-blue-900 animate-pulse shadow-[0_0_25px_rgba(34,211,234,0.5)]' : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'}`}>
                                            {canClaimDaily ? <Zap className="w-3.5 h-3.5 md:w-4 md:h-4 fill-current" /> : <Timer className="w-3.5 h-3.5 md:w-4 md:h-4" />}
                                            {canClaimDaily ? 'Sync Drop' : timeUntilNextClaim}
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block opacity-10">
                                     <LayoutDashboard className="w-80 h-80 text-white" />
                                </div>
                            </div>

                            <div className="bg-[#1e232e] p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-5 md:gap-6">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#5865F2] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5865F2]/20">
                                        <Users className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter">Discord Activity</h3>
                                        <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest">Earn points by staying active in Discord</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center md:items-end w-full md:w-auto">
                                    <span className="text-[8px] md:text-[10px] font-black text-green-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Tracking Active
                                    </span>
                                    <p className="text-[10px] md:text-xs text-gray-400 italic">Synced: <span className="text-white font-bold">{profile?.username}</span></p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Event Enlistment Status</h3>
                            {applications.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-white/5 rounded-[2rem] text-center text-gray-600 uppercase text-[10px] font-black tracking-widest">No active tournament applications found.</div>
                            ) : (
                                applications.map(app => (
                                    <div key={app.id} className="bg-[#1e232e] p-6 rounded-2xl border border-white/5 shadow-xl group">
                                        <div className="flex items-center justify-between gap-6 mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-900 border border-white/5">
                                                    <img src={app.tournament?.image_url} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.2em] mb-1">{app.tournament?.game_name}</p>
                                                    <h4 className="text-lg font-black text-white italic uppercase leading-none">{app.tournament?.title}</h4>
                                                </div>
                                            </div>
                                            <div className={`px-4 py-2 rounded-xl border font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ${
                                                app.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                                app.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                            }`}>
                                                {app.status === 'pending' && <Clock className="w-4 h-4 animate-spin" />}
                                                {app.status}
                                            </div>
                                        </div>
                                        
                                        {app.admin_message && (
                                            <div className="bg-[#0b0e14] p-5 rounded-2xl border border-white/5 flex gap-4">
                                                <div className="p-2 bg-blue-600/10 rounded-lg h-fit"><MessageSquare className="w-4 h-4 text-blue-500" /></div>
                                                <div>
                                                    <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mb-1">Message from Admin</p>
                                                    <p className="text-sm text-gray-300 font-medium leading-relaxed italic">"{app.admin_message}"</p>
                                                </div>
                                            </div>
                                        )}
                                        {!app.admin_message && app.status === 'pending' && (
                                            <div className="flex items-center gap-3 text-[10px] text-gray-600 font-bold uppercase tracking-widest px-2">
                                                <AlertCircle className="w-4 h-4" /> Awaiting staff validation of your data.
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                            <button onClick={() => onNavigate('tournaments')} className="w-full py-4 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Explore Other Events</button>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="space-y-4 animate-fade-in">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Trade History</h3>
                            {orders.length === 0 ? (
                                <div className="p-12 border-2 border-dashed border-white/5 rounded-[2rem] text-center text-gray-600 uppercase text-[10px] font-black tracking-widest">No active or past trades detected.</div>
                            ) : (
                                orders.map(order => (
                                    <div key={order.id} className="bg-[#1e232e] p-5 rounded-2xl border border-white/5 flex items-center justify-between shadow-xl hover:border-blue-500/30 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl ${order.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'}`}><Zap className="w-5 h-5" /></div>
                                            <div>
                                                <p className="text-white font-black italic uppercase text-sm leading-none mb-1">Order #{order.id.slice(0, 8)}</p>
                                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex items-center gap-6">
                                            <div>
                                                <p className="text-yellow-400 font-black italic text-lg tracking-tighter">{order.total_amount.toFixed(2)} DH</p>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${order.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>{order.status}</p>
                                            </div>
                                            <button onClick={() => setSelectedOrder(order)} className="p-3 bg-white/5 rounded-xl hover:bg-blue-600 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-900 to-black p-10 rounded-[2.5rem] border border-blue-500/20 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Wallet className="w-40 h-40" /></div>
                                <p className="text-blue-400 font-black uppercase text-[10px] tracking-widest mb-2 relative z-10">Available Solde</p>
                                <h3 className="text-6xl font-black text-white italic tracking-tighter relative z-10">{profile?.wallet_balance.toFixed(2)} DH</h3>
                                <button onClick={() => onNavigate('topup')} className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 relative z-10 shadow-xl shadow-blue-600/30 transition-all">
                                    <Plus className="w-4 h-4" /> Add Funds
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'points' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-purple-900 to-black p-10 rounded-[2.5rem] border border-purple-500/20 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Coins className="w-40 h-40" /></div>
                                <p className="text-purple-400 font-black uppercase text-[10px] tracking-widest mb-2 relative z-10">Discord Points Matrix</p>
                                <h3 className="text-6xl font-black text-white italic tracking-tighter relative z-10">{profile?.discord_points.toLocaleString()} PTS</h3>
                                <div className="flex gap-4 mt-8 relative z-10">
                                    <button onClick={() => onNavigate('pointsShop')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 shadow-xl shadow-purple-600/30 transition-all">
                                        <ShoppingCart className="w-3.5 h-3.5 md:w-4 h-4" /> Point Shop
                                    </button>
                                    <button onClick={() => onNavigate('spin')} className="bg-white/5 hover:bg-white/10 text-white px-8 py-3.5 rounded-xl border border-white/10 font-black uppercase text-[10px] tracking-widest flex items-center gap-2 transition-all">
                                        <Timer className="w-3.5 h-3.5 md:w-4 h-4" /> Win Wheel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referrals' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-green-900 to-black p-10 rounded-[2.5rem] border border-green-500/20 shadow-2xl relative overflow-hidden text-center">
                                <div className="absolute top-0 right-0 p-8 opacity-10"><Users className="w-40 h-40" /></div>
                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 relative z-10">Affiliate Program</h3>
                                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8 relative z-10">Invite friends and earn 5 DH per signup + commission on trades.</p>
                                <div className="bg-[#0b0e14] p-6 rounded-2xl border border-white/5 inline-flex items-center gap-4 relative z-10">
                                    <div className="text-left">
                                        <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Your Referral Code</p>
                                        <p className="text-2xl font-black text-green-400 font-mono tracking-widest">{profile?.username?.toUpperCase().slice(0, 8) || 'MOON-USER'}</p>
                                    </div>
                                    <button onClick={() => copyToClipboard(`https://moon-night.store/signup?ref=${profile?.username}`)} className="p-4 bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg transition-all"><Copy className="w-5 h-5" /></button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
       </div>

       {selectedOrder && profile && <OrderDetailsModal order={selectedOrder} currentUser={profile} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};
