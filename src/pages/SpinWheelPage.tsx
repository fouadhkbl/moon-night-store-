
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, SpinWheelItem } from '../types';
import { ArrowLeft, Coins, Trophy, Loader2, RefreshCw, Wallet, AlertCircle, Lock, Ticket, X, TrendingUp } from 'lucide-react';

export const SpinWheelPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ type: string, value: number, text: string } | null>(null);
    const [rotation, setRotation] = useState(0);
    const [items, setItems] = useState<SpinWheelItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    const [showWinModal, setShowWinModal] = useState(false);
    const [jackpotPool, setJackpotPool] = useState('0.00');
    
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
                // Ensure a Jackpot slice is visually present for the "tease"
                const hasJackpot = data.some(i => i.text.toUpperCase().includes('JACKPOT'));
                if (!hasJackpot) {
                    const visualItems = [...data];
                    visualItems.push({ 
                        id: 'jackpot-visual', 
                        type: 'money', 
                        value: 5000, 
                        text: 'JACKPOT', 
                        color: '#bf953f', 
                        probability: 0, // LOGICALLY ZERO, but visually there
                        is_active: true, 
                        created_at: new Date().toISOString() 
                    });
                    setItems(visualItems);
                } else {
                    setItems(data);
                }
            }
            setLoadingItems(false);
        };
        const fetchJackpot = async () => {
            const { data } = await supabase.from('app_settings').select('value').eq('key', 'global_jackpot_pool').single();
            if (data) setJackpotPool(data.value);
        };

        fetchProfile();
        fetchItems();
        fetchJackpot();

        // Real-time Jackpot Updates
        const channel = supabase.channel('jackpot_sync')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_settings', filter: 'key=eq.global_jackpot_pool' }, (payload) => {
                setJackpotPool(payload.new.value);
            }).subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [session, isGuest]);

    const handleSpin = async () => {
        if (isGuest) {
            addToast('Login Required', 'You must be logged in to spin the wheel.', 'error');
            return;
        }

        if (spinning) return;
        setSpinning(true);
        setShowWinModal(false);

        try {
            const { data: freshProfile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
            
            if (profileError || !freshProfile) throw new Error('Could not verify balance.');

            const hasFreeSpin = (freshProfile.spins_count || 0) > 0;
            if (!hasFreeSpin && freshProfile.discord_points < SPIN_COST) {
                setProfile(freshProfile);
                throw new Error(`Insufficient Points. You need ${SPIN_COST} points.`);
            }

            // Determine Result
            const rand = Math.random() * 100;
            let cumulativeProbability = 0;
            let selectedItem = items[0];
            let winIndex = 0;

            for (let i = 0; i < items.length; i++) {
                cumulativeProbability += items[i].probability;
                if (rand <= cumulativeProbability) {
                    selectedItem = items[i];
                    winIndex = i;
                    break;
                }
            }

            // --- PHANTOM JACKPOT PROTECTION PROTOCOL ---
            // If by any chance a "JACKPOT" slice is hit, redirect to the one next to it (usually 'Retry')
            if (selectedItem.text.toUpperCase().includes('JACKPOT') || selectedItem.value > 1000) {
                winIndex = (winIndex + 1) % items.length;
                selectedItem = items[winIndex];
                console.log("Jackpot protection activated: Redirected result.");
            }
            
            // Rotation Math
            const segmentAngle = 360 / items.length;
            const winningSegmentCenter = (winIndex * segmentAngle) + (segmentAngle / 2);
            const targetBaseAngle = 360 - winningSegmentCenter;
            const minSpins = 360 * 6;
            const currentRotation = rotation;
            const currentRemainder = currentRotation % 360;
            let adjustment = targetBaseAngle - currentRemainder;
            while (adjustment <= 0) adjustment += 360;
            const newRotation = currentRotation + minSpins + adjustment;

            setRotation(newRotation);

            // Update Global Jackpot (increment pot)
            const increment = (Math.random() * 0.4 + 0.1).toFixed(2);
            const newJackpot = (parseFloat(jackpotPool) + parseFloat(increment)).toFixed(2);
            await supabase.from('app_settings').update({ value: newJackpot }).eq('key', 'global_jackpot_pool');

            // Update Database: User Stats
            let newPoints = freshProfile.discord_points;
            let newBalance = freshProfile.wallet_balance;
            let newSpins = freshProfile.spins_count || 0;

            if (hasFreeSpin) newSpins = Math.max(0, newSpins - 1);
            else newPoints -= SPIN_COST;

            if (selectedItem.type === 'points') newPoints += selectedItem.value;
            if (selectedItem.type === 'money') newBalance += selectedItem.value;

            await supabase.from('profiles').update({ discord_points: newPoints, wallet_balance: newBalance, spins_count: newSpins }).eq('id', freshProfile.id);

            setProfile({ ...freshProfile, discord_points: newPoints, wallet_balance: newBalance, spins_count: newSpins });
            setResult(selectedItem);

            setTimeout(() => {
                setSpinning(false);
                setShowWinModal(true);
                if (selectedItem.type !== 'none') addToast('Winner!', `You won ${selectedItem.text}!`, 'success');
                else addToast('So Close!', 'The jackpot was only 1 slice away!', 'info');
            }, 4500);

        } catch (e: any) {
            console.error(e);
            addToast('Error', e.message || 'Transaction failed.', 'error');
            setSpinning(false);
        }
    };

    const wheelGradient = items.length > 0 
        ? `conic-gradient(from 0deg, ${items.map((item, index) => `${item.color} ${index * (360/items.length)}deg ${(index + 1) * (360/items.length)}deg`).join(', ')})`
        : 'conic-gradient(#333 0deg 360deg)';

    const hasSpins = profile && (profile.spins_count || 0) > 0;
    const canSpin = !spinning && profile && (hasSpins || profile.discord_points >= SPIN_COST);

    if (loadingItems) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-purple-500"/></div>;

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-20 relative overflow-hidden">
            <style>{`
                .odometer-digit {
                    background: #1e232e;
                    border: 1px solid rgba(255,255,255,0.05);
                    box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
                }
                .jackpot-glow {
                    text-shadow: 0 0 20px rgba(168, 85, 247, 0.6);
                }
                .gold-shimmer {
                    background: linear-gradient(110deg, #bf953f 8%, #fcf6ba 18%, #b38728 33%);
                    background-size: 200% 100%;
                    animation: gold-shimmer-anim 3s linear infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                @keyframes gold-shimmer-anim { to { background-position: -200% 0; } }
            `}</style>

            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            
            <div className="container mx-auto px-4 py-8 relative z-10">
                <button onClick={() => onNavigate('dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition">
                    <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                </button>

                {/* GLOBAL JACKPOT ODOMETER */}
                <div className="max-w-xl mx-auto mb-12 text-center">
                    <div className="bg-[#151a23] p-8 rounded-[3rem] border border-purple-500/20 shadow-[0_0_50px_rgba(168,85,247,0.15)] relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-[4s]"><Trophy className="w-40 h-40 text-purple-400" /></div>
                        <p className="text-purple-400 font-black uppercase text-[10px] tracking-[0.4em] mb-4 flex items-center justify-center gap-3">
                            <TrendingUp className="w-4 h-4" /> Global Mega Jackpot Pool
                        </p>
                        <div className="flex justify-center items-end gap-2">
                             <div className="flex gap-1">
                                {jackpotPool.split('').map((char, i) => (
                                    <div key={i} className={`odometer-digit w-8 h-12 md:w-12 md:h-16 flex items-center justify-center rounded-xl text-2xl md:text-5xl font-black italic tracking-tighter ${char === '.' ? 'bg-transparent border-none w-4 text-purple-500' : 'text-white'}`}>
                                        {char}
                                    </div>
                                ))}
                             </div>
                             <span className="text-xl md:text-3xl font-black italic text-purple-400 mb-1">DH</span>
                        </div>
                        <div className="mt-6 flex items-center justify-center gap-3">
                             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                             <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">Grows with every spin across the network</p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    {/* WHEEL CONTAINER */}
                    <div className="relative w-[340px] h-[340px] md:w-[480px] md:h-[480px] mb-12">
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20 drop-shadow-2xl">
                            <div className="w-0 h-0 border-l-[25px] border-l-transparent border-r-[25px] border-r-transparent border-t-[50px] border-t-white filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                        </div>

                        <div 
                            className="w-full h-full rounded-full border-[10px] border-[#1e232e] shadow-[0_0_80px_rgba(139,92,246,0.3)] relative overflow-hidden transition-transform duration-[4500ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
                            style={{ 
                                transform: `rotate(${rotation}deg)`,
                                background: wheelGradient
                            }}
                        >
                            {items.map((item, index) => {
                                const segmentAngle = 360 / items.length;
                                const rotate = (index * segmentAngle) + (segmentAngle / 2);
                                const isJackpot = item.text.toUpperCase().includes('JACKPOT');
                                return (
                                    <div 
                                        key={item.id}
                                        className="absolute top-0 left-1/2 w-10 h-[50%] origin-bottom -ml-5 z-10 pointer-events-none"
                                        style={{ transform: `rotate(${rotate}deg)` }}
                                    >
                                        <div className="mt-8 md:mt-12 flex justify-center text-center">
                                            <span 
                                                className={`font-black text-[11px] md:text-sm uppercase tracking-widest whitespace-nowrap drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] ${isJackpot ? 'gold-shimmer' : 'text-white'}`}
                                                style={{ writingMode: 'vertical-rl' }}
                                            >
                                                {item.text}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}

                            <div className="absolute inset-0 m-auto w-2/3 h-2/3 rounded-full border-[1px] border-white/5 pointer-events-none"></div>
                            <div className="absolute inset-0 m-auto w-[18%] h-[18%] rounded-full bg-[#151a23] shadow-2xl flex items-center justify-center border-[4px] border-gray-800 z-20 overflow-hidden">
                                <div className="absolute inset-0 bg-purple-500/10 animate-pulse"></div>
                                <Trophy className="w-6 h-6 md:w-10 md:h-10 text-yellow-500 drop-shadow-lg relative z-10" />
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        {isGuest ? (
                            <div className="bg-[#1e232e] p-6 rounded-3xl border border-red-500/20 text-center shadow-2xl">
                                <Lock className="w-8 h-8 text-red-500 mx-auto mb-3" />
                                <h3 className="text-white font-black uppercase text-sm mb-2">RESTRICTED ACCESS</h3>
                                <p className="text-gray-500 text-[10px] font-bold uppercase mb-6">Identity sync required for wins.</p>
                                <button onClick={() => onNavigate('dashboard')} className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl">Operator Login</button>
                            </div>
                        ) : (
                            <>
                                <button 
                                    onClick={handleSpin}
                                    disabled={!canSpin}
                                    className={`group relative overflow-hidden w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm flex items-center justify-center gap-3 transition-all shadow-2xl ${
                                        !canSpin 
                                        ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 opacity-60' 
                                        : hasSpins 
                                            ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:scale-105 active:scale-95 shadow-green-500/40 border border-green-500/30'
                                            : 'bg-gradient-to-r from-purple-600 to-indigo-700 text-white hover:scale-105 active:scale-95 shadow-purple-500/40 border border-purple-500/30'
                                    }`}
                                >
                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    {spinning ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />} 
                                    {spinning ? 'PROCESSING...' : (hasSpins ? `FREE SPIN (${profile?.spins_count})` : 'EXECUTE SPIN')}
                                </button>

                                {profile && !hasSpins && profile.discord_points < SPIN_COST && (
                                    <div className="flex items-center justify-center gap-2 text-red-400 text-[9px] font-black uppercase tracking-widest bg-red-900/10 p-4 rounded-2xl border border-red-500/20">
                                        <AlertCircle className="w-4 h-4" /> Insufficient Points Protocol
                                    </div>
                                )}

                                <div className="flex justify-between items-center bg-[#151a23] p-5 rounded-2xl border border-white/5 shadow-xl">
                                    <div className="flex flex-col items-center flex-1 border-r border-white/5">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Wallet className="w-3.5 h-3.5 text-blue-500" />
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Wallet</span>
                                        </div>
                                        <span className="text-white font-black italic tracking-tighter text-sm">{profile?.wallet_balance.toFixed(2)} DH</span>
                                    </div>
                                    <div className="flex flex-col items-center flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Coins className="w-3.5 h-3.5 text-purple-500" />
                                            <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Points</span>
                                        </div>
                                        <span className="text-white font-black italic tracking-tighter text-sm">{profile?.discord_points.toLocaleString()}</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* WIN MODAL */}
            {showWinModal && result && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fade-in">
                    <div className="bg-[#1e232e] border border-purple-500/20 p-12 rounded-[4rem] text-center max-w-sm w-full relative shadow-[0_0_100px_rgba(168,85,247,0.2)] animate-pop-in overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
                        <button onClick={() => setShowWinModal(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"><X className="w-5 h-5"/></button>
                        
                        <div className="w-24 h-24 mx-auto mb-8 flex items-center justify-center bg-purple-600/10 rounded-3xl border border-purple-500/30">
                            {result.type === 'money' ? (
                                <Wallet className="w-12 h-12 text-green-400 animate-bounce-slow" />
                            ) : result.type === 'points' ? (
                                <Trophy className="w-12 h-12 text-purple-400 animate-bounce-slow" />
                            ) : (
                                <RefreshCw className="w-12 h-12 text-gray-500" />
                            )}
                        </div>

                        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">{result.text}</h2>
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-10">
                            {result.type === 'none' ? 'Better luck next sequence!' : 'Syncing reward to your gaming ID...'}
                        </p>

                        <button 
                            onClick={() => setShowWinModal(false)}
                            className="w-full bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl hover:scale-105 active:scale-95 transition-all"
                        >
                            Confirm Sync
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
