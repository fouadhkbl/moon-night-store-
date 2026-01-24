
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order, OrderItem, OrderMessage, PointRedemption, RedemptionMessage } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
import { 
  Wallet, LogIn, LogOut, CreditCard, History, Plus, ShieldCheck, MessageSquare, 
  Send, X, Clock, Eye, CheckCircle, Coins, Gift, LayoutDashboard, 
  ClipboardList, Copy, Users, Crown, Sparkles, Timer, Loader2, Edit3, 
  ChevronRight, Award, Zap, Bell, Monitor, Smartphone, Globe, ShoppingCart, Activity
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
        const optimisicMsg: OrderMessage = { id: tempId, order_id: order.id, sender_id: currentUser.id, message: msgText, created_at: new Date().toISOString() };
        setMessages(prev => [...prev, optimisicMsg]);
        const { data, error } = await supabase.from('order_messages').insert({ order_id: order.id, sender_id: currentUser.id, message: msgText }).select().single();
        if (error) setMessages(prev => prev.filter(m => m.id !== tempId));
        else if (data) setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    };

    if (loading) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-5xl md:rounded-[2.5rem] border-white/5 shadow-3xl flex flex-col md:flex-row overflow-hidden h-full md:h-[85vh]">
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
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50" disabled={!newMessage.trim()}>
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = ({ session, addToast, onSignOut, onNavigate, setSession, initialOrderId, initialTab }: { 
    session: any, addToast: any, onSignOut: () => void, onNavigate: (p: string) => void, setSession: (s: any) => void, initialOrderId?: string | null, initialTab?: 'overview' | 'orders' | 'wallet' | 'points'
}) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'points' | 'referrals'>(initialTab || 'overview');
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
            setProfile({ id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Player', avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80', wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0, total_donated: 0, spins_count: 0 });
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
      addToast('System Link Copied', 'Encrypted URL ready for distribution.', 'success');
  };

  const vipProgress = profile ? Math.min(100, (profile.vip_points / 5000) * 100) : 0;

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
            
            {/* LEFT SIDEBAR: PROFILE & NAVIGATION */}
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
                                <LogOut className="w-3 h-3" /> Terminate Session
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-[#1e232e] rounded-[2.5rem] border border-white/5 p-4 shadow-2xl space-y-2">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Control Center', color: 'blue' },
                        { id: 'orders', icon: ClipboardList, label: 'Trade History', color: 'blue' },
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

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 lg:col-span-8 space-y-6">
                
                {/* Mobile Identity Card - Professional Redesign */}
                <div className="lg:hidden bg-[#1e232e] rounded-[2.5rem] border border-white/5 p-6 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 rounded-[1.5rem] overflow-hidden border-2 ${isVip ? 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]' : 'border-blue-500/20'}`}>
                            <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                            <h2 className={`font-black italic uppercase tracking-tighter text-lg ${isVip ? 'text-yellow-400' : 'text-white'}`}>{profile?.username}</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase tracking-widest border border-blue-500/20">LVL {Math.floor((profile?.vip_points || 0) / 1000) + 1}</span>
                                {isVip && <Crown className="w-3 h-3 text-yellow-500 animate-bounce-slow" />}
                            </div>
                        </div>
                    </div>
                    <button onClick={onSignOut} className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 active:scale-90 transition-transform"><LogOut className="w-4 h-4" /></button>
                </div>

                {/* Mobile Tab Scroll - Premium feel */}
                <div className="lg:hidden flex overflow-x-auto gap-3 pb-2 no-scrollbar">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'OVERVIEW' },
                        { id: 'orders', icon: ClipboardList, label: 'ORDERS' },
                        { id: 'wallet', icon: Wallet, label: 'VAULT' },
                        { id: 'points', icon: Coins, label: 'LOYALTY' },
                        { id: 'referrals', icon: Users, label: 'PARTNERS' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-none px-6 py-4 rounded-2xl border transition-all flex items-center gap-3 ${
                                activeTab === tab.id ? 'bg-blue-600 text-white border-blue-500 shadow-xl shadow-blue-600/30' : 'bg-[#1e232e] text-gray-500 border-white/5'
                            }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-[10px] font-black tracking-[0.1em]">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* SHARED STAT BAR */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><Wallet className="w-14 h-14" /></div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Internal Solde</p>
                            <h4 className="text-2xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2)} <span className="text-xs">DH</span></h4>
                    </div>
                    <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><Coins className="w-14 h-14" /></div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Neural Points</p>
                            <h4 className="text-2xl font-black text-purple-400 italic tracking-tighter leading-none">{profile?.discord_points?.toLocaleString()} <span className="text-xs">PTS</span></h4>
                    </div>
                    <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><ClipboardList className="w-14 h-14" /></div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Active Trades</p>
                            <h4 className="text-2xl font-black text-blue-400 italic tracking-tighter leading-none">{orders.length}</h4>
                    </div>
                    <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
                            <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform"><Users className="w-14 h-14" /></div>
                            <p className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">Affiliates</p>
                            <h4 className="text-2xl font-black text-green-400 italic tracking-tighter leading-none">{referralCount}</h4>
                    </div>
                </div>

                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[3.5rem] p-10 md:p-14 text-white shadow-3xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,234,1)]"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-200">System Link Active</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-none tracking-tighter mb-6">
                                        Hello,<br/><span className={`drop-shadow-lg ${isVip ? 'gold-metallic' : 'text-white'}`}>{profile?.username}</span>
                                    </h2>
                                    <p className="text-blue-100 font-bold text-xs md:text-sm max-w-sm mb-10 opacity-80 leading-relaxed uppercase tracking-widest">
                                        {isGuest ? "Access restricted to guest mode. Please sync identity." : "Welcome back to the Moon Night Control Center. All services optimal."}
                                    </p>
                                    <div className="flex flex-wrap gap-4">
                                        <button onClick={() => onNavigate('shop')} className="bg-white text-blue-900 px-10 py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-2xl flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4" /> Market
                                        </button>
                                        <button onClick={handleClaimDaily} disabled={!canClaimDaily} className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black uppercase text-[11px] tracking-widest transition-all ${canClaimDaily ? 'bg-cyan-400 text-blue-900 animate-pulse shadow-[0_0_25px_rgba(34,211,234,0.5)]' : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'}`}>
                                            {canClaimDaily ? <Zap className="w-4 h-4 fill-current" /> : <Timer className="w-4 h-4" />}
                                            {canClaimDaily ? 'Sync Daily Drop' : timeUntilNextClaim}
                                        </button>
                                    </div>
                                </div>
                                <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden lg:block opacity-10">
                                     <LayoutDashboard className="w-80 h-80 text-white" />
                                </div>
                            </div>

                            {/* DISCORD SYNC STATUS - Professional Placeholder */}
                            <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 bg-[#5865F2] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5865F2]/20">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Discord Activity Sync</h3>
                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Earn Points while you stay active on our server</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-center md:items-end">
                                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Tracking Active
                                    </span>
                                    <p className="text-xs text-gray-400 italic">Connected as <span className="text-white font-bold">{profile?.username}#0000</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#1e232e] p-8 rounded-[3rem] border border-white/5 shadow-xl group hover:border-purple-500/30 transition-all cursor-pointer" onClick={() => onNavigate('spin')}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-purple-600/10 rounded-2xl text-purple-400 border border-purple-500/20 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            <Sparkles className="w-8 h-8" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">Win Hub</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Neural Win Wheel</h3>
                                    <p className="text-xs text-gray-500 font-bold mb-8 uppercase tracking-wide leading-relaxed">Trade loyalty points for matrix rewards. Jackpots refreshed every 24h.</p>
                                    <div className="flex items-center gap-2 text-purple-400 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform">
                                        Initialize Spin <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="bg-[#1e232e] p-8 rounded-[3rem] border border-white/5 shadow-xl group hover:border-yellow-500/30 transition-all cursor-pointer" onClick={() => onNavigate('loot')}>
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-4 bg-yellow-600/10 rounded-2xl text-yellow-500 border border-yellow-500/20 group-hover:bg-yellow-500 group-hover:text-black transition-all">
                                            <Award className="w-8 h-8" />
                                        </div>
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-4 py-1.5 rounded-full">Rarity</span>
                                    </div>
                                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Lunar Packs</h3>
                                    <p className="text-xs text-gray-500 font-bold mb-8 uppercase tracking-wide leading-relaxed">Unbox digital asset crates for high-yield balance drops. High rarity odds.</p>
                                    <div className="flex items-center gap-2 text-yellow-500 text-[10px] font-black uppercase tracking-widest group-hover:translate-x-3 transition-transform">
                                        Browse Inventory <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="bg-[#1e232e] p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl animate-fade-in min-h-[600px]">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-400 border border-blue-500/20"><History className="w-8 h-8" /></div>
                                    <h3 className="font-black text-white text-3xl italic uppercase tracking-tighter leading-none">Trade Archive</h3>
                                </div>
                                <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-[#0b0e14] px-6 py-3 rounded-full border border-white/5">Synced: {orders.length} Records</div>
                            </div>

                            {orders.length === 0 ? (
                                <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                                    <ClipboardList className="w-20 h-20 mb-8" />
                                    <p className="text-sm font-black uppercase tracking-[0.4em]">No historical data synced</p>
                                    <button onClick={() => onNavigate('shop')} className="mt-10 text-blue-500 text-[11px] font-black uppercase underline tracking-[0.2em] hover:text-blue-400">Initialize First Trade</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map(o => (
                                        <div key={o.id} onClick={() => setSelectedOrder(o)} className="group bg-[#0b0e14]/40 border border-white/5 hover:border-blue-500/40 p-6 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-center gap-6 cursor-pointer transition-all hover:-translate-y-1 shadow-xl hover:shadow-blue-500/5">
                                            <div className="flex items-center gap-6 w-full sm:w-auto">
                                                <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center border transition-colors ${
                                                    o.status === 'completed' ? 'bg-green-500/5 border-green-500/20 text-green-500' : 
                                                    o.status === 'pending' ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500' : 
                                                    'bg-red-500/5 border-red-500/20 text-red-500'
                                                }`}>
                                                    <Zap className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white uppercase text-xl italic tracking-tighter leading-none mb-1.5 group-hover:text-blue-400 transition-colors">TR-ID #{o.id.slice(0,8)}</p>
                                                    <div className="flex items-center gap-4">
                                                         <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</span>
                                                         <div className="w-1 h-1 rounded-full bg-gray-700"></div>
                                                         <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
                                                            o.status === 'completed' ? 'text-green-500 border-green-500/20 bg-green-500/5' : 'text-yellow-500 border-yellow-500/20 bg-yellow-500/5'
                                                         }`}>{o.status}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                                                <div className="text-left sm:text-right">
                                                    <p className="font-black text-yellow-400 italic text-3xl tracking-tighter">{o.total_amount.toFixed(2)} <span className="text-sm">DH</span></p>
                                                    <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mt-1">Digital Distribution</p>
                                                </div>
                                                <div className="w-14 h-14 bg-[#1e232e] rounded-2xl flex items-center justify-center text-gray-600 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-xl border border-white/5">
                                                    <Eye className="w-6 h-6" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'wallet' && (
                        <div className="bg-[#1e232e] p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl animate-fade-in">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                                <h3 className="font-black text-white text-3xl italic uppercase tracking-tighter leading-none">Global Ledger</h3>
                                <button onClick={() => onNavigate('topup')} className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] shadow-2xl shadow-blue-600/20 flex items-center gap-3 active:scale-95 transition-all">
                                    <Plus className="w-4 h-4" /> Expand Capacity
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-gradient-to-br from-blue-900 to-indigo-900 p-10 rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.3em] mb-4 relative z-10">Available Solde (MAD)</p>
                                    <div className="flex items-end gap-3 mb-12 relative z-10">
                                        <h4 className="text-7xl md:text-8xl font-black text-white italic tracking-tighter leading-none drop-shadow-2xl">{profile?.wallet_balance?.toFixed(2)}</h4>
                                        <span className="text-3xl font-black text-blue-400 italic mb-3">DH</span>
                                    </div>
                                    <div className="flex items-center gap-3 relative z-10">
                                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(34,197,94,1)]"></div>
                                        <span className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Matrix Secured</span>
                                    </div>
                                </div>
                                <div className="bg-[#0b0e14]/50 p-10 rounded-[3rem] border border-white/5 flex flex-col justify-center gap-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                                            <ShieldCheck className="w-8 h-8 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-lg uppercase italic tracking-tighter">Protected Matrix</p>
                                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">End-to-End Ledger Sync</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed italic opacity-80">
                                        "Your internal account solde is synchronized across all shop departments for instant, zero-delay fulfillment on digital accounts, currency, and premium keys."
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'points' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-purple-800 to-indigo-900 p-12 md:p-20 rounded-[4rem] text-white shadow-3xl text-center relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-white/10 rounded-[3rem] border border-white/20 flex items-center justify-center mb-8 shadow-3xl backdrop-blur-md">
                                        <Coins className="w-12 h-12 text-purple-200" />
                                    </div>
                                    <p className="text-purple-200 font-black uppercase text-sm tracking-[0.4em] mb-4">Neural Points Protocol</p>
                                    <h3 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none mb-12 drop-shadow-2xl">{profile?.discord_points?.toLocaleString() || 0}</h3>
                                    <div className="flex flex-wrap justify-center gap-6">
                                        <button onClick={() => onNavigate('pointsShop')} className="bg-white text-purple-900 px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-3xl">
                                            <Gift className="w-5 h-5" /> Redeem Matrix
                                        </button>
                                        <button onClick={() => onNavigate('spin')} className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[11px] flex items-center gap-4 hover:bg-purple-500/40 transition-all active:scale-95">
                                            <Sparkles className="w-5 h-5" /> Mini-Game Core
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'referrals' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-gradient-to-br from-green-600 to-emerald-900 p-12 md:p-20 rounded-[4rem] text-white shadow-3xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                                <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-2 rounded-full border border-white/20 mb-8">
                                            <Bell className="w-5 h-5 text-emerald-300" />
                                            <span className="text-emerald-100 font-black uppercase text-[10px] tracking-[0.25em]">Affiliate Node</span>
                                        </div>
                                        <h3 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-[0.85] mb-8">SHARE &<br/><span className="text-emerald-300">EARN MAD</span></h3>
                                        <p className="text-emerald-100 font-bold mb-12 max-w-sm opacity-80 text-sm leading-relaxed uppercase tracking-wider">Expand the Moon Night network. Get <span className="text-white font-black">5.00 DH</span> per sync and <span className="text-white font-black">5% royalty</span> on all trades.</p>
                                        
                                        <div className="flex flex-col sm:flex-row gap-4 max-w-xl">
                                            <div className="flex-1 bg-[#0b0e14]/70 backdrop-blur-2xl border border-white/10 px-8 py-5 rounded-3xl flex items-center justify-between gap-6">
                                                <span className="text-sm font-mono text-white truncate uppercase tracking-[0.2em]">{profile?.referral_code || 'SYNCING...'}</span>
                                                <button onClick={() => profile && copyToClipboard(`${window.location.origin}/#ref=${profile.referral_code}`)} className="text-emerald-400 hover:text-white transition-colors active:scale-125"><Copy className="w-6 h-6"/></button>
                                            </div>
                                            <button onClick={() => profile && copyToClipboard(`${window.location.origin}/#ref=${profile.referral_code}`)} className="bg-white text-emerald-900 px-10 py-5 rounded-3xl font-black uppercase text-[11px] tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-3xl">Copy Link</button>
                                        </div>
                                    </div>
                                    <div className="hidden lg:block opacity-10">
                                         <Users className="w-80 h-80 text-white" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-[#1e232e] p-10 rounded-[3rem] border border-white/5 shadow-xl text-center flex flex-col items-center justify-center">
                                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Network Node Count</p>
                                    <h4 className="text-6xl font-black text-white italic tracking-tighter mb-2">{referralCount}</h4>
                                    <p className="text-[10px] text-green-500 font-black uppercase tracking-[0.2em] bg-green-500/10 px-4 py-1.5 rounded-full">Nodes Operational</p>
                                </div>
                                <div className="bg-[#1e232e] p-10 rounded-[3rem] border border-white/5 shadow-xl text-center flex flex-col items-center justify-center">
                                    <p className="text-[11px] font-black text-gray-500 uppercase tracking-widest mb-4">Aggregate Yield</p>
                                    <h4 className="text-6xl font-black text-yellow-400 italic tracking-tighter mb-2">{profile?.referral_earnings?.toFixed(2)} <span className="text-2xl">DH</span></h4>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full">Passive Revenue</p>
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
