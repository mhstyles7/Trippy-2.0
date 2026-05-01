# 🚀 Trippy 2.0

Trippy 2.0 is a modern, full-stack travel marketplace and social community platform. It connects travelers with car rental providers, combining a social feed with a real-time bidding engine, AI tools, live maps, and in-trip messaging.

---

## ✨ Features

### 🔐 Authentication & Identity
- Email/Password and Google OAuth login
- Dual user roles: **Traveler** and **Car Rental Provider**
- OCR-based identity verification (NID, Passport, Driving License) using Tesseract.js
- Verified badge shown on all content by verified users

### 🌍 Social Community
- Travel feed with rich photo galleries and image lightbox
- Full commenting system on posts
- Friend connections — send, accept, and manage requests
- Profile pages with bio, post count, role, and verification status
- **Profile picture upload** (file upload, not URL)

### 🔍 Explore Page
- Global search across **Posts**, **People**, and **Open Trips** — all powered by MongoDB
- 350ms debounce for a smooth, real-time search experience
- Traveler avatars and verification badges in trip results

### 🧳 Marketplace — Traveler
- Create and broadcast trip requests (destination, dates, budget, group size, vehicle type)
- **AI-generated itineraries** via Google Gemini on trip creation
- **Interactive Leaflet map** visualizing trip destinations
- Accept or reject competitive offers from providers
- 5-star rating system for completed trips

### 🚗 Marketplace — Provider
- Virtual garage to add and manage a fleet of vehicles (**photo upload supported**)
- Browse all open traveler trip requests
- Submit custom-priced offers with vehicle details and a personal pitch

### 💬 Real-Time Communication
- **Global notification bell** — alerts for friend requests, new offers, accepted bookings
- **In-trip private chat** — unlocks after a trip is booked, polling every 4 seconds

### 🤖 AI Travel Assistant
- Floating global chatbot powered by **Google Gemini 2.0 Flash**
- Context-aware: knows the logged-in user, their role, and current page
- Falls back to smart canned responses when API quota is exhausted

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, DaisyUI |
| Icons | Lucide React |
| Maps | Leaflet + React-Leaflet, Nominatim Geocoding |
| Backend | Node.js, Express.js (ESM) |
| Database | MongoDB (native driver) |
| AI | Google Gemini API (`@google/generative-ai`) |
| OCR | Tesseract.js |
| Design | Glassmorphism, gradient animations, micro-interactions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A MongoDB connection string (local or Atlas)
- A Google Gemini API Key
- A Google OAuth Client ID

### 1. Clone & Install

```bash
cd main
npm install
```

### 2. Environment Variables

Create a `.env` file inside the `main/` directory:

```env
MONGO_URI=your_mongodb_connection_string
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

### 3. Run Locally

Open two terminals inside `main/`:

```bash
# Terminal 1 — Backend API (port 3000)
npm run server:watch

# Terminal 2 — Frontend dev server (port 5173)
npm run dev
```

### 4. Seed the Database

Populate the database with 15 realistic accounts, 10 posts, 7 vehicles, 6 trip requests, and more:

```bash
npm run seed
```

---

## 👥 Test Accounts

All accounts use the password: **`test1234`**

### 🧳 Travelers (10)

| Email | Name |
|---|---|
| `aryan@trippy.com` | Aryan Rahman |
| `sarah@trippy.com` | Sarah Chowdhury |
| `faiz@trippy.com` | Faiz Ahmed |
| `nadia@trippy.com` | Nadia Islam |
| `tanvir@trippy.com` | Tanvir Hasan |
| `maliha@trippy.com` | Maliha Akter |
| `rahat@trippy.com` | Rahat Khan |
| `priya@trippy.com` | Priya Das |
| `imran@trippy.com` | Imran Siddiqui |
| `fatima@trippy.com` | Fatima Begum |

### 🚗 Car Rental Providers (5)

| Email | Name |
|---|---|
| `karim@trippy.com` | Karim Hossain |
| `jamil@trippy.com` | Jamil Rent-A-Car |
| `rahim@trippy.com` | Rahim Transport |
| `dhakacar@trippy.com` | Dhaka Car Rentals |
| `safar@trippy.com` | Safar Rides |

### 🔑 Pre-wired test scenarios
- **`aryan@trippy.com`** — Has 3 posts, 2 trip requests (1 open, 1 booked), 1 unread notification, active trip chat
- **`karim@trippy.com`** — Has 2 vehicles, 2 offers sent, active trip chat
- **`sarah@trippy.com`** — Has 1 post and 1 open trip request (Sajek Valley)

---

## 📁 Project Structure

```
main/
├── src/
│   ├── Pages/
│   │   ├── Home/           # Feed + single post view
│   │   ├── Explore/        # Search & discovery page
│   │   ├── Create/         # Post creation with image upload
│   │   ├── Profile/        # User profile + photo upload
│   │   ├── Friends/        # Friend connections
│   │   ├── Marketplace/    # Traveler & Provider dashboards, chat, map
│   │   ├── Authentication/ # Login, Register, OCR Verification
│   │   └── AI/             # Gemini-powered floating chatbot
│   ├── Layout/             # Navbar + notification bell
│   └── index.css           # Global design system
├── server.js               # Express API (all routes)
├── seed.js                 # Database seeder (run: npm run seed)
└── .env                    # Environment variables (not committed)
```

---

## 📝 License

This project is open-source and available under the MIT License.
