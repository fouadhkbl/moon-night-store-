import React, { useState } from 'react';
import { DollarSign, Loader2, Save, X, Check } from 'lucide-react';
import { Profile, Product, GameCategory } from '../../../types';

export const BalanceEditorModal = ({ user, onClose, onSave }: { user: Profile, onClose: () => void, onSave: (id: string, amount: number) => void }) => {
  const [amount, setAmount] = useState(user.wallet_balance);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(user.id, amount);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-fade-in">
      <div className="bg-[#1e232e] w-full max-w-sm rounded-[2rem] border border-gray-800 shadow-3xl p-8 animate-slide-up">
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-yellow-500 border border-yellow-500/20">
              <DollarSign className="w-8 h-8" />
           </div>
           <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Edit Solde</h2>
           <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">Updating balance for {user.username}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">New Balance (DH)</label>
            <input 
              required 
              type="number" 
              step="0.01" 
              autoFocus
              className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-center text-3xl font-black text-yellow-400 italic outline-none focus:border-yellow-500 transition-all shadow-inner" 
              value={amount} 
              onChange={e => setAmount(parseFloat(e.target.value))} 
            />
          </div>
          <div className="flex gap-3">
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
    category: GameCategory.COINS,
    platform: 'PC',
    image_url: '',
    description: '',
    is_trending: false,
    stock: 999
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
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Price (DH)</label>
              <input required type="number" step="0.01" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Stock</label>
              <input required type="number" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.stock ?? 0} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Category</label>
              <select className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {(Object.values(GameCategory) as string[]).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Image URL</label>
            <input required type="url" className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Description</label>
            <textarea className="w-full bg-[#0b0e14] border border-gray-800 rounded-lg p-3 text-white focus:border-blue-500 outline-none h-24" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
          </div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="hidden" checked={formData.is_trending} onChange={e => setFormData({...formData, is_trending: e.target.checked})} />
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_trending ? 'bg-blue-600 border-blue-500' : 'bg-gray-800 border-gray-700'}`}>
              {formData.is_trending && <Check className="w-3 h-3 text-white" />}
            </div>
            <span className="text-xs font-bold text-gray-400 group-hover:text-white">Mark as Trending</span>
          </label>
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