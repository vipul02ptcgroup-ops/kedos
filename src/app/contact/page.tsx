'use client';
import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const FAQS = [
  { q: 'What is your return policy?', a: 'We offer hassle-free returns within 30 days of purchase. Items must be unused and in original packaging.' },
  { q: 'How long does shipping take?', a: 'Standard delivery takes 3-5 business days. Express delivery (1-2 days) is available for select cities.' },
  { q: 'Are all your products certified safe?', a: 'Yes! Every product meets BIS standards and international safety certifications. We test all items before listing.' },
  { q: 'Do you offer gift wrapping?', a: 'Absolutely! Select gift wrapping at checkout for a beautiful, eco-friendly presentation.' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <>
      <Header />
      <main className="bg-cream-50">
        {/* Hero */}
        <div className="bg-cocoa-800 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <MessageCircle size={40} className="text-blush-400 mx-auto mb-4" />
            <h1 className="font-display text-5xl text-cream-100 mb-3">We'd love to hear from you</h1>
            <p className="text-cream-200/70 font-body text-lg">Our team is here to help with any questions about our products.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid lg:grid-cols-3 gap-10">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="font-display text-2xl text-cocoa-800 mb-6">Get in touch</h2>
                <div className="space-y-4">
                  {[
                    { icon: Phone, label: 'Phone', val: '+91 91208 79879', sub: 'Mon–Sat, 9am–6pm' },
                    { icon: Mail, label: 'Email', val: 'ptcvirar@gmail.com', sub: 'We reply within 24 hrs' },
                    { icon: MapPin, label: 'Store', val: 'Virar (East), Maharashtra, India', sub: 'Mumbai, 400053' },
                    { icon: Clock, label: 'Hours', val: 'Mon–Sat: 9am – 7pm', sub: 'Sun: 10am – 5pm' },
                  ].map(item => (
                    <div key={item.label} className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-sm">
                      <div className="w-10 h-10 bg-blush-100 rounded-xl flex items-center justify-center shrink-0">
                        <item.icon size={18} className="text-blush-600" />
                      </div>
                      <div>
                        <div className="font-medium text-sm text-cocoa-800 font-body">{item.label}</div>
                        <div className="text-sm text-cocoa-700/70 font-body">{item.val}</div>
                        <div className="text-xs text-cocoa-700/40 font-body">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Map placeholder */}
              {/* <div className="rounded-2xl overflow-hidden h-48 bg-cream-200 flex items-center justify-center">
                <div className="text-center text-cocoa-700/40">
                  <MapPin size={32} className="mx-auto mb-2" />
                  <p className="text-sm font-body">Map View</p>
                </div>
              </div> */}
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle size={56} className="text-sage-500 mx-auto mb-4" />
                    <h3 className="font-display text-2xl text-cocoa-800 mb-2">Message Sent!</h3>
                    <p className="text-cocoa-700/60 font-body mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                    <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-blush-500 text-white rounded-full font-body text-sm hover:bg-blush-600 transition-colors">
                      Send Another
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="font-display text-2xl text-cocoa-800 mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Full Name *</label>
                          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Your name"
                            className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 focus:border-transparent text-cocoa-800" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Email *</label>
                          <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                            placeholder="your@email.com"
                            className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Subject</label>
                        <select value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 text-cocoa-800">
                          <option value="">Select a topic</option>
                          <option>Order Enquiry</option>
                          <option>Return / Refund</option>
                          <option>Product Information</option>
                          <option>Partnership</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-cocoa-800 font-body mb-1.5">Message *</label>
                        <textarea required value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                          rows={5} placeholder="Tell us how we can help..."
                          className="w-full px-4 py-3 rounded-xl border border-cream-200 bg-cream-50 text-sm font-body focus:outline-none focus:ring-2 focus:ring-blush-300 resize-none text-cocoa-800" />
                      </div>
                      <button type="submit"
                        className="w-full flex items-center justify-center gap-2 bg-blush-500 hover:bg-blush-600 text-white py-3.5 rounded-full font-medium font-body transition-colors">
                        <Send size={16} /> Send Message
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-20">
            <h2 className="font-display text-3xl text-cocoa-800 text-center mb-10">Frequently Asked Questions</h2>
            <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
              {FAQS.map(faq => (
                <div key={faq.q} className="bg-white rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display text-base text-cocoa-800 mb-2">{faq.q}</h3>
                  <p className="text-sm text-cocoa-700/70 font-body leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
