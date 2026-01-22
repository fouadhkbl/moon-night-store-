import React, { useState } from 'react';
import { DollarSign, Loader2, Save, X, Check, Ticket, Globe, Monitor, Smartphone, Gamepad2, Layers, Coins, Trophy, Clock, Zap, Crown, Eye, EyeOff, Swords } from 'lucide-react';
import { Profile, Product, GameCategory, Coupon, PointProduct, Tournament } from '../../types';

export const BalanceEditorModal = ({ user, onClose, onSave }: { user: Profile, onClose: () => void, onSave: (id: string, amount: number, points: number) => void }) => {
  const [amount, setAmount] = useState<string>(user.wallet_balance.toString());
  const [points, setPoints] = useState<string>((user.discord_points || 0).toString());
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    // Parse values, defaulting to 0 if invalid/empty
    const finalAmount = parseFloat(amount) || 0;
    const finalPoints = parseInt(points) || 0;
    
    await onSave(user.id, finalAmount, finalPoints);
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

export const ProductFormModal = ({ product, onClose, onSave }: { product: Partial<Product> | null, onClose: () => void, onSave: (p: any) => void }) => {
  const [formData, setFormData] = useState<Partial<Product>>(product || {
    name: '',
    price: 0,
    category: GameCategory.ACCOUNTS,
    platform: 'PC',
    image_url: '',
    description: '',
    country: 'Global',
    is_trending: false,
    is_vip: false,
    is_hidden: false,
    stock: 999
  });
  const [isSaving, setIsSaving] = useState(false);
  const [customCountry, setCustomCountry] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const regions = ['Global', 'Africa', 'Europe', 'Asia', 'North America', 'South America', 'Morocco'];
  const platforms = ['PC', 'Mobile', 'Console', 'All Platforms'];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
          <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
            {product?.id ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Product Name</label>
            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price (DH)</label>
              <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock</label>
              <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.stock ?? 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
            </div>
          </div>

          {/* CATEGORY & PLATFORM */}
          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
              <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {(Object.values(GameCategory) as string[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Platform</label>
              <div className="relative">
                <select 
                    className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none appearance-none" 
                    value={formData.platform} 
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                >
                    {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-gray-500">
                    {formData.platform === 'PC' && <Monitor className="w-4 h-4" />}
                    {formData.platform === 'Mobile' && <Smartphone className="w-4 h-4" />}
                    {formData.platform === 'Console' && <Gamepad2 className="w-4 h-4" />}
                    {formData.platform === 'All Platforms' && <Layers className="w-4 h-4" />}
                </div>
              </div>
            </div>
          </div>

          {/* REGION / COUNTRY */}
          <div>
                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Region / Country</label>
                {customCountry ? (
                     <div className="flex gap-2">
                        <input 
                            type="text" 
                            className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                            value={formData.country} 
                            placeholder="Type Country..."
                            onChange={e => setFormData({...formData, country: e.target.value})} 
                        />
                        <button type="button" onClick={() => setCustomCountry(false)} className="px-3 bg-gray-800 rounded-lg hover:text-white text-gray-400"><X className="w-4 h-4"/></button>
                     </div>
                ) : (
                    <select 
                        className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
                        value={regions.includes(formData.country || 'Global') ? formData.country : 'Other'} 
                        onChange={e => {
                            if (e.target.value === 'Other') {
                                setCustomCountry(true);
                                setFormData({...formData, country: ''});
                            } else {
                                setFormData({...formData, country: e.target.value});
                            }
                        }}
                    >
                        {regions.map(r => <option key={r} value={r}>{r}</option>)}
                        <option value="Other">Specific Country...</option>
                    </select>
                )}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
            <input required type="url" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
            <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>

          {/* TRENDING, VIP & VISIBILITY TOGGLES */}
          <div className="pt-2">
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Product Highlights & Visibility</label>
            <div className="grid grid-cols-3 gap-3">
                <button
                    type="button"
                    onClick={() => setFormData({...formData, is_trending: !formData.is_trending})}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all active:scale-95 ${formData.is_trending ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-[#0b0e14] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                >
                    <Zap className={`w-6 h-6 ${formData.is_trending ? "fill-white" : ""}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Trending</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, is_vip: !formData.is_vip})}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all active:scale-95 ${formData.is_vip ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-400 text-black shadow-lg shadow-yellow-500/20' : 'bg-[#0b0e14] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                >
                    <Crown className={`w-6 h-6 ${formData.is_vip ? "fill-black" : ""}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest">VIP Trend</span>
                </button>
                <button
                    type="button"
                    onClick={() => setFormData({...formData, is_hidden: !formData.is_hidden})}
                    className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all active:scale-95 ${formData.is_hidden ? 'bg-red-900/20 border-red-500 text-red-500 shadow-lg' : 'bg-[#0b0e14] border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300'}`}
                >
                    {formData.is_hidden ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    <span className="text-[10px] font-black uppercase tracking-widest">{formData.is_hidden ? 'Hidden' : 'Visible'}</span>
                </button>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
          <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
          <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2">
            {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Item
          </button>
        </div>
      </div>
    </div>
  );
};

export const TournamentFormModal = ({ tournament, onClose, onSave }: { tournament: Partial<Tournament> | null, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<Partial<Tournament>>(tournament || {
        title: '',
        game_name: 'Among Us',
        description: '',
        image_url: '',
        start_date: new Date().toISOString(),
        status: 'open',
        entry_fee: 'Free',
        prize_pool: '50$ + Nitro',
        max_participants: 100,
        current_participants: 0,
        format: 'Solo',
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
            <div className="bg-[#1e232e] w-full max-w-2xl rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <div className="flex items-center gap-3">
                         <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400"><Swords className="w-5 h-5" /></div>
                         <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                             {tournament?.id ? 'Edit Tournament' : 'Create Tournament'}
                         </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Title</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Among Us Tournament" />
                        </div>
                         <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Game Name</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.game_name} onChange={e => setFormData({...formData, game_name: e.target.value})} placeholder="Among Us" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Prize Pool</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.prize_pool} onChange={e => setFormData({...formData, prize_pool: e.target.value})} placeholder="50$ + Nitro" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Entry Fee</label>
                            <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.entry_fee} onChange={e => setFormData({...formData, entry_fee: e.target.value})} placeholder="Free" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Start Date</label>
                            <input required type="date" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.start_date ? new Date(formData.start_date).toISOString().split('T')[0] : ''} onChange={e => setFormData({...formData, start_date: new Date(e.target.value).toISOString()})} />
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</label>
                             <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                                 <option value="open">Open</option>
                                 <option value="live">Live</option>
                                 <option value="past">Past</option>
                             </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Players</label>
                            <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.max_participants} onChange={e => setFormData({...formData, max_participants: parseInt(e.target.value)})} />
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Participants</label>
                             <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.current_participants} onChange={e => setFormData({...formData, current_participants: parseInt(e.target.value)})} />
                        </div>
                    </div>

                     <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
                        <input required type="url" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Short Description</label>
                        <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-20" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Rules</label>
                        <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-24" value={formData.rules} onChange={e => setFormData({...formData, rules: e.target.value})} placeholder="One rule per line"></textarea>
                    </div>

                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Tournament
                    </button>
                </div>
            </div>
        </div>
    );
};

export const PointProductFormModal = ({ product, onClose, onSave }: { product: Partial<PointProduct> | null, onClose: () => void, onSave: (p: any) => void }) => {
    const [formData, setFormData] = useState<Partial<PointProduct>>(product || {
        name: '',
        cost: 0,
        image_url: '',
        description: '',
        duration: '',
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
            <div className="bg-[#1e232e] w-full max-w-lg rounded-2xl overflow-hidden border border-gray-800 shadow-2xl animate-slide-up flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#151a23]">
                    <div className="flex items-center gap-3">
                         <div className="bg-purple-600/20 p-2 rounded-lg text-purple-400"><Trophy className="w-5 h-5" /></div>
                         <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                             {product?.id ? 'Edit Reward' : 'New Reward'}
                         </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition"><X /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Item Name</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Point Cost</label>
                        <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.cost} onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
                        <input required type="url" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Duration</label>
                             <input required type="text" placeholder="e.g. Lifetime" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} />
                         </div>
                         <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Advantage</label>
                             <input required type="text" placeholder="e.g. +20% EXP" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none" value={formData.advantage} onChange={e => setFormData({...formData, advantage: e.target.value})} />
                         </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
                        <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-purple-500 outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_active ? 'bg-green-600 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                            {formData.is_active && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white">Item Active</span>
                    </label>
                </form>

                <div className="p-6 border-t border-gray-800 bg-[#151a23] flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
                        {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Reward
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
        expires_at: null,
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
            <div className="bg-[#1e232e] w-full max-w-lg rounded-[2rem] border border-gray-800 shadow-2xl animate-slide-up">
                <div className="p-8 pb-0 text-center">
                     <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-purple-500 border border-purple-500/20">
                        <Ticket className="w-8 h-8" />
                     </div>
                     <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">
                         {coupon?.id ? 'Edit Coupon' : 'Create Coupon'}
                     </h2>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    <div>
                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Coupon Code</label>
                        <input required type="text" className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-4 text-white font-mono text-center uppercase tracking-widest focus:border-purple-500 outline-none" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="EXAMPLE20" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Type</label>
                             <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none text-xs font-bold" value={formData.discount_type} onChange={e => setFormData({...formData, discount_type: e.target.value as any})}>
                                 <option value="percent">Percent (%)</option>
                                 <option value="fixed">Fixed Amount</option>
                             </select>
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Value</label>
                             <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none" value={formData.discount_value} onChange={e => setFormData({...formData, discount_value: parseFloat(e.target.value)})} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Max Uses (Optional)</label>
                             <input type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none" value={formData.max_uses || ''} onChange={e => setFormData({...formData, max_uses: e.target.value ? parseInt(e.target.value) : null})} placeholder="Unlimited" />
                        </div>
                        <div>
                             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Expiration (Optional)</label>
                             <input type="date" className="w-full bg-[#0b0e14] border border-gray-800 rounded-xl p-3 text-white focus:border-purple-500 outline-none" value={formData.expires_at ? formData.expires_at.split('T')[0] : ''} onChange={e => setFormData({...formData, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null})} />
                        </div>
                    </div>

                    <label className="flex items-center justify-center gap-3 cursor-pointer group bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                        <input type="checkbox" className="hidden" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} />
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_active ? 'bg-green-600 border-green-500' : 'bg-gray-800 border-gray-700'}`}>
                           {formData.is_active && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-xs font-bold text-gray-400 group-hover:text-white uppercase tracking-widest">Active Status</span>
                    </label>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition">Cancel</button>
                        <button onClick={handleSubmit} disabled={isSaving} className="flex-1 bg-purple-600 text-white font-black py-3 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save className="w-4 h-4" />} Save Coupon
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};