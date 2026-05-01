import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const client = new MongoClient(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000, family: 4 });

// Helper to make deterministic IDs
const ID = (hex) => new ObjectId(hex.padEnd(24, '0'));

// ── USER DATA ────────────────────────────────────────────────────────────────
const travelers = [
  { id: ID('a1'), name: 'Aryan Rahman',    email: 'aryan@trippy.com',    bio: 'Backpacker | 30+ countries 🌍', verified: true, docType: 'NID' },
  { id: ID('a2'), name: 'Sarah Chowdhury', email: 'sarah@trippy.com',    bio: 'Solo traveler | Foodie 🍜',      verified: true, docType: 'Passport' },
  { id: ID('a3'), name: 'Faiz Ahmed',      email: 'faiz@trippy.com',     bio: 'Weekend trekker ⛰️',             verified: true, docType: 'NID' },
  { id: ID('a4'), name: 'Nadia Islam',     email: 'nadia@trippy.com',    bio: 'Photography lover 📸',           verified: true, docType: 'NID' },
  { id: ID('a5'), name: 'Tanvir Hasan',    email: 'tanvir@trippy.com',   bio: 'Road trip addict 🛣️',            verified: false },
  { id: ID('a6'), name: 'Maliha Akter',    email: 'maliha@trippy.com',   bio: 'Cultural explorer 🎭',           verified: true, docType: 'Passport' },
  { id: ID('a7'), name: 'Rahat Khan',      email: 'rahat@trippy.com',    bio: 'Budget traveler 💰',             verified: false },
  { id: ID('a8'), name: 'Priya Das',       email: 'priya@trippy.com',    bio: 'Nature & wildlife 🦜',           verified: true, docType: 'NID' },
  { id: ID('a9'), name: 'Imran Siddiqui',  email: 'imran@trippy.com',    bio: 'History buff 🏛️',                verified: false },
  { id: ID('aa'), name: 'Fatima Begum',    email: 'fatima@trippy.com',   bio: 'Family travel expert 👨‍👩‍👧‍👦',        verified: true, docType: 'NID' },
];

const providers = [
  { id: ID('b1'), name: 'Karim Hossain',      email: 'karim@trippy.com',  bio: '🚗 Premium rentals — Dhaka & Sylhet', verified: true, docType: 'Driving License' },
  { id: ID('b2'), name: 'Jamil Rent-A-Car',   email: 'jamil@trippy.com',  bio: 'Luxury SUVs & sedans for rent',       verified: true, docType: 'Trade License' },
  { id: ID('b3'), name: 'Rahim Transport',    email: 'rahim@trippy.com',  bio: 'Long-distance travel specialist 🚐',  verified: true, docType: 'Driving License' },
  { id: ID('b4'), name: 'Dhaka Car Rentals',  email: 'dhakacar@trippy.com', bio: 'Trusted since 2015',                verified: true, docType: 'Trade License' },
  { id: ID('b5'), name: 'Safar Rides',        email: 'safar@trippy.com',  bio: 'Comfort meets affordability',         verified: false },
];

// ── POSTS DATA ───────────────────────────────────────────────────────────────
const postData = [
  { uid: 'a1', title: 'Lost in the Tea Gardens of Sylhet 🍃', desc: "Seven days in Sylhet's rolling tea estates. The mist at dawn is pure magic.", imgs: ['photo-1473773508845-188df298d2d1', 'photo-1518531933037-91b2f5f229cc'] },
  { uid: 'a1', title: "Cox's Bazar at Sunset 🌅", desc: '120km of coastline and the most beautiful sunset I have ever witnessed.', imgs: ['photo-1507525428034-b723cf961d3e', 'photo-1519046904884-53103b34b206'] },
  { uid: 'a1', title: 'Sundarbans: Into the Mangroves 🐯', desc: "The world's largest mangrove forest. Every shadow might be a Royal Bengal Tiger.", imgs: ['photo-1448375240586-882707db888b', 'photo-1441974231531-c6227db76b6e'] },
  { uid: 'a2', title: 'Old Dhaka Street Food Tour 🚲', desc: 'Found the best biryani hidden in a narrow alley. The chaos is the charm.', imgs: ['photo-1567337710282-00832b415979'] },
  { uid: 'a3', title: 'Trekking Keokradong ⛰️', desc: 'Exhausting hike but the panoramic view from the top made it all worth it.', imgs: ['photo-1464822759023-fed622ff2c3b'] },
  { uid: 'a4', title: 'Golden Hour at Jaflong 📸', desc: 'Crystal clear waters of the Piyain River with the Khasi Hills in the background.', imgs: ['photo-1501785888041-af3ef285b470'] },
  { uid: 'a6', title: 'The Buddhist Temples of Ramu 🛕', desc: 'A hidden cultural gem near Cox Bazar. Ancient temples surrounded by lush greenery.', imgs: ['photo-1548013146-72479768bada'] },
  { uid: 'a8', title: 'Bird Watching at Tanguar Haor 🦜', desc: 'Spotted over 20 species in one morning. The wetlands are a birder paradise.', imgs: ['photo-1470071459604-3b5ec3a7fe05'] },
  { uid: 'aa', title: 'Family Trip to Bandarban 🏔️', desc: 'Nilgiri hilltop with the kids. Cloud-level views and unforgettable memories.', imgs: ['photo-1542601906990-b4d3fb778b09'] },
  { uid: 'a5', title: 'Road Trip: Dhaka to Rangamati 🛣️', desc: '6 hours of winding hill roads and lakeside views. Pure driving bliss.', imgs: ['photo-1469854523086-cc02fe5d8800'] },
];

// ── VEHICLES DATA ────────────────────────────────────────────────────────────
const vehicleData = [
  { pid: 'b1', name: 'Toyota Noah 7-Seater', type: 'Microbus', seats: 7,  ac: true,  price: 4500, img: 'photo-1544636331-e26879cd4d9b' },
  { pid: 'b1', name: 'Toyota Hiace 11-Seat', type: 'Minivan', seats: 11, ac: true,  price: 7000, img: 'photo-1558618666-fcd25c85cd64' },
  { pid: 'b2', name: 'Toyota Land Cruiser',  type: 'SUV',      seats: 5,  ac: true,  price: 9000, img: 'photo-1549399542-7e3f8b79c341' },
  { pid: 'b2', name: 'Honda Civic Sedan',    type: 'Sedan',    seats: 4,  ac: true,  price: 3500, img: 'photo-1542282088-fe8426682b8f' },
  { pid: 'b3', name: 'Mitsubishi Pajero',    type: 'SUV',      seats: 7,  ac: true,  price: 6500, img: 'photo-1519641471654-76ce0107ad1b' },
  { pid: 'b4', name: 'Hyundai H1 Van',       type: 'Minivan',  seats: 9,  ac: true,  price: 5500, img: 'photo-1494976388531-d1058494cdd8' },
  { pid: 'b5', name: 'Suzuki APV',           type: 'Microbus', seats: 8,  ac: false, price: 3000, img: 'photo-1552519507-da3b142c6e3d' },
];

// ── TRIP REQUEST DATA ────────────────────────────────────────────────────────
const tripData = [
  { tid: 'a1', dest: 'Sylhet', dates: 'Jun 10–15', group: '4', budget: '15000', vtype: 'Microbus', desc: 'Tea gardens, Ratargul, Jaflong. Need AC.', status: 'open' },
  { tid: 'a1', dest: "Cox's Bazar", dates: 'Apr 20–24', group: '6', budget: '25000', vtype: 'Minivan', desc: 'Beach trip with family.', status: 'booked' },
  { tid: 'a2', dest: 'Sajek Valley', dates: 'May 15–18', group: '2', budget: '10000', vtype: 'Sedan', desc: 'Khagrachari to Sajek round trip.', status: 'open' },
  { tid: 'a4', dest: 'Bandarban', dates: 'Jul 1–5', group: '3', budget: '18000', vtype: 'SUV', desc: 'Nilgiri, Nafakhum waterfall trek.', status: 'open' },
  { tid: 'a6', dest: 'Rangamati', dates: 'Aug 10–13', group: '5', budget: '20000', vtype: 'Microbus', desc: 'Lake cruise + Shuvolong falls.', status: 'open' },
  { tid: 'aa', dest: 'Sundarbans', dates: 'Sep 5–8', group: '8', budget: '35000', vtype: 'Minivan', desc: 'Family boat tour of the Sundarbans.', status: 'open' },
];

const UNSPLASH = (id) => `https://images.unsplash.com/${id}?w=800&q=80`;
const AVATAR = (seed) => `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;

async function seed() {
  try {
    await client.connect();
    const db = client.db('trippy');
    console.log('✅ Connected\n');

    // Drop all
    for (const c of ['users','posts','comments','vehicles','tripRequests','rentalOffers','ratings','notifications','tripChat','verifications']) {
      try { await db.collection(c).drop(); } catch {}
    }
    console.log('🗑️  Cleared\n');

    // ── USERS ──
    const allUsers = [
      ...travelers.map(t => ({
        _id: t.id, name: t.name, email: t.email, password: 'test1234', role: 'traveler',
        photoURL: AVATAR(t.name.split(' ')[0].toLowerCase()), bio: t.bio,
        verifyOCR: t.verified, verifiedDocType: t.docType || null,
        friends: [], friendRequests: [], sentRequests: [], createdAt: new Date('2025-01-15'),
      })),
      ...providers.map(p => ({
        _id: p.id, name: p.name, email: p.email, password: 'test1234', role: 'carRentalUser',
        photoURL: AVATAR(p.name.split(' ')[0].toLowerCase()), bio: p.bio,
        verifyOCR: p.verified, verifiedDocType: p.docType || null,
        friends: [], friendRequests: [], sentRequests: [], createdAt: new Date('2025-02-01'),
      })),
    ];
    // Wire some friendships
    allUsers[0].friends = [ID('b1'), ID('a2')];
    allUsers[1].friends = [ID('a1')];
    allUsers.find(u => u._id.equals(ID('b1'))).friends = [ID('a1')];

    await db.collection('users').insertMany(allUsers);
    console.log(`👤 Seeded ${allUsers.length} users`);

    // ── POSTS ──
    const posts = postData.map((p, i) => {
      const user = allUsers.find(u => u._id.equals(ID(p.uid)));
      return {
        _id: new ObjectId(), post_id: new ObjectId().toString(),
        userId: user._id.toString(), userName: user.name, userPhotoURL: user.photoURL, userVerified: user.verifyOCR,
        title: p.title, description: p.desc,
        images: p.imgs.map(id => UNSPLASH(id)),
        comments: [], createdAt: new Date(Date.now() - (postData.length - i) * 86400000),
      };
    });
    await db.collection('posts').insertMany(posts);
    console.log(`📝 Seeded ${posts.length} posts`);

    // ── COMMENTS ──
    const comments = [
      { postIdx: 0, uid: 'b1', text: 'Sylhet is magical! I drive tourists there all the time 🌿' },
      { postIdx: 0, uid: 'a2', text: 'Adding this to my bucket list!' },
      { postIdx: 1, uid: 'b1', text: 'I can arrange a ride to Cox\'s Bazar anytime 🚗' },
      { postIdx: 3, uid: 'a1', text: 'Old Dhaka biryani is unbeatable!' },
      { postIdx: 4, uid: 'a4', text: 'I want to do this trek next month!' },
      { postIdx: 5, uid: 'a2', text: 'Your photos are absolutely stunning 📸' },
      { postIdx: 8, uid: 'a6', text: 'Bandarban with kids is such a great idea!' },
      { postIdx: 9, uid: 'b3', text: 'I do this route regularly, gorgeous drive!' },
    ].map(c => {
      const user = allUsers.find(u => u._id.equals(ID(c.uid)));
      return {
        postId: posts[c.postIdx]._id.toString(), userId: user._id.toString(),
        userName: user.name, userPhotoURL: user.photoURL, text: c.text,
        createdAt: new Date(posts[c.postIdx].createdAt.getTime() + 3600000),
      };
    });
    await db.collection('comments').insertMany(comments);
    console.log(`💬 Seeded ${comments.length} comments`);

    // ── VEHICLES ──
    const vehicles = vehicleData.map((v, i) => ({
      _id: ID(`c${i+1}`), providerId: ID(v.pid).toString(),
      name: v.name, type: v.type, seats: v.seats, ac: v.ac,
      pricePerDay: v.price, image: UNSPLASH(v.img), status: 'available',
      createdAt: new Date('2025-02-10'),
    }));
    await db.collection('vehicles').insertMany(vehicles);
    console.log(`🚗 Seeded ${vehicles.length} vehicles`);

    // ── TRIP REQUESTS ──
    const tripReqs = tripData.map((t, i) => ({
      _id: ID(`d${i+1}`), travelerId: ID(t.tid).toString(),
      destination: t.dest, dates: t.dates, groupSize: t.group, budget: t.budget,
      vehicleType: t.vtype, description: t.desc, status: t.status,
      createdAt: new Date(Date.now() - (tripData.length - i) * 86400000),
    }));
    // Mark the booked one
    tripReqs[1].bookedOfferId = ID('e2').toString();
    await db.collection('tripRequests').insertMany(tripReqs);
    console.log(`🗺️  Seeded ${tripReqs.length} trip requests`);

    // ── OFFERS ──
    const offers = [
      { id: ID('e1'), reqIdx: 0, pid: 'b1', vid: 0, price: 13500, msg: 'Full AC, experienced driver. I know all tea estate routes!', status: 'pending' },
      { id: ID('e2'), reqIdx: 1, pid: 'b1', vid: 1, price: 22000, msg: 'Hiace 11-seater, done this route 50+ times.', status: 'accepted' },
      { id: ID('e3'), reqIdx: 2, pid: 'b2', vid: 3, price: 8500, msg: 'Honda Civic, comfortable ride for 2.', status: 'pending' },
      { id: ID('e4'), reqIdx: 3, pid: 'b3', vid: 4, price: 16000, msg: 'Pajero SUV perfect for hill roads.', status: 'pending' },
      { id: ID('e5'), reqIdx: 4, pid: 'b4', vid: 5, price: 18000, msg: 'H1 Van with experienced hill-road driver.', status: 'pending' },
    ].map(o => {
      const prov = allUsers.find(u => u._id.equals(ID(o.pid)));
      return {
        _id: o.id, requestId: tripReqs[o.reqIdx]._id.toString(),
        providerId: prov._id.toString(), vehicleId: vehicles[o.vid]._id.toString(),
        vehicleSnapshot: vehicles[o.vid], price: o.price, message: o.msg, status: o.status,
        providerName: prov.name, providerPhoto: prov.photoURL, providerVerified: prov.verifyOCR,
        createdAt: new Date(),
      };
    });
    await db.collection('rentalOffers').insertMany(offers);
    console.log(`💰 Seeded ${offers.length} offers`);

    // ── CHAT on booked trip ──
    const chat = [
      { sid: 'a1', name: 'Aryan Rahman',   text: "Hey! Super excited for Cox's Bazar. What time for pickup?" },
      { sid: 'b1', name: 'Karim Hossain',  text: "Assalamu Alaikum! 6 AM sharp. I'll be 10 min early 🚗" },
      { sid: 'a1', name: 'Aryan Rahman',   text: "Can we stop at Padma Bridge viewing point?" },
      { sid: 'b1', name: 'Karim Hossain',  text: "Of course! Great photo spot. See you on the 20th! 🌉" },
    ].map((m, i) => ({
      requestId: tripReqs[1]._id.toString(),
      senderId: ID(m.sid).toString(), senderName: m.name, text: m.text,
      createdAt: new Date(Date.now() - (4 - i) * 300000),
    }));
    await db.collection('tripChat').insertMany(chat);
    console.log(`💬 Seeded ${chat.length} chat messages`);

    // ── RATINGS ──
    await db.collection('ratings').insertOne({
      travelerId: ID('a1').toString(), providerId: ID('b1').toString(),
      requestId: tripReqs[1]._id.toString(), rating: 5,
      review: 'Karim bhai is the best! Punctual, professional, spotless vehicle. 🌟',
      createdAt: new Date(),
    });
    console.log('⭐ Seeded 1 rating');

    // ── NOTIFICATIONS ──
    const notifs = [
      { to: 'a1', type: 'new_offer', msg: 'Karim Hossain sent you an offer for ৳13,500 on Sylhet trip', read: false },
      { to: 'a1', type: 'friend_accepted', msg: 'Sarah Chowdhury accepted your friend request', read: true },
      { to: 'b1', type: 'offer_accepted', msg: "🎉 Aryan accepted your offer! Cox's Bazar confirmed.", read: true },
      { to: 'a2', type: 'new_offer', msg: 'Jamil Rent-A-Car sent you an offer for ৳8,500 on Sajek trip', read: false },
      { to: 'a4', type: 'new_offer', msg: 'Rahim Transport sent you an offer for ৳16,000 on Bandarban trip', read: false },
      { to: 'a6', type: 'new_offer', msg: 'Dhaka Car Rentals sent you an offer for ৳18,000 on Rangamati trip', read: false },
    ].map(n => ({
      recipientId: ID(n.to).toString(), type: n.type, message: n.msg,
      meta: {}, read: n.read, createdAt: new Date(),
    }));
    await db.collection('notifications').insertMany(notifs);
    console.log(`🔔 Seeded ${notifs.length} notifications`);

    // ── SUMMARY ──
    console.log('\n══════════════════════════════════════════════');
    console.log('✅ SEED COMPLETE — All passwords: test1234\n');
    console.log('TRAVELERS (10):');
    travelers.forEach(t => console.log(`  📧 ${t.email}`));
    console.log('\nPROVIDERS (5):');
    providers.forEach(p => console.log(`  📧 ${p.email}`));
    console.log('══════════════════════════════════════════════\n');

  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    await client.close();
  }
}

seed();
