
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, Profile, Coupon, Order, AccessLog, OrderItem, PointRedemption, Donation, Tournament, LootBox, SpinWheelItem, OrderMessage, PointProduct, AppSetting, TournamentApplication, TournamentRequirement } from '../../types';
import { 
  BarChart3, Package, Users, Search, Edit2, Trash2, PlusCircle, Wallet, 
  ClipboardList, MessageSquare, Send, X, CheckCircle, Clock, Globe, 
  Archive, Trophy, Gift, Eye, Heart, Swords, Save, Crown, Zap, 
  RotateCw, Loader2, Megaphone, Activity, Ticket, ShieldAlert, Key, 
  ChevronRight, Smartphone, Monitor, Settings, Palette, Timer, AlertTriangle, Terminal, MonitorSmartphone,
  RefreshCw, MousePointer2, UserCheck, FileText, Settings2
} from 'lucide-react';
import { 
  ProductFormModal, BalanceEditorModal, CouponFormModal, PointProductFormModal, 
  TournamentFormModal, ReferralEditorModal, LootBoxFormModal, SpinWheelItemFormModal,
  RequirementEditorModal
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
                                 <div className={`max-w-[85%] p-3 rounded-2xl text-xs ${msg.sender_id === currentUser.id ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#151a23] text-gray-200 border border-white/5 rounded-tl-none'}`}>{msg.message}</div>
                             </div>
                         ))}
                         <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#1e232e] flex gap-2">
                        <input type="text" className="flex-1 bg-[#0b0e14] border border-white/5 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500" placeholder="Type transmission..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition-all active:scale-95" disabled={!newMessage.trim()}><Send className="w-4 h-4" /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export const AdminPanel = ({ session, addToast, role }: { session: any, addToast: any, role: 'full' | 'limited' | 'shop' }) => {
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users' | 'orders' | 'coupons' | 'pointsShop' | 'redemptions' | 'liveFeed' | 'wheel' | 'lootBoxes' | 'donations' | 'tournaments' | 'apps' | 'settings' | 'auditLogs'>(role === 'shop' ? 'products' : 'stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [pointProducts, setPointProducts] = useState<PointProduct[]>([]);
  const [redemptions, setRedemptions] = useState<PointRedemption[]>([]);
  const [wheelItems, setWheelItems] = useState<SpinWheelItem[]>([]);
  const [lootBoxes, setLootBoxes] = useState<LootBox[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [applications, setApplications] = useState<TournamentApplication[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);

  // Marquee Local States
  const [announceText, setAnnounceText] = useState('');
  const [announceBadge, setAnnounceBadge] = useState('');
  const [announceColor, setAnnounceColor] = useState('#2563eb');
  const [announceSpeed, setAnnounceSpeed] = useState('30s');
  const [isSavingAnnounce, setIsSavingAnnounce] = useState(false);

  // Modal States
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  
  const [selectedCoupon, setSelectedCoupon] = useState<Partial<Coupon> | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedPointProduct, setSelectedPointProduct] = useState<Partial<PointProduct> | null>(null);
  const [isPointProductModalOpen, setIsPointProductModalOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Partial<Tournament> | null>(null);
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [selectedLootBox, setSelectedLootBox] = useState<Partial<LootBox> | null>(null);
  const [isLootBoxModalOpen, setIsLootBoxModalOpen] = useState(false);
  const [selectedWheelItem, setSelectedWheelItem] = useState<Partial<SpinWheelItem> | null>(null);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isRequirementModalOpen, setIsRequirementModalOpen] = useState(false);
  const [targetTournamentId, setTargetTournamentId] = useState<string | null>(null);

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
        } else if (activeSection === 'coupons') {
            const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
            if (data) setCoupons(data);
        } else if (activeSection === 'pointsShop') {
            const { data } = await supabase.from('point_products').select('*').order('cost', { ascending: true });
            if (data) setPointProducts(data);
        } else if (activeSection === 'redemptions') {
            const { data } = await supabase.from('point_redemptions').select('*, profile:profiles(*), point_product:point_products(*)').order('created_at', { ascending: false });
            if (data) setRedemptions(data);
        } else if (activeSection === 'wheel') {
            const { data } = await supabase.from('spin_wheel_items').select('*').order('probability', { ascending: false });
            if (data) setWheelItems(data);
        } else if (activeSection === 'lootBoxes') {
            const { data } = await supabase.from('loot_boxes').select('*').order('price', { ascending: true });
            if (data) setLootBoxes(data);
        } else if (activeSection === 'donations') {
            const { data } = await supabase.from('donations').select('*, profile:profiles(*)').order('created_at', { ascending: false });
            if (data) setDonations(data);
        } else if (activeSection === 'tournaments') {
            const { data } = await supabase.from('tournaments').select('*').order('start_date', { ascending: false });
            if (data) setTournaments(data);
        } else if (activeSection === 'apps') {
            const { data } = await supabase.from('tournament_applications').select('*, tournament:tournaments(*), profile:profiles(*)').order('created_at', { ascending: false });
            if (data) setApplications(data);
        } else if (activeSection === 'auditLogs') {
            const { data } = await supabase.from('access_logs').select('*, profile:profiles(username, email)').order('created_at', { ascending: false }).limit(200);
            if (data) setAccessLogs(data);
        } else if (activeSection === 'settings' || activeSection === 'liveFeed') {
            const { data } = await supabase.from('app_settings').select('*').order('key', { ascending: true });
            if (data) {
                setAppSettings(data);
                if (activeSection === 'liveFeed') {
                    setAnnounceText(data.find(s => s.key === 'live_feed_text')?.value || '');
                    setAnnounceBadge(data.find(s => s.key === 'live_feed_badge')?.value || '');
                    setAnnounceColor(data.find(s => s.key === 'live_feed_color')?.value || '#2563eb');
                    setAnnounceSpeed(data.find(s => s.key === 'live_feed_speed')?.value || '30s');
                }
            }
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

  const handleUpdateAppStatus = async (id: string, status: string) => {
      const msg = prompt("Add a status update message (optional):", "");
      await supabase.from('tournament_applications').update({ status, admin_message: msg }).eq('id', id);
      addToast('Application Updated', `Status changed to ${status}.`, 'info');
      fetchData();
  };

  const handleSaveAnnounce = async () => {
    setIsSavingAnnounce(true);
    try {
        await supabase.from('app_settings').update({ value: announceText }).eq('key', 'live_feed_text');
        await supabase.from('app_settings').update({ value: announceBadge }).eq('key', 'live_feed_badge');
        await supabase.from('app_settings').update({ value: announceColor }).eq('key', 'live_feed_color');
        await supabase.from('app_settings').update({ value: announceSpeed }).eq('key', 'live_feed_speed');
        addToast('Broadcast Updated', 'Live feed settings deployed.', 'success');
    } catch (e) {
        addToast('Sync Error', 'Failed to update announce.', 'error');
    } finally {
        setIsSavingAnnounce(false);
    }
  };

  const navItems = [
    { id: 'stats', label: 'Dashboard', icon: BarChart3, role: ['full', 'limited'] },
    { id: 'products', label: 'Inventory', icon: Package, role: ['full', 'limited', 'shop'] },
    { id: 'orders', label: 'Trades', icon: ClipboardList, role: ['full', 'limited'] },
    { id: 'users', label: 'Operators', icon: Users, role: ['full'] },
    { id: 'coupons', label: 'Coupons', icon: Ticket, role: ['full'] },
    { id: 'pointsShop', label: 'Rewards', icon: Trophy, role: ['full'] },
    { id: 'redemptions', label: 'Point Queue', icon: Clock, role: ['full'] },
    { id: 'liveFeed', label: 'Announce', icon: Megaphone, role: ['full'] },
    { id: 'tournaments', label: 'Events', icon: Swords, role: ['full'] },
    { id: 'apps', label: 'Applicants', icon: UserCheck, role: ['full'] },
    { id: 'wheel', label: 'Win Wheel', icon: RotateCw, role: ['full'] },
    { id: 'lootBoxes', label: 'Packs', icon: Package, role: ['full'] },
    { id: 'donations', label: 'Donations', icon: Heart, role: ['full'] },
    { id: 'auditLogs', label: 'Audit Logs', icon: Terminal, role: ['full'] },
    { id: 'settings', label: 'Core Config', icon: Settings, role: ['full'] },
  ];

  return (
    <div className="flex h-screen bg-[#0b0e14] overflow-hidden">
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
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
             <div className="h-16 border-b border-white/5 bg-[#1e232e] px-6 flex items-center justify-between flex-shrink-0 relative z-10">
                 <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                     {navItems.find(i => i.id === activeSection)?.label || 'Console'}
                 </h2>
             </div>

             <div className="flex-1 overflow-y-auto p-6 bg-[#0b0e14] relative">
                 {isLoading ? (
                     <div className="flex flex-col items-center justify-center h-full gap-4 text-blue-500">
                         <Loader2 className="w-10 h-10 animate-spin" />
                         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Querying Database...</span>
                     </div>
                 ) : (
                     <div className="animate-fade-in max-w-7xl mx-auto pb-20">
                         {activeSection === 'stats' && (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 <div className="bg-[#1e232e] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative overflow-hidden group">
                                     <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:rotate-12 transition-transform duration-700"><Wallet className="w-20 h-20" /></div>
                                     <p className="text-[9px] font-black text-blue-400 uppercase tracking-[0.3em] mb-3">Verified Revenue</p>
                                     <h3 className="text-5xl font-black text-white italic tracking-tighter leading-none mb-1">{totalRevenue.toFixed(2)}</h3>
                                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">DIRHAM (MAD)</p>
                                 </div>
                             </div>
                         )}

                         {activeSection === 'tournaments' && (
                             <div className="space-y-6">
                                <button onClick={() => { setSelectedTournament(null); setIsTournamentModalOpen(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl active:scale-95 transition-all">
                                    <PlusCircle className="w-4 h-4" /> Launch Tournament
                                </button>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {tournaments.map(t => (
                                        <div key={t.id} className="bg-[#1e232e] p-6 rounded-[2.5rem] border border-white/5 flex gap-6 group hover:border-blue-500/30 transition-all shadow-xl">
                                            <div className="w-32 h-32 rounded-3xl overflow-hidden bg-gray-900 border border-white/5 shrink-0">
                                                <img src={t.image_url} className="w-full h-full object-cover opacity-60" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="text-lg font-black text-white italic uppercase truncate">{t.title}</h3>
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => { setTargetTournamentId(t.id); setIsRequirementModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-green-400" title="Manage Requirements"><Settings2 className="w-3.5 h-3.5"/></button>
                                                        <button onClick={() => { setSelectedTournament(t); setIsTournamentModalOpen(true); }} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-blue-400"><Edit2 className="w-3.5 h-3.5"/></button>
                                                        <button onClick={() => handleDelete('tournaments', t.id, t.title)} className="p-2 bg-white/5 rounded-lg text-gray-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5"/></button>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase mb-4">{t.game_name} • {new Date(t.start_date).toLocaleDateString()}</p>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">Prize Pool</p>
                                                        <p className="text-yellow-400 font-black italic">{t.prize_pool}</p>
                                                    </div>
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${t.status === 'open' ? 'text-green-500 border-green-500/20' : 'text-gray-500 border-white/5'}`}>{t.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                         )}

                         {activeSection === 'apps' && (
                             <div className="bg-[#1e232e] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
                                <table className="w-full text-left">
                                    <thead className="bg-[#151a23] text-gray-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                                        <tr>
                                            <th className="p-5">Applicant</th>
                                            <th className="p-5">Tournament</th>
                                            <th className="p-5">Submission Date</th>
                                            <th className="p-5">Status</th>
                                            <th className="p-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {applications.map(app => (
                                            <tr key={app.id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-800"><img src={app.profile?.avatar_url} className="w-full h-full object-cover" alt="" /></div>
                                                        <div>
                                                            <p className="text-white font-black text-[11px] uppercase italic truncate">{app.profile?.username}</p>
                                                            <p className="text-gray-500 text-[8px] font-bold truncate uppercase">Partner Rank: LVL {Math.floor((app.profile?.vip_points || 0) / 1000) + 1}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <p className="text-blue-400 font-black text-[11px] uppercase italic">{app.tournament?.title}</p>
                                                </td>
                                                <td className="p-5 text-gray-400 text-[10px] font-bold">{new Date(app.created_at).toLocaleDateString()}</td>
                                                <td className="p-5">
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${app.status === 'approved' ? 'text-green-500 border-green-500/20' : app.status === 'pending' ? 'text-yellow-500 border-yellow-500/20' : 'text-red-500 border-red-500/20'}`}>{app.status}</span>
                                                </td>
                                                <td className="p-5 text-right flex gap-2 justify-end">
                                                    <button onClick={() => alert(JSON.stringify(app.form_data, null, 2))} className="p-2 bg-white/5 text-gray-400 rounded-lg hover:text-white"><FileText className="w-3.5 h-3.5"/></button>
                                                    <button onClick={() => handleUpdateAppStatus(app.id, 'approved')} className="p-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20 hover:bg-green-500 hover:text-white transition-all"><CheckCircle className="w-3.5 h-3.5"/></button>
                                                    <button onClick={() => handleUpdateAppStatus(app.id, 'rejected')} className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"><X className="w-3.5 h-3.5"/></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                         )}

                         {/* ... (rest of the sections remain the same) */}
                     </div>
                 )}
             </div>
        </div>

        {/* Modals */}
        {isRequirementModalOpen && targetTournamentId && (
            <RequirementEditorModal tournamentId={targetTournamentId} onClose={() => setIsRequirementModalOpen(false)} />
        )}
        {/* ... (other modals) */}
        {isTournamentModalOpen && (
            <TournamentFormModal tournament={selectedTournament} onClose={() => setIsTournamentModalOpen(false)} onSave={async (data) => {
                if (selectedTournament?.id) await supabase.from('tournaments').update(data).eq('id', selectedTournament.id);
                else await supabase.from('tournaments').insert(data);
                setIsTournamentModalOpen(false); fetchData(); addToast('Event Broadcasted', 'Tournament details saved.', 'success');
            }} />
        )}
    </div>
  );
};
