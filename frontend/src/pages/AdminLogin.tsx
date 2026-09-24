import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Shield, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/admin', { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C2C2C] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Accent Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#711612]/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-3xl" />

      <div className="relative max-w-md w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-white/10 z-10 animate-fade-in">
        
        {/* Header Header */}
        <div className="bg-[#711612] text-white p-8 text-center relative border-b border-[#D4AF37]/40">
          <div className="inline-flex p-3 rounded-full bg-white/10 border border-[#D4AF37]/40 text-[#D4AF37] mb-3">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold">Admin Portal</h1>
          <p className="text-xs text-white/70 mt-1 uppercase tracking-wider font-medium">Order Center Logistics System</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-white">
          {error && (
            <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-slate-300 rounded-md shadow-sm focus:border-[#711612] focus:ring-[#711612] border"
                placeholder="admin@ordercenter.iq"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border-slate-300 rounded-md shadow-sm focus:border-[#711612] focus:ring-[#711612] border"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Demo quick info helper */}
          <div className="bg-[#EBEAE8] p-3 rounded text-[11px] text-slate-600 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="font-bold text-[#711612]">Admin Access Required</span>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">admin@ordercenter.iq / admin123</div>
            </div>
            <button
              type="button"
              onClick={() => { setEmail('admin@ordercenter.iq'); setPassword('admin123'); }}
              className="px-2.5 py-1 text-[10px] font-bold bg-[#711612] text-white hover:bg-[#57100d] rounded transition"
            >
              Auto-fill Demo
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#711612] hover:bg-[#57100d] text-white font-bold text-sm rounded-md shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group border border-[#D4AF37]/30 disabled:opacity-60"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Login to Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
