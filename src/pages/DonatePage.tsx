import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Heart, ArrowLeft, Check, CreditCard, ShieldCheck, Star } from 'lucide-react';

declare global {
  interface Window {
    paypal: any;
  }
}

const MAD_TO_USD_RATE = 0.1;

export const DonatePage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
  const [amount, setAmount] = useState<number>(50);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (session?.user) {
        supabase.from('profiles').select('*').eq('id', session.user.id).single().then(({ data }) => setProfile(data));
    }

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

  useEffect(() => {
      let isCancelled = false;

      if (paypalLoaded && !isSuccess && amount >= 10) {
          const container = document.getElementById('paypal-donate-container');
          
          if (container) {
              container.innerHTML = '';
              
              setTimeout(() => {
                 if(isCancelled) return;
                 
                 try {
                    window.paypal.Buttons({
                        style: {
                            layout: 'vertical',
                            color:  'gold', 
                            shape:  'pill',
                            label:  'donate',
                            height: 48
                        },
                        createOrder: (data: any, actions: any) => {
                            const usdAmount = (amount * MAD_TO_USD_RATE).toFixed(2);
                            return actions.order.create({
                                purchase_units: [{
                                    amount: {
                                        value: usdAmount,
                                        currency_code: 'USD'
                                    },
                                    description: `Moon Night Donation`
                                }]
                            });
                        },
                        onApprove: async (data: any, actions: any) => {
                            const details = await actions.order.capture();
                            await handleDonationSuccess(details.id);
                        },
                        onError: (err: any) => {
                            console.error("PayPal Error:", err);
                            addToast('Payment Failed', 'The donation could not be completed.', 'error');
                        }
                    }).render('#paypal-donate-container');
                 } catch (e) {
                    console.error("PayPal Render Error", e);
                 }
              }, 100);
          }
      }
      return () => { isCancelled = true; };
  }, [paypalLoaded, isSuccess, amount]);

  const handleDonationSuccess = async (txnId: string) => {
      try {
          if (!session?.user || session?.user?.id === 'guest-user-123') {
              // Guest donation - record but don't link profile stats heavily
              await supabase.from('donations').insert({
                  amount: amount,
                  transaction_id: txnId
              });
          } else {
              // Registered user
              await supabase.from('donations').insert({
                  user_id: session.user.id,
                  amount: amount,
                  transaction_id: txnId
              });
              
              // Update user total
              const currentTotal = profile?.total_donated || 0;
              await supabase.from('profiles').update({ total_donated: currentTotal + amount }).eq('id', session.user.id);
          }

          setIsSuccess(true);
          addToast('Thank You!', 'Your donation has been received.', 'success');
      } catch (err: any) {
          addToast('Error', err.message, 'error');
      }
  };

  if (isSuccess) {
      return (
          <div className="container mx-auto px-4 py-20 text-center animate-fade-in max-w-lg">
             <div className="w-32 h-32 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500 border border-red-500/50 animate-bounce-slow">
                 <Heart className="w-16 h-16 fill-current" />
             </div>
             <h2 className="text-5xl font-black text-white italic mb-6 uppercase tracking-tighter">THANK YOU!</h2>
             <p className="text-gray-400 mb-8 font-bold text-lg">
                 Your generous donation of <span className="text-yellow-400">{amount.toFixed(2)} DH</span> helps keep Moon Night running.
             </p>
             <div className="flex flex-col gap-4">
                 <button onClick={() => onNavigate('leaderboard')} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-4 rounded-2xl font-black transition-all uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                     <Star className="w-5 h-5" /> View Leaderboard
                 </button>
                 <button onClick={() => onNavigate('home')} className="w-full bg-[#1e232e] border border-gray-700 hover:border-blue-500 text-white px-8 py-4 rounded-2xl font-bold transition-all uppercase tracking-widest shadow-xl">
                     Return Home
                 </button>
             </div>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-4xl pb-32">
       <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
          <ArrowLeft className="w-5 h-5" /> Back Home
       </button>

       <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="w-full md:w-1/3 space-y-6">
                <div className="bg-gradient-to-br from-red-900 to-[#1e232e] p-8 rounded-[2.5rem] border border-red-500/30 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-10"><Heart className="w-32 h-32" /></div>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter relative z-10 leading-none mb-4">Support<br/>The Project</h3>
                    <p className="text-red-200 text-xs font-bold leading-relaxed relative z-10">
                        Donations help us maintain servers, add new features, and keep the marketplace secure for everyone.
                    </p>
                </div>
                <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-gray-800 shadow-xl">
                    <h3 className="text-white font-black italic uppercase tracking-tighter mb-4 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500" /> Perks</h3>
                    <ul className="space-y-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Leaderboard Recognition</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Supporter Badge</li>
                        <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Our Eternal Gratitude</li>
                    </ul>
                </div>
           </div>

           <div className="w-full md:w-2/3 bg-[#1e232e] p-8 md:p-12 rounded-[3rem] border border-gray-800 shadow-2xl">
               <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-8 flex items-center gap-3">
                   <Heart className="w-8 h-8 text-red-500 fill-red-500" /> Make a Donation
               </h1>

               <div className="mb-10">
                   <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Select Amount (DH)</label>
                   <div className="grid grid-cols-4 gap-3 mb-6">
                       {[50, 100, 300, 500].map(val => (
                           <button 
                             key={val} 
                             onClick={() => setAmount(val)}
                             className={`py-4 rounded-2xl text-sm font-black italic transition-all border ${amount === val ? 'bg-red-600 text-white border-red-500 shadow-lg scale-105' : 'bg-[#0b0e14] text-gray-400 border-gray-800 hover:border-gray-600'}`}
                           >
                               {val}
                           </button>
                       ))}
                   </div>
                   
                   <div className="bg-[#0b0e14] p-6 rounded-2xl border border-gray-800 mb-6">
                       <div className="flex items-center justify-between">
                           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Custom Amount</span>
                           <div className="flex items-center gap-2 bg-[#1e232e] px-6 py-3 rounded-2xl border border-gray-700">
                               <span className="text-gray-400 font-bold">DH</span>
                               <input 
                                 type="number" 
                                 value={amount} 
                                 onChange={(e) => setAmount(Number(e.target.value))}
                                 className="w-24 bg-transparent text-right font-black text-white outline-none text-xl"
                               />
                           </div>
                       </div>
                   </div>
               </div>

               <div className="border-t border-gray-800 pt-8">
                   
                   <div className="relative z-0 min-h-[150px]">
                       {amount < 10 ? (
                           <div className="w-full h-14 bg-red-900/20 border border-red-500/20 rounded-lg flex items-center justify-center text-red-400 text-xs font-bold uppercase tracking-widest">
                               Minimum donation is 10 DH
                           </div>
                       ) : (
                           <>
                               <div className="flex items-center gap-2 mb-6 justify-center">
                                   <CreditCard className="w-4 h-4 text-gray-500" />
                                   <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Secure Donation via PayPal</span>
                               </div>
                               <div className="flex justify-center w-full">
                                    <div id="paypal-donate-container" className="w-full md:max-w-xs relative z-10"></div>
                               </div>
                               {!paypalLoaded && (
                                   <div className="w-full h-14 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center text-gray-500 text-xs uppercase tracking-widest absolute top-12 left-0">
                                       Loading Payment Gateway...
                                   </div>
                               )}
                           </>
                       )}
                   </div>
                   
                   <p className="text-center text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
                       <ShieldCheck className="w-3 h-3 text-green-500" /> 100% Secure Transaction
                   </p>
               </div>
           </div>
       </div>
    </div>
  );
};