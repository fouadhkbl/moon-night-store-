
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Zap, Trophy, Loader2, Sparkles, Wallet, ArrowRight } from 'lucide-react';
import { Profile, LootBox } from '../types';

// Fallback constant in case fetch fails or DB not set up yet
const DEFAULT_CRATES: LootBox[] = [
    {
        id: 'novice',
        name: 'Novice Pack',
        price: 10,
        multiplier: 1,
        color: 'bg-blue-900/40',
        border_color: 'border-blue-500',
        glow_color: 'shadow-blue-500/20',
        icon_type: 'package',
        potential_rewards: 'Win up to 50 DH or 1000 Points',
        created_at: new Date().toISOString()
    },
    {
        id: 'elite',
        name: 'Elite Pack',
        price: 50,
        multiplier: 5,
        color: 'bg-purple-900/40',
        border_color: 'border-purple-500',
        glow_color: 'shadow-purple-500/20',
        icon_type: 'zap',
        potential_rewards: 'Win up to 200 DH or 5000 Points',
        created_at: new Date().toISOString()
    },
    {
        id: 'legend',
        name: 'God Pack',
        price: 100,
        multiplier: 10,
        color: 'bg-yellow-900/40',
        border_color: 'border-yellow-500',
        glow_color: 'shadow-yellow-500/20',
        icon_type: 'trophy',
        potential_rewards: 'Win up to 500 DH or 15000 Points',
        created_at: new Date().toISOString()
    }
];

export const LootBoxPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [openingCrateId, setOpeningCrateId] = useState<string | null>(null);
    const [reward, setReward] = useState<{ type: 'money' | 'points', value: number } | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [crates, setCrates] = useState<LootBox[]>(DEFAULT_CRATES);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (session?.user?.id && session.user.id !== 'guest-user-123') {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data);
            }

            try {
                const { data: lootData, error } = await supabase.from('loot_boxes').select('*').order('price', { ascending: true });
                if (!error && lootData && lootData.length > 0) {
                    setCrates(lootData);
                }
            } catch (e) {
                console.error("Using default crates due to error", e);
            }
            setLoading(false);
        };
        fetchData();
    }, [session, openingCrateId]); 

    const calculatePrize = (crate: LootBox) => {
        const rand = Math.random() * 100;
        const multiplier = crate.multiplier || 1; // Default to 1 if not set

        // ODDS: 10/100 Winning Chance
        
        if (rand < 60) {
            // Points Reward (60%) - Consolation
            const basePoints = Math.floor(Math.random() * 50) + 50; 
            return { type: 'points', value: Math.floor(basePoints * multiplier * 2) }; 
        } else if (rand < 90) {
            // Small Money Return (30%) - Partial refund
            const returnRate = Math.random() * 0.3 + 0.2; 
            return { type: 'money', value: Number((crate.price * returnRate).toFixed(2)) };
        } else if (rand < 98) {
            // Winning / Profit (8%) - Modest Win
            const returnRate = Math.random() * 0.5 + 1.1; 
            return { type: 'money', value: Number((crate.price * returnRate).toFixed(2)) };
        } else {
            // JACKPOT (2%) - Big Win
            return { type: 'money', value: Number((crate.price * 5).toFixed(2)) }; // 5x
        }
    };

    const handleOpenCrate = async (crate: LootBox) => {
        if (!profile) {
            addToast('Login Required', 'You must be logged in to open packs.', 'error');
            return;
        }

        if (profile.wallet_balance < crate.price) {
            addToast('Insufficient Funds', 'Top up your wallet to open this pack.', 'error');
            onNavigate('topup');
            return;
        }

        setOpeningCrateId(crate.id);
        setIsAnimating(true);
        setReward(null);

        try {
            // 1. Determine Prize
            const prize = calculatePrize(crate);

            // 2. Perform Transaction (Deduct Cost + Add Prize)
            let newBalance = profile.wallet_balance - crate.price;
            let newPoints = profile.discord_points;

            if (prize.type === 'money') {
                newBalance += prize.value;
            } else {
                newPoints += prize.value;
            }

            // 3. Database Update
            const { error } = await supabase.from('profiles').update({
                wallet_balance: newBalance,
                discord_points: newPoints
            }).eq('id', profile.id);

            if (error) throw error;

            // 4. Animation Delay
            setTimeout(() => {
                setReward(prize as any);
                setIsAnimating(false);
                setOpeningCrateId(null);
                setProfile({ ...profile, wallet_balance: newBalance, discord_points: newPoints });
                addToast('Pack Opened!', `You won ${prize.type === 'money' ? prize.value + ' DH' : prize.value + ' Points'}`, 'success');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            addToast('Error', 'Transaction failed.', 'error');
            setIsAnimating(false);
            setOpeningCrateId(null);
        }
    };

    const getIcon = (type: string) => {
        switch(type) {
            case 'zap': return <Zap className="w-12 h-12 text-purple-400" />;
            case 'trophy': return <Trophy className="w-12 h-12 text-yellow-400" />;
            default: return <Package className="w-12 h-12 text-blue-400" />;
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-blue-500"/></div>;

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-20">
            {/* Hero */}
            <div className="relative py-20 bg-[#0b0e14] overflow-hidden text-center border-b border-gray-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-yellow-600/10 to-transparent blur-3xl pointer-events-none"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-900/20 border border-yellow-500/30 text-yellow-400 font-black uppercase text-[10px] tracking-[0.2em] mb-6">
                        <Sparkles className="w-4 h-4" /> Win Big Rewards
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-6 leading-none">
                        Moon <span className="text-yellow-500">Packs</span>
                    </h1>
                    <p className="text-gray-400 text-sm font-bold max-w-xl mx-auto mb-8">
                        Open mystery packs for a chance to win massive Wallet Balance top-ups and Discord Points. Are you feeling lucky?
                    </p>
                    
                    {profile && (
                        <div className="flex items-center justify-center gap-6">
                            <div className="bg-[#1e232e] border border-gray-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                                <Wallet className="w-5 h-5 text-blue-500" />
                                <div className="text-left">
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Wallet</p>
                                    <p className="text-white font-black italic">{profile.wallet_balance.toFixed(2)} DH</p>
                                </div>
                            </div>
                            <div className="bg-[#1e232e] border border-gray-800 px-6 py-3 rounded-2xl flex items-center gap-3">
                                <Trophy className="w-5 h-5 text-purple-500" />
                                <div className="text-left">
                                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Points</p>
                                    <p className="text-white font-black italic">{profile.discord_points}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Packs Grid */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {crates.map((crate) => (
                        <div 
                            key={crate.id}
                            className={`relative bg-[#1e232e] rounded-[2.5rem] border-2 p-8 flex flex-col items-center text-center transition-all duration-300 group hover:-translate-y-2 ${crate.border_color || 'border-blue-500'} ${openingCrateId === crate.id ? 'animate-bounce-slow' : ''}`}
                        >
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 ${crate.color || 'bg-blue-900/40'} blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>
                            
                            <div className="relative z-10 mb-6 group-hover:scale-110 transition-transform duration-500">
                                {getIcon(crate.icon_type)}
                            </div>

                            <h3 className="relative z-10 text-2xl font-black text-white italic uppercase tracking-tighter mb-2">{crate.name}</h3>
                            <p className="relative z-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8 h-8">{crate.potential_rewards}</p>

                            <div className="mt-auto relative z-10 w-full">
                                <p className="text-3xl font-black text-white italic tracking-tighter mb-4">{crate.price} DH</p>
                                <button 
                                    onClick={() => handleOpenCrate(crate)}
                                    disabled={!!openingCrateId}
                                    className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-xl ${
                                        openingCrateId 
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                        : `bg-gradient-to-r from-gray-100 to-gray-300 text-black hover:scale-[1.02] active:scale-95`
                                    }`}
                                >
                                    {openingCrateId === crate.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Open Pack'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Prize Overlay Modal */}
            {reward && !isAnimating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
                    <div className="text-center relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-[100px] rounded-full animate-pulse"></div>
                        <div className="relative z-10">
                            <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                {reward.type === 'money' ? 'CASH WIN!' : 'POINTS WIN!'}
                            </h2>
                            <div className="my-8 transform scale-150">
                                {reward.type === 'money' ? <Wallet className="w-24 h-24 text-green-400 mx-auto animate-bounce" /> : <Trophy className="w-24 h-24 text-purple-400 mx-auto animate-bounce" />}
                            </div>
                            <p className={`text-5xl font-black italic tracking-tighter mb-8 ${reward.type === 'money' ? 'text-green-400' : 'text-purple-400'}`}>
                                +{reward.value} {reward.type === 'money' ? 'DH' : 'PTS'}
                            </p>
                            <button 
                                onClick={() => setReward(null)}
                                className="bg-white text-black px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform shadow-2xl flex items-center gap-3 mx-auto"
                            >
                                Collect Reward <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
