# Product Requirements Document (PRD)
**Project Name:** Odoo POS Cafe
**Version:** 1.0 (Hackathon Release)
**Date:** April 2026

## 1. Executive Summary
**Odoo POS Cafe** is a sophisticated, end-to-end Point of Sale (POS) and restaurant management system tailored for premium coffee shops and modern restaurants. Built for a fast-paced environment, it bridges the gap between front-of-house order taking, real-time kitchen operations, and backend management through a beautiful, highly-responsive digital experience.

## 2. Target Audience
- **Waitstaff & Cashiers:** Require an intuitive, fast, and visual interface to ring up orders, modify quantities, and manage table statuses effortlessly.
- **Kitchen Staff:** Require a focused, real-time Kanban-style Kitchen Display System (KDS) to track incoming orders, preparation phases, and completion without needing to refresh.
- **Managers & Owners:** Require live analytics, easy menu management (Product CRUD), and floor plan configuration.

## 3. Core Capabilities & Workflows

### 3.1 Point of Sale Terminal (POS)
- **Visual Menu Navigation:** Category-based tabs filtering high-resolution product cards enriched with micro-animations.
- **Cart Management:** Real-time subtotal, tax (5%), and total calculation with quick modifiers (increase/decrease/remove).
- **Order Dispatch:** One-click integration that simultaneously updates the table status, flashes a success sequence, and dispatches an active ticket to the kitchen via WebSocket.

### 3.2 Live Kitchen Display System (KDS)
- **Real-Time Kanban Board:** Direct database subscription pushing ticket updates instantly.
- **Workflow States:** Tickets flow between "To Cook", "Preparing", and "Ready/Completed".
- **Visual Clarity:** Clear table number indicators, timestamps, and order item breakdowns.

### 3.3 Restaurant Management
- **Dashboard:** At-a-glance metrics including total revenue, active orders, and live floor occupancy.
- **Floor Plans:** Real-time visibility into table availability across multiple zones (Ground Floor, First Floor, Terrace).
- **Product CMS:** Fully integrated Create, Read, Update, Delete (CRUD) interface for menu management.

### 3.4 Payment & Auth Processing
- **Hackathon Demo Mode:** Frictionless authentication bypass to eliminate friction during live demos, while maintaining a secure backend structure for future production use.
- **Mock Payment Gateway:** Interactive mock process for Cash, Digital, and QR/UPI payments triggering table release and order completion protocols.

## 4. Technical Architecture

### 4.1 Frontend Tech Stack
- **Framework:** React 19 + Vite 8
- **State Management:** Zustand (for localized fast-state handling without prop-drilling)
- **Routing:** React Router v7
- **Styling:** Custom CSS Design System
  - *Aesthetic:* Premium deep espresso tones, gold accents.
  - *Primitives:* Glassmorphism (`backdrop-filter`), CSS Grid/Flexbox layouts.
  - *Motion:* Hardware-accelerated transitions, interactive hover-lifts, and entrance staggered-animations.
- **Icons:** Lucide React

### 4.2 Backend & Data Layer
- **Provider:** Supabase
- **Database:** PostgreSQL 17 (12 interconnected relational tables)
- **Realtime Services:** Supabase Realtime Channels handling live KDS syncing.
- **Security:** Row Level Security (RLS) configured to support unauthenticated demo access while preserving structural relations.

### 4.3 Database Schema (Key Entities)
1. `products`: Name, price, tax, category relation, and deterministic `image_url`.
2. `categories`: Groupings with UI emojis and sorting.
3. `tables` & `floors`: Managing physical occupancy mapping.
4. `orders` & `order_items`: Capturing financial transactions and specific selections.
5. `kitchen_tickets`: Bridging front-of-house orders to rear-of-house preparation.

## 5. UI/UX Principles
1. **Zero-Latency Feel:** Using optimistic UI updates on the terminal.
2. **High-Density but Clean:** Information is grouped visually using container cards, badges, and distinct typography (monospaced numbers for pricing).
3. **Visual Cues:** Changing table border colors based on status (Available = White, Occupied = Red).

## 6. Future Roadmap
1. **Authentic Payment Integrations:** Wiring the "UPI QR" toggle in Payment Settings to dynamically generate Stripe or Razorpay links.
2. **Reporting Export:** Implementing `jspdf` and `xlsx` for manager-level nightly batch reports.
3. **Production Authentication:** Migrating away from Demo Mode to restricted Role-Based Access Control (RBAC), locking down Supabase RLS.
4. **Inventory Tracking:** Deducting raw ingredients when a final product is marked "Ready" in the kitchen.
