
import React from 'react';
import { Tournament } from '../types';
import { ArrowLeft, Trophy, Calendar, Users, Gamepad2, Shield, Share2, Crown, Award, Medal } from 'lucide-react';

export const TournamentDetailsPage = ({ tournament, onNavigate, addToast }: { tournament: Tournament | null, onNavigate: (p: string) => void, addToast: any }) => {
    if (!tournament) {
        onNavigate('tournaments');
        return null;
    }

    const handleShare = () => {
        const url = `${window.location.origin}/?tournament_id=${tournament.id}`;
        navigator.clipboard.writeText(url).then(() => {
            addToast('Link Copied', 'Tournament shared link copied to clipboard!', 'success');
        });
    };

    return (
        <div className="min-h-screen bg-[#0b0e14] animate-fade-in pb-24">
            {/* Header / Hero */}
            <div className="relative h-[400px] overflow-hidden">
                <div className="absolute inset-0">
                    <img src={tournament.image_url} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent"></div>
                </div>
                
                <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-12">
                    <button onClick={() => onNavigate('tournaments')} className="absolute top-8 left-4 bg-black/40 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white hover:text-black transition-all">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </button>

                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-white">
                            <Gamepad2 className="w-4 h-4" /> {tournament.game_name}
                        </div>
                        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 text-xs font-black uppercase tracking-widest ${
                            tournament.status === 'open' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            tournament.status === 'live' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                            'bg-gray-500/20 text-gray-400 border-gray-500/30'
                        }`}>
                            {tournament.status}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">
                        {tournament.title}
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm max-w-2xl">
                        {tournament.description}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* About Section */}
                        <div className="bg-[#1e232e] rounded-[2rem] border border-gray-800 p-8 shadow-xl">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                                <div className="p-2 bg-[#0b0e14] rounded-lg text-blue-400"><Shield className="w-6 h-6" /></div>
                                About This Tournament
                            </h3>
                            
                            <div className="prose prose-invert max-w-none text-gray-400 text-sm font-medium leading-relaxed">
                                <p className="mb-4">
                                    Join the ultimate showdown! Prepare your strategies and sharpen your skills because <span className="text-white font-bold">{tournament.title}</span> is here. This is your chance to prove your dominance in {tournament.game_name}.
                                </p>
                                
                                <h4 className="text-white font-black uppercase italic tracking-tighter text-lg mt-8 mb-4">📜 Rules & Format</h4>
                                <div className="bg-[#0b0e14] p-6 rounded-2xl border border-gray-800 space-y-2 font-mono text-xs">
                                    {tournament.rules ? tournament.rules.split('\n').map((line, i) => (
                                        <p key={i} className="flex gap-2">
                                            <span className="text-pink-500">➤</span> {line}
                                        </p>
                                    )) : <p>Standard competitive rules apply.</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Info & Prizes */}
                    <div className="space-y-6">
                        {/* Info Card */}
                        <div className="bg-[#1e232e] rounded-[2rem] border border-gray-800 p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Tournament Info</h3>
                                <button onClick={handleShare} className="p-2 bg-[#0b0e14] rounded-lg text-gray-400 hover:text-white transition"><Share2 className="w-4 h-4"/></button>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#0b0e14] rounded-xl text-purple-400"><Calendar className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Date</p>
                                        <p className="text-white font-bold text-sm">{new Date(tournament.start_date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#0b0e14] rounded-xl text-cyan-400"><Users className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Registrations</p>
                                        <p className="text-white font-bold text-sm">{tournament.current_participants} / {tournament.max_participants}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-[#0b0e14] rounded-xl text-pink-400"><Gamepad2 className="w-5 h-5" /></div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Format</p>
                                        <p className="text-white font-bold text-sm">{tournament.format}</p>
                                    </div>
                                </div>
                            </div>

                            <a href="https://discord.gg/s4hcCn4s" target="_blank" rel="noreferrer" className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center">
                                Join Now (Discord)
                            </a>
                        </div>

                        {/* Prizes Card */}
                        <div className="bg-[#1e232e] rounded-[2rem] border border-gray-800 p-6 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">Prizes</h3>
                                <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                                    Total: {tournament.prize_pool}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="bg-gradient-to-r from-yellow-900/20 to-[#0b0e14] border border-yellow-500/30 p-4 rounded-xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-black shadow-lg shadow-yellow-500/20">
                                        <Crown className="w-6 h-6 fill-black" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-yellow-500 font-black uppercase tracking-widest">1st Place</p>
                                        <p className="text-white font-bold text-lg">{tournament.prize_pool}</p>
                                    </div>
                                </div>
                                
                                {tournament.prize_2nd && (
                                    <div className="bg-gradient-to-r from-gray-800/40 to-[#0b0e14] border border-gray-600/30 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-black shadow-lg">
                                            <Award className="w-6 h-6 fill-black" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">2nd Place</p>
                                            <p className="text-white font-bold text-sm">{tournament.prize_2nd}</p>
                                        </div>
                                    </div>
                                )}

                                {tournament.prize_3rd && (
                                    <div className="bg-gradient-to-r from-orange-900/20 to-[#0b0e14] border border-orange-700/30 p-4 rounded-xl flex items-center gap-4">
                                        <div className="w-10 h-10 bg-orange-700 rounded-lg flex items-center justify-center text-white shadow-lg">
                                            <Medal className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">3rd Place</p>
                                            <p className="text-white font-bold text-sm">{tournament.prize_3rd}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
