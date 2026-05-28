'use client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Mail, Phone, MapPin, ShieldCheck, Leaf, Truck } from 'lucide-react';
import { subscribeCategories } from '@/lib/categories';
import { isEmailSubscribed, subscribeEmail } from '@/lib/subscribers';
import { subscribeAuth } from '@/lib/auth';
import { User as FirebaseUser } from 'firebase/auth';

export default function Footer() {
  const [categories, setCategories] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    const unsub = subscribeCategories(setCategories);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeAuth(setUser);
    return () => unsub();
  }, []);

  useEffect(() => {
    const userEmail = String(user?.email || '').trim();
    if (!userEmail) return;
    setEmail((prev) => (prev.trim() ? prev : userEmail));
  }, [user?.email]);

  useEffect(() => {
    let active = true;
    const run = async () => {
      const clean = email.trim();
      if (!clean) {
        if (active) setSubscribed(false);
        return;
      }
      const found = await isEmailSubscribed(clean).catch(() => false);
      if (active) setSubscribed(found);
    };
    void run();
    return () => {
      active = false;
    };
  }, [email]);

  const footerCategories = useMemo(() => {
    if (categories.length > 0) return categories;
    return ['New Arrivals', 'Best Sellers', 'Clothing', 'Toys & Play', 'Nursery', 'Bath Time', 'Feeding', 'Gear'];
  }, [categories]);

  const onSubscribe = async () => {
    setFeedback('');
    const clean = email.trim();
    if (!clean) {
      setFeedback('Please enter your email.');
      return;
    }
    setLoading(true);
    try {
      const result = await subscribeEmail(clean);
      setFeedback(result.created ? '' : 'This email is already subscribed.');
      setSubscribed(true);
    } catch (err: any) {
      setFeedback(err?.message || 'Unable to subscribe right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-cocoa-900 text-cream-100">
      <div className="bg-blush-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
          <div className="w-full md:w-auto text-left">
            <h3 className="font-display text-xl sm:text-2xl text-white">Join Our Little Village</h3>
            <p className="text-white/80 text-sm mt-1 font-body">Get exclusive deals, parenting tips and new arrivals straight to your inbox.</p>
          </div>
          <div className="flex w-full md:w-auto flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:flex-1 md:w-72 px-4 py-3 rounded-full text-sm font-body bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:bg-white/30"
            />
            <button
              onClick={onSubscribe}
              disabled={loading || subscribed}
              className="w-full sm:w-auto px-6 py-3 bg-cocoa-800 text-cream-100 rounded-full text-sm font-medium hover:bg-cocoa-900 transition-colors font-body whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {subscribed ? 'Subscribed' : loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          {feedback && <p className="text-xs text-white/90 font-body w-full md:w-auto md:min-w-[260px]">{feedback}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/Images/Logo.png" className="h-14 w-auto" alt="Kedos logo" />
          </div>
          <p className="text-cream-200/70 text-sm leading-relaxed font-body">
            Lovingly curated baby products designed for safety, comfort, and joy. Every product is tested and trusted by parents.
          </p>
        </div>

        <div>
          <h4 className="font-display text-base mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {footerCategories.map((item) => (
              <li key={item}>
                <Link href={`/products?category=${encodeURIComponent(item)}`} className="text-cream-200/70 hover:text-blush-400 text-sm transition-colors font-body">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base mb-4">Help</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'FAQ', href: '/faq' },
              { label: 'Shipping Policy', href: '/shipping-policy' },
              { label: 'Returns and Exchanges', href: '/returns-and-exchanges' },
              { label: 'Size Guide', href: '/size-guide' },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href} className="text-cream-200/70 hover:text-blush-400 text-sm transition-colors font-body">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-display text-base mb-4">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-cream-200/70 text-sm font-body">
              <MapPin size={16} className="text-blush-400 mt-0.5 shrink-0" />
              Virar (East), Maharashtra, India
            </li>
            <li className="flex items-center gap-3 text-cream-200/70 text-sm font-body">
              <Phone size={16} className="text-blush-400 shrink-0" />
              +91 91208 79879
            </li>
            <li className="flex items-center gap-3 text-cream-200/70 text-sm font-body">
              <Mail size={16} className="text-blush-400 shrink-0" />
              ptcvirar@gmail.com
            </li>
          </ul>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { label: 'Secure', Icon: ShieldCheck },
              { label: 'Organic', Icon: Leaf },
              { label: 'Fast', Icon: Truck },
            ].map(({ label, Icon }) => (
              <div key={label} className="bg-cream-100/10 rounded-lg px-2 py-2 text-xs text-center text-cream-200/80 font-body flex items-center justify-center gap-1.5">
                <Icon size={13} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-cream-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-cream-200/50 text-xs font-body">Copyright 2026 Kedos | Powered by PTCGRAM Private Limited</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((t) => (
              <a key={t} href="#" className="text-cream-200/50 hover:text-cream-200 text-xs transition-colors font-body">
                {t}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
