import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { Product, Profile, Coupon, Order, OrderMessage, AccessLog, OrderItem, PointTransaction, PointProduct } from '../../types';
import { BarChart3, Package, Users, Search, Mail, Edit2, Trash2, PlusCircle, Wallet, ShoppingCart, Key, Ticket, ClipboardList, MessageSquare, Send, X, CheckCircle, Clock, Ban, Globe, Archive, Coins, ArrowRightLeft, Trophy } from 'lucide-react';
import { ProductFormModal, BalanceEditorModal, CouponFormModal, PointProductFormModal } from './AdminModals';

// --- VISITOR LOG MODAL ---
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

// --- ADMIN ORDER & CHAT MODAL ---
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
            // Fetch Messages
            const { data: msgData } = await supabase.from('order_messages').select('*').eq('order_id', order.id).order('created_at', { ascending: true });
            if (msgData) setMessages(msgData);
            
            // Fetch Order Items
            const { data: itemsData } = await supabase.from('order_items').select('*, product:products(*)').eq('order_id', order.id);
            if (itemsData) setItems(itemsData);

            scrollToBottom();
        };
        fetchDetails();

        const channel = supabase.channel(`admin_chat:${order.id}`)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_messages', filter: `order_id=eq.${order.id}` }, (payload) => {
                const newMsg = payload.new as OrderMessage;
                // De-dupe optimistic updates
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
        setNewMessage(''); // Clear input

        // Optimistic Update
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

        // Send to DB
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
                {/* Info Side */}
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

                    {/* ITEMS LIST */}
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
                                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">
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

                {/* Chat Side */}
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
  const [activeSection, setActiveSection] = useState<'stats' | 'products' | 'users' | 'coupons' | 'orders' | 'points' | 'pointsShop'>(role === 'shop' ? 'products' : 'stats');
  const [products, setProducts] = useState<Product[]>([]);
  const [pointProducts, setPointProducts] = useState<PointProduct[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pointTransactions, setPointTransactions] = useState<PointTransaction[]>([]);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [stats, setStats] = useState({ users: 0, orders: 0, revenue: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPointProductModalOpen, setIsPointProductModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isVisitsModalOpen, setIsVisitsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingPointProduct, setEditingPointProduct] = useState<Partial<PointProduct> | null>(null);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [providerFilter, setProviderFilter] = useState<'all' | 'email' | 'google' | 'discord'>('all');

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    // Fetch Products (Always visible)
    const { data: pData } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pData) setProducts(pData);
    
    // Fetch Point Products (Always visible)
    const { data: ppData } = await supabase.from('point_products').select('*').order('cost', { ascending: true });
    if (ppData) setPointProducts(ppData);

    // Fetch Profiles - Only for FULL admin
    if (role === 'full') {
        const { data: userData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (userData) setProfiles(userData);
    }

    // Fetch Coupons - Only for FULL admin
    if (role === 'full') {
        const { data: cData } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
        if (cData) setCoupons(cData);
    }
    
    // Fetch Point Transactions - Only for FULL admin
    if (role === 'full') {
        const { data: ptData } = await supabase
          .from('point_transactions')
          .select('*, profile:profiles(email, username)')
          .order('created_at', { ascending: false });
        if (ptData) setPointTransactions(ptData);
    }

    // Fetch Orders - For Full and Limited (Not Shop Only)
    if (role !== 'shop') {
        const { data: oData } = await supabase.from('orders').select('*, profile:profiles(*)').order('created_at', { ascending: false });
        if (oData) setOrders(oData);
        
        // Calculate Revenue manually from orders fetched
        const totalRevenue = oData?.reduce((acc, curr) => curr.status !== 'canceled' ? acc + Number(curr.total_amount) : acc, 0) || 0;
        
        // Fetch Real Stats
        const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
        const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
        
        setStats({ users: userCount || 0, orders: orderCount || 0, revenue: totalRevenue });
    }
    
    // Fetch Daily Logs - For Full and Limited (Not Shop Only)
    if (role !== 'shop') {
        const today = new Date();
        today.setHours(0,0,0,0);
        const { data: lData } = await supabase
            .from('access_logs')
            .select('*')
            .gte('created_at', today.toISOString())
            .order('created_at', { ascending: false });
        if (lData) setLogs(lData);
    }

    setIsLoading(false);
  }, [role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- PRODUCT HANDLERS ---
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('WARNING: Are you sure you want to delete this product forever?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) {
      addToast('Deleted', 'Item permanently removed.', 'success');
      fetchData();
    } else {
      addToast('Error', error.message, 'error');
    }
  };

  const handleDeleteAllProducts = async () => {
    if (!window.confirm('DANGER: This will delete ALL products from the database. This action cannot be undone. Are you sure?')) return;
    
    if (!window.confirm('Are you absolutely sure? This will wipe the entire inventory.')) return;

    // Delete products with price > -1 (matches all items)
    const { error } = await supabase.from('products').delete().gt('price', -1);
    
    if (!error) {
      addToast('Cleared', 'All inventory deleted.', 'success');
      fetchData();
    } else {
      addToast('Error', error.message, 'error');
    }
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (productData.id) {
        const { error } = await supabase.from('products').update(productData).eq('id', productData.id);
        if (error) throw error;
        addToast('Updated', 'Inventory synced.', 'success');
      } else {
        const { error } = await supabase.from('products').insert(productData);
        if (error) throw error;
        addToast('Created', 'Added to shop.', 'success');
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (err: any) {
      addToast('Error', err.message, 'error');
    }
  };

  // --- POINT PRODUCT HANDLERS (NEW) ---
  const handleSavePointProduct = async (productData: Partial<PointProduct>) => {
      try {
          if (productData.id) {
              const { error } = await supabase.from('point_products').update(productData).eq('id', productData.id);
              if (error) throw error;
              addToast('Updated', 'Points reward updated.', 'success');
          } else {
              const { error } = await supabase.from('point_products').insert(productData);
              if (error) throw error;
              addToast('Created', 'Points reward created.', 'success');
          }
          setIsPointProductModalOpen(false);
          setEditingPointProduct(null);
          fetchData();
      } catch (err: any) {
          addToast('Error', err.message, 'error');
      }
  };

  const handleDeletePointProduct = async (id: string) => {
      if (!window.confirm('Are you sure you want to remove this reward?')) return;
      const { error } = await supabase.from('point_products').delete().eq('id', id);
      if (!error) {
          addToast('Deleted', 'Reward removed.', 'success');
          fetchData();
      } else {
          addToast('Error', error.message, 'error');
      }
  };

  // --- USER HANDLERS ---
  const handleUpdateBalance = async (userId: string, newBalance: number, newPoints: number) => {
    const { error } = await supabase.from('profiles').update({ 
        wallet_balance: newBalance,
        discord_points: newPoints
    }).eq('id', userId);

    if (!error) {
      addToast('Success', 'User assets updated.', 'success');
      setEditingUser(null);
      fetchData();
    } else {
      addToast('Error', error.message, 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
      // Check for ACTIVE (Pending) orders only
      const userOrders = orders.filter(o => o.user_id === userId);
      const hasActiveOrders = userOrders.some(o => o.status === 'pending');
      
      if (hasActiveOrders) {
          addToast("Blocked", "User has Active/Pending orders. Cancel them first to proceed.", "error");
          return;
      }

      // Warning message logic for History (Completed/Canceled)
      let warningMessage = 'DANGER: This will delete the user profile and wallet balance. Continue?';
      if (userOrders.length > 0) {
          warningMessage = `WARNING: This user has ${userOrders.length} Completed/Canceled order(s). \n\nDeleting this user will PERMANENTLY delete their entire order history and revenue data. \n\nAre you sure?`;
      }

      if (!window.confirm(warningMessage)) return;
      
      // Manual Cascade: Delete orders first
      if (userOrders.length > 0) {
          const { error: orderError } = await supabase.from('orders').delete().eq('user_id', userId);
          if (orderError) {
             console.warn("Manual order delete failed, relying on DB cascade:", orderError);
          }
      }

      const { error } = await supabase.from('profiles').delete().eq('id', userId);
      
      if (error) {
          if (error.message.includes("violates foreign key constraint")) {
              addToast('Database Error', 'Please run the updated "db_setup.sql" in Supabase Query Editor to fix foreign key constraints.', 'error');
          } else {
              addToast('Error', 'Could not delete user: ' + error.message, 'error');
          }
      } else {
          addToast('Deleted', 'User profile removed.', 'success');
          fetchData();
      }
  };

  // --- COUPON HANDLERS ---
  const handleSaveCoupon = async (couponData: Partial<Coupon>) => {
      try {
          if (couponData.id) {
              const { error } = await supabase.from('coupons').update(couponData).eq('id', couponData.id);
              if (error) throw error;
              addToast('Updated', 'Coupon updated.', 'success');
          } else {
              const { error } = await supabase.from('coupons').insert(couponData);
              if (error) throw error;
              addToast('Created', 'Coupon created.', 'success');
          }
          setIsCouponModalOpen(false);
          setEditingCoupon(null);
          fetchData();
      } catch (err: any) {
          addToast('Error', err.message, 'error');
      }
  };

  const handleDeleteCoupon = async (id: string) => {
      if (!window.confirm('Delete this coupon?')) return;
      const { error } = await supabase.from('coupons').delete().eq('id', id);
      if (!error) {
          addToast('Deleted', 'Coupon removed.', 'success');
          fetchData();
      }
  };

  // --- POINT TRANSACTION HANDLERS ---
  const handleDeletePointTransaction = async (id: string) => {
      if (!window.confirm('Are you sure you want to delete this conversion history log? This does not revert the balance.')) return;
      
      // Optimistic update: Remove from UI immediately
      setPointTransactions(prev => prev.filter(pt => pt.id !== id));

      const { error } = await supabase.from('point_transactions').delete().eq('id', id);
      
      if (!error) {
          addToast('Deleted', 'Transaction log removed.', 'success');
          fetchData(); 
      } else {
          addToast('Error', error.message, 'error');
          fetchData(); 
      }
  };

  // --- FILTERS ---
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPointProducts = pointProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = profiles.filter(u => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (providerFilter === 'all') return matchesSearch;
    return matchesSearch && u.auth_provider === providerFilter;
  });
  
  const filteredCoupons = coupons.filter(c => c.code.includes(searchQuery.toUpperCase()));

  const filteredOrders = orders.filter(o => 
      o.id.includes(searchQuery) || 
      o.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPoints = pointTransactions.filter(pt => 
      pt.profile?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.profile?.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const ProviderIcon = ({ provider }: { provider?: string }) => {
    if (provider === 'google') return (
      <svg className="w-3 h-3" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
    );
    if (provider === 'discord') return (
      <svg className="w-3 h-3 fill-[#5865F2]" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z"/></svg>
    );
    return <Mail className="w-3 h-3 text-gray-500" />;
  };

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in max-w-7xl pb-24">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">ADMIN <span className="text-blue-500">CONTROL</span></h1>
          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">
             {role === 'full' ? 'Master Admin • Full Access' : role === 'shop' ? 'Shop Admin • Inventory Access' : 'Moderator Access • Restricted'}
          </p>
        </div>
        
        <div className="flex w-full md:w-auto bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto scrollbar-hide">
          {role !== 'shop' && (
            <button onClick={() => setActiveSection('stats')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'stats' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                <BarChart3 className="w-4 h-4" /> Stats
            </button>
          )}
          {role !== 'shop' && (
            <button onClick={() => setActiveSection('orders')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'orders' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                <ClipboardList className="w-4 h-4" /> Orders
            </button>
          )}
          <button onClick={() => setActiveSection('products')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'products' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <Package className="w-4 h-4" /> Shop
          </button>
          <button onClick={() => setActiveSection('pointsShop')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'pointsShop' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
            <Trophy className="w-4 h-4" /> Points Shop
          </button>
          {role === 'full' && (
              <>
                <button onClick={() => setActiveSection('users')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                    <Users className="w-4 h-4" /> Users
                </button>
                <button onClick={() => setActiveSection('coupons')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'coupons' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                    <Ticket className="w-4 h-4" /> Coupons
                </button>
                <button onClick={() => setActiveSection('points')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest whitespace-nowrap ${activeSection === 'points' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>
                    <ArrowRightLeft className="w-4 h-4" /> Conversions
                </button>
              </>
          )}
        </div>
      </div>

      {activeSection === 'stats' && role !== 'shop' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 animate-slide-up">
           <div 
             className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-cyan-500/30 transition-all cursor-pointer active:scale-95"
             onClick={() => setIsVisitsModalOpen(true)}
           >
              <Globe className="text-cyan-400 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Visits Today</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{logs.length}</h3>
              <p className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-1"><PlusCircle className="w-3 h-3" /> View Log</p>
           </div>
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-blue-500/30 transition-all">
              <Users className="text-blue-500 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Registered Gamers</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stats.users}</h3>
           </div>
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-yellow-500/30 transition-all">
              <Wallet className="text-yellow-400 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Real Cash Volume</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stats.revenue.toFixed(2)} <span className="text-sm">DH</span></h3>
           </div>
           <div className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl hover:border-purple-500/30 transition-all">
              <ShoppingCart className="text-purple-500 mb-6 w-8 h-8" />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Total Sales</p>
              <h3 className="text-4xl font-black text-white italic tracking-tighter">{stats.orders}</h3>
           </div>
        </div>
      )}

      {activeSection === 'orders' && role !== 'shop' && (
          <div className="space-y-6 animate-slide-up">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search orders by ID or User..." 
                  className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all shadow-xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
             </div>

             <div className="bg-[#1e232e] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                 {filteredOrders.length === 0 ? <p className="text-center py-12 text-gray-500 font-black uppercase tracking-widest">No orders found</p> : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#151a23] text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                                <tr>
                                    <th className="p-6">Order ID</th>
                                    <th className="p-6">User</th>
                                    <th className="p-6">Amount</th>
                                    <th className="p-6">Date</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredOrders.map(o => (
                                    <tr key={o.id} className="hover:bg-[#151a23] transition-colors">
                                        <td className="p-6 font-mono text-xs text-blue-400">{o.id.slice(0,8)}...</td>
                                        <td className="p-6 text-white font-bold text-xs">{o.profile?.username || 'Unknown'}</td>
                                        <td className="p-6 font-black text-yellow-400 italic text-sm">{o.total_amount.toFixed(2)} DH</td>
                                        <td className="p-6 text-gray-500 text-xs font-mono">{new Date(o.created_at).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                                o.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                                                o.status === 'canceled' ? 'bg-red-500/10 text-red-500' : 
                                                'bg-yellow-500/10 text-yellow-500'
                                            }`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <button 
                                              onClick={() => setSelectedOrder(o)}
                                              className="bg-purple-600/20 hover:bg-purple-600 text-purple-400 hover:text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-purple-500/30"
                                            >
                                                Manage / Chat
                                            </button>
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

      {activeSection === 'products' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
             <div className="relative flex-1">
                <input 
                  type="text" 
                  placeholder="Filter inventory..." 
                  className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none transition-all shadow-xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
             </div>
             
             <div className="flex gap-2">
                 {role === 'full' && (
                    <button 
                        onClick={handleDeleteAllProducts}
                        className="bg-red-900/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-500/20 font-black px-6 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest whitespace-nowrap"
                    >
                        <Trash2 className="w-5 h-5" /> Wipe All
                    </button>
                 )}
                 <button 
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest whitespace-nowrap"
                 >
                    <PlusCircle className="w-5 h-5" /> Add Product
                 </button>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
             {filteredProducts.map(p => (
                <div key={p.id} className="bg-[#1e232e] rounded-3xl border border-gray-800 p-5 shadow-2xl flex flex-col group hover:border-blue-500/30 transition-all">
                   <div className="flex gap-4 mb-6 items-start">
                      <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover border border-gray-700 shadow-lg" alt="" />
                      <div className="min-w-0 flex-1">
                         <h3 className="text-white font-black italic truncate leading-tight mb-2 uppercase tracking-tighter text-lg">{p.name}</h3>
                         <div className="flex gap-2 flex-wrap mb-2">
                            <span className="px-2 py-1 rounded-lg bg-blue-600/10 text-blue-400 text-[8px] font-black uppercase border border-blue-500/20">{p.category}</span>
                            <span className="px-2 py-1 rounded-lg bg-gray-800 text-gray-300 text-[8px] font-black uppercase border border-gray-700">Stock: {p.stock}</span>
                         </div>
                         <p className="text-xl font-black text-yellow-400 italic tracking-tighter mt-1">{p.price.toFixed(2)} DH</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-3 mt-auto">
                      <button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-gray-700">
                         <Edit2 className="w-4 h-4" /> Edit
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/30 text-red-500 font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-red-500/20">
                         <Trash2 className="w-4 h-4" /> Delete
                      </button>
                   </div>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeSection === 'pointsShop' && (
          <div className="space-y-6 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch">
                  <div className="relative flex-1">
                      <input 
                          type="text" 
                          placeholder="Search rewards..." 
                          className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all shadow-xl"
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                  </div>
                  <button 
                      onClick={() => { setEditingPointProduct(null); setIsPointProductModalOpen(true); }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest whitespace-nowrap"
                  >
                      <PlusCircle className="w-5 h-5" /> New Reward
                  </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredPointProducts.map(p => (
                      <div key={p.id} className={`bg-[#1e232e] rounded-3xl border border-gray-800 p-5 shadow-2xl flex flex-col group hover:border-purple-500/30 transition-all ${!p.is_active ? 'opacity-50 grayscale' : ''}`}>
                          <div className="flex gap-4 mb-6 items-start">
                              <img src={p.image_url} className="w-20 h-20 rounded-2xl object-cover border border-gray-700 shadow-lg" alt="" />
                              <div className="min-w-0 flex-1">
                                  <h3 className="text-white font-black italic truncate leading-tight mb-2 uppercase tracking-tighter text-lg">{p.name}</h3>
                                  <p className="text-xl font-black text-purple-400 italic tracking-tighter mt-1">{p.cost} PTS</p>
                                  <div className="mt-2 text-[9px] text-gray-400 font-mono flex gap-2">
                                     <span>{p.duration}</span>
                                     <span>•</span>
                                     <span>{p.advantage}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="grid grid-cols-2 gap-3 mt-auto">
                              <button onClick={() => { setEditingPointProduct(p); setIsPointProductModalOpen(true); }} className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-gray-700">
                                  <Edit2 className="w-4 h-4" /> Edit
                              </button>
                              <button onClick={() => handleDeletePointProduct(p.id)} className="flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/30 text-red-500 font-black py-4 rounded-2xl transition-all text-[10px] uppercase tracking-widest border border-red-500/20">
                                  <Trash2 className="w-4 h-4" /> Delete
                              </button>
                          </div>
                      </div>
                  ))}
                  {filteredPointProducts.length === 0 && (
                      <div className="col-span-full py-20 text-center text-gray-500 font-black uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-3xl">No rewards created.</div>
                  )}
              </div>
          </div>
      )}

      {activeSection === 'users' && role === 'full' && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
             <div className="relative flex-1 w-full md:w-auto">
                <input 
                    type="text" 
                    placeholder="Search players by email or username..." 
                    className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-blue-500 outline-none shadow-xl"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
             </div>
             
             <div className="flex gap-2 bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 shadow-xl overflow-x-auto scrollbar-hide flex-shrink-0">
                <button onClick={() => setProviderFilter('all')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${providerFilter === 'all' ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-white'}`}>All</button>
                <button onClick={() => setProviderFilter('email')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${providerFilter === 'email' ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-500 hover:text-white'}`}><Mail className="w-3 h-3" /> Email</button>
                <button onClick={() => setProviderFilter('google')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${providerFilter === 'google' ? 'bg-white/10 text-white border border-white/20' : 'text-gray-500 hover:text-white'}`}><ProviderIcon provider="google" /> Google</button>
                <button onClick={() => setProviderFilter('discord')} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${providerFilter === 'discord' ? 'bg-[#5865F2]/20 text-[#5865F2] border border-[#5865F2]/30' : 'text-gray-500 hover:text-white'}`}><ProviderIcon provider="discord" /> Discord</button>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {filteredUsers.map(u => (
                <div key={u.id} className="bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-2xl flex flex-col gap-4 hover:border-purple-500/30 transition-all group relative overflow-hidden">
                   <div className="absolute top-4 right-4">
                      <div className="p-2 bg-[#0b0e14] rounded-xl border border-gray-800 shadow-lg" title={`Signed up via ${u.auth_provider}`}><ProviderIcon provider={u.auth_provider} /></div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#0b0e14] shadow-lg flex-shrink-0"><img src={u.avatar_url} className="w-full h-full object-cover" alt="" /></div>
                      <div className="min-w-0 flex-1 pr-8">
                         <h3 className="text-white font-black italic uppercase tracking-tighter truncate">{u.username || 'Anon User'}</h3>
                         <p className="text-gray-500 text-[10px] font-bold truncate">{u.email}</p>
                         {u.password && (
                           <div className="flex items-center gap-2 mt-1"><Key className="w-3 h-3 text-red-500" /><p className="text-red-400 text-[10px] font-mono tracking-widest truncate">{u.password}</p></div>
                         )}
                      </div>
                   </div>
                   <div className="bg-[#0b0e14] p-4 rounded-2xl border border-gray-800 space-y-3">
                      <div className="flex justify-between items-end">
                          <div>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Solde</p>
                              <p className="text-lg font-black text-yellow-400 italic tracking-tighter leading-none mt-1">{u.wallet_balance.toFixed(2)} DH</p>
                          </div>
                          <div>
                              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest text-right">Points</p>
                              <p className="text-lg font-black text-purple-400 italic tracking-tighter leading-none mt-1 text-right">{u.discord_points || 0}</p>
                          </div>
                      </div>
                      <div className="flex gap-2 pt-2 border-t border-gray-800">
                          <button onClick={() => setEditingUser(u)} className="flex-1 p-3 bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-blue-500/20 shadow-lg active:scale-90 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest"><Edit2 className="w-4 h-4" /> Edit Assets</button>
                          <button onClick={() => handleDeleteUser(u.id)} className="p-3 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all border border-red-500/20 shadow-lg active:scale-90"><Trash2 className="w-4 h-4" /></button>
                      </div>
                   </div>
                </div>
             ))}
          </div>
          {filteredUsers.length === 0 && (<div className="py-20 text-center"><Users className="w-16 h-16 text-gray-700 mx-auto mb-4" /><p className="text-gray-500 font-black uppercase tracking-widest">No matching players found.</p></div>)}
        </div>
      )}

      {activeSection === 'coupons' && role === 'full' && (
          <div className="space-y-6 animate-slide-up">
              <div className="flex justify-between items-center gap-4">
                   <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Search coupons..." 
                            className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all shadow-xl"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
                   </div>
                   <button 
                        onClick={() => { setEditingCoupon(null); setIsCouponModalOpen(true); }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl uppercase text-xs tracking-widest"
                    >
                        <PlusCircle className="w-5 h-5" /> Create Coupon
                   </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCoupons.map(coupon => (
                      <div key={coupon.id} className={`bg-[#1e232e] p-6 rounded-3xl border border-gray-800 shadow-xl flex flex-col justify-between hover:border-purple-500/40 transition-all ${!coupon.is_active ? 'opacity-50 grayscale' : ''}`}>
                          <div className="flex justify-between items-start mb-4">
                               <div>
                                   <div className="bg-[#0b0e14] border border-gray-800 rounded-lg px-3 py-1 inline-block mb-2">
                                        <span className="font-mono text-purple-400 font-black tracking-widest">{coupon.code}</span>
                                   </div>
                                   <p className="text-2xl font-black text-white italic tracking-tighter">
                                       {coupon.discount_type === 'percent' ? `${coupon.discount_value}% OFF` : `-${coupon.discount_value} DH`}
                                   </p>
                               </div>
                               <Ticket className="w-8 h-8 text-purple-600" />
                          </div>
                          
                          <div className="space-y-2 mb-6">
                               <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-gray-800 pb-2">
                                   <span>Uses</span>
                                   <span className="text-white">{coupon.usage_count} / {coupon.max_uses || '∞'}</span>
                               </div>
                               <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                                   <span>Expires</span>
                                   <span className={coupon.expires_at && new Date(coupon.expires_at) < new Date() ? "text-red-400" : "text-white"}>
                                       {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : 'Never'}
                                   </span>
                               </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-auto">
                              <button onClick={() => { setEditingCoupon(coupon); setIsCouponModalOpen(true); }} className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest border border-gray-700">
                                  <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button onClick={() => handleDeleteCoupon(coupon.id)} className="flex items-center justify-center gap-2 bg-red-900/10 hover:bg-red-900/30 text-red-500 font-black py-3 rounded-xl transition-all text-[10px] uppercase tracking-widest border border-red-500/20">
                                  <Trash2 className="w-3 h-3" /> Delete
                              </button>
                          </div>
                      </div>
                  ))}
                  {filteredCoupons.length === 0 && (
                      <div className="col-span-full py-10 text-center text-gray-500 font-black uppercase tracking-widest border-2 border-dashed border-gray-800 rounded-3xl">No coupons found.</div>
                  )}
              </div>
          </div>
      )}

      {activeSection === 'points' && role === 'full' && (
          <div className="space-y-6 animate-slide-up">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search by User Email or Username..." 
                  className="w-full bg-[#1e232e] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-purple-500 outline-none transition-all shadow-xl"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-500" />
             </div>

             <div className="bg-[#1e232e] rounded-3xl border border-gray-800 overflow-hidden shadow-2xl">
                 {filteredPoints.length === 0 ? <p className="text-center py-12 text-gray-500 font-black uppercase tracking-widest">No conversion history found</p> : (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#151a23] text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-800">
                                <tr>
                                    <th className="p-6">Date</th>
                                    <th className="p-6">User Email</th>
                                    <th className="p-6">Username</th>
                                    <th className="p-6">Points Deducted</th>
                                    <th className="p-6">Amount Added (DH)</th>
                                    <th className="p-6">Status</th>
                                    <th className="p-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filteredPoints.map(pt => (
                                    <tr key={pt.id} className="hover:bg-[#151a23] transition-colors">
                                        <td className="p-6 font-mono text-xs text-gray-500">{new Date(pt.created_at).toLocaleString()}</td>
                                        <td className="p-6 text-white font-bold text-xs">{pt.profile?.email || 'N/A'}</td>
                                        <td className="p-6 text-gray-400 text-xs">{pt.profile?.username || 'Unknown'}</td>
                                        <td className="p-6 font-black text-purple-400 italic text-sm">-{pt.points_amount} Pts</td>
                                        <td className="p-6 font-black text-green-400 italic text-sm">+{pt.money_equivalent.toFixed(2)} DH</td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                                                pt.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/30' : 
                                                'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                                            }`}>
                                                {pt.status}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button 
                                                onClick={() => handleDeletePointTransaction(pt.id)}
                                                className="bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white p-2 rounded-lg transition-all shadow-lg border border-red-500/20"
                                                title="Delete Log"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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

      {isProductModalOpen && (activeSection === 'products') && (
        <ProductFormModal 
          product={editingProduct} 
          onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} 
          onSave={handleSaveProduct} 
        />
      )}
      
      {isPointProductModalOpen && (activeSection === 'pointsShop') && (
        <PointProductFormModal 
          product={editingPointProduct} 
          onClose={() => { setIsPointProductModalOpen(false); setEditingPointProduct(null); }} 
          onSave={handleSavePointProduct} 
        />
      )}
      
      {isCouponModalOpen && (activeSection === 'coupons') && role === 'full' && (
          <CouponFormModal 
             coupon={editingCoupon}
             onClose={() => { setIsCouponModalOpen(false); setEditingCoupon(null); }}
             onSave={handleSaveCoupon}
          />
      )}

      {isVisitsModalOpen && (
          <VisitHistoryModal logs={logs} onClose={() => setIsVisitsModalOpen(false)} />
      )}

      {editingUser && role === 'full' && (
        <BalanceEditorModal 
          user={editingUser} 
          onClose={() => setEditingUser(null)} 
          onSave={handleUpdateBalance} 
        />
      )}

      {selectedOrder && (
          <AdminOrderModal
            order={selectedOrder}
            currentUser={role === 'full' && profiles.find(p => p.id === session.user.id) ? profiles.find(p => p.id === session.user.id)! : { id: 'admin-mod', username: 'Moderator', email: 'mod@system', wallet_balance: 0, vip_level: 0, vip_points: 0, discord_points: 0, avatar_url: '' }} 
            onClose={() => { setSelectedOrder(null); fetchData(); }}
          />
      )}
    </div>
  );
};