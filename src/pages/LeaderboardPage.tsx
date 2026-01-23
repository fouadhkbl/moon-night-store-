
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types';
import { Trophy, Medal, Crown, Heart, Wallet, Shield } from 'lucide-react';

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

  const isDonation = activeTab === 'donations';
  const metricLabel = isDonation ? 'DH' : 'PTS';

  const getScore = (p: Profile) => isDonation ? p.total_donated : p.discord_points;
  const formatScore = (val: number) => isDonation ? val.toFixed(2) : val.toLocaleString();

  const renderPodiumCard = (profile: Profile, rank: number) => {
      if (!profile) return null;
      
      const isVip = profile.vip_level > 0;

      let borderColor = 'border-gray-700';
      let shadowColor = 'shadow-none';
      let icon = null;
      let heightClass = 'h-64';
      let badgeColor = 'bg-gray-700';
      let backgroundClass = 'bg-[#1e232e]';

      // Apply VIP Gold Theme if user is VIP
      if (isVip) {
          backgroundClass = 'bg-gradient-to-b from-yellow-900/40 via-[#1e232e] to-[#1e232e]';
      }
      
      if (rank === 1) {
          borderColor = 'border-yellow-500';
          shadowColor = isVip ? 'shadow-[0_0_60px_rgba(234,179,8,0.4)]' : 'shadow-[0_0_50px_rgba(234,179,8,0.2)]';
          icon = <Crown className="w-8 h-8 text-yellow-500 fill-yellow-500 absolute -top-10 left-1/2 -translate-x-1/2 animate-bounce-slow" />;
          heightClass = 'h-72 md:h-80'; // Taller
          badgeColor = 'bg-yellow-500 text-black';
      } else if (rank === 2) {
          borderColor = 'border-gray-400';
          shadowColor = 'shadow-[0_0_30px_rgba(156,163,175,0.2)]';
          heightClass = 'h-64 md:h-72';
          badgeColor = 'bg-gray-400 text-black';
      } else if (rank === 3) {
          borderColor = 'border-orange-700';
          shadowColor = 'shadow-[0_0_30px_rgba(194,65,12,0.2)]';
          heightClass = 'h-64 md:h-72';
          badgeColor = 'bg-orange-700 text-white';
      }

      if (isVip && rank !== 1) {
          borderColor = 'border-yellow-500/50'; // VIPs get gold borders even if not rank 1
      }

      return (
          <div className={`relative ${backgroundClass} rounded-3xl border-2 ${borderColor} ${shadowColor} flex flex-col items-center justify-center p-6 ${heightClass} w-full md:w-64 transition-transform hover:scale-105 overflow-hidden`}>
              {/* VIP Texture Overlay */}
              {isVip && (
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
              )}
              
              {icon}
              <div className="relative mb-4 z-10">
                  <div className={`w-24 h-24 rounded-full p-1 border-2 ${borderColor} relative`}>
                      <img 
                          src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.username}&background=random`} 
                          alt={profile.username} 
                          className="w-full h-full rounded-full object-cover"
                      />
                      {isVip && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] font-black px-1.5 py-0.5 rounded-full border border-black shadow-lg z-20">VIP</div>
                      )}
                  </div>
                  <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black ${badgeColor} border-4 border-[#1e232e]`}>
                      {rank}
                  </div>
              </div>
              <h3 className={`font-black italic uppercase tracking-tighter text-lg mb-1 truncate max-w-full px-2 z-10 ${isVip ? 'text-yellow-200 drop-shadow-md' : 'text-white'}`}>
                  {profile.username}
              </h3>
              <p className={`text-xl font-black italic tracking-tighter z-10 ${isDonation ? 'text-yellow-400' : 'text-purple-400'}`}>
                  {formatScore(getScore(profile))} <span className="text-xs text-gray-500">{metricLabel}</span>
              </p>
              
              {/* Balance Badge */}
              <div className="mt-4 bg-[#0b0e14]/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-gray-800 flex items-center gap-2 z-10">
                  <Wallet className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-bold text-blue-400">{profile.wallet_balance.toFixed(2)} DH</span>
              </div>
          </div>
      );
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in max-w-5xl pb-32">
        <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 leading-[0.85]">
                {isDonation ? 'DONATION' : 'POINTS'} <br/>
                <span className={isDonation ? 'text-yellow-500' : 'text-purple-500'}>LEADERBOARD</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-lg mx-auto">
                {isDonation ? 'Recognizing our top supporters' : 'Celebrating our most active members'}
            </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-16">
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
            <div className="flex justify-center py-20"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : topProfiles.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-[3rem]">
                <p className="text-gray-500 font-black uppercase tracking-widest">No data available yet.</p>
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
            <>
                {/* PODIUM SECTION (Top 3) */}
                <div className="flex flex-col md:flex-row items-end justify-center gap-6 md:gap-8 mb-16 px-4">
                    {/* Rank 2 (Left on Desktop) */}
                    <div className="order-2 md:order-1 w-full md:w-auto flex justify-center">
                        {renderPodiumCard(topProfiles[1], 2)}
                    </div>
                    
                    {/* Rank 1 (Center on Desktop) */}
                    <div className="order-1 md:order-2 w-full md:w-auto flex justify-center -mt-8 md:mt-0 z-10">
                        {renderPodiumCard(topProfiles[0], 1)}
                    </div>
                    
                    {/* Rank 3 (Right on Desktop) */}
                    <div className="order-3 md:order-3 w-full md:w-auto flex justify-center">
                        {renderPodiumCard(topProfiles[2], 3)}
                    </div>
                </div>

                {/* LIST SECTION (Rank 4+) */}
                {topProfiles.length > 3 && (
                    <div className="space-y-3 max-w-4xl mx-auto">
                        {/* Header for list */}
                        <div className="flex items-center px-6 py-2 text-[10px] font-black uppercase tracking-widest text-gray-600">
                            <div className="w-10 text-center">Rank</div>
                            <div className="flex-1 ml-4">User</div>
                            <div className="hidden md:block w-32 text-center">Balance</div>
                            <div className="w-24 text-right">Score</div>
                        </div>

                        {topProfiles.slice(3).map((profile, index) => {
                            const rank = index + 4;
                            const isVipList = profile.vip_level > 0;
                            return (
                                <div 
                                    key={profile.id} 
                                    className={`border border-gray-800 rounded-2xl p-4 flex items-center gap-4 transition-all hover:border-blue-500/30 ${isVipList ? 'bg-gradient-to-r from-[#1e232e] to-yellow-900/10 border-yellow-900/30' : 'bg-[#1e232e]'}`}
                                >
                                    <div className="w-10 text-center font-black text-gray-500 text-lg">#{rank}</div>
                                    
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 relative">
                                            <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                                            {isVipList && <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-500 rounded-bl-lg"></div>}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`font-bold text-sm truncate ${isVipList ? 'text-yellow-200' : 'text-white'}`}>
                                                {profile.username}
                                                {isVipList && <span className="ml-2 text-[8px] bg-yellow-500 text-black px-1 rounded font-black">VIP</span>}
                                            </h4>
                                            <p className="text-[10px] text-gray-500 truncate">@{profile.username.toLowerCase().replace(/\s/g, '_')}</p>
                                        </div>
                                    </div>

                                    {/* Balance Pill (Replaces Level) */}
                                    <div className="hidden md:flex items-center justify-center w-32">
                                        <div className="bg-cyan-900/20 text-cyan-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-cyan-500/20 w-fit">
                                            {profile.wallet_balance.toFixed(0)} DH
                                        </div>
                                    </div>

                                    <div className="w-24 text-right">
                                        <p className={`font-black italic text-lg tracking-tighter ${isDonation ? 'text-yellow-400' : 'text-purple-400'}`}>
                                            {formatScore(getScore(profile))}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </>
        )}
    </div>
  );
};
