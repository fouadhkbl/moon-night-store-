
import React, { useState } from 'react';
import { DollarSign, Loader2, Save, X, Check, Ticket, Globe, Monitor, Smartphone, Gamepad2, Layers, Coins, Trophy, Clock, Zap, Crown, Eye, EyeOff, Swords, Megaphone, Palette, Type, Package, RotateCw, PieChart, Image } from 'lucide-react';
import { Profile, Product, GameCategory, Coupon, PointProduct, Tournament, Announcement, LootBox, SpinWheelItem } from '../../types';

export const BalanceEditorModal = ({ user, onClose, onSave }: { user: Profile, onClose: () => void, onSave: (id: string, amount: number, points: number, spins: number) => void }) => {
  const [amount, setAmount] = useState<string>(user.wallet_balance.toString());
  const [points, setPoints] = useState<string>((user.discord_points || 0).toString());
  const [spins, setSpins] = useState<string>((user.spins_count || 0).toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const finalAmount = parseFloat(amount) || 0;
    const finalPoints = parseInt(points) || 0;
    const finalSpins = parseInt(spins) || 0;
    
    await onSave(user.id, finalAmount, finalPoints, finalSpins);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-sm rounded-[2rem] border border-gray-800 shadow-3xl p-8 animate-slide-up">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-500 border border-blue-500/20">
              <DollarSign className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit User Assets</h2>
           <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Updating {user.username}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">Wallet Balance (DH)</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-2xl font-black text-yellow-400 italic outline-none focus:border-yellow-500 transition-all shadow-inner placeholder-gray-700" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center flex items-center justify-center gap-2"><Coins className="w-3 h-3 text-purple-400" /> Discord Points</label>
            <input 
              required 
              type="number" 
              step="1" 
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-2xl font-black text-purple-400 italic outline-none focus:border-purple-500 transition-all shadow-inner placeholder-gray-700" 
              value={points} 
              onChange={e => setPoints(e.target.value)} 
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center flex items-center justify-center gap-2"><RotateCw className="w-3 h-3 text-pink-400" /> Bonus Spins</label>
            <input 
              required 
              type="number" 
              step="1" 
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-2xl font-black text-pink-400 italic outline-none focus:border-pink-500 transition-all shadow-inner placeholder-gray-700" 
              value={spins} 
              onChange={e => setSpins(e.target.value)} 
              placeholder="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
             <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition uppercase text-xs">Cancel</button>
             <button type="submit" disabled={isSaving} className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 uppercase text-xs shadow-xl shadow-blue-600/30">
               {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Update
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const ReferralEditorModal = ({ user, onClose, onSave }: { user: Profile, onClose: () => void, onSave: (id: string, code: string, earnings: number) => void }) => {
    const [code, setCode] = useState(user.referral_code || '');
    const [earnings, setEarnings] = useState<string>((user.referral_earnings || 0).toString());
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const finalEarnings = parseFloat(earnings) || 0;
        await onSave(user.id, code.toUpperCase(), finalEarnings);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-sm rounded-[2rem] border border-gray-800 shadow-3xl p-8 animate-slide-up">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-500 border border-green-500/20">
                        <Ticket className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit Referral Info</h2>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Affiliate: {user.username}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">Custom Referral Code</label>
                        <input 
                            required 
                            type="text" 
                            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-xl font-mono font-black text-white uppercase outline-none focus:border-green-500 transition-all shadow-inner placeholder-gray-700 tracking-widest" 
                            value={code} 
                            onChange={e => setCode(e.target.value)} 
                            placeholder="CODE123"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">Total Earnings (DH)</label>
                        <input 
                            required 
                            type="number" 
                            step="0.01" 
                            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-xl font-black text-green-400 italic outline-none focus:border-green-500 transition-all shadow-inner placeholder-gray-700" 
                            value={earnings} 
                            onChange={e => setEarnings(e.target.value)} 
                            placeholder="0.00"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-4 rounded-xl hover:bg-gray-700 transition uppercase text-xs">Cancel</button>
                        <button type="submit" disabled={isSaving} className="flex-1 bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2 uppercase text-xs shadow-xl shadow-green-600/30">
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ProductFormModal = ({ product, onClose, onSave }: { product: Partial<Product> | null, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>(product || {
        name: '',
        description: '',
        price: 0,
        category: GameCategory.ACCOUNTS,
        image_url: '',
        image_url_2: '',
        stock: 1,
        platform: 'All Platforms',
        country: 'Global',
        is_trending: false,
        is_vip: false,
        is_hidden: false
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-2xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                        {product?.id ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Product Name</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
                            <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                                {Object.values(GameCategory).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price (DH)</label>
                            <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock</label>
                            <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Platform</label>
                            <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})}>
                                <option value="All Platforms">All Platforms</option>
                                <option value="PC">PC</option>
                                <option value="Mobile">Mobile</option>
                                <option value="Console">Console</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL (Primary)</label>
                                <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} placeholder="https://..." />
                            </div>
                            <div className="w-24 h-24 bg-[#0b0e14] border border-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group relative mt-4">
                                {formData.image_url ? (
                                    <img 
                                        src={formData.image_url} 
                                        className="w-full h-full object-cover" 
                                        alt="Preview" 
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement?.classList.add('bg-red-900/20'); }} 
                                    />
                                ) : (
                                    <Image className="w-8 h-8 text-gray-700" />
                                )}
                                <div className="absolute inset-0 border-2 border-gray-800 rounded-xl pointer-events-none"></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL 2 (Backup)</label>
                                <input type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.image_url_2 || ''} onChange={e => setFormData({...formData, image_url_2: e.target.value})} placeholder="https://..." />
                            </div>
                            <div className="w-24 h-24 bg-[#0b0e14] border border-gray-800 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center group relative mt-4">
                                {formData.image_url_2 ? (
                                    <img 
                                        src={formData.image_url_2} 
                                        className="w-full h-full object-cover" 
                                        alt="Preview" 
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement?.classList.add('bg-red-900/20'); }} 
                                    />
                                ) : (
                                    <Image className="w-8 h-8 text-gray-700" />
                                )}
                                <div className="absolute inset-0 border-2 border-gray-800 rounded-xl pointer-events-none"></div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea required className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0b0e14] rounded-lg border border-gray-800">
                            <input type="checkbox" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} className="hidden" />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.is_trending ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-600'}`}>
                                {formData.is_trending && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs font-bold text-gray-400">Trending</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0b0e14] rounded-lg border border-gray-800">
                            <input type="checkbox" checked={formData.is_vip} onChange={e => setFormData({...formData, is_vip: e.target.checked})} className="hidden" />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.is_vip ? 'bg-yellow-600 border-yellow-500' : 'bg-gray-800 border-gray-600'}`}>
                                {formData.is_vip && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs font-bold text-gray-400">VIP Exclusive</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer p-3 bg-[#0b0e14] rounded-lg border border-gray-800">
                            <input type="checkbox" checked={formData.is_hidden} onChange={e => setFormData({...formData, is_hidden: e.target.checked})} className="hidden" />
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.is_hidden ? 'bg-red-600 border-red-500' : 'bg-gray-800 border-gray-600'}`}>
                                {formData.is_hidden && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <span className="text-xs font-bold text-gray-400">Hidden</span>
                        </label>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Product
                    </button>
                </div>
            </div>
        </div>
    );
};

export const CouponFormModal = ({ coupon, onClose, onSave }: { coupon: Partial<Coupon> | null, onClose: () => void, onSave: (c: any) => void }) => {
    const [formData, setFormData] = useState<Partial<Coupon>>(coupon || {
        code: '',
        discount_type: 'percent',
        discount_value: 0,
        max_uses: null,
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                        {coupon?.id ? 'Edit Coupon' : 'Create Coupon'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Coupon Code</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none uppercase font-mono tracking-widest" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="SAVE20" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Type</label>
                            <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value as any})}>
                                <option value="percent">Percentage (%)</option>
                                <option value="fixed">Fixed Amount (DH)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Value</label>
                            <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Uses (Leave empty for unlimited)</label>
                        <input type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.max_uses || ''} onChange={e => setFormData({...formData, max_uses: e.target.value ? parseInt(e.target.value) : null})} />
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="hidden" />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_active ? 'bg-green-600 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                            {formData.is_active && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">Active Status</span>
                    </label>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Coupon
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PointProductFormModal = ({ product, onClose, onSave }: { product: Partial<PointProduct> | null, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<Partial<PointProduct>>(product || {
        name: '',
        description: '',
        cost: 100,
        image_url: '',
        duration: 'Permanent',
        advantage: '',
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                        {product?.id ? 'Edit Reward' : 'Add Reward'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reward Name</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Cost (Points)</label>
                            <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.cost} onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Duration</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} placeholder="e.g. 1 Month" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Advantage / Benefit</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.advantage} onChange={e => setFormData({...formData, advantage: e.target.value})} placeholder="e.g. +10% XP Boost" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea required className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="hidden" />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_active ? 'bg-green-600 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                            {formData.is_active && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">Active Status</span>
                    </label>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-yellow-600 text-white font-black py-3 rounded-xl hover:bg-yellow-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Reward
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TournamentFormModal = ({ tournament, onClose, onSave }: { tournament: Partial<Tournament> | null, onClose: () => void, onSave: (t: any) => void }) => {
    const [formData, setFormData] = useState<Partial<Tournament>>(tournament || {
        title: '',
        game_name: '',
        description: '',
        image_url: '',
        start_date: '',
        status: 'open',
        max_participants: 12,
        current_participants: 0,
        prize_pool: '500 DH',
        prize_2nd: '',
        prize_3rd: '',
        format: '1v1 Single Elimination',
        rules: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-2xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                        {tournament?.id ? 'Edit Tournament' : 'Create Tournament'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Title</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Game Name</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.game_name} onChange={e => setFormData({...formData, game_name: e.target.value})} placeholder="e.g. Valorant" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</label>
                            <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                <option value="open">Open Registration</option>
                                <option value="live">Live Now</option>
                                <option value="past">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Start Date</label>
                            <input required type="datetime-local" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.start_date ? new Date(formData.start_date).toISOString().slice(0, 16) : ''} onChange={e => setFormData({...formData, start_date: new Date(e.target.value).toISOString()})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Players</label>
                            <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.current_participants} onChange={e => setFormData({...formData, current_participants: parseInt(e.target.value)})} placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Participants</label>
                            <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.max_participants} onChange={e => setFormData({...formData, max_participants: parseInt(e.target.value)})} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Game Format</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} placeholder="e.g. 1v1 Single Elimination" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Prize Pool (1st Place)</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.prize_pool} onChange={e => setFormData({...formData, prize_pool: e.target.value})} placeholder="e.g. 500 DH" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">2nd Place Prize</label>
                            <input type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.prize_2nd || ''} onChange={e => setFormData({...formData, prize_2nd: e.target.value})} placeholder="e.g. 200 DH" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">3rd Place Prize</label>
                            <input type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.prize_3rd || ''} onChange={e => setFormData({...formData, prize_3rd: e.target.value})} placeholder="e.g. 100 DH" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea required className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rules</label>
                        <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} placeholder="Enter rules, one per line..."></textarea>
                    </div>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Tournament
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AnnouncementFormModal = ({ announcement, onClose, onSave }: { announcement: Partial<Announcement> | null, onClose: () => void, onSave: (a: any) => void }) => {
    const [formData, setFormData] = useState<Partial<Announcement>>(announcement || {
        message: '',
        background_color: 'linear-gradient(to right, #1e3a8a, #581c87, #1e3a8a)',
        text_color: '#ffffff',
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <div className="flex items-center gap-3">
                         <div className="bg-indigo-600/20 p-2 rounded-lg text-indigo-400"><Megaphone className="w-5 h-5" /></div>
                         <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                             {announcement?.id ? 'Edit Announcement' : 'New Announcement'}
                         </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Message Text</label>
                        <textarea required className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-indigo-500 outline-none h-24" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} placeholder="Enter announcement text..."></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Palette className="w-3 h-3" /> Background</label>
                            <input type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white font-mono text-xs focus:border-indigo-500 outline-none" value={formData.background_color} onChange={e => setFormData({...formData, background_color: e.target.value})} placeholder="#hex or linear-gradient(...)" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Type className="w-3 h-3" /> Text Color</label>
                            <input type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white font-mono text-xs focus:border-indigo-500 outline-none" value={formData.text_color} onChange={e => setFormData({...formData, text_color: e.target.value})} placeholder="#ffffff" />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-gray-700" style={{ background: formData.background_color, color: formData.text_color }}>
                        <p className="text-center text-xs font-black uppercase tracking-widest">{formData.message || 'Preview Text'}</p>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_active ? 'bg-indigo-600 border-indigo-500' : 'bg-gray-800 border-gray-700'}`}>
                            {formData.is_active && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">Active Status</span>
                    </label>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export const LootBoxFormModal = ({ lootBox, onClose, onSave }: { lootBox: Partial<LootBox> | null, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<Partial<LootBox>>(lootBox || {
        name: '',
        price: 10,
        multiplier: 1,
        potential_rewards: '',
        icon_type: 'package',
        color: 'bg-blue-900/40',
        border_color: 'border-blue-500',
        glow_color: 'shadow-blue-500/20'
    });
    const [isSaving, setIsSaving] = useState(false);
    const [theme, setTheme] = useState('novice');

    React.useEffect(() => {
        if(lootBox?.color) {
            if(lootBox.color.includes('blue')) setTheme('novice');
            else if(lootBox.color.includes('purple')) setTheme('elite');
            else if(lootBox.color.includes('yellow')) setTheme('legend');
            else if(lootBox.color.includes('red')) setTheme('ruby');
            else if(lootBox.color.includes('green')) setTheme('emerald');
        }
    }, [lootBox]);

    const handleThemeChange = (t: string) => {
        setTheme(t);
        let colors = { color: '', border_color: '', glow_color: '' };
        switch(t) {
            case 'novice': 
                colors = { color: 'bg-blue-900/40', border_color: 'border-blue-500', glow_color: 'shadow-blue-500/20' };
                break;
            case 'elite':
                colors = { color: 'bg-purple-900/40', border_color: 'border-purple-500', glow_color: 'shadow-purple-500/20' };
                break;
            case 'legend':
                colors = { color: 'bg-yellow-900/40', border_color: 'border-yellow-500', glow_color: 'shadow-yellow-500/20' };
                break;
            case 'ruby':
                colors = { color: 'bg-red-900/40', border_color: 'border-red-500', glow_color: 'shadow-red-500/20' };
                break;
            case 'emerald':
                colors = { color: 'bg-green-900/40', border_color: 'border-green-500', glow_color: 'shadow-green-500/20' };
                break;
        }
        setFormData(prev => ({ ...prev, ...colors }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <div className="flex items-center gap-3">
                         <div className="bg-yellow-600/20 p-2 rounded-lg text-yellow-400"><Package className="w-5 h-5" /></div>
                         <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                             {lootBox?.id ? 'Edit Moon Pack' : 'Create Moon Pack'}
                         </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar max-h-[70vh]">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Pack Name</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. God Pack" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price (DH)</label>
                            <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reward Multiplier</label>
                            <input required type="number" step="0.1" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.multiplier} onChange={e => setFormData({...formData, multiplier: parseFloat(e.target.value)})} placeholder="e.g. 5" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Icon Style</label>
                             <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.icon_type} onChange={e => setFormData({...formData, icon_type: e.target.value})}>
                                 <option value="package">Package</option>
                                 <option value="zap">Lightning</option>
                                 <option value="trophy">Trophy</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Visual Theme</label>
                             <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={theme} onChange={e => handleThemeChange(e.target.value)}>
                                 <option value="novice">Blue (Novice)</option>
                                 <option value="elite">Purple (Elite)</option>
                                 <option value="legend">Yellow (Legend)</option>
                                 <option value="ruby">Red (Ruby)</option>
                                 <option value="emerald">Green (Emerald)</option>
                             </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Potential Rewards Text</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-yellow-500 outline-none" value={formData.potential_rewards} onChange={e => setFormData({...formData, potential_rewards: e.target.value})} placeholder="e.g. Win up to 500 DH" />
                    </div>

                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${formData.color} ${formData.border_color} ${formData.glow_color}`}>
                        <div className="w-10 h-10 flex items-center justify-center">
                            {formData.icon_type === 'package' && <Package className="w-6 h-6 text-white" />}
                            {formData.icon_type === 'zap' && <Zap className="w-6 h-6 text-white" />}
                            {formData.icon_type === 'trophy' && <Trophy className="w-6 h-6 text-white" />}
                        </div>
                        <div>
                            <p className="text-white font-black italic uppercase tracking-tighter">{formData.name || 'Pack Name'}</p>
                            <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{formData.potential_rewards || 'Rewards info'}</p>
                        </div>
                    </div>

                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-yellow-600 text-white font-black py-3 rounded-xl hover:bg-yellow-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Pack
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SpinWheelItemFormModal = ({ item, onClose, onSave }: { item: Partial<SpinWheelItem> | null, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<Partial<SpinWheelItem>>(item || {
        text: '',
        type: 'points',
        value: 0,
        color: '#8b5cf6',
        probability: 10,
        is_active: true
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(formData);
        setIsSaving(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#1e232e] w-full max-w-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <div className="flex items-center gap-3">
                         <div className="bg-pink-600/20 p-2 rounded-lg text-pink-400"><RotateCw className="w-5 h-5" /></div>
                         <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                             {item?.id ? 'Edit Segment' : 'New Segment'}
                         </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Display Text</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.text} onChange={e => setFormData({...formData, text: e.target.value})} placeholder="e.g. 100 Points" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reward Type</label>
                             <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>
                                 <option value="points">Points</option>
                                 <option value="money">Money (DH)</option>
                                 <option value="none">No Reward</option>
                             </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Reward Value</label>
                            <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} disabled={formData.type === 'none'} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><PieChart className="w-3 h-3" /> Probability (%)</label>
                            <input required type="number" step="0.1" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-pink-500 outline-none" value={formData.probability} onChange={e => setFormData({...formData, probability: parseFloat(e.target.value)})} placeholder="10" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Palette className="w-3 h-3" /> Segment Color</label>
                            <div className="flex gap-2">
                                <input type="color" className="h-10 w-10 rounded border-0 cursor-pointer" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                                <input type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white font-mono text-xs focus:border-pink-500 outline-none" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="#ffffff" />
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_active ? 'bg-green-600 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                            {formData.is_active && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">Active Status</span>
                    </label>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-pink-600 text-white font-black py-3 rounded-xl hover:bg-pink-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Segment
                    </button>
                </div>
            </div>
        </div>
    );
};
