import React, { useState } from 'react';
import { supabase } from '../../../supabaseClient';
import { LogIn, Loader2, UserPlus } from 'lucide-react';

export const LoginForm = ({ onAuthSuccess, onToggle }: { onAuthSuccess: (s: any) => void, onToggle: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (data.session) onAuthSuccess(data.session);
    } catch (err: any) {
      setError(err.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e232e] p-10 rounded-[2rem] border border-gray-800 shadow-2xl animate-fade-in max-w-md mx-auto">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
        <LogIn className="text-blue-500" /> Member Login
      </h2>
      {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" 
            placeholder="player@moonnight.com" 
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" 
            placeholder="••••••••" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-blue-600/30"
        >
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Enter Marketplace'}
        </button>
      </form>
      
      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-800 flex-1"></div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">OR</span>
        <div className="h-px bg-gray-800 flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button type="button" onClick={() => handleOAuthLogin('google')} disabled={loading} className="bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl group active:scale-95 text-[10px]">
            Google
        </button>
        <button type="button" onClick={() => handleOAuthLogin('discord')} disabled={loading} className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl group active:scale-95 text-[10px]">
            Discord
        </button>
      </div>

      <button onClick={onToggle} className="w-full text-center mt-8 text-[10px] text-gray-500 hover:text-purple-400 transition font-black uppercase tracking-[0.2em]">Already registered? Log In</button>
    </div>
  );
};

export const SignupForm = ({ onAuthSuccess, onToggle, addToast }: { onAuthSuccess: (s: any) => void, onToggle: () => void, addToast: any }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!username || username.trim() === '') {
        setError('Gamertag cannot be empty.');
        setLoading(false);
        return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        setLoading(false);
        return;
    }

    try {
      const { data: existingUser } = await supabase.from('profiles').select('email').eq('email', email).maybeSingle();
      if (existingUser) throw new Error('User already exists. Attempting login...');

      const { data, error: signupError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { data: { username } }
      });
      
      if (signupError) throw signupError;
      
      if (data.session) {
        await supabase.from('profiles').upsert({ 
          id: data.session.user.id, 
          email, 
          username, 
          password, 
          wallet_balance: 0, 
          vip_level: 0, 
          vip_points: 0,
          avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
        });
        addToast('Success', `Welcome, ${username}! Account created.`, 'success');
        onAuthSuccess(data.session);
      } else {
         const { data: signinData, error: signinError } = await supabase.auth.signInWithPassword({ email, password });
         if (!signinError && signinData.session) {
             await supabase.from('profiles').upsert({ 
                id: signinData.session.user.id, 
                email, 
                username, 
                password, 
                wallet_balance: 0, 
                vip_level: 0, 
                vip_points: 0,
                avatar_url: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=200&q=80'
             });
             addToast('Success', `Welcome, ${username}!`, 'success');
             onAuthSuccess(signinData.session);
         } else {
             if (signinError?.message?.includes('Email not confirmed')) {
                 addToast('Check Email', 'Confirmation link sent to your email.', 'info');
                 setError('Please confirm your email address to log in.');
             } else {
                 addToast('Account Created', 'Please check your email or try logging in.', 'info');
                 onToggle(); 
             }
         }
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'discord') => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1e232e] p-10 rounded-[2rem] border border-gray-800 shadow-2xl animate-fade-in max-w-md mx-auto">
      <h2 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
        <UserPlus className="text-purple-500" /> New Profile
      </h2>
      {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}
      <form onSubmit={handleSignup} className="space-y-5">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Gamertag</label>
          <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none transition-all shadow-inner" placeholder="Choose username" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-purple-500 outline-none transition-all shadow-inner" placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Password</label>
          <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-4 text-white focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="••••••••" />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-purple-600/30">
          {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Register Now'}
        </button>
      </form>

      <div className="flex items-center gap-4 my-6">
        <div className="h-px bg-gray-800 flex-1"></div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">OR</span>
        <div className="h-px bg-gray-800 flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <button type="button" onClick={() => handleOAuthLogin('google')} disabled={loading} className="bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl group active:scale-95 text-[10px]">Google</button>
        <button type="button" onClick={() => handleOAuthLogin('discord')} disabled={loading} className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl group active:scale-95 text-[10px]">Discord</button>
      </div>

      <button onClick={onToggle} className="w-full text-center mt-8 text-[10px] text-gray-500 hover:text-purple-400 transition font-black uppercase tracking-[0.2em]">Already registered? Log In</button>
    </div>
  );
};