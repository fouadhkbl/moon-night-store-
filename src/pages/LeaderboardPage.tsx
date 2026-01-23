
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types';
import { Trophy, Medal, Crown, User, Heart, Star, Shield } from 'lucide-react';

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
      if (index === 0) return <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500 drop-shadow-lg" />;
      if (index === 1) return <Shield className="w-8 h-8 text-gray-300 fill-gray-500" />;
      if (index === 2) return <Medal className="w-8 h-8 text-amber-700 fill-amber-700" />;
      return <span className="text-xl font-black text-gray-600 font-mono">#{index + 1}</span>;
  };

  const getRowStyle = (index: number) => {
      if (index === 0) return 'bg-gradient-to-r from-yellow-900/20 to-[#1e232e] border-yellow-500/50 shadow-yellow-900/20';
      if (index === 1) return 'bg-[#1e232e] border-gray-600 shadow-gray-900/20';
      if (index === 2) return 'bg-[#1e232e] border-amber-900/50 shadow-amber-900/10';
      return 'bg-[#1e232e] border-gray-800';
  };

  const isDonation = activeTab === 'donations';

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl pb-32">
        <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-6 leading-[0.85]">
                {isDonation ? 'BEST' : 'POINTS'} <br/>
                <span className={isDonation ? 'text-yellow-500' : 'text-purple-500'}>{isDonation ? 'DONATORS' : 'LEGENDS'}</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-lg mx-auto">
                {isDonation ? 'THE TOP SUPPORTERS WHO KEEP MOON NIGHT RUNNING.' : 'THE MOST ACTIVE GAMERS RACKING UP REWARDS.'}
            </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
            <div className="bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 flex shadow-xl">
                <button 
                    onClick={() => setActiveTab('donations')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'donations' ? 'bg-yellow-500 text-black shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}
                >
                    <Heart className="w-4 h-4" /> Donators
                </button>
                <button 
                    onClick={() => setActiveTab('points')}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'points' ? 'bg-purple-600 text-white shadow-lg scale-105' : 'text-gray-500 hover:text-white'}`}
                >
                    <Trophy className="w-4 h-4" /> Points
                </button>
            </div>
        </div>

        {isLoading ? (
            <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-24 bg-[#1e232e] rounded-[2rem] animate-pulse border border-gray-800"></div>
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
                        {/* Rank Icon */}
                        <div className="w-10 md:w-16 flex justify-center flex-shrink-0">
                            {getRankIcon(index)}
                        </div>
                        
                        {/* Avatar */}
                        <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 flex items-center justify-center ${index === 0 ? 'border-yellow-500 shadow-lg shadow-yellow-500/20' : 'border-gray-700 bg-indigo-900/50'}`}>
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt={profile.username} />
                            ) : (
                                <span className="text-2xl font-black text-white">{profile.username.charAt(0).toUpperCase()}</span>
                            )}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5">
                                <h3 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter truncate">{profile.username}</h3>
                                <span className="text-gray-600 font-black tracking-widest text-xs hidden md:inline-block">---</span>
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-[#0b0e14] px-2 py-1 rounded-lg border border-gray-800 flex items-center gap-2">
                                    <span className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest">VERIFIED</span>
                                    <div className="bg-gray-800 px-1.5 rounded text-[8px] text-white font-mono">{profile.vip_level || 3}</div>
                                </div>
                            </div>
                        </div>

                        {/* Points/Donation Value */}
                        <div className="text-right flex-shrink-0">
                            <p className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5">{isDonation ? 'TOTAL DONATED' : 'TOTAL POINTS'}</p>
                            <p className={`text-2xl md:text-3xl font-black italic tracking-tighter ${isDonation ? 'text-yellow-400' : 'text-purple-500'}`}>
                                {isDonation ? `${profile.total_donated.toFixed(2)}` : `${profile.discord_points}`} <span className="text-sm md:text-lg">{isDonation ? 'DH' : 'PTS'}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
