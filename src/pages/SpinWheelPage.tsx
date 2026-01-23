
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, SpinWheelItem } from '../types';
import { ArrowLeft, Coins, Trophy, Loader2, RefreshCw, Wallet, AlertCircle, Lock, Ticket, X } from 'lucide-react';

export const SpinWheelPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ type: string, value: number, text: string } | null>(null);
    const [rotation, setRotation] = useState(0);
    const [items, setItems] = useState<SpinWheelItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [showWinModal, setShowWinModal] = useState(false);
    
    // Wheel Config
    const SPIN_COST = 200; 
    const isGuest = !session?.user || session.user.id === 'guest-user-123';

    // Initial Fetch
    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user?.id && !isGuest) {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data);
            }
        };
        const fetchItems = async () => {
            const { data } = await supabase.from('spin_wheel_items').select('*').eq('is_active', true).order('created_at', { ascending: true });
            if (data && data.length > 0) {
                setItems(data);
            }
            setLoadingItems(false);
        };
        fetchProfile();
        fetchItems();
    }, [session, isGuest]);

    const handleSpin = async () => {
        if (isGuest) {
            addToast('Login Required', 'You must be logged in to spin the wheel.', 'error');
            return;
        }

        if (spinning) return;
        setSpinning(true);
        setShowWinModal(false);

        // 1. STRICT CHECK: Fetch fresh profile to prevent free spin glitches
        const { data: freshProfile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        
        if (profileError || !freshProfile) {
            addToast('Error', 'Could not verify balance. Try again.', 'error');
            setSpinning(false);
            return;
        }

        const hasFreeSpin = (freshProfile.spins_count || 0) > 0;

        if (!hasFreeSpin && freshProfile.discord_points < SPIN_COST) {
            addToast('Insufficient Points', `You need ${SPIN_COST} points to spin.`, 'error');
            setSpinning(false);
            // Update local state to match server
            setProfile(freshProfile);
            return;
        }

        if (items.length === 0) {
            addToast('Error', 'Wheel configuration invalid.', 'error');
            setSpinning(false);
            return;
        }

        // 2. Determine Result
        const rand = Math.random() * 100;
        let cumulativeProbability = 0;
        let selectedItem = items[items.length - 1]; // Default fallback
        let winIndex = items.length - 1;

        for (let i = 0; i < items.length; i++) {
            cumulativeProbability += items[i].probability;
            if (rand <= cumulativeProbability) {
                selectedItem = items[i];
                winIndex = i;
                break;
            }
        }
        
        // 3. Calculate Physics
        const segmentAngle = 360 / items.length;
        // Logic: 360*5 (spins) + (360 - index*angle) - half_segment (to center)
        // Adjust for default 0deg being 12 o'clock
        const targetRotation = rotation + 1800 + (360 - (winIndex * segmentAngle)) - (rotation % 360); 
        // Note: Simplified logic to ensure forward rotation
        const finalRotation = 360 * 5 + (360 - winIndex * segmentAngle) - (segmentAngle / 2);

        setRotation(prev => prev + 360 * 5 + (360 - (winIndex * segmentAngle) - (prev % 360)) - (segmentAngle / 2));

        // 4. Update Database IMMEDIATELY (to prevent tab-closing exploits)
        // We do this while animation plays, but result is shown after.
        try {
            let newPoints = freshProfile.discord_points;
            let newBalance = freshProfile.wallet_balance;
            let newSpins = freshProfile.spins_count || 0;

            // Deduct Cost
            if (hasFreeSpin) {
                newSpins = Math.max(0, newSpins - 1);
            } else {
                newPoints -= SPIN_COST;
            }

            // Add Reward
            if (selectedItem.type === 'points') newPoints += selectedItem.value;
            if (selectedItem.type === 'money') newBalance += selectedItem.value;

            const { error: updateError } = await supabase.from('profiles').update({
                discord_points: newPoints,
                wallet_balance: newBalance,
                spins_count: newSpins
            }).eq('id', freshProfile.id);

            if (updateError) throw updateError;

            // Update local profile state for UI (optimistic/confirmed)
            setProfile({ ...freshProfile, discord_points: newPoints, wallet_balance: newBalance, spins_count: newSpins });
            setResult(selectedItem);

            // 5. Show Result AFTER Animation
            setTimeout(() => {
                setSpinning(false);
                setShowWinModal(true);
                if (selectedItem.type !== 'none') {
                    addToast('Winner!', `You won ${selectedItem.text}!`, 'success');
                } else {
                    addToast('So Close!', 'Better luck next time.', 'info');
                }
            }, 4500); // 4.5s animation match

        } catch (e) {
            console.error(e);
            addToast('Error', 'Transaction failed. Please contact support.', 'error');
            setSpinning(false);
        }
    };

    // Wheel Gradient
    const wheelGradient = items.length > 0 
        ? `conic-gradient(from 0deg, ${items.map((item, index) => `${item.color} ${index * (360/items.length)}deg ${(index + 1) * (360/items.length)}deg`).join(', ')})`
        : 'conic-gradient(#333 0deg 360deg)';

    if (loadingItems) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-purple-500"/></div>;

    const hasSpins = profile && (profile.spins_count || 0) > 0;

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-20 relative overflow-hidden">
            {/* Background FX */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="container mx-auto px-4 py-8 relative z-10">
                <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                <div className="text-center mb-10">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-4 ${hasSpins ? 'bg-green-900/20 border-green-500/30 text-green-400 animate-pulse' : 'bg-purple-900/20 border-purple-500/30 text-purple-400'}`}>
                        {hasSpins ? <Ticket className="w-4 h-4" /> : <Coins className="w-4 h-4" />} 
                        <span className="font-black uppercase text-[10px] tracking-[0.2em]">
                            {hasSpins ? `${profile?.spins_count} Free Spin(s) Available` : `Cost: ${SPIN_COST} Points`}
                        </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4">Spin & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Win</span></h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">
                        Test your luck and win real balance or huge point jackpots!
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    {/* WHEEL CONTAINER */}
                    <div className="relative w-[340px] h-[340px] md:w-[450px] md:h-[450px] mb-12">
                        {/* Pointer - Top Center */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-20 drop-shadow-xl">
                            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-white filter drop-shadow-md"></div>
                        </div>

                        {/* The Wheel */}
                        <div 
                            className="w-full h-full rounded-full border-8 border-[#1e232e] shadow-[0_0_50px_rgba(139,92,246,0.2)] relative overflow-hidden transition-transform duration-[4500ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
                            style={{ 
                                transform: `rotate(${rotation}deg)`,
                                background: wheelGradient
                            }}
                        >
                            {/* Segment Labels */}
                            {items.map((item, index) => {
                                const segmentAngle = 360 / items.length;
                                // Rotation to position text in center of slice
                                const rotate = (index * segmentAngle) + (segmentAngle / 2);
                                return (
                                    <div 
                                        key={item.id}
                                        className="absolute top-0 left-1/2 w-[1px] h-[50%] origin-bottom"
                                        style={{ transform: `translateX(-50%) rotate(${rotate}deg)` }}
                                    >
                                        <div className="mt-8 md:mt-12 flex flex-col items-center justify-start h-full">
                                            <span 
                                                className="text-white font-black text-[10px] md:text-sm uppercase tracking-widest whitespace-nowrap drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                                                style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                                            >
                                                {item.text}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Inner Circle for style */}
                            <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full border-[1px] border-white/10 pointer-events-none"></div>
                            {/* Hub Cap to hide center convergence */}
                            <div className="absolute inset-0 m-auto w-[25%] h-[25%] rounded-full bg-[#1e232e] shadow-2xl flex items-center justify-center border-4 border-gray-800 z-10">
                                <Trophy className="w-8 h-8 md:w-12 md:h-12 text-yellow-500 drop-shadow-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        {isGuest ? (
                            <div className="bg-[#1e232e] p-6 rounded-2xl border border-red-500/20 text-center">
                                <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <h3 className="text-white font-bold mb-2">Login Required</h3>
                                <p className="text-gray-500 text-xs mb-4">You must be logged in to play.</p>
                                <button onClick={() => onNavigate('dashboard')} className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest">Go to Login</button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={handleSpin}
                                    disabled={spinning || (!hasSpins && profile && profile.discord_points < SPIN_COST)}
                                    className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                                        spinning 
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                        : (!hasSpins && profile && profile.discord_points < SPIN_COST)
                                            ? 'bg-red-900/20 text-red-500 border border-red-500/20 cursor-not-allowed'
                                            : hasSpins 
                                                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 active:scale-95 shadow-green-500/20'
                                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 active:scale-95'
                                    }`}
                                >
                                    {spinning ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />} 
                                    {spinning ? 'Spinning...' : (hasSpins ? `SPIN FREE (${profile?.spins_count})` : 'SPIN NOW')}
                                </button>

                                {profile && !hasSpins && profile.discord_points < SPIN_COST && (
                                    <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold uppercase tracking-widest bg-red-900/10 p-3 rounded-xl border border-red-500/20">
                                        <AlertCircle className="w-4 h-4" /> Not enough points
                                    </div>
                                )}

                                {profile && (
                                    <div className="flex justify-between items-center bg-[#1e232e] p-4 rounded-xl border border-gray-800">
                                        <div className="flex items-center gap-2">
                                            <Wallet className="w-4 h-4 text-blue-500" />
                                            <span className="text-white font-bold text-xs">{profile.wallet_balance.toFixed(2)} DH</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Coins className="w-4 h-4 text-purple-500" />
                                            <span className="text-white font-bold text-xs">{profile.discord_points} PTS</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* WIN MODAL */}
            {showWinModal && result && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="bg-[#1e232e] border border-gray-800 p-10 rounded-[3rem] text-center max-w-sm w-full relative shadow-2xl animate-pop-in">
                        <button onClick={() => setShowWinModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X className="w-6 h-6"/></button>
                        
                        <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                            {result.type === 'money' ? (
                                <Wallet className="w-20 h-20 text-green-400 animate-bounce-slow" />
                            ) : result.type === 'points' ? (
                                <Trophy className="w-20 h-20 text-purple-400 animate-bounce-slow" />
                            ) : (
                                <RefreshCw className="w-20 h-20 text-gray-500" />
                            )}
                        </div>

                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">{result.text}</h2>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                            {result.type === 'none' ? 'Bad luck! Try again.' : 'Reward has been added to your account.'}
                        </p>

                        <button 
                            onClick={() => setShowWinModal(false)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl transition-all active:scale-95"
                        >
                            Collect
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
