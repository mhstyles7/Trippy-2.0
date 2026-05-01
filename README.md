# 🚀 Trippy 2.0

Trippy 2.0 is a modern, full-stack travel marketplace and social community platform. It connects travelers with car rental providers, integrating social features with a robust bidding engine.

## ✨ Features

### 🔐 Authentication & Identity
- **Dual User Roles:** Travelers and Car Rental Providers.
- **Login Options:** Email/Password and Google OAuth.
- **OCR Verification:** Automatic identity verification using Tesseract.js (NID, Passport, Driving License).
- **Profiles:** Customizable bios and verified badges.

### 🌍 Social & Community
- **Travel Feed:** Share journeys with rich descriptions and image galleries.
- **Community Engagement:** Full commenting system on travel posts.
- **Friend Connections:** Send, accept, and manage friend requests.
- **AI Travel Assistant:** Floating global chatbot powered by Google Gemini for travel advice.

### 🧳 Marketplace (Traveler)
- **Trip Requests:** Broadcast travel needs (destination, dates, budget, etc.).
- **AI Itineraries:** Automatic day-by-day itinerary generation via Gemini API based on trip destinations.
- **Interactive Maps:** Live Leaflet/OpenStreetMap visualization of trip destinations.
- **Offer Management:** Receive, review, and accept competitive rental bids from providers.
- **Ratings:** 5-star rating system for providers after a completed trip.

### 🚗 Marketplace (Provider)
- **Virtual Garage:** Add and manage a fleet of vehicles (pricing, seats, AC options).
- **Lead Generation:** Browse all open trip requests from travelers.
- **Bidding Engine:** Submit custom offers to travelers with specific vehicles and personalized pitches.

### 💬 Real-Time Communication
- **Global Notifications:** Real-time alerts for friend requests, new offers, and accepted bookings.
- **In-Trip Chat:** Secure, private messaging unlocked between the traveler and provider upon booking confirmation.

## 🛠️ Tech Stack
- **Frontend:** React 18, Vite, TailwindCSS, DaisyUI, Lucide React
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI & Integrations:** Google Gemini API, Tesseract.js (OCR), Leaflet (Maps)
- **Design:** Modern Glassmorphism aesthetic

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas URL)
- Google Gemini API Key
- Google OAuth Client ID

### Installation
1. Clone the repository
2. Navigate to the `main` directory:
   ```bash
   cd main
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the `main` directory with the following variables:
   ```env
   MONGO_URI=your_mongodb_connection_string
   VITE_GEMINI_API_KEY=your_gemini_key
   VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
   ```

### Running the App
The project uses concurrent scripts for local development. Inside the `main` directory:

Start the backend server (runs on port 3000):
```bash
npm run server:watch
```

Start the Vite frontend development server:
```bash
npm run dev
```

### Seeding the Database
To populate the database with realistic sample data (users, posts, vehicles, and trips), run:
```bash
npm run seed
```
This will create test accounts:
- **Traveler:** `traveler@trippy.com` (password: `test1234`)
- **Provider:** `provider@trippy.com` (password: `test1234`)

## 📝 License
This project is open-source and available under the MIT License.
