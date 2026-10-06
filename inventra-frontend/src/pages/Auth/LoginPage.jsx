import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, ArrowRight, BarChart3, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) nextErrors.email = 'Enter a valid email address.';
    if (password.length < 6) nextErrors.password = 'Password must be at least 6 characters.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setServerError('');
    setLoading(true);
    try {
      await login(email.trim(), password, remember);
    } catch (err) {
      setServerError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#0b1025] p-4 sm:p-8 relative overflow-hidden inventra-enter">
      <div className="absolute -top-40 left-1/4 w-[28rem] h-[28rem] bg-cyan-400/20 rounded-full blur-[110px]" />
      <div className="absolute -bottom-48 right-1/4 w-[32rem] h-[32rem] bg-fuchsia-500/20 rounded-full blur-[130px]" />

      <div className="w-full max-w-5xl min-h-[620px] grid lg:grid-cols-[1.05fr_0.95fr] bg-slate-950/70 border border-white/10 rounded-[2rem] shadow-2xl shadow-cyan-950/40 backdrop-blur-2xl overflow-hidden relative z-10">
        <section className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-indigo-900/70 via-slate-900/40 to-cyan-900/60 border-r border-white/10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-300 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-400/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-white font-black tracking-tight">INVENTRA</p>
                <p className="text-[10px] text-cyan-300 font-bold tracking-[0.24em]">INVENTORY SYSTEM</p>
              </div>
            </div>
            <div className="mt-24 max-w-sm">
              <p className="text-cyan-300 text-xs font-bold uppercase tracking-[0.22em] mb-4">Your command center</p>
              <h1 className="text-5xl font-black leading-[1.05] text-white">Inventory, in a clearer light.</h1>
              <p className="mt-5 text-sm leading-6 text-slate-300">Track stock, suppliers, movement and every important action from one calm workspace.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <Sparkles className="w-4 h-4 text-cyan-300 mb-5" />
              <p className="text-white font-bold text-sm">Live clarity</p>
              <p className="text-[11px] text-slate-400 mt-1">Decisions at a glance</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-xl">
              <ShieldCheck className="w-4 h-4 text-fuchsia-300 mb-5" />
              <p className="text-white font-bold text-sm">Audit ready</p>
              <p className="text-[11px] text-slate-400 mt-1">Every action accounted for</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-6 sm:p-12 bg-slate-900/50">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-10 lg:hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-300 to-emerald-400 flex items-center justify-center text-slate-950">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-white font-black">INVENTRA</p>
                <p className="text-[9px] text-cyan-300 font-bold tracking-[0.2em]">INVENTORY SYSTEM</p>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-cyan-300 text-xs font-bold uppercase tracking-[0.2em] mb-3">Secure access</p>
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome back</h2>
              <p className="text-sm text-slate-400 mt-2">Sign in to continue to your inventory workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {serverError && <div role="alert" className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300">{serverError}</div>}
          {/* Email Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
              <Mail size={18} />
            </div>
            <input
              type="email"
              required
              placeholder="Email address" autoComplete="username"
              className={`w-full pl-11 pr-4 py-3.5 bg-slate-800/70 border rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all ${errors.email ? 'border-rose-400' : 'border-white/10'}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="mt-1.5 ml-1 text-xs text-rose-300">{errors.email}</p>}
          </div>

          {/* Password Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-500">
              <Lock size={18} />
            </div>
            <input
              type="password"
              required
              placeholder="Password" autoComplete="current-password"
              className={`w-full pl-11 pr-4 py-3.5 bg-slate-800/70 border rounded-2xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/30 focus:border-cyan-300 transition-all ${errors.password ? 'border-rose-400' : 'border-white/10'}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="mt-1.5 ml-1 text-xs text-rose-300">{errors.password}</p>}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-400 focus:ring-cyan-500 border-slate-600 bg-slate-800"
              />
              Remember Me
            </label>
            <span className="text-slate-500 font-medium">Forgot password? Contact your admin.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="disabled:opacity-70 w-full py-4 bg-gradient-to-r from-cyan-300 via-emerald-300 to-fuchsia-300 hover:from-cyan-200 hover:via-emerald-200 hover:to-fuchsia-200 text-slate-950 font-black rounded-2xl shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.01]"
          >
            <span>{loading ? 'Signing in...' : 'Login'}</span>
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
          </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LoginPage;