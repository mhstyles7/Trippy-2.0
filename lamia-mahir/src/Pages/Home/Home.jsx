import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Home = () => {
	const [posts, setPosts] = useState([]);

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await axios.get(
					"http://localhost:3000/get-posts"
				);
				setPosts(response.data);
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};

		fetchPosts();
	}, []);

	return (
		<div className="bg-gray-100 min-h-screen p-8">
			<h1 className="text-4xl font-bold mb-8 text-center text-indigo-600">
				Trippy!
			</h1>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{posts.map((post) => (
					<Link
						key={post.post_id}
						to={`/post/${post.post_id}`}
						className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105"
					>
						<div className="flex items-center mb-4">
							{post.userPhotoURL ? (
								<img
									src={post.userPhotoURL}
									alt={post.userName}
									className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 mr-4"
								/>
							) : (
								<div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center mr-4">
									<span className="text-white text-xl font-semibold">
										{post.userName[0]}
									</span>
								</div>
							)}
							<div>
								<h2 className="text-xl font-semibold text-gray-800">
									{post.userName}
								</h2>
							</div>
						</div>
						<h3 className="text-2xl font-semibold mb-4 text-indigo-700">
							{post.post_title}
						</h3>
					</Link>
				))}
			</div>
		</div>
	);
};

export default Home;
