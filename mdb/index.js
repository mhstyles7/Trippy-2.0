import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import bcrypt from "bcrypt";
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "500mb" })); // Set the body parser limit
app.use(express.urlencoded({ limit: "500mb", extended: true }));

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@db1.1jlkhfx.mongodb.net/?retryWrites=true&w=majority&appName=DB1`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API ver

const client = new MongoClient(uri, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
});

async function run() {
	try {
		// Connect the client to the server	(optional starting in v4.7)
		// await client.connect();
		// Send a ping to confirm a successful connection
		const usersCollection = client.db("demoDB").collection("Users");
		const postsCollection = client.db("demoDB").collection("Posts");
		app.post("/login", async (req, res) => {
			const { email, password } = req.body;
			console.log(req.body);

			try {
				const existingUser = await usersCollection.findOne({ email });
				console.log(existingUser, "existingUser");
				if (existingUser) {
					const isPasswordMatch = await bcrypt.compare(
						password,
						existingUser.hashedPassword
					);
					if (isPasswordMatch) {
						res.send(existingUser);
					} else {
						res.status(400).json({ error: "Invalid password" });
					}
				} else {
					res.status(400).json({ error: "User not found" });
				}
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});
		app.get("/users", async (req, res) => {
			const { search } = req.query;  // Get the search query from the request
		
			try {
				let query = {};
		
				// If a search term is provided, search by name or email using a case-insensitive regex
				if (search) {
					query = {
						$or: [
							{ name: { $regex: search, $options: "i" } },  // Search by name (case-insensitive)
							{ email: { $regex: search, $options: "i" } }  // Search by email (case-insensitive)
						]
					};
				}
		
				// Fetch users based on the constructed query
				const cursor = usersCollection.find(query);
				const users = await cursor.toArray();
		
				// If no users are found, return an appropriate message
				if (users.length === 0) {
					return res.status(404).json({ message: "No users found" });
				}
		
				// Return the matched users
				res.status(200).json(users);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});
		app.post("/signup", async (req, res) => {
			const { email, password, name, photoURL, role } = req.body;
			console.log(req.body);

			try {
				const existingUser = await usersCollection.findOne({ email });
				if (existingUser) {
					return res
						.status(400)
						.json({ error: "User already exists" });
				}
				const saltRounds = 10; // Number of salt rounds for bcrypt
				const hashedPassword = await bcrypt.hash(password, saltRounds);

				await usersCollection.insertOne({
					email,
					hashedPassword,
					name,
					photoURL,
					role,
				});
				res.status(200).json({ success: "User added successfully" });
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.post("/create-post", async (req, res) => {
			const { userId, title, description, images } = req.body;
			try {
				await postsCollection.insertOne({
					userId,
					title,
					description,
					images,
					createdAt: new Date(),
				});
				res.status(200).json({ success: "Post created successfully" });
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.delete("/remove-post/:id", async (req, res) => {
			const { id } = req.params;

			try {
				// Attempt to delete the post by ID
				const result = await postsCollection.deleteOne({
					_id: new ObjectId(id),
				});

				if (result.deletedCount === 0) {
					return res.status(404).json({ error: "Post not found" });
				}

				res.status(200).json({ success: "Post removed successfully" });
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.get("/get-posts", async (req, res) => {
			try {
				const postsCursor = postsCollection.find({});
				const posts = await postsCursor.toArray();

				const postsWithUserDetails = await Promise.all(
					posts.map(async (post) => {
						const user = await usersCollection.findOne({
							_id: new ObjectId(post.userId),
						});
						return {
							post_id: post._id,
							post_title: post.title,
							userName: user ? user.name : null,
							userPhotoURL: user ? user.photoURL : null,
						};
					})
				);

				res.send(postsWithUserDetails);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.get("/get-specific-post/:id", async (req, res) => {
			const { id } = req.params;

			try {
				const post = await postsCollection.findOne({
					_id: new ObjectId(id),
				});

				if (!post) {
					return res.status(404).json({ error: "Post not found" });
				}

				const user = await usersCollection.findOne({
					_id: new ObjectId(post.userId),
				});

				res.status(200).json({
					...post,
					userName: user ? user.name : null,
					userPhotoURL: user ? user.photoURL : null,
				});
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.post("/add-comment/:id", async (req, res) => {
			const { id } = req.params;
			const { userId, text } = req.body; // Assumes userId and text are provided in the request body

			if (!text) {
				return res
					.status(400)
					.json({ error: "Comment text is required" });
			}

			try {
				// Update the post to add a new comment
				const result = await postsCollection.updateOne(
					{ _id: new ObjectId(id) },
					{
						$push: {
							comments: { userId, text, createdAt: new Date() },
						},
					}
				);

				if (result.modifiedCount === 0) {
					return res.status(404).json({ error: "Post not found" });
				}

				res.status(200).json({ success: "Comment added" });
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.get("/get-comments/:postId", async (req, res) => {
			const { postId } = req.params;

			try {
				// Find the post by ID
				const post = await postsCollection.findOne({
					_id: new ObjectId(postId),
				});

				if (!post) {
					return res.status(404).json({ error: "Post not found" });
				}

				// Ensure post.comments is an array before mapping
				const comments = post.comments || [];

				// Populate comments with user details
				const commentsWithUserDetails = await Promise.all(
					comments.map(async (comment) => {
						const user = await usersCollection.findOne({
							_id: new ObjectId(comment.userId),
						});
						return {
							...comment,
							userName: user ? user.name : "Unknown",
							userPhotoURL: user ? user.photoURL : null,
						};
					})
				);

				res.status(200).json(commentsWithUserDetails);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		// API to Get Friend Suggestions
		app.get("/friend-suggestions/:userId", async (req, res) => {
			const { userId } = req.params;

			try {
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});

				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				// Default to empty arrays if not defined
				const excludeIds = [
					...(user.friends || []),
					...(user.sentRequests || []),
					...(user.receivedRequests || []),
					userId, // Exclude the user themselves
				].map((id) => new ObjectId(id));

				const suggestions = await usersCollection
					.find({ _id: { $nin: excludeIds } })
					.limit(10)
					.toArray();

				res.status(200).json(suggestions);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.post("/friend-request", async (req, res) => {
			const { senderId, receiverId } = req.body;

			try {
				const sender = await usersCollection.findOne({
					_id: new ObjectId(senderId),
				});
				const receiver = await usersCollection.findOne({
					_id: new ObjectId(receiverId),
				});

				if (!sender || !receiver) {
					return res.status(404).json({ error: "User not found" });
				}

				// Check if a friend request has already been sent
				if (
					receiver.receivedRequests &&
					receiver.receivedRequests.includes(senderId)
				) {
					return res
						.status(400)
						.json({ error: "Friend request already sent" });
				}

				// Add senderId to the receiver's receivedRequests
				await usersCollection.updateOne(
					{ _id: new ObjectId(receiverId) },
					{ $addToSet: { receivedRequests: senderId } }
				);

				// Add receiverId to the sender's sentRequests
				await usersCollection.updateOne(
					{ _id: new ObjectId(senderId) },
					{ $addToSet: { sentRequests: receiverId } }
				);

				res.status(200).json({ success: "Friend request sent" });
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		// Accept Friend Request
		app.post("/accept-request", async (req, res) => {
			const { userId, senderId } = req.body;

			try {
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});
				const sender = await usersCollection.findOne({
					_id: new ObjectId(senderId),
				});

				if (!user || !sender) {
					return res.status(404).json({ error: "User not found" });
				}

				// Ensure the friend request exists
				if (
					!user.receivedRequests ||
					!user.receivedRequests.includes(senderId)
				) {
					return res
						.status(400)
						.json({ error: "No friend request found" });
				}

				// Remove from receivedRequests and sentRequests
				await usersCollection.updateOne(
					{ _id: new ObjectId(userId) },
					{
						$pull: { receivedRequests: senderId },
						$addToSet: { friends: senderId },
					}
				);

				await usersCollection.updateOne(
					{ _id: new ObjectId(senderId) },
					{
						$pull: { sentRequests: userId },
						$addToSet: { friends: userId },
					}
				);

				res.status(200).json({ success: "Friend request accepted" });
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		app.post("/reject-request", async (req, res) => {
			const { userId, requesterId } = req.body;

			try {
				// Find the user and the requester
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});
				const requester = await usersCollection.findOne({
					_id: new ObjectId(requesterId),
				});

				if (!user || !requester) {
					return res.status(404).json({ error: "User not found" });
				}

				// Remove the request from the user's receivedRequests and requester's sentRequests
				await usersCollection.updateOne(
					{ _id: new ObjectId(userId) },
					{ $pull: { receivedRequests: requesterId } }
				);

				await usersCollection.updateOne(
					{ _id: new ObjectId(requesterId) },
					{ $pull: { sentRequests: userId } }
				);

				res.status(200).json({
					success: "Friend request rejected successfully",
				});
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		// View Received Friend Requests
		app.get("/received-requests/:userId", async (req, res) => {
			const { userId } = req.params;

			try {
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});

				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				const receivedRequests = user.receivedRequests || []; // Default to empty array
				if (receivedRequests.length === 0) {
					return res.status(200).json([]); // If no requests, return empty array
				}

				const requestsDetails = await usersCollection
					.find({
						_id: {
							$in: receivedRequests.map((id) => new ObjectId(id)),
						},
					})
					.toArray();

				res.status(200).json(requestsDetails);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		// View Sent Friend Requests
		app.get("/sent-requests/:userId", async (req, res) => {
			const { userId } = req.params;

			try {
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});

				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				const sentRequests = user.sentRequests || []; // Default to empty array
				if (sentRequests.length === 0) {
					return res.status(200).json([]); // If no requests, return empty array
				}

				const requestsDetails = await usersCollection
					.find({
						_id: {
							$in: sentRequests.map((id) => new ObjectId(id)),
						},
					})
					.toArray();

				res.status(200).json(requestsDetails);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		// View Friends API
		app.get("/friends/:userId", async (req, res) => {
			const { userId } = req.params;

			try {
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});

				if (!user) {
					return res.status(404).json({ error: "User not found" });
				}

				// Retrieve the user's list of friends
				const friends = user.friends || []; // Default to an empty array if no friends

				if (friends.length === 0) {
					return res.status(200).json([]); // Return an empty array if no friends are found
				}

				// Get friend details from their IDs
				const friendDetails = await usersCollection
					.find({
						_id: { $in: friends.map((id) => new ObjectId(id)) },
					})
					.toArray();

				res.status(200).json(friendDetails);
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});
		// Remove Friend API
		app.post("/remove-friend", async (req, res) => {
			const { userId, friendId } = req.body;

			try {
				const user = await usersCollection.findOne({
					_id: new ObjectId(userId),
				});
				const friend = await usersCollection.findOne({
					_id: new ObjectId(friendId),
				});

				if (!user || !friend) {
					return res.status(404).json({ error: "User not found" });
				}

				// Remove the friendId from the user's friends array
				await usersCollection.updateOne(
					{ _id: new ObjectId(userId) },
					{ $pull: { friends: friendId } }
				);

				// Remove the userId from the friend's friends array
				await usersCollection.updateOne(
					{ _id: new ObjectId(friendId) },
					{ $pull: { friends: userId } }
				);

				res.status(200).json({
					success: "Friend removed successfully",
				});
			} catch (err) {
				console.error(err);
				res.status(500).json({ error: "Server error" });
			}
		});

		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);
	} finally {
		// Ensures that the client will close when you finish/error
		// await client.close();
	}
}
run().catch(console.dir);

app.get("/", (req, res) => {
	res.send("Server is running");
});

app.listen(port, () => {
	console.log(`Current active port: ${port}`);
});
