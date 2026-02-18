# Straight_Wallet 💳

> **Next-Gen Consumer Fintech App**  
> A premium, anime-inspired digital wallet built for speed and aesthetics.

## ✨ Features
*   **Real-time Balance**: Updates instantly via Firestore.
*   **Savings Jars**: Create goals and save atomically.
*   **P2P Transfers**: Send money to other users via email or QR.
*   **Spending Analytics**: Visualize your expenses.
*   **Dark Mode**: Sleek, battery-saving dark interface.

## 🛠 Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Configure Environment**:
    Copy `.env.example` to `.env.local` and fill in your Firebase details:
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    # ...
    VITE_CORE_API_URL=http://localhost:3000/api
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 📱 Mobile Support
This app is optimized for mobile views. Open in Chrome DevTools using "iPhone 14 Pro" mode for the best query.

## 📦 Build
```bash
npm run build
```
