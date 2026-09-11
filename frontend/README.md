# CEX Frontend

A simple React frontend for the Centralized Exchange (CEX) backend.

## Features

- 🔐 User Authentication (Signup/Signin)
- 💰 View Balances (Available & Locked)
- 💵 Deposit Funds
- 📈 Place Orders (Limit Buy/Sell)
- 📋 View Orders
- ❌ Cancel Orders

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

## Configuration

The frontend is configured to proxy API requests to `http://localhost:3000` (your backend).

Make sure your backend is running on port 3000 before starting the frontend.

## Usage

1. **Sign Up**: Create a new account with username and password (min 6 characters)
2. **Deposit**: Add funds to your account (USD, SOL, BTC, ETH)
3. **Place Orders**: Select a market, choose buy/sell, enter price and quantity
4. **Manage Orders**: View your orders and cancel open orders
5. **Check Balance**: Monitor your available and locked balances

## Tech Stack

- React 18
- Vite
- Native CSS (no framework dependencies)
