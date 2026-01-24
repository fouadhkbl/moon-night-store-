
import React, { useState } from 'react';
import { HelpCircle, ChevronDown, MessageSquare, Zap, Shield, Trophy, ShoppingBag, ArrowLeft, Clock, ShieldAlert, Key } from 'lucide-react';

interface FaqItemProps {
    question: string;
    answer: string;
    icon: React.ReactNode;
}

const FaqItem = ({ question, answer, icon }: FaqItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="bg-[#1e232e] border border-white/5 rounded-3xl overflow-hidden mb-4 transition-all hover:border-blue-500/30 shadow-xl">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-[#0b0e14] rounded-2xl text-blue-500 shadow-xl border border-white/5">
                        {icon}
                    </div>
                    <span className="text-sm font-black text-white uppercase italic tracking-tighter">{question}</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96' : 'max-h-0'}`}>
                <div className="p-6 pt-0 border-t border-white/5 bg-[#151a23]/50">
                    <p className="text-gray-400 text-sm font-medium leading-relaxed">
                        {answer}
                    </p>
                </div>
            </div>
        </div>
    );
};

export const FaqPage = ({ onNavigate, session }: { onNavigate: (p: string) => void, session?: any }) => {
    const isAdmin = session?.user?.email && ['grosafzemb@gmail.com', 'inzoka333@gmail.com', 'adamelalam82@gmail.com'].includes(session.user.email);

    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl pb-32">
            <div className="flex items-center justify-between mb-12">
                <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white transition group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Back to Systems</span>
                </button>
                
                {isAdmin && (
                    <button 
                        onClick={() => onNavigate('admin')}
                        className="bg-red-600/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-red-600 hover:text-white transition-all group"
                    >
                        <ShieldAlert className="w-4 h-4 group-hover:animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Admin Core</span>
                    </button>
                )}
            </div>

            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 shadow-lg shadow-blue-500/5">
                    <HelpCircle className="w-4 h-4" /> Support Hub
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">
                    HELP <span className="text-blue-500">CENTER</span>
                </h1>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest max-w-xl mx-auto">
                    Global operational protocols and user assistance.
                </p>
            </div>

            <div className="space-y-2">
                <FaqItem 
                    icon={<ShoppingBag className="w-5 h-5" />}
                    question="How do I receive my purchased items?" 
                    answer="Digital credentials and item delivery data are sent instantly to your profile dashboard upon payment verification. For manual items, a support agent will open a direct secure chat with you via the Order Details page to finalize the trade."
                />
                <FaqItem 
                    icon={<Zap className="w-5 h-5" />}
                    question="How can I earn Discord Points?" 
                    answer="Points are earned primarily through active engagement on the official Moon Night Discord server. The system tracks your participation time and community interaction, rewarding you with loyalty points for the Win Wheel. You also receive bonus points for every purchase made on the shop."
                />
                <FaqItem 
                    icon={<Clock className="w-5 h-5" />}
                    question="What is the refund policy?" 
                    answer="Refunds are granted specifically for system errors or if an item is not received within 24 hours of purchase. In the event of a successful refund request, the funds will be credited directly to your Moon Night account balance (solde) to be used for future transactions."
                />
                <FaqItem 
                    icon={<Trophy className="w-5 h-5" />}
                    question="Is the Win Wheel game fair?" 
                    answer="Yes. Our Win Wheel operates on a transparent mathematical probability matrix. Each prize tier has a fixed winning percentage displayed on the game interface, ensuring all participants have a fair chance at the jackpots."
                />
                <FaqItem 
                    icon={<MessageSquare className="w-5 h-5" />}
                    question="How do I join the Discord community?" 
                    answer="Access our secure community hub by clicking the 'Join Discord' button in the footer or homepage. Our server provides 24/7 technical support, exclusive giveaways, and real-time tournament announcements."
                />
            </div>

            {isAdmin && (
                <div className="mt-12 p-8 bg-red-900/10 border border-red-500/20 rounded-[2.5rem] flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-red-600/20">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Administrative Override</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Authenticated as System Manager</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onNavigate('admin')}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl transition-all"
                    >
                        Access Core
                    </button>
                </div>
            )}

            <div className="mt-20 p-12 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">Still need assistance?</h3>
                    <p className="text-blue-100 font-bold text-sm mb-8 opacity-80 uppercase tracking-widest">Our neural support agents are online 24/7 on Discord.</p>
                    <a href="https://discord.gg/s4hcCn4s" target="_blank" rel="noreferrer" className="bg-white text-blue-900 px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition-all inline-block active:scale-95">Open Support Ticket</a>
                </div>
            </div>
        </div>
    );
};
