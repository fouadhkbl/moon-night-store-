
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Tournament } from '../types';
import { Trophy, Calendar, Users, Gamepad2, ChevronRight, Swords, Zap } from 'lucide-react';

export const TournamentsPage = ({ onNavigate, onSelectTournament }: { onNavigate: (p: string) => void, onSelectTournament: (t: Tournament) => void }) => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'open' | 'live' | 'past'>('all');

    useEffect(() => {
        const fetchTournaments = async () => {
            setLoading(true);
            const { data } = await supabase.from('tournaments').select('*').order('created_at', { ascending: false });
            if (data) setTournaments(data);
            setLoading(false);
        };
        fetchTournaments();
    }, []);

    const filteredTournaments = tournaments.filter(t => activeTab === 'all' || t.status === activeTab);

    return (
        <div className="container mx-auto px-4 py-12 animate-fade-in pb-32">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                    GAME <span className="text-blue-500">TOURNAMENTS</span>
                </h1>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-lg mx-auto">
                    Compete in the most elite gaming events and win massive prizes.
                </p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="bg-[#1e232e] p-1.5 rounded-2xl border border-white/5 flex gap-1 overflow-x-auto no-scrollbar max-w-full">
                    {['all', 'open', 'live', 'past'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${
                                activeTab === tab 
                                ? 'bg-blue-600 text-white shadow-lg' 
                                : 'text-gray-500 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Swords className="w-12 h-12 text-blue-500 animate-spin" /></div>
            ) : filteredTournaments.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem] bg-[#1e232e]/30">
                    <Trophy className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">No events found in this category.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTournaments.map(t => (
                        <div 
                            key={t.id}
                            onClick={() => { onSelectTournament(t); onNavigate('tournament-details'); }}
                            className="group bg-[#1e232e] rounded-[2rem] border border-white/5 overflow-hidden cursor-pointer transition-all duration-300 hover:border-blue-500/50 hover:-translate-y-1 shadow-2xl flex flex-col"
                        >
                            <div className="h-48 relative overflow-hidden bg-black">
                                <img src={t.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80" alt="" />
                                <div className="absolute top-4 left-4">
                                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${
                                        t.status === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                        t.status === 'live' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 
                                        'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                    }`}>
                                        {t.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.2em] mb-2">{t.game_name}</p>
                                <h3 className="text-xl font-black text-white italic uppercase tracking-tighter mb-4 leading-tight">
                                    {t.title}
                                </h3>
                                
                                <div className="grid grid-cols-2 gap-4 mt-auto border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Prize Pool</p>
                                        <p className="text-lg font-black text-yellow-400 italic tracking-tighter">{t.prize_pool}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Participants</p>
                                        <p className="text-lg font-black text-white italic tracking-tighter">{t.current_participants}/{t.max_participants}</p>
                                    </div>
                                </div>

                                <button className="mt-6 w-full py-4 bg-white/5 hover:bg-blue-600 text-gray-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 group-hover:bg-blue-600 group-hover:text-white">
                                    View Details <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-20 p-12 bg-[#1e232e] border border-white/5 rounded-[3rem] text-center shadow-3xl">
                <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
                    <Gamepad2 className="w-10 h-10 text-blue-500" />
                </div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">Want to Host?</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] max-w-sm mx-auto mb-8 leading-relaxed">
                    Contact our management team on Discord to organize your own community tournament with prize support.
                </p>
                <a href="https://discord.gg/s4hcCn4s" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-blue-600/20">
                    Join Discord Server
                </a>
            </div>
        </div>
    );
};
