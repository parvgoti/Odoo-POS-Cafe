# ☕ Odoo POS Cafe

<div align="center">

![Odoo POS Cafe](https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&h=400&fit=crop&q=80)

**A modern, full-featured Point of Sale system built for cafes and restaurants.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://odoo-pos-cafe-beta.vercel.app)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Razorpay](https://img.shields.io/badge/Razorpay-Test%20Mode-0C2451?style=for-the-badge&logo=razorpay)](https://razorpay.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Razorpay Integration](#-razorpay-integration-test-mode)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🌟 Overview

**Odoo POS Cafe** is a comprehensive Point of Sale (POS) web application designed specifically for cafes, restaurants, and food service businesses. It provides a complete end-to-end solution — from order taking and kitchen management to payment processing and real-time table tracking.

Built with a modern React frontend and powered by Supabase as the backend, it offers real-time synchronization across all devices, making it ideal for busy cafe environments with multiple staff members working simultaneously.

Payments are processed using **Razorpay** (integrated in Test Mode), supporting UPI, Credit/Debit Cards, Netbanking, and Wallets — directly from both the **POS Terminal** and the **Customer Self-Ordering Menu**.

---

## 🚀 Live Demo

> **URL:** [https://odoo-pos-cafe-beta.vercel.app](https://odoo-pos-cafe-beta.vercel.app)

| Role | Access |
|------|--------|
| Admin | Full system access — products, orders, reports, settings |
| Staff | POS terminal, order management, kitchen display |

---

## ✨ Features

### 🔐 Authentication & Security
- **OTP Email Verification** — 6-digit one-time password sent to email on signup
- **Role-Based Access** — Separate Admin and Staff roles with different permissions
- **Supabase Auth** — Secure JWT-based session management
- **Protected Routes** — All pages require authentication; no hardcoded fallbacks

### 📊 Dashboard
- **Live Sales Overview** — Today's revenue, order count, and average order value
- **Payment Method Breakdown** — Visual split of cash vs. digital vs. Razorpay payments
- **Recent Orders Feed** — Scrollable list of the latest transactions
- **Quick Stats Cards** — At-a-glance KPIs for the current session

### 🛍️ Product Management
- **Full CRUD** — Add, edit, and delete products with instant DB sync
- **Category Organization** — 7 default categories (Coffee & Tea, Pizza, Pasta, Starters, Vino, Desserts, Drinks)
- **Product Variants** — Add size/pack variants with optional extra pricing per variant
- **Real Food Images** — Image URL support with live preview in the editor
- **Availability Toggle** — Mark products as in-stock or unavailable in real time
- **Grid & List View** — Switch between card grid and compact list layouts
- **Smart Search & Filter** — Search by name, filter by category

### 🗺️ Floor Plan Management
- **Multi-Floor Support** — Ground Floor, First Floor, Terrace — add unlimited floors
- **Table Configuration** — Set table number and seating capacity per table
- **Visual Floor Editor** — Drag-and-drop style table management UI
- **Real-Time Status** — Tables update live (Available / Occupied) as orders are placed

### 🖥️ POS Terminal
- **Intuitive Order Screen** — Category tabs, product grid, cart panel side-by-side
- **Cart Management** — Add, remove, adjust quantities with instant total calculation
- **Send to Kitchen** — One-click order routing to kitchen display system
- **Tax Calculation** — Automatic 5% GST/tax applied per item category
- **Table Linking** — Orders are linked to selected table for full traceability
- **Session-Based** — All POS activity tied to an active cash register session
- **Razorpay Payment** — Trigger Razorpay modal directly from the POS terminal
- **Cash Payment** — Accept cash with change calculator for walk-in customers

### 💳 Payment Processing
- **Razorpay Integration** — Full Razorpay checkout modal (UPI, Card, Netbanking, Wallets)
- **Cash Payments** — With tendered amount and auto change calculation
- **UPI QR Code** — Dynamic QR generation for UPI payments
- **Receipt Generation** — Printable receipt with itemized bill, totals, and payment details
- **Table Lifecycle** — "Clear Table" frees the table for the next customer

### 📋 Order Management
- **Order History** — Complete list of all orders with status filters
- **Order Status Tracking** — Draft → Confirmed → Completed → Cancelled
- **Payment Status** — Unpaid / Paid tracking per order
- **Session Linking** — Orders tied to POS sessions for accurate shift reporting

### 🍳 Kitchen Display System (KDS)
- **Live Ticket Feed** — Real-time kitchen tickets appear as orders are placed
- **Status Management** — Mark tickets: To Cook → Preparing → Completed
- **Table Reference** — Every ticket shows the table number for easy identification
- **Real-Time Sync** — Powered by Supabase Realtime WebSockets — no page refresh needed

### 🧾 POS Session Management
- **Open/Close Sessions** — Staff opens a session with an opening cash amount
- **Session Revenue Tracking** — Total sales calculated automatically at close
- **Multi-Session History** — Full log of all past sessions with revenue summaries
- **Active Session Guard** — POS terminal is blocked if no session is open

### 📱 Self-Ordering Menu
- **Customer-Facing QR Menu** — Customers scan a QR code to browse and order
- **Razorpay-Only Payment** — Customers pay online via Razorpay modal (no cash at table)
- **Real-Time Table Sync** — Table shows as "occupied" immediately after self-order is placed
- **Product Images & Prices** — Full visual menu with descriptions and pricing
- **Category Navigation** — Customers can filter by food category
- **Order Receipt** — Token number and receipt shown after successful payment

### 📈 Reports & Analytics
- **Sales Over Time** — Bar chart with chronological daily sales, amount labels on bars
- **Payment Split Pie Chart** — Correct SVG donut chart tracking Cash, Card, UPI, and Razorpay
- **Top Products Table** — Revenue and quantity sold per product
- **Advanced Filters** — Filter by session, staff member, or product
- **Export CSV / PDF** — Download reports for accounting

### ⚙️ Settings
- **Theme Toggle** — Light / Dark mode, persisted across sessions (localStorage)
- **Danger Zone** — Reset all tables, clear demo data
- **Payment Methods** — Enable/disable payment methods
- **System Configuration** — Manage global cafe settings

---

## 💳 Razorpay Integration (Test Mode)

Razorpay is integrated throughout the application for online payment collection. It is currently running in **Test Mode** using a test key.

### How It Works

```
Customer/Staff selects items → Cart → Payment Step
    ↓
Razorpay modal opens in browser (no redirect)
    ↓
Customer pays via UPI / Card / Netbanking / Wallet
    ↓
On payment success → Order saved to Supabase DB
    ↓
Receipt / Token number shown
```

### Where It Is Integrated

| Location | Behaviour |
|----------|-----------|
| **POS Terminal** (`/pos`) | Staff can trigger Razorpay modal for table orders |
| **POS Terminal** | Cash payment option also available for walk-in customers |
| **Self-Order Menu** (`/self-order/menu`) | Customer pays via Razorpay only (no cash) |

### Environment Variable

Add this to your `client/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> 🔑 Replace with your own key from [Razorpay Dashboard → Settings → API Keys](https://dashboard.razorpay.com/app/keys)

### Test Mode Credentials

Use these credentials to simulate payments without real money:

| Method | Credentials |
|--------|-------------|
| **UPI (easiest)** | `success@razorpay` |
| **Credit/Debit Card** | `5267 3181 8797 5449` |
| **Card Expiry** | `12/26` |
| **Card CVV** | `123` |
| **OTP** | `1234` |
| **Netbanking** | Select any bank → Success |

> ⚠️ Test mode payments are **never charged** to a real account. Switch to Live Mode by replacing the key with `rzp_live_xxxxxxxxxxxx` when going to production.

### How to Get Your Own Razorpay Key

1. Sign up at [razorpay.com](https://razorpay.com)
2. Go to **Settings → API Keys → Generate Test Key**
3. Copy the **Key ID** (starts with `rzp_test_`)
4. Add it to `client/.env` as `VITE_RAZORPAY_KEY_ID`
5. Add it to Vercel → **Environment Variables** for production

### SDK Loading

The Razorpay checkout script is loaded dynamically (no npm package needed):

```javascript
// client/src/lib/razorpay.js
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 6 |
| **Styling** | Vanilla CSS (custom design system) |
| **Routing** | React Router v7 |
| **Backend** | Supabase (PostgreSQL 15) |
| **Authentication** | Supabase Auth (OTP Email) |
| **Real-Time** | Supabase Realtime (WebSockets) |
| **Payments** | Razorpay (Test Mode) |
| **Icons** | Lucide React |
| **Deployment** | Vercel (Frontend) + Supabase Cloud (Backend) |

---

## 📁 Project Structure

```
Odoo-POS-Cafe/
├── client/                          # React frontend application
│   ├── public/
│   │   └── cafe-icon.png            # Tab favicon
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/                # Login, Signup, AuthContext, OTP
│   │   │   ├── dashboard/           # Dashboard page & stats
│   │   │   ├── products/            # Product management (CRUD + variants)
│   │   │   ├── orders/              # Order history & management
│   │   │   ├── pos/                 # POS terminal (Floor, Order, Payment)
│   │   │   ├── sessions/            # POS session management
│   │   │   ├── kitchen/             # Kitchen display system
│   │   │   ├── self-ordering/       # Customer self-ordering menu (Razorpay)
│   │   │   ├── floor-plans/         # Floor plan editor
│   │   │   ├── reports/             # Analytics & reports
│   │   │   └── settings/            # App settings + theme toggle
│   │   ├── lib/
│   │   │   ├── supabase.js          # Supabase client configuration
│   │   │   ├── razorpay.js          # Razorpay script loader
│   │   │   └── formatters.js        # Currency & date helpers
│   │   ├── App.jsx                  # Root component & routes
│   │   └── main.jsx                 # Entry point + theme init from localStorage
│   ├── .env                         # Environment variables (git-ignored)
│   ├── vercel.json                  # Vercel SPA routing config
│   └── vite.config.js
│
└── server/                          # SQL scripts (Supabase)
    ├── supabase-schema.sql          # Full DB schema + RLS policies
    ├── seed-data.sql                # Sample products, floors, tables
    ├── fix-rls-demo.sql             # Anon access RLS for demo mode
    ├── fix-orders-nullable.sql      # Nullable column fixes
    ├── fix-sessions.sql             # Session table patches
    ├── disable-auto-confirm.sql     # Disables auto email confirm trigger
    └── update-product-images.sql   # Updates products with real images
```

---

## 🗄️ Database Schema

The application uses **13 PostgreSQL tables** managed through Supabase:

| Table | Description |
|-------|-------------|
| `users` | Staff and admin profiles |
| `categories` | Product categories (Coffee, Pizza, etc.) |
| `products` | Menu items with pricing, images, and availability |
| `product_variants` | Size/pack variants with extra pricing |
| `floors` | Physical floor levels of the venue |
| `tables` | Individual tables with seat count and live status |
| `pos_sessions` | Cash register sessions (open/closed) |
| `orders` | Customer orders linked to tables and sessions |
| `order_items` | Individual line items per order |
| `payments` | Payment records with method, amount, and Razorpay ID |
| `payment_methods` | Available payment types (Cash, Digital, UPI, Razorpay) |
| `kitchen_tickets` | Kitchen order tickets for KDS |
| `kitchen_ticket_items` | Items per kitchen ticket |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- A free **[Supabase](https://supabase.com)** account
- A free **[Razorpay](https://razorpay.com)** account (for payment integration)

### 1. Clone the Repository

```bash
git clone https://github.com/parvgoti/Odoo-POS-Cafe.git
cd Odoo-POS-Cafe
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following scripts in order:
   ```
   server/supabase-schema.sql       # Creates all tables & RLS policies
   server/fix-orders-nullable.sql   # Apply column fixes
   server/fix-sessions.sql          # Apply session fixes
   server/fix-rls-demo.sql          # Enable anon access for demo
   server/seed-data.sql             # Insert sample products & tables
   server/update-product-images.sql # Add real food images
   ```
3. Go to **Authentication → Providers → Email** and enable **Confirm Email**
4. Go to **Authentication → Email Templates → Confirm Signup** and set body to use `{{ .Token }}`
5. Go to **Database → Replication** and enable Realtime for the `tables` table

### 3. Configure Environment Variables

Create `client/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

> Find Supabase keys in **Project Settings → API**  
> Find Razorpay key in **Dashboard → Settings → API Keys**

### 4. Install & Run

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### 5. First Setup

1. Go to `/signup` and create an Admin account
2. Verify your email with the 6-digit OTP
3. Go to **POS Sessions** → Open a new session
4. Open the POS terminal and start taking orders!
5. Use the Razorpay test credentials above to simulate payments

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → Import your repo
3. Set **Root Directory** to `client`
4. Add Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_RAZORPAY_KEY_ID`
5. Click **Deploy**

After deployment, add your Vercel URL to Supabase:
- **Authentication → URL Configuration → Site URL**: `https://your-app.vercel.app`
- **Redirect URLs**: `https://your-app.vercel.app/**`

---

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/publishable key | ✅ Yes |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Key ID (`rzp_test_...` or `rzp_live_...`) | ✅ Yes |

> ⚠️ Never commit `.env` to Git. It is already added to `.gitignore`.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">

**Built with ❤️ for the Cafe Industry**

[⭐ Star this repo](https://github.com/parvgoti/Odoo-POS-Cafe) · [🐛 Report a Bug](https://github.com/parvgoti/Odoo-POS-Cafe/issues) · [💡 Request Feature](https://github.com/parvgoti/Odoo-POS-Cafe/issues)

</div>