
import express from 'express';
import cors from 'cors';
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Large limit for base64 images

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    family: 4
});

let db, usersCollection, postsCollection, commentsCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('trippy');
        usersCollection = db.collection('users');
        postsCollection = db.collection('posts');
        commentsCollection = db.collection('comments');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
    }
}

connectDB();

// ==========================================
//  AUTH ROUTES
// ==========================================

// Login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await usersCollection.findOne({ email, password });
        if (user) {
            res.json(user);
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Signup
app.post('/signup', async (req, res) => {
    const newUser = req.body;
    try {
        const existingUser = await usersCollection.findOne({ email: newUser.email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        newUser.verifyOCR = newUser.verifyOCR || false;
        newUser.friends = newUser.friends || [];
        newUser.friendRequests = newUser.friendRequests || [];
        newUser.sentRequests = newUser.sentRequests || [];

        const result = await usersCollection.insertOne(newUser);
        newUser._id = result.insertedId;
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OCR — stores document data and marks user verified
app.post('/verify-ocr', async (req, res) => {
    const { userId, documentType, idNumber, holderName, frontImage, backImage, extractedText } = req.body;
    try {
        // Check if this ID number is already used by another user
        const existingVerification = await db.collection('verifications').findOne({ idNumber });
        if (existingVerification && existingVerification.userId !== userId) {
            return res.status(409).json({ message: 'This ID number is already registered to another account.' });
        }

        // Store verification data
        await db.collection('verifications').updateOne(
            { userId },
            {
                $set: {
                    userId,
                    documentType,
                    idNumber,
                    holderName,
                    frontImage,
                    backImage,
                    extractedText,
                    verifiedAt: new Date()
                }
            },
            { upsert: true }
        );

        // Update user's verification status
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { verifyOCR: true, verifiedDocType: documentType, verifiedIdNumber: idNumber } }
        );

        res.json({ message: 'User verified successfully' });
    } catch (error) {
        console.error('Verify OCR error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get User
app.get('/users/:id', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });
        if (user) res.json(user);
        else res.status(404).json({ message: 'User not found' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
//  POST ROUTES
// ==========================================

// Get all posts
app.get('/get-posts', async (req, res) => {
    try {
        const posts = await postsCollection.find({}).sort({ createdAt: -1 }).toArray();
        // Enrich posts with user verification status
        const enrichedPosts = await Promise.all(posts.map(async (post) => {
            if (post.userId) {
                try {
                    const author = await usersCollection.findOne({ _id: new ObjectId(post.userId) });
                    return { ...post, userVerified: author?.verifyOCR === true };
                } catch { return { ...post, userVerified: false }; }
            }
            return { ...post, userVerified: false };
        }));
        res.json(enrichedPosts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching posts' });
    }
});

// Get specific post by ID
app.get('/get-specific-post/:id', async (req, res) => {
    try {
        // Try ObjectId first, then fall back to post_id field
        let post;
        try {
            post = await postsCollection.findOne({ _id: new ObjectId(req.params.id) });
        } catch {
            post = await postsCollection.findOne({ post_id: req.params.id });
        }
        if (post) {
            res.json(post);
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post' });
    }
});

// Create a post
app.post('/create-post', async (req, res) => {
    const { userId, title, description, images } = req.body;
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        const newPost = {
            userId,
            userName: user ? user.name : 'Anonymous',
            userPhotoURL: user ? user.photoURL : '',
            title,
            description,
            images: images || [],
            comments: [],
            createdAt: new Date(),
        };
        const result = await postsCollection.insertOne(newPost);
        newPost._id = result.insertedId;
        // Also set post_id for linking
        await postsCollection.updateOne(
            { _id: result.insertedId },
            { $set: { post_id: result.insertedId.toString() } }
        );
        newPost.post_id = result.insertedId.toString();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: 'Error creating post' });
    }
});

// Delete a post
app.delete('/remove-post/:id', async (req, res) => {
    try {
        let result;
        try {
            result = await postsCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        } catch {
            result = await postsCollection.deleteOne({ post_id: req.params.id });
        }
        // Also delete associated comments
        await commentsCollection.deleteMany({ postId: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Post deleted' });
        } else {
            res.status(404).json({ message: 'Post not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting post' });
    }
});

// ==========================================
//  COMMENT ROUTES
// ==========================================

// Get comments for a post
app.get('/get-comments/:id', async (req, res) => {
    try {
        const comments = await commentsCollection
            .find({ postId: req.params.id })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// Add a comment to a post
app.post('/add-comment/:id', async (req, res) => {
    const { userId, text } = req.body;
    const postId = req.params.id;
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
        const newComment = {
            postId,
            userId,
            userName: user ? user.name : 'Anonymous',
            userPhotoURL: user ? user.photoURL : '',
            text,
            createdAt: new Date(),
        };
        await commentsCollection.insertOne(newComment);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Error adding comment' });
    }
});

// ==========================================
//  FRIEND ROUTES
// ==========================================

// Get friend suggestions (users who are NOT friends and have no pending requests)
app.get('/friend-suggestions/:userId', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.userId) });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Collect all IDs to exclude: self, friends, sent requests, received requests
        const excludeIds = [
            new ObjectId(req.params.userId),
            ...(user.friends || []).map(id => new ObjectId(id)),
            ...(user.sentRequests || []).map(id => new ObjectId(id)),
            ...(user.friendRequests || []).map(id => new ObjectId(id)),
        ];

        const suggestions = await usersCollection
            .find({ _id: { $nin: excludeIds } })
            .project({ password: 0 })
            .limit(20)
            .toArray();

        res.json(suggestions);
    } catch (error) {
        console.error('Friend suggestions error:', error);
        res.status(500).json({ message: 'Error fetching suggestions' });
    }
});

// Get received friend requests
app.get('/received-requests/:userId', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.userId) });
        if (!user || !user.friendRequests || user.friendRequests.length === 0) {
            return res.json([]);
        }
        const requesters = await usersCollection
            .find({ _id: { $in: user.friendRequests.map(id => new ObjectId(id)) } })
            .project({ password: 0 })
            .toArray();
        res.json(requesters);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching received requests' });
    }
});

// Get sent friend requests
app.get('/sent-requests/:userId', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.userId) });
        if (!user || !user.sentRequests || user.sentRequests.length === 0) {
            return res.json([]);
        }
        const sentTo = await usersCollection
            .find({ _id: { $in: user.sentRequests.map(id => new ObjectId(id)) } })
            .project({ password: 0 })
            .toArray();
        res.json(sentTo);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching sent requests' });
    }
});

// Get friends list
app.get('/friends/:userId', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.userId) });
        if (!user || !user.friends || user.friends.length === 0) {
            return res.json([]);
        }
        const friends = await usersCollection
            .find({ _id: { $in: user.friends.map(id => new ObjectId(id)) } })
            .project({ password: 0 })
            .toArray();
        res.json(friends);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching friends' });
    }
});

// Send friend request
app.post('/friend-request', async (req, res) => {
    const { senderId, receiverId } = req.body;
    try {
        // Add to sender's sentRequests
        await usersCollection.updateOne(
            { _id: new ObjectId(senderId) },
            { $addToSet: { sentRequests: new ObjectId(receiverId) } }
        );
        // Add to receiver's friendRequests
        await usersCollection.updateOne(
            { _id: new ObjectId(receiverId) },
            { $addToSet: { friendRequests: new ObjectId(senderId) } }
        );
        res.json({ message: 'Friend request sent' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending friend request' });
    }
});

// Accept friend request
app.post('/accept-request', async (req, res) => {
    const { userId, senderId } = req.body;
    try {
        // Add each other as friends
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            {
                $addToSet: { friends: new ObjectId(senderId) },
                $pull: { friendRequests: new ObjectId(senderId) }
            }
        );
        await usersCollection.updateOne(
            { _id: new ObjectId(senderId) },
            {
                $addToSet: { friends: new ObjectId(userId) },
                $pull: { sentRequests: new ObjectId(userId) }
            }
        );
        res.json({ message: 'Friend request accepted' });
    } catch (error) {
        res.status(500).json({ message: 'Error accepting request' });
    }
});

// Reject friend request
app.post('/reject-request', async (req, res) => {
    const { userId, requesterId } = req.body;
    try {
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { friendRequests: new ObjectId(requesterId) } }
        );
        await usersCollection.updateOne(
            { _id: new ObjectId(requesterId) },
            { $pull: { sentRequests: new ObjectId(userId) } }
        );
        res.json({ message: 'Friend request rejected' });
    } catch (error) {
        res.status(500).json({ message: 'Error rejecting request' });
    }
});

// Remove friend
app.post('/remove-friend', async (req, res) => {
    const { userId, friendId } = req.body;
    try {
        await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { friends: new ObjectId(friendId) } }
        );
        await usersCollection.updateOne(
            { _id: new ObjectId(friendId) },
            { $pull: { friends: new ObjectId(userId) } }
        );
        res.json({ message: 'Friend removed' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing friend' });
    }
});

// ==========================================
//  MARKETPLACE ROUTES (PHASE 2)
// ==========================================

// --- VEHICLE FLEET MANAGEMENT (For Providers) ---

// Get provider's vehicles
app.get('/vehicles/:userId', async (req, res) => {
    try {
        const vehicles = await db.collection('vehicles')
            .find({ providerId: req.params.userId })
            .toArray();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching vehicles' });
    }
});

// Add a vehicle
app.post('/vehicles', async (req, res) => {
    const vehicle = req.body;
    try {
        vehicle.createdAt = new Date();
        vehicle.status = 'available'; // available, maintenance, booked
        const result = await db.collection('vehicles').insertOne(vehicle);
        vehicle._id = result.insertedId;
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: 'Error adding vehicle' });
    }
});

// Delete vehicle
app.delete('/vehicles/:id', async (req, res) => {
    try {
        await db.collection('vehicles').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Vehicle deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting vehicle' });
    }
});

// --- TRIP REQUESTS (For Travelers) ---

// Create a trip request
app.post('/trip-requests', async (req, res) => {
    const request = req.body; // { travelerId, destination, dates, groupSize, budget, preferences }
    try {
        request.createdAt = new Date();
        request.status = 'open'; // open, booked, completed
        const result = await db.collection('tripRequests').insertOne(request);
        request._id = result.insertedId;
        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error creating request' });
    }
});

// Get all open requests (For Providers to browse Leads)
app.get('/trip-requests/open', async (req, res) => {
    try {
        const requests = await db.collection('tripRequests')
            .find({ status: 'open' })
            .sort({ createdAt: -1 })
            .toArray();

        // Enrich with traveler info
        const enhancedRequests = await Promise.all(requests.map(async (req) => {
            const traveler = await usersCollection.findOne({ _id: new ObjectId(req.travelerId) });
            return {
                ...req,
                travelerName: traveler?.name || 'Unknown',
                travelerPhoto: traveler?.photoURL,
                travelerVerified: traveler?.verifyOCR
            };
        }));

        res.json(enhancedRequests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests' });
    }
});

// Get my requests (For Traveler)
app.get('/trip-requests/my/:userId', async (req, res) => {
    try {
        const requests = await db.collection('tripRequests')
            .find({ travelerId: req.params.userId })
            .sort({ createdAt: -1 })
            .toArray();
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching your requests' });
    }
});

// --- RENTAL OFFERS (The Bidding System) ---

// Send an offer (Provider -> Traveler)
app.post('/rental-offers', async (req, res) => {
    const offer = req.body; // { requestId, providerId, vehicleId, price, message }
    try {
        offer.createdAt = new Date();
        offer.status = 'pending'; // pending, accepted, rejected

        // Get vehicle details to snapshot price/model
        const vehicle = await db.collection('vehicles').findOne({ _id: new ObjectId(offer.vehicleId) });
        offer.vehicleSnapshot = vehicle;

        const result = await db.collection('rentalOffers').insertOne(offer);
        offer._id = result.insertedId;
        res.status(201).json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Error sending offer' });
    }
});

// Get offers for a specific request (For Traveler)
app.get('/rental-offers/request/:requestId', async (req, res) => {
    try {
        const offers = await db.collection('rentalOffers')
            .find({ requestId: req.params.requestId })
            .sort({ price: 1 }) // Lowest price first
            .toArray();

        // Enrich with provider info
        const enhancedOffers = await Promise.all(offers.map(async (offer) => {
            const provider = await usersCollection.findOne({ _id: new ObjectId(offer.providerId) });
            return {
                ...offer,
                providerName: provider?.name || 'Unknown',
                providerPhoto: provider?.photoURL,
                providerVerified: provider?.verifyOCR
            };
        }));

        res.json(enhancedOffers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers' });
    }
});

// Accept/Reject Offer
app.post('/rental-offers/respond', async (req, res) => {
    const { offerId, status } = req.body; // status: 'accepted' or 'rejected'
    try {
        await db.collection('rentalOffers').updateOne(
            { _id: new ObjectId(offerId) },
            { $set: { status } }
        );

        // If accepted, close the trip request
        if (status === 'accepted') {
            const offer = await db.collection('rentalOffers').findOne({ _id: new ObjectId(offerId) });
            await db.collection('tripRequests').updateOne(
                { _id: new ObjectId(offer.requestId) },
                { $set: { status: 'booked', bookedOfferId: offerId } }
            );
        }

        res.json({ message: `Offer ${status}` });
    } catch (error) {
        res.status(500).json({ message: 'Error updating offer' });
    }
});

// ==========================================
//  START SERVER
// ==========================================

app.listen(port, () => {
    console.log(`🚀 Backend server running on http://localhost:${port}`);
});
