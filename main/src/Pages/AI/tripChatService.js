// ============================================
// TRIPPY 2.0 AI CHATBOT — Google Gemini API
// Deep travel knowledge + platform expertise
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

const MODEL_SEQUENCE = ["gemini-2.0-flash", "gemini-2.0-flash-lite"];
let currentModelIndex = 0;

const getModel = (index) => genAI.getGenerativeModel({ model: MODEL_SEQUENCE[index] });

const generateWithFallback = async (requestFn) => {
    let idx = currentModelIndex;
    for (let i = 0; i < MODEL_SEQUENCE.length; i++) {
        try {
            const result = await requestFn(getModel(idx));
            currentModelIndex = idx;
            return result;
        } catch (err) {
            const isQuota = err?.status === 429 || String(err?.message).includes('429') || String(err?.message).toLowerCase().includes('quota');
            if (!isQuota) throw err;
            idx = (idx + 1) % MODEL_SEQUENCE.length;
        }
    }
    throw new Error('All Gemini models exhausted');
};

export const PLATFORM_PAGES = {
    home: { name: 'Home', path: '/', description: 'main travel feed with posts and adventures' },
    explore: { name: 'Explore', path: '/explore', description: 'search posts, travelers, and open trip requests' },
    friends: { name: 'Friends', path: '/friends', description: 'connect with travelers, manage friend requests and DM friends' },
    create: { name: 'Create Post', path: '/create', description: 'share a travel adventure with photos' },
    profile: { name: 'Profile', path: '/profile', description: 'view your posts, stats and update your photo' },
    ocr: { name: 'ID Verification', path: '/ocr', description: 'verify your NID or driving license to unlock the marketplace' },
    login: { name: 'Login', path: '/login', description: 'sign in to your account' },
    register: { name: 'Register', path: '/register', description: 'create a new account as Traveler or Car Rental Provider' },
};

const buildSystemPrompt = (userContext) => {
    const { user, currentPage } = userContext || {};
    const isLoggedIn = user && user._id;
    const firstName = user?.name?.split(' ')[0] || '';
    const isProvider = user?.role === 'carRentalUser';
    const isVerified = user?.verifyOCR === true;

    const userCtx = isLoggedIn
        ? `CURRENT USER: ${user.name} | Role: ${isProvider ? 'Car Rental Provider' : 'Traveler'} | Verified: ${isVerified ? 'Yes' : 'No — you should suggest they verify at /ocr'} | Page: ${currentPage || 'home'}`
        : `CURRENT USER: Guest (not logged in) — gently encourage sign-up when relevant`;

    return `You are Trippy — the AI travel assistant built into Trippy 2.0, a Bangladeshi travel social platform. You are sharp, knowledgeable, specific, and engaging. Never give vague or generic replies. Always give real, useful information.

${userCtx}

## WHO YOU ARE
You live inside Trippy 2.0 — a full-stack travel platform for Bangladeshi travelers and beyond. You know every feature of this platform deeply and you also know Bangladesh travel inside-out.

## TRIPPY 2.0 FEATURES YOU KNOW IN DETAIL

### Social Features
- **Home Feed (/)**  — A beautiful scroll of travel posts from the community. Each post has photos, a description, and comments. Anyone can browse; you need an account to post or comment.
- **Explore (/explore)** — Search engine for the whole platform. Three tabs: Posts (travel stories), People (find travelers/providers), Trips (open trip requests looking for a ride). Real-time search powered by MongoDB.
- **Create Post (/create)** — Upload multiple travel photos, write a title and description, share with the community.
- **Friends (/friends)** — Send friend requests, accept/reject incoming ones, see suggestions. Once friends, you can open a **private DM chat** with any friend — just click the message icon next to their name.
- **Profile (/profile)** — Shows your bio, posts, friend count, verification badge. You can change your profile picture by uploading a photo directly (no URL needed).

### Marketplace (requires ID verification)
- **Traveler Dashboard** — Post a trip request: pick destination, dates, group size, budget, vehicle type. Trippy auto-generates an **AI itinerary** with Gemini. You see all offers that come in from providers.
- **Provider Dashboard** — Browse all open trip requests from travelers. Submit custom offers with your vehicle, price, and pitch. Manage your fleet of vehicles (photo upload supported).
- **Bidding System** — Providers compete on price and quality. Travelers accept the best offer.
- **In-Trip Chat** — Once a trip is booked, a private chat channel opens between the traveler and provider.
- **Trip Map** — Every trip request shows an interactive Leaflet map so you can see the destination visually.
- **Ratings** — After completion, travelers rate providers (1–5 stars) to build trust on the platform.

### Trust & Verification
- **OCR Verification (/ocr)** — Upload front and back of your NID or Driving License. Tesseract.js scans the document, extracts your ID number and name. After verification you get a **blue verified badge** next to your name everywhere on the platform.

### Notifications
- Bell icon in the navbar — shows real-time alerts for friend requests, new offers, and accepted trips.

## BANGLADESH TRAVEL KNOWLEDGE (be specific, not generic)

### Top Destinations
- **Cox's Bazar** — World's longest unbroken sea beach (120 km). Best Nov–Feb. Himchori waterfall, Inani beach for snorkeling. Budget: stay at Kolatoli beach hotels, eat fresh fish on the beach. Avoid monsoon season (Jun–Sep).
- **Sundarbans** — The world's largest mangrove delta, UNESCO World Heritage Site. Home to the Royal Bengal Tiger. Entry from Khulna or Mongla. Best Oct–Mar. Book a 2–3 day boat tour. Must-see: Kotka, Kochikhali, Hiron Point.
- **Sajek Valley** — Called "The Cloud Kingdom" — sits at 1800ft in Rangamati. Drive from Dhaka is ~7 hrs. Clouds literally roll through the resort buildings in the morning. Best Dec–Feb. Very popular, book accommodation 2 weeks ahead.
- **Bandarban** — Best for hill treks and waterfalls. Nilgiri (highest hill in Bangladesh at 2200ft with an army resort), Boga Lake (sacred, needs permit), Nafakhum Waterfall (2 day trek from Thanchi). Best Nov–Feb.
- **Sylhet** — Famous for tea gardens (Srimangal — the tea capital), Ratargul Swamp Forest (boat ride through submerged forest), Jaflong stones and the Dawki river view from India, Lawachara National Park (observe hoolock gibbons). Best Oct–Apr.
- **Saint Martin's Island** — Bangladesh's only coral island, southern tip near Cox's Bazar. Take a ship from Teknaf (~3hr). Best Nov–Feb. Crystal clear water, coral reefs, fresh coconuts. Stay overnight to see the stars.
- **Kuakata** — "Daughter of the Sea" — you can see BOTH sunrise AND sunset from the same beach. Buddhist relic temple nearby. Best Nov–Mar. Far from Dhaka (~8hrs) but very worth it.
- **Rangamati** — Kaptai Lake (largest artificial lake in Bangladesh), tribal handicrafts, the hanging bridge. Take a boat for day trips on the lake.

### Practical Bangladesh Travel Tips
- Best time to travel: October–February (cool, dry)
- Avoid June–September (heavy monsoon, landslides in hills)
- Domestic transport: AC bus (Green Line, Shyamoli, Hanif), train (Shonar Bangla, Subarna Express), local CNG and rickshaw
- Food to try: Hilsa fish (national fish, grilled or mustard curry), kacchi biryani (wedding-style), panta bhat, shutki (dried fish — an acquired taste), pithas (rice cakes)
- Budget: BDT 2000–4000/day for comfortable backpacker travel; BDT 1000–2000/day budget
- Safety: generally very safe for tourists; be careful in Chittagong Hill Tracts (permit may be required)

### International Quick-tips
- Beach: Bali (Indonesia), Maldives, Phuket (Thailand), Goa (India)
- Mountains: Nepal (Annapurna, Everest base camp), Bhutan, Darjeeling
- Budget Asia: Vietnam, Cambodia, Thailand — BDT 3000–5000/day all-in

## HOW TO NAVIGATE TRIPPY 2.0
When users want to go somewhere: "Head to **[Page Name]** via the nav bar at the top." or give the direct path.

## PERSONALITY & RESPONSE RULES
- Be specific. If someone says "forest" → talk about Sundarbans and Bandarban forests immediately. Don't ask what they mean.
- Be opinionated. "Cox's Bazar is stunning in December but I'd recommend Saint Martin over it for a unique experience."
- Give concrete details: prices, best months, what to eat, what to avoid.
- Keep responses to 3–5 sentences unless they ask for a detailed itinerary.
- Never say "That's a great topic." Never deflect with a generic "I can help with X, Y, Z" list as a non-answer.
- Don't use emojis.
- If a user asks about a Trippy 2.0 feature, explain it accurately and in detail — you know everything about this platform.
- Address the user by first name (${firstName || 'friend'}) occasionally but not every message.`;
};

export const detectNavigationIntent = (message) => {
    const msg = message.toLowerCase();
    const patterns = {
        home: ['home', 'main page', 'feed', 'posts', 'adventures', 'go back'],
        explore: ['explore', 'search', 'discover', 'find people', 'find trips'],
        friends: ['friend', 'connect', 'travelers', 'people', 'buddy', 'chat', 'message'],
        create: ['create', 'new post', 'share', 'upload', 'write post', 'post a photo'],
        profile: ['profile', 'my account', 'my posts', 'settings', 'change photo'],
        ocr: ['verify', 'verification', 'nid', 'license', 'id card', 'identity', 'badge'],
        login: ['login', 'sign in', 'log in'],
        register: ['register', 'sign up', 'create account', 'join'],
    };
    for (const [page, keywords] of Object.entries(patterns)) {
        if (keywords.some(k => msg.includes(k))) return page;
    }
    return null;
};

export const getAIResponse = async (userMessage, userContext = {}, conversationHistory = []) => {
    if (!GEMINI_API_KEY || !genAI) {
        return getFallbackResponse(userMessage, userContext);
    }
    try {
        const recentHistory = conversationHistory.slice(-8);
        const historyText = recentHistory
            .map(m => `${m.isUser ? 'User' : 'Trippy'}: ${m.text}`)
            .join('\n');

        const systemPrompt = buildSystemPrompt(userContext);
        const fullPrompt = `${systemPrompt}

${historyText ? `CONVERSATION SO FAR:\n${historyText}\n` : ''}
User: ${userMessage}

Trippy:`;

        const result = await generateWithFallback((model) =>
            model.generateContent({
                contents: [{ role: 'user', parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.92,
                    maxOutputTokens: 600,
                },
            })
        );
        const text = result.response.text();
        if (!text) throw new Error('Empty response');
        return text;
    } catch (err) {
        console.error('Gemini error:', err);
        return getFallbackResponse(userMessage, userContext);
    }
};

// Smart fallback — specific answers, not cop-outs
export const getFallbackResponse = (userMessage, userContext = {}) => {
    const msg = userMessage.toLowerCase();
    const name = userContext?.user?.name?.split(' ')[0] || '';
    const greet = name ? `, ${name}` : '';

    // Navigation
    const navPage = detectNavigationIntent(msg);
    if (navPage && PLATFORM_PAGES[navPage]) {
        const p = PLATFORM_PAGES[navPage];
        return `Head to **${p.name}** in the navigation bar — it's where you ${p.description}. Is there anything specific you want to do there?`;
    }

    // Bangladesh destinations — specific
    if (msg.includes('sundarban') || (msg.includes('forest') && !msg.includes('rain'))) {
        return `The Sundarbans is the world's largest mangrove delta — a UNESCO World Heritage Site and home to the Royal Bengal Tiger. Best visited October to March. Book a 2–3 day boat tour departing from Khulna or Mongla. Key spots: Kotka, Kochikhali, and Hiron Point. It's an extraordinary experience${greet}.`;
    }
    if (msg.includes('sajek') || msg.includes('cloud')) {
        return `Sajek Valley in Rangamati is called "The Cloud Kingdom" — at 1800ft, clouds literally roll through the resort balconies in the morning. Best December to February. Drive from Dhaka is about 7 hours. Book accommodation at least 2 weeks ahead as it sells out fast${greet}.`;
    }
    if (msg.includes('cox') || msg.includes('beach') || msg.includes('sea') || msg.includes('ocean')) {
        return `Cox's Bazar has the world's longest unbroken sea beach at 120km. Visit November to February for the best weather. Inani beach is better for snorkeling than the main beach. If you want something unique${greet}, Saint Martin's Island (coral island, 3hr ship from Teknaf) is my top recommendation over Cox's Bazar for a more exclusive experience.`;
    }
    if (msg.includes('bandarban') || msg.includes('mountain') || msg.includes('hill') || msg.includes('trek')) {
        return `Bandarban is Bangladesh's best trekking destination. Nilgiri sits at 2200ft and has a stunning army-run resort above the clouds. Nafakhum Waterfall requires a 2-day trek from Thanchi — absolutely worth it. Boga Lake needs a permit but is sacred and beautiful. Go November to February${greet}.`;
    }
    if (msg.includes('sylhet') || msg.includes('tea')) {
        return `Sylhet is remarkable${greet} — Srimangal has endless emerald tea gardens, Ratargul is a swamp forest you explore by boat, and Lawachara National Park has wild hoolock gibbons you can observe. Best October to April. The local "seven-layer tea" in Srimangal is a must-try.`;
    }
    if (msg.includes('saint martin') || msg.includes('coral') || msg.includes('island')) {
        return `Saint Martin's Island is Bangladesh's only coral island — take a ship from Teknaf (about 3 hours). The water is crystal clear, there are coral reefs, and the night sky with no light pollution is stunning. Stay overnight${greet} — the sunrise is worth it. Best November to February.`;
    }
    if (msg.includes('kuakata') || (msg.includes('sunrise') && msg.includes('sunset'))) {
        return `Kuakata — "Daughter of the Sea" — is one of the rare beaches where you can see both sunrise AND sunset from the same spot. About 8 hours from Dhaka but the journey is worth it. There's also a Buddhist relic temple and a sea turtle conservation area nearby. Best November to March${greet}.`;
    }

    // Platform features
    if (msg.includes('marketplace') || msg.includes('rent') || msg.includes('car') || msg.includes('vehicle')) {
        return `The Trippy 2.0 marketplace works like a reverse bidding system: travelers post a trip request (destination, dates, budget, vehicle type), and verified car rental providers compete by submitting custom offers. The traveler reviews all offers and accepts the best one. You need ID verification at /ocr to access it${greet}.`;
    }
    if (msg.includes('verify') || msg.includes('badge') || msg.includes('nid') || msg.includes('ocr')) {
        return `Head to **ID Verification (/ocr)** in the navbar${greet}. Upload the front and back of your NID or Driving License — Trippy's OCR engine scans it and extracts your ID number automatically. Once verified, you get a blue verified badge next to your name everywhere on the platform and full marketplace access.`;
    }
    if (msg.includes('chat') || msg.includes('dm') || msg.includes('message')) {
        return `Trippy has two chat systems${greet}: (1) **Friend DM** — go to Friends, find someone in your friends list, and click the message icon to open a private chat. (2) **Trip Chat** — once a rental trip is booked, a dedicated chat channel opens between the traveler and provider for coordination.`;
    }
    if (msg.includes('itinerary') || msg.includes('plan') || msg.includes('schedule')) {
        return `When you create a trip request on the Traveler Dashboard${greet}, Trippy automatically generates a full AI-powered itinerary for your destination using Gemini — day-by-day suggestions, what to see, eat, and do. You can also ask me to help plan a trip right here and I'll walk you through it destination by destination.`;
    }
    if (msg.includes('explore') || msg.includes('discover') || msg.includes('search')) {
        return `The Explore page (/explore) is Trippy's search engine${greet}. Switch between three tabs: **Posts** to find travel stories by keyword, **People** to discover travelers and providers, and **Trips** to browse open trip requests that haven't been filled yet. Everything searches in real-time.`;
    }

    // General travel
    if (msg.includes('budget') || msg.includes('cheap') || msg.includes('save money')) {
        return `For Bangladesh travel${greet}, budget BDT 1500–2500/day for comfortable backpacker travel. Take AC buses (Green Line, Shyamoli) instead of flights for medium distances. Eat at local restaurants — a solid meal costs BDT 100–200. Off-season (April–September) prices drop but weather is rough. The cheapest months overall are April–May just before monsoon.`;
    }
    if (msg.includes('food') || msg.includes('eat') || msg.includes('cuisine')) {
        return `Bangladeshi food is exceptional and underrated${greet}. Must-try: Hilsa fish (grilled or mustard curry — the national fish), Kacchi Biryani (slow-cooked wedding-style lamb biryani), Panta Bhat (fermented rice, surprisingly refreshing in summer), and Pithas (rice cakes, especially in winter). In Sylhet, order the seven-layer tea — a local art form.`;
    }
    if (msg.includes('best time') || msg.includes('when to go') || msg.includes('weather') || msg.includes('season')) {
        return `October to February is peak season for Bangladesh travel${greet} — cool, dry, and perfect for beaches, hills, and forests. March–May gets hot but less crowded. Avoid June–September: heavy monsoon brings floods and landslides, especially in Bandarban and Sajek. Exception: the Sylhet tea gardens are hauntingly beautiful in the rain if you don't mind getting wet.`;
    }

    // Greetings
    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('yo') || msg.includes('salaam') || msg.includes('assalamu')) {
        return `Hello${greet}! I'm Trippy — your travel guide and platform assistant for Trippy 2.0. Ask me about any destination in Bangladesh, trip planning, platform features, or how to use the marketplace. Where are you thinking of going?`;
    }
    if (msg.includes('help') || msg.includes('what can you')) {
        return `I can give you specific travel advice for any destination in Bangladesh or internationally, help you plan a trip with budget and timing, or explain any feature on Trippy 2.0 — the marketplace, friend chat, ID verification, or how to find a rental. What would you like to know${greet}?`;
    }
    if (msg.includes('thank')) {
        return `You're welcome${greet}. Let me know if you want more detail on any destination or feature — I'm happy to go deeper.`;
    }

    // Default — still specific
    return `Tell me more about what you're looking for${greet}. If it's a destination, I can give you the best time to visit, what to see, budget, and transport. If it's about Trippy 2.0's features, I know every detail about how the platform works.`;
};
