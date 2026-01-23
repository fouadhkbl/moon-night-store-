
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Crown, Check, Shield, Zap, Star, AlertCircle, Loader2, MicOff, Move, Armchair, Heart } from 'lucide-react';
import { Profile } from '../types';

export const ElitePage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [elitePrice, setElitePrice] = useState(199.00);
    const [loadingPrice, setLoadingPrice] = useState(true);

    useEffect(() => {
        const fetchSettingsAndProfile = async () => {
            // Fetch Price Config
            const { data: settings } = await supabase.from('app_settings').select('*').eq('key', 'vip_membership_price').single();
            if (settings) {
                setElitePrice(parseFloat(settings.value));
            }
            setLoadingPrice(false);

            if (session?.user?.id && session.user.id !== 'guest-user-123') {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data);
            }
        };
        fetchSettingsAndProfile();
    }, [session]);

    const handleUpgrade = async () => {
        if (!profile) {
            addToast('Login Required', 'Please login to upgrade your account.', 'error');
            return;
        }

        if (profile.vip_level > 0) {
            addToast('Already Elite', 'You are already an Elite member!', 'info');
            return;
        }

        if (profile.wallet_balance < elitePrice) {
            addToast('Insufficient Funds', 'Please top up your wallet to purchase Elite status.', 'error');
            onNavigate('topup');
            return;
        }

        setIsProcessing(true);

        try {
            // 1. Deduct Balance
            const newBalance = profile.wallet_balance - elitePrice;
            const newPoints = profile.discord_points + 5000; // Bonus points

            // 2. Update Profile (Set VIP Level to 1)
            const { error } = await supabase.from('profiles').update({
                wallet_balance: newBalance,
                vip_level: 1, // 1 = Elite
                discord_points: newPoints
            }).eq('id', profile.id);

            if (error) throw error;

            // 3. Log Transaction
            await supabase.from('orders').insert({
                user_id: profile.id,
                total_amount: elitePrice,
                status: 'completed',
                payment_method: 'Wallet (Elite Upgrade)',
                transaction_id: `ELITE-${Date.now()}`
            });

            addToast('Upgrade Successful!', 'Welcome to the Elite club. Enjoy your benefits!', 'success');
            setProfile({ ...profile, wallet_balance: newBalance, vip_level: 1, discord_points: newPoints });
            
            setTimeout(() => onNavigate('dashboard'), 2000);

        } catch (err: any) {
            addToast('Error', 'Upgrade failed. Please try again.', 'error');
            console.error(err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-20">
            {/* Hero */}
            <div className="relative py-24 bg-[#0b0e14] overflow-hidden text-center border-b border-yellow-900/20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-yellow-600/10 to-transparent blur-3xl pointer-events-none"></div>
                
                <div className="relative z-10 container mx-auto px-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 font-black uppercase text-[10px] tracking-[0.2em] mb-8 animate-pulse">
                        <Crown className="w-4 h-4" /> Official Membership
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
                        Moon <span className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600">Elite</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-xl mx-auto mb-10">
                        Unlock the full potential of the marketplace with exclusive privileges and rewards.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20">
                <div className="max-w-md mx-auto bg-[#1e232e] rounded-[3rem] border border-yellow-500/30 shadow-[0_0_50px_rgba(234,179,8,0.15)] overflow-hidden">
                    <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                        <Crown className="w-16 h-16 text-white mx-auto mb-4 drop-shadow-lg" />
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-1">Lifetime Access</h2>
                        <p className="text-yellow-200 font-bold text-xs uppercase tracking-widest">Become a Legend</p>
                    </div>

                    <div className="p-8">
                        <div className="space-y-6 mb-8">
                            {[
                                { text: "Exclusive Discount on Everything", icon: <Zap className="w-5 h-5 text-yellow-500" /> },
                                { text: "Access to VIP Products", icon: <Shield className="w-5 h-5 text-yellow-500" /> },
                                { text: "Gold Profile Badge", icon: <Star className="w-5 h-5 text-yellow-500" /> },
                                { text: "5,000 Bonus Points", icon: <Check className="w-5 h-5 text-yellow-500" /> },
                                { text: "Priority Support", icon: <Check className="w-5 h-5 text-yellow-500" /> },
                                { text: "Move Members Power (Discord)", icon: <Move className="w-5 h-5 text-yellow-500" /> },
                                { text: "Mute Members Power (Discord)", icon: <MicOff className="w-5 h-5 text-yellow-500" /> },
                                { text: "Access Luxury Voice Room", icon: <Armchair className="w-5 h-5 text-yellow-500" /> },
                                { text: "Exclusive Supporter Role", icon: <Heart className="w-5 h-5 text-yellow-500" /> },
                            ].map((benefit, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="p-2 bg-yellow-900/20 rounded-lg">{benefit.icon}</div>
                                    <span className="text-sm font-bold text-gray-300 uppercase tracking-wide">{benefit.text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mb-8">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">One-time payment</p>
                            <p className="text-5xl font-black text-white italic tracking-tighter">
                                {loadingPrice ? <Loader2 className="animate-spin w-6 h-6 inline" /> : elitePrice.toFixed(2)} 
                                <span className="text-xl text-gray-500 ml-2">DH</span>
                            </p>
                        </div>

                        {profile?.vip_level && profile.vip_level > 0 ? (
                            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center justify-center gap-2 text-green-500 font-black uppercase tracking-widest text-xs">
                                <Check className="w-5 h-5" /> Active Member
                            </div>
                        ) : (
                            <button 
                                onClick={handleUpgrade}
                                disabled={isProcessing || loadingPrice}
                                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-400 hover:to-yellow-600 text-black font-black py-5 rounded-2xl uppercase tracking-widest text-xs shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Join Elite Now'}
                            </button>
                        )}
                        
                        {!profile && (
                            <p className="text-center mt-4 text-[10px] text-red-400 font-bold uppercase tracking-widest flex items-center justify-center gap-1">
                                <AlertCircle className="w-3 h-3" /> Login Required
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
