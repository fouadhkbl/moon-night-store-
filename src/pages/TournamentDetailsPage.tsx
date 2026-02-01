
import React from 'react';
import { Tournament } from '../types';
import { ArrowLeft, Trophy, Calendar, Users, Gamepad2, Shield, Zap, Info, MessageSquare, ChevronRight, CheckCircle, Clock, UserPlus } from 'lucide-react';

export const TournamentDetailsPage = ({ tournament, onNavigate, addToast }: { tournament: Tournament | null, onNavigate: (p: string) => void, addToast: any }) => {
    if (!tournament) {
        onNavigate('tournaments');
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-12 animate-fade-in max-w-5xl pb-32">
            <button onClick={() => onNavigate('tournaments')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Back to Events</span>
            </button>

            <div className="bg-[#1e232e] rounded-[3rem] border border-white/5 overflow-hidden shadow-3xl">
                <div className="h-[300px] md:h-[400px] relative overflow-hidden">
                    <img src={tournament.image_url} className="w-full h-full object-cover" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1e232e] via-[#1e232e]/40 to-transparent"></div>
                    <div className="absolute bottom-8 left-8 right-8">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-xl">
                                {tournament.game_name}
                            </span>
                            <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border backdrop-blur-md ${
                                tournament.status === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                                'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }`}>
                                {tournament.status}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                            {tournament.title}
                        </h1>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-8">
                            <div>
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4 flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-500" /> Event Description
                                </h3>
                                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                    {tournament.description}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5 text-center">
                                    <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Prize</p>
                                    <p className="text-xs font-black text-white">{tournament.prize_pool}</p>
                                </div>
                                <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5 text-center">
                                    <Users className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Slots</p>
                                    <p className="text-xs font-black text-white">{tournament.current_participants}/{tournament.max_participants}</p>
                                </div>
                                <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5 text-center">
                                    <Clock className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Starts</p>
                                    <p className="text-[10px] font-black text-white uppercase">{new Date(tournament.start_date).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-[#0b0e14] p-4 rounded-2xl border border-white/5 text-center">
                                    <Shield className="w-6 h-6 text-green-500 mx-auto mb-2" />
                                    <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mb-1">Entry</p>
                                    <p className="text-xs font-black text-white">{tournament.entry_fee}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter mb-4">Official Rules</h3>
                                <div className="bg-[#0b0e14] p-6 rounded-[2rem] border border-white/5">
                                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                                        {tournament.rules || "Standard community rules apply. Please join the Discord for full details."}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-[#0b0e14] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl text-center">
                                <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-6 animate-pulse" />
                                <h3 className="text-xl font-black text-white uppercase italic mb-2">Join Event</h3>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-8">
                                    Official enlistment for Moon Night combat engagements.
                                </p>
                                <button 
                                    onClick={() => onNavigate('tournament-apply')}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
                                >
                                    <UserPlus className="w-4 h-4" /> Apply to join
                                </button>
                                <p className="mt-6 text-[8px] text-gray-600 font-bold uppercase tracking-widest">
                                    Registration closes 1 hour before start time.
                                </p>
                            </div>

                            <div className="bg-[#1e232e] p-6 rounded-[2rem] border border-white/5">
                                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-green-500" /> Requirements
                                </h4>
                                <ul className="space-y-3">
                                    {["Moon Night Account", "Discord Sync", "Fair Play Pledge"].map((req, i) => (
                                        <li key={i} className="flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase">
                                            <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                            {req}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
