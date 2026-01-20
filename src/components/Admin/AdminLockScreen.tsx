import React, { useState } from 'react';
import { ShieldAlert, Key } from 'lucide-react';

export const AdminLockScreen = ({ onSuccess }: { onSuccess: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'fouad12jad1///') {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-[#1e232e] p-16 rounded-[3.5rem] border border-gray-800 shadow-[0_50px_100px_rgba(0,0,0,0.5)] max-w-sm w-full text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        <div className="w-24 h-24 bg-red-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-10 text-red-500 border border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
           <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2 leading-none">SYSTEM LOCK</h2>
        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mb-12">Authorization Required</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative">
             <input 
              type="password" 
              required 
              autoFocus
              value={password} 
              onChange={e => setPassword(e.target.value)}
              className={`w-full bg-[#0b0e14] border ${error ? 'border-red-500' : 'border-gray-800'} rounded-[1.5rem] p-6 text-center text-white focus:border-blue-500 outline-none transition-all font-mono tracking-[0.8em] text-2xl shadow-inner placeholder:opacity-20`}
              placeholder="••••••••"
             />
             {error && <p className="text-red-500 text-[10px] font-black uppercase mt-4 animate-pulse tracking-[0.3em]">Access Denied: Invalid Key</p>}
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[1.5rem] transition-all flex items-center justify-center gap-4 uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 active:scale-95 text-[12px]">
             Unlock Core <Key className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};