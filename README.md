# KingOfTheGrill – Modern Point of Sale System with Advanced Dashboard

![KingOfTheGrill Banner]([https://via.placeholder.com/1200x600/6366f1/ffffff?text=POSify+-+Next-Gen+Point+of+Sale+Dashboard](https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3eEt1hztdKEHAnhBxwz7bwZ9moErZifnagZ3YS92c4phBObMnkyREGsDDrGhe1EbwKKg&usqp=CAU])
*Beautiful • Fast • Powerful • Built for Modern Retail*

A full-featured, responsive **Point of Sale (POS)** application built with **React 19**, **Vite**, **Tailwind CSS**, and **Material UI (MUI)** — featuring a stunning real-time dashboard, inventory management, sales analytics, customer tracking, and offline support.

---

### Live Demo (coming soon)
🔗 **https://kingofthegrill.co.ke/#/butchery** *(placeholder)*

---

## Features

| Feature                        | Description                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Real-time Dashboard**        | Live sales, revenue, top products, and performance metrics with beautiful charts |
| **Advanced Analytics**         | Powered by Chart.js, Recharts, and Highcharts                               |
| **Touch-Friendly POS Interface** | Optimized for tablets and touchscreen devices                              |
| **Offline Mode**               | Powered by `localforage` – works without internet                           |
| **Inventory Management**       | Stock tracking, low stock alerts, categories, barcode support              |
| **Customer Management**        | Loyalty points, purchase history, customer profiles                         |
| **Receipts & Invoices**        | PDF generation with `jspdf-autotable`, QR codes, email via EmailJS       |
| **Multiple Payment Methods**   | Cash, Card, Mobile Payments (icons via `react-pay-icons`)                   |
| **Real-time Notifications**    | Using `notistack` + Laravel Echo + Pusher (optional WebSocket support)      |
| **Interactive 3D Elements**    | Powered by `@react-three/fiber` for premium visual appeal                   |
| **Dark/Light Mode**            | Fully supports both themes with smooth transitions                          |
| **Tour Guide**                 | Onboarding with `react-joyride`                                             |
| **Export Reports**             | Excel (via `xlsx`) and PDF exports                                          |
| **Hotkeys Support**            | Speed up operations with `react-hotkeys-hook`                               |

---

## Tech Stack

- **Frontend**: React 19 (RC), Vite, TypeScript (optional), Tailwind CSS
- **UI Framework**: Material UI (MUI v7) + shadcn/ui components
- **Charts & Data Viz**: Chart.js, Recharts, Highcharts, react-gauge-chart
- **State Management**: TanStack React Query (v5)
- **Routing**: React Router DOM v7
- **Animations**: Framer Motion, GSAP, react-confetti
- **Maps**: Google Maps + Leaflet (dual support)
- **3D/Visual Effects**: Three.js via `@react-three/fiber` & `drei`
- **PDF/Excel Export**: jsPDF + AutoTable, xlsx
- **Notifications**: notistack, react-confetti
- **Build Tool**: Vite 4 + React Plugin

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- npm or yarn or pnpm

### Installation

```bash
git clone https://github.com/Davie1007/king_of_the_grill_frontend.git
cd SymoBusiness

# Install dependencies
npm install

# Start development server
npm run dev

#scripts
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run lint       # Run ESLint

#project structure
src/
├── components/       # Reusable UI components
├── pages/            # Route-based page components (Dashboard, POS, Inventory, etc.)
├── features/         # Feature slices (sales, products, customers)
├── hooks/            # Custom React hooks
├── lib/              # Utilities, API clients (axios), helpers
├── assets/           # Images, icons, 3D models
├── styles/           # Tailwind, custom CSS, themes
└── App.jsx & main.jsx

Environment Variables (.env)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
VITE_PUSHER_APP_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_cluster

Deployment
npm run build
# Upload the `dist/` folder
