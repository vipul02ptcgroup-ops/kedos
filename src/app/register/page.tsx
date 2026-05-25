'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Star, UserPlus, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { completeGoogleRedirectSignIn, continueWithGoogle, registerWithEmail } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', terms: false });

  useEffect(() => {
    let active = true;
    const run = async () => {
      try {
        const user = await completeGoogleRedirectSignIn();
        if (!active || !user) return;
        router.push('/profile');
      } catch (err: any) {
        if (!active) return;
        setError(err?.message || 'Google sign-in failed.');
      }
    };
    void run();
    return () => {
      active = false;
    };
  }, [router]);

  const passwordStrength = (p: string) => {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const name = `${form.firstName} ${form.lastName}`.trim();
      await registerWithEmail({
        name,
        email: form.email,
        password: form.password,
        phone: form.phone,
      });
      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await continueWithGoogle();
      if (!user) return;
      router.push('/profile');
    } catch (err: any) {
      setError(err?.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const strength = passwordStrength(form.password);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-sky-400', 'bg-sage-500'];

  return (
    <>
      <Header />
      <main className="min-h-[80vh] bg-cream-50 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-sage-500 to-sage-400 px-8 py-8 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={22} className="text-white fill-white" />
              </div>
              <h1 className="font-display text-2xl text-white">Join Kedos</h1>
              <p className="text-white/80 text-sm font-body mt-1">Create your free account today</p>
            </div>

            <div className="px-8 py-8">
              {error && <p className="mb-3 text-sm text-red-600 font-body">{error}</p>}
              <form className="space-y-4" onSubmit={onSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">First Name</label>
                    <input required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })}
                      placeholder="Anjali"
                      className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage-300 text-cocoa-800" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Last Name</label>
                    <input required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })}
                      placeholder="Sharma"
                      className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage-300 text-cocoa-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Email Address</label>
                  <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage-300 text-cocoa-800" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="px-3 py-3 bg-cream-100 border border-cream-200 rounded-xl text-sm font-body text-cocoa-700">+91</span>
                    <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="91208 79879"
                      className="flex-1 px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage-300 text-cocoa-800" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Password</label>
                  <div className="relative">
                    <input required type={show ? 'text' : 'password'} value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="Create a strong password"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-sage-300 text-cocoa-800" />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-700/40">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : 'bg-cream-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs font-body text-cocoa-700/60">{strengthLabels[strength]}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <input type="checkbox" id="terms" required checked={form.terms}
                    onChange={e => setForm({ ...form, terms: e.target.checked })}
                    className="accent-sage-500 w-4 h-4 mt-0.5" />
                  <label htmlFor="terms" className="text-sm text-cocoa-700/70 font-body leading-relaxed">
                    I agree to the Terms of Service and Privacy Policy
                  </label>
                </div>

                <button disabled={loading} type="submit" className="w-full flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white py-3.5 rounded-full font-medium font-body transition-colors mt-2">
                  <UserPlus size={16} /> {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              <button onClick={onGoogleRegister} disabled={loading} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cream-200 text-sm font-body text-cocoa-700 hover:bg-cream-50 transition-colors disabled:opacity-60">
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.4 14.7 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12S6.7 21.6 12 21.6c6.9 0 9.6-4.8 9.6-7.3 0-.5-.1-.9-.1-1.3H12z" />
                  <path fill="#34A853" d="M3.6 7.4l3.2 2.3C7.7 7.9 9.7 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.4 14.7 2.4 12 2.4c-3.7 0-6.9 2.1-8.4 5z" />
                  <path fill="#FBBC05" d="M12 21.6c2.6 0 4.8-.9 6.4-2.5l-3-2.4c-.8.6-1.9 1.1-3.4 1.1-3.9 0-5.3-2.6-5.5-3.9l-3.2 2.4c1.5 3 4.6 5.3 8.7 5.3z" />
                  <path fill="#4285F4" d="M21.6 12c0-.6-.1-1.1-.2-1.8H12v3.9h5.5c-.3 1.4-1.1 2.5-2.1 3.3l3 2.4c1.8-1.7 3.2-4.1 3.2-7.8z" />
                </svg>
                Continue with Google
              </button>

              <div className="mt-6 bg-cream-50 rounded-2xl p-4">
                <p className="text-xs font-medium text-cocoa-800 font-body mb-3">What you get with a free account:</p>
                <div className="grid grid-cols-2 gap-2">
                  {['Order tracking', 'Wishlist', 'Exclusive deals', 'Easy returns'].map(perk => (
                    <div key={perk} className="flex items-center gap-1.5 text-xs font-body text-cocoa-700/70">
                      <Check size={12} className="text-sage-500" /> {perk}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-sm text-cocoa-700/60 font-body mt-5">
                Already have an account?{' '}
                <Link href="/login" className="text-blush-500 hover:text-blush-600 font-medium">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
