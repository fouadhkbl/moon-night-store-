import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { LogIn, Loader2, UserPlus, ArrowRight, Gamepad2 } from 'lucide-react';

const AuthLayout = ({ children, title, subtitle, image, imageOverlay }: { children: React.ReactNode, title: string, subtitle: string, image: string, imageOverlay: React.ReactNode }) => (
  <div className="w-full max-w-6xl mx-auto bg-[#1e232e] rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px] border border-gray-800 animate-fade-in">
    {/* Image Side */}
    <div className="w-full md:w-5/12 relative hidden md:block">
       <img src={image} className="absolute inset-0 w-full h-full object-cover" alt="Auth Background" />
       <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/50 to-transparent opacity-90"></div>
       <div className="absolute bottom-0 left-0 p-10 z-10">
          {imageOverlay}
       </div>
    </div>
    
    {/* Form Side */}
    <div className="w-full md:w-7/12 p-8 md:p-16 flex flex-col justify-center bg-[#1e232e]">
       <div className="max-w-md mx-auto w-full">
          <h2 className="text-4xl font-black text-white italic mb-2 uppercase tracking-tighter leading-none">{title}</h2>
          <p className="text-gray-500 font-bold text-sm tracking-wide mb-10">{subtitle}</p>
          {children}
       </div>
    </div>
  </div>
);

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
    <AuthLayout 
      title="System Access" 
      subtitle="Login to manage your inventory and orders."
      image="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80"
      imageOverlay={
        <>
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/50">
              <Gamepad2 className="w-8 h-8 text-white" />
           </div>
           <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Level Up Your<br/>Experience</h3>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Join the elite marketplace.</p>
        </>
      }
    >
      {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</div>}
      
      <form onSubmit={handleLogin} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder:text-gray-700" 
            placeholder="player@moonnight.com" 
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2 ml-1">
             <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest">Password</label>
             <a href="#" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400">Forgot?</a>
          </div>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder:text-gray-700" 
            placeholder="••••••••" 
          />
        </div>
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-blue-600/30 text-xs transform active:scale-95"
        >
          {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Enter Marketplace <ArrowRight className="w-5 h-5" /></>}
        </button>
      </form>
      
      <div className="flex items-center gap-4 my-8">
        <div className="h-px bg-gray-800 flex-1"></div>
        <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Or Continue With</span>
        <div className="h-px bg-gray-800 flex-1"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <button type="button" onClick={() => handleOAuthLogin('google')} disabled={loading} className="bg-[#0b0e14] border border-gray-800 hover:border-white text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg">
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg> Google
        </button>
        <button type="button" onClick={() => handleOAuthLogin('discord')} disabled={loading} className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg">
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z"/></svg> Discord
        </button>
      </div>

      <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
        Already have an ID? <button onClick={onToggle} className="text-purple-500 hover:text-white transition ml-1">Log In</button>
      </p>
    </AuthLayout>
  );
};

export const SignupForm = ({ addToast, onAuthSuccess, onToggle }: { addToast: any, onAuthSuccess: (s: any) => void, onToggle: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`
          }
        }
      });

      if (signupError) throw signupError;

      if (data.session) {
        onAuthSuccess(data.session);
        addToast('Welcome!', 'Account created successfully.', 'success');
      } else if (data.user) {
         // If email confirmation is enabled, session might be null
         addToast('Check Email', 'Please verify your email address.', 'info');
         onToggle(); // Go to login
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
    <AuthLayout 
      title="Join the Elite" 
      subtitle="Create your profile to start trading."
      image="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" 
      imageOverlay={
        <>
           <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-purple-600/50">
              <UserPlus className="w-8 h-8 text-white" />
           </div>
           <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">Unlock<br/>Inventory</h3>
           <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Get access to premium items.</p>
        </>
      }
    >
        {error && <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-500 rounded-xl mb-6 text-[10px] font-black uppercase tracking-widest text-center animate-pulse">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Username</label>
              <input 
                type="text" 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder:text-gray-700" 
                placeholder="GamerTag" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder:text-gray-700" 
                placeholder="player@moonnight.com" 
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
              <input 
                type="password" 
                required 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl p-5 text-white focus:border-blue-500 outline-none transition-all shadow-inner font-medium placeholder:text-gray-700" 
                placeholder="••••••••" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest shadow-2xl shadow-purple-600/30 text-xs transform active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Create Account <UserPlus className="w-5 h-5" /></>}
            </button>
        </form>

        <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-gray-800 flex-1"></div>
            <span className="text-[10px] font-black uppercase text-gray-600 tracking-widest">Or Continue With</span>
            <div className="h-px bg-gray-800 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
            <button type="button" onClick={() => handleOAuthLogin('google')} disabled={loading} className="bg-[#0b0e14] border border-gray-800 hover:border-white text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg> Google
            </button>
            <button type="button" onClick={() => handleOAuthLogin('discord')} disabled={loading} className="bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs shadow-lg">
                <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.956 2.42-2.157 2.42zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.086 2.157 2.419 0 1.334-.946 2.42-2.157 2.42z"/></svg> Discord
            </button>
        </div>

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
          Already have an ID? <button onClick={onToggle} className="text-purple-500 hover:text-white transition ml-1">Log In</button>
        </p>
    </AuthLayout>
  );
};