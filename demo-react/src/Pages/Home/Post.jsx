import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Post = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const userId = user._id;
	const [post, setPost] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [selectedImage, setSelectedImage] = useState(null);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState([]);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3000/get-specific-post/${id}`
				);
				setPost(response.data);
			} catch (err) {
				setError("Failed to fetch post");
			} finally {
				setLoading(false);
			}
		};

		const fetchComments = async () => {
			try {
				const response = await axios.get(
					`http://localhost:3000/get-comments/${id}`
				);
				setComments(response.data);
			} catch (err) {
				setError("Failed to fetch comments");
			}
		};

		fetchPost();
		fetchComments();
	}, [id]);

	const handleAddComment = async () => {
		try {
			await axios.post(`http://localhost:3000/add-comment/${id}`, {
				userId,
				text: newComment,
			});
			setNewComment("");
			// Refresh comments
			const response = await axios.get(
				`http://localhost:3000/get-comments/${id}`
			);
			setComments(response.data);
		} catch (error) {
			setError("Failed to add comment");
		}
	};

	const handleDeletePost = async () => {
		try {
			await axios.delete(`http://localhost:3000/remove-post/${id}`);
			navigate("/");
		} catch (err) {
			setError("Failed to delete post");
		}
	};

	if (loading)
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
				Loading...
			</div>
		);
	if (error)
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-600">
				{error}
			</div>
		);

	if (!post)
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-600">
				Post not found
			</div>
		);

	return (
		<div className="min-h-screen bg-gray-50 p-8">
			<div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
				<div className="flex items-center mb-6">
					{post.userPhotoURL ? (
						<img
							src={post.userPhotoURL}
							alt={post.userName}
							className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 mr-4"
						/>
					) : (
						<div className="w-16 h-16 rounded-full bg-indigo-500 flex items-center justify-center mr-4">
							<span className="text-white text-2xl font-semibold">
								{post.userName[0]}
							</span>
						</div>
					)}
					<div>
						<h2 className="text-2xl font-semibold text-gray-800">
							{post.userName}
						</h2>
					</div>
				</div>
				<h1 className="text-4xl font-bold mb-4 text-indigo-600">
					{post.title}
				</h1>
				<p className="text-gray-700 mb-6">{post.description}</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{post.images.map((image, index) => (
						<div key={index} className="relative group">
							<img
								src={image}
								alt={`Post image ${index + 1}`}
								className="w-full h-auto rounded-lg shadow-md transition-transform duration-300 transform group-hover:scale-105 cursor-pointer"
							/>
							<div
								className="cursor-pointer absolute inset-0 bg-gray-900 bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center text-white text-xl"
								onClick={() => setSelectedImage(image)}
							>
								View Image
							</div>
						</div>
					))}
				</div>

				{userId === post.userId && (
					<button
						onClick={handleDeletePost}
						className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
					>
						Delete Post
					</button>
				)}

				<div className="mt-8">
					<h3 className="text-xl font-semibold text-gray-800 mb-4">
						Comments
					</h3>
					<div className="mb-4">
						<textarea
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder="Add a comment..."
							className="w-full p-3 border rounded-md"
						/>
						<button
							onClick={handleAddComment}
							className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
						>
							Add Comment
						</button>
					</div>
					<div>
						{comments.map((comment) => (
							<div
								key={comment._id}
								className="flex items-start border-b py-4"
							>
								{comment.userPhotoURL ? (
									<img
										src={comment.userPhotoURL}
										alt={comment.userName}
										className="w-12 h-12 rounded-full object-cover border-2 border-indigo-500 mr-4"
									/>
								) : (
									<div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center mr-4">
										<span className="text-white text-xl font-semibold">
											{comment.userName[0]}
										</span>
									</div>
								)}
								<div className="flex-1">
									<p className="font-semibold">
										{comment.userName}
									</p>
									<p className="text-gray-700 mb-2">
										{comment.text}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			{selectedImage && (
				<div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
					<div className="relative max-w-3xl max-h-full p-4">
						<button
							className="absolute top-4 right-4 text-white text-6xl font-bold"
							onClick={() => setSelectedImage(null)}
						>
							&times;
						</button>
						<img
							src={selectedImage}
							alt="Enlarged view"
							className="max-w-full max-h-full object-contain"
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default Post;
