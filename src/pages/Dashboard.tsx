
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order, OrderItem, OrderMessage, PointRedemption, RedemptionMessage } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
import { 
  Gamepad2, Wallet, LogIn, LogOut, CreditCard, ArrowUpRight, 
  ArrowDownLeft, History, Plus, ShieldCheck, MessageSquare, 
  Send, X, Clock, Eye, Trash2, CheckCircle, Coins, Gift, 
  Calendar, LayoutDashboard, ClipboardList, Copy, Users, 
  Link, Crown, Sparkles, Timer, RotateCw, Loader2, Edit3, 
  Settings, ChevronRight, Share2, Award, Zap
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
          addToast('Daily Claimed!', `Received ${rewardPoints} PTS, ${rewardMoney} DH${getSpin ? ' & 1 FREE SPIN!' : '!'}`, 'success');
      } catch (err) { addToast('Error', 'Failed to claim rewards.', 'error'); }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      addToast('Copied!', 'Link copied to clipboard.', 'success');
  };

  const vipProgress = profile ? Math.min(100, (profile.vip_points / 5000) * 100) : 0;

  if (isGuest && authMode === 'login') return <div className="py-20 container mx-auto px-4"><LoginForm onAuthSuccess={s => { setSession(s); setAuthMode('none'); onNavigate('dashboard'); }} onToggle={() => setAuthMode('signup')} /></div>;
  if (isGuest && authMode === 'signup') return <div className="py-20 container mx-auto px-4"><SignupForm addToast={addToast} onAuthSuccess={s => { if(s) setSession(s); setAuthMode('none'); onNavigate('dashboard'); }} onToggle={() => setAuthMode('login')} /></div>;

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in pb-20 max-w-7xl">
       {/* HERO PROFILE SECTION */}
       <div className={`relative rounded-[3rem] overflow-hidden mb-12 shadow-[0_20px_60px_rgba(0,0,0,0.5)] bg-[#1e232e] border border-white/5 transition-all duration-500`}>
          {/* Banner */}
          <div className={`h-60 w-full relative overflow-hidden`}>
              <div className={`absolute inset-0 ${isVip ? 'bg-gradient-to-br from-yellow-700 via-amber-600 to-yellow-900' : 'bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900'}`}>
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-[#1e232e] via-transparent to-transparent"></div>
              </div>
          </div>

          <div className="px-6 md:px-12 pb-12 flex flex-col md:flex-row items-center md:items-end -mt-24 gap-8 text-center md:text-left relative z-10">
              {/* Avatar */}
              <div className="relative group">
                  <div className={`w-40 h-40 md:w-52 md:h-52 rounded-[2.5rem] border-[12px] border-[#1e232e] bg-[#1e232e] overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-[1.02] ${isVip ? 'ring-4 ring-yellow-500/50' : 'ring-4 ring-blue-500/20'}`}>
                    <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="" />
                    <button className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit3 className="w-8 h-8 text-white" />
                    </button>
                  </div>
                  {isVip && (
                      <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-4 py-1.5 rounded-2xl font-black text-[10px] uppercase italic tracking-widest shadow-xl flex items-center gap-1.5 border-4 border-[#1e232e]">
                          <Crown className="w-3.5 h-3.5 fill-black" /> ELITE
                      </div>
                  )}
              </div>

              {/* Identity & Rank */}
              <div className="flex-1 mb-2">
                 <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                    <h1 className={`text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-none ${isVip ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'text-white'}`}>
                        {profile?.username}
                    </h1>
                 </div>

                 {/* XP Progress Bar */}
                 <div className="max-w-md">
                    <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            Loyalty Progress 
                            <span className="text-white ml-1">{profile?.vip_points || 0}/5000 XP</span>
                        </p>
                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">LVL {Math.floor((profile?.vip_points || 0) / 1000) + 1}</p>
                    </div>
                    <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 p-0.5">
                       <div 
                        className={`h-full rounded-full transition-all duration-1000 ${isVip ? 'bg-gradient-to-r from-yellow-600 to-amber-400' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`} 
                        style={{ width: `${vipProgress}%` }}
                       ></div>
                    </div>
                 </div>
              </div>
               
               {/* Action Center */}
               <div className="flex flex-col items-center md:items-end gap-4 w-full md:w-auto">
                 {isGuest ? (
                     <div className="flex flex-col gap-3 w-full sm:w-[280px]">
                        <button onClick={() => setAuthMode('login')} className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3">
                            <LogIn className="w-5 h-5" /> Login
                        </button>
                        <button onClick={() => setAuthMode('signup')} className="w-full bg-white/5 hover:bg-white/10 text-white h-14 rounded-2xl font-black uppercase tracking-widest text-xs border border-white/10 transition-all flex items-center justify-center gap-3">
                            <Plus className="w-5 h-5" /> Sign Up
                        </button>
                     </div>
                 ) : (
                    <div className="flex flex-col gap-4 w-full md:w-auto items-center md:items-end">
                        <div className="flex gap-3">
                            <button onClick={handleClaimDaily} disabled={!canClaimDaily} className={`flex-1 min-w-[140px] bg-[#0b0e14]/80 backdrop-blur-xl px-5 py-3 rounded-2xl border flex items-center gap-3 shadow-xl transition-all ${canClaimDaily ? 'border-green-500/40 hover:border-green-500 animate-pulse' : 'border-gray-800 opacity-60 cursor-not-allowed'}`}>
                                <div className={`p-2 rounded-xl ${canClaimDaily ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{canClaimDaily ? <Gift className="w-4 h-4" /> : <Timer className="w-4 h-4" />}</div>
                                <div className="text-left">
                                    <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-0.5">Daily Drop</p>
                                    <p className={`text-[11px] font-black italic tracking-tighter ${canClaimDaily ? 'text-green-400' : 'text-gray-400'}`}>{canClaimDaily ? 'COLLECT' : timeUntilNextClaim}</p>
                                </div>
                            </button>
                            <button onClick={() => onNavigate('spin')} className="flex-1 min-w-[140px] bg-gradient-to-r from-purple-600 to-pink-600 text-white px-5 py-3 rounded-2xl flex items-center gap-3 shadow-xl shadow-purple-600/20 hover:scale-105 active:scale-95 transition-all">
                                <div className="p-2 rounded-xl bg-white/20"><Sparkles className="w-4 h-4" /></div>
                                <div className="text-left">
                                    <p className="text-[8px] text-purple-200 uppercase font-black mb-0.5">Minigame</p>
                                    <p className="text-[11px] font-black italic tracking-tighter">SPIN & WIN</p>
                                </div>
                            </button>
                        </div>
                        <button onClick={onSignOut} className="text-gray-500 hover:text-red-500 font-black uppercase text-[10px] tracking-[0.25em] flex items-center gap-2 transition-colors">
                            <LogOut className="w-4 h-4" /> Logout
                        </button>
                    </div>
                 )}
              </div>
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-6">
              <div className="bg-[#1e232e] rounded-[2.5rem] border border-white/5 shadow-2xl p-4 flex flex-row lg:flex-col overflow-x-auto scrollbar-hide lg:overflow-visible gap-2">
                 {[
                    { id: 'overview', icon: LayoutDashboard, label: 'Overview', color: 'blue' },
                    { id: 'orders', icon: ClipboardList, label: 'Order History', color: 'blue' },
                    { id: 'wallet', icon: Wallet, label: 'My Wallet', color: 'blue' },
                    { id: 'points', icon: Coins, label: 'Points Hub', color: 'purple' },
                    { id: 'referrals', icon: Users, label: 'Affiliates', color: 'green' }
                 ].map(item => (
                    <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)} 
                        className={`flex-none lg:w-full p-4 rounded-2xl flex items-center gap-4 transition-all group ${
                            activeTab === item.id 
                            ? (item.id === 'points' ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/20' : 
                               item.id === 'referrals' ? 'bg-green-600 text-white shadow-xl shadow-green-600/20' : 
                               'bg-blue-600 text-white shadow-xl shadow-blue-600/20')
                            : 'text-gray-500 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                        <span className="uppercase text-[10px] font-black tracking-widest hidden lg:block">{item.label}</span>
                    </button>
                 ))}
              </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-9">
             {activeTab === 'overview' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-10 md:p-14 text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10"><LayoutDashboard className="w-60 h-60" /></div>
                        <div className="relative z-10">
                            <p className="text-blue-200 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Command Center Online</p>
                            <h2 className="text-5xl md:text-7xl font-black italic uppercase leading-[0.85] tracking-tighter mb-6">
                                Welcome back,<br/>
                                <span className="text-cyan-300">{profile?.username}</span>
                            </h2>
                            <p className="text-blue-100 font-medium text-sm md:text-base max-w-lg mb-8 opacity-80">
                                {isGuest ? "You are currently in guest mode. Login to unlock your account and save your progress." : "Your account matrix is synchronized. Access authorized."}
                            </p>
                            {!isGuest ? (
                                <button onClick={() => onNavigate('shop')} className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">Go to Shop</button>
                            ) : (
                                <button onClick={() => setAuthMode('login')} className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl">Login to Account</button>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative group overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><ClipboardList className="w-16 h-16" /></div>
                           <p className="text-gray-500 text-[10px] uppercase font-black mb-4 tracking-widest">Active Orders</p>
                           <h3 className="text-5xl font-black text-white italic mb-1 tracking-tighter">{orders.length}</h3>
                           <p className="text-[10px] text-green-500 font-bold uppercase">Success Rate: 100%</p>
                        </div>
                        <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative group overflow-hidden">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Wallet className="w-16 h-16" /></div>
                           <p className="text-gray-500 text-[10px] uppercase font-black mb-4 tracking-widest">Wallet Balance</p>
                           <h3 className="text-5xl font-black text-yellow-400 italic mb-1 tracking-tighter">{profile?.wallet_balance?.toFixed(2)} <span className="text-xl">DH</span></h3>
                           <button onClick={() => onNavigate('topup')} className="text-[10px] text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 flex items-center gap-1 mt-2">Add Funds <ChevronRight className="w-3 h-3"/></button>
                        </div>
                        <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-white/5 shadow-xl relative group overflow-hidden sm:col-span-2 lg:col-span-1">
                           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><Coins className="w-16 h-16" /></div>
                           <p className="text-gray-500 text-[10px] uppercase font-black mb-4 tracking-widest">Loyalty Points</p>
                           <h3 className="text-5xl font-black text-purple-400 italic mb-1 tracking-tighter">{profile?.discord_points?.toLocaleString()} <span className="text-xl">PTS</span></h3>
                           <p className="text-[10px] text-gray-500 font-bold uppercase">Ready to Spend</p>
                        </div>
                    </div>
                </div>
             )}

             {activeTab === 'orders' && (
                <div className="bg-[#1e232e] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl space-y-6 animate-fade-in">
                   <div className="flex justify-between items-center mb-8">
                       <h3 className="font-black text-white text-3xl italic uppercase tracking-tighter">Order History</h3>
                       <div className="bg-blue-600/10 px-4 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2">
                           <Clock className="w-4 h-4 text-blue-400" />
                           <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">System Log</span>
                       </div>
                   </div>
                   
                   {orders.length === 0 ? (
                       <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                           <ClipboardList className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                           <p className="text-gray-500 font-black uppercase tracking-widest text-xs">No orders detected yet.</p>
                           <button onClick={() => onNavigate('shop')} className="mt-6 text-blue-500 font-black uppercase text-[10px] tracking-widest hover:underline">Browse Market</button>
                       </div>
                   ) : (
                       <div className="space-y-4">
                           {orders.map(o => (
                               <div key={o.id} onClick={() => setSelectedOrder(o)} className="group p-6 bg-[#0b0e14]/50 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-6 border border-white/5 hover:border-blue-500/40 cursor-pointer transition-all shadow-xl hover:-translate-y-1">
                                   <div className="flex items-center gap-6 w-full sm:w-auto">
                                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                                           o.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                                           o.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                                           'bg-red-500/10 border-red-500/20 text-red-500'
                                       }`}>
                                           <Zap className="w-6 h-6" />
                                       </div>
                                       <div>
                                           <p className="font-black text-white uppercase text-lg italic tracking-tighter leading-none mb-1 group-hover:text-blue-400 transition-colors">Order #{o.id.slice(0,8)}</p>
                                           <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">{new Date(o.created_at).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${o.status === 'completed' ? 'text-green-500' : 'text-yellow-500'}`}>{o.status}</span>
                                           </div>
                                       </div>
                                   </div>
                                   <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                                       <div className="text-right">
                                           <p className="font-black text-yellow-400 italic text-2xl tracking-tighter">{o.total_amount.toFixed(2)} DH</p>
                                           <p className="text-[9px] text-gray-500 uppercase font-black">{o.items?.length || 'Digital Item'}</p>
                                       </div>
                                       <div className="p-4 bg-[#1e232e] rounded-2xl text-gray-500 group-hover:text-white group-hover:bg-blue-600 transition-all shadow-xl">
                                           <Eye className="w-5 h-5" />
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                </div>
             )}

             {activeTab === 'points' && (
                 <div className="space-y-8 animate-fade-in">
                    <div className="bg-gradient-to-br from-purple-700 to-indigo-900 p-12 md:p-16 rounded-[3rem] text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-white/10 rounded-[2rem] border border-white/20 flex items-center justify-center mx-auto mb-6 shadow-2xl">
                                <Coins className="w-10 h-10 text-purple-200" />
                            </div>
                            <p className="text-purple-200 font-black uppercase text-xs tracking-[0.3em] mb-4">Total Balance</p>
                            <h3 className="text-7xl md:text-9xl font-black italic tracking-tighter leading-none mb-10 drop-shadow-2xl">{profile?.discord_points?.toLocaleString() || 0}</h3>
                            <div className="flex flex-wrap justify-center gap-4">
                                <button onClick={() => onNavigate('pointsShop')} className="bg-white text-purple-900 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-105 transition-all shadow-2xl">
                                    <Gift className="w-5 h-5" /> Spend Points
                                </button>
                                <button onClick={() => onNavigate('spin')} className="bg-purple-500/20 backdrop-blur-md border border-purple-400/30 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-purple-500/40 transition-all">
                                    <RotateCw className="w-5 h-5" /> Spin to Win
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>
             )}
             
             {activeTab === 'wallet' && (
                <div className="space-y-8 animate-fade-in">
                   <div className="bg-[#1e232e] p-8 md:p-12 rounded-[3rem] border border-white/5 shadow-2xl">
                       <div className="flex justify-between items-center mb-10">
                           <h3 className="font-black text-white text-3xl italic uppercase tracking-tighter">My Wallet</h3>
                           <button onClick={() => onNavigate('topup')} className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center gap-2">
                               <Plus className="w-4 h-4" /> Top Up
                           </button>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                           <div className="bg-gradient-to-br from-gray-800 to-black p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
                               <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 relative z-10">Available Solde</p>
                               <div className="flex items-end gap-3 mb-8 relative z-10">
                                   <h4 className="text-6xl font-black text-white italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2)}</h4>
                                   <span className="text-2xl font-black text-blue-500 italic mb-1">DH</span>
                               </div>
                               <div className="flex items-center gap-2 relative z-10">
                                   <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                   <span className="text-[9px] font-black text-green-500 uppercase tracking-widest">Ready to use</span>
                               </div>
                           </div>
                           <div className="bg-[#0b0e14] p-8 rounded-[2.5rem] border border-white/5 shadow-xl flex flex-col justify-center">
                               <div className="flex items-center gap-4 mb-6">
                                   <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                       <ShieldCheck className="w-6 h-6 text-blue-400" />
                                   </div>
                                   <div>
                                       <p className="text-white font-black text-sm uppercase italic">Secured Funds</p>
                                       <p className="text-gray-500 text-[10px] font-bold uppercase">SSL Encryption Active</p>
                                   </div>
                               </div>
                               <p className="text-gray-500 text-[10px] leading-relaxed font-medium">Your funds are protected by our secure vault system. Use your balance for instant delivery on all digital products.</p>
                           </div>
                       </div>
                   </div>
                </div>
             )}

             {activeTab === 'referrals' && (
                 <div className="space-y-8 animate-fade-in">
                    <div className="bg-gradient-to-br from-green-600 to-teal-900 p-12 md:p-16 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-10"><Users className="w-48 h-48" /></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                            <div className="flex-1 text-center md:text-left">
                                <p className="text-green-200 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Affiliate Program</p>
                                <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-none mb-6">Invite &<br/><span className="text-emerald-300">Earn</span></h3>
                                <p className="text-green-100 font-medium mb-8 max-w-sm opacity-80">Share your link and get <span className="text-white font-black">5.00 DH</span> per signup and <span className="text-white font-black">5% commission</span>.</p>
                                
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1 bg-[#0b0e14]/50 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-mono text-white truncate max-w-[150px] uppercase tracking-widest">{profile?.referral_code || 'LINKING...'}</span>
                                        <button onClick={() => profile && copyToClipboard(`${window.location.origin}/#ref=${profile.referral_code}`)} className="text-green-400 hover:text-white transition-colors"><Copy className="w-5 h-5"/></button>
                                    </div>
                                    <button onClick={() => profile && copyToClipboard(`${window.location.origin}/#ref=${profile.referral_code}`)} className="bg-white text-green-900 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-xl">Copy Link</button>
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
             )}
          </div>
       </div>

       {/* MODALS */}
       {selectedOrder && profile && <OrderDetailsModal order={selectedOrder} currentUser={profile} onClose={() => setSelectedOrder(null)} />}
       {selectedRedemption && profile && <RedemptionDetailsModal redemption={selectedRedemption} currentUser={profile} onClose={() => setSelectedRedemption(null)} />}
    </div>
  );
};
