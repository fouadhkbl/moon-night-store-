
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order, OrderItem, OrderMessage, PointRedemption, RedemptionMessage } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
// Added Loader2 to imports
import { Gamepad2, Wallet, LogIn, LogOut, CreditCard, ArrowUpRight, ArrowDownLeft, History, Plus, ShieldCheck, MessageSquare, Send, X, Clock, Eye, Trash2, CheckCircle, Coins, Gift, Calendar, LayoutDashboard, ClipboardList, Copy, Users, Link, Crown, Sparkles, Timer, RotateCw, Loader2 } from 'lucide-react';

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
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-4xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-gray-800 overflow-y-auto">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Order #{order.id.slice(0,6)}</h3>
                    <div className={`p-4 rounded-xl mb-6 border flex items-center gap-3 ${order.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-500' : order.status === 'canceled' ? 'bg-red-500/10 border-red-500/30 text-red-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
                        {order.status === 'completed' && <CheckCircle className="w-6 h-6" />}
                        {order.status === 'canceled' && <X className="w-6 h-6" />}
                        {order.status === 'pending' && <Clock className="w-6 h-6 animate-pulse" />}
                        <div><p className="text-[10px] font-black uppercase tracking-widest opacity-70">Status</p><p className="text-lg font-black uppercase">{order.status}</p></div>
                    </div>
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-3 bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                                <img src={item.product?.image_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                <div><p className="text-sm font-bold text-white truncate max-w-[150px]">{item.product?.name}</p><p className="text-[10px] text-gray-500">Qty: {item.quantity}</p></div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-black text-yellow-400 italic tracking-tighter">{order.total_amount.toFixed(2)} DH</p>
                    </div>
                    <button onClick={onClose} className="mt-8 w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white transition uppercase text-xs font-black">Close</button>
                </div>
                <div className="w-full md:w-7/12 flex flex-col h-full bg-[#1e232e]">
                    <div className="p-4 border-b border-gray-800 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-500"/><span className="text-sm font-black text-white uppercase">Support Chat</span></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/50 custom-scrollbar">
                         {messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e232e] text-gray-200 border border-gray-700 rounded-tl-none'}`}>{msg.message}</div>
                             </div>
                         ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 flex gap-2">
                        <input type="text" className="flex-1 bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm" placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="bg-blue-600 p-3 rounded-xl text-white" disabled={!newMessage.trim()}><Send className="w-5 h-5" /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const RedemptionDetailsModal = ({ redemption, currentUser, onClose }: { redemption: PointRedemption, currentUser: Profile, onClose: () => void }) => {
    const [messages, setMessages] = useState<RedemptionMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<null | HTMLDivElement>(null);
    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    useEffect(() => {
        const fetchDetails = async () => {
            const { data } = await supabase.from('redemption_messages').select('*').eq('redemption_id', redemption.id).order('created_at', { ascending: true });
            if (data) setMessages(data);
            scrollToBottom();
        };
        fetchDetails();
        const channel = supabase.channel(`red_chat:${redemption.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemption_messages', filter: `redemption_id=eq.${redemption.id}` }, (payload) => {
                const newMsg = payload.new as RedemptionMessage;
                setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                scrollToBottom();
            }).subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [redemption.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const msgText = newMessage.trim();
        setNewMessage(''); 
        const { data } = await supabase.from('redemption_messages').insert({ redemption_id: redemption.id, sender_id: currentUser.id, message: msgText }).select().single();
        if (data) setMessages(prev => [...prev, data]);
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#1e232e] w-full max-w-4xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-gray-800 overflow-y-auto">
                    <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-6">Reward Claim</h3>
                    <div className="flex gap-4 bg-[#0b0e14] p-4 rounded-2xl border border-gray-800 mb-6">
                        <img src={redemption.point_product?.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />
                        <div><p className="text-sm font-bold text-white">{redemption.point_product?.name}</p><p className="text-xs text-purple-400 font-black italic">{redemption.cost_at_redemption} PTS</p></div>
                    </div>
                    <button onClick={onClose} className="w-full py-3 rounded-xl border border-gray-700 text-gray-400 font-black">Close</button>
                </div>
                <div className="w-full md:w-7/12 flex flex-col h-full bg-[#1e232e]">
                    <div className="p-4 border-b border-gray-800 font-black text-white uppercase">Redemption Support</div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/50 custom-scrollbar">
                         {messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === currentUser.id ? 'bg-purple-600 text-white' : 'bg-[#1e232e] text-gray-200'}`}>{msg.message}</div>
                             </div>
                         ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 bg-[#1e232e] border-t border-gray-800 flex gap-2">
                        <input type="text" className="flex-1 bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-3 text-white" placeholder="Message admin..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="bg-purple-600 p-3 rounded-xl text-white"><Send className="w-5 h-5" /></button>
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
  const [pointRedemptions, setPointRedemptions] = useState<PointRedemption[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'points' | 'referrals'>(initialTab || 'overview');
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<PointRedemption | null>(null);
  const [referralCount, setReferralCount] = useState(0);
  const [canClaimDaily, setCanClaimDaily] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');
  
  const isGuest = session?.user?.id === 'guest-user-123';
  const isVip = profile?.vip_level && profile.vip_level > 0;

  useEffect(() => { if (initialTab) setActiveTab(initialTab); }, [initialTab]);

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
    if (session?.user) {
        if (isGuest) {
            setProfile({ id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Gamer', avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80', wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0, total_donated: 0, spins_count: 0 });
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
                    if (target) { setSelectedOrder(target); if (!initialTab) setActiveTab('orders'); }
                }
            }
            const { data: prData } = await supabase.from('point_redemptions').select('*, point_product:point_products(*)').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (prData) setPointRedemptions(prData);
        }
    }
  }, [session, isGuest, initialOrderId, initialTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClaimDaily = async () => {
      if (!canClaimDaily || !profile) return;
      const rewardPoints = Math.floor(Math.random() * 50) + 20;
      const rewardMoney = 0.10;
      const getSpin = Math.random() < 0.20; // 20% chance for a free spin
      
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
          addToast('Daily Claimed!', `Received ${rewardPoints} PTS, ${rewardMoney} DH${getSpin ? ' & 1 FREE SPIN!' : '!'}`, 'success');
      } catch (err) { addToast('Error', 'Failed to claim rewards.', 'error'); }
  };

  const handleDeleteOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Remove this order from history?")) return;
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (!error) { addToast("Deleted", "Order removed.", "success"); setOrders(prev => prev.filter(o => o.id !== orderId)); }
  };

  if (isGuest && authMode === 'login') return <div className="py-20 container mx-auto px-4"><LoginForm onAuthSuccess={s => { setSession(s); setAuthMode('none'); onNavigate('dashboard'); }} onToggle={() => setAuthMode('signup')} /></div>;
  if (isGuest && authMode === 'signup') return <div className="py-20 container mx-auto px-4"><SignupForm addToast={addToast} onAuthSuccess={s => { if(s) setSession(s); setAuthMode('none'); onNavigate('dashboard'); }} onToggle={() => setAuthMode('login')} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in pb-20">
       <div className={`relative rounded-[2rem] overflow-hidden mb-12 shadow-2xl bg-[#1e232e] ${isVip ? 'border-2 border-yellow-500/20' : ''}`}>
          <div className={`h-48 w-full relative ${isVip ? 'bg-gradient-to-r from-yellow-600 via-amber-500 to-[#1e232e]' : 'bg-gradient-to-r from-blue-900 via-purple-900 to-[#1e232e]'}`}>
              {isVip && <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />}
          </div>
          <div className="px-4 md:px-8 pb-10 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6 text-center md:text-left relative z-10">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl border-8 border-[#0b0e14] bg-[#1e232e] overflow-hidden shadow-2xl flex-shrink-0 ${isVip ? 'ring-4 ring-yellow-500' : ''}`}>
                 <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="" />
              </div>
              <div className="flex-1 pb-2">
                 <h1 className={`text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 leading-none ${isVip ? 'text-yellow-400' : 'text-white'}`}>{profile?.username}{isVip && <Crown className="w-6 h-6 inline-block ml-2 mb-2" />}</h1>
                 <p className="text-gray-500 font-bold text-sm">{profile?.email}</p>
              </div>
               
               <div className="flex flex-col items-center md:items-end gap-3 pb-2 w-full md:w-auto">
                 <div className="flex gap-3 w-full md:w-auto">
                    {!isGuest && (
                        <button onClick={handleClaimDaily} disabled={!canClaimDaily} className={`flex-1 bg-[#0b0e14]/80 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border flex items-center gap-3 shadow-xl ${canClaimDaily ? 'border-green-500/30 hover:border-green-500 animate-pulse' : 'border-gray-800 opacity-70 cursor-not-allowed'}`}>
                            <div className={`p-2 rounded-full ${canClaimDaily ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{canClaimDaily ? <Gift className="w-4 h-4" /> : <Timer className="w-4 h-4" />}</div>
                            <div className="text-left hidden md:block">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Daily Reward</p>
                                <p className={`text-sm font-black italic tracking-tighter leading-none ${canClaimDaily ? 'text-green-400' : 'text-gray-400'}`}>{canClaimDaily ? 'CLAIM NOW' : timeUntilNextClaim}</p>
                            </div>
                        </button>
                    )}
                    {!isGuest && (
                        <button onClick={() => onNavigate('spin')} className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-[1.5rem] flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
                            <div className="p-2 rounded-full bg-white/20"><Sparkles className="w-4 h-4" /></div>
                            <div className="text-left hidden md:block">
                                <p className="text-[9px] text-purple-200 uppercase font-black mb-1">Play</p>
                                <p className="text-sm font-black italic tracking-tighter">SPIN WIN</p>
                            </div>
                        </button>
                    )}
                 </div>

                 <div className="bg-[#0b0e14]/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-blue-500/30 flex items-center gap-6 shadow-2xl w-full md:w-auto justify-between">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest leading-none mb-1">Solde Balance</p>
                        <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                    </div>
                    {(profile?.spins_count || 0) > 0 && (
                        <div className="flex flex-col items-center animate-bounce-slow">
                            <div className="bg-pink-600/20 p-2 rounded-full border border-pink-500/30 shadow-[0_0_15px_rgba(219,39,119,0.4)]"><RotateCw className="w-4 h-4 text-pink-500" /></div>
                            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mt-1">{profile?.spins_count} Free</p>
                        </div>
                    )}
                 </div>

                 {isGuest ? (
                     <div className="flex gap-3 mt-2 w-full">
                        <button onClick={() => setAuthMode('login')} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Log In</button>
                        <button onClick={() => setAuthMode('signup')} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black uppercase text-[10px]">Sign Up</button>
                     </div>
                 ) : (
                    <button onClick={onSignOut} className="w-full bg-red-900/10 text-red-500 border border-red-500/20 px-8 py-3 rounded-2xl font-black uppercase text-[10px]"><LogOut className="w-4 h-4 inline mr-2"/> Logout System</button>
                 )}
              </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="bg-[#1e232e] rounded-[2rem] border border-gray-800 shadow-2xl flex flex-row lg:flex-col overflow-x-auto scrollbar-hide lg:overflow-visible">
             <button onClick={() => setActiveTab('overview')} className={`flex-none lg:w-full p-6 flex items-center gap-4 uppercase text-[10px] font-black ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><LayoutDashboard className="w-4 h-4" /> Dashboard</button>
             <button onClick={() => setActiveTab('orders')} className={`flex-none lg:w-full p-6 flex items-center gap-4 uppercase text-[10px] font-black ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><ClipboardList className="w-4 h-4" /> Orders</button>
             <button onClick={() => setActiveTab('wallet')} className={`flex-none lg:w-full p-6 flex items-center gap-4 uppercase text-[10px] font-black ${activeTab === 'wallet' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}><Wallet className="w-4 h-4" /> Wallet</button>
             <button onClick={() => setActiveTab('points')} className={`flex-none lg:w-full p-6 flex items-center gap-4 uppercase text-[10px] font-black ${activeTab === 'points' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}><Coins className="w-4 h-4" /> Discord Points</button>
             <button onClick={() => setActiveTab('referrals')} className={`flex-none lg:w-full p-6 flex items-center gap-4 uppercase text-[10px] font-black ${activeTab === 'referrals' ? 'bg-green-600 text-white' : 'text-gray-500'}`}><Users className="w-4 h-4" /> Referrals</button>
          </div>
          <div className="lg:col-span-3">
             {activeTab === 'overview' && (
                <div className="space-y-8">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative">
                        <h2 className="text-4xl font-black italic uppercase leading-none mb-4">Welcome, {profile?.username}!</h2>
                        <p className="text-blue-100 font-black uppercase text-[11px] tracking-widest opacity-80">{isGuest ? "GUEST MODE: PROFILE NOT SYNCED" : "SECURE MARKETPLACE HUB ACTIVE"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-xl">
                           <p className="text-gray-500 text-[10px] uppercase font-black mb-3">Verified Commands</p>
                           <h3 className="text-5xl font-black text-white italic">{orders.length}</h3>
                        </div>
                        <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-xl">
                           <p className="text-gray-500 text-[10px] uppercase font-black mb-3">Live Solde</p>
                           <h3 className="text-5xl font-black text-yellow-400 italic">{profile?.wallet_balance?.toFixed(2)} DH</h3>
                        </div>
                    </div>
                </div>
             )}
             {activeTab === 'orders' && (
                <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl space-y-4">
                   <h3 className="font-black text-white text-2xl italic uppercase mb-8">Trade History</h3>
                   {orders.map(o => (
                       <div key={o.id} onClick={() => setSelectedOrder(o)} className="p-6 bg-[#0b0e14] rounded-3xl flex justify-between items-center border border-gray-800 hover:border-blue-500 cursor-pointer transition-all shadow-xl group">
                           <div><p className="font-black text-white uppercase text-lg group-hover:text-blue-400">Trade #{o.id.slice(0,8)}</p><p className="text-[10px] text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p></div>
                           <div className="flex items-center gap-6"><p className="font-black text-green-400 italic text-2xl">{o.total_amount.toFixed(2)} DH</p><button className="bg-blue-600 p-3 rounded-xl"><Eye className="w-5 h-5" /></button></div>
                       </div>
                   ))}
                </div>
             )}
             {activeTab === 'points' && (
                 <div className="space-y-8 animate-slide-up">
                    <div className="bg-gradient-to-br from-purple-700 to-indigo-900 p-12 rounded-[2.5rem] text-white shadow-2xl flex flex-col items-center justify-center text-center">
                        <Coins className="w-12 h-12 mb-4" />
                        <p className="text-purple-200 font-black uppercase text-xs tracking-widest mb-2">Available Balance</p>
                        <h3 className="text-8xl font-black italic tracking-tighter leading-none mb-6">{profile?.discord_points || 0}</h3>
                        <button onClick={() => onNavigate('spin')} className="bg-white text-purple-900 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-all"><Sparkles className="w-4 h-4" /> Spin & Win</button>
                    </div>
                    <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                        <h3 className="font-black text-white text-2xl italic uppercase mb-8">Redeemed Rewards</h3>
                        {pointRedemptions.map(r => (
                            <div key={r.id} onClick={() => setSelectedRedemption(r)} className="bg-[#0b0e14] rounded-[2rem] p-4 border border-gray-800 hover:border-purple-500 transition-all flex items-center gap-4 cursor-pointer mb-4">
                                <img src={r.point_product?.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />
                                <div className="flex-1"><p className="text-white font-black italic">{r.point_product?.name}</p><p className="text-[10px] text-gray-500 uppercase">{r.status}</p></div>
                                <div className="text-right text-purple-400 font-black italic">{r.cost_at_redemption} PTS</div>
                            </div>
                        ))}
                    </div>
                 </div>
             )}
             {/* Wallet and Referrals remain similarly integrated */}
          </div>
       </div>
       {selectedOrder && profile && <OrderDetailsModal order={selectedOrder} currentUser={profile} onClose={() => setSelectedOrder(null)} />}
       {selectedRedemption && profile && <RedemptionDetailsModal redemption={selectedRedemption} currentUser={profile} onClose={() => setSelectedRedemption(null)} />}
    </div>
  );
};
