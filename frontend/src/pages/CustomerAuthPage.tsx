import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, Hash, ArrowRight,
  CheckCircle2, AlertCircle, Eye, EyeOff,
  KeyRound, ArrowLeft, RefreshCw, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../api';
import { formatPhoneNumber } from '../utils/formatters';

export const CustomerAuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Form State for Login / Register
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // The Customer Choice for Registration
  const [isCustomer, setIsCustomer] = useState(false);
  const [customerId, setCustomerId] = useState('');

  // Forgot Password State
  const [forgotStep, setForgotStep] = useState<'request' | 'verify'>('request');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 60-Second Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const handleModeSwitch = (newMode: 'login' | 'register' | 'forgot') => {
    setMode(newMode);
    setError('');
    setSuccessMsg('');
    if (newMode === 'forgot') {
      setForgotStep('request');
      setForgotEmail(email.trim());
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setCountdown(0);
    }
  };

  // Handle Login / Register Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        setSuccessMsg('Welcome back! Logging you in...');
        setTimeout(() => {
          navigate('/');
        }, 800);
      } else if (mode === 'register') {
        // Register validation
        if (!name.trim()) {
          setError('Please enter your full name.');
          setLoading(false);
          return;
        }

        if (!email.trim()) {
          setError('Please enter your email address.');
          setLoading(false);
          return;
        }

        // Phone number is strictly required
        if (!phone.trim()) {
          setError('Phone number is required to register an account.');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }

        if (isCustomer && !customerId.trim()) {
          setError('Please provide your Customer ID or select "No, New User" if you do not have one.');
          setLoading(false);
          return;
        }

        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim(),
          isCustomer,
          customerId: isCustomer ? customerId.trim().toUpperCase() : ''
        });

        setSuccessMsg('Account created successfully! Welcome to Order Center.');
        setTimeout(() => {
          navigate('/');
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request Password Reset Code (60-second validity)
  const handleRequestResetCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await orderApi.forgotPassword(cleanEmail);
      setForgotStep('verify');
      setSuccessMsg(res.message || `A 6-digit verification code was sent to ${cleanEmail} from Wazhamyassin98@gmail.com.`);
      setResetCode('');
      setCountdown(60); // 60 seconds countdown
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email address.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify Code and Reset Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const cleanCode = resetCode.trim();
    if (!cleanCode || cleanCode.length < 6) {
      setError('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    if (countdown === 0) {
      setError('The 60-second verification code has expired. Please click "Resend Code" to receive a new code.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await orderApi.resetPassword(forgotEmail.trim().toLowerCase(), cleanCode, newPassword);
      setSuccessMsg(res.message || 'Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        setEmail(forgotEmail.trim());
        setPassword('');
        setMode('login');
        setForgotStep('request');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setSuccessMsg('Password has been updated. Please sign in with your new password.');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#EBEAE8] flex items-start justify-center p-4 pt-28 pb-16 lg:pt-36 lg:pb-24 relative overflow-hidden">
      {/* Background Ambient Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#711612]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-lg w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 animate-fade-in">
        
        {/* Brand Banner Header */}
        <div className="bg-gradient-to-r from-[#711612] via-[#8B1E1A] to-[#57100D] text-white p-7 text-center relative border-b border-[#D4AF37]/40 shadow-md">
          <Link to="/" className="inline-block transform hover:scale-105 transition-transform duration-200">
            <img src="/logo.png" alt="Order Center" className="h-12 w-auto mx-auto object-contain drop-shadow-md" />
          </Link>
          <h1 className="text-2xl font-display font-bold mt-3 tracking-wide">
            {mode === 'login'
              ? 'Sign In to Your Account'
              : mode === 'register'
              ? 'Create an Account'
              : 'Reset Your Password'}
          </h1>
          <p className="text-xs text-white/80 mt-1 uppercase tracking-wider font-medium">
            {mode === 'forgot'
              ? 'Verification Code Will Be Sent to Your Email'
              : 'Order Center Global Shopping & Shipping'}
          </p>

          {/* Mode Switch Tabs (Shown for Login / Register) */}
          {mode !== 'forgot' && (
            <div className="flex bg-black/30 p-1 rounded-xl mt-5 border border-white/10 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-white text-[#711612] shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-white text-[#711612] shadow'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                Create Account
              </button>
            </div>
          )}
        </div>

        {/* ─── FORGOT PASSWORD MODE ─────────────────────────────────── */}
        {mode === 'forgot' ? (
          <div className="p-6 sm:p-8 space-y-4 bg-white">
            
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Step 1: Request Code */}
            {forgotStep === 'request' ? (
              <form onSubmit={handleRequestResetCode} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter the email address registered with your Order Center account. We will immediately send you a 6-digit verification code to reset your password.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="e.g. name@example.com"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#8B1E1A] hover:to-[#711612] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/20 transition-all duration-200 flex items-center justify-center gap-2 border border-[#D4AF37]/30 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Verification Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#711612] transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            ) : (
              /* Step 2: Verify Code & Set New Password */
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Mail className="w-3.5 h-3.5 text-[#711612]" />
                    <span className="truncate max-w-[220px] font-medium">{forgotEmail}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep('request');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-[11px] font-bold text-[#711612] hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                {/* 6-Digit Code */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      6-Digit Verification Code <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRequestResetCode}
                      disabled={loading || countdown > 0}
                      className="text-[11px] font-bold text-[#711612] hover:underline flex items-center gap-1 disabled:opacity-50 disabled:no-underline disabled:cursor-not-allowed"
                    >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                      <span>{countdown > 0 ? `Resend (${countdown}s)` : 'Resend Code'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      autoComplete="off"
                      value={resetCode}
                      onChange={e => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder=""
                      disabled={countdown === 0}
                      className="w-full pl-9 pr-4 py-2.5 text-lg tracking-[0.35em] font-mono font-bold border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition text-center disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px]">
                    <span className="text-slate-500">
                      Sent from <strong className="text-slate-700">Wazhamyassin98@gmail.com</strong>
                    </span>
                    {countdown > 0 ? (
                      <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Valid for: {countdown}s</span>
                      </span>
                    ) : (
                      <span className="font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Code Expired &bull; Please Resend</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full pl-9 pr-10 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={e => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className="w-full pl-9 pr-10 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || resetCode.length < 6 || !newPassword || countdown === 0}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#8B1E1A] hover:to-[#711612] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/20 transition-all duration-200 flex items-center justify-center gap-2 border border-[#D4AF37]/30 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Reset Password & Sign In</span>
                        <CheckCircle2 className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#711612] transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign In</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        ) : (
          /* ─── LOGIN & REGISTER MODES ─────────────────────────────── */
          <form onSubmit={handleSubmit} autoComplete="off" className="p-6 sm:p-8 space-y-4 bg-white">
            
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* REGISTRATION-ONLY: Customer Choice & Conditional Customer ID Input (Placed at top) */}
            {mode === 'register' && (
              <div className="pb-3 border-b border-slate-100 space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Are you an existing customer?
                </label>

                {/* Two Choice Options */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCustomer(false)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      !isCustomer
                        ? 'border-[#711612] bg-[#711612]/5 text-[#711612] ring-2 ring-[#711612]/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      !isCustomer ? 'border-[#711612] bg-[#711612]' : 'border-slate-300'
                    }`}>
                      {!isCustomer && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs">No, New User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsCustomer(true)}
                    className={`p-3 rounded-xl border text-left transition flex items-center gap-2.5 ${
                      isCustomer
                        ? 'border-[#711612] bg-amber-50/60 text-[#711612] ring-2 ring-[#711612]/20 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isCustomer ? 'border-[#711612] bg-[#711612]' : 'border-slate-300'
                    }`}>
                      {isCustomer && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs">Yes, I'm a Customer</span>
                  </button>
                </div>

                {/* CONDITIONAL INPUT: Appears ONLY if user is a customer */}
                {isCustomer && (
                  <div className="p-3.5 bg-gradient-to-br from-amber-50/80 to-amber-100/40 rounded-xl border border-[#D4AF37]/50 space-y-2 animate-slide-down">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#711612] uppercase tracking-wider flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Customer ID <span className="text-red-500">*</span></span>
                      </label>
                      <span className="text-[10px] text-amber-800 font-semibold bg-[#D4AF37]/20 px-2 py-0.5 rounded">
                        Required
                      </span>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required={isCustomer}
                        autoComplete="off"
                        value={customerId}
                        onChange={e => setCustomerId(e.target.value.toUpperCase())}
                        placeholder=""
                        className="w-full px-3.5 py-2 text-sm border-amber-300 rounded-lg shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 bg-white font-mono uppercase font-bold text-slate-900 border"
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      Enter your assigned Customer ID to connect your active shipments and order history.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* REGISTRATION-ONLY: Full Name */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition"
                />
              </div>
            </div>

            {/* REGISTRATION-ONLY: Phone Number (MANDATORY) */}
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    autoComplete="tel"
                    value={phone}
                    onChange={e => setPhone(formatPhoneNumber(e.target.value))}
                    placeholder="0770 123 4567"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border font-mono transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Required for delivery tracking, SMS updates, and customer verification.
                </p>
              </div>
            )}

            {/* Password Field with Forgot Password Option */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-red-500">*</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('forgot')}
                    className="text-xs font-semibold text-[#711612] hover:text-[#8B1E1A] hover:underline transition"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-10 py-2.5 text-sm border-slate-300 rounded-xl shadow-sm focus:border-[#711612] focus:ring-2 focus:ring-[#711612]/20 border transition"
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

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#711612] to-[#8B1E1A] hover:from-[#8B1E1A] hover:to-[#711612] text-white font-bold text-sm rounded-xl shadow-lg shadow-red-950/20 transition-all duration-200 flex items-center justify-center gap-2 border border-[#D4AF37]/30 disabled:opacity-60"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Mode Footer Switch */}
            <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-600">
              {mode === 'login' ? (
                <p>
                  Don't have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('register')}
                    className="font-bold text-[#711612] hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeSwitch('login')}
                    className="font-bold text-[#711612] hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
