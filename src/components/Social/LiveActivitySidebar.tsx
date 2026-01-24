
import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Package, Zap, Trophy, ShoppingCart, User, Users, Heart, Star, X, MessageSquare, ChevronRight, Activity, LogOut } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'order' | 'loot' | 'tournament' | 'spin';
    user: string;
    description: string;
    timestamp: Date;
    avatar?: string;
}

export const LiveActivitySidebar = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        const items: ActivityItem[] = [
            { id: '1', type: 'spin', user: 'Zakaria', description: 'won 500 PTS on Spin Wheel!', timestamp: new Date(), avatar: 'https://i.pravatar.cc/100?u=1' },
            { id: '2', type: 'order', user: 'Fouad', description: 'purchased Premium Account', timestamp: new Date(Date.now() - 600000), avatar: 'https://i.pravatar.cc/100?u=2' },
        ];
        setActivities(items);

        const ordersChannel = supabase.channel('social_feed')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
                const newActivity: ActivityItem = {
                    id: payload.new.id,
                    type: 'order',
                    user: 'A Player',
                    description: `placed a new trade for ${payload.new.total_amount} DH`,
                    timestamp: new Date(),
                };
                setActivities(prev => [newActivity, ...prev].slice(0, 15));
            })
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'loot_box_opens' }, (payload) => {
                const newActivity: ActivityItem = {
                    id: payload.new.id,
                    type: 'loot',
                    user: 'Someone',
                    description: `opened a ${payload.new.box_name}!`,
                    timestamp: new Date(),
                };
                setActivities(prev => [newActivity, ...prev].slice(0, 15));
            })
            .subscribe();

        return () => { supabase.removeChannel(ordersChannel); };
    }, []);

    const getTypeIcon = (type: string) => {
        switch(type) {
            case 'order': return <ShoppingCart className="w-3 h-3 text-blue-400" />;
            case 'loot': return <Package className="w-3 h-3 text-yellow-400" />;
            case 'tournament': return <Trophy className="w-3 h-3 text-purple-400" />;
            case 'spin': return <Zap className="w-3 h-3 text-pink-400" />;
            default: return <Activity className="w-3 h-3 text-gray-400" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed lg:relative right-0 top-0 h-full w-full lg:w-80 bg-[#1e232e] border-l border-white/5 z-[200] animate-slide-up flex flex-col shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#151a23]">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600/10 p-2 rounded-xl text-blue-500 border border-blue-500/20">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-white italic uppercase tracking-tighter">LUNAR LOBBY</h3>
                        <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {Math.floor(Math.random() * 50) + 120} Players
                        </p>
                    </div>
                </div>
                <button 
                    onClick={onClose} 
                    className="p-2 bg-white/5 rounded-xl text-gray-500 hover:text-white hover:bg-red-500/20 transition-all group"
                    title="Exit"
                >
                    <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
                <div className="bg-blue-600/5 rounded-2xl p-4 border border-blue-500/10 mb-4">
                    <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <Star className="w-3 h-3 fill-current" /> Daily Goal
                    </h4>
                    <div className="h-2 w-full bg-[#0b0e14] rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-1000 shadow-[0_0_10px_rgba(37,99,235,0.5)]" style={{ width: '64%' }}></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-black uppercase text-gray-500">
                        <span>32/50 TRADES</span>
                        <span className="text-blue-400">REWARD AT 100%</span>
                    </div>
                </div>

                <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest px-2 mb-2">Recent Activity</p>
                
                {activities.map(item => (
                    <div key={item.id} className="bg-[#0b0e14]/50 border border-white/5 p-3 rounded-2xl hover:border-blue-500/30 transition-all group">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 flex-shrink-0 overflow-hidden border border-white/5">
                                {item.avatar ? <img src={item.avatar} className="w-full h-full object-cover" /> : <User className="w-4 h-4 m-2 text-gray-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-[10px] font-black text-white uppercase italic truncate">{item.user}</span>
                                    <div className="p-1 rounded bg-white/5 border border-white/5">
                                        {getTypeIcon(item.type)}
                                    </div>
                                </div>
                                <p className="text-[9px] text-gray-400 font-bold leading-tight line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-[7px] text-gray-600 font-black uppercase tracking-tighter">
                                        {Math.floor((Date.now() - item.timestamp.getTime()) / 60000)}m ago
                                    </span>
                                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-gray-500 hover:text-red-500 transition-colors"><Heart className="w-3 h-3" /></button>
                                        <button className="text-gray-500 hover:text-yellow-500 transition-colors"><Star className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 bg-[#151a23] border-t border-white/5 space-y-2">
                <button 
                    onClick={() => window.open('https://discord.gg/s4hcCn4s', '_blank')}
                    className="w-full bg-[#5865F2] hover:bg-[#4752c4] text-white py-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                    <MessageSquare className="w-3.5 h-3.5" /> Join Chat Lobby
                </button>
                <button 
                    onClick={onClose}
                    className="w-full bg-white/5 hover:bg-white/10 text-gray-400 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 border border-white/5 transition-all"
                >
                    <LogOut className="w-3.5 h-3.5" /> Exit Feed
                </button>
            </div>
        </div>
    );
};
