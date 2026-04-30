// ============================================
// TRIPPY AI CHATBOT — Google Gemini API
// Model rotation, fallback, travel-focused
// ============================================

import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the API Client
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// ============================================
// MODEL ROTATION CONFIG
// ============================================

const MODEL_SEQUENCE = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
];

let currentModelIndex = 0;

const getModelByIndex = (index) => {
    return genAI.getGenerativeModel({ model: MODEL_SEQUENCE[index] });
};

// Generate with fallback for quota handling
const generateWithFallback = async (requestFn) => {
    const totalModels = MODEL_SEQUENCE.length;
    let localIndex = currentModelIndex;
    let attempts = 0;

    while (attempts < totalModels) {
        const model = getModelByIndex(localIndex);
        try {
            const result = await requestFn(model);
            currentModelIndex = localIndex;
            return result;
        } catch (error) {
            const isQuota =
                error?.status === 429 ||
                error?.message?.includes("429") ||
                error?.message?.toLowerCase().includes("quota");
            if (!isQuota) throw error;
            localIndex = (localIndex + 1) % totalModels;
            attempts++;
        }
    }
    throw new Error("All Gemini models exhausted due to quota limits");
};

// Platform pages for navigation guidance
export const PLATFORM_PAGES = {
    home: { name: 'Home', path: '/', description: 'Main landing page with travel posts and featured adventures' },
    login: { name: 'Login', path: '/login', description: 'Sign in to your Trippy 2.0 account' },
    register: { name: 'Register', path: '/register', description: 'Create a new Trippy 2.0 account as a Traveler or Rental Provider' },
    friends: { name: 'Friends', path: '/friends', description: 'Connect with fellow travelers, send and manage friend requests' },
    create: { name: 'Create Post', path: '/create', description: 'Share your travel adventures with photos and stories' },
    profile: { name: 'Profile', path: '/profile', description: 'View your profile, posts, and account details' },
    ocr: { name: 'ID Verification', path: '/ocr', description: 'Verify your identity with NID or Driver\'s License' },
};

// Build personalized system prompt
const buildSystemPrompt = (userContext) => {
    const { user, currentPage } = userContext || {};

    let personalizedInfo = '';

    if (user && user._id) {
        personalizedInfo += `\n\nCURRENT USER CONTEXT:
- Name: ${user.name || 'Traveler'}
- Logged in: Yes
- Role: ${user.role === 'carRentalUser' ? 'Car Rental Provider' : 'Traveler'}
- Verified: ${user.verifyOCR ? 'Yes' : 'No (suggest verification)'}`;
    } else {
        personalizedInfo += `\n\nCURRENT USER: Not logged in (Guest). Suggest they sign up or log in to access all features.`;
    }

    if (currentPage && PLATFORM_PAGES[currentPage]) {
        personalizedInfo += `\n\nUSER'S CURRENT PAGE: ${PLATFORM_PAGES[currentPage].name}`;
    }

    return `You are Trippy 2.0, a professional, enthusiastic, and knowledgeable AI travel assistant for the Trippy 2.0 platform — a traveling community social media and tour management system.

YOUR CORE CAPABILITIES:
1. **Travel Recommendations**: Suggest destinations, packing tips, itinerary ideas, budget travel advice
2. **Platform Expertise**: Answer questions about ALL website features
3. **Navigation Guide**: Help users navigate to different platform areas
4. **Real-time Travel Info**: Provide travel tips, weather advice, safety info, cultural etiquette
5. **Engaging Conversation**: Be dynamic, remember context, ask follow-up questions

AVAILABLE PLATFORM PAGES:
- Home (/): Browse travel posts from the community
- Friends (/friends): Connect with other travelers, manage friend requests
- Create Post (/create): Share your travel adventures with photos and stories
- Profile (/profile): View your posts and account info
- ID Verification (/ocr): Verify your NID or Driver's License for full access
- Login (/login): Sign into your account
- Register (/register): Create a new account (Traveler or Car Rental Provider)

NAVIGATION GUIDANCE:
When users want to go somewhere, say: "Head to **[Page Name]** — you'll find it in the navigation bar at the top!"

TRIPPY FEATURES:
- Social travel posts with photos and comments
- Friend connections and suggestions
- Car rental user profiles
- ID verification via OCR (NID/License scanning)
- AI-powered travel assistance (that's you!)

TRAVEL KNOWLEDGE:
- World destinations, popular routes, hidden gems
- Budget tips, packing lists, visa requirements
- Cultural etiquette and local customs
- Safety tips and weather advisories
- Food recommendations and local cuisine
${personalizedInfo}

RESPONSE STYLE:
- Friendly, professional, and clear
- **CRITICAL: DO NOT use any emojis in your responses.** Use professional language and formatting (bold, lists) for emphasis instead.
- Concise (2-4 sentences) but informative
- Personalize based on user context
- Ask engaging follow-up questions
- For navigation, give CLEAR directions
- Name is "Trippy 2.0" — never use any other name`;
};

// Detect navigation intent
export const detectNavigationIntent = (message) => {
    const msg = message.toLowerCase();

    const patterns = {
        'home': ['home', 'main page', 'feed', 'posts', 'adventures'],
        'friends': ['friend', 'connect', 'travelers', 'people', 'buddy'],
        'create': ['create', 'new post', 'share', 'upload', 'write post'],
        'profile': ['profile', 'my account', 'my posts', 'settings'],
        'ocr': ['verify', 'verification', 'nid', 'license', 'id card', 'identity'],
        'login': ['login', 'sign in', 'log in'],
        'register': ['register', 'sign up', 'create account', 'join'],
    };

    for (const [page, keywords] of Object.entries(patterns)) {
        if (keywords.some(k => msg.includes(k))) return page;
    }

    if (msg.includes('go to') || msg.includes('take me') || msg.includes('navigate') || msg.includes('show me') || msg.includes('where is')) {
        for (const [page, info] of Object.entries(PLATFORM_PAGES)) {
            if (msg.includes(page) || msg.includes(info.name.toLowerCase())) return page;
        }
    }

    return null;
};

// Main AI Response Function
export const getAIResponse = async (userMessage, userContext = {}, conversationHistory = []) => {
    if (!GEMINI_API_KEY || !genAI) {
        console.warn('⚠️ Gemini API key not set. Using fallback responses.');
        return getFallbackResponse(userMessage, userContext);
    }

    try {
        const recentHistory = conversationHistory.slice(-6);
        const conversationText = recentHistory
            .map(msg => `${msg.isUser ? 'User' : 'Trippy 2.0'}: ${msg.text}`)
            .join('\n');

        const systemPrompt = buildSystemPrompt(userContext);

        const fullPrompt = `${systemPrompt}

${conversationText ? `CONVERSATION HISTORY:\n${conversationText}\n\n` : ''}User: ${userMessage}

Remember: Be personalized, offer navigation help, keep conversation context, be engaging, and AVOID EMOJIS.`;

        const result = await generateWithFallback((model) =>
            model.generateContent({
                contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                },
            })
        );

        const response = await result.response;
        const aiMessage = response.text();

        if (!aiMessage) throw new Error('Empty response from Gemini');
        return aiMessage;

    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        return getFallbackResponse(userMessage, userContext);
    }
};

// Fallback responses when API is unavailable
const getFallbackResponse = (userMessage, userContext = {}) => {
    const msg = userMessage.toLowerCase();
    const user = userContext?.user;
    const name = user?.name ? user.name.split(' ')[0] : '';

    const navPage = detectNavigationIntent(msg);
    if (navPage && PLATFORM_PAGES[navPage]) {
        const p = PLATFORM_PAGES[navPage];
        return `You can find **${p.name}** in the navigation menu at the top. Click on it to ${p.description.toLowerCase()}. Would you like to know more about the features available there?`;
    }

    if (msg.includes('beach') || msg.includes('ocean') || msg.includes('sea')) {
        return `Nothing beats a beach getaway. Popular destinations include Bali, Maldives, Phuket, and Cox's Bazar. ${name ? `${name}, what` : "What"} kind of experience are you looking for — relaxation or water sports?`;
    }

    if (msg.includes('mountain') || msg.includes('hill') || msg.includes('trek') || msg.includes('hike')) {
        return `The mountains offer incredible experiences. Consider exploring the Swiss Alps, Patagonia, Bandarban, or the Annapurna Circuit in Nepal. ${name ? `${name}, are` : "Are"} you interested in beginner-friendly trails or more challenging treks?`;
    }

    if (msg.includes('budget') || msg.includes('cheap') || msg.includes('save')) {
        return `For budget-friendly travel, consider traveling during the off-season, using local transport, exploring street food, and booking highly-rated hostels. Southeast Asia and South America are particularly great for budget travelers. Would you like more specific tips?`;
    }

    if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey') || msg.includes('yo')) {
        return `Hello${name ? ` ${name}` : ''}! I'm Trippy 2.0, your AI travel assistant. I can help you with destination ideas, travel tips, or navigating our platform. How can I assist you today?`;
    }

    if (msg.includes('help') || msg.includes('what can you')) {
        return `I can assist you with:\n- Destination recommendations\n- Platform navigation\n- Understanding features like Friends and Posts\n- Travel tips and professional advice\n\nWhat would you like to explore${name ? `, ${name}` : ''}?`;
    }

    if (msg.includes('thank')) {
        return `You're very welcome${name ? `, ${name}` : ''}! I'm happy to help. Is there anything else you'd like to discuss?`;
    }

    return `That's a great topic. I can help you discover amazing destinations, share professional travel tips, or guide you through the various features of the Trippy 2.0 platform. What are you most interested in${name ? `, ${name}` : ''}?`;
};

export { getFallbackResponse };
