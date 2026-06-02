'use client';
import { HelpCircle, ShieldCheck, Truck, RotateCcw, CreditCard, PackageCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, faqSchema } from '@/lib/seo';

const FAQS = [
  {
    icon: Truck,
    q: 'How long does shipping take?',
    a: 'Standard delivery usually takes 3-5 business days. Express delivery is available in select cities and usually arrives in 1-2 business days.',
  },
  {
    icon: RotateCcw,
    q: 'What is your return and exchange policy?',
    a: 'We offer easy returns within 30 days for unused products in original condition and packaging.',
  },
  {
    icon: ShieldCheck,
    q: 'Are your products safe for babies?',
    a: 'Yes. We prioritize safety-first curation and only list products that meet quality and safety standards.',
  },
  {
    icon: CreditCard,
    q: 'Which payment methods are supported?',
    a: 'You can pay using cards, UPI, net banking, and other methods shown during checkout.',
  },
  {
    icon: PackageCheck,
    q: 'How can I track my order?',
    a: 'After placing an order, you can track it from your profile orders page. You also receive updates on registered contact details.',
  },
];

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ]),
          faqSchema(FAQS),
        ]}
      />
      <Header />
      <main className="bg-cream-50 min-h-screen">
        <section className="bg-cocoa-800 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <HelpCircle size={40} className="text-blush-400 mx-auto mb-4" />
            <h1 className="font-display text-5xl text-cream-100 mb-3">Frequently Asked Questions</h1>
            <p className="text-cream-200/70 font-body text-lg">Quick answers to common questions from parents.</p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
            {FAQS.map((item) => (
              <article key={item.q} className="bg-white rounded-2xl p-6 shadow-sm border border-cream-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blush-100 text-blush-600 flex items-center justify-center shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h2 className="font-display text-lg text-cocoa-800 mb-2">{item.q}</h2>
                    <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
