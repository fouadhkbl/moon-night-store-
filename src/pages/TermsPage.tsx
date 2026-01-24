
import React from 'react';
import { FileText, ArrowLeft, AlertTriangle, CheckCircle, Scale } from 'lucide-react';

export const TermsPage = ({ onNavigate }: { onNavigate: (p: string) => void }) => {
    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in max-w-4xl pb-32">
            <button onClick={() => onNavigate('home')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-12 transition group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Return Home</span>
            </button>

            <div className="text-center mb-16">
                <FileText className="w-16 h-16 text-purple-500 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.3)]" />
                <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-4 leading-none">OPERATING <span className="text-purple-500">TERMS</span></h1>
                <p className="text-gray-500 text-xs font-black uppercase tracking-[0.3em]">Protocol Compliance Required for Access</p>
            </div>

            <div className="bg-[#1e232e] border border-white/5 rounded-[3rem] p-10 shadow-2xl space-y-10">
                <section>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-500" /> 01. Digital Goods Delivery
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        By utilizing the Moon Night marketplace, you acknowledge that all products are intangible digital assets. Delivery is considered finalized once digital credentials or items are distributed via the system dashboard or coordinated through official support chat.
                    </p>
                </section>

                <section className="border-t border-white/5 pt-10">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" /> 02. Refund & Dispute Policy
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        Refunds are issued exclusively for system technical errors or non-delivery within a 24-hour window from the time of purchase. Approved refunds are processed as a credit to your internal Moon Night wallet balance (solde). External chargebacks or disputes opened without contacting support will result in immediate and permanent account suspension.
                    </p>
                </section>

                <section className="border-t border-white/5 pt-10">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter mb-4 flex items-center gap-3">
                        <Scale className="w-5 h-5 text-green-500" /> 03. User Conduct & Points
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        The accumulation of Discord Points is tied to genuine engagement and purchases. Exploiting Discord server activity through automated bots or utilizing multiple accounts to manipulate the Spin Wheel system is strictly prohibited. We reserve the right to audit accounts and revoke points obtained through fraudulent methods.
                    </p>
                </section>
            </div>
        </div>
    );
};
