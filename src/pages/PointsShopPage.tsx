import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PointProduct, Profile } from '../types';
import { Trophy, Clock, Zap, Loader2, ArrowRight } from 'lucide-react';

export const PointsShopPage = ({ session, onNavigate, addToast }: { session: any, onNavigate: (p: string) => void, addToast: any }) => {
    const [products, setProducts] = useState<PointProduct[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [redeemingId, setRedeemingId] = useState<string | null>(null);

    const isGuest = session?.user?.id === 'guest-user-123';

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: prodData } = await supabase.from('point_products').select('*').eq('is_active', true).order('cost', { ascending: true });
            if (prodData) setProducts(prodData);

            if (!isGuest && session?.user?.id) {
                const { data: profData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                if (profData) setProfile(profData);
            }
            setLoading(false);
        };
        fetchData();
    }, [session, isGuest]);

    const handleRedeem = async (product: PointProduct) => {
        if (isGuest) {
            addToast('Login Required', 'You must be logged in to redeem rewards.', 'error');
            return;
        }

        if (!profile) return;

        if (profile.discord_points < product.cost) {
            addToast('Insufficient Points', `You need ${product.cost - profile.discord_points} more points to redeem this.`, 'error');
            return;
        }

        if (!window.confirm(`Are you sure you want to spend ${product.cost} points for "${product.name}"?`)) return;

        setRedeemingId(product.id);

        try {
            // 1. Deduct Points
            const newBalance = profile.discord_points - product.cost;
            const { error: updateError } = await supabase.from('profiles').update({ discord_points: newBalance }).eq('id', profile.id);
            if (updateError) throw updateError;

            // 2. Record Redemption
            const { error: insertError } = await supabase.from('point_redemptions').insert({
                user_id: profile.id,
                product_id: product.id,
                cost_at_redemption: product.cost,
                status: 'delivered' 
            });
            if (insertError) throw insertError;

            setProfile({ ...profile, discord_points: newBalance });
            addToast('Success!', `You have successfully redeemed ${product.name}.`, 'success');

        } catch (err: any) {
            addToast('Error', err.message, 'error');
        } finally {
            setRedeemingId(null);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center text-white"><Loader2 className="w-12 h-12 animate-spin text-purple-500"/></div>;

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-24">
            {/* Header Section */}
            <div className="relative bg-[#1e232e] py-20 border-b border-gray-800 overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-[#0b0e14] to-indigo-900/20"></div>
                 <div className="absolute -right-20 -top-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
                 
                 <div className="container mx-auto px-4 relative z-10 text-center">
                     <div className="inline-flex items-center gap-2 bg-purple-900/20 border border-purple-500/30 px-4 py-2 rounded-full mb-6">
                         <Trophy className="w-4 h-4 text-purple-400" />
                         <span className="text-purple-300 text-[10px] font-black uppercase tracking-[0.2em]">Exclusive Rewards</span>
                     </div>
                     <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-6">
                         POINTS <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">SHOP</span>
                     </h1>
                     <p className="text-gray-400 max-w-2xl mx-auto font-bold text-sm tracking-wide mb-10">
                         Redeem your Discord Points for premium items, boosts, and special advantages.
                     </p>

                     {!isGuest && profile ? (
                         <div className="inline-flex items-center gap-4 bg-[#0b0e14] p-2 pr-6 rounded-full border border-purple-500/30 shadow-2xl shadow-purple-900/20">
                             <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg">
                                 <Trophy className="w-5 h-5" />
                             </div>
                             <div className="text-left">
                                 <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Your Balance</p>
                                 <p className="text-xl font-black text-white italic tracking-tighter leading-none">{profile.discord_points} PTS</p>
                             </div>
                         </div>
                     ) : (
                         <button onClick={() => onNavigate('dashboard')} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-xl">
                             Login to View Points
                         </button>
                     )}
                 </div>
            </div>

            {/* Grid Section */}
            <div className="container mx-auto px-4 py-16">
                 {products.length === 0 ? (
                     <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-[3rem]">
                         <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                         <p className="text-gray-500 font-black uppercase tracking-widest">No rewards available currently.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                         {products.map(product => (
                             <div key={product.id} className="bg-[#1e232e] rounded-[2rem] border border-gray-800 hover:border-purple-500/50 transition-all duration-300 shadow-2xl overflow-hidden group flex flex-col h-full">
                                 <div className="relative h-48 overflow-hidden">
                                     <img src={product.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-75 group-hover:brightness-100" alt={product.name} />
                                     <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-purple-500/30">
                                         <p className="text-purple-400 font-black italic text-lg tracking-tighter">{product.cost} PTS</p>
                                     </div>
                                 </div>
                                 
                                 <div className="p-6 flex flex-col flex-1">
                                     <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-3">{product.name}</h3>
                                     <p className="text-gray-400 text-xs font-bold leading-relaxed mb-6 line-clamp-3 flex-1">{product.description}</p>
                                     
                                     <div className="space-y-3 mb-6">
                                         <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                                             <Clock className="w-4 h-4 text-blue-400" />
                                             <span className="uppercase tracking-widest">Duration:</span>
                                             <span className="text-white ml-auto">{product.duration}</span>
                                         </div>
                                         <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                                             <Zap className="w-4 h-4 text-yellow-400" />
                                             <span className="uppercase tracking-widest">Effect:</span>
                                             <span className="text-white ml-auto">{product.advantage}</span>
                                         </div>
                                     </div>

                                     <button 
                                         onClick={() => handleRedeem(product)}
                                         disabled={redeemingId === product.id || (profile && profile.discord_points < product.cost) || isGuest}
                                         className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all ${
                                             redeemingId === product.id ? 'bg-gray-700 text-gray-400 cursor-not-allowed' :
                                             (profile && profile.discord_points < product.cost) ? 'bg-red-900/20 text-red-500 border border-red-500/20 opacity-70' :
                                             'bg-purple-600 hover:bg-purple-700 text-white shadow-xl shadow-purple-600/20 hover:shadow-purple-600/40 active:scale-95'
                                         }`}
                                     >
                                         {redeemingId === product.id ? <Loader2 className="animate-spin w-4 h-4" /> : 'Redeem Now'} <ArrowRight className="w-4 h-4" />
                                     </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        </div>
    );
};