import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Profile } from '../types';
import { Trophy, Medal, Crown, User } from 'lucide-react';

export const LeaderboardPage = ({ onNavigate }: { onNavigate: (p: string) => void }) => {
  const [topDonors, setTopDonors] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
        setIsLoading(true);
        // Fetch profiles with > 0 donations, order by total_donated desc
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .gt('total_donated', 0)
            .order('total_donated', { ascending: false })
            .limit(50);
        
        if (data) setTopDonors(data);
        setIsLoading(false);
    };
    fetchLeaderboard();
  }, []);

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

  return (
    <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl pb-32">
        <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center p-4 bg-yellow-500/10 rounded-full mb-6 border border-yellow-500/20">
                <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4">
                Donation <span className="text-yellow-500">Legends</span>
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs max-w-lg mx-auto">
                Celebrating the top supporters who keep Moon Night running.
            </p>
        </div>

        {isLoading ? (
            <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-24 bg-[#1e232e] rounded-3xl animate-pulse border border-gray-800"></div>
                ))}
            </div>
        ) : topDonors.length === 0 ? (
            <div className="text-center py-20 border-2 border-dashed border-gray-800 rounded-[3rem]">
                <p className="text-gray-500 font-black uppercase tracking-widest">No donations yet. Be the first!</p>
                <button onClick={() => onNavigate('donate')} className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl">
                    Donate Now
                </button>
            </div>
        ) : (
            <div className="space-y-4">
                {topDonors.map((donor, index) => (
                    <div 
                        key={donor.id} 
                        className={`p-6 rounded-[2rem] border flex items-center gap-6 shadow-2xl transition-all hover:scale-[1.01] ${getRowStyle(index)}`}
                    >
                        <div className="w-16 flex justify-center flex-shrink-0">
                            {getRankIcon(index)}
                        </div>
                        
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-gray-800 flex-shrink-0">
                            {donor.avatar_url ? (
                                <img src={donor.avatar_url} className="w-full h-full object-cover" alt={donor.username} />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center"><User className="w-6 h-6 text-gray-500" /></div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter truncate">{donor.username}</h3>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Verified Supporter</p>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Total Donated</p>
                            <p className="text-2xl font-black text-yellow-400 italic tracking-tighter">{donor.total_donated.toFixed(2)} DH</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};