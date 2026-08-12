import React, { useState } from 'react';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function AuthModal() {
  const { authOpen, authTab, authError, setAuthTab, setAuthError, closeAuth, login, register } = useAuth();
  const { dark } = useTheme();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPass,    setRegPass]    = useState('');
  const [loading,    setLoading]    = useState(false);

  if (!authOpen) return null;

  const handleLogin = async () => {
    if (!loginEmail.trim() || !loginPass.trim()) {
      setAuthError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    await login(loginEmail.trim(), loginPass);
    setLoading(false);
  };

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPass.trim()) {
      setAuthError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    await register(regName.trim(), regEmail.trim(), regPass);
    setLoading(false);
  };

  const inputCls = `w-full rounded-lg px-3 py-2.5 text-[0.82rem] outline-none transition-colors border-[1.5px] font-sans ${
    dark
      ? 'bg-[#222] border-white/10 text-white focus:border-[#cc0000]/60 placeholder-gray-600'
      : 'bg-gray-100 border-black/10 text-gray-900 focus:border-[#cc0000]/60 placeholder-gray-400'
  }`;

  const labelCls = `block text-[0.6rem] font-bold uppercase tracking-widest mb-1.5 ${dark ? 'text-gray-400' : 'text-gray-500'}`;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) closeAuth(); }}
    >
      <div className={`relative w-full max-w-sm rounded-2xl border-t-4 border-[#cc0000] p-6 shadow-2xl ${dark ? 'bg-[#1a1a1a]' : 'bg-white'}`}>

        {/* Close */}
        <button
          onClick={closeAuth}
          className={`absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
            dark ? 'bg-[#2a2a2a] text-gray-400 hover:bg-[#cc0000] hover:text-white'
                 : 'bg-gray-100 text-gray-500 hover:bg-[#cc0000] hover:text-white'
          }`}
        >✕</button>

        {/* Header */}
        <h2 className={`text-lg font-black uppercase tracking-tight mb-0.5 ${dark ? 'text-white' : 'text-gray-900'}`}>
          Goal<span className="text-[#cc0000]">pedia</span>
        </h2>
        <p className={`text-[0.68rem] mb-4 ${dark ? 'text-gray-400' : 'text-gray-500'}`}>
          {authTab === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </p>

        {/* Tabs */}
        <div className={`flex border-b mb-4 ${dark ? 'border-white/10' : 'border-black/10'}`}>
          {[['login','Sign In'],['register','Register']].map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => { setAuthTab(tab); setAuthError(''); }}
              className={`flex-1 py-2 text-[0.7rem] font-bold uppercase tracking-widest border-b-[3px] -mb-px transition-colors ${
                authTab === tab
                  ? 'text-[#cc0000] border-[#cc0000]'
                  : `border-transparent ${dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Error message */}
        {authError && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-500/10 border-l-[3px] border-red-500 text-[0.62rem] text-red-400">
            {authError}
          </div>
        )}

        {authTab === 'login' ? (
          <>
            <div className="mb-3">
              <label className={labelCls}>Email</label>
              <input
                className={inputCls} type="email" placeholder="you@example.com"
                value={loginEmail} onChange={e => setLoginEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Password</label>
              <input
                className={inputCls} type="password" placeholder="••••••••"
                value={loginPass} onChange={e => setLoginPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#cc0000] hover:bg-[#a80000] disabled:opacity-60 text-white text-[0.78rem] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
              ) : 'Sign In'}
            </button>
            <p className={`text-center text-[0.62rem] mt-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Don't have an account?{' '}
              <button onClick={() => { setAuthTab('register'); setAuthError(''); }} className="text-[#cc0000] font-semibold hover:underline">
                Register here
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="mb-3">
              <label className={labelCls}>Full Name</label>
              <input
                className={inputCls} type="text" placeholder="John Doe"
                value={regName} onChange={e => setRegName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-3">
              <label className={labelCls}>Email</label>
              <input
                className={inputCls} type="email" placeholder="you@example.com"
                value={regEmail} onChange={e => setRegEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className={labelCls}>Password</label>
              <input
                className={inputCls} type="password" placeholder="Min. 6 characters"
                value={regPass} onChange={e => setRegPass(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleRegister()}
                disabled={loading}
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#cc0000] hover:bg-[#a80000] disabled:opacity-60 text-white text-[0.78rem] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating account…</>
              ) : 'Create Account'}
            </button>
            <p className={`text-center text-[0.62rem] mt-3 ${dark ? 'text-gray-500' : 'text-gray-400'}`}>
              Already have an account?{' '}
              <button onClick={() => { setAuthTab('login'); setAuthError(''); }} className="text-[#cc0000] font-semibold hover:underline">
                Sign in here
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
