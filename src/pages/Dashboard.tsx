import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, Order, OrderItem, OrderMessage, PointTransaction, PointRedemption } from '../types';
import { LoginForm, SignupForm } from '../components/Auth/AuthForms';
import { Gamepad2, Wallet, LogIn, LogOut, CreditCard, ArrowUpRight, ArrowDownLeft, History, Plus, ShieldCheck, Box, MessageSquare, Send, X, Clock, Check, Eye, Trash2, AlertCircle, CheckCircle, Coins, Repeat, ExternalLink, Gift } from 'lucide-react';

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

        // Subscribe to new messages (filtered to ignore our own optimistic updates if needed, though simple dedupe works via ID usually)
        const channel = supabase.channel(`order_chat:${order.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${order.id}` }, (payload) => {
                const newMsg = payload.new as OrderMessage;
                // Only add if we don't already have a message with this ID (prevents duplication from optimistic update if IDs match, though temporary IDs differ)
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
        setNewMessage(''); // Clear input immediately

        // Optimistic Update: Add message to UI immediately before DB confirms
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
            // Revert on error (remove the temp message)
            console.error("Failed to send", error);
            setMessages(prev => prev.filter(m => m.id !== tempId));
            // Optional: Show error toast here
        } else if (data) {
            // Replace temp message with real one (mostly for ID consistency)
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

                    {/* Active Time Notice */}
                    <div className="bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl mb-6 flex gap-3">
                         <Clock className="w-5 h-5 text-blue-400 flex-shrink-0" />
                         <div>
                             <p className="text-[10px] font-black uppercase text-blue-200 tracking-widest mb-1">Delivery Hours</p>
                             <p className="text-xs text-gray-400">Your order will be delivered during active time: <span className="text-yellow-400 font-bold">9AM - 9PM</span>.</p>
                         </div>
                    </div>

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
                                         <p className={`text-[8px] mt-1 opacity-50 font-mono text-right`}>
                                             {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                         </p>
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
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [pointRedemptions, setPointRedemptions] = useState<PointRedemption[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'wallet' | 'points'>(initialTab || 'overview');
  const [authMode, setAuthMode] = useState<'none' | 'login' | 'signup'>('none');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Points Conversion State
  const [pointsToConvert, setPointsToConvert] = useState<number>(0);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionSuccess, setConversionSuccess] = useState(false);

  const isGuest = session?.user?.id === 'guest-user-123';

  // React to prop changes for tab switching from other pages
  useEffect(() => {
      if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const fetchData = useCallback(async () => {
    if (session?.user) {
        if (isGuest) {
            setProfile({
                id: 'guest-user-123', email: 'guest@moonnight.com', username: 'Guest Gamer',
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80',
                wallet_balance: 0.00, vip_level: 0, vip_points: 0, discord_points: 0
            });
            setOrders([]);
        } else {
            const { data: pData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (pData) setProfile(pData);
            
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

            const { data: ptData } = await supabase.from('point_transactions').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false });
            if (ptData) setPointTransactions(ptData);

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

  const handleConvertPoints = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!profile) return;
      if (pointsToConvert < 1000) {
          addToast("Minimum", "Minimum conversion is 1000 Points.", "error");
          return;
      }
      if (pointsToConvert > profile.discord_points) {
          addToast("Insufficient Points", "You do not have enough Discord points.", "error");
          return;
      }

      setIsConverting(true);
      try {
          // Direct Conversion Rate: 1000 Points = 10 DH
          // Calculation: (Points / 1000) * 10
          const dhAmount = (pointsToConvert / 1000) * 10; 

          // Deduct points AND Add to Wallet Balance immediately
          const { error: updateError } = await supabase.from('profiles')
             .update({ 
                 discord_points: profile.discord_points - pointsToConvert,
                 wallet_balance: profile.wallet_balance + dhAmount
             })
             .eq('id', profile.id);
          
          if (updateError) throw updateError;

          // Record transaction as COMPLETED directly
          const { error: insertError } = await supabase.from('point_transactions').insert({
              user_id: profile.id,
              points_amount: pointsToConvert,
              money_equivalent: dhAmount, // Storing DH amount
              status: 'completed'
          });

          if (insertError) throw insertError;

          setConversionSuccess(true);
          addToast("Success", `Converted ${pointsToConvert} points to ${dhAmount.toFixed(2)} DH.`, "success");
          fetchData(); // Refresh profile points and transactions
      } catch (err: any) {
          addToast("Error", err.message, "error");
      } finally {
          setIsConverting(false);
      }
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
          <div className="bg-[#1e232e] rounded-[2rem] overflow-hidden border border-gray-800 shadow-2xl h-fit sticky top-24">
             <button onClick={() => setActiveTab('overview')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Dashboard</button>
             <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Orders</button>
             <button onClick={() => setActiveTab('wallet')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'wallet' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Wallet</button>
             <button onClick={() => setActiveTab('points')} className={`w-full text-left p-6 flex items-center gap-4 uppercase text-[10px] font-black tracking-[0.2em] transition-all ${activeTab === 'points' ? 'bg-purple-600 text-white shadow-xl' : 'text-gray-500 hover:text-white hover:bg-[#151a23]'}`}>Discord Points</button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Current Points Card */}
                        <div className="bg-gradient-to-br from-purple-700 to-indigo-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <p className="text-purple-200 font-black uppercase text-[10px] tracking-widest mb-2 flex items-center gap-2">
                                    <Coins className="w-4 h-4" /> Available Points
                                </p>
                                <h3 className="text-6xl font-black italic tracking-tighter leading-none mb-1">{profile?.discord_points || 0}</h3>
                                <p className="text-xs font-bold text-purple-200 uppercase tracking-widest">Discord Balance</p>
                            </div>
                        </div>

                        {/* Conversion Rate Card */}
                        <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl flex flex-col justify-center">
                            <h3 className="text-white font-black italic uppercase tracking-tighter text-xl mb-4 flex items-center gap-2">
                                <Repeat className="w-6 h-6 text-green-400" /> Exchange Rate
                            </h3>
                            <div className="bg-[#0b0e14] p-6 rounded-2xl border border-gray-800 flex items-center justify-between">
                                <div className="text-center">
                                    <p className="text-3xl font-black text-purple-400 italic tracking-tighter">1000</p>
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Points</p>
                                </div>
                                <div className="h-0.5 flex-1 bg-gray-800 mx-4 relative">
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400">
                                        =
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-black text-green-400 italic tracking-tighter">10.00</p>
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">DH</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* REDEEMED ITEMS SECTION */}
                    <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-[#0b0e14] rounded-xl text-purple-400 border border-purple-500/20"><Gift className="w-5 h-5" /></div>
                            <h3 className="font-black text-white text-2xl italic uppercase tracking-tighter">My Redeemed Rewards</h3>
                        </div>
                        {pointRedemptions.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-3xl">
                                <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">No rewards redeemed yet.</p>
                                <button onClick={() => onNavigate('pointsShop')} className="mt-4 text-purple-500 text-xs font-bold uppercase tracking-widest hover:text-white transition">Visit Points Shop</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {pointRedemptions.map(redemption => (
                                    <div key={redemption.id} className="bg-[#0b0e14] p-4 rounded-2xl border border-gray-800 flex gap-4 items-center relative overflow-hidden group">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-700">
                                            {redemption.point_product?.image_url ? (
                                                <img src={redemption.point_product.image_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center"><Gift className="w-6 h-6 text-gray-600" /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-white font-black italic uppercase tracking-tighter truncate">{redemption.point_product?.name || 'Unknown Reward'}</h4>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(redemption.created_at).toLocaleDateString()}</p>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-purple-400 font-black italic text-xs tracking-tighter">{redemption.cost_at_redemption} PTS</span>
                                                <span className="px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase tracking-widest rounded border border-green-500/20">{redemption.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Conversion Action */}
                    <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                        <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl mb-8">Convert to Wallet</h3>
                        
                        {!conversionSuccess ? (
                            <form onSubmit={handleConvertPoints} className="max-w-xl mx-auto">
                                <div className="mb-8">
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Amount to Convert (Points)</label>
                                    <input 
                                        type="number" 
                                        min="1000" 
                                        step="1000"
                                        value={pointsToConvert}
                                        onChange={e => setPointsToConvert(parseInt(e.target.value))}
                                        className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-6 text-center text-4xl font-black text-white outline-none focus:border-purple-500 transition-all shadow-inner placeholder:text-gray-800"
                                        placeholder="0"
                                    />
                                    <p className="text-center mt-3 text-xs font-bold text-gray-500">
                                        Equivalent to <span className="text-green-400">{(pointsToConvert / 1000 * 10).toFixed(2)} DH</span>
                                    </p>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={isConverting || !pointsToConvert}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-purple-600/20 uppercase tracking-widest active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                                >
                                    {isConverting ? 'Processing...' : 'Transfer to Wallet'}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-10 max-w-lg mx-auto">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/50">
                                    <CheckCircle className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2">Conversion Successful!</h3>
                                <p className="text-gray-400 font-bold text-sm mb-8">Your points have been converted and <span className="text-yellow-400">added to your wallet</span> instantly.</p>
                                <button 
                                    onClick={() => { setConversionSuccess(false); setPointsToConvert(0); }}
                                    className="block mx-auto mt-6 text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-white"
                                >
                                    Make Another Transfer
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Transaction History Table */}
                    <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl">
                        <h3 className="text-white font-black italic uppercase tracking-tighter text-2xl mb-8">Conversion History</h3>
                        {pointTransactions.length === 0 ? (
                            <p className="text-center py-10 text-gray-600 font-black uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-3xl">No conversions yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
                                        <tr>
                                            <th className="pb-4 pl-4">Date</th>
                                            <th className="pb-4">Points</th>
                                            <th className="pb-4">Amount (DH)</th>
                                            <th className="pb-4">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {pointTransactions.map(pt => (
                                            <tr key={pt.id} className="hover:bg-[#0b0e14] transition-colors">
                                                <td className="py-4 pl-4 text-xs font-mono text-gray-400">{new Date(pt.created_at).toLocaleDateString()}</td>
                                                <td className="py-4 font-black text-purple-400 italic">-{pt.points_amount}</td>
                                                <td className="py-4 font-black text-green-400 italic">{pt.money_equivalent.toFixed(2)} DH</td>
                                                <td className="py-4">
                                                    <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                                                        pt.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/30' :
                                                        pt.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/30' :
                                                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/30'
                                                    }`}>
                                                        {pt.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
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
    </div>
  );
};