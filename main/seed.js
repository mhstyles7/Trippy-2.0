// ============================================
// TRIPPY — Database Seed Script
// Run: node seed.js
// Seeds sample users, posts, comments, and friend connections
// ============================================

import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = "mongodb+srv://mehu:6cANiWlzxSqKOu9c@db1.1jlkhfx.mongodb.net/?appName=DB1";
const DB_NAME = "trippy";

async function seed() {
    const client = new MongoClient(MONGO_URI, {
        family: 4
    });

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB");

        const db = client.db(DB_NAME);

        // Drop existing collections to start fresh
        const collections = await db.listCollections().toArray();
        for (const col of collections) {
            await db.dropCollection(col.name);
        }
        console.log("🗑️  Cleared existing data");

        // ========== USERS ==========
        const usersCollection = db.collection("users");

        const users = [
            {
                name: "Trippy Traveler",
                email: "traveler@trippy.com",
                password: "123456",
                photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=traveler",
                role: "traveler",
                verifyOCR: true,
                friends: [],
                friendRequests: [],
                sentRequests: [],
            },
            {
                name: "Rental Provider",
                email: "provider@trippy.com",
                password: "123456",
                photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=provider",
                role: "carRentalUser",
                verifyOCR: false,
                friends: [],
                friendRequests: [],
                sentRequests: [],
            },
            {
                name: "Admin User",
                email: "admin@trippy.com",
                password: "123456",
                photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=admin",
                role: "traveler",
                verifyOCR: true,
                friends: [],
                friendRequests: [],
                sentRequests: [],
            },
            {
                name: "Sarah Explorer",
                email: "sarah@trippy.com",
                password: "123456",
                photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=sarah",
                role: "traveler",
                verifyOCR: true,
                friends: [],
                friendRequests: [],
                sentRequests: [],
            },
            {
                name: "Rafiq Ahmed",
                email: "rafiq@trippy.com",
                password: "123456",
                photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=rafiq",
                role: "traveler",
                verifyOCR: false,
                friends: [],
                friendRequests: [],
                sentRequests: [],
            },
            {
                name: "Nusrat Jahan",
                email: "nusrat@trippy.com",
                password: "123456",
                photoURL: "https://api.dicebear.com/7.x/adventurer/svg?seed=nusrat",
                role: "carRentalUser",
                verifyOCR: true,
                friends: [],
                friendRequests: [],
                sentRequests: [],
            },
        ];

        const insertedUsers = await usersCollection.insertMany(users);
        const uid = Object.values(insertedUsers.insertedIds);
        console.log(`✅ Seeded ${uid.length} users`);

        // ========== FRIEND CONNECTIONS ==========

        // Traveler ↔ Admin (already friends)
        await usersCollection.updateOne({ _id: uid[0] }, { $push: { friends: uid[2] } });
        await usersCollection.updateOne({ _id: uid[2] }, { $push: { friends: uid[0] } });
        console.log("   👫 Traveler ↔ Admin (friends)");

        // Traveler ↔ Sarah (already friends)
        await usersCollection.updateOne({ _id: uid[0] }, { $push: { friends: uid[3] } });
        await usersCollection.updateOne({ _id: uid[3] }, { $push: { friends: uid[0] } });
        console.log("   👫 Traveler ↔ Sarah (friends)");

        // Provider sent request TO Traveler (pending)
        await usersCollection.updateOne({ _id: uid[1] }, { $push: { sentRequests: uid[0] } });
        await usersCollection.updateOne({ _id: uid[0] }, { $push: { friendRequests: uid[1] } });
        console.log("   📩 Provider → Traveler (pending request)");

        // Rafiq sent request TO Traveler (pending)
        await usersCollection.updateOne({ _id: uid[4] }, { $push: { sentRequests: uid[0] } });
        await usersCollection.updateOne({ _id: uid[0] }, { $push: { friendRequests: uid[4] } });
        console.log("   📩 Rafiq → Traveler (pending request)");

        // Traveler sent request TO Nusrat (pending outgoing)
        await usersCollection.updateOne({ _id: uid[0] }, { $push: { sentRequests: uid[5] } });
        await usersCollection.updateOne({ _id: uid[5] }, { $push: { friendRequests: uid[0] } });
        console.log("   📩 Traveler → Nusrat (sent request)");

        console.log("✅ Friend connections created");

        // ========== POSTS ==========
        const postsCollection = db.collection("posts");

        const posts = [
            {
                post_id: new ObjectId().toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                title: "Sunset at Cox's Bazar 🌅",
                description: "Watched the most incredible sunset at the world's longest natural sea beach. The colors reflecting off the Bay of Bengal were absolutely breathtaking. Highly recommend visiting during winter for the best weather!",
                images: [],
                comments: [],
                createdAt: new Date(),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                title: "Trekking in Bandarban ⛰️",
                description: "Just completed a 3-day trek through the Bandarban hills. The views from Nilgiri and Boga Lake were surreal. If you love hiking, this is a must-visit destination. Pack light but bring warm layers for the night!",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 86400000),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[2].toString(),
                userName: "Admin User",
                userPhotoURL: users[2].photoURL,
                title: "Exploring the Sundarbans 🐯",
                description: "Spent 4 days on a boat tour through the Sundarbans mangrove forest. Spotted deer, crocodiles, and even fresh tiger paw prints! The biodiversity here is incredible. Book a guided tour for the safest experience.",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 172800000),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[2].toString(),
                userName: "Admin User",
                userPhotoURL: users[2].photoURL,
                title: "Tea Gardens of Sylhet 🍵",
                description: "Sylhet's rolling tea gardens are a photographer's dream. Visited Jaflong and the Ratargul Swamp Forest too. The lush green landscape stretching to the horizon is something you have to see in person.",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 259200000),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[1].toString(),
                userName: "Rental Provider",
                userPhotoURL: users[1].photoURL,
                title: "Road Trip Ready! 🚗",
                description: "Just added new SUVs to our fleet for the upcoming travel season. Perfect for hill station trips and group adventures. Contact us through the platform for special group rates!",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 345600000),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[3].toString(),
                userName: "Sarah Explorer",
                userPhotoURL: users[3].photoURL,
                title: "Saint Martin Island Adventure 🏝️",
                description: "Finally made it to Saint Martin's Island! The crystal-clear water and coral reefs are unlike anywhere else in Bangladesh. Snorkeling here was unforgettable. Pro tip: visit from November to March for calm seas.",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 432000000),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[4].toString(),
                userName: "Rafiq Ahmed",
                userPhotoURL: users[4].photoURL,
                title: "Old Dhaka Food Tour 🍛",
                description: "Spent a day exploring the culinary treasures of Old Dhaka. From the legendary biriyani at Haji Biriyani to fresh lassi at Shahbag, every bite was an adventure. Old Dhaka's street food is seriously underrated!",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 518400000),
            },
            {
                post_id: new ObjectId().toString(),
                userId: uid[5].toString(),
                userName: "Nusrat Jahan",
                userPhotoURL: users[5].photoURL,
                title: "Weekend in Rangamati 🛶",
                description: "Took a weekend trip to Rangamati and stayed on a houseboat at Kaptai Lake. The tribal villages and the hanging bridge are must-sees. Such a peaceful escape from city life!",
                images: [],
                comments: [],
                createdAt: new Date(Date.now() - 604800000),
            },
        ];

        const insertedPosts = await postsCollection.insertMany(posts);
        const postIds = Object.values(insertedPosts.insertedIds);
        // Update post_id to match _id for consistency
        for (let i = 0; i < postIds.length; i++) {
            await postsCollection.updateOne(
                { _id: postIds[i] },
                { $set: { post_id: postIds[i].toString() } }
            );
        }
        console.log(`✅ Seeded ${posts.length} posts`);

        // ========== COMMENTS ==========
        const commentsCollection = db.collection("comments");

        const comments = [
            // Comments on "Sunset at Cox's Bazar"
            {
                postId: postIds[0].toString(),
                userId: uid[2].toString(),
                userName: "Admin User",
                userPhotoURL: users[2].photoURL,
                text: "Absolutely stunning! I need to plan my next trip there ASAP 🌅",
                createdAt: new Date(Date.now() - 3600000),
            },
            {
                postId: postIds[0].toString(),
                userId: uid[3].toString(),
                userName: "Sarah Explorer",
                userPhotoURL: users[3].photoURL,
                text: "Cox's Bazar is magical during sunset. Great photos!",
                createdAt: new Date(Date.now() - 7200000),
            },
            {
                postId: postIds[0].toString(),
                userId: uid[4].toString(),
                userName: "Rafiq Ahmed",
                userPhotoURL: users[4].photoURL,
                text: "Did you try the seafood at the beach stalls? Best lobster I've ever had!",
                createdAt: new Date(Date.now() - 10800000),
            },

            // Comments on "Trekking in Bandarban"
            {
                postId: postIds[1].toString(),
                userId: uid[2].toString(),
                userName: "Admin User",
                userPhotoURL: users[2].photoURL,
                text: "Boga Lake is on my bucket list! How difficult is the trail?",
                createdAt: new Date(Date.now() - 50000000),
            },
            {
                postId: postIds[1].toString(),
                userId: uid[5].toString(),
                userName: "Nusrat Jahan",
                userPhotoURL: users[5].photoURL,
                text: "I did this trek last year - the night sky views are incredible! Zero light pollution.",
                createdAt: new Date(Date.now() - 60000000),
            },

            // Comments on "Sundarbans"
            {
                postId: postIds[2].toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                text: "Tiger paw prints? That's both terrifying and amazing! 🐯",
                createdAt: new Date(Date.now() - 100000000),
            },
            {
                postId: postIds[2].toString(),
                userId: uid[3].toString(),
                userName: "Sarah Explorer",
                userPhotoURL: users[3].photoURL,
                text: "Which tour company did you use? Would love recommendations.",
                createdAt: new Date(Date.now() - 120000000),
            },

            // Comments on "Tea Gardens of Sylhet"
            {
                postId: postIds[3].toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                text: "Ratargul is the most unique place in Bangladesh. Loved it!",
                createdAt: new Date(Date.now() - 200000000),
            },

            // Comments on "Road Trip Ready"
            {
                postId: postIds[4].toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                text: "What are the rates for a weekend SUV rental to Bandarban?",
                createdAt: new Date(Date.now() - 300000000),
            },
            {
                postId: postIds[4].toString(),
                userId: uid[3].toString(),
                userName: "Sarah Explorer",
                userPhotoURL: users[3].photoURL,
                text: "Great news! Planning a group trip soon, will definitely check your fleet 🚗",
                createdAt: new Date(Date.now() - 310000000),
            },

            // Comments on "Saint Martin Island"
            {
                postId: postIds[5].toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                text: "Saint Martin is a hidden gem! The corals are beautiful.",
                createdAt: new Date(Date.now() - 400000000),
            },
            {
                postId: postIds[5].toString(),
                userId: uid[4].toString(),
                userName: "Rafiq Ahmed",
                userPhotoURL: users[4].photoURL,
                text: "How many days do you recommend staying on the island?",
                createdAt: new Date(Date.now() - 410000000),
            },

            // Comments on "Old Dhaka Food Tour"
            {
                postId: postIds[6].toString(),
                userId: uid[2].toString(),
                userName: "Admin User",
                userPhotoURL: users[2].photoURL,
                text: "Haji Biriyani is legendary! Try the bakarkhani next time 🫓",
                createdAt: new Date(Date.now() - 500000000),
            },

            // Comments on "Weekend in Rangamati"
            {
                postId: postIds[7].toString(),
                userId: uid[0].toString(),
                userName: "Trippy Traveler",
                userPhotoURL: users[0].photoURL,
                text: "Houseboats at Kaptai Lake sound amazing! Adding to my list.",
                createdAt: new Date(Date.now() - 600000000),
            },
            {
                postId: postIds[7].toString(),
                userId: uid[2].toString(),
                userName: "Admin User",
                userPhotoURL: users[2].photoURL,
                text: "The hanging bridge is so scenic. Great for photos! 📸",
                createdAt: new Date(Date.now() - 610000000),
            },
        ];

        await commentsCollection.insertMany(comments);
        console.log(`✅ Seeded ${comments.length} comments across ${posts.length} posts`);

        // ========== MARKETPLACE DATA (PHASE 2) ==========

        // 1. Vehicles (For 'Rental Provider')
        const vehiclesCollection = db.collection("vehicles");
        const vehicles = [
            {
                providerId: uid[1].toString(), // Rental Provider
                name: "Toyota HiAce 2021",
                type: "Microbus",
                seats: 12,
                ac: true,
                pricePerDay: 5000,
                image: "https://images.unsplash.com/photo-1632245889029-e41314396b29?q=80&w=600&auto=format&fit=crop",
                status: "available",
                createdAt: new Date(),
            },
            {
                providerId: uid[1].toString(),
                name: "Noah Hybrid 2018",
                type: "Minivan",
                seats: 7,
                ac: true,
                pricePerDay: 4000,
                image: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Toyota_NOAH_Hybrid_Si_%28ZWR80W%29_front.jpg/640px-Toyota_NOAH_Hybrid_Si_%28ZWR80W%29_front.jpg",
                status: "available",
                createdAt: new Date(),
            },
            {
                providerId: uid[1].toString(),
                name: "Hyundai H-1",
                type: "Microbus",
                seats: 10,
                ac: true,
                pricePerDay: 5500,
                image: "https://upload.wikimedia.org/wikipedia/commons/2/25/2018_Hyundai_H-1_Elite_CRDi_2.5_Front.jpg",
                status: "booked", // Busy
                createdAt: new Date(),
            }
        ];
        const insertedVehicles = await vehiclesCollection.insertMany(vehicles);
        const vid = Object.values(insertedVehicles.insertedIds);
        console.log(`✅ Seeded ${vehicles.length} vehicles for Provider`);

        // 2. Trip Requests (From Travelers)
        const requestsCollection = db.collection("tripRequests");
        const requests = [
            {
                travelerId: uid[0].toString(), // Trippy Traveler
                destination: "Sylhet (Jaflong & Bichanakandi)",
                dates: "Nov 12 - Nov 15",
                groupSize: 10,
                vehicleType: "Microbus",
                budget: 15000,
                description: "Need a clean AC microbus for a family trip. Driver must be experienced on hill roads.",
                status: "open",
                createdAt: new Date(),
            },
            {
                travelerId: uid[3].toString(), // Sarah Explorer
                destination: "Cox's Bazar",
                dates: "Dec 20 - Dec 23",
                groupSize: 4,
                vehicleType: "Sedan/Noah",
                budget: 12000,
                description: "Looking for a comfortable ride for 4 friends. Music system is a must! 🎵",
                status: "open",
                createdAt: new Date(),
            }
        ];
        const insertedRequests = await requestsCollection.insertMany(requests);
        const rid = Object.values(insertedRequests.insertedIds);
        console.log(`✅ Seeded ${requests.length} trip requests`);

        // 3. Offers (Provider Bids on Traveler's Request)
        const offersCollection = db.collection("rentalOffers");
        const offers = [
            {
                requestId: rid[0].toString(), // Traveler's Sylhet trip
                providerId: uid[1].toString(), // Provider
                vehicleId: vid[0].toString(), // HiAce
                vehicleSnapshot: vehicles[0],
                price: 14500, // Detailed bid
                message: "Sir, I have a brand new 2021 HiAce. Very comfortable AC. Driver 'Rahim' has 10 years experience on Sylhet road. Price includes driver food/stay.",
                status: "pending",
                createdAt: new Date(),
            }
        ];
        await offersCollection.insertMany(offers);
        console.log(`✅ Seeded ${offers.length} rental offers`);

        // ========== DONE ==========
        console.log("\n🎉 Seeding complete! Login credentials:");
        console.log("   📧 traveler@trippy.com  / 123456  (Traveler, verified)");
        console.log("   📧 provider@trippy.com  / 123456  (Car Rental, unverified)");
        console.log("   📧 admin@trippy.com     / 123456  (Traveler, verified)");
        console.log("   📧 sarah@trippy.com     / 123456  (Traveler, verified)");
        console.log("   📧 rafiq@trippy.com     / 123456  (Traveler, unverified)");
        console.log("   📧 nusrat@trippy.com    / 123456  (Car Rental, verified)");
        console.log("\n📊 Data summary:");
        console.log(`   ${uid.length} users, ${posts.length} posts, ${comments.length} comments`);
        console.log("   2 friend connections, 2 pending requests, 1 sent request");

    } catch (error) {
        console.error("❌ Seeding error:", error);
    } finally {
        await client.close();
        console.log("🔌 Disconnected from MongoDB");
    }
}

seed();
