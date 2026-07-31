
import React, { useState } from 'react';
import { Trees, LogIn, FileSpreadsheet, CheckCircle2, ShieldCheck, User, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: (role: 'admin' | 'anggota') => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    
    // Simulate auth check
    setTimeout(() => {
      if (username === 'admin' && password === 'wisanggeni26') {
        alert('Selamat datang, Administrator.');
        onLoginSuccess('admin');
      } else {
        setErrorMsg('Username atau Password salah!');
      }
      setLoading(false);
    }, 600);
  };

  const handleAnggotaLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert('Anda masuk sebagai Anggota (Hanya Lihat).');
      onLoginSuccess('anggota');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Subtle Background Accent */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="w-20 h-20 bg-teal-600 rounded-2xl mx-auto flex items-center justify-center text-white text-3xl shadow-xl shadow-teal-500/30 mb-6 relative z-10">
          <Trees className="w-10 h-10" />
        </div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-1 relative z-10">TPK Talok</h1>
        <p className="text-slate-500 text-sm mb-6 relative z-10">Sistem Informasi Manajemen Kayu</p>
        
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-xs font-semibold rounded-xl border border-rose-200 relative z-10">
            {errorMsg}
          </div>
        )}
        
        <div className="space-y-3 relative z-10">
          {!showAdminForm ? (
            <>
              <button
                onClick={() => setShowAdminForm(true)}
                disabled={loading}
                className="w-full bg-slate-900 text-white font-semibold py-3.5 rounded-xl hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                <Lock className="w-5 h-5" />
                <span>Masuk Sebagai Admin TPK</span>
              </button>
              <button
                onClick={handleAnggotaLogin}
                disabled={loading}
                className="w-full bg-white text-slate-700 border border-slate-200 font-semibold py-3.5 rounded-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-70"
              >
                <User className="w-5 h-5 text-teal-600" />
                <span>Masuk Sebagai Anggota</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleAdminSubmit} className="space-y-4 text-left animate-in fade-in zoom-in duration-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 bg-slate-50 text-sm font-semibold text-slate-800 transition-colors"
                  placeholder="Masukkan username"
                  autoFocus
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 bg-slate-50 text-sm font-semibold text-slate-800 transition-colors"
                      placeholder="Masukkan password"
                      required
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminForm(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-all flex items-center justify-center cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  ) : (
                    <LogIn className="w-4 h-4" />
                  )}
                  <span>Login</span>
                </button>
              </div>
            </form>
          )}
        </div>
        
        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400 space-y-2 relative z-10">
          <p className="flex items-center justify-center gap-1.5 text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Sistem Keamanan Akses Terpusat</span>
          </p>
          <p>Tempat Penimbunan Kayu (TPK) Talok - KPH Perhutani</p>
        </div>
      </div>
    </div>
  );
};
