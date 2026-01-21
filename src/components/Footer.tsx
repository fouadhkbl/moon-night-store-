import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
  session: any;
  addToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, session, addToast }) => {
  
  const handleFaqClick = () => {
    // Restricted Access Logic
    const allowedAdmins = ['grosafzemb@gmail.com', 'inzoka333@gmail.com', 'adamelalam82@gmail.com'];

    if (session?.user?.email && allowedAdmins.includes(session.user.email)) {
        onNavigate('admin');
    } else {
        addToast('Restricted Access', 'The FAQ/Admin area is currently restricted to administrators.', 'error');
    }
  };

  return (
    <footer className="bg-[#151a23] py-12 border-t border-gray-800 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300 italic mb-4">Moon Night</h3>
            <p className="text-gray-400 text-sm">
              We specialize in selling and buying MMORPG Game Gold, Items, and Top Ups. 10+ Years Shop Experience.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={() => onNavigate('home')} className="hover:text-blue-400 text-left">Home</button></li>
              <li><button onClick={() => onNavigate('shop')} className="hover:text-blue-400 text-left">Shop</button></li>
              <li><a href="#" className="hover:text-blue-400">Sell to Us</a></li>
              <li><a href="#" className="hover:text-blue-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><button onClick={handleFaqClick} className="hover:text-blue-400 text-left">FAQ</button></li>
              <li><a href="#" className="hover:text-blue-400">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-blue-400">Terms of Service</a></li>
              <li><a href="#" className="hover:text-blue-400">Refund Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-4">Payment Methods</h4>
            <div className="flex gap-2">
               <div className="bg-white p-1 rounded w-10 h-6 flex items-center justify-center"><span className="text-blue-900 font-bold text-xs italic">VISA</span></div>
               <div className="bg-white p-1 rounded w-10 h-6 flex items-center justify-center"><span className="text-blue-600 font-bold text-xs italic">Pay</span><span className="text-blue-400 font-bold text-xs italic">Pal</span></div>
            </div>
            <p className="mt-4 text-gray-500 text-xs">© 2024 Moon Night Project. All rights reserved. Developed by Fouad.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;