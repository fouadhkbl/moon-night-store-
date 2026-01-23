
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile, SpinWheelItem } from '../types';
import { ArrowLeft, Coins, Trophy, Loader2, RefreshCw, Wallet, AlertCircle } from 'lucide-react';

export const SpinWheelPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState<{ type: string, value: number, text: string } | null>(null);
    const [rotation, setRotation] = useState(0);
    const [items, setItems] = useState<SpinWheelItem[]>([]);
    const [loadingItems, setLoadingItems] = useState(true);
    
    // Wheel Config
    const SPIN_COST = 200; 

    useEffect(() => {
        const fetchProfile = async () => {
            if (session?.user?.id && session.user.id !== 'guest-user-123') {
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
    }, [session]);

    const handleSpin = async () => {
        if (!profile) {
            addToast('Login Required', 'Please login to spin.', 'error');
            return;
        }
        if (profile.discord_points < SPIN_COST) {
            addToast('Insufficient Points', `You need ${SPIN_COST} points to spin.`, 'error');
            return;
        }
        if (spinning) return;
        if (items.length === 0) {
            addToast('Error', 'Wheel configuration invalid.', 'error');
            return;
        }

        setSpinning(true);
        setResult(null);

        // Determine result (Weighted Random Logic based on DB probabilities)
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
        
        // Calculate rotation: 
        const segmentAngle = 360 / items.length;
        // The wheel rotates clockwise. To land on index, we need to rotate back by index * angle.
        // Assuming the pointer is at the top (0deg visually after offset adjustments).
        // Standard CSS rotation starts at 3 o'clock (0deg). A conic gradient starts at 12 o'clock if from 0deg.
        // Let's adjust so top center is the target.
        // Target Rotation = Full Spins + (Offset to align segment i to top)
        // Offset: 360 - (i * segmentAngle) - (segmentAngle / 2) center alignment
        const targetRotation = 360 * 8 + (360 - (winIndex * segmentAngle)) - (segmentAngle / 2); 
        // Add random jitter within the segment for realism (+/- 20% of segment)
        const jitter = (Math.random() - 0.5) * (segmentAngle * 0.4);
        const finalRotation = targetRotation + jitter;

        setRotation(finalRotation);

        // Database Update after animation delay (approx 4s)
        setTimeout(async () => {
            try {
                let newPoints = profile.discord_points - SPIN_COST;
                let newBalance = profile.wallet_balance;

                if (selectedItem.type === 'points') newPoints += selectedItem.value;
                if (selectedItem.type === 'money') newBalance += selectedItem.value;

                await supabase.from('profiles').update({
                    discord_points: newPoints,
                    wallet_balance: newBalance
                }).eq('id', profile.id);

                setProfile({ ...profile, discord_points: newPoints, wallet_balance: newBalance });
                setResult(selectedItem);
                
                if (selectedItem.type !== 'none') {
                    addToast('Winner!', `You won ${selectedItem.text}!`, 'success');
                } else {
                    addToast('So Close!', 'Better luck next time.', 'info');
                }
            } catch (e) {
                addToast('Error', 'Transaction failed.', 'error');
            } finally {
                setSpinning(false);
            }
        }, 4000);
    };

    // Construct Conic Gradient for the Wheel
    const wheelGradient = items.length > 0 
        ? `conic-gradient(from 0deg, ${items.map((item, index) => `${item.color} ${index * (360/items.length)}deg ${(index + 1) * (360/items.length)}deg`).join(', ')})`
        : 'conic-gradient(#333 0deg 360deg)';

    if (loadingItems) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-purple-500"/></div>;

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
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-900/20 border border-purple-500/30 text-purple-400 font-black uppercase text-[10px] tracking-[0.2em] mb-4">
                        <Coins className="w-4 h-4" /> Cost: {SPIN_COST} Points
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4">Spin & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Win</span></h1>
                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">
                        Test your luck and win real balance or huge point jackpots!
                    </p>
                </div>

                <div className="flex flex-col items-center">
                    {/* WHEEL CONTAINER */}
                    <div className="relative w-80 h-80 md:w-96 md:h-96 mb-12">
                        {/* Pointer */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-white drop-shadow-lg"></div>

                        {/* The Wheel */}
                        <div 
                            className="w-full h-full rounded-full border-8 border-[#1e232e] shadow-2xl relative overflow-hidden transition-transform duration-[4000ms] cubic-bezier(0.1, 0.7, 0.1, 1)"
                            style={{ 
                                transform: `rotate(${rotation}deg)`,
                                background: wheelGradient
                            }}
                        >
                            {/* Can add internal lines or text overlays here if needed, keeping simple gradient for now */}
                        </div>
                        
                        {/* Center Cap */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#1e232e] rounded-full border-4 border-gray-800 flex items-center justify-center shadow-xl z-10">
                            <Trophy className="w-8 h-8 text-yellow-500" />
                        </div>
                    </div>

                    {/* Result Display */}
                    {result && (
                        <div className="mb-8 bg-[#1e232e] border border-gray-800 p-6 rounded-2xl text-center animate-pop-in shadow-2xl">
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">Result</p>
                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">{result.text}</h2>
                            {result.type !== 'none' && (
                                <p className="text-green-400 font-bold text-xs uppercase tracking-widest">Added to Account</p>
                            )}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex flex-col gap-4 w-full max-w-xs">
                        <button 
                            onClick={handleSpin}
                            disabled={spinning || !profile || profile.discord_points < SPIN_COST}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                                spinning 
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                                : (!profile || profile.discord_points < SPIN_COST)
                                    ? 'bg-red-900/20 text-red-500 border border-red-500/20 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 active:scale-95'
                            }`}
                        >
                            {spinning ? <Loader2 className="animate-spin w-5 h-5" /> : <RefreshCw className="w-5 h-5" />} 
                            {spinning ? 'Spinning...' : 'SPIN NOW'}
                        </button>

                        {profile && profile.discord_points < SPIN_COST && (
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
                    </div>
                </div>
            </div>
        </div>
    );
};
