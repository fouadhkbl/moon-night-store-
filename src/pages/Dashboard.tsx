
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order, OrderItem, OrderMessage, PointRedemption, RedemptionMessage } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
import { Gamepad2, Wallet, LogIn, LogOut, CreditCard, ArrowUpRight, ArrowDownLeft, History, Plus, ShieldCheck, MessageSquare, Send, X, Clock, Eye, Trash2, CheckCircle, Coins, Gift, Calendar, LayoutDashboard, ClipboardList, Copy, Users, Link, Crown, Sparkles, Timer, RotateCw } from 'lucide-react';

// --- SHARED CHAT MODAL LOGIC (Order & Redemption) ---
// Note: Created separate components for simplicity in state management types

// --- ORDER DETAILS & CHAT MODAL ---
const OrderDetailsModal = ({ order, currentUser, onClose }: { order: Order, currentUser: Profile, onClose: () => void }) => {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [messages, setMessages] = useState<OrderMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            // Fetch Items
            const { data: itemsData } = await supabase.from('order_items').select('*, product:products(*)').eq('order_id', order.id);
            if (itemsData) setItems(itemsData);

            // Fetch Messages
            const { data: msgData } = await supabase.from('order_messages').select('*').eq('order_id', order.id).order('created_at', { ascending: true });
            if (msgData) setMessages(msgData);

            setLoading(false);
            scrollToBottom();
        };

        fetchDetails();

        // Subscribe to new messages
        const channel = supabase.channel(`order_chat:${order.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${order.id}` }, (payload) => {
                const newMsg = payload.new as OrderMessage;
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                scrollToBottom();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [order.id]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgText = newMessage.trim();
        setNewMessage(''); 

        // Optimistic Update
        const tempId = `temp-${Date.now()}`;
        const optimisicMsg: OrderMessage = {
            id: tempId,
            order_id: order.id,
            sender_id: currentUser.id,
            message: msgText,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, optimisicMsg]);
        scrollToBottom();

        // Send to Database
        const { data, error } = await supabase.from('order_messages').insert({
            order_id: order.id,
            sender_id: currentUser.id,
            message: msgText
        }).select().single();

        if (error) {
            console.error("Failed to send", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else if (data) {
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }
    };

    if (loading) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-4xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                {/* Left Side: Order Info */}
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-gray-800 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Order #{order.id.slice(0,6)}</h3>
                    </div>
                    {/* Status Badge - Prominent */}
                    <div className={`p-4 rounded-xl mb-6 border flex items-center gap-3 ${
                        order.status === 'completed' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
                        order.status === 'canceled' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                        'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                    }`}>
                        {order.status === 'completed' && <CheckCircle className="w-6 h-6" />}
                        {order.status === 'canceled' && <X className="w-6 h-6" />}
                        {order.status === 'pending' && <Clock className="w-6 h-6 animate-pulse" />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Status</p>
                            <p className="text-lg font-black uppercase tracking-tighter">{order.status}</p>
                        </div>
                    </div>
                    {/* Items List */}
                    <div className="space-y-4">
                        {items.map(item => (
                            <div key={item.id} className="flex gap-3 bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                                <img src={item.product?.image_url} className="w-12 h-12 rounded-lg object-cover" alt="" />
                                <div>
                                    <p className="text-sm font-bold text-white truncate max-w-[150px]">{item.product?.name}</p>
                                    <p className="text-[10px] text-gray-500 font-mono">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <div className="flex justify-between text-gray-400 text-xs uppercase font-bold tracking-widest mb-2">
                            <span>Total Amount</span>
                            <span className="text-white font-mono text-lg">{order.total_amount.toFixed(2)} DH</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="mt-8 w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition uppercase text-xs font-black tracking-widest">
                        Close Details
                    </button>
                </div>
                {/* Right Side: Chat */}
                <div className="w-full md:w-7/12 flex flex-col h-full relative">
                    <div className="p-4 border-b border-gray-800 bg-[#1e232e] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">Support Chat</span>
                        </div>
                        <button onClick={onClose} className="md:hidden text-gray-500"><X /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/50 custom-scrollbar">
                         {messages.length === 0 && (
                             <div className="text-center py-10 opacity-30">
                                 <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                                 <p className="text-xs uppercase font-bold">Start a conversation</p>
                             </div>
                         )}
                         {messages.map(msg => {
                             const isMe = msg.sender_id === currentUser.id;
                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e232e] text-gray-200 border border-gray-700 rounded-tl-none'}`}>
                                         {msg.message}
                                     </div>
                                 </div>
                             );
                         })}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 bg-[#1e232e] border-t border-gray-800 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-blue-500 outline-none"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all disabled:opacity-50" disabled={!newMessage.trim()}>
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// --- REDEMPTION DETAILS & CHAT MODAL ---
const RedemptionDetailsModal = ({ redemption, currentUser, onClose }: { redemption: PointRedemption, currentUser: Profile, onClose: () => void }) => {
    const [messages, setMessages] = useState<RedemptionMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const { data: msgData } = await supabase.from('redemption_messages').select('*').eq('redemption_id', redemption.id).order('created_at', { ascending: true });
            if (msgData) setMessages(msgData);
            setLoading(false);
            scrollToBottom();
        };
        fetchDetails();

        const channel = supabase.channel(`redemption_chat:${redemption.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'redemption_messages', filter: `redemption_id=eq.${redemption.id}` }, (payload) => {
                const newMsg = payload.new as RedemptionMessage;
                setMessages(prev => {
                    if (prev.some(m => m.id === newMsg.id)) return prev;
                    return [...prev, newMsg];
                });
                scrollToBottom();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [redemption.id]);

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const msgText = newMessage.trim();
        setNewMessage(''); 

        const tempId = `temp-${Date.now()}`;
        const optimisicMsg: RedemptionMessage = {
            id: tempId,
            redemption_id: redemption.id,
            sender_id: currentUser.id,
            message: msgText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisicMsg]);
        scrollToBottom();

        const { data, error } = await supabase.from('redemption_messages').insert({
            redemption_id: redemption.id,
            sender_id: currentUser.id,
            message: msgText
        }).select().single();

        if (error) {
            console.error("Failed to send", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } else if (data) {
            setMessages(prev => prev.map(m => m.id === tempId ? data : m));
        }
    };

    if (loading) return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"><div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div></div>;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-4xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                {/* Left Side Info */}
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-gray-800 overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-600/20 rounded-xl text-purple-400"><Gift className="w-6 h-6" /></div>
                        <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Reward Claim</h3>
                    </div>
                    {/* Status */}
                    <div className={`p-4 rounded-xl mb-6 border flex items-center gap-3 ${
                        redemption.status === 'delivered' ? 'bg-green-500/10 border-green-500/30 text-green-500' : 
                        'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'
                    }`}>
                        {redemption.status === 'delivered' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6 animate-pulse" />}
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Status</p>
                            <p className="text-lg font-black uppercase tracking-tighter">{redemption.status}</p>
                        </div>
                    </div>
                    {/* Item */}
                    <div className="flex gap-4 bg-[#0b0e14] p-4 rounded-2xl border border-gray-800 mb-6">
                        <img src={redemption.point_product?.image_url} className="w-16 h-16 rounded-xl object-cover" alt="" />
                        <div>
                            <p className="text-sm font-bold text-white">{redemption.point_product?.name}</p>
                            <p className="text-xs text-purple-400 font-black italic">{redemption.cost_at_redemption} Points</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Use the chat on the right to communicate with the admin regarding the delivery of your reward (e.g. sending account credentials or codes).
                    </p>
                    <button onClick={onClose} className="mt-8 w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition uppercase text-xs font-black tracking-widest">
                        Close
                    </button>
                </div>
                {/* Chat Side */}
                <div className="w-full md:w-7/12 flex flex-col h-full relative">
                    <div className="p-4 border-b border-gray-800 bg-[#1e232e] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-black text-white uppercase tracking-widest">Redemption Support</span>
                        </div>
                        <button onClick={onClose} className="md:hidden text-gray-500"><X /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/50 custom-scrollbar">
                         {messages.length === 0 && (
                             <div className="text-center py-10 opacity-30">
                                 <MessageSquare className="w-12 h-12 mx-auto mb-2" />
                                 <p className="text-xs uppercase font-bold">Ask about your reward here</p>
                             </div>
                         )}
                         {messages.map(msg => {
                             const isMe = msg.sender_id === currentUser.id;
                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-[#1e232e] text-gray-200 border border-gray-700 rounded-tl-none'}`}>
                                         {msg.message}
                                     </div>
                                 </div>
                             );
                         })}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 bg-[#1e232e] border-t border-gray-800 flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-3 text-white text-sm focus:border-purple-500 outline-none"
                            placeholder="Message admin..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-all disabled:opacity-50" disabled={!newMessage.trim()}>
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const Dashboard = ({ session, addToast, onSignOut, onNavigate, setSession, initialOrderId, initialTab }: { 
    session: any, 
    addToast: any, 
    onSignOut: () => void, 
    onNavigate: (p: string) => void, 
    setSession: (s: any) => void,
    initialOrderId?: string | null,
    initialTab?: 'overview' | 'orders' | 'wallet' | 'points'
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

  // React to prop changes for tab switching from other pages
  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const calculateClaimStatus = (lastClaim: string | undefined) => {
      if (!lastClaim) return { canClaim: true, timeLeft: '' };
      
      const last = new Date(lastClaim);
      const next = new Date(last.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
      const now = new Date();
      
      if (now >= next) {
          return { canClaim: true, timeLeft: '' };
      } else {
          const diff = next.getTime() - now.getTime();
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          return { canClaim: false, timeLeft: `${hours}h ${minutes}m` };
      }
  };

  const fetchData = useCallback(async () => {
    if (session?.user) {
        if (isGuest) {
            setProfile({
                id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Gamer',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0, total_donated: 0, spins_count: 0
            });
            setOrders([]);
        } else {
            const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (pData) {
                setProfile(pData);
                const { canClaim, timeLeft } = calculateClaimStatus(pData.last_daily_claim);
                setCanClaimDaily(canClaim);
                setTimeUntilNextClaim(timeLeft);
            }
            
            // Get Referral Count
            const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('referred_by', session.user.id);
            setReferralCount(count || 0);

            const { data: oData } = await supabase.from('orders').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (oData) {
                setOrders(oData);
                if (initialOrderId) {
                    const target = oData.find(o => o.id === initialOrderId);
                    if (target) {
                        setSelectedOrder(target);
                        if (!initialTab) setActiveTab('orders'); 
                    }
                }
            }

            // Fetch Redemptions
            const { data: prData } = await supabase.from('point_redemptions')
                .select('*, point_product:point_products(*)')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (prData) setPointRedemptions(prData);
        }
    }
  }, [session, isGuest, initialOrderId, initialTab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleClaimDaily = async () => {
      if (!canClaimDaily || !profile) return;

      const rewardPoints = Math.floor(Math.random() * 50) + 20; // 20-70 Points
      const rewardMoney = 0.10; // Fixed small amount

      try {
          const newPoints = (profile.discord_points || 0) + rewardPoints;
          const newBalance = (profile.wallet_balance || 0) + rewardMoney;
          const now = new Date().toISOString();

          const { error } = await supabase.from('profiles').update({
              discord_points: newPoints,
              wallet_balance: newBalance,
              last_daily_claim: now
          }).eq('id', profile.id);

          if (error) throw error;

          setProfile({ ...profile, discord_points: newPoints, wallet_balance: newBalance, last_daily_claim: now });
          setCanClaimDaily(false);
          setTimeUntilNextClaim('23h 59m');
          addToast('Daily Claimed!', `You got ${rewardPoints} Points and ${rewardMoney} DH!`, 'success');

      } catch (err) {
          addToast('Error', 'Failed to claim daily reward.', 'error');
      }
  };

  const handleDeleteOrder = async (e: React.MouseEvent, orderId: string) => {
    e.stopPropagation(); 
    if (!window.confirm("Are you sure you want to remove this canceled order from your history?")) return;
    
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) {
        addToast("Error", "Could not delete order.", "error");
    } else {
        addToast("Deleted", "Order removed from history.", "success");
        setOrders(prev => prev.filter(o => o.id !== orderId));
    }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      addToast('Copied', 'Referral code copied to clipboard!', 'success');
  };

  const copyReferralLink = (code: string) => {
      const url = `${window.location.origin}/?ref=${code}`;
      navigator.clipboard.writeText(url);
      addToast('Link Copied', 'Referral link copied to clipboard!', 'success');
  };

  if (isGuest && authMode === 'login') return (
    <div className="py-20 container mx-auto px-4">
      <LoginForm 
        onAuthSuccess={s => { 
          setSession(s); 
          setAuthMode('none'); 
          onNavigate('dashboard'); 
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
       <div className={`relative rounded-[2rem] overflow-hidden mb-12 shadow-2xl bg-[#1e232e] transition-all ${isVip ? 'border-2 border-yellow-500/20' : ''}`}>
          <div className={`h-48 w-full relative transition-all duration-500 ${
              isVip 
              ? 'bg-gradient-to-r from-yellow-600 via-amber-500 to-[#1e232e]' 
              : 'bg-gradient-to-r from-blue-900 via-purple-900 to-[#1e232e]'
          }`}>
              {isVip && (
                  <>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                    <div className="absolute top-4 right-10 opacity-20 rotate-12 pointer-events-none">
                        <Crown className="w-32 h-32 text-yellow-100" />
                    </div>
                  </>
              )}
          </div>
          <div className="px-4 md:px-8 pb-10 flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6 md:gap-8 text-center md:text-left relative z-10">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl border-8 border-[#0b0e14] bg-[#1e232e] overflow-hidden shadow-2xl flex-shrink-0 transition-all ${isVip ? 'ring-4 ring-yellow-500 shadow-yellow-500/20' : ''}`}>
                 <img src={profile?.avatar_url} className="w-full h-full object-cover" alt="Profile Avatar" />
              </div>
              <div className="flex-1 pb-2">
                 <h1 className={`text-3xl md:text-4xl font-black italic tracking-tighter uppercase mb-1 leading-none ${isVip ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 drop-shadow-sm' : 'text-white'}`}>
                    {profile?.username}
                    {isVip && <Crown className="w-6 h-6 inline-block ml-2 text-yellow-400 mb-2 drop-shadow-md" />}
                 </h1>
                 <p className="text-gray-500 font-bold text-sm tracking-wide">{profile?.email}</p>
                 {!isGuest && (
                     isVip 
                     ? <span className="bg-yellow-500/10 text-yellow-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase mt-3 inline-block border border-yellow-500/30 tracking-widest shadow-lg shadow-yellow-500/10">Elite Member</span>
                     : <span className="bg-blue-600/10 text-blue-400 text-[9px] font-black px-3 py-1 rounded-lg uppercase mt-3 inline-block border border-blue-600/30 tracking-widest shadow-lg">Verified System Player</span>
                 )}
              </div>
               
               {/* Daily Claim & Actions */}
               <div className="flex flex-col items-center md:items-end gap-3 pb-2 w-full md:w-auto">
                 
                 <div className="flex gap-3 w-full md:w-auto">
                    {!isGuest && (
                        <button 
                            onClick={handleClaimDaily}
                            disabled={!canClaimDaily}
                            className={`flex-1 bg-[#0b0e14]/80 backdrop-blur-xl px-6 py-3 rounded-[1.5rem] border flex items-center gap-3 shadow-xl transition-all justify-center ${canClaimDaily ? 'border-green-500/30 hover:border-green-500 hover:bg-green-900/10 cursor-pointer' : 'border-gray-800 opacity-70 cursor-not-allowed'}`}
                        >
                            <div className={`p-2 rounded-full ${canClaimDaily ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-800 text-gray-500'}`}>
                                {canClaimDaily ? <Gift className="w-4 h-4" /> : <Timer className="w-4 h-4" />}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Daily Reward</p>
                                <p className={`text-sm font-black italic tracking-tighter leading-none ${canClaimDaily ? 'text-green-400' : 'text-gray-400'}`}>
                                    {canClaimDaily ? 'CLAIM NOW' : timeUntilNextClaim}
                                </p>
                            </div>
                        </button>
                    )}

                    {!isGuest && (
                        <button 
                            onClick={() => onNavigate('spin')}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-[1.5rem] border border-purple-400/30 flex items-center gap-3 shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="p-2 rounded-full bg-white/20">
                                <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-[9px] text-purple-200 uppercase font-black tracking-widest leading-none mb-1">Play</p>
                                <p className="text-sm font-black italic tracking-tighter leading-none">SPIN WIN</p>
                            </div>
                            <span className="md:hidden font-black italic text-xs">SPIN</span>
                        </button>
                    )}
                 </div>

                 {/* Balance & Spins */}
                 <div className="bg-[#0b0e14]/80 backdrop-blur-xl px-8 py-4 rounded-[2rem] border border-blue-500/30 flex items-center gap-6 shadow-2xl w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest leading-none mb-1">Solde Balance</p>
                        <p className="text-3xl font-black text-yellow-400 italic tracking-tighter leading-none">{profile?.wallet_balance?.toFixed(2) || '0.00'} DH</p>
                    </div>
                    {/* Free Spins Indicator */}
                    {(profile?.spins_count || 0) > 0 && (
                        <div className="flex flex-col items-center">
                            <div className="bg-pink-600/20 p-2 rounded-full mb-1 border border-pink-500/30 animate-pulse">
                                <RotateCw className="w-4 h-4 text-pink-500" />
                            </div>
                            <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{profile?.spins_count} Spins</p>
                        </div>
                    )}
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

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          <div className="bg-[#1e232e] rounded-2xl lg:rounded-[2rem] overflow-hidden border border-gray-800 shadow-2xl h-fit relative lg:sticky lg:top-24 z-30 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible scrollbar-hide mb-8 lg:mb-0">
             <button onClick={() => setActiveTab('overview')} className={`flex-none lg:w-full text-left p-4 lg:p-6 flex items-center gap-3 lg:gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>
                 <LayoutDashboard className="w-4 h-4" /> Dashboard
             </button>
             <button onClick={() => setActiveTab('orders')} className={`flex-none lg:w-full text-left p-4 lg:p-6 flex items-center gap-3 lg:gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>
                 <ClipboardList className="w-4 h-4" /> Orders
             </button>
             <button onClick={() => setActiveTab('wallet')} className={`flex-none lg:w-full text-left p-4 lg:p-6 flex items-center gap-3 lg:gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'wallet' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>
                 <Wallet className="w-4 h-4" /> Wallet
             </button>
             <button onClick={() => setActiveTab('points')} className={`flex-none lg:w-full text-left p-4 lg:p-6 flex items-center gap-3 lg:gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'points' ? 'bg-purple-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>
                 <Coins className="w-4 h-4" /> Discord Points
             </button>
             <button onClick={() => setActiveTab('referrals')} className={`flex-none lg:w-full text-left p-4 lg:p-6 flex items-center gap-3 lg:gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === 'referrals' ? 'bg-green-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>
                 <Users className="w-4 h-4" /> Referrals
             </button>
          </div>
          <div className="lg:col-span-3">
             {activeTab === 'overview' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[2.5rem] p-10 text-white shadow-[0_20px_50px_rgba(37,99,235,0.3)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700"><Gamepad2 className="w-48 h-48" /></div>
                        <h2 className="text-4xl font-black italic tracking-tighter mb-4 uppercase relative z-10 leading-none">Welcome, {profile?.username}!</h2>
                        <p className="text-blue-100 font-black uppercase text-[11px] tracking-[0.3em] relative z-10 opacity-80">{isGuest ? "GUEST MODE: PROFILE NOT SYNCED" : "SECURE MARKETPLACE HUB ACTIVE"}</p>
                    </div>
                    
                    {/* Spin & Win Quick Access */}
                    <div onClick={() => onNavigate('spin')} className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-[2rem] p-8 border border-purple-500/20 shadow-2xl cursor-pointer hover:scale-[1.02] transition-transform group relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-5 h-5 text-purple-400" />
                                    <p className="text-purple-300 font-black uppercase text-[10px] tracking-[0.3em]">Featured Game</p>
                                </div>
                                <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Spin & Win</h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Test your luck for instant prizes</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg group-hover:bg-purple-500 transition-colors">
                                <ArrowUpRight className="w-6 h-6" />
                            </div>
                        </div>
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
             
             {activeTab === 'referrals' && (
                 <div className="space-y-8 animate-slide-up">
                     {/* Invite Card */}
                     <div className="bg-gradient-to-br from-green-800 to-[#1e232e] border border-green-500/20 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                         <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>
                         <div className="relative z-10">
                             <div className="flex items-center gap-3 mb-4">
                                 <div className="p-3 bg-green-500/20 rounded-xl text-green-400"><Users className="w-6 h-6" /></div>
                                 <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Invite & Earn</h3>
                             </div>
                             <p className="text-gray-300 text-xs font-medium leading-relaxed max-w-lg mb-8">
                                 Share your unique code with friends. When they sign up and make their first purchase, you'll instantly receive cash in your wallet!
                             </p>
                             
                             <div className="bg-[#0b0e14]/50 p-6 rounded-2xl border border-green-500/30 flex flex-col md:flex-row items-center gap-6">
                                 <div className="text-center md:text-left">
                                     <p className="text-[10px] text-green-400 font-black uppercase tracking-widest mb-1">Your Code</p>
                                     <div className="text-4xl font-mono font-black text-white tracking-widest">{profile?.referral_code || 'LOADING...'}</div>
                                 </div>
                                 <div className="flex gap-3 ml-auto">
                                    <button 
                                    onClick={() => copyToClipboard(profile?.referral_code || '')}
                                    className="bg-[#1e232e] border border-gray-700 hover:border-gray-500 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <Copy className="w-4 h-4" /> Code
                                    </button>
                                    <button 
                                    onClick={() => copyReferralLink(profile?.referral_code || '')}
                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <Link className="w-4 h-4" /> Link
                                    </button>
                                </div>
                             </div>
                         </div>
                     </div>

                     {/* Stats */}
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-xl">
                             <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2">Total Earnings</p>
                             <h3 className="text-4xl font-black text-yellow-400 italic tracking-tighter">{profile?.referral_earnings?.toFixed(2) || '0.00'} DH</h3>
                         </div>
                         <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-xl">
                             <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-2">Friends Invited</p>
                             <h3 className="text-4xl font-black text-white italic tracking-tighter">{referralCount}</h3>
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
                               <div key={o.id} onClick={() => setSelectedOrder(o)} className="p-6 bg-[#0b0e14] rounded-3xl flex flex-col md:flex-row justify-between items-center border border-gray-800 hover:border-blue-500/50 cursor-pointer transition-all shadow-xl group">
                                   <div className="flex-1">
                                     <div className="flex items-center gap-3 mb-1">
                                        <p className="font-black text-white uppercase tracking-tighter text-lg leading-none group-hover:text-blue-400 transition-colors">Trade #{o.id.slice(0,8)}</p>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                                  o.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                                                  o.status === 'canceled' ? 'bg-red-500/10 text-red-500 border-red-500/30' : 
                                                  'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                              }`}>
                                            {o.status}
                                        </span>
                                     </div>
                                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(o.created_at).toLocaleDateString()}</p>
                                   </div>
                                   
                                   <div className="flex items-center gap-6 mt-4 md:mt-0 w-full md:w-auto justify-between md:justify-end">
                                       <div className="text-right">
                                          <p className="font-black text-green-400 italic text-2xl tracking-tighter leading-none">{o.total_amount.toFixed(2)} DH</p>
                                       </div>
                                       <div className="flex items-center gap-2">
                                            {o.status === 'canceled' && (
                                                <button 
                                                    onClick={(e) => handleDeleteOrder(e, o.id)}
                                                    className="bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white p-3 rounded-xl transition-all shadow-lg border border-red-500/20"
                                                    title="Remove canceled order"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all shadow-lg flex-shrink-0 group-hover:scale-110">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                       </div>
                                   </div>
                               </div>
                           ))}
                       </div>
                   )}
                </div>
             )}
             {activeTab === 'wallet' && (
                <div className="space-y-8 animate-slide-up">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       {/* Premium Card Design */}
                       <div className="relative h-64 bg-gradient-to-br from-blue-700 via-indigo-900 to-[#0b0e14] rounded-[2.5rem] p-8 text-white shadow-[0_20px_60px_rgba(29,78,216,0.3)] overflow-hidden group border border-blue-500/20">
                           <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                           <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                           
                           <div className="relative z-10 flex flex-col justify-between h-full">
                               <div className="flex justify-between items-start">
                                   <div className="flex items-center gap-2">
                                       <div className="w-10 h-6 bg-yellow-400/20 rounded-md border border-yellow-400/40 backdrop-blur-md"></div>
                                       <CreditCard className="w-5 h-5 opacity-60" />
                                   </div>
                                   <span className="font-mono text-[10px] font-black opacity-60 tracking-[0.2em] uppercase">MOON NIGHT ELITE</span>
                               </div>
                               <div>
                                   <p className="text-[10px] text-blue-200 mb-1 font-black uppercase tracking-widest">Available Balance</p>
                                   <h2 className="text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">{profile?.wallet_balance?.toFixed(2)} <span className="text-xl opacity-70">DH</span></h2>
                               </div>
                               <div className="flex justify-between items-end">
                                   <div>
                                       <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Card Holder</p>
                                       <p className="font-bold tracking-widest uppercase font-mono text-sm">{profile?.username || 'GUEST USER'}</p>
                                   </div>
                                   <div className="text-right">
                                       <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1">Status</p>
                                       <p className="font-bold tracking-widest uppercase text-xs flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-400" /> Active</p>
                                   </div>
                               </div>
                           </div>
                       </div>

                       {/* Quick Actions */}
                       <div className="flex flex-col gap-4">
                           <button onClick={() => onNavigate('topup')} className="flex-1 bg-[#1e232e] border border-gray-800 hover:border-blue-500 hover:bg-blue-600/10 p-6 rounded-[2rem] flex items-center gap-6 transition-all group shadow-2xl">
                               <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                   <Plus className="w-6 h-6" />
                               </div>
                               <div className="text-left">
                                   <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">Top Up Funds</h4>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-blue-400 transition-colors">Instant Deposit via PayPal</p>
                               </div>
                           </button>
                           <button className="flex-1 bg-[#1e232e] border border-gray-800 hover:border-yellow-500 hover:bg-yellow-600/10 p-6 rounded-[2rem] flex items-center gap-6 transition-all group shadow-2xl">
                               <div className="bg-yellow-500 p-4 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                                   <ArrowUpRight className="w-6 h-6" />
                               </div>
                               <div className="text-left">
                                   <h4 className="text-white font-black uppercase italic tracking-tighter text-xl">Withdraw</h4>
                                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Transfer to Bank Account</p>
                               </div>
                           </button>
                       </div>
                   </div>

                   {/* Transaction History (Mock using orders) */}
                   <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl">
                       <div className="flex items-center gap-3 mb-8">
                           <div className="p-2 bg-[#0b0e14] rounded-xl text-gray-400"><History className="w-5 h-5" /></div>
                           <h3 className="font-black text-white text-2xl italic uppercase tracking-tighter">Recent Movements</h3>
                       </div>
                       
                       {orders.length === 0 ? (
                           <p className="text-gray-600 uppercase text-[10px] font-black tracking-widest py-10 text-center border-2 border-dashed border-gray-800 rounded-3xl">No transactions found.</p>
                       ) : (
                           <div className="space-y-3">
                               {orders.slice(0, 5).map(o => (
                                   <div key={o.id} className="p-5 bg-[#0b0e14] rounded-2xl flex justify-between items-center border border-gray-800 hover:border-gray-700 transition-all">
                                       <div className="flex items-center gap-4">
                                           <div className="p-3 rounded-xl bg-red-500/10 text-red-500"><ArrowDownLeft className="w-4 h-4" /></div>
                                           <div>
                                               <p className="font-black text-white uppercase tracking-tighter text-sm">Purchase #{o.id.slice(0,4)}</p>
                                               <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Moon Night Store</p>
                                           </div>
                                       </div>
                                       <p className="font-black text-white italic text-lg tracking-tighter">- {o.total_amount.toFixed(2)} DH</p>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
                </div>
             )}

             {activeTab === 'points' && (
                 <div className="space-y-8 animate-slide-up">
                    {/* Current Points Card - Full Width */}
                    <div className="bg-gradient-to-br from-purple-700 to-indigo-900 p-8 md:p-12 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[200px]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                        
                        <div className="relative z-10 flex flex-col items-center justify-center text-center">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-2xl mb-4 shadow-xl">
                                <Coins className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-purple-200 font-black uppercase text-xs tracking-[0.3em] mb-2">Available Balance</p>
                            <h3 className="text-7xl md:text-8xl font-black italic tracking-tighter leading-none mb-2 drop-shadow-2xl">{profile?.discord_points || 0}</h3>
                            <p className="text-sm font-bold text-purple-200 uppercase tracking-widest mb-6">Discord Points</p>
                            
                            <button onClick={() => onNavigate('spin')} className="bg-white text-purple-900 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                <Sparkles className="w-4 h-4" /> Spin & Win
                            </button>
                        </div>
                    </div>

                    {/* REDEEMED ITEMS SECTION - REDESIGNED */}
                    <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-[#0b0e14] rounded-xl text-purple-400 border border-purple-500/20"><Gift className="w-5 h-5" /></div>
                            <h3 className="font-black text-white text-2xl italic uppercase tracking-tighter">My Redeemed Rewards</h3>
                        </div>
                        {pointRedemptions.length === 0 ? (
                            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-3xl">
                                <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">No rewards redeemed yet.</p>
                                <button onClick={() => onNavigate('pointsShop')} className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg">Visit Points Shop</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pointRedemptions.map(redemption => (
                                    <div key={redemption.id} onClick={() => setSelectedRedemption(redemption)} className="bg-[#0b0e14] rounded-[2rem] overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all duration-300 shadow-xl group flex flex-col cursor-pointer">
                                        {/* Large Image Area */}
                                        <div className="h-56 relative overflow-hidden">
                                            {redemption.point_product?.image_url ? (
                                                <img 
                                                    src={redemption.point_product.image_url} 
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                                    alt={redemption.point_product.name} 
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-900 flex items-center justify-center"><Gift className="w-12 h-12 text-gray-700" /></div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] to-transparent opacity-80"></div>
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <h4 className="text-white font-black italic text-lg uppercase tracking-tighter leading-tight drop-shadow-md truncate">
                                                    {redemption.point_product?.name || 'Unknown Reward'}
                                                </h4>
                                            </div>
                                        </div>
                                        
                                        {/* Content Area */}
                                        <div className="p-6 pt-2 flex flex-col flex-1 gap-4">
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 border-b border-gray-800 pb-4">
                                                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(redemption.created_at).toLocaleDateString()}</span>
                                                <span className="text-purple-400 font-black italic">{redemption.cost_at_redemption} PTS</span>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className={`px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg border flex items-center gap-1 ${
                                                    redemption.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                                                    'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                                }`}>
                                                    {redemption.status === 'delivered' ? <CheckCircle className="w-3 h-3"/> : <Clock className="w-3 h-3"/>}
                                                    {redemption.status}
                                                </div>
                                                <button className="text-xs text-gray-400 hover:text-white transition font-bold uppercase tracking-widest flex items-center gap-1">
                                                    Chat <MessageSquare className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                 </div>
             )}
          </div>
       </div>

       {selectedOrder && profile && (
           <OrderDetailsModal 
              order={selectedOrder} 
              currentUser={profile} 
              onClose={() => setSelectedOrder(null)} 
           />
       )}

       {selectedRedemption && profile && (
           <RedemptionDetailsModal 
              redemption={selectedRedemption} 
              currentUser={profile} 
              onClose={() => setSelectedRedemption(null)} 
           />
       )}
    </div>
  );
};
