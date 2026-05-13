import Link from 'next/link';
import { Star, Instagram, Facebook, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-cocoa-900 text-cream-100">
      {/* Newsletter */}
      <div className="bg-blush-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div>
            <h3 className="font-display text-2xl text-white">Join Our Little Village</h3>
            <p className="text-white/80 text-sm mt-1 font-body">Get exclusive deals, parenting tips & new arrivals straight to your inbox.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input type="email" placeholder="Your email address"
              className="flex-1 md:w-72 px-4 py-3 rounded-full text-sm font-body bg-white/20 text-white placeholder-white/60 border border-white/30 focus:outline-none focus:bg-white/30" />
            <button className="px-6 py-3 bg-cocoa-800 text-cream-100 rounded-full text-sm font-medium hover:bg-cocoa-900 transition-colors font-body whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4 ">
            <img src='/Images/Logo.png' className='h-14 w-auto'/>
          </div>
          <p className="text-cream-200/70 text-sm leading-relaxed font-body">
            Lovingly curated baby products designed for safety, comfort, and joy. Every product is tested and trusted by parents.
          </p>
          {/* <div className="flex gap-3 mt-6">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 bg-cream-100/10 hover:bg-blush-500 rounded-full flex items-center justify-center transition-colors">
                <Icon size={16} />
              </a>  
            ))}
          </div> */}
        </div>

        {/* Shop */}
        <div>
          <h4 className="font-display text-base mb-4">Shop</h4>
          <ul className="space-y-2.5">
            {['New Arrivals', 'Best Sellers', 'Clothing', 'Toys & Play', 'Nursery', 'Bath Time', 'Feeding', 'Gear'].map(item => (
              <li key={item}>
                <Link href="/products" className="text-cream-200/70 hover:text-blush-400 text-sm transition-colors font-body">{item}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Help */}
        <div>
          <h4 className="font-display text-base mb-4">Help</h4>
          <ul className="space-y-2.5">
            {[
              { label: 'FAQ', href: '/contact' },
              { label: 'Shipping Policy', href: '/' },
              { label: 'Returns & Exchanges', href: '/' },
              { label: 'Size Guide', href: '/' },
              { label: 'Track My Order', href: '/' },
              { label: 'Contact Us', href: '/contact' },
              { label: 'About Us', href: '/about' },
            ].map(item => (
              <li key={item.label}>
                <Link href={item.href} className="text-cream-200/70 hover:text-blush-400 text-sm transition-colors font-body">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-display text-base mb-4">Contact</h4>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-cream-200/70 text-sm font-body">
              <MapPin size={16} className="text-blush-400 mt-0.5 shrink-0" />
              Virar (East), Maharashtra, India            </li>
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
            {['🔒 Secure', '🌿 Organic', '🚚 Fast'].map(b => (
              <div key={b} className="bg-cream-100/10 rounded-lg px-2 py-2 text-xs text-center text-cream-200/80 font-body">{b}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-cream-100/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-cream-200/50 text-xs font-body">© 2026 Kedos | Powered by PTCGRAM Private Limited</p>
          <div className="flex gap-4">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(t => (
              <a key={t} href="#" className="text-cream-200/50 hover:text-cream-200 text-xs transition-colors font-body">{t}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
