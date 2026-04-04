'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Star, UserPlus, Check } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', terms: false });

  const passwordStrength = (p: string) => {
    if (p.length === 0) return 0;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
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
              <form className="space-y-4" onSubmit={e => e.preventDefault()}>
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
                    I agree to the{' '}
                    <a href="#" className="text-sage-600 hover:underline">Terms of Service</a> and{' '}
                    <a href="#" className="text-sage-600 hover:underline">Privacy Policy</a>
                  </label>
                </div>

                <Link href="/profile">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-sage-500 hover:bg-sage-600 text-white py-3.5 rounded-full font-medium font-body transition-colors mt-2">
                    <UserPlus size={16} /> Create Account
                  </button>
                </Link>
              </form>

              {/* Perks */}
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
