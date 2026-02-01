
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Tournament, TournamentRequirement } from '../types';
import { ArrowLeft, Send, Loader2, ShieldCheck, Gamepad2, Info, MessageSquare } from 'lucide-react';

export const TournamentApplyPage = ({ tournament, session, onNavigate, addToast }: { 
    tournament: Tournament | null, 
    session: any, 
    onNavigate: (p: string) => void,
    addToast: any
}) => {
    const [requirements, setRequirements] = useState<TournamentRequirement[]>([]);
    const [formData, setFormData] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const isGuest = session?.user?.id === 'guest-user-123';

    useEffect(() => {
        if (!tournament) {
            onNavigate('tournaments');
            return;
        }

        const fetchRequirements = async () => {
            const { data } = await supabase
                .from('tournament_requirements')
                .select('*')
                .eq('tournament_id', tournament.id);
            
            if (data) setRequirements(data);
            setLoading(false);
        };
        fetchRequirements();
    }, [tournament]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isGuest) {
            addToast('Login Required', 'You must be logged in to apply.', 'error');
            onNavigate('dashboard');
            return;
        }

        setSubmitting(true);
        try {
            const { error } = await supabase.from('tournament_applications').insert({
                user_id: session.user.id,
                tournament_id: tournament?.id,
                form_data: formData,
                status: 'pending'
            });

            if (error) {
                if (error.code === '23505') throw new Error("You have already applied to this tournament.");
                throw error;
            }

            addToast('Enlisted!', 'Your application has been received and is pending review.', 'success');
            onNavigate('dashboard-events');
        } catch (err: any) {
            addToast('Application Error', err.message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0b0e14] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

    return (
        <div className="container mx-auto px-4 py-12 animate-fade-in max-w-3xl pb-32">
            <button onClick={() => onNavigate('tournament-details')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition group">
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Abort Enlistment</span>
            </button>

            <div className="bg-[#1e232e] rounded-[3rem] border border-white/5 overflow-hidden shadow-3xl">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-900 p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="relative z-10">
                        <Gamepad2 className="w-12 h-12 text-white mx-auto mb-6" />
                        <h1 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2">ENLISTMENT</h1>
                        <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em]">{tournament?.title}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
                    <div className="bg-[#0b0e14] p-6 rounded-2xl border border-blue-500/20 flex items-start gap-4 mb-10">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                        <p className="text-gray-400 text-xs font-medium leading-relaxed">
                            Your application will be reviewed by the Moon Night command team. Ensure all details are accurate to avoid rejection. You can track your status in your profile.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {requirements.length === 0 && (
                            <p className="text-center text-gray-500 text-[10px] font-black uppercase tracking-widest py-10 border-2 border-dashed border-white/5 rounded-3xl">
                                No specific requirements found. Click submit to enlist.
                            </p>
                        )}
                        {requirements.map(req => (
                            <div key={req.id}>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">
                                    {req.label} {req.is_required && <span className="text-red-500">*</span>}
                                </label>
                                <input 
                                    required={req.is_required}
                                    type={req.field_type === 'number' ? 'number' : 'text'}
                                    className="w-full bg-[#0b0e14] border border-white/5 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-700 font-bold"
                                    placeholder={req.field_type === 'discord' ? 'User#0000' : 'Enter data...'}
                                    value={formData[req.id] || ''}
                                    onChange={(e) => setFormData({...formData, [req.id]: e.target.value})}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] flex items-center justify-center gap-4 uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Send className="w-6 h-6" /> Submit Application</>}
                        </button>
                    </div>

                    <p className="text-center text-[9px] text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-green-500" /> SECURE ENLISTMENT PROTOCOL v2.4
                    </p>
                </form>
            </div>
        </div>
    );
};
