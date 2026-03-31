# Fashion Store - E-Commerce Mobile App

A full-stack React Native e-commerce fashion app with a Node.js/Express backend.

## Tech Stack

- **Mobile**: React Native (Expo) + TypeScript
- **Navigation**: React Navigation v6 (bottom tabs + stack)
- **State**: Zustand
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcrypt

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo Go app on your phone (for mobile testing)

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:3000`.

### 2. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go to run on your phone.

> **Note**: Update `API_URL` in `mobile/src/api/client.ts` with your machine's local IP if testing on a physical device (e.g., `http://192.168.1.x:3000`).

## Features

- User registration & login (JWT auth)
- Product catalog with search, category filters, and sort
- Product detail with size selector and recommendations
- Shopping cart with quantity controls
- Checkout with address form and order confirmation
- Wishlist with move-to-cart
- Profile with order history
- 30 seed products across 6 fashion categories

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Create account |
| POST | /auth/login | No | Login |
| GET | /auth/me | Yes | Get profile |
| GET | /products | No | List products (search, filter, sort, paginate) |
| GET | /products/featured | No | Featured products |
| GET | /products/recommendations | No | Similar products |
| GET | /products/:id | No | Product detail |
| GET | /categories | No | List categories |
| GET/POST/PUT/DELETE | /cart | Yes | Cart CRUD |
| GET/POST | /orders | Yes | Orders |
| GET/POST/DELETE | /wishlist | Yes | Wishlist |

## Project Structure

```
fashion-app/
├── backend/          # Express API + SQLite
│   └── src/
│       ├── index.ts          # Server entry
│       ├── db.ts             # Database + seed data
│       ├── middleware/auth.ts # JWT middleware
│       └── routes/           # API routes
├── mobile/           # React Native (Expo)
│   ├── App.tsx               # Root navigation
│   └── src/
│       ├── api/client.ts     # Axios instance
│       ├── store/            # Zustand stores
│       ├── screens/          # App screens
│       └── components/       # Reusable components
└── README.md
```

## Seed Data Categories

- Dresses & Tops (5 products)
- Shoes & Sneakers (5 products)
- Bags & Accessories (5 products)
- Jeans & Bottoms (5 products)
- Ethnic Wear (5 products)
- Watches & Jewelry (5 products)
