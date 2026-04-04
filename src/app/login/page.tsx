'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Star, LogIn } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function LoginPage() {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  return (
    <>
      <Header />
      <main className="min-h-[80vh] bg-cream-50 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* Top strip */}
            <div className="bg-gradient-to-r from-blush-400 to-blush-500 px-8 py-8 text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star size={22} className="text-white fill-white" />
              </div>
              <h1 className="font-display text-2xl text-white">Welcome Back</h1>
              <p className="text-white/80 text-sm font-body mt-1">Sign in to your Kedos account</p>
            </div>

            <div className="px-8 py-8">
              <form className="space-y-5" onSubmit={e => { e.preventDefault(); }}>
                <div>
                  <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-medium text-cocoa-800 font-body">Password</label>
                    <a href="#" className="text-xs text-blush-500 hover:text-blush-600 font-body">Forgot password?</a>
                  </div>
                  <div className="relative">
                    <input
                      type={show ? 'text' : 'password'}
                      required
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 pr-11 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800"
                    />
                    <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-cocoa-700/40 hover:text-cocoa-700">
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input type="checkbox" id="remember" checked={form.remember}
                    onChange={e => setForm({ ...form, remember: e.target.checked })}
                    className="accent-blush-500 w-4 h-4" />
                  <label htmlFor="remember" className="text-sm text-cocoa-700/70 font-body">Remember me</label>
                </div>

                <Link href="/profile">
                  <button type="submit" className="w-full flex items-center justify-center gap-2 bg-blush-500 hover:bg-blush-600 text-white py-3.5 rounded-full font-medium font-body transition-colors mt-2">
                    <LogIn size={16} /> Sign In
                  </button>
                </Link>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-cream-200" /></div>
                <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-cocoa-700/40 font-body">or continue with</span></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['Google', 'Facebook'].map(provider => (
                  <button key={provider} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-cream-200 text-sm font-body text-cocoa-700 hover:bg-cream-50 transition-colors">
                    {provider === 'Google' ? '🔴' : '🔵'} {provider}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-cocoa-700/60 font-body mt-6">
                Don't have an account?{' '}
                <Link href="/register" className="text-blush-500 hover:text-blush-600 font-medium">Create one free</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
