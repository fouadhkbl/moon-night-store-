
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, Profile, Coupon, Order, OrderMessage, AccessLog, OrderItem, PointTransaction, PointProduct, PointRedemption, RedemptionMessage, Donation, Tournament, Announcement, LootBox, LootBoxOpen, SpinWheelItem } from '../../types';
import { BarChart3, Package, Users, Search, Mail, Edit2, Trash2, PlusCircle, Wallet, ShoppingCart, Key, Ticket, ClipboardList, MessageSquare, Send, X, CheckCircle, Clock, Ban, Globe, Archive, Coins, ArrowRightLeft, Trophy, Gift, Eye, EyeOff, Heart, Percent, Swords, Settings, Save, Megaphone, Image, LogOut, Crown, Zap, History, RotateCw, PieChart, AlertCircle, Loader2 } from 'lucide-react';
import { ProductFormModal, BalanceEditorModal, CouponFormModal, PointProductFormModal, TournamentFormModal, AnnouncementFormModal, ReferralEditorModal, LootBoxFormModal, SpinWheelItemFormModal } from './AdminModals';

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

const AdminRedemptionModal = ({ redemption, currentUser, onClose }: { redemption: PointRedemption, currentUser: Profile, onClose: () => void }) => {
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
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4">Order #{order.id.slice(0, 6)}</h3>
                    
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
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users' | 'coupons' | 'orders' | 'points' | 'pointsShop' | 'redemptions' | 'donations' | 'tournaments' | 'system' | 'affiliates' | 'lootBoxes' | 'wheel' | 'announcements'>(role === 'shop' ? 'products' : 'stats');
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
  const [wheelItems, setWheelItems] = useState<SpinWheelItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Modals States
  const [visitHistoryOpen, setVisitHistoryOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Partial<Coupon> | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRedemption, setSelectedRedemption] = useState<PointRedemption | null>(null);
  const [selectedPointProduct, setSelectedPointProduct] = useState<Partial<PointProduct> | null>(null);
  const [isPointProductModalOpen, setIsPointProductModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Partial<Tournament> | null>(null);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [selectedLootBox, setSelectedLootBox] = useState<Partial<LootBox> | null>(null);
  const [isLootBoxModalOpen, setIsLootBoxModalOpen] = useState(false);
  const [selectedWheelItem, setSelectedWheelItem] = useState<Partial<SpinWheelItem> | null>(null);
  const [isWheelItemModalOpen, setIsWheelItemModalOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
      const getProfile = async () => {
          if (session?.user?.id) {
              const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
              setCurrentUserProfile(data);
          }
      }
      getProfile();
  }, [session]);

  const fetchData = useCallback(async () => {
      setIsLoading(true);
      try {
        if (activeSection === 'products') {
            const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if(data) setProducts(data);
        } else if (activeSection === 'users') {
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if(data) setProfiles(data);
        } else if (activeSection === 'orders') {
            const { data } = await supabase.from('orders').select('*, profile:profiles(*)').order('created_at', { ascending: false });
            if(data) setOrders(data);
        } else if (activeSection === 'coupons') {
            const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
            if(data) setCoupons(data);
        } else if (activeSection === 'pointsShop') {
            const { data } = await supabase.from('point_products').select('*').order('created_at', { ascending: false });
            if(data) setPointProducts(data);
        } else if (activeSection === 'redemptions') {
            const { data } = await supabase.from('point_redemptions').select('*, profile:profiles(*), point_product:point_products(*)').order('created_at', { ascending: false });
            if(data) setPointRedemptions(data);
        } else if (activeSection === 'donations') {
            const { data } = await supabase.from('donations').select('*, profile:profiles(*)').order('created_at', { ascending: false });
            if(data) setDonations(data);
        } else if (activeSection === 'tournaments') {
            const { data } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
            if(data) setTournaments(data);
        } else if (activeSection === 'announcements') {
            const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
            if(data) setAnnouncements(data);
        } else if (activeSection === 'lootBoxes') {
            const { data } = await supabase.from('loot_boxes').select('*').order('price', { ascending: true });
            if(data) setLootBoxes(data);
        } else if (activeSection === 'wheel') {
            const { data } = await supabase.from('spin_wheel_items').select('*').order('created_at', { ascending: false });
            if(data) setWheelItems(data);
        } else if (activeSection === 'stats') {
            const { data: logData } = await supabase.from('access_logs').select('*').order('created_at', { ascending: false }).limit(100);
            if (logData) setLogs(logData);
            const { data: orderData } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10);
            if(orderData) setOrders(orderData);
        }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  }, [activeSection]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Generic Handlers
  const handleDelete = async (table: string, id: string, name: string) => {
      if(!window.confirm(`Delete ${name}?`)) return;
      await supabase.from(table).delete().eq('id', id);
      addToast('Deleted', `${name} deleted successfully.`, 'success');
      fetchData();
  };

  const handleSaveProduct = async (formData: any) => {
      if (selectedProduct?.id) {
          await supabase.from('products').update(formData).eq('id', selectedProduct.id);
      } else {
          await supabase.from('products').insert(formData);
      }
      setIsProductModalOpen(false);
      fetchData();
      addToast('Saved', 'Product updated.', 'success');
  };

  const handleSaveUserBalance = async (id: string, amount: number, points: number, spins: number) => {
      await supabase.from('profiles').update({ wallet_balance: amount, discord_points: points, spins_count: spins }).eq('id', id);
      setIsBalanceModalOpen(false);
      fetchData();
      addToast('Saved', 'User balance & spins updated.', 'success');
  };

  const handleSaveReferral = async (id: string, code: string, earnings: number) => {
      await supabase.from('profiles').update({ referral_code: code, referral_earnings: earnings }).eq('id', id);
      setIsReferralModalOpen(false);
      fetchData();
      addToast('Saved', 'Referral info updated.', 'success');
  };

  const handleSaveCoupon = async (formData: any) => {
      if (selectedCoupon?.id) await supabase.from('coupons').update(formData).eq('id', selectedCoupon.id);
      else await supabase.from('coupons').insert(formData);
      setIsCouponModalOpen(false);
      fetchData();
      addToast('Saved', 'Coupon updated.', 'success');
  };

  const handleSavePointProduct = async (formData: any) => {
      if (selectedPointProduct?.id) await supabase.from('point_products').update(formData).eq('id', selectedPointProduct.id);
      else await supabase.from('point_products').insert(formData);
      setIsPointProductModalOpen(false);
      fetchData();
      addToast('Saved', 'Reward updated.', 'success');
  };

  const handleSaveTournament = async (formData: any) => {
      if (selectedTournament?.id) await supabase.from('tournaments').update(formData).eq('id', selectedTournament.id);
      else await supabase.from('tournaments').insert(formData);
      setIsTournamentModalOpen(false);
      fetchData();
      addToast('Saved', 'Tournament updated.', 'success');
  };

  const handleSaveAnnouncement = async (formData: any) => {
      if (selectedAnnouncement?.id) await supabase.from('announcements').update(formData).eq('id', selectedAnnouncement.id);
      else await supabase.from('announcements').insert(formData);
      setIsAnnouncementModalOpen(false);
      fetchData();
      addToast('Saved', 'Announcement updated.', 'success');
  };

  const handleSaveLootBox = async (formData: any) => {
      if (selectedLootBox?.id) await supabase.from('loot_boxes').update(formData).eq('id', selectedLootBox.id);
      else await supabase.from('loot_boxes').insert(formData);
      setIsLootBoxModalOpen(false);
      fetchData();
      addToast('Saved', 'Loot Box updated.', 'success');
  };

  const handleSaveWheelItem = async (formData: any) => {
      if (selectedWheelItem?.id) await supabase.from('spin_wheel_items').update(formData).eq('id', selectedWheelItem.id);
      else await supabase.from('spin_wheel_items').insert(formData);
      setIsWheelItemModalOpen(false);
      fetchData();
      addToast('Saved', 'Wheel item updated.', 'success');
  };

  const navItems = [
      { id: 'stats', label: 'Overview', icon: BarChart3, role: ['full', 'limited'] },
      { id: 'products', label: 'Products', icon: Package, role: ['full', 'limited', 'shop'] },
      { id: 'orders', label: 'Orders', icon: ClipboardList, role: ['full', 'limited'] },
      { id: 'users', label: 'Users', icon: Users, role: ['full'] },
      { id: 'coupons', label: 'Coupons', icon: Ticket, role: ['full'] },
      { id: 'pointsShop', label: 'Points Shop', icon: Trophy, role: ['full'] },
      { id: 'redemptions', label: 'Redemptions', icon: Gift, role: ['full', 'limited'] },
      { id: 'tournaments', label: 'Tournaments', icon: Swords, role: ['full'] },
      { id: 'lootBoxes', label: 'Loot Boxes', icon: Package, role: ['full'] },
      { id: 'wheel', label: 'Spin Wheel', icon: RotateCw, role: ['full'] },
      { id: 'announcements', label: 'Announcements', icon: Megaphone, role: ['full'] },
      { id: 'donations', label: 'Donations', icon: Heart, role: ['full'] },
  ];

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden">
        {/* Sidebar */}
        <div className="w-20 md:w-64 bg-[#1e232e] border-r border-gray-800 flex flex-col flex-shrink-0">
             <div className="p-6 border-b border-gray-800 flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic">A</div>
                 <span className="text-white font-black italic text-lg hidden md:block uppercase tracking-tighter">Admin Panel</span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                 {navItems.filter(i => i.role.includes(role)).map(item => (
                     <button 
                         key={item.id} 
                         onClick={() => setActiveSection(item.id as any)}
                         className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeSection === item.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:bg-[#151a23] hover:text-white'}`}
                     >
                         <item.icon className="w-5 h-5 flex-shrink-0" />
                         <span className="text-xs font-bold uppercase tracking-widest hidden md:block">{item.label}</span>
                     </button>
                 ))}
             </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
             {/* Header */}
             <div className="h-20 border-b border-gray-800 bg-[#1e232e] px-6 flex items-center justify-between flex-shrink-0">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">{navItems.find(i => i.id === activeSection)?.label}</h2>
                 {['products', 'users', 'orders'].includes(activeSection) && (
                     <div className="relative hidden md:block">
                         <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                         <input type="text" placeholder="Search..." className="bg-[#0b0e14] border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 w-64" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                     </div>
                 )}
             </div>

             {/* Dynamic Content */}
             <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14]">
                 
                 {isLoading ? (
                     <div className="flex items-center justify-center h-full">
                         <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                     </div>
                 ) : (
                 <>
                 {/* STATS */}
                 {activeSection === 'stats' && (
                     <div className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 shadow-xl">
                                 <div className="flex justify-between items-start mb-4">
                                     <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><Globe className="w-6 h-6"/></div>
                                     <button onClick={() => setVisitHistoryOpen(true)} className="text-xs text-gray-500 hover:text-white underline">View Log</button>
                                 </div>
                                 <h3 className="text-3xl font-black text-white italic">{logs.length}</h3>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recent Visitors</p>
                             </div>
                             <div className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 shadow-xl">
                                 <div className="flex justify-between items-start mb-4">
                                     <div className="p-3 bg-green-600/20 rounded-xl text-green-400"><ClipboardList className="w-6 h-6"/></div>
                                 </div>
                                 <h3 className="text-3xl font-black text-white italic">{orders.length}</h3>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Recent Orders</p>
                             </div>
                             <div className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 shadow-xl">
                                 <div className="flex justify-between items-start mb-4">
                                     <div className="p-3 bg-purple-600/20 rounded-xl text-purple-400"><Wallet className="w-6 h-6"/></div>
                                 </div>
                                 <h3 className="text-3xl font-black text-white italic">---</h3>
                                 <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Revenue</p>
                             </div>
                         </div>
                     </div>
                 )}

                 {/* PRODUCTS */}
                 {activeSection === 'products' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                             <PlusCircle className="w-4 h-4" /> Add Product
                         </button>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                             {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                                 <div key={product.id} className="bg-[#1e232e] rounded-2xl border border-gray-800 overflow-hidden group hover:border-blue-500/50 transition-all">
                                     <div className="relative h-40 bg-gray-900">
                                         <img src={product.image_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={product.name} />
                                         <div className="absolute top-2 right-2 flex gap-1">
                                             <button onClick={() => { setSelectedProduct(product); setIsProductModalOpen(true); }} className="p-2 bg-black/60 rounded-lg text-white hover:bg-blue-600 transition"><Edit2 className="w-3 h-3"/></button>
                                             <button onClick={() => handleDelete('products', product.id, product.name)} className="p-2 bg-black/60 rounded-lg text-white hover:bg-red-600 transition"><Trash2 className="w-3 h-3"/></button>
                                         </div>
                                     </div>
                                     <div className="p-4">
                                         <h3 className="font-bold text-white text-sm truncate">{product.name}</h3>
                                         <p className="text-gray-500 text-xs mb-2">{product.category}</p>
                                         <div className="flex justify-between items-center">
                                             <span className="text-yellow-400 font-mono font-bold">{product.price.toFixed(2)} DH</span>
                                             <span className="text-gray-600 text-xs">Stock: {product.stock}</span>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* USERS */}
                 {activeSection === 'users' && (
                     <div className="bg-[#1e232e] rounded-3xl border border-gray-800 overflow-hidden">
                         <table className="w-full text-left">
                             <thead className="bg-[#151a23] text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                                 <tr>
                                     <th className="p-4">User</th>
                                     <th className="p-4">Balance</th>
                                     <th className="p-4">Points</th>
                                     <th className="p-4">Spins</th>
                                     <th className="p-4">Referrals</th>
                                     <th className="p-4 text-right">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-800">
                                 {profiles.filter(u => u.username?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                     <tr key={user.id} className="hover:bg-white/5">
                                         <td className="p-4">
                                             <div className="flex items-center gap-3">
                                                 <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-xs font-bold text-white">{user.username?.charAt(0)}</div>
                                                 <div>
                                                     <p className="text-white font-bold text-xs">{user.username}</p>
                                                     <p className="text-gray-500 text-[10px]">{user.email}</p>
                                                 </div>
                                             </div>
                                         </td>
                                         <td className="p-4 font-mono text-green-400 text-sm font-bold">{user.wallet_balance.toFixed(2)}</td>
                                         <td className="p-4 font-mono text-purple-400 text-sm font-bold">{user.discord_points}</td>
                                         <td className="p-4 font-mono text-pink-400 text-sm font-bold">{user.spins_count || 0}</td>
                                         <td className="p-4 font-mono text-gray-400 text-sm">{user.referral_code || '-'}</td>
                                         <td className="p-4 text-right flex justify-end gap-2">
                                             <button onClick={() => { setSelectedProfile(user); setIsBalanceModalOpen(true); }} className="p-2 bg-gray-800 rounded-lg text-blue-400 hover:bg-blue-600 hover:text-white transition"><Wallet className="w-4 h-4" /></button>
                                             <button onClick={() => { setSelectedProfile(user); setIsReferralModalOpen(true); }} className="p-2 bg-gray-800 rounded-lg text-green-400 hover:bg-green-600 hover:text-white transition"><Users className="w-4 h-4" /></button>
                                         </td>
                                     </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}

                 {/* ORDERS */}
                 {activeSection === 'orders' && (
                     <div className="space-y-4">
                         {orders.map(order => (
                             <div key={order.id} className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
                                 <div>
                                     <p className="text-white font-bold text-sm mb-1">Order #{order.id.slice(0, 8)}</p>
                                     <p className="text-gray-500 text-xs mb-2">{new Date(order.created_at).toLocaleString()} • {order.profile?.email}</p>
                                     <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${order.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : order.status === 'canceled' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                                         {order.status}
                                     </span>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-white font-black italic text-xl mb-3">{order.total_amount.toFixed(2)} DH</p>
                                     <button onClick={() => setSelectedOrder(order)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">View Details</button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}

                 {/* COUPONS */}
                 {activeSection === 'coupons' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedCoupon(null); setIsCouponModalOpen(true); }} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                             <PlusCircle className="w-4 h-4" /> Create Coupon
                         </button>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {coupons.map(coupon => (
                                 <div key={coupon.id} className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 relative group hover:border-purple-500/50 transition">
                                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => { setSelectedCoupon(coupon); setIsCouponModalOpen(true); }} className="p-2 bg-gray-800 rounded-lg hover:text-white"><Edit2 className="w-3 h-3"/></button>
                                         <button onClick={() => handleDelete('coupons', coupon.id, coupon.code)} className="p-2 bg-gray-800 rounded-lg hover:text-red-500"><Trash2 className="w-3 h-3"/></button>
                                     </div>
                                     <h3 className="text-2xl font-mono font-black text-white tracking-widest mb-1">{coupon.code}</h3>
                                     <p className="text-purple-400 font-bold text-sm mb-4">
                                         {coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `-${coupon.discount_value} DH`}
                                     </p>
                                     <div className="flex justify-between text-xs text-gray-500">
                                         <span>Uses: {coupon.usage_count} / {coupon.max_uses || '∞'}</span>
                                         <span className={coupon.is_active ? 'text-green-500' : 'text-red-500'}>{coupon.is_active ? 'Active' : 'Inactive'}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {/* OTHER SECTIONS (Basic Table/List Implementations) */}
                 {activeSection === 'pointsShop' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedPointProduct(null); setIsPointProductModalOpen(true); }} className="bg-purple-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">Add Reward</button>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {pointProducts.map(p => (
                                 <div key={p.id} className="bg-[#1e232e] p-4 rounded-2xl border border-gray-800 flex gap-4 items-center group">
                                     <img src={p.image_url} className="w-16 h-16 rounded-lg object-cover bg-black" alt="" />
                                     <div className="flex-1 min-w-0">
                                         <p className="text-white font-bold truncate">{p.name}</p>
                                         <p className="text-purple-400 font-black italic">{p.cost} PTS</p>
                                     </div>
                                     <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => { setSelectedPointProduct(p); setIsPointProductModalOpen(true); }}><Edit2 className="w-4 h-4 text-gray-400 hover:text-white"/></button>
                                         <button onClick={() => handleDelete('point_products', p.id, p.name)}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {activeSection === 'redemptions' && (
                     <div className="space-y-4">
                         {pointRedemptions.map(r => (
                             <div key={r.id} className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 flex justify-between items-center">
                                 <div>
                                     <p className="text-white font-bold text-sm mb-1">{r.point_product?.name}</p>
                                     <p className="text-gray-500 text-xs mb-2">User: {r.profile?.email} • {new Date(r.created_at).toLocaleDateString()}</p>
                                     <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${r.status === 'delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>{r.status}</span>
                                 </div>
                                 <button onClick={() => setSelectedRedemption(r)} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition">Manage</button>
                             </div>
                         ))}
                     </div>
                 )}

                 {activeSection === 'tournaments' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedTournament(null); setIsTournamentModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">Create Tournament</button>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             {tournaments.map(t => (
                                 <div key={t.id} className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 relative group">
                                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => { setSelectedTournament(t); setIsTournamentModalOpen(true); }} className="p-2 bg-black/50 rounded-lg hover:text-white"><Edit2 className="w-4 h-4"/></button>
                                         <button onClick={() => handleDelete('tournaments', t.id, t.title)} className="p-2 bg-black/50 rounded-lg hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
                                     </div>
                                     <h3 className="text-xl font-black text-white italic uppercase">{t.title}</h3>
                                     <p className="text-gray-500 text-xs mb-4">{new Date(t.start_date).toLocaleDateString()} • {t.status}</p>
                                     <div className="flex gap-4 text-xs font-bold text-gray-400">
                                         <span>Players: {t.current_participants}/{t.max_participants}</span>
                                         <span>Prize: {t.prize_pool}</span>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
                 
                 {activeSection === 'announcements' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedAnnouncement(null); setIsAnnouncementModalOpen(true); }} className="bg-blue-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">New Announcement</button>
                         <div className="space-y-4">
                             {announcements.map(a => (
                                 <div key={a.id} className="bg-[#1e232e] p-4 rounded-2xl border border-gray-800 flex justify-between items-center group">
                                     <div className="flex-1">
                                         <p className="text-white font-medium text-sm mb-1">{a.message}</p>
                                         <p className="text-[10px] text-gray-500 uppercase font-bold">{a.is_active ? 'Active' : 'Inactive'}</p>
                                     </div>
                                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => { setSelectedAnnouncement(a); setIsAnnouncementModalOpen(true); }}><Edit2 className="w-4 h-4 text-gray-400 hover:text-white"/></button>
                                         <button onClick={() => handleDelete('announcements', a.id, 'Announcement')}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
                 
                 {activeSection === 'lootBoxes' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedLootBox(null); setIsLootBoxModalOpen(true); }} className="bg-yellow-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">New Loot Box</button>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             {lootBoxes.map(box => (
                                 <div key={box.id} className="bg-[#1e232e] p-6 rounded-2xl border border-gray-800 text-center relative group">
                                     <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => { setSelectedLootBox(box); setIsLootBoxModalOpen(true); }}><Edit2 className="w-4 h-4 text-gray-400 hover:text-white"/></button>
                                         <button onClick={() => handleDelete('loot_boxes', box.id, box.name)}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                                     </div>
                                     <Package className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                                     <h3 className="font-black text-white uppercase italic">{box.name}</h3>
                                     <p className="text-yellow-400 font-bold mb-2">{box.price} DH</p>
                                     <p className="text-[10px] text-gray-500 uppercase font-bold">{box.potential_rewards}</p>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {activeSection === 'wheel' && (
                     <div className="space-y-6">
                         <button onClick={() => { setSelectedWheelItem(null); setIsWheelItemModalOpen(true); }} className="bg-pink-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2">New Segment</button>
                         <div className="space-y-3">
                             {wheelItems.map(item => (
                                 <div key={item.id} className="bg-[#1e232e] p-4 rounded-2xl border border-gray-800 flex items-center gap-4 group">
                                     <div className="w-4 h-4 rounded-full" style={{ background: item.color }}></div>
                                     <div className="flex-1">
                                         <p className="text-white font-bold text-sm">{item.text}</p>
                                         <p className="text-[10px] text-gray-500 uppercase font-bold">{item.probability}% Chance • {item.type} {item.value > 0 ? `(${item.value})` : ''}</p>
                                     </div>
                                     <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                         <button onClick={() => { setSelectedWheelItem(item); setIsWheelItemModalOpen(true); }}><Edit2 className="w-4 h-4 text-gray-400 hover:text-white"/></button>
                                         <button onClick={() => handleDelete('spin_wheel_items', item.id, item.text)}><Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500"/></button>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {activeSection === 'donations' && (
                     <div className="space-y-4">
                         {donations.map(d => (
                             <div key={d.id} className="bg-[#1e232e] p-4 rounded-2xl border border-gray-800 flex justify-between items-center">
                                 <div>
                                     <p className="text-white font-bold">{d.profile?.username || 'Guest'}</p>
                                     <p className="text-[10px] text-gray-500">{new Date(d.created_at).toLocaleString()}</p>
                                 </div>
                                 <p className="text-yellow-400 font-black italic text-lg">{d.amount.toFixed(2)} DH</p>
                             </div>
                         ))}
                     </div>
                 )}
                 </>
                 )}

             </div>
        </div>

        {/* Modals */}
        {visitHistoryOpen && <VisitHistoryModal logs={logs} onClose={() => setVisitHistoryOpen(false)} />}
        {selectedOrder && currentUserProfile && <AdminOrderModal order={selectedOrder} currentUser={currentUserProfile} onClose={() => setSelectedOrder(null)} />}
        {selectedRedemption && currentUserProfile && <AdminRedemptionModal redemption={selectedRedemption} currentUser={currentUserProfile} onClose={() => setSelectedRedemption(null)} />}
        
        {isProductModalOpen && <ProductFormModal product={selectedProduct} onClose={() => setIsProductModalOpen(false)} onSave={handleSaveProduct} />}
        {isBalanceModalOpen && selectedProfile && <BalanceEditorModal user={selectedProfile} onClose={() => setIsBalanceModalOpen(false)} onSave={handleSaveUserBalance} />}
        {isReferralModalOpen && selectedProfile && <ReferralEditorModal user={selectedProfile} onClose={() => setIsReferralModalOpen(false)} onSave={handleSaveReferral} />}
        {isCouponModalOpen && <CouponFormModal coupon={selectedCoupon} onClose={() => setIsCouponModalOpen(false)} onSave={handleSaveCoupon} />}
        {isPointProductModalOpen && <PointProductFormModal product={selectedPointProduct} onClose={() => setIsPointProductModalOpen(false)} onSave={handleSavePointProduct} />}
        {isTournamentModalOpen && <TournamentFormModal tournament={selectedTournament} onClose={() => setIsTournamentModalOpen(false)} onSave={handleSaveTournament} />}
        {isAnnouncementModalOpen && <AnnouncementFormModal announcement={selectedAnnouncement} onClose={() => setIsAnnouncementModalOpen(false)} onSave={handleSaveAnnouncement} />}
        {isLootBoxModalOpen && <LootBoxFormModal lootBox={selectedLootBox} onClose={() => setIsLootBoxModalOpen(false)} onSave={handleSaveLootBox} />}
        {isWheelItemModalOpen && <SpinWheelItemFormModal item={selectedWheelItem} onClose={() => setIsWheelItemModalOpen(false)} onSave={handleSaveWheelItem} />}
    </div>
  );
};
