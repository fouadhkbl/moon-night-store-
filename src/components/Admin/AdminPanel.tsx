
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, Profile, Coupon, Order, OrderMessage, AccessLog, OrderItem, PointTransaction, PointProduct, PointRedemption, RedemptionMessage, Donation, Tournament, Announcement, LootBox, LootBoxOpen } from '../../types';
import { BarChart3, Package, Users, Search, Mail, Edit2, Trash2, PlusCircle, Wallet, ShoppingCart, Key, Ticket, ClipboardList, MessageSquare, Send, X, CheckCircle, Clock, Ban, Globe, Archive, Coins, ArrowRightLeft, Trophy, Gift, Eye, EyeOff, Heart, Percent, Swords, Settings, Save, Megaphone, Image, LogOut, Crown, Zap, History } from 'lucide-react';
import { ProductFormModal, BalanceEditorModal, CouponFormModal, PointProductFormModal, TournamentFormModal, AnnouncementFormModal, ReferralEditorModal, LootBoxFormModal } from './AdminModals';

const VisitHistoryModal = ({ logs, onClose }: { logs: AccessLog[], onClose: () => void }) => {
    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-2xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23] rounded-t-3xl">
                     <div className="flex items-center gap-3">
                        <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-400 border border-cyan-500/30">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Daily Visitors</h3>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{logs.length} entries today</p>
                        </div>
                     </div>
                     <button onClick={onClose} className="text-gray-500 hover:text-white transition"><X /></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar">
                     {logs.length === 0 ? (
                         <p className="text-center py-10 text-gray-500 font-bold uppercase tracking-widest">No visits recorded yet.</p>
                     ) : (
                         <table className="w-full text-left">
                             <thead className="text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                                 <tr>
                                     <th className="pb-3">Time</th>
                                     <th className="pb-3">IP Address</th>
                                     <th className="pb-3 text-right">User ID</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-800">
                                 {logs.map(log => (
                                     <tr key={log.id} className="hover:bg-white/5 transition-colors">
                                         <td className="py-4 text-xs font-mono text-gray-400">
                                             {new Date(log.created_at).toLocaleTimeString()}
                                         </td>
                                         <td className="py-4 text-sm font-bold text-white">
                                             {log.ip_address}
                                         </td>
                                         <td className="py-4 text-xs font-mono text-gray-500 text-right">
                                             {log.user_id ? <span className="text-blue-400">Logged In</span> : 'Guest'}
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     )}
                </div>
                <div className="p-4 border-t border-gray-800 bg-[#151a23] rounded-b-3xl">
                    <button onClick={onClose} className="w-full bg-[#0b0e14] hover:bg-gray-900 border border-gray-800 text-white font-black py-3 rounded-xl transition-all uppercase tracking-widest text-xs">Close Log</button>
                </div>
            </div>
        </div>
    );
};

// ... (Redemption and Order Modals kept same as before, truncated for brevity if not changed) ...
const AdminRedemptionModal = ({ redemption, currentUser, onClose }: { redemption: PointRedemption, currentUser: Profile, onClose: () => void }) => {
    // ... [existing implementation of AdminRedemptionModal]
    const [messages, setMessages] = useState<RedemptionMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [status, setStatus] = useState(redemption.status);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    useEffect(() => {
        const fetchDetails = async () => {
            const { data: msgData } = await supabase.from('redemption_messages').select('*').eq('redemption_id', redemption.id).order('created_at', { ascending: true });
            if (msgData) setMessages(msgData);
            scrollToBottom();
        };
        fetchDetails();

        const channel = supabase.channel(`admin_redemption_chat:${redemption.id}`)
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

        const tempId = `temp-admin-r-${Date.now()}`;
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

        if (error) setMessages(prev => prev.filter(m => m.id !== tempId));
        else if (data) setMessages(prev => prev.map(m => m.id === tempId ? data : m));
    };

    const handleUpdateStatus = async (newStatus: string) => {
        await supabase.from('point_redemptions').update({ status: newStatus }).eq('id', redemption.id);
        setStatus(newStatus);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-5xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-gray-800 overflow-y-auto">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Redemption Details</h3>
                    <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">User</p>
                        <p className="text-white font-bold">{redemption.profile?.username} <span className="text-gray-500 text-xs">({redemption.profile?.email})</span></p>
                    </div>
                    <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6 flex gap-4">
                        <img src={redemption.point_product?.image_url} className="w-16 h-16 rounded-lg object-cover" alt=""/>
                        <div>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reward</p>
                            <p className="text-white font-bold">{redemption.point_product?.name}</p>
                            <p className="text-purple-400 text-xs font-black italic">{redemption.cost_at_redemption} Points</p>
                        </div>
                    </div>
                    <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Status</p>
                        <div className="flex gap-2">
                             <button onClick={() => handleUpdateStatus('pending')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>Pending</button>
                             <button onClick={() => handleUpdateStatus('delivered')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${status === 'delivered' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>Delivered</button>
                        </div>
                    </div>
                    <button onClick={onClose} className="mt-8 w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition uppercase text-xs font-black tracking-widest">Close</button>
                </div>
                <div className="w-full md:w-7/12 flex flex-col h-full bg-[#1e232e]">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1e232e]">
                        <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-500"/> Chat with User</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/30 custom-scrollbar">
                         {messages.length === 0 && <p className="text-center text-gray-600 text-xs py-10 uppercase font-bold tracking-widest">No messages yet.</p>}
                         {messages.map(msg => {
                             const isMe = msg.sender_id === currentUser.id;
                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-[#2a303c] text-white border border-gray-700 rounded-tl-none'}`}>
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
                            placeholder="Send credentials/code..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-all" disabled={!newMessage.trim()}>
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

const AdminOrderModal = ({ order, currentUser, onClose }: { order: Order, currentUser: Profile, onClose: () => void }) => {
    // ... [existing implementation of AdminOrderModal]
    const [messages, setMessages] = useState<OrderMessage[]>([]);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [status, setStatus] = useState(order.status);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const fetchDetails = async () => {
            const { data: msgData } = await supabase.from('order_messages').select('*').eq('order_id', order.id).order('created_at', { ascending: true });
            if (msgData) setMessages(msgData);
            
            const { data: itemsData } = await supabase.from('order_items').select('*, product:products(*)').eq('order_id', order.id);
            if (itemsData) setItems(itemsData);

            scrollToBottom();
        };
        fetchDetails();

        const channel = supabase.channel(`admin_chat:${order.id}`)
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

    useEffect(() => { scrollToBottom(); }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const msgText = newMessage.trim();
        setNewMessage(''); 

        const tempId = `temp-admin-${Date.now()}`;
        const optimisicMsg: OrderMessage = {
            id: tempId,
            order_id: order.id,
            sender_id: currentUser.id,
            message: msgText,
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, optimisicMsg]);
        scrollToBottom();

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

    const handleUpdateStatus = async (newStatus: string) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
        setStatus(newStatus);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-5xl rounded-3xl border border-gray-800 shadow-2xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-gray-800 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Order #{order.id.slice(0,6)}</h3>
                    
                    <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Customer</p>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{order.profile?.username?.charAt(0)}</div>
                            <div>
                                <p className="text-white font-bold text-sm">{order.profile?.username}</p>
                                <p className="text-xs text-gray-500">{order.profile?.email}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Order Status</p>
                        <div className="flex gap-2">
                             <button onClick={() => handleUpdateStatus('pending')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${status === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>Pending</button>
                             <button onClick={() => handleUpdateStatus('completed')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${status === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>Completed</button>
                             <button onClick={() => handleUpdateStatus('canceled')} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase transition-all ${status === 'canceled' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-500 hover:bg-gray-700'}`}>Canceled</button>
                        </div>
                    </div>

                    <div className="bg-[#0b0e14] p-4 rounded-xl border border-gray-800 mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2"><Archive className="w-3 h-3"/> Purchased Items</p>
                        <div className="space-y-3">
                            {items.length === 0 ? <p className="text-xs text-gray-600">Loading items...</p> : items.map(item => (
                                <div key={item.id} className="flex gap-3 items-center">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                                        <img src={item.product?.image_url} className="w-full h-full object-cover" alt="" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-white font-bold text-xs truncate leading-tight">{item.product?.name || 'Item Removed'}</p>
                                        <p className="text-white font-bold text-[10px]">
                                            Qty: {item.quantity} <span className="text-gray-600">|</span> <span className="text-yellow-400">{item.price_at_purchase.toFixed(2)} DH</span>
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Transaction ID</p>
                        <p className="text-white font-mono text-xs break-all bg-[#0b0e14] p-2 rounded-lg border border-gray-800">{order.transaction_id || 'N/A'}</p>
                    </div>

                    <div className="mt-auto">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                        <p className="text-3xl font-black text-yellow-400 italic tracking-tighter">{order.total_amount.toFixed(2)} DH</p>
                    </div>
                    
                    <button onClick={onClose} className="mt-8 w-full py-3 rounded-xl border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition uppercase text-xs font-black tracking-widest">Close</button>
                </div>

                <div className="w-full md:w-7/12 flex flex-col h-full bg-[#1e232e]">
                    <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#1e232e]">
                        <span className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-4 h-4 text-purple-500"/> Live Chat with Customer</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/30 custom-scrollbar">
                         {messages.length === 0 && <p className="text-center text-gray-600 text-xs py-10 uppercase font-bold tracking-widest">No messages yet.</p>}
                         {messages.map(msg => {
                             const isMe = msg.sender_id === currentUser.id;
                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${isMe ? 'bg-purple-600 text-white rounded-tr-none' : 'bg-[#2a303c] text-white border border-gray-700 rounded-tl-none'}`}>
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
                            placeholder="Message user..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-xl transition-all" disabled={!newMessage.trim()}>
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const AdminPanel = ({ session, addToast, role }: { session: any, addToast: any, role: 'full' | 'limited' | 'shop' }) => {
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users' | 'coupons' | 'orders' | 'points' | 'pointsShop' | 'redemptions' | 'donations' | 'tournaments' | 'system' | 'affiliates' | 'lootBoxes'>(role === 'shop' ? 'products' : 'stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [pointProducts, setPointProducts] = useState<PointProduct[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pointRedemptions, setPointRedemptions] = useState<PointRedemption[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [recentLootOpens, setRecentLootOpens] = useState<LootBoxOpen[]>([]);
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adminProfile, setAdminProfile] = useState<Profile | null>(null);
  
  // System Settings State
  const [inviteReward, setInviteReward] = useState('5');
  const [orderCommission, setOrderCommission] = useState('5');
  const [saleCode, setSaleCode] = useState('');
  const [siteBackground, setSiteBackground] = useState('');
  const [vipPrice, setVipPrice] = useState('199');
  const [vipDiscount, setVipDiscount] = useState('5');
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPointProductModalOpen, setIsPointProductModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [isLootBoxModalOpen, setIsLootBoxModalOpen] = useState(false);
  const [isVisitsModalOpen, setIsVisitsModalOpen] = useState(false);
  
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPointProduct, setEditingPointProduct] = useState<Partial<PointProduct> | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingLootBox, setEditingLootBox] = useState<Partial<LootBox> | null>(null);
  const [editingReferral, setEditingReferral] = useState<Profile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<PointRedemption | null>(null);
  
  const [providerFilter, setProviderFilter] = useState<'all' | 'email' | 'google' | 'discord'>('all');

  useEffect(() => {
        const getAdminProfile = async () => {
            if(session?.user) {
                 const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                 setAdminProfile(data);
            }
        }
        getAdminProfile();
  }, [session]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);
    
    const { data: ppData } = await supabase.from('point_products').select('*').order('cost', { ascending: true });
    if (ppData) setPointProducts(ppData);

    const { data: tData } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
    if (tData) setTournaments(tData);

    // Fetch Loot Boxes & History
    const { data: lbData } = await supabase.from('loot_boxes').select('*').order('price', { ascending: true });
    if (lbData) setLootBoxes(lbData);

    if (role === 'full' || role === 'limited') {
        const { data: lbOpens } = await supabase.from('loot_box_opens').select('*').order('created_at', { ascending: false }).limit(20);
        // Need to fetch user details for opens manually since simple join might be tricky with types
        if (lbOpens) {
            const enrichedOpens = await Promise.all(lbOpens.map(async (open) => {
                const { data: u } = await supabase.from('profiles').select('username, email').eq('id', open.user_id).single();
                return { ...open, profile: u };
            }));
            setRecentLootOpens(enrichedOpens);
        }
    }

    if (role === 'full') {
        const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (userData) setProfiles(userData);
        const { data: cData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (cData) setCoupons(cData);
    }
    
    if (role !== 'shop') {
        const { data: dData } = await supabase.from('donations').select('*, profile:profiles(*)').order('created_at', { ascending: false });
        if (dData) setDonations(dData);
    }

    if (role === 'full' || role === 'limited') {
        const { data: prData } = await supabase.from('point_redemptions').select('*, profile:profiles(*), point_product:point_products(*)').order('created_at', { ascending: false });
        if (prData) setPointRedemptions(prData);
    }

    if (role === 'full') {
        const { data: settings } = await supabase.from('app_settings').select('*');
        if (settings) {
            settings.forEach(item => {
                if (item.key === 'affiliate_invite_reward') setInviteReward(item.value);
                if (item.key === 'affiliate_order_reward_percentage') setOrderCommission(item.value);
                if (item.key === 'sale_code') setSaleCode(item.value);
                if (item.key === 'site_background') setSiteBackground(item.value);
                if (item.key === 'vip_membership_price') setVipPrice(item.value);
                if (item.key === 'vip_discount_percent') setVipDiscount(item.value);
            });
        }
        const { data: ann } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (ann) setAnnouncements(ann);
    }

    if (role !== 'shop') {
        const { data: oData } = await supabase.from('orders').select('*, profile:profiles(*)').order('created_at', { ascending: false });
        if (oData) setOrders(oData);
        
        const totalRevenue = oData?.reduce((acc, curr) => curr.status !== 'canceled' ? acc + Number(curr.total_amount) : acc, 0) || 0;
        
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        
        setStats({ users: userCount || 0, orders: orderCount || 0, revenue: totalRevenue });
    }
    
    if (role !== 'shop') {
        const today = new Date();
        today.setHours(0,0,0,0);
        const { data: lData } = await supabase.from('access_logs').select('*').gte('created_at', today.toISOString()).order('created_at', { ascending: false });
        if (lData) setLogs(lData);
    }

    setIsLoading(false);
  }, [role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ACTIONS --- (Actions remain same, skipping repetition of unchanged handlers)
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('WARNING: Are you sure you want to delete this product forever?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) { addToast('Deleted', 'Item removed.', 'success'); fetchData(); }
  };

  const handleSaveProduct = async (data: any) => { 
      if(data.id) await supabase.from('products').update(data).eq('id', data.id);
      else await supabase.from('products').insert(data);
      setIsProductModalOpen(false);
      fetchData();
  };

  const handleSavePointProduct = async (data: any) => { 
      if(data.id) await supabase.from('point_products').update(data).eq('id', data.id);
      else await supabase.from('point_products').insert(data);
      setIsPointProductModalOpen(false);
      fetchData();
  };

  const handleSaveTournament = async (data: any) => { 
      if(data.id) await supabase.from('tournaments').update(data).eq('id', data.id);
      else await supabase.from('tournaments').insert(data);
      setIsTournamentModalOpen(false);
      fetchData();
  };

  const handleDeleteTournament = async (id: string) => {
      if(!window.confirm('Delete Tournament?')) return;
      await supabase.from('tournaments').delete().eq('id', id);
      fetchData();
  };

  const handleDeletePointProduct = async (id: string) => { 
      if(!window.confirm('Delete Reward?')) return;
      await supabase.from('point_products').delete().eq('id', id);
      fetchData();
  };

  const handleUpdateBalance = async (uid: string, bal: number, pts: number) => { 
      await supabase.from('profiles').update({ wallet_balance: bal, discord_points: pts }).eq('id', uid);
      setEditingUser(null);
      fetchData();
      addToast('Updated', 'Balance synced.', 'success');
  };

  const handleUpdateReferral = async (id: string, code: string, earnings: number) => {
      const { error } = await supabase.from('profiles').update({ referral_code: code, referral_earnings: earnings }).eq('id', id);
      if (error) {
          addToast('Error', 'Code might be taken or invalid.', 'error');
      } else {
          setEditingReferral(null);
          fetchData();
          addToast('Updated', 'Affiliate details updated.', 'success');
      }
  };

  const handleDeleteUser = async (uid: string) => { 
      if(!window.confirm('Delete User?')) return;
      await supabase.from('profiles').delete().eq('id', uid);
      fetchData();
      addToast('Deleted', 'User removed.', 'success');
  };

  const handleSaveCoupon = async (data: any) => { 
      if(data.id) await supabase.from('coupons').update(data).eq('id', data.id);
      else await supabase.from('coupons').insert(data);
      setIsCouponModalOpen(false);
      fetchData();
  };

  const handleDeleteCoupon = async (id: string) => { 
      if(!window.confirm('Delete Coupon?')) return;
      await supabase.from('coupons').delete().eq('id', id);
      fetchData();
  };

  const handleSaveAnnouncement = async (data: any) => {
      if(data.id) await supabase.from('announcements').update(data).eq('id', data.id);
      else await supabase.from('announcements').insert(data);
      setIsAnnouncementModalOpen(false);
      fetchData();
  };

  const handleDeleteAnnouncement = async (id: string) => {
      if(!window.confirm('Delete Announcement?')) return;
      await supabase.from('announcements').delete().eq('id', id);
      fetchData();
  };

  const handleSaveLootBox = async (data: any) => {
      if(data.id) await supabase.from('loot_boxes').update(data).eq('id', data.id);
      else await supabase.from('loot_boxes').insert(data);
      setIsLootBoxModalOpen(false);
      fetchData();
  };

  const handleDeleteLootBox = async (id: string) => {
      if(!window.confirm('Delete Moon Pack?')) return;
      await supabase.from('loot_boxes').delete().eq('id', id);
      fetchData();
  };

  const handleSaveSettings = async () => {
      const updates = [
          { key: 'affiliate_invite_reward', value: inviteReward },
          { key: 'affiliate_order_reward_percentage', value: orderCommission },
          { key: 'sale_code', value: saleCode },
          { key: 'site_background', value: siteBackground },
          { key: 'vip_membership_price', value: vipPrice },
          { key: 'vip_discount_percent', value: vipDiscount }
      ];

      for (const item of updates) {
          await supabase.from('app_settings').upsert(item, { onConflict: 'key' });
      }
      addToast('Saved', 'System settings updated.', 'success');
  };

  // ... (Filtering logic remains same) ...
  const filteredProducts = products.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (p.category || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPointProducts = pointProducts.filter(p => (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredTournaments = tournaments.filter(t => (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.game_name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = profiles.filter(u => {
    const matchesSearch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) || (u.username || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (providerFilter === 'all') return matchesSearch;
    return matchesSearch && u.auth_provider === providerFilter;
  });
  const filteredCoupons = coupons.filter(c => (c.code || '').includes(searchQuery.toUpperCase()));
  const filteredOrders = orders.filter(o => (o.id || '').includes(searchQuery) || (o.profile?.username || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRedemptions = pointRedemptions.filter(pr => (pr.profile?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) || (pr.point_product?.name || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredDonations = donations.filter(d => (d.profile?.username || '').toLowerCase().includes(searchQuery.toLowerCase()));
  const affiliateProfiles = profiles.filter(p => (p.referral_earnings || 0) > 0 || profiles.some(sub => sub.referred_by === p.id));

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white flex font-sans selection:bg-blue-500 selection:text-white">
        <aside className="w-72 bg-[#1e232e] border-r border-gray-800 flex flex-col fixed h-full z-50 shadow-2xl">
            <div className="p-8 border-b border-gray-800 bg-[#151a23]">
                <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">System<span className="text-blue-500">Core</span></h1>
                <div className="mt-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Operator: <span className="text-white">{role.toUpperCase()}</span></p>
                </div>
            </div>
            
            <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {role !== 'shop' && (
                    <button onClick={() => setActiveSection('stats')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'stats' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                        <BarChart3 className="w-4 h-4" /> Overview
                    </button>
                )}
                
                <p className="px-4 pt-6 pb-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Management</p>
                
                <button onClick={() => setActiveSection('products')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'products' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                    <Package className="w-4 h-4" /> Products
                </button>
                
                <button onClick={() => setActiveSection('lootBoxes')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'lootBoxes' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                    <Zap className="w-4 h-4" /> Moon Packs
                </button>

                {/* ... (Other nav buttons unchanged) ... */}
                <button onClick={() => setActiveSection('pointsShop')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'pointsShop' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                    <Trophy className="w-4 h-4" /> Rewards Shop
                </button>

                <button onClick={() => setActiveSection('tournaments')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'tournaments' ? 'bg-pink-600 text-white shadow-lg shadow-pink-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                    <Swords className="w-4 h-4" /> Tournaments
                </button>

                {role !== 'shop' && (
                    <>
                        <button onClick={() => setActiveSection('orders')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'orders' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <ShoppingCart className="w-4 h-4" /> Orders
                        </button>
                        
                        <button onClick={() => setActiveSection('redemptions')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'redemptions' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <Gift className="w-4 h-4" /> Redemptions
                        </button>

                        <button onClick={() => setActiveSection('donations')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'donations' ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <Heart className="w-4 h-4" /> Donations
                        </button>
                    </>
                )}

                {role === 'full' && (
                    <>
                        <p className="px-4 pt-6 pb-2 text-[9px] font-black text-gray-600 uppercase tracking-[0.2em]">Super Admin</p>
                        
                        <button onClick={() => setActiveSection('users')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <Users className="w-4 h-4" /> Users
                        </button>

                        <button onClick={() => setActiveSection('affiliates')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'affiliates' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <Percent className="w-4 h-4" /> Affiliates
                        </button>
                        
                        <button onClick={() => setActiveSection('coupons')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'coupons' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <Ticket className="w-4 h-4" /> Coupons
                        </button>

                        <button onClick={() => setActiveSection('system')} className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeSection === 'system' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-gray-400 hover:bg-[#0b0e14] hover:text-white'}`}>
                            <Settings className="w-4 h-4" /> System
                        </button>
                    </>
                )}
            </nav>
            
            <div className="p-4 border-t border-gray-800 bg-[#151a23]">
                <button onClick={() => window.location.href='/'} className="w-full bg-[#0b0e14] text-gray-400 hover:text-white hover:border-gray-500 border border-gray-800 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all">
                    <LogOut className="w-4 h-4" /> Exit Console
                </button>
            </div>
        </aside>

        <main className="flex-1 ml-72 p-10 overflow-y-auto h-screen relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <div className="max-w-7xl mx-auto pb-20">
                
                {/* ... (Stats Section unchanged) ... */}
                {activeSection === 'stats' && role !== 'shop' && (
                    <div className="space-y-8 animate-slide-up">
                        {/* ... */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Users className="w-24 h-24" /></div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Total Users</p>
                                <h3 className="text-5xl font-black text-white italic tracking-tighter relative z-10">{stats.users}</h3>
                            </div>
                            <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><ShoppingCart className="w-24 h-24" /></div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Total Orders</p>
                                <h3 className="text-5xl font-black text-white italic tracking-tighter relative z-10">{stats.orders}</h3>
                            </div>
                            <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-gray-800 shadow-2xl relative overflow-hidden group">
                                <div className="absolute right-0 top-0 p-6 opacity-5 group-hover:scale-110 transition-transform"><Wallet className="w-24 h-24" /></div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Total Revenue</p>
                                <h3 className="text-5xl font-black text-yellow-400 italic tracking-tighter relative z-10">{stats.revenue.toFixed(2)} DH</h3>
                            </div>
                        </div>
                        
                        <div className="flex gap-4">
                            <button onClick={() => setIsVisitsModalOpen(true)} className="bg-[#1e232e] border border-gray-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:border-blue-500 transition-all shadow-xl">
                                <Globe className="w-5 h-5 text-blue-500" /> View Live Traffic Logs
                            </button>
                            <button onClick={() => setActiveSection('system')} className="bg-[#1e232e] border border-gray-800 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:border-yellow-500 transition-all shadow-xl">
                                <Megaphone className="w-5 h-5 text-yellow-500" /> Manage Announcements
                            </button>
                        </div>
                    </div>
                )}

                {/* Products Section (unchanged) */}
                {activeSection === 'products' && (
                    <div className="animate-slide-up">
                        <div className="flex justify-between items-center mb-8 gap-4">
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Inventory</h2>
                            <div className="flex gap-4">
                                <input type="text" placeholder="Search items..." className="bg-[#1e232e] border border-gray-800 rounded-xl py-3 px-4 text-white text-xs font-bold uppercase tracking-widest focus:border-blue-500 outline-none w-64" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl transition-all">
                                    <PlusCircle className="w-4 h-4" /> Add Item
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-[#1e232e] rounded-2xl border border-gray-800 p-4 flex gap-4 group hover:border-blue-500/30 transition-all">
                                    <div className="w-20 h-20 bg-[#0b0e14] rounded-xl overflow-hidden flex-shrink-0 relative">
                                        <img src={product.image_url} className="w-full h-full object-cover" alt="" />
                                        {product.is_vip && <div className="absolute top-1 right-1 bg-yellow-500 text-black text-[8px] font-black px-1.5 rounded">VIP</div>}
                                    </div>
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start">
                                                <h4 className="text-white font-bold text-sm truncate">{product.name}</h4>
                                                <span className="text-[10px] text-gray-500 font-black uppercase">{product.category}</span>
                                            </div>
                                            <p className="text-yellow-400 font-black italic">{product.price} DH</p>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="flex-1 bg-[#0b0e14] border border-gray-800 hover:border-blue-500 text-gray-400 hover:text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-all">
                                                <Edit2 className="w-3 h-3" /> Edit
                                            </button>
                                            <button onClick={() => handleDeleteProduct(product.id)} className="px-3 bg-red-900/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-all">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Loot Boxes Section - Updated */}
                {activeSection === 'lootBoxes' && (
                    <div className="animate-slide-up space-y-12">
                        {/* Config */}
                        <div>
                            <div className="flex justify-between items-center mb-8 gap-4">
                                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Moon Packs Config</h2>
                                <button onClick={() => { setEditingLootBox(null); setIsLootBoxModalOpen(true); }} className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-xs flex items-center gap-2 shadow-xl transition-all">
                                    <PlusCircle className="w-4 h-4" /> New Pack
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {lootBoxes.map(box => (
                                    <div key={box.id} className={`bg-[#1e232e] p-6 rounded-3xl border flex flex-col items-center text-center relative group overflow-hidden ${box.border_color}`}>
                                        <div className={`absolute inset-0 opacity-10 ${box.color}`}></div>
                                        <h4 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-2 relative z-10">{box.name}</h4>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 relative z-10">{box.potential_rewards}</p>
                                        <p className="text-3xl font-black text-white italic tracking-tighter mb-4 relative z-10">{box.price} DH</p>
                                        
                                        <div className="flex gap-2 w-full relative z-10 mt-auto">
                                            <button onClick={() => { setEditingLootBox(box); setIsLootBoxModalOpen(true); }} className="flex-1 bg-[#0b0e14] border border-gray-700 hover:border-white text-white py-2 rounded-xl text-xs font-black uppercase tracking-widest">Edit</button>
                                            <button onClick={() => handleDeleteLootBox(box.id)} className="px-4 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Recent History Log */}
                        <div className="bg-[#1e232e] rounded-3xl border border-gray-800 p-8">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                                <History className="w-5 h-5 text-gray-400" /> Recent Crate Activity
                            </h3>
                            {recentLootOpens.length === 0 ? (
                                <p className="text-center text-gray-500 font-bold uppercase tracking-widest text-xs py-10">No recent openings.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="text-[10px] font-black uppercase tracking-widest text-gray-500 border-b border-gray-800">
                                            <tr>
                                                <th className="pb-4 pl-4">Time</th>
                                                <th className="pb-4">User</th>
                                                <th className="pb-4">Pack</th>
                                                <th className="pb-4 text-right">Result</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {recentLootOpens.map((open) => (
                                                <tr key={open.id} className="hover:bg-[#0b0e14]/50 transition-colors">
                                                    <td className="py-4 pl-4 text-xs font-mono text-gray-500">{new Date(open.created_at).toLocaleTimeString()}</td>
                                                    <td className="py-4 text-xs font-bold text-white">{open.profile?.username || 'Unknown'}</td>
                                                    <td className="py-4 text-xs text-gray-400 font-bold">{open.box_name} <span className="opacity-50">({open.box_price} DH)</span></td>
                                                    <td className="py-4 text-right">
                                                        <span className={`text-xs font-black italic tracking-tighter px-3 py-1 rounded-lg ${
                                                            open.reward_type === 'money' 
                                                                ? (open.reward_value > open.box_price ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-gray-800 text-gray-400')
                                                                : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                                        }`}>
                                                            {open.reward_type === 'money' ? `+${open.reward_value} DH` : `+${open.reward_value} PTS`}
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

                {/* ... other sections ... */}
            </div>
        </main>

        {/* Modals */}
        {isProductModalOpen && <ProductFormModal product={editingProduct} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} />}
        {isPointProductModalOpen && <PointProductFormModal product={editingPointProduct} onClose={() => setIsPointProductModalOpen(false)} onSave={handleSavePointProduct} />}
        {isCouponModalOpen && <CouponFormModal coupon={editingCoupon} onClose={() => setIsCouponModalOpen(false)} onSave={handleSaveCoupon} />}
        {isTournamentModalOpen && <TournamentFormModal tournament={editingTournament} onClose={() => setIsTournamentModalOpen(false)} onSave={handleSaveTournament} />}
        {isAnnouncementModalOpen && <AnnouncementFormModal announcement={editingAnnouncement} onClose={() => setIsAnnouncementModalOpen(false)} onSave={handleSaveAnnouncement} />}
        {isLootBoxModalOpen && <LootBoxFormModal lootBox={editingLootBox} onClose={() => setIsLootBoxModalOpen(false)} onSave={handleSaveLootBox} />}
        {isVisitsModalOpen && <VisitHistoryModal logs={logs} onClose={() => setIsVisitsModalOpen(false)} />}
        
        {editingUser && (
            <BalanceEditorModal 
                user={editingUser} 
                onClose={() => setEditingUser(null)} 
                onSave={handleUpdateBalance} 
            />
        )}

        {editingReferral && (
            <ReferralEditorModal
                user={editingReferral}
                onClose={() => setEditingReferral(null)}
                onSave={handleUpdateReferral}
            />
        )}
        
        {selectedOrder && adminProfile && (
            <AdminOrderModal 
                order={selectedOrder} 
                currentUser={adminProfile}
                onClose={() => setSelectedOrder(null)} 
            />
        )}
        
        {selectedRedemption && adminProfile && (
            <AdminRedemptionModal
                redemption={selectedRedemption}
                currentUser={adminProfile}
                onClose={() => setSelectedRedemption(null)}
            />
        )}
    </div>
  );
};
