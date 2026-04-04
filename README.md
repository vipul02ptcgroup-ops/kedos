# 🍼 Kedos — Baby Products E-Commerce (Next.js)

A fully-designed frontend for a baby products e-commerce website with a complete admin panel.

## 🚀 Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📄 Pages

### Public Store
| Route | Page |
|-------|------|
| `/` | Homepage with hero, categories, products |
| `/products` | Products listing with filters |
| `/products/[id]` | Product detail page |
| `/cart` | Cart page |
| `/checkout` | Multi-step checkout |
| `/order-success` | Order confirmation |
| `/login` | Login page |
| `/register` | Register page |
| `/profile` | User profile & orders |
| `/about` | About us |
| `/contact` | Contact form & FAQ |
| `/wishlist` | Saved products |

### Admin Panel
| Route | Page |
|-------|------|
| `/admin` | Dashboard with KPIs & charts |
| `/admin/products` | Product management (CRUD) |
| `/admin/orders` | Order management |
| `/admin/customers` | Customer management |
| `/admin/analytics` | Analytics & reports |
| `/admin/settings` | Store settings |

---

## 🎨 Design

- **Brand**: Kedos Baby Boutique
- **Colors**: Blush pink, sage green, warm cream, cocoa brown
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Style**: Warm, organic, premium — perfect for a luxury baby boutique

## 🛠 Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React icons
- No backend — all mock data in `src/lib/data.ts`

---

## 📂 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── products/page.tsx
│   ├── products/[id]/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   ├── order-success/page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── profile/page.tsx
│   ├── wishlist/page.tsx
│   └── admin/
│       ├── page.tsx           # Dashboard
│       ├── products/page.tsx
│       ├── orders/page.tsx
│       ├── customers/page.tsx
│       ├── analytics/page.tsx
│       └── settings/page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── product/
│   │   └── ProductCard.tsx
│   ├── cart/
│   │   └── CartDrawer.tsx
│   └── admin/
│       └── AdminLayout.tsx
└── lib/
    └── data.ts                # Mock data & types
```
