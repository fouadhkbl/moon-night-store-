import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Tournament } from '../types';
import { Trophy, Calendar, Users, Gamepad2, ChevronRight, Swords, Clock, CheckCircle } from 'lucide-react';

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

    // Count stats
    const openCount = tournaments.filter(t => t.status === 'open').length;
    const liveCount = tournaments.filter(t => t.status === 'live').length;
    const totalCount = tournaments.length;

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-24">
            {/* Hero Section */}
            <div className="relative py-24 bg-[#0b0e14] overflow-hidden text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-gradient-to-b from-blue-600/10 to-transparent blur-3xl pointer-events-none"></div>
                <h1 className="relative z-10 text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter mb-4">
                    Tourna<span className="text-cyan-400">ments</span>
                </h1>
                <p className="relative z-10 text-gray-400 text-sm font-bold uppercase tracking-widest max-w-xl mx-auto mb-8">
                    Join Discord to Participate
                </p>
                
                <div className="relative z-10 mb-12">
                    <a 
                        href="https://discord.gg/s4hcCn4s" 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-[#5865F2] hover:bg-[#4752c4] text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs transition-all shadow-lg shadow-blue-600/20"
                    >
                        <Gamepad2 className="w-4 h-4" /> Join Discord Server
                    </a>
                </div>

                {/* Stats Row */}
                <div className="relative z-10 flex justify-center gap-12 mb-8">
                    <div className="text-center">
                        <p className="text-3xl font-black text-white italic">{openCount}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Open Now</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-cyan-400 italic">{liveCount}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live</p>
                    </div>
                    <div className="text-center">
                        <p className="text-3xl font-black text-purple-400 italic">{totalCount}</p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total</p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Tabs */}
                <div className="flex justify-center mb-12">
                    <div className="bg-[#1e232e] p-1.5 rounded-2xl border border-gray-800 flex overflow-x-auto max-w-full">
                        {['all', 'open', 'live', 'past'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab as any)}
                                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all min-w-[100px] ${
                                    activeTab === tab 
                                    ? 'bg-purple-600 text-white shadow-lg' 
                                    : 'text-gray-500 hover:text-white'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8 flex items-center gap-3">
                    <div className="p-2 bg-[#1e232e] rounded-xl text-gray-400 border border-gray-800">
                        <Trophy className="w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-black text-white italic uppercase tracking-tighter">
                        {activeTab === 'all' ? 'All Tournaments' : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Tournaments`}
                    </h2>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-[#1e232e] h-96 rounded-[2rem] border border-gray-800 animate-pulse"></div>
                        ))}
                    </div>
                ) : filteredTournaments.length === 0 ? (
                    <div className="text-center py-24 border-2 border-dashed border-gray-800 rounded-[3rem]">
                        <Swords className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                        <p className="text-gray-500 font-black uppercase tracking-widest">No tournaments found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTournaments.map(t => (
                            <div 
                                key={t.id}
                                onClick={() => { onSelectTournament(t); onNavigate('tournament-details'); }} 
                                className="group bg-[#1e232e] rounded-[2rem] border border-gray-800 hover:border-purple-500/50 overflow-hidden cursor-pointer transition-all duration-300 shadow-2xl hover:-translate-y-2 flex flex-col"
                            >
                                {/* Image Area */}
                                <div className="h-48 relative overflow-hidden">
                                    <img 
                                        src={t.image_url} 
                                        alt={t.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e232e] to-transparent opacity-90"></div>
                                    
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                                            <Gamepad2 className="w-3 h-3" /> {t.game_name}
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4">
                                        <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border backdrop-blur-md flex items-center gap-1 ${
                                            t.status === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                                            t.status === 'live' ? 'bg-red-500/20 text-red-400 border-red-500/30 animate-pulse' :
                                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                                        }`}>
                                            {t.status === 'open' && <Clock className="w-3 h-3" />}
                                            {t.status === 'live' && <div className="w-2 h-2 rounded-full bg-red-500 animate-ping mr-1"></div>}
                                            {t.status === 'past' && <CheckCircle className="w-3 h-3" />}
                                            {t.status}
                                        </div>
                                    </div>
                                    
                                    {/* Title Overlay */}
                                    <div className="absolute bottom-4 left-6 right-6">
                                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none mb-1 drop-shadow-lg group-hover:text-purple-400 transition-colors">
                                            {t.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 pt-2 flex flex-col flex-1 gap-4">
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed line-clamp-2">
                                        {t.description}
                                    </p>

                                    <div className="grid grid-cols-2 gap-3 mt-auto">
                                        <div className="bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                                                <Users className="w-3 h-3" /> Players
                                            </div>
                                            <p className="text-white font-bold text-sm">{t.current_participants} / {t.max_participants}</p>
                                        </div>
                                        <div className="bg-[#0b0e14] p-3 rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">
                                                <Calendar className="w-3 h-3" /> Date
                                            </div>
                                            <p className="text-white font-bold text-sm">{new Date(t.start_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-yellow-400">
                                            <Trophy className="w-4 h-4 fill-yellow-400" />
                                            <span className="font-black italic uppercase text-sm">{t.prize_pool}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-purple-400 text-xs font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                            View <ChevronRight className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};