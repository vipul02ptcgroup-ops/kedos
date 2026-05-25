'use client';
import { Truck, Clock3, MapPinned, PackageCheck, AlertCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const points = [
  {
    icon: Truck,
    title: 'Delivery Coverage',
    text: 'We currently deliver across most serviceable PIN codes in India.',
  },
  {
    icon: Clock3,
    title: 'Processing Time',
    text: 'Orders are usually processed within 24-48 hours after confirmation.',
  },
  {
    icon: MapPinned,
    title: 'Estimated Delivery',
    text: 'Standard delivery takes 3-5 business days. Delivery times can vary by location and logistics conditions.',
  },
  {
    icon: PackageCheck,
    title: 'Order Tracking',
    text: 'Once shipped, tracking details are shared and can be checked from your account orders section.',
  },
  {
    icon: AlertCircle,
    title: 'Delays & Exceptions',
    text: 'During festivals, weather issues, or high-volume periods, delivery may take longer than usual.',
  },
];

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main className="bg-cream-50 min-h-screen">
        <section className="bg-cocoa-800 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Truck size={40} className="text-blush-400 mx-auto mb-4" />
            <h1 className="font-display text-5xl text-cream-100 mb-3">Shipping Policy</h1>
            <p className="text-cream-200/70 font-body text-lg">
              Everything you need to know about order processing and delivery.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
            {points.map((item) => (
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
              For urgent delivery questions, contact our support team via the Contact page with your order ID.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

