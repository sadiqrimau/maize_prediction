import { useState, type FormEvent } from 'react';
import { Sprout, Eye, EyeOff, AlertCircle, LogIn } from 'lucide-react';
import { login } from '../utils/auth';

export function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Small delay for UX feel
    setTimeout(() => {
      const ok = login(username, password);
      if (ok) {
        onLogin();
      } else {
        setError('Invalid username or password. Please try again.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4">

      {/* Background grain texture */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.025]"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat', backgroundSize: '128px' }} />

      <div className="w-full max-w-md" style={{ animation: 'fadeInUp 0.5s ease-out both' }}>

        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-forest shadow-lg mb-4"
               style={{ boxShadow: '0 8px 32px rgba(26,92,42,0.35)' }}>
            <Sprout size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-forest-dark tracking-tight">IMTISAL</h1>
          <p className="text-sm text-forest-muted mt-1 font-medium tracking-widest uppercase">
            Maize Price Prediction System
          </p>
          <p className="text-xs text-forest-muted/70 mt-2">
            Adamawa State, Nigeria · Al-Hikmah University 2026
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-forest-border shadow-card overflow-hidden">

          {/* Green top bar */}
          <div className="h-1.5 bg-gradient-to-r from-forest via-forest-dark to-forest" />

          <div className="px-8 py-8">
            <h2 className="font-display text-xl font-bold text-forest-dark mb-1">Sign in</h2>
            <p className="text-sm text-forest-muted mb-6">
              Enter your credentials to access the system.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-forest-dark mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(''); }}
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-forest-dark
                    placeholder:text-forest-muted/50 bg-white
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent
                    transition-shadow duration-150
                    ${error ? 'border-red-300 bg-red-50/30' : 'border-forest-border'}`}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-forest-dark mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(''); }}
                    placeholder="Enter password"
                    required
                    autoComplete="current-password"
                    className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-forest-dark
                      placeholder:text-forest-muted/50 bg-white
                      focus:outline-none focus:ring-2 focus:ring-forest focus:border-transparent
                      transition-shadow duration-150
                      ${error ? 'border-red-300 bg-red-50/30' : 'border-forest-border'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-forest-muted hover:text-forest transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle size={13} className="flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 bg-forest text-white rounded-xl font-semibold text-sm
                           tracking-wide hover:bg-forest-dark active:scale-[0.99]
                           disabled:opacity-60 disabled:cursor-not-allowed
                           transition-all duration-150 shadow-sm hover:shadow-md mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LogIn size={15} />
                    Sign In
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-forest-muted/60 mt-6">
          Maize Price Prediction System · Al-Hikmah University · 2026
        </p>
      </div>
    </div>
  );
}
