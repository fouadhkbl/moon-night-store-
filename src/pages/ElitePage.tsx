
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
// Added CheckCircle to the imports from lucide-react
import { Crown, Check, Shield, Zap, Star, AlertCircle, Loader2, MicOff, Move, Armchair, Heart, Sparkles, ChevronRight, CheckCircle } from 'lucide-react';
import { Profile } from '../types';

export const ElitePage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [elitePrice, setElitePrice] = useState(199.00);
    const [loadingPrice, setLoadingPrice] = useState(true);

    useEffect(() => {
        const fetchSettingsAndProfile = async () => {
            const { data: settings } = await supabase.from('app_settings').select('*').eq('key', 'vip_membership_price').single();
            if (settings) setElitePrice(parseFloat(settings.value));
            setLoadingPrice(false);

            if (session?.user?.id && session.user.id !== 'guest-user-123') {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data);
            }
        };
        fetchSettingsAndProfile();
    }, [session]);

    const handleUpgrade = async () => {
        if (!profile) { addToast('Login Required', 'Please login to upgrade your account.', 'error'); return; }
        if (profile.vip_level > 0) { addToast('Already Elite', 'You are already an Elite member!', 'info'); return; }
        if (profile.wallet_balance < elitePrice) { addToast('Insufficient Funds', 'Please top up your wallet to purchase Elite status.', 'error'); onNavigate('topup'); return; }
        setIsProcessing(true);
        try {
            const newBalance = profile.wallet_balance - elitePrice;
            const newPoints = (profile.discord_points || 0) + 5000;
            const { error } = await supabase.from('profiles').update({ wallet_balance: newBalance, vip_level: 1, discord_points: newPoints }).eq('id', profile.id);
            if (error) throw error;
            await supabase.from('orders').insert({ user_id: profile.id, total_amount: elitePrice, status: 'completed', payment_method: 'Wallet (Elite Upgrade)', transaction_id: `ELITE-${Date.now()}` });
            addToast('Upgrade Successful!', 'Welcome to the Elite club. Enjoy your benefits!', 'success');
            setProfile({ ...profile, wallet_balance: newBalance, vip_level: 1, discord_points: newPoints });
            setTimeout(() => onNavigate('dashboard'), 2000);
        } catch (err: any) {
            addToast('Error', 'Upgrade failed. Please try again.', 'error');
            console.error(err);
        } finally { setIsProcessing(false); }
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-24 relative overflow-hidden">
            <style>{`
              .gold-text-glow {
                text-shadow: 0 0 20px rgba(234, 179, 8, 0.4);
              }
              .gold-metallic-bg {
                background: linear-gradient(135deg, #bf953f 0%, #fcf6ba 45%, #b38728 70%, #fbf5b7 100%);
              }
            `}</style>

            {/* Hero Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-yellow-500/5 blur-[120px] rounded-full opacity-50"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05] pointer-events-none"></div>

            <div className="container mx-auto px-4 pt-20 relative z-10 text-center">
                <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-black uppercase text-[10px] tracking-[0.4em] mb-8 shadow-[0_0_30px_rgba(234,179,8,0.1)]">
                    <Sparkles className="w-4 h-4 animate-pulse" /> The Highest Tier
                </div>
                <h1 className="text-7xl md:text-9xl font-black text-white italic uppercase tracking-tighter mb-6 leading-[0.85]">
                    MOON <br/>
                    <span className="text-transparent bg-clip-text gold-metallic-bg gold-text-glow">ELITE</span>
                </h1>
                <p className="text-gray-400 text-sm md:text-base font-bold uppercase tracking-[0.2em] max-w-2xl mx-auto mb-16 leading-relaxed opacity-80">
                    ASCEND TO THE PINNACLE OF THE MARKETPLACE. <br/> UNLOCK UNRIVALED POWER, ACCESS, AND REWARDS.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto px-4">
                    {/* Benefits Card */}
                    <div className="bg-[#1e232e]/60 backdrop-blur-xl border border-white/5 rounded-[3.5rem] p-8 md:p-12 shadow-3xl text-left relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Crown className="w-64 h-64 text-yellow-500" /></div>
                        <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-10 flex items-center gap-4">
                            <div className="w-12 h-12 gold-metallic-bg rounded-2xl flex items-center justify-center text-black shadow-xl"><Zap className="w-6 h-6 fill-current" /></div>
                            Elite Matrix Access
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { t: "Permanent -5% Discount", d: "Applied automatically to all shop items." },
                                { t: "VIP Only Products", d: "Access hidden account & item drops." },
                                { t: "5,000 Starting Points", d: "Instantly claim for rewards or spins." },
                                { t: "Discord Moderator Tools", d: "Move and Mute power on server." },
                                { t: "Support Priority", d: "Your tickets bypass the global queue." },
                                { t: "Exclusive Chat Lobby", d: "Access the 'Luxury Room' voice channel." },
                                { t: "Golden Identity", d: "Shiny badge visible across the site." },
                                { t: "Loot Box Multipliers", d: "Higher win probabilities on packs." }
                            ].map((b, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-yellow-500/30 transition-all group/item">
                                    <div className="w-6 h-6 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500 group-hover/item:bg-yellow-500 group-hover/item:text-black transition-colors shrink-0">
                                        <Check className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-widest mb-1">{b.t}</p>
                                        <p className="text-[9px] text-gray-500 font-bold uppercase leading-tight">{b.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Purchase Card */}
                    <div className="bg-[#1e232e] rounded-[3.5rem] border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 p-10 flex flex-col items-center justify-center text-center relative group">
                        <div className="absolute inset-0 bg-yellow-500/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative z-10 w-full">
                            <div className="w-32 h-32 gold-metallic-bg rounded-[2.5rem] flex items-center justify-center text-black mx-auto mb-10 shadow-[0_0_60px_rgba(234,179,8,0.4)] border-4 border-[#0b0e14] group-hover:rotate-12 transition-transform duration-700">
                                <Crown className="w-16 h-16 fill-current" />
                            </div>
                            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">ELITE MEMBERSHIP</h2>
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-12">Universal Sync • Lifetime Activation</p>
                            
                            <div className="bg-[#0b0e14]/50 border border-white/5 rounded-[2rem] p-8 mb-12 relative">
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-black">Limited Time Offer</div>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Total One-Time Price</p>
                                <div className="flex items-center justify-center gap-3">
                                    <h4 className="text-7xl font-black text-white italic tracking-tighter drop-shadow-lg">
                                        {loadingPrice ? <Loader2 className="animate-spin" /> : elitePrice.toFixed(2)}
                                    </h4>
                                    <span className="text-2xl font-black text-yellow-500 italic mb-2">DH</span>
                                </div>
                            </div>

                            {profile?.vip_level && profile.vip_level > 0 ? (
                                <div className="w-full py-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center gap-3 text-green-500 font-black uppercase tracking-widest text-xs">
                                    <CheckCircle className="w-6 h-6" /> STATUS: ACTIVATED
                                </div>
                            ) : (
                                <button 
                                    onClick={handleUpgrade}
                                    disabled={isProcessing || loadingPrice}
                                    className="w-full py-6 gold-metallic-bg hover:scale-[1.02] active:scale-95 text-black font-black rounded-2xl uppercase tracking-[0.2em] text-sm shadow-[0_20px_50px_rgba(184,134,11,0.4)] transition-all flex items-center justify-center gap-4 group"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin w-6 h-6" /> : (
                                        <>BECOME ELITE <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" /></>
                                    )}
                                </button>
                            )}

                            {!profile && (
                                <p className="mt-6 text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                    <AlertCircle className="w-3.5 h-3.5" /> Identity Sync Required to Purchase
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Tag */}
            <div className="container mx-auto px-4 mt-20 text-center opacity-40">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.5em] flex items-center justify-center gap-4">
                   <Shield className="w-4 h-4" /> SECURE LIFETIME TRANSACTION <Shield className="w-4 h-4" />
                </p>
            </div>
        </div>
    );
};
