'use client';
import Link from 'next/link';
import { Heart, Leaf, Shield, Star, Users, Award, Baby, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const TEAM = [
  { name: 'Anjali Mehta', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=80' },
  { name: 'Ravi Sharma', role: 'Head of Product', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&q=80' },
  { name: 'Priya Nair', role: 'Wellness Expert', img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&q=80' },
];

const VALUES = [
  { icon: Shield, title: 'Safety First', desc: 'Every product undergoes rigorous safety testing before reaching your little one.', color: 'bg-blush-100 text-blush-600' },
  { icon: Leaf, title: 'Sustainability', desc: 'We choose organic, eco-friendly materials to protect both babies and the planet.', color: 'bg-sage-100 text-sage-600' },
  { icon: Heart, title: 'Made with Love', desc: 'Each item is curated with the love and care of a parent for a parent.', color: 'bg-pink-100 text-pink-600' },
  { icon: Users, title: 'Community', desc: 'We\'re building a village of parents who support and inspire each other.', color: 'bg-sky-100 text-sky-600' },
];

const MILESTONES = [
  { year: '2018', event: 'Kedos founded in Mumbai by a new mom on a mission.' },
  { year: '2019', event: 'Launched our first organic clothing line — sold out in 48 hours.' },
  { year: '2021', event: 'Reached 10,000 happy families across India.' },
  { year: '2023', event: 'Expanded to 500+ products across 8 categories.' },
  { year: '2024', event: 'Opened our flagship experience store in Andheri, Mumbai.' },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="bg-cream-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-cocoa-800 via-cocoa-700 to-cocoa-800 py-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blush-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-sage-500/10 rounded-full blur-3xl" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-blush-500/20 text-blush-300 px-4 py-1.5 rounded-full text-sm font-body mb-6">
              <Baby size={14} /> Our Story
            </div>
            <h1 className="font-display text-5xl lg:text-6xl text-cream-100 mb-6 leading-tight">
              Born from <span className="text-blush-400 italic">love</span>,<br />built for babies
            </h1>
            <p className="text-lg text-cream-200/70 font-body leading-relaxed max-w-2xl mx-auto">
              Kedos started with one simple belief: every baby deserves the safest, most beautiful products — and every parent deserves to find them easily.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { val: '10,000+', label: 'Happy Families', icon: Users },
                { val: '500+', label: 'Products', icon: ShoppingBag },
                { val: '4.9★', label: 'Average Rating', icon: Star },
                { val: '6 Years', label: 'of Love & Care', icon: Heart },
              ].map((s) => {
                const Icon = s.icon; // ✅ important

                return (

                  <div key={s.label} className="p-6">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-xl 
                      flex items-center justify-center 
                      bg-blush-100 group-hover:bg-blush-200 
                      transition-all duration-300">
                      <Icon
                        size={26}
                        className="text-blush-500 group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="font-display text-3xl text-cocoa-800 mb-1">{s.val}</div>
                    <div className="text-sm text-cocoa-700/60 font-body">{s.label}</div>
                  </div>
                )
              })}

            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-display text-4xl text-cocoa-800 mb-6">Why we started</h2>
                <div className="space-y-4 text-cocoa-700/80 font-body leading-relaxed">
                  <p>
                    When our founder Anjali brought her firstborn home, she spent countless hours searching for baby products that were truly safe, sustainable, and beautiful. The experience was overwhelming — conflicting information, unclear certifications, and products that looked lovely but didn't meet her standards.
                  </p>
                  <p>
                    She decided to do the hard work once, so other parents wouldn't have to. Kedos was born as a carefully curated boutique where every single product has been personally vetted, tested, and approved.
                  </p>
                  <p>
                    Today, we partner with artisan makers, certified organic brands, and innovative designers who share our commitment to quality, safety, and sustainability.
                  </p>
                </div>
                <div className="mt-8 flex gap-4">
                  <Link href="/products" className="px-6 py-3 bg-blush-500 text-white rounded-full font-medium font-body hover:bg-blush-600 transition-colors">
                    Shop Now
                  </Link>
                  <Link href="/contact" className="px-6 py-3 border-2 border-cocoa-800/20 text-cocoa-800 rounded-full font-medium font-body hover:border-blush-400 transition-colors">
                    Get in Touch
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-4 bg-blush-200/30 rounded-3xl rotate-3" />
                <img
                  src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=700&q=80"
                  alt="Baby with products"
                  className="relative rounded-3xl shadow-xl w-full object-cover aspect-[4/3]"
                />
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3">
                  <Award size={28} className="text-blush-500" />
                  <div>
                    <div className="font-display text-sm text-cocoa-800">Award Winning</div>
                    <div className="text-xs text-cocoa-700/50 font-body">Best Baby Store 2023</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-display text-4xl text-cocoa-800 mb-3">What we stand for</h2>
              <p className="text-cocoa-700/60 font-body max-w-xl mx-auto">Our values aren't just words — they guide every product we choose and every decision we make.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map(v => (
                <div key={v.title} className="bg-cream-50 rounded-2xl p-6 text-center hover:shadow-md transition-shadow">
                  <div className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <v.icon size={26} />
                  </div>
                  <h3 className="font-display text-lg text-cocoa-800 mb-2">{v.title}</h3>
                  <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        {/* <section className="py-20 bg-cream-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-4xl text-cocoa-800 text-center mb-14">Our Journey</h2>
            <div className="relative">
              <div className="absolute left-12 top-0 bottom-0 w-0.5 bg-cream-200" />
              <div className="space-y-8">
                {MILESTONES.map((m, i) => (
                  <div key={m.year} className="flex gap-6 items-start animate-fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="w-24 shrink-0 flex flex-col items-center">
                      <div className="w-5 h-5 bg-blush-500 rounded-full border-4 border-cream-50 z-10" />
                      <span className="font-display text-sm text-blush-600 mt-1">{m.year}</span>
                    </div>
                    <div className="bg-white rounded-xl p-4 flex-1 shadow-sm">
                      <p className="text-sm text-cocoa-700/80 font-body leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section> */}

        {/* Team */}
        {/* <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-display text-4xl text-cocoa-800 text-center mb-14">Meet the Team</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
              {TEAM.map(t => (
                <div key={t.name} className="text-center group">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden mb-4 ring-4 ring-cream-200 group-hover:ring-blush-300 transition-all">
                    <img src={t.img} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-display text-lg text-cocoa-800">{t.name}</h3>
                  <p className="text-sm text-cocoa-700/60 font-body">{t.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section> */}

      </main>
      <Footer />
    </>
  );
}
