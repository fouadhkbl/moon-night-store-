import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types';
import { Trophy, Medal, Crown, User, Heart, Star } from 'lucide-react';

export const LeaderboardPage = ({ onNavigate, type = 'donations' }: { onNavigate: (p: string) => void, type?: 'donations' | 'points' }) => {
  const [topProfiles, setTopProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'donations' | 'points'>(type);

  // Sync state if prop changes
  useEffect(() => {
      setActiveTab(type);
  }, [type]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        setIsLoading(true);
        let query = supabase.from('profiles').select('*');
        
        if (activeTab === 'donations') {
            query = query.gt('total_donated', 0).order('total_donated', { ascending: false });
        } else {
            query = query.gt('discord_points', 0).order('discord_points', { ascending: false });
        }
        
        const { data } = await query.limit(50);
        if (data) setTopProfiles(data);
        else setTopProfiles([]); // Clear if no data
        setIsLoading(false);
    };
    fetchLeaderboard();
  }, [activeTab]);

  const getRankIcon = (index: number) => {
      if (index === 0) return <Crown className="w-8 h-8 text-yellow-400 fill-yellow-400" />;
      if (index === 1) return <Medal className="w-8 h-8 text-gray-300 fill-gray-300" />;
      if (index === 2) return <Medal className="w-8 h-8 text-amber-700 fill-amber-700" />;
      return <span className="text-xl font-black text-gray-600 font-mono">#{index + 1}</span>;
  };

  const getRowStyle = (index: number) => {
      if (index === 0) return 'bg-gradient-to-r from-yellow-900/20 to-[#1e232e] border-yellow-500/30';
      if (index === 1) return 'bg-gradient-to-r from-gray-800/20 to-[#1e232e] border-gray-500/30';
      if (index === 2) return 'bg-gradient-to-r from-amber-900/20 to-[#1e232e] border-amber-700/30';
      return 'bg-[#1e232e] border-gray-800';
  };

  const isDonation = activeTab === 'donations';

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl pb-32">
        <div className="text-center mb-10">
            <div className={`inline-flex items-center justify-center p-4 rounded-full mb-6 border ${isDonation ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' : 'bg-purple-600/10 border-purple-500/20 text-purple-500'}`}>
                {isDonation ? <Heart className="w-12 h-12 fill-current" /> : <Trophy className="w-12 h-12 fill-current" />}
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                {isDonation ? 'Best' : 'Points'} <span className={isDonation ? 'text-yellow-500' : 'text-purple-500'}>{isDonation ? 'Donators' : 'Legends'}</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-lg mx-auto">
                {isDonation ? 'Celebrating the top supporters who keep Moon Night running.' : 'The most active gamers racking up rewards.'}
            </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
            <div className="bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 flex">
                <button 
                    onClick={() => setActiveTab('donations')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'donations' ? 'bg-yellow-500 text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <Heart className="w-4 h-4" /> Donators
                </button>
                <button 
                    onClick={() => setActiveTab('points')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'points' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                    <Trophy className="w-4 h-4" /> Points
                </button>
            </div>
        </div>

        {isLoading ? (
            <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-24 bg-[#1e232e] rounded-3xl animate-pulse border border-gray-800"></div>
                ))}
            </div>
        ) : topProfiles.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-[3rem]">
                <p className="text-gray-500 font-black uppercase tracking-widest">No legends found yet.</p>
                {isDonation ? (
                    <button onClick={() => onNavigate('donate')} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl">
                        Donate Now
                    </button>
                ) : (
                    <button onClick={() => onNavigate('shop')} className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl">
                        Shop to Earn
                    </button>
                )}
            </div>
        ) : (
            <div className="space-y-4">
                {topProfiles.map((profile, index) => (
                    <div 
                        key={profile.id} 
                        className={`p-6 rounded-[2rem] border flex items-center gap-6 shadow-2xl transition-all hover:scale-[1.01] ${getRowStyle(index)}`}
                    >
                        <div className="w-16 flex justify-center flex-shrink-0">
                            {getRankIcon(index)}
                        </div>
                        
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-800 flex-shrink-0 bg-black">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.username} />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center"><User className="w-6 h-6 text-gray-500" /></div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate">{profile.username}</h3>
                            <div className="flex gap-2">
                                <span className="text-[9px] bg-[#0b0e14] px-2 py-0.5 rounded text-gray-500 font-bold uppercase tracking-widest border border-gray-700">Verified</span>
                                {index < 3 && <span className="text-[9px] bg-yellow-500/20 px-2 py-0.5 rounded text-yellow-500 font-bold uppercase tracking-widest border border-yellow-500/30 flex items-center gap-1"><Star className="w-2 h-2"/> Top 3</span>}
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{isDonation ? 'Total Donated' : 'Total Points'}</p>
                            <p className={`text-2xl font-black italic tracking-tighter ${isDonation ? 'text-yellow-400' : 'text-purple-400'}`}>
                                {isDonation ? `${profile.total_donated.toFixed(2)} DH` : `${profile.discord_points} PTS`}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};