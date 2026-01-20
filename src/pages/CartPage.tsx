import React, { useState, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import { CartItem } from '../types';
import { Check, Receipt, ShoppingCart, ArrowLeft, Minus, Plus, ChevronRight, Loader2, Trash2 } from 'lucide-react';

export const CartPage = ({ cart, session, onUpdateQty, onRemove, onNavigate, onClearCart, addToast }: { 
  cart: CartItem[], 
  session: any,
  onUpdateQty: (id: string, delta: number) => void, 
  onRemove: (id: string) => void, 
  onNavigate: (p: string) => void,
  onClearCart: () => void,
  addToast: any
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const total = useMemo(() => cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0), [cart]);
  const isGuest = session?.user?.id === 'guest-user-123';

  const handleCheckout = async () => {
    if (isGuest) {
      addToast('Auth Required', 'Please login or signup to complete your order.', 'error');
      onNavigate('dashboard');
      return;
    }

    setIsProcessing(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: session.user.id,
          total_amount: total,
          status: 'completed',
          payment_method: 'PayPal'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product?.price || 0
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      setShowSuccess(true);
      onClearCart();
    } catch (err: any) {
      addToast('Checkout Failed', err.message || 'There was an error processing your payment.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 border border-green-500/50 animate-bounce-slow">
          <Check className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white italic mb-4">PAYMENT SUCCESSFUL!</h2>
        <p className="text-gray-400 mb-10 max-w-md mx-auto">Your epic loot is being delivered instantly to your game account. Check your orders for details.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => onNavigate('dashboard')} className="bg-[#1e232e] border border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            <Receipt className="w-5 h-5" /> View Orders
          </button>
          <button onClick={() => onNavigate('shop')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
             Continue Shopping <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-24 h-24 bg-[#1e232e] rounded-full flex items-center justify-center mx-auto mb-8 text-gray-600 border border-gray-800">
          <ShoppingCart className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black text-white italic mb-4 uppercase tracking-tighter leading-none">Cart is Empty</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Explore the shop to find gear.</p>
        <button 
          onClick={() => onNavigate('shop')}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-105 active:scale-95 shadow-2xl shadow-blue-600/30 uppercase tracking-tighter"
        >
          Browse Shop
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in max-w-6xl pb-32 md:pb-12">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => onNavigate('shop')} className="p-2 bg-[#1e232e] border border-gray-800 rounded-lg text-gray-400 hover:text-white transition">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">MY <span className="text-blue-500">CART</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-[#1e232e] rounded-3xl border border-gray-800 p-5 md:p-6 flex gap-4 md:gap-6 items-center shadow-2xl">
              <div className="w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src={item.product?.image_url} alt={item.product?.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white font-black text-sm md:text-xl italic truncate leading-none mb-2 uppercase tracking-tighter">{item.product?.name}</h3>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">{item.product?.category} • {item.product?.platform}</p>
                  </div>
                  <button onClick={() => onRemove(item.id)} className="p-2 text-gray-500 hover:text-red-500 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex justify-between items-end mt-4">
                  <div className="text-yellow-400 font-black italic text-lg md:text-2xl tracking-tighter">
                    {item.product?.price.toFixed(2)} DH
                  </div>
                  <div className="flex items-center gap-3 bg-[#0b0e14] px-3 py-2 rounded-xl border border-gray-800">
                    <button onClick={() => onUpdateQty(item.id, -1)} className="text-gray-400 hover:text-blue-500 transition p-1"><Minus className="w-4 h-4" /></button>
                    <span className="text-white font-black w-6 text-center text-sm md:text-base">{item.quantity}</span>
                    <button onClick={() => onUpdateQty(item.id, 1)} className="text-gray-400 hover:text-blue-500 transition p-1"><Plus className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="hidden lg:block bg-[#1e232e] rounded-[2rem] border border-gray-800 p-8 shadow-2xl sticky top-24">
          <h2 className="text-xl font-black text-white italic mb-6 border-b border-gray-800 pb-4 uppercase tracking-tighter">Order Totals</h2>
          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-gray-400">
              <span className="font-bold text-[10px] uppercase tracking-widest">Subtotal</span>
              <span className="font-mono">{total.toFixed(2)} DH</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span className="font-bold text-[10px] uppercase tracking-widest">Fee</span>
              <span className="font-mono">0.00 DH</span>
            </div>
            <div className="pt-4 border-t border-gray-800 flex justify-between items-end">
              <span className="text-white font-black italic text-lg uppercase tracking-tighter">Total</span>
              <span className="text-3xl font-black text-yellow-400 italic tracking-tighter">{total.toFixed(2)} DH</span>
            </div>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30 mb-4 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Check className="w-6 h-6" /> Secure Checkout
              </>
            )}
          </button>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1e232e]/95 backdrop-blur-lg border-t border-gray-800 p-4 px-6 flex items-center justify-between shadow-2xl">
        <div>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Total Payment</p>
          <p className="text-2xl font-black text-yellow-400 italic tracking-tighter leading-none">{total.toFixed(2)} DH</p>
        </div>
        <button 
          onClick={handleCheckout}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl flex items-center gap-2 shadow-2xl shadow-blue-600/30 active:scale-95 transition-transform disabled:opacity-50 uppercase tracking-tighter"
        >
          {isProcessing ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Pay <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};