
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, Profile, Coupon, Order, AccessLog, OrderItem, PointRedemption, RedemptionMessage, Donation, Tournament, LootBox, SpinWheelItem, OrderMessage, PointProduct } from '../../types';
import { 
  BarChart3, Package, Users, Search, Edit2, Trash2, PlusCircle, Wallet, 
  ClipboardList, MessageSquare, Send, X, CheckCircle, Clock, Globe, 
  Archive, Trophy, Gift, Eye, Heart, Swords, Save, Crown, Zap, 
  RotateCw, Loader2, Megaphone, Activity, Ticket, ShieldAlert, Key, 
  ChevronRight, Smartphone, Monitor
} from 'lucide-react';
import { 
  ProductFormModal, BalanceEditorModal, CouponFormModal, PointProductFormModal, 
  TournamentFormModal, ReferralEditorModal, LootBoxFormModal, SpinWheelItemFormModal 
} from './AdminModals';

const AdminOrderModal = ({ order, currentUser, onClose }: { order: Order, currentUser: Profile, onClose: () => void }) => {
    const [messages, setMessages] = useState<OrderMessage[]>([]);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [status, setStatus] = useState(order.status);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

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
                setMessages(prev => prev.some(m => m.id === newMsg.id) ? prev : [...prev, newMsg]);
                scrollToBottom();
            })
            .subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [order.id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        const msgText = newMessage.trim();
        setNewMessage(''); 
        const { data } = await supabase.from('order_messages').insert({ order_id: order.id, sender_id: currentUser.id, message: msgText }).select().single();
        if (data) setMessages(prev => [...prev, data]);
    };

    const handleUpdateStatus = async (newStatus: string) => {
        await supabase.from('orders').update({ status: newStatus }).eq('id', order.id);
        setStatus(newStatus);
    };

    return (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-5xl rounded-[2.5rem] border border-white/5 shadow-3xl flex flex-col md:flex-row overflow-hidden h-[85vh]">
                <div className="w-full md:w-5/12 p-6 bg-[#151a23] border-r border-white/5 overflow-y-auto custom-scrollbar">
                    <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" /> Order #{order.id.slice(0, 8)}
                    </h3>
                    <div className="space-y-4">
                        <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Customer Identity</p>
                            <p className="text-white font-bold text-sm truncate">{order.profile?.username || 'Unknown'}</p>
                            <p className="text-gray-500 text-[10px] truncate">{order.profile?.email}</p>
                        </div>
                        <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Status Control</p>
                            <div className="flex gap-2">
                                {['pending', 'completed', 'canceled'].map(s => (
                                    <button key={s} onClick={() => handleUpdateStatus(s)} className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${status === s ? 'bg-blue-600 text-white shadow-lg' : 'bg-white/5 text-gray-500 hover:text-white'}`}>{s}</button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Inventory Manifest</p>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id} className="flex gap-3 items-center bg-white/5 p-2 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-900 shrink-0 border border-white/10">
                                            <img src={item.product?.image_url} className="w-full h-full object-cover" alt="" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-white font-bold text-[10px] truncate uppercase">{item.product?.name || 'Item Removed'}</p>
                                            <p className="text-yellow-400 font-bold text-[9px]">QTY: {item.quantity} • {item.price_at_purchase.toFixed(2)} DH</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="mt-8 w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition uppercase text-[10px] font-black tracking-widest">Terminate View</button>
                </div>
                <div className="w-full md:w-7/12 flex flex-col h-full bg-[#1e232e]">
                    <div className="p-4 border-b border-white/5 bg-[#1e232e] flex justify-between items-center">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-500"/> Core Sync Channel</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b0e14]/40 custom-scrollbar">
                         {messages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.sender_id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.sender_id === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#151a23] text-white border border-white/5 rounded-tl-none'}`}>{msg.message}</div>
                             </div>
                         ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#1e232e] flex gap-2">
                        <input type="text" className="flex-1 bg-[#0b0e14] border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500" placeholder="Type transmission..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-xl transition-all active:scale-95" disabled={!newMessage.trim()}><Send className="w-4 h-4" /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const AdminPanel = ({ session, addToast, role }: { session: any, addToast: any, role: 'full' | 'limited' | 'shop' }) => {
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users' | 'orders' | 'coupons' | 'pointsShop' | 'redemptions' | 'liveFeed' | 'wheel' | 'lootBoxes' | 'donations' | 'tournaments'>(role === 'shop' ? 'products' : 'stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
        if (session?.user?.id) {
            const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            if (data) setCurrentUserProfile(data);
        }
    };
    fetchUser();
  }, [session]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
        if (activeSection === 'stats') {
            const { data: revenueData } = await supabase.from('orders').select('total_amount').eq('status', 'completed');
            if (revenueData) setTotalRevenue(revenueData.reduce((sum, o) => sum + Number(o.total_amount), 0));
        } else if (activeSection === 'products') {
            const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
            if (data) setProducts(data);
        } else if (activeSection === 'users') {
            const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (data) setProfiles(data);
        } else if (activeSection === 'orders') {
            const { data } = await supabase.from('orders').select('*, profile:profiles(*)').order('created_at', { ascending: false });
            if (data) setOrders(data);
        }
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [activeSection]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (table: string, id: string, name: string) => {
    if (!window.confirm(`Permanently delete ${name}?`)) return;
    await supabase.from(table).delete().eq('id', id);
    addToast('Entry Purged', 'Database record deleted.', 'success');
    fetchData();
  };

  const navItems = [
    { id: 'stats', label: 'Dashboard', icon: BarChart3, role: ['full', 'limited'] },
    { id: 'products', label: 'Inventory', icon: Package, role: ['full', 'limited', 'shop'] },
    { id: 'orders', label: 'Trades', icon: ClipboardList, role: ['full', 'limited'] },
    { id: 'users', label: 'Operators', icon: Users, role: ['full'] },
    { id: 'coupons', label: 'Coupons', icon: Ticket, role: ['full'] },
    { id: 'liveFeed', label: 'Live Feed', icon: Activity, role: ['full'] },
    { id: 'wheel', label: 'Win Wheel', icon: RotateCw, role: ['full'] },
    { id: 'donations', label: 'Donations', icon: Heart, role: ['full'] },
  ];

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden">
        <style>{`
            .gold-metallic {
                background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 45%, #b38728 70%, #fbf5b7 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
        `}</style>

        {/* Sidebar */}
        <div className="w-20 md:w-64 bg-[#1e232e] border-r border-white/5 flex flex-col flex-shrink-0">
             <div className="p-6 border-b border-white/5 flex items-center gap-3">
                 <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black italic shadow-[0_0_15px_rgba(37,99,235,0.4)]">M</div>
                 <span className="text-white font-black italic text-lg hidden md:block uppercase tracking-tighter">ADMIN <span className="text-blue-500">CORE</span></span>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                 {navItems.filter(i => i.role.includes(role)).map(item => (
                     <button key={item.id} onClick={() => setActiveSection(item.id as any)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all group ${activeSection === item.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
                         <item.icon className={`w-4 h-4 flex-shrink-0 ${activeSection === item.id ? 'text-white' : 'group-hover:text-blue-400'}`} />
                         <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{item.label}</span>
                     </button>
                 ))}
             </div>
             <div className="p-4 bg-[#151a23]/50 border-t border-white/5">
                 <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-gray-800 border border-white/10 overflow-hidden shrink-0">
                         <img src={currentUserProfile?.avatar_url} className="w-full h-full object-cover" alt="" />
                     </div>
                     <div className="hidden md:block min-w-0">
                         <p className="text-[10px] font-black text-white truncate uppercase italic">{currentUserProfile?.username}</p>
                         <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Master Auth</p>
                     </div>
                 </div>
             </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
             <div className="h-16 border-b border-white/5 bg-[#1e232e] px-6 flex items-center justify-between flex-shrink-0 relative z-10">
                 <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                     {navItems.find(i => i.id === activeSection)?.label || 'Console'}
                 </h2>
                 {['products', 'users', 'orders'].includes(activeSection) && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                        <input 
                            type="text" 
                            placeholder="Global Filter..." 
                            className="bg-[#0b0e14] border border-white/5 rounded-xl pl-9 pr-4 py-2 text-[10px] font-bold text-white uppercase tracking-widest focus:outline-none focus:border-blue-500 w-48 md:w-64 transition-all"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                 )}
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] relative">
                 {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-500">
                         <Loader2 className="w-10 h-10 animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Querying Database...</span>
                     </div>
                 ) : (
                     <div className="animate-fade-in max-w-7xl mx-auto">
                         {activeSection === 'stats' && (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                     <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Wallet className="w-20 h-20" /></div>
                                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Verified Revenue</p>
                                     <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-1">{totalRevenue.toFixed(2)}</h3>
                                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DIRHAM (MAD)</p>
                                 </div>
                                 {/* More stat cards can be added here */}
                             </div>
                         )}

                         {activeSection === 'products' && (
                             <div className="space-y-6">
                                 <button onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
                                     <PlusCircle className="w-4 h-4" /> Add Inventory Item
                                 </button>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                     {products.filter(p => (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                                         <div key={product.id} className="bg-[#1e232e] rounded-3xl border border-white/5 overflow-hidden group hover:border-blue-500/50 transition-all flex flex-col shadow-xl">
                                             <div className="relative h-44 bg-black overflow-hidden">
                                                 <img src={product.image_url} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt="" />
                                                 <div className="absolute top-2 right-2 flex gap-1.5">
                                                     <button onClick={() => { setSelectedProduct(product); setIsProductModalOpen(true); }} className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-blue-600 transition-all"><Edit2 className="w-3 h-3"/></button>
                                                     <button onClick={() => handleDelete('products', product.id, product.name)} className="p-2 bg-black/60 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-all"><Trash2 className="w-3 h-3"/></button>
                                                 </div>
                                                 <div className="absolute bottom-3 left-3 flex gap-1">
                                                     {product.is_vip && <span className="bg-yellow-500 text-black text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Elite</span>}
                                                     {product.is_trending && <span className="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded uppercase">Hot</span>}
                                                 </div>
                                             </div>
                                             <div className="p-5 flex-1 flex flex-col">
                                                 <p className="text-[8px] text-blue-400 font-black uppercase tracking-widest mb-1">{product.category}</p>
                                                 <h4 className="text-white font-black text-[11px] uppercase italic tracking-tighter mb-4 line-clamp-1">{product.name}</h4>
                                                 <div className="mt-auto flex justify-between items-center">
                                                     <span className="text-yellow-400 font-black italic text-lg tracking-tighter">{product.price.toFixed(2)} DH</span>
                                                     <span className="text-[8px] font-black text-gray-500 uppercase">Stock: {product.stock}</span>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         )}

                         {activeSection === 'users' && (
                             <div className="bg-[#1e232e] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                                 <div className="overflow-x-auto">
                                     <table className="w-full text-left">
                                         <thead className="bg-[#151a23] text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/5">
                                             <tr>
                                                 <th className="p-5">Operator</th>
                                                 <th className="p-5">Wallet (MAD)</th>
                                                 <th className="p-5">Discord Points</th>
                                                 <th className="p-5">Rank XP</th>
                                                 <th className="p-5 text-right">Actions</th>
                                             </tr>
                                         </thead>
                                         <tbody className="divide-y divide-white/5">
                                             {profiles.filter(u => 
                                                 (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                                 (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
                                             ).map(user => (
                                                 <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                     <td className="p-5">
                                                         <div className="flex items-center gap-3">
                                                             <div className="w-9 h-9 rounded-xl bg-gray-800 border border-white/10 overflow-hidden flex items-center justify-center text-xs font-black text-white italic shadow-lg">
                                                                 {user.avatar_url ? <img src={user.avatar_url} className="w-full h-full object-cover" alt=""/> : user.username?.charAt(0)}
                                                             </div>
                                                             <div className="min-w-0">
                                                                 <p className="text-white font-black text-[11px] uppercase italic truncate">{user.username}</p>
                                                                 <p className="text-gray-500 text-[9px] truncate font-bold">{user.email}</p>
                                                             </div>
                                                         </div>
                                                     </td>
                                                     <td className="p-5 font-black text-green-400 text-sm tracking-tighter italic">{user.wallet_balance.toFixed(2)}</td>
                                                     <td className="p-5 font-black text-purple-400 text-sm tracking-tighter italic">{user.discord_points.toLocaleString()}</td>
                                                     <td className="p-5">
                                                         <div className="flex items-center gap-2">
                                                             <span className="text-[10px] font-black text-blue-400 uppercase italic">LVL {Math.floor((user.vip_points || 0) / 1000) + 1}</span>
                                                             {user.vip_level > 0 && <Crown className="w-3 h-3 text-yellow-500" />}
                                                         </div>
                                                     </td>
                                                     <td className="p-5 text-right">
                                                         <button onClick={() => { setSelectedProfile(user); setIsBalanceModalOpen(true); }} className="p-2.5 bg-white/5 rounded-xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-90">
                                                             <Wallet className="w-4 h-4" />
                                                         </button>
                                                     </td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             </div>
                         )}

                         {activeSection === 'orders' && (
                             <div className="space-y-4">
                                 {orders.filter(o => 
                                     o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                     (o.profile?.username || '').toLowerCase().includes(searchTerm.toLowerCase())
                                 ).map(order => (
                                     <div key={order.id} className="bg-[#1e232e] p-6 rounded-[2rem] border border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-blue-500/30 transition-all shadow-xl">
                                         <div className="flex items-center gap-6">
                                             <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                                                 order.status === 'completed' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                                                 order.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 
                                                 'bg-red-500/10 border-red-500/20 text-red-500'
                                             }`}>
                                                 <Zap className="w-6 h-6" />
                                             </div>
                                             <div>
                                                 <p className="text-white font-black italic uppercase tracking-tighter text-lg leading-none mb-1.5">Trade ID #{order.id.slice(0, 8)}</p>
                                                 <div className="flex items-center gap-4">
                                                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</span>
                                                     <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded border ${
                                                         order.status === 'completed' ? 'text-green-500 border-green-500/20' : 'text-yellow-500 border-yellow-500/20'
                                                     }`}>{order.status}</span>
                                                     <span className="text-[9px] text-blue-400 font-black uppercase italic">{order.profile?.username}</span>
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                                             <div className="text-left md:text-right">
                                                 <p className="text-yellow-400 font-black italic text-2xl tracking-tighter leading-none">{order.total_amount.toFixed(2)} DH</p>
                                                 <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest mt-1">Paid via {order.payment_method || 'System'}</p>
                                             </div>
                                             <button onClick={() => setSelectedOrder(order)} className="p-4 bg-white/5 rounded-2xl text-gray-400 hover:text-white hover:bg-blue-600 transition-all shadow-xl group/btn">
                                                 <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                             </button>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}
                     </div>
                 )}
             </div>
        </div>

        {/* Modals */}
        {selectedOrder && currentUserProfile && (
            <AdminOrderModal order={selectedOrder} currentUser={currentUserProfile} onClose={() => setSelectedOrder(null)} />
        )}
        {isProductModalOpen && (
            <ProductFormModal product={selectedProduct} onClose={() => setIsProductModalOpen(false)} onSave={async (formData) => {
                if (selectedProduct?.id) await supabase.from('products').update(formData).eq('id', selectedProduct.id);
                else await supabase.from('products').insert(formData);
                setIsProductModalOpen(false); fetchData(); addToast('Manifest Updated', 'Inventory updated.', 'success');
            }} />
        )}
        {isBalanceModalOpen && selectedProfile && (
            <BalanceEditorModal user={selectedProfile} onClose={() => setIsBalanceModalOpen(false)} onSave={async (id, amount, points, spins) => {
                await supabase.from('profiles').update({ wallet_balance: amount, discord_points: points, spins_count: spins }).eq('id', id);
                setIsBalanceModalOpen(false); fetchData(); addToast('Balance Synced', 'User assets updated.', 'success');
            }} />
        )}
    </div>
  );
};
