
import React from 'react';
import { Shield, ArrowLeft, Lock, Eye, Server } from 'lucide-react';

export const PrivacyPage = ({ onNavigate }: { onNavigate: (p: string) => void }) => {
    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl pb-32">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition">
                <ArrowLeft className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Exit Secure View</span>
            </button>

            <div className="text-center mb-16">
                <Shield className="w-16 h-16 text-green-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.3)]" />
                <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4">PRIVACY <span className="text-green-500">SHIELD</span></h1>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Last Updated: December 2024</p>
            </div>

            <div className="bg-[#1e232e] border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl space-y-12">
                <div className="flex flex-col md:flex-row gap-8">
                    <div className="w-full md:w-1/3">
                        <div className="flex items-center gap-3 text-white font-black uppercase italic tracking-tighter mb-4">
                            <Eye className="w-5 h-5 text-blue-500" />
                            Data Collection
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 text-gray-400 text-sm leading-relaxed">
                        We collect your email address and username solely for account authentication and transaction tracking. No sensitive personal data beyond what is required for delivery is stored on our local matrices.
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 border-t border-white/5 pt-12">
                    <div className="w-full md:w-1/3">
                        <div className="flex items-center gap-3 text-white font-black uppercase italic tracking-tighter mb-4">
                            <Lock className="w-5 h-5 text-green-500" />
                            Transaction Security
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 text-gray-400 text-sm leading-relaxed">
                        All financial transactions are handled via external encrypted gateways (PayPal/Visa/Mastercard). Moon Night never sees or stores your credit card details or bank credentials.
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 border-t border-white/5 pt-12">
                    <div className="w-full md:w-1/3">
                        <div className="flex items-center gap-3 text-white font-black uppercase italic tracking-tighter mb-4">
                            <Server className="w-5 h-5 text-purple-500" />
                            Cookies & Storage
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 text-gray-400 text-sm leading-relaxed">
                        We use local storage technology to keep you logged in and maintain your shopping cart state. This data stays on your machine and is never sold to third-party entities.
                    </div>
                </div>
            </div>
        </div>
    );
};
