'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { continueWithGoogle, getUserRole, loginWithEmail } from '@/lib/auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectIfAdmin = async (uid: string) => {
    const role = await getUserRole(uid);
    if (role !== 'admin') {
      setError('Your account is not an admin. Set role=admin in Firestore users collection.');
      return;
    }
    router.replace('/admin');
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await loginWithEmail(form.email, form.password);
      await redirectIfAdmin(user.uid);
    } catch (err: any) {
      setError(err?.message || 'Unable to login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await continueWithGoogle();
      await redirectIfAdmin(user.uid);
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-cocoa-800 to-cocoa-900 px-8 py-8 text-center"
            style={{ background: 'linear-gradient(135deg, #2d1a10, #1a0f08)' }}>
            <div className="w-14 h-14 bg-blush-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <ShieldCheck size={26} className="text-white" />
            </div>
            <h1 className="font-display text-2xl text-white">Admin Access</h1>
            <p className="text-white/60 text-sm font-body mt-1">Login with your normal account. Role decides access.</p>
          </div>

          <div className="px-8 py-8">
            {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

            <form className="space-y-4" onSubmit={handleEmailLogin}>
              <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-cream-200" />
              <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Password" className="w-full px-4 py-3 rounded-xl border border-cream-200" />
              <button type="submit" disabled={loading} className="w-full bg-blush-500 hover:bg-blush-600 disabled:opacity-60 text-white py-3 rounded-full">
                {loading ? 'Checking...' : 'Sign in as admin'}
              </button>
            </form>

            <button onClick={handleGoogleLogin} disabled={loading} className="w-full mt-3 border border-cream-200 py-3 rounded-full text-cocoa-700 disabled:opacity-60">
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
