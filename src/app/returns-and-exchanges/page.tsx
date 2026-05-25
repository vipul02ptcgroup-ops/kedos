'use client';
import { RotateCcw, PackageOpen, ShieldCheck, Clock3, AlertTriangle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const items = [
  {
    icon: PackageOpen,
    title: 'Eligibility',
    text: 'Items must be unused, unwashed, and in original packaging with tags intact.',
  },
  {
    icon: Clock3,
    title: 'Return Window',
    text: 'Return or exchange requests can be raised within 30 days of delivery.',
  },
  {
    icon: RotateCcw,
    title: 'Exchange Process',
    text: 'You can request an exchange for size or product issue subject to stock availability.',
  },
  {
    icon: ShieldCheck,
    title: 'Quality Check',
    text: 'Returned items are inspected before refund or exchange approval.',
  },
  {
    icon: AlertTriangle,
    title: 'Non-Returnable',
    text: 'Hygiene-sensitive or clearance items may not be eligible unless damaged or incorrect.',
  },
];

export default function ReturnsAndExchangesPage() {
  return (
    <>
      <Header />
      <main className="bg-cream-50 min-h-screen">
        <section className="bg-cocoa-800 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <RotateCcw size={40} className="text-blush-400 mx-auto mb-4" />
            <h1 className="font-display text-5xl text-cream-100 mb-3">Returns and Exchanges</h1>
            <p className="text-cream-200/70 font-body text-lg">
              Simple and transparent policy for worry-free shopping.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((item) => (
              <article key={item.title} className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blush-100 text-blush-600 flex items-center justify-center shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-cocoa-800 mb-2">{item.title}</h2>
                    <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">{item.text}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8 bg-white border border-cream-200 rounded-2xl p-6">
            <p className="text-sm text-cocoa-700/80 font-body leading-relaxed">
              To initiate a return or exchange, contact support with your order ID and reason.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

