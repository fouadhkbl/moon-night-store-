
import React from 'react';
import { ShieldCheck, FileText, HelpCircle, Instagram, MessageSquare, Twitter } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  session: any;
  addToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, session, addToast }) => {
  
  const handleFaqOrAdminAccess = () => {
    const allowedAdmins = ['grosafzemb@gmail.com', 'inzoka333@gmail.com', 'adamelalam82@gmail.com'];
    if (session?.user?.email && allowedAdmins.includes(session.user.email)) {
        onNavigate('admin');
    } else {
        onNavigate('faq');
    }
  };

  return (
    <footer className="bg-[#151a23] py-16 border-t border-white/5 mt-auto relative overflow-hidden">
      <div className="absolute bottom-0 right-0 p-20 opacity-[0.02] pointer-events-none">
          <ShieldCheck className="w-96 h-96 text-white" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 italic uppercase tracking-tighter">Moon Night</h3>
            <p className="text-gray-500 text-xs font-medium leading-relaxed max-w-xs">
              Moon Night is a premier digital gaming marketplace. We provide safe, fast, and reliable delivery for game accounts, currency, and items.
            </p>
            <div className="flex gap-4">
                {[MessageSquare, Instagram, Twitter].map((Icon, i) => (
                    <a key={i} href="#" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white transition-all">
                        <Icon className="w-5 h-5" />
                    </a>
                ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6">Marketplace</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              <li><button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition-colors">Home</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-blue-400 transition-colors">Digital Shop</button></li>
              <li><button onClick={() => onNavigate('donate')} className="hover:text-blue-400 transition-colors">Support Us</button></li>
              <li><button onClick={() => onNavigate('leaderboard')} className="hover:text-blue-400 transition-colors">Leaderboard</button></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6">Security & Help</h4>
            <ul className="space-y-4 text-gray-500 text-[11px] font-bold uppercase tracking-widest">
              <li className="flex items-center gap-2 group cursor-pointer" onClick={handleFaqOrAdminAccess}>
                  <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                  <button className="group-hover:text-blue-400 transition-colors">Help Center / FAQ</button>
              </li>
              <li className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate('privacy')}>
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <button className="group-hover:text-blue-400 transition-colors">Privacy Shield</button>
              </li>
              <li className="flex items-center gap-2 group cursor-pointer" onClick={() => onNavigate('terms')}>
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <button className="group-hover:text-blue-400 transition-colors">Operating Terms</button>
              </li>
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] mb-6">Secure Payments</h4>
            <div className="flex flex-wrap gap-2 mb-6">
               <div className="bg-white/5 border border-white/10 p-1 rounded-lg w-12 h-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all"><span className="text-blue-500 font-black text-[10px] italic">VISA</span></div>
               <div className="bg-white/5 border border-white/10 p-1 rounded-lg w-12 h-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all">
                   <svg className="w-8 h-5" viewBox="0 0 24 16" fill="none"><circle cx="7" cy="8" r="7" fill="#EB001B"/><circle cx="17" cy="8" r="7" fill="#F79E1B" fillOpacity="0.8"/></svg>
               </div>
               <div className="bg-white/5 border border-white/10 p-1 rounded-lg w-12 h-8 flex items-center justify-center grayscale hover:grayscale-0 transition-all"><span className="text-blue-600 font-bold text-[8px] italic">Pay</span><span className="text-blue-400 font-bold text-[8px] italic">Pal</span></div>
            </div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-tighter">© 2026 MOON NIGHT PROJECT<br/>ALL SYSTEMS OPERATIONAL</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
