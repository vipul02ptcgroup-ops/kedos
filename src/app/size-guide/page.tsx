'use client';
import { useEffect, useState } from 'react';
import { Ruler, Shirt, Baby, Footprints, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { DEFAULT_SIZE_GUIDE, subscribeSizeGuide, type SizeGuideContent } from '@/lib/sizeGuide';

export default function SizeGuidePage() {
  const [content, setContent] = useState<SizeGuideContent>(DEFAULT_SIZE_GUIDE);

  useEffect(() => {
    const unsub = subscribeSizeGuide(setContent);
    return () => unsub();
  }, []);

  return (
    <>
      <Header />
      <main className="bg-cream-50 min-h-screen">
        <section className="bg-cocoa-800 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Ruler size={40} className="text-blush-400 mx-auto mb-4" />
            <h1 className="font-display text-5xl text-cream-100 mb-3">Size Guide</h1>
            <p className="text-cream-200/70 font-body text-lg">Find the right fit for your little one.</p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-8">
          <div className="bg-white rounded-2xl border border-cream-200 p-6">
            <h2 className="font-display text-2xl text-cocoa-800 mb-4 inline-flex items-center gap-2">
              <Shirt size={22} className="text-blush-600" /> Clothing Size Chart
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-100 text-cocoa-800">
                    <th className="px-4 py-3 text-left">Age</th>
                    <th className="px-4 py-3 text-left">Chest</th>
                    <th className="px-4 py-3 text-left">Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {content.clothingRows.map((r) => (
                    <tr key={r.age}>
                      <td className="px-4 py-3 text-cocoa-800">{r.age}</td>
                      <td className="px-4 py-3 text-cocoa-700/80">{r.chest}</td>
                      <td className="px-4 py-3 text-cocoa-700/80">{r.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {(content.customSections || []).map((section, idx) => (
            <div key={`${section.title}-${idx}`} className="bg-white rounded-2xl border border-cream-200 p-6">
              <h2 className="font-display text-2xl text-cocoa-800 mb-4">{section.title || `Custom Section ${idx + 1}`}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cream-100 text-cocoa-800">
                      <th className="px-4 py-3 text-left">Label</th>
                      <th className="px-4 py-3 text-left">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {(section.rows || []).map((r, ridx) => (
                      <tr key={`${r.label}-${r.value}-${ridx}`}>
                        <td className="px-4 py-3 text-cocoa-800">{r.label}</td>
                        <td className="px-4 py-3 text-cocoa-700/80">{r.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-2xl border border-cream-200 p-6">
            <h2 className="font-display text-2xl text-cocoa-800 mb-4 inline-flex items-center gap-2">
              <Footprints size={22} className="text-blush-600" /> Baby Footwear Guide
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-cream-100 text-cocoa-800">
                    <th className="px-4 py-3 text-left">Age</th>
                    <th className="px-4 py-3 text-left">Foot Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cream-200">
                  {content.shoeRows.map((r) => (
                    <tr key={r.age}>
                      <td className="px-4 py-3 text-cocoa-800">{r.age}</td>
                      <td className="px-4 py-3 text-cocoa-700/80">{r.foot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-cream-200 p-6">
            <h3 className="font-display text-xl text-cocoa-800 mb-3 inline-flex items-center gap-2">
              <Info size={20} className="text-blush-600" /> Measuring Tips
            </h3>
            <ul className="space-y-2 text-sm text-cocoa-700/80 font-body">
              {content.tips.map((tip, idx) => (
                <li key={`${idx}-${tip}`} className={idx === 0 ? 'inline-flex items-start gap-2' : ''}>
                  {idx === 0 && <Baby size={16} className="mt-0.5 text-blush-500" />}
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
