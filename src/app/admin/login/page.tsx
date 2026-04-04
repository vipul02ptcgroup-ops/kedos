'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Star, ShieldCheck } from 'lucide-react';
import { adminLogin } from '@/lib/adminAuth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Small delay to prevent brute-force
    setTimeout(() => {
      const ok = adminLogin(form.email, form.password);
      if (ok) {
        router.replace('/admin');
      } else {
        setError('Invalid email or password.');
        setLoading(false);
      }
    }, 400);
  };

  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-cocoa-800 to-cocoa-900 px-8 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #2d1a10, #1a0f08)' }}>
            <div className="w-14 h-14 bg-blush-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <h1 className="font-display text-2xl text-white">Admin Access</h1>
            <p className="text-white/60 text-sm font-body mt-1">Sign in to the Kedos admin panel</p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-body flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@kedos.in"
                  className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={show ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-700/40 hover:text-cocoa-700"
                  >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blush-500 hover:bg-blush-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-3.5 rounded-full font-medium font-body transition-colors mt-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  <>
                    <ShieldCheck size={16} /> Sign In to Admin
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-cream-100 text-center">
              <p className="text-xs text-cocoa-700/40 font-body">
                Not an admin?{' '}
                <a href="/" className="text-blush-500 hover:text-blush-600 font-medium">
                  Return to store
                </a>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-cocoa-700/30 font-body mt-4">
          🔒 This area is restricted to authorized personnel only.
        </p>
      </div>
    </main>
  );
}
