
import React, { useState, useMemo, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { CartItem, Coupon } from '../types';
import { Check, Receipt, ShoppingCart, ArrowLeft, Loader2, Wallet, AlertCircle, CreditCard, ShieldCheck, Ticket, Clock, Trophy, Crown } from 'lucide-react';

declare global {
  interface Window {
    paypal: any;
  }
}

const MAD_TO_USD_RATE = 0.1; 

export const CheckoutPage = ({ cart, session, onNavigate, onViewOrder, onClearCart, addToast }: { 
  cart: CartItem[], 
  session: any,
  onNavigate: (p: string) => void,
  onViewOrder: (id: string) => void,
  onClearCart: () => void,
  addToast: any
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paypal'>('wallet');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [vipLevel, setVipLevel] = useState(0);
  const [vipDiscountPercent, setVipDiscountPercent] = useState(5);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const isGuest = session?.user?.id === 'guest-user-123';
  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0), [cart]);

  // Fetch VIP Discount Setting
  useEffect(() => {
      const fetchSettings = async () => {
          const { data } = await supabase.from('app_settings').select('value').eq('key', 'vip_discount_percent').single();
          if(data) setVipDiscountPercent(parseFloat(data.value));
      };
      fetchSettings();
  }, []);

  // VIP Discount Logic
  const vipDiscountAmount = useMemo(() => {
      if (vipLevel > 0) {
          return subtotal * (vipDiscountPercent / 100);
      }
      return 0;
  }, [subtotal, vipLevel, vipDiscountPercent]);

  // Calculate Coupon Discount
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discount_type === 'fixed') {
        return Math.min(appliedCoupon.discount_value, subtotal - vipDiscountAmount);
    } else {
        return (subtotal * appliedCoupon.discount_value) / 100;
    }
  }, [appliedCoupon, subtotal, vipDiscountAmount]);

  const totalAfterDiscounts = Math.max(0, subtotal - vipDiscountAmount - couponDiscountAmount);
  
  // Processing Fee only for PayPal direct payments
  const processingFee = paymentMethod === 'wallet' 
    ? 0 
    : 3 + (totalAfterDiscounts * 0.005);

  const finalTotal = parseFloat((totalAfterDiscounts + processingFee).toFixed(2));

  // Fetch Wallet & VIP Status
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isGuest && session?.user?.id) {
        const { data } = await supabase.from('profiles').select('wallet_balance, vip_level').eq('id', session.user.id).single();
        if (data) {
            setWalletBalance(data.wallet_balance || 0); // Ensure non-null
            setVipLevel(data.vip_level || 0);
            
            // Auto switch to PayPal if balance low
            if ((data.wallet_balance || 0) < finalTotal) {
                setPaymentMethod('paypal');
            }
        }
      }
    };
    fetchProfile();
  }, [session, isGuest]);

  useEffect(() => {
      if (window.paypal) {
          setPaypalLoaded(true);
      } else {
          const timer = setInterval(() => {
              if (window.paypal) {
                  setPaypalLoaded(true);
                  clearInterval(timer);
              }
          }, 500);
          return () => clearInterval(timer);
      }
  }, []);

  // PayPal Button Render Logic
  useEffect(() => {
      let isCancelled = false;

      if (paymentMethod === 'paypal' && paypalLoaded && !isGuest && cart.length > 0 && !showSuccess) {
          const container = document.getElementById('paypal-checkout-container');
          if (container) {
              container.innerHTML = '';
              setTimeout(() => {
                if (isCancelled) return;
                try {
                    window.paypal.Buttons({
                        style: { layout: 'vertical', color: 'blue', shape: 'rect', label: 'pay', height: 48 },
                        createOrder: (data: any, actions: any) => {
                            const usdAmount = (finalTotal * MAD_TO_USD_RATE).toFixed(2);
                            return actions.order.create({
                                purchase_units: [{ amount: { value: usdAmount, currency_code: 'USD' }, description: `Order Payment` }]
                            });
                        },
                        onApprove: async (data: any, actions: any) => {
                            const details = await actions.order.capture();
                            // Process order with PayPal as direct payment method
                            await processOrder('PayPal / Card', details.id);
                        },
                        onError: (err: any) => { console.error("PayPal Error:", err); addToast('Payment Failed', 'Transaction could not be completed.', 'error'); }
                    }).render('#paypal-checkout-container');
                } catch (e) { console.error("PayPal Render Error", e); }
              }, 100);
          }
      }
      return () => { isCancelled = true; };
  }, [paymentMethod, paypalLoaded, finalTotal, isGuest, cart.length, showSuccess]);

  const handleApplyCoupon = async () => {
      if (!couponCode.trim()) return;
      setIsCheckingCoupon(true);
      try {
          const { data, error } = await supabase.from('coupons').select('*').eq('code', couponCode.trim()).single();
          if (error || !data) {
              addToast('Invalid Code', 'This coupon code does not exist.', 'error');
              setAppliedCoupon(null);
              return;
          }
          if (!data.is_active) throw new Error("Coupon is inactive.");
          if (data.expires_at && new Date(data.expires_at) < new Date()) throw new Error("Coupon has expired.");
          if (data.max_uses && data.usage_count >= data.max_uses) throw new Error("Coupon usage limit reached.");
          setAppliedCoupon(data);
          addToast('Applied', 'Discount applied successfully!', 'success');
      } catch (err: any) {
          addToast('Error', err.message, 'error');
          setAppliedCoupon(null);
      } finally {
          setIsCheckingCoupon(false);
      }
  };

  const processOrder = async (method: string, paymentDetailsId?: string) => {
    if (isGuest) {
      addToast('Auth Required', 'Please login or signup to complete your order.', 'error');
      onNavigate('dashboard');
      return;
    }
    setIsProcessing(true);
    try {
      const { data: profileData, error: profileFetchError } = await supabase.from('profiles').select('wallet_balance, discord_points, referred_by').eq('id', session.user.id).single();
      if (profileFetchError) throw new Error("Failed to fetch user profile.");
      
      const currentBalance = parseFloat(String(profileData.wallet_balance || 0));
      const currentPoints = parseInt(String(profileData.discord_points || 0));
      const payAmount = parseFloat(finalTotal.toFixed(2));

      // Only check balance if paying via Wallet
      if (method === 'Wallet' && currentBalance < payAmount) {
          throw new Error("Insufficient wallet funds.");
      }

      const points = Math.floor(payAmount * 10);
      setEarnedPoints(points);

      const profileUpdates: any = { discord_points: currentPoints + points };
      
      // Deduct balance ONLY if paying via Wallet
      if (method === 'Wallet') {
          // Use precision math to avoid floating point errors
          const newBalance = parseFloat((currentBalance - payAmount).toFixed(2));
          profileUpdates.wallet_balance = newBalance;
      }

      const { error: balanceError } = await supabase.from('profiles').update(profileUpdates).eq('id', session.user.id);
      if (balanceError) throw balanceError;
      if (method === 'Wallet') setWalletBalance(profileUpdates.wallet_balance);

      if (appliedCoupon) await supabase.from('coupons').update({ usage_count: appliedCoupon.usage_count + 1 }).eq('id', appliedCoupon.id);

      const { data: order, error: orderError } = await supabase.from('orders').insert({
          user_id: session.user.id,
          total_amount: payAmount,
          status: method === 'Wallet' || method.includes('PayPal') ? 'completed' : 'pending',
          payment_method: method,
          transaction_id: paymentDetailsId || null
        }).select().single();

      if (orderError) throw orderError;

      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_purchase: item.product?.price || 0
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;

      if (points > 0) {
          await supabase.from('point_transactions').insert({ user_id: session.user.id, points_amount: points, money_equivalent: payAmount, status: 'completed' });
      }

      // Affiliate Logic
      if (profileData.referred_by) {
          const { data: setting } = await supabase.from('app_settings').select('value').eq('key', 'affiliate_order_reward_percentage').single();
          const commissionPercentage = setting ? parseFloat(setting.value) : 5.00;
          if (commissionPercentage > 0) {
              const commissionAmount = parseFloat(((payAmount * commissionPercentage) / 100).toFixed(2));
              const { data: referrer } = await supabase.from('profiles').select('wallet_balance, referral_earnings').eq('id', profileData.referred_by).single();
              if (referrer) {
                  await supabase.from('profiles').update({
                      wallet_balance: (referrer.wallet_balance || 0) + commissionAmount,
                      referral_earnings: (referrer.referral_earnings || 0) + commissionAmount
                  }).eq('id', profileData.referred_by);
              }
          }
      }

      setCreatedOrderId(order.id);
      setShowSuccess(true);
      onClearCart();
    } catch (err: any) {
      addToast('Checkout Failed', err.message || 'Error processing payment.', 'error');
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
        <p className="text-gray-400 mb-6 max-w-md mx-auto">Your order has been placed. You can now chat with support in the order details.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => createdOrderId ? onViewOrder(createdOrderId) : onNavigate('dashboard')} className="bg-[#1e232e] border border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
            <Receipt className="w-5 h-5" /> View Order
          </button>
          <button onClick={() => onNavigate('shop')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2">
             Continue Shopping <ShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0 && !showSuccess) { onNavigate('cart'); return null; }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 animate-fade-in max-w-5xl pb-32">
       <button onClick={() => onNavigate('cart')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"><ArrowLeft className="w-5 h-5" /> Back to Cart</button>
       <h1 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3"><CreditCard className="w-10 h-10 text-blue-500" /> Checkout</h1>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
           <div className="space-y-6">
               <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
                   <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6 border-b border-gray-800 pb-4">Order Summary</h3>
                   <div className="space-y-3 mb-6">
                       {cart.map(item => (
                           <div key={item.id} className="flex justify-between items-center text-sm">
                               <span className="text-gray-400 font-bold truncate max-w-[200px]">{item.quantity}x {item.product?.name}</span>
                               <span className="text-white font-mono">{((item.product?.price || 0) * item.quantity).toFixed(2)} DH</span>
                           </div>
                       ))}
                   </div>
                   <div className="border-t border-gray-800 pt-4 space-y-2">
                       <div className="flex justify-between text-gray-500 text-xs font-black uppercase tracking-widest">
                           <span>Subtotal</span>
                           <span>{subtotal.toFixed(2)} DH</span>
                       </div>
                       
                       {/* VIP Discount Line */}
                       {vipLevel > 0 && (
                           <div className="flex justify-between text-yellow-400 text-xs font-black uppercase tracking-widest">
                               <span className="flex items-center gap-1"><Crown className="w-3 h-3" /> Elite Discount ({vipDiscountPercent}%)</span>
                               <span>- {vipDiscountAmount.toFixed(2)} DH</span>
                           </div>
                       )}

                       {appliedCoupon && (
                           <div className="flex justify-between text-green-400 text-xs font-black uppercase tracking-widest">
                               <span>Discount ({appliedCoupon.code})</span>
                               <span>- {couponDiscountAmount.toFixed(2)} DH</span>
                           </div>
                       )}
                       <div className="flex justify-between text-gray-400 text-xs font-black uppercase tracking-widest">
                           <span>Processing Fee</span>
                           <span>+ {processingFee.toFixed(2)} DH</span>
                       </div>
                       <div className="flex justify-between text-white text-xl font-black italic tracking-tighter pt-2">
                           <span>Total</span>
                           <span className="text-yellow-400">{finalTotal.toFixed(2)} DH</span>
                       </div>
                   </div>
               </div>

               <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
                   <h3 className="text-white font-black uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                       <Ticket className="w-4 h-4 text-purple-500" /> Apply Coupon
                   </h3>
                   <div className="flex gap-2">
                       <input 
                         type="text" 
                         value={couponCode}
                         onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                         placeholder="ENTER CODE"
                         className="bg-[#0b0e14] border border-gray-800 rounded-xl px-4 py-3 text-white text-xs font-black tracking-widest uppercase flex-grow focus:border-purple-500 outline-none"
                       />
                       <button onClick={handleApplyCoupon} disabled={isCheckingCoupon || !couponCode} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50">
                           {isCheckingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                       </button>
                   </div>
               </div>
           </div>

           <div className="bg-[#1e232e] p-8 rounded-[2.5rem] border border-gray-800 shadow-2xl relative z-0">
                <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">Select Payment Method</h3>
                
                {isGuest ? (
                    <div className="text-center py-10">
                        <ShieldCheck className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-white font-black uppercase tracking-tighter text-xl mb-2">Login Required</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-6">You must be logged in to complete purchase.</p>
                        <button onClick={() => onNavigate('dashboard')} className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-widest w-full">Go to Login</button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <button onClick={() => setPaymentMethod('paypal')} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'paypal' ? 'bg-white border-white' : 'bg-[#0b0e14] border-gray-800 hover:border-gray-600'}`}>
                                <CreditCard className={`w-8 h-8 ${paymentMethod === 'paypal' ? 'text-blue-900' : 'text-gray-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'paypal' ? 'text-blue-900' : 'text-gray-500'}`}>PayPal / Card</span>
                            </button>
                            <button onClick={() => setPaymentMethod('wallet')} className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all ${paymentMethod === 'wallet' ? 'bg-blue-600 border-blue-600' : 'bg-[#0b0e14] border-gray-800 hover:border-gray-600'}`}>
                                <Wallet className={`w-8 h-8 ${paymentMethod === 'wallet' ? 'text-white' : 'text-gray-500'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === 'wallet' ? 'text-white' : 'text-gray-500'}`}>My Wallet</span>
                            </button>
                        </div>

                        {paymentMethod === 'wallet' && (
                            <div className="mb-6">
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Current Balance: <span className="text-white">{walletBalance.toFixed(2)} DH</span></p>
                                {walletBalance < finalTotal && (
                                    <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500" />
                                        <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Insufficient Funds. Switch to PayPal/Card to pay directly.</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="relative z-10 min-h-[150px]">
                            {paymentMethod === 'wallet' ? (
                                <button onClick={() => processOrder('Wallet')} disabled={isProcessing || walletBalance < finalTotal} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl shadow-blue-600/30 uppercase tracking-widest disabled:opacity-50">
                                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Pay Now <Wallet className="w-5 h-5" /></>}
                                </button>
                            ) : (
                                <>
                                    <div className="flex justify-center w-full"><div id="paypal-checkout-container" className="w-full md:max-w-xs relative z-10"></div></div>
                                    {!paypalLoaded && <div className="w-full h-14 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center text-gray-500 text-xs uppercase tracking-widest absolute top-0 left-0">Loading Payment Gateway...</div>}
                                </>
                            )}
                        </div>
                    </>
                )}
           </div>
       </div>
    </div>
  );
};
