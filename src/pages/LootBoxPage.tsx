
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Zap, Trophy, Loader2, Sparkles, Wallet, ArrowRight, Box } from 'lucide-react';
import { Profile, LootBox } from '../types';

// Fallback constant
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
        potential_rewards: 'Win up to 250 DH or 5000 Points',
        created_at: new Date().toISOString()
    },
    {
        id: 'god',
        name: 'God Pack',
        price: 100,
        multiplier: 10,
        color: 'bg-yellow-900/40',
        border_color: 'border-yellow-500',
        glow_color: 'shadow-yellow-500/20',
        icon_type: 'trophy',
        potential_rewards: 'Win up to 500 DH or 10000 Points',
        created_at: new Date().toISOString()
    }
];

export const LootBoxPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [openingCrateId, setOpeningCrateId] = useState<string | null>(null);
    const [reward, setReward] = useState<{ type: 'money' | 'points', value: number } | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationPhase, setAnimationPhase] = useState<'idle' | 'shaking' | 'exploding' | 'revealed'>('idle');
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
    }, [session]); 

    // Calculate prize based on probability
    const calculatePrize = (crate: LootBox) => {
        const rand = Math.random() * 100;
        const multiplier = crate.multiplier || 1;

        if (rand < 60) {
            // Points Reward (60%)
            const basePoints = Math.floor(Math.random() * 50) + 50; 
            return { type: 'points', value: Math.floor(basePoints * multiplier * 2) }; 
        } else if (rand < 90) {
            // Small Money Return (30%)
            const returnRate = Math.random() * 0.3 + 0.2; 
            return { type: 'money', value: Number((crate.price * returnRate).toFixed(2)) };
        } else if (rand < 98) {
            // Winning / Profit (8%)
            const returnRate = Math.random() * 0.5 + 1.1; 
            return { type: 'money', value: Number((crate.price * returnRate).toFixed(2)) };
        } else {
            // JACKPOT (2%)
            return { type: 'money', value: Number((crate.price * 5).toFixed(2)) }; 
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
        setAnimationPhase('shaking');
        setReward(null);

        try {
            // 1. Calculate Prize
            const prize = calculatePrize(crate);

            // 2. Local State Updates (Optimistic)
            let newBalance = profile.wallet_balance - crate.price;
            let newPoints = profile.discord_points;

            if (prize.type === 'money') {
                newBalance += prize.value;
            } else {
                newPoints += prize.value;
            }

            // 3. Database Update: Profile
            await supabase.from('profiles').update({
                wallet_balance: newBalance,
                discord_points: newPoints
            }).eq('id', profile.id);

            // 4. Database Insert: Loot Box Log
            await supabase.from('loot_box_opens').insert({
                user_id: profile.id,
                loot_box_id: crate.id,
                box_name: crate.name,
                box_price: crate.price,
                reward_type: prize.type,
                reward_value: prize.value
            });

            // 5. Animation Sequence
            setTimeout(() => {
                setAnimationPhase('exploding');
                setTimeout(() => {
                    setReward(prize as any);
                    setAnimationPhase('revealed');
                    setProfile({ ...profile, wallet_balance: newBalance, discord_points: newPoints });
                    setOpeningCrateId(null);
                }, 800); // Wait for explosion
            }, 2500); // Shaking duration

        } catch (err: any) {
            console.error(err);
            addToast('Error', 'Transaction failed.', 'error');
            setIsAnimating(false);
            setOpeningCrateId(null);
            setAnimationPhase('idle');
        }
    };

    const handleCloseModal = () => {
        setIsAnimating(false);
        setAnimationPhase('idle');
        setReward(null);
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
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-20 relative">
            <style>{`
                @keyframes shake {
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
                .animate-shake-crazy {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) infinite;
                }
                @keyframes rays {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: rays 10s linear infinite;
                }
                .animate-pop-in {
                    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes popIn {
                    0% { opacity: 0; transform: scale(0.5); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>

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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {crates.map((crate) => (
                        <div 
                            key={crate.id}
                            className={`relative bg-[#1e232e] rounded-[2.5rem] border-2 p-8 flex flex-col items-center text-center transition-all duration-300 group hover:-translate-y-2 ${crate.border_color || 'border-blue-500'} ${openingCrateId === crate.id ? 'opacity-50' : ''}`}
                        >
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
                                    Open Pack
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ANIMATION OVERLAY */}
            {isAnimating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-fade-in">
                    
                    {/* Phase 1: Shaking Crate */}
                    {animationPhase === 'shaking' && (
                        <div className="relative text-center">
                            <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full"></div>
                            <div className="relative z-10 animate-shake-crazy origin-bottom">
                                <Box className="w-48 h-48 text-yellow-500 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)] fill-yellow-900/50" strokeWidth={1.5} />
                            </div>
                            <p className="text-white font-black uppercase tracking-[0.5em] mt-12 animate-pulse text-lg">Opening...</p>
                        </div>
                    )}

                    {/* Phase 2: Explosion (Light Burst) */}
                    {animationPhase === 'exploding' && (
                        <div className="absolute inset-0 bg-white animate-fade-in duration-300 flex items-center justify-center">
                            <div className="w-full h-full bg-white opacity-0 animate-[ping_0.5s_ease-in-out]"></div>
                        </div>
                    )}

                    {/* Phase 3: Reward Reveal */}
                    {animationPhase === 'revealed' && reward && (
                        <div className="text-center relative animate-pop-in w-full max-w-lg">
                            {/* Background Rays */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-30 animate-spin-slow pointer-events-none">
                                <div className={`w-full h-full bg-gradient-to-r ${reward.type === 'money' ? 'from-green-500/0 via-green-500/20 to-green-500/0' : 'from-purple-500/0 via-purple-500/20 to-purple-500/0'}`} style={{ clipPath: 'polygon(50% 50%, 0 0, 100% 0)' }}></div>
                                <div className={`w-full h-full bg-gradient-to-r ${reward.type === 'money' ? 'from-green-500/0 via-green-500/20 to-green-500/0' : 'from-purple-500/0 via-purple-500/20 to-purple-500/0'}`} style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%)', transform: 'rotate(90deg)' }}></div>
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 blur-3xl"></div>
                            
                            <div className="relative z-10">
                                <h2 className="text-6xl font-black text-white italic uppercase tracking-tighter mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                    {reward.type === 'money' ? 'CASH WIN!' : 'POINTS WIN!'}
                                </h2>
                                
                                <div className="my-10 transform scale-150 transition-transform hover:scale-[1.6]">
                                    {reward.type === 'money' ? (
                                        <Wallet className="w-32 h-32 text-green-400 mx-auto drop-shadow-[0_0_50px_rgba(74,222,128,0.5)]" />
                                    ) : (
                                        <Trophy className="w-32 h-32 text-purple-400 mx-auto drop-shadow-[0_0_50px_rgba(192,132,252,0.5)]" />
                                    )}
                                </div>

                                <p className={`text-6xl font-black italic tracking-tighter mb-12 ${reward.type === 'money' ? 'text-green-400' : 'text-purple-400'} drop-shadow-2xl`}>
                                    +{reward.value} {reward.type === 'money' ? 'DH' : 'PTS'}
                                </p>

                                <button 
                                    onClick={handleCloseModal}
                                    className="bg-white text-black px-16 py-5 rounded-3xl font-black uppercase tracking-widest text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-4 mx-auto"
                                >
                                    Claim Reward <ArrowRight className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
