import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Wallet, ArrowLeft, CreditCard, Check, AlertCircle, TrendingUp, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    paypal: any;
  }
}

export const TopUpPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
  const [amount, setAmount] = useState<number>(100);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
       if (session?.user) {
         const { data } = await supabase.from('profiles').select('wallet_balance').eq('id', session.user.id).single();
         if (data) setCurrentBalance(data.wallet_balance);
       }
    };
    fetchBalance();

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
  }, [session]);

  const handleAmountChange = (val: number) => {
      let newAmount = val;
      if (newAmount > 1000) newAmount = 1000;
      if (newAmount < 0) newAmount = 0;
      setAmount(newAmount);
  };

  useEffect(() => {
      if (paypalLoaded && !isSuccess && amount > 0) {
          const container = document.getElementById('paypal-topup-container');
          if (container) {
              container.innerHTML = '';
              try {
                  window.paypal.Buttons({
                      style: {
                          layout: 'vertical', // Changed to vertical to show Debit/Credit card button prominently
                          color:  'gold',
                          shape:  'rect',
                          label:  'pay'
                      },
                      createOrder: (data: any, actions: any) => {
                          return actions.order.create({
                              purchase_units: [{
                                  amount: {
                                      value: amount.toFixed(2),
                                      currency_code: 'MAD'
                                  },
                                  description: `Moon Night Wallet Top Up`
                              }]
                          });
                      },
                      onApprove: async (data: any, actions: any) => {
                          const details = await actions.order.capture();
                          await handleTopUpSuccess(details.id);
                      },
                      onError: (err: any) => {
                          console.error("PayPal Error:", err);
                          addToast('Payment Failed', 'The transaction could not be completed.', 'error');
                      }
                  }).render('#paypal-topup-container');
              } catch (e) {
                  console.error("PayPal Render Error", e);
              }
          }
      }
  }, [paypalLoaded, isSuccess, amount]);

  const handleTopUpSuccess = async (txnId: string) => {
      try {
          // Update profile balance
          const newBalance = currentBalance + amount;
          const { error } = await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', session.user.id);
          
          if (error) throw error;

          // Optional: Record transaction in orders table as a "Top Up"
          await supabase.from('orders').insert({
              user_id: session.user.id,
              total_amount: amount,
              status: 'completed',
              payment_method: 'PayPal TopUp'
          });

          setIsSuccess(true);
          setCurrentBalance(newBalance);
          addToast('Success', 'Funds added to wallet successfully!', 'success');
      } catch (err: any) {
          addToast('Error', err.message, 'error');
      }
  };

  if (isSuccess) {
      return (
          <div className="container mx-auto px-4 py-20 text-center animate-fade-in max-w-lg">
             <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 border border-green-500/50">
                 <Check className="w-12 h-12" />
             </div>
             <h2 className="text-4xl font-black text-white italic mb-4 uppercase tracking-tighter">Top Up Complete!</h2>
             <p className="text-gray-400 mb-8 font-bold">Your new balance is <span className="text-yellow-400">{currentBalance.toFixed(2)} DH</span></p>
             <button onClick={() => onNavigate('dashboard')} className="w-full bg-[#1e232e] border border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-xl font-bold transition-all uppercase tracking-widest shadow-xl">
                 Return to Dashboard
             </button>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-4xl pb-32">
       <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-5 h-5" /> Back to Dashboard
       </button>

       <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-gradient-to-br from-blue-900 to-[#1e232e] p-8 rounded-[2rem] border border-blue-500/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Wallet className="w-32 h-32" /></div>
                    <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest mb-2 relative z-10">Current Balance</p>
                    <h2 className="text-5xl font-black text-white italic tracking-tighter relative z-10">{currentBalance.toFixed(2)} <span className="text-xl">DH</span></h2>
                </div>
                <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
                    <h3 className="text-white font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2"><AlertCircle className="w-5 h-5 text-gray-500" /> Limits</h3>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                        <span>Min Deposit</span>
                        <span className="text-white">10.00 DH</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>Max Deposit</span>
                        <span className="text-white">1,000.00 DH</span>
                    </div>
                </div>
           </div>

           <div className="w-full md:w-2/3 bg-[#1e232e] p-8 md:p-10 rounded-[2.5rem] border border-gray-800 shadow-2xl">
               <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                   <TrendingUp className="w-8 h-8 text-green-400" /> Add Funds
               </h1>

               <div className="mb-10">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Select Amount (DH)</label>
                   <div className="grid grid-cols-4 gap-3 mb-6">
                       {[50, 100, 200, 500].map(val => (
                           <button 
                             key={val} 
                             onClick={() => setAmount(val)}
                             className={`py-3 rounded-xl text-sm font-black italic transition-all border ${amount === val ? 'bg-blue-600 text-white border-blue-500 shadow-lg scale-105' : 'bg-[#0b0e14] text-gray-400 border-gray-800 hover:border-gray-600'}`}
                           >
                               {val}
                           </button>
                       ))}
                   </div>
                   
                   <div className="bg-[#0b0e14] p-6 rounded-2xl border border-gray-800 mb-6">
                       <input 
                         type="range" 
                         min="10" 
                         max="1000" 
                         step="10"
                         value={amount}
                         onChange={(e) => setAmount(Number(e.target.value))}
                         className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-4"
                       />
                       <div className="flex items-center justify-between">
                           <span className="text-xs font-bold text-gray-500">10 DH</span>
                           <div className="flex items-center gap-2 bg-[#1e232e] px-4 py-2 rounded-xl border border-gray-700">
                               <span className="text-gray-400 font-bold">DH</span>
                               <input 
                                 type="number" 
                                 value={amount} 
                                 onChange={(e) => handleAmountChange(Number(e.target.value))}
                                 className="w-20 bg-transparent text-right font-black text-white outline-none"
                               />
                           </div>
                           <span className="text-xs font-bold text-gray-500">1000 DH</span>
                       </div>
                   </div>
               </div>

               <div className="border-t border-gray-800 pt-8">
                   <div className="flex justify-between items-center mb-6">
                       <span className="text-gray-400 font-black uppercase tracking-widest text-xs">Total Charge</span>
                       <span className="text-3xl font-black text-yellow-400 italic tracking-tighter">{amount.toFixed(2)} DH</span>
                   </div>
                   
                   <div className="relative z-0 min-h-[150px]">
                       <div id="paypal-topup-container" className="w-full space-y-4"></div>
                       {!paypalLoaded && (
                           <div className="w-full h-14 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center text-gray-500 text-xs uppercase tracking-widest">
                               Loading Secure Payment...
                           </div>
                       )}
                   </div>
                   
                   <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                       <ShieldCheck className="w-3 h-3 text-green-500" /> Secure SSL Encrypted Transaction
                   </p>
               </div>
           </div>
       </div>
    </div>
  );
};