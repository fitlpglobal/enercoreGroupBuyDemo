# GroupBuy Platform - Project Summary

## Overview
A fully-featured group buying platform built with Next.js, React, TypeScript, Tailwind CSS, and Supabase. The platform allows sellers to create campaigns with tiered pricing that decreases as more buyers join.

## Features Implemented

### For Buyers
- **Home Page** (`/`)
  - Browse active group buy campaigns
  - See real-time progress toward price targets
  - Visual indicators for discounts and target achievement
  - Beautiful card-based layout with hover effects

- **Product Detail Page** (`/product/[id]`)
  - Detailed product information
  - Real-time buyer count and progress bar
  - Dynamic pricing (starting price vs final price)
  - Checkout form with buyer information
  - Order placement functionality
  - Campaign status indicators (active/paused)

### For Sellers
- **Seller Dashboard** (`/seller`)
  - Create new group buy campaigns
  - Set starting price and final discounted price
  - Define target quantity for price unlock
  - View all campaigns with statistics
  - Pause/Resume campaigns
  - Delete campaigns
  - Real-time revenue tracking
  - Campaign management interface

## Key Functionality

### Dynamic Pricing
- Campaigns start at a higher "starting price"
- Once the target quantity is reached, all buyers get the "final price"
- No timeline pressure - purely quantity-based
- Automatic status updates when target is reached

### Campaign Management
- Sellers can start campaigns (status: active)
- Sellers can pause campaigns (status: paused)
- Sellers can resume paused campaigns
- Automatic completion when target is reached (status: completed)

### Real-time Updates
- Database triggers automatically update campaign quantities
- Progress bars show real-time status
- Visual feedback for target achievement

## Tech Stack

### Frontend
- Next.js 13 (App Router)
- React 18 with TypeScript
- Tailwind CSS for styling
- shadcn/ui component library
- Lucide React for icons

### Backend
- Supabase (PostgreSQL database)
- Row Level Security (RLS) policies
- Database triggers for automatic updates
- RESTful API through Supabase client

## Database Schema

### Tables
1. **campaigns**
   - Product information
   - Pricing tiers (starting_price, final_price)
   - Target and current quantities
   - Status (active, paused, completed)
   - Seller identification

2. **orders**
   - Buyer information (name, email)
   - Order quantity
   - Price paid at time of purchase
   - Campaign association

### Automation
- Trigger function automatically updates campaign quantities when orders are placed
- Automatic status change to "completed" when target is reached

## Design Features

- Modern gradient backgrounds
- Smooth transitions and hover effects
- Responsive grid layouts
- Progress visualization
- Status badges and indicators
- Clean typography and spacing
- Professional color scheme (slate/gray tones)

## Getting Started

1. Set up Supabase database using `DATABASE_SETUP.md`
2. Configure environment variables in `.env.local`
3. Run `npm install` to install dependencies
4. Run `npm run dev` to start development server
5. Visit `http://localhost:3000` for buyer view
6. Visit `http://localhost:3000/seller` for seller dashboard

## File Structure

```
app/
├── layout.tsx          # Root layout with Toaster
├── page.tsx            # Home page (buyer view)
├── product/
│   └── [id]/
│       └── page.tsx    # Product detail & checkout
└── seller/
    └── page.tsx        # Seller dashboard

lib/
└── supabase.ts         # Supabase client & types

components/ui/          # shadcn/ui components
```

## Notes

- Type checking passes successfully
- All components use proper TypeScript types
- Client-side rendering with "use client" directives
- Form validation and error handling
- Toast notifications for user feedback
- Professional and production-ready design
