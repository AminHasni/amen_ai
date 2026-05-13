import React, { useState } from 'react';
import { supabase } from '../supabase';
import { Lock, Mail, Loader2, ShieldAlert } from 'lucide-react';
import { AmenLogo } from './Logo';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Identifiants incorrects ou accès refusé.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background glowing effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[50%] bg-indigo-900/20 blur-[150px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 rounded-full"></div>
            <div className="p-4 bg-[#0B1221] border border-slate-800 rounded-2xl relative shadow-2xl">
              <AmenLogo className="w-16 h-16 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)]" />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">AMEN_<span className="text-cyan-400">IA</span></h1>
          <p className="text-sm text-slate-400 font-mono tracking-widest mt-2 uppercase">Poste de Commandement Sécurisé</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#0B1221]/80 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-bold text-white mb-6">Authentification requise</h2>
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
              <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-red-400 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Email Opérateur</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-500" />
                </div>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700/80 text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  placeholder="agent@amen-ia.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Code d'accès</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-500" />
                </div>
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#020617] border border-slate-700/80 text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full relative group overflow-hidden bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm py-3.5 rounded-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  <span>VÉRIFICATION...</span>
                </div>
              ) : (
                "INITIALISER LA SESSION"
              )}
            </button>
          </form>
        </div>
        
        {/* Footer text */}
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-500 font-mono">
            SYSTÈME DE SÉCURITÉ RESTREINT. TOUTE TENTATIVE D'ACCÈS NON AUTORISÉE SERA ENREGISTRÉE.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
