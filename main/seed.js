/**
 * Trippy 2.0 — Database Seeder
 * Run: node seed.js
 *
 * Seeds:
 *   users         — 1 traveler + 1 car rental provider (with full OCR verification)
 *   posts         — 3 travel posts by the traveler
 *   comments      — 2 comments on each post
 *   vehicles      — 2 vehicles owned by the provider
 *   tripRequests  — 1 open trip request + 1 booked trip request
 *   rentalOffers  — 1 pending offer + 1 accepted offer (tied to the booked request)
 *   tripChat      — a few pre-seeded chat messages on the booked trip
 *   ratings       — 1 completed rating on the booked trip
 *   notifications — sample notifications for both users
 */

import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000, family: 4 });

// ── Deterministic IDs so references work ─────────────────────────────────────
const TRAVELER_ID   = new ObjectId('aaaaaaaaaaaaaaaaaaaaaaaa');
const PROVIDER_ID   = new ObjectId('bbbbbbbbbbbbbbbbbbbbbbbb');
const POST_1_ID     = new ObjectId('cccccccccccccccccccccccc');
const POST_2_ID     = new ObjectId('dddddddddddddddddddddddd');
const POST_3_ID     = new ObjectId('eeeeeeeeeeeeeeeeeeeeeeee');
const VEHICLE_1_ID  = new ObjectId('ffffffffffffffffffffffff');
const VEHICLE_2_ID  = new ObjectId('111111111111111111111111');
const OPEN_REQ_ID   = new ObjectId('222222222222222222222222');
const BOOKED_REQ_ID = new ObjectId('333333333333333333333333');
const OFFER_1_ID    = new ObjectId('444444444444444444444444'); // pending on open request
const OFFER_2_ID    = new ObjectId('555555555555555555555555'); // accepted on booked request
const RATING_ID     = new ObjectId('666666666666666666666666');

// Additional IDs
const TRAVELER_2_ID = new ObjectId('777777777777777777777777');
const TRAVELER_3_ID = new ObjectId('888888888888888888888888');
const PROVIDER_2_ID = new ObjectId('999999999999999999999999');
const POST_4_ID     = new ObjectId('aaaaaaaaaaaaaaaaaaaaaaab');
const POST_5_ID     = new ObjectId('bbbbbbbbbbbbbbbbbbbbbbbc');
const OPEN_REQ_2_ID = new ObjectId('cccccccccccccccccccccccd');

async function seed() {
    try {
        await client.connect();
        const db = client.db('trippy');
        console.log('✅ Connected to MongoDB — starting seed...\n');

        // ── Drop existing data ──────────────────────────────────────────────
        const collections = [
            'users', 'posts', 'comments', 'vehicles',
            'tripRequests', 'rentalOffers', 'ratings',
            'notifications', 'tripChat', 'verifications'
        ];
        for (const col of collections) {
            try { await db.collection(col).drop(); } catch { /* doesn't exist yet */ }
        }
        console.log('🗑️  Cleared existing collections\n');

        // ── USERS ──────────────────────────────────────────────────────────
        const users = [
            {
                _id: TRAVELER_ID,
                name: 'Aryan Rahman',
                email: 'traveler@trippy.com',
                password: 'test1234',          // plain text — matches server login logic
                role: 'traveler',
                photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=aryan',
                bio: 'Backpacker | Photography lover | 30+ countries visited 🌍',
                verifyOCR: true,
                verifiedDocType: 'NID',
                verifiedIdNumber: 'NID-1234567890',
                friends: [PROVIDER_ID],
                friendRequests: [],
                sentRequests: [],
                createdAt: new Date('2025-01-15'),
            },
            {
                _id: PROVIDER_ID,
                name: 'Md. Karim Hossain',
                email: 'provider@trippy.com',
                password: 'test1234',
                role: 'carRentalUser',
                photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim',
                bio: '🚗 Premium vehicle rental service — Dhaka & Sylhet | 10+ years exp',
                verifyOCR: true,
                verifiedDocType: 'Driving License',
                verifiedIdNumber: 'DL-9876543210',
                friends: [TRAVELER_ID],
                friendRequests: [],
                sentRequests: [],
                createdAt: new Date('2025-02-01'),
            },
            {
                _id: TRAVELER_2_ID,
                name: 'Sarah Rahman',
                email: 'sarah@trippy.com',
                password: 'test1234',
                role: 'traveler',
                photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah',
                bio: 'Solo traveler | Foodie | Exploring BD',
                verifyOCR: true,
                verifiedDocType: 'Passport',
                verifiedIdNumber: 'P-11223344',
                friends: [],
                friendRequests: [TRAVELER_ID],
                sentRequests: [],
                createdAt: new Date('2025-01-20'),
            },
            {
                _id: TRAVELER_3_ID,
                name: 'Faiz Ahmed',
                email: 'faiz@trippy.com',
                password: 'test1234',
                role: 'traveler',
                photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=faiz',
                bio: 'Weekend explorer | Trekking enthusiast',
                verifyOCR: false,
                friends: [],
                friendRequests: [],
                sentRequests: [TRAVELER_ID],
                createdAt: new Date('2025-03-05'),
            },
            {
                _id: PROVIDER_2_ID,
                name: 'Jamil Rent-A-Car',
                email: 'jamil@trippy.com',
                password: 'test1234',
                role: 'carRentalUser',
                photoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=jamil',
                bio: 'Luxury SUVs and sedans for rent. Safe and reliable.',
                verifyOCR: true,
                verifiedDocType: 'Trade License',
                verifiedIdNumber: 'TL-55667788',
                friends: [],
                friendRequests: [],
                sentRequests: [],
                createdAt: new Date('2025-04-10'),
            }
        ];
        await db.collection('users').insertMany(users);
        console.log('👤 Seeded 5 users:');
        console.log('   📧 traveler@trippy.com  | password: test1234  | Role: Traveler');
        console.log('   📧 provider@trippy.com  | password: test1234  | Role: Car Rental Provider');
        console.log('   📧 sarah@trippy.com     | password: test1234  | Role: Traveler');
        console.log('   📧 faiz@trippy.com      | password: test1234  | Role: Traveler');
        console.log('   📧 jamil@trippy.com     | password: test1234  | Role: Car Rental Provider\n');

        // ── VERIFICATIONS ──────────────────────────────────────────────────
        await db.collection('verifications').insertMany([
            {
                userId: TRAVELER_ID.toString(),
                documentType: 'NID',
                idNumber: 'NID-1234567890',
                holderName: 'Aryan Rahman',
                verifiedAt: new Date('2025-01-20'),
            },
            {
                userId: PROVIDER_ID.toString(),
                documentType: 'Driving License',
                idNumber: 'DL-9876543210',
                holderName: 'Md. Karim Hossain',
                verifiedAt: new Date('2025-02-05'),
            }
        ]);

        // ── POSTS ──────────────────────────────────────────────────────────
        const posts = [
            {
                _id: POST_1_ID,
                post_id: POST_1_ID.toString(),
                userId: TRAVELER_ID.toString(),
                userName: 'Aryan Rahman',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=aryan',
                userVerified: true,
                title: 'Lost in the Tea Gardens of Sylhet 🍃',
                description: 'Seven days, zero plans, and a rucksack full of instant noodles. Sylhet\'s rolling tea estates at dawn are the most peaceful thing I\'ve ever witnessed. The mist clings to the rows of bushes like a whisper. Absolutely breathtaking.',
                images: [
                    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800',
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
                ],
                comments: [],
                createdAt: new Date('2025-03-10'),
            },
            {
                _id: POST_2_ID,
                post_id: POST_2_ID.toString(),
                userId: TRAVELER_ID.toString(),
                userName: 'Aryan Rahman',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=aryan',
                userVerified: true,
                title: 'Cox\'s Bazar at Sunset — The World\'s Longest Beach 🌅',
                description: 'Nothing prepares you for the scale of Cox\'s Bazar. 120km of uninterrupted coastline, the sun dropping into the Bay of Bengal, and the sound of waves that feel like they\'ve traveled all the way from the Indian Ocean just to greet you.',
                images: [
                    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
                    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800',
                ],
                comments: [],
                createdAt: new Date('2025-04-02'),
            },
            {
                _id: POST_3_ID,
                post_id: POST_3_ID.toString(),
                userId: TRAVELER_ID.toString(),
                userName: 'Aryan Rahman',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=aryan',
                userVerified: true,
                title: 'Sundarbans: Into the Heart of the Mangroves 🐯',
                description: "You don't visit the Sundarbans — you enter it. The world's largest mangrove forest is alive in a way that's difficult to articulate. Every ripple in the water could be a dolphin or a ghost. Every shadow in the trees might be a Royal Bengal Tiger. I loved every terrifying second.",
                images: [
                    'https://images.unsplash.com/photo-1576443183726-8e7cce8d9e28?w=800',
                ],
                comments: [],
                createdAt: new Date('2025-04-20'),
            },
            {
                _id: POST_4_ID,
                post_id: POST_4_ID.toString(),
                userId: TRAVELER_2_ID.toString(),
                userName: 'Sarah Rahman',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=sarah',
                userVerified: true,
                title: 'Strolling through old Dhaka 🚲',
                description: "The food, the chaos, the rickshaws. Old Dhaka is an experience like no other. Found this amazing biryani place hidden in a narrow alley.",
                images: [
                    'https://images.unsplash.com/photo-1627850818228-56eb00921a8a?w=800',
                ],
                comments: [],
                createdAt: new Date('2025-04-25'),
            },
            {
                _id: POST_5_ID,
                post_id: POST_5_ID.toString(),
                userId: TRAVELER_3_ID.toString(),
                userName: 'Faiz Ahmed',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=faiz',
                userVerified: false,
                title: 'Trekking Keokradong ⛰️',
                description: "Made it to the top! The hike was exhausting but the view from Keokradong is absolutely worth every drop of sweat.",
                images: [
                    'https://images.unsplash.com/photo-1542385311-fb31e9c5220c?w=800',
                ],
                comments: [],
                createdAt: new Date('2025-04-28'),
            }
        ];
        await db.collection('posts').insertMany(posts);
        console.log(`📝 Seeded ${posts.length} travel posts\n`);

        // ── COMMENTS ──────────────────────────────────────────────────────
        const comments = [
            {
                postId: POST_1_ID.toString(),
                userId: PROVIDER_ID.toString(),
                userName: 'Md. Karim Hossain',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim',
                text: 'Sylhet is magical! I drive tourists there all the time. The Lawachara rainforest is also unmissable if you\'re in the area. 🌿',
                createdAt: new Date('2025-03-11'),
            },
            {
                postId: POST_1_ID.toString(),
                userId: TRAVELER_ID.toString(),
                userName: 'Aryan Rahman',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=aryan',
                text: 'Thank you! Yes Lawachara was incredible — saw some hoolock gibbons! 🐒',
                createdAt: new Date('2025-03-11'),
            },
            {
                postId: POST_2_ID.toString(),
                userId: PROVIDER_ID.toString(),
                userName: 'Md. Karim Hossain',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim',
                text: 'I can arrange a comfortable ride to Cox\'s Bazar! DM me for rates 🚗',
                createdAt: new Date('2025-04-03'),
            },
            {
                postId: POST_3_ID.toString(),
                userId: PROVIDER_ID.toString(),
                userName: 'Md. Karim Hossain',
                userPhotoURL: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim',
                text: 'The Sundarbans tour is on my bucket list. Did you take a guided boat tour?',
                createdAt: new Date('2025-04-21'),
            },
        ];
        await db.collection('comments').insertMany(comments);
        console.log(`💬 Seeded ${comments.length} comments\n`);

        // ── VEHICLES ──────────────────────────────────────────────────────
        const vehicles = [
            {
                _id: VEHICLE_1_ID,
                providerId: PROVIDER_ID.toString(),
                name: 'Toyota Noah (7-Seater)',
                type: 'Microbus',
                seats: 7,
                ac: true,
                pricePerDay: 4500,
                image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600',
                status: 'available',
                createdAt: new Date('2025-02-10'),
            },
            {
                _id: VEHICLE_2_ID,
                providerId: PROVIDER_ID.toString(),
                name: 'Toyota Hiace (11-Seater)',
                type: 'Minivan',
                seats: 11,
                ac: true,
                pricePerDay: 7000,
                image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
                status: 'available',
                createdAt: new Date('2025-02-15'),
            }
        ];
        await db.collection('vehicles').insertMany(vehicles);
        console.log(`🚗 Seeded ${vehicles.length} vehicles for provider\n`);

        // ── TRIP REQUESTS ──────────────────────────────────────────────────
        const tripRequests = [
            {
                _id: OPEN_REQ_ID,
                travelerId: TRAVELER_ID.toString(),
                destination: 'Sylhet',
                dates: 'Jun 10–15',
                groupSize: '4',
                budget: '15000',
                vehicleType: 'Microbus',
                description: 'Tea garden tour, Ratargul swamp forest, Jaflong. Need AC vehicle.',
                itinerary: '• Day 1: Arrive Sylhet, check-in, local market\n• Day 2: Tea estates tour (Malnicherra, Lakkatura)\n• Day 3: Ratargul Swamp Forest boat ride\n• Day 4: Jaflong, Bichanakandi\n• Day 5: Shrine of Shah Jalal, return journey',
                status: 'open',
                createdAt: new Date('2025-05-01'),
            },
            {
                _id: BOOKED_REQ_ID,
                travelerId: TRAVELER_ID.toString(),
                destination: "Cox's Bazar",
                dates: 'Apr 20–24',
                groupSize: '6',
                budget: '25000',
                vehicleType: 'Minivan',
                description: 'Beach trip, Himchari, Saint Martin island ferry. Family group.',
                itinerary: '• Day 1: Departure from Dhaka, check-in\n• Day 2: Laboni Beach, Himchari waterfall\n• Day 3: Inani Beach sunrise, Ramu Buddhist temples\n• Day 4: Sunset at Kolatoli, seafood dinner\n• Day 5: Return journey',
                status: 'booked',
                bookedOfferId: OFFER_2_ID.toString(),
                createdAt: new Date('2025-04-05'),
            },
            {
                _id: OPEN_REQ_2_ID,
                travelerId: TRAVELER_2_ID.toString(),
                destination: 'Sajek Valley',
                dates: 'May 15–18',
                groupSize: '2',
                budget: '10000',
                vehicleType: 'Sedan',
                description: 'Looking for a reliable car from Khagrachari to Sajek and back.',
                itinerary: '• Day 1: Arrive Khagrachari, head to Sajek\n• Day 2: Explore Sajek\n• Day 3: Return',
                status: 'open',
                createdAt: new Date('2025-05-02'),
            }
        ];
        await db.collection('tripRequests').insertMany(tripRequests);
        console.log(`🗺️  Seeded ${tripRequests.length} trip requests (1 open, 1 booked)\n`);

        // ── RENTAL OFFERS ──────────────────────────────────────────────────
        const rentalOffers = [
            {
                _id: OFFER_1_ID,
                requestId: OPEN_REQ_ID.toString(),
                providerId: PROVIDER_ID.toString(),
                vehicleId: VEHICLE_1_ID.toString(),
                vehicleSnapshot: vehicles[0],
                price: 13500,
                message: 'Toyota Noah, full AC, experienced driver. I know all the tea estate routes. Can add a local guide at no extra cost!',
                status: 'pending',
                providerName: 'Md. Karim Hossain',
                providerPhoto: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim',
                providerVerified: true,
                createdAt: new Date('2025-05-02'),
            },
            {
                _id: OFFER_2_ID,
                requestId: BOOKED_REQ_ID.toString(),
                providerId: PROVIDER_ID.toString(),
                vehicleId: VEHICLE_2_ID.toString(),
                vehicleSnapshot: vehicles[1],
                price: 22000,
                message: 'Toyota Hiace, 11-seater, full AC. Perfect for your family group. I have done this route 50+ times. Safe and comfortable!',
                status: 'accepted',
                providerName: 'Md. Karim Hossain',
                providerPhoto: 'https://api.dicebear.com/7.x/adventurer/svg?seed=karim',
                providerVerified: true,
                createdAt: new Date('2025-04-06'),
            }
        ];
        await db.collection('rentalOffers').insertMany(rentalOffers);
        console.log(`💰 Seeded ${rentalOffers.length} rental offers (1 pending, 1 accepted)\n`);

        // ── TRIP CHAT ──────────────────────────────────────────────────────
        const chatMessages = [
            {
                requestId: BOOKED_REQ_ID.toString(),
                senderId: TRAVELER_ID.toString(),
                senderName: 'Aryan Rahman',
                text: "Hey Karim bhai! Super excited for the Cox's Bazar trip. What time should we be ready for pickup?",
                createdAt: new Date('2025-04-06T09:00:00'),
            },
            {
                requestId: BOOKED_REQ_ID.toString(),
                senderId: PROVIDER_ID.toString(),
                senderName: 'Md. Karim Hossain',
                text: 'Assalamu Alaikum! Plan is to depart at 6:00 AM sharp to avoid Dhaka morning traffic. I\'ll arrive 10 minutes early, don\'t worry. 🚗',
                createdAt: new Date('2025-04-06T09:15:00'),
            },
            {
                requestId: BOOKED_REQ_ID.toString(),
                senderId: TRAVELER_ID.toString(),
                senderName: 'Aryan Rahman',
                text: 'Perfect! We will all be ready by 5:50 AM. Can you also stop at Padma bridge viewing point on the way?',
                createdAt: new Date('2025-04-06T09:20:00'),
            },
            {
                requestId: BOOKED_REQ_ID.toString(),
                senderId: PROVIDER_ID.toString(),
                senderName: 'Md. Karim Hossain',
                text: 'Of course! I always stop there — great photo spot. The bridge looks amazing in the morning light. See you on the 20th! 🌉',
                createdAt: new Date('2025-04-06T09:25:00'),
            }
        ];
        await db.collection('tripChat').insertMany(chatMessages);
        console.log(`💬 Seeded ${chatMessages.length} trip chat messages on the booked trip\n`);

        // ── RATINGS ──────────────────────────────────────────────────────
        const ratings = [
            {
                _id: RATING_ID,
                travelerId: TRAVELER_ID.toString(),
                providerId: PROVIDER_ID.toString(),
                requestId: BOOKED_REQ_ID.toString(),
                rating: 5,
                review: "Karim bhai is absolutely the best! Punctual, professional, and the Hiace was spotless with AC at full blast. Stopped at all the spots we asked. Will definitely book again for our next trip! 🌟",
                createdAt: new Date('2025-04-25'),
            }
        ];
        await db.collection('ratings').insertMany(ratings);
        console.log(`⭐ Seeded ${ratings.length} rating (5-star)\n`);

        // ── NOTIFICATIONS ──────────────────────────────────────────────────
        const notifications = [
            // For traveler: got an offer on open Sylhet trip
            {
                recipientId: TRAVELER_ID.toString(),
                type: 'new_offer',
                message: 'Md. Karim Hossain sent you an offer for ৳13,500 on your trip to Sylhet',
                meta: { requestId: OPEN_REQ_ID.toString(), offerId: OFFER_1_ID.toString() },
                read: false,
                createdAt: new Date('2025-05-02T08:00:00'),
            },
            // For traveler: Karim accepted friend request (sample historical)
            {
                recipientId: TRAVELER_ID.toString(),
                type: 'friend_accepted',
                message: 'Md. Karim Hossain accepted your friend request',
                meta: { userId: PROVIDER_ID.toString() },
                read: true,
                createdAt: new Date('2025-02-10T10:00:00'),
            },
            // For provider: traveler accepted their offer on Cox's Bazar trip
            {
                recipientId: PROVIDER_ID.toString(),
                type: 'offer_accepted',
                message: "🎉 Aryan Rahman accepted your offer! Trip to Cox's Bazar is confirmed.",
                meta: { requestId: BOOKED_REQ_ID.toString() },
                read: true,
                createdAt: new Date('2025-04-07T14:00:00'),
            },
            // For provider: friend request from traveler
            {
                recipientId: PROVIDER_ID.toString(),
                type: 'friend_request',
                message: 'Aryan Rahman sent you a friend request',
                meta: { senderId: TRAVELER_ID.toString() },
                read: true,
                createdAt: new Date('2025-02-08T09:00:00'),
            }
        ];
        await db.collection('notifications').insertMany(notifications);
        console.log(`🔔 Seeded ${notifications.length} notifications\n`);

        // ── Summary ───────────────────────────────────────────────────────
        console.log('═══════════════════════════════════════════════════');
        console.log('✅  SEED COMPLETE! Login credentials:');
        console.log('');
        console.log('  🧳 TRAVELER');
        console.log('     Email:    traveler@trippy.com');
        console.log('     Password: test1234');
        console.log('     → Has 2 trip requests, 3 posts, 1 unread notification');
        console.log('');
        console.log('  🚗 CAR RENTAL PROVIDER');
        console.log('     Email:    provider@trippy.com');
        console.log('     Password: test1234');
        console.log('     → Has 2 vehicles, 2 offers, trip chat messages');
        console.log('');
        console.log('  MORE ACCOUNTS (All use password: test1234)');
        console.log('     - sarah@trippy.com (Traveler)');
        console.log('     - faiz@trippy.com (Traveler)');
        console.log('     - jamil@trippy.com (Provider)');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (err) {
        console.error('❌ Seed failed:', err);
    } finally {
        await client.close();
    }
}

seed();
