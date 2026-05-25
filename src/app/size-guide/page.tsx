'use client';
import { Ruler, Shirt, Baby, Footprints, Info } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const clothingRows = [
  { age: '0-3 Months', chest: '16-18 in', length: '13-15 in' },
  { age: '3-6 Months', chest: '18-19 in', length: '15-16 in' },
  { age: '6-12 Months', chest: '19-20 in', length: '16-18 in' },
  { age: '1-2 Years', chest: '20-21 in', length: '18-20 in' },
  { age: '2-3 Years', chest: '21-22 in', length: '20-22 in' },
];

const shoeRows = [
  { age: '0-6 Months', foot: '9-10 cm' },
  { age: '6-12 Months', foot: '10-11 cm' },
  { age: '1-2 Years', foot: '11-12.5 cm' },
  { age: '2-3 Years', foot: '12.5-14 cm' },
];

export default function SizeGuidePage() {
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
                  {clothingRows.map((r) => (
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
                  {shoeRows.map((r) => (
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
              <li className="inline-flex items-start gap-2"><Baby size={16} className="mt-0.5 text-blush-500" /> Measure while your baby is relaxed and standing straight (if possible).</li>
              <li>Choose one size up if your child is between sizes for better comfort.</li>
              <li>Fabric type and style can cause slight size variation.</li>
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

