import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Frown, Camera, MessageSquare, MessageCircle, Trash2, ZoomIn, X } from "lucide-react";

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
	const [commenting, setCommenting] = useState(false);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await axios.get(`http://localhost:3000/get-specific-post/${id}`);
				setPost(response.data);
			} catch (err) {
				setError("Failed to fetch post");
			} finally {
				setLoading(false);
			}
		};

		const fetchComments = async () => {
			try {
				const response = await axios.get(`http://localhost:3000/get-comments/${id}`);
				setComments(response.data);
			} catch (err) {
				setError("Failed to fetch comments");
			}
		};

		fetchPost();
		fetchComments();
	}, [id]);

	const handleAddComment = async () => {
		if (!newComment.trim()) return;
		setCommenting(true);
		try {
			await axios.post(`http://localhost:3000/add-comment/${id}`, { userId, text: newComment });
			setNewComment("");
			const response = await axios.get(`http://localhost:3000/get-comments/${id}`);
			setComments(response.data);
		} catch (error) {
			setError("Failed to add comment");
		} finally {
			setCommenting(false);
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
			<div className="min-h-screen flex items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<span className="loading loading-infinity loading-lg text-primary"></span>
					<p className="text-base-content/40 animate-pulse">Loading adventure...</p>
				</div>
			</div>
		);

	if (error)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="glass-card p-8 text-center max-w-md flex flex-col items-center">
					<Frown size={48} className="text-primary/40 mb-4" />
					<p className="text-error font-bold text-xl mb-2">Oops!</p>
					<p className="text-base-content/50">{error}</p>
					<button className="btn btn-primary btn-sm mt-4" onClick={() => navigate("/")}>Go Home</button>
				</div>
			</div>
		);

	if (!post)
		return (
			<div className="min-h-screen flex items-center justify-center text-base-content/70">
				Post not found
			</div>
		);

	return (
		<div className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto animate-slide-up">
			{/* Main Post Card */}
			<article className="glass-panel rounded-3xl overflow-hidden mb-8">
				{/* Hero Image */}
				{post.images && post.images.length > 0 && (
					<div className="relative h-64 md:h-96 overflow-hidden cursor-pointer" onClick={() => setSelectedImage(post.images[0])}>
						<img
							src={post.images[0]}
							alt={post.title}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-transparent to-transparent"></div>
						{post.images.length > 1 && (
							<div className="absolute bottom-4 right-4 badge badge-primary badge-lg gap-2">
								<Camera size={16} /> +{post.images.length - 1} more
							</div>
						)}
					</div>
				)}

				<div className="p-8 md:p-12">
					{/* Author */}
					<div className="flex items-center justify-between mb-8">
						<div className="flex items-center gap-4">
							{post.userPhotoURL ? (
								<div className="avatar">
									<div className="w-14 h-14 rounded-full ring-2 ring-primary/50 ring-offset-base-100 ring-offset-2">
										<img src={post.userPhotoURL} alt={post.userName} />
									</div>
								</div>
							) : (
								<div className="avatar placeholder">
									<div className="bg-gradient-to-br from-primary to-secondary text-white rounded-full w-14">
										<span className="text-2xl font-bold">{post.userName ? post.userName[0] : "?"}</span>
									</div>
								</div>
							)}
							<div>
								<h2 className="text-xl font-bold gradient-text">{post.userName}</h2>
								<p className="text-base-content/40 text-sm">Shared an adventure</p>
							</div>
						</div>
						{userId === post.userId && (
							<button onClick={handleDeletePost} className="btn btn-ghost btn-sm text-error hover:bg-error/10 gap-2">
								<Trash2 size={16} />
								Delete
							</button>
						)}
					</div>

					{/* Title & Description */}
					<h1 className="text-4xl md:text-5xl font-display font-bold mb-6 leading-tight">{post.title}</h1>
					<p className="text-lg text-base-content/60 leading-relaxed max-w-4xl mb-8">{post.description}</p>

					{/* Image Gallery */}
					{post.images && post.images.length > 1 && (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
							{post.images.slice(1).map((image, index) => (
								<div
									key={index}
									className="relative group rounded-2xl overflow-hidden cursor-pointer aspect-square"
									onClick={() => setSelectedImage(image)}
								>
									<img src={image} alt={`Post image ${index + 2}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
										<span className="btn btn-circle btn-ghost text-white border-white/30">
											<ZoomIn size={20} />
										</span>
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</article>

			{/* Comments Section */}
			<section className="glass-panel rounded-3xl p-8 md:p-12">
				<h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
					<MessageSquare size={24} className="text-primary" /> Comments
					<span className="badge badge-primary badge-sm">{comments.length}</span>
				</h3>

				{/* Comment Input */}
				{userId && (
					<div className="flex gap-4 mb-10">
						<div className="avatar placeholder hidden sm:flex">
							<div className="bg-gradient-to-br from-primary to-secondary text-white rounded-full w-10">
								<span className="text-sm font-bold">{user.name ? user.name[0] : "?"}</span>
							</div>
						</div>
						<div className="flex-1 flex flex-col sm:flex-row gap-3">
							<textarea
								value={newComment}
								onChange={(e) => setNewComment(e.target.value)}
								placeholder="Share your thoughts about this adventure..."
								className="textarea textarea-bordered input-glass flex-1 h-16 resize-none"
							/>
							<button onClick={handleAddComment} className={`btn btn-primary btn-gradient self-end ${commenting ? 'loading' : ''}`} disabled={commenting || !newComment.trim()}>
								Post
							</button>
						</div>
					</div>
				)}

				{/* Comments List */}
				<div className="space-y-4">
					{comments.length === 0 && (
						<div className="text-center py-10 flex flex-col items-center">
							<MessageCircle size={48} className="text-primary/20 mb-2" />
							<p className="text-base-content/40">No comments yet. Be the first to share your thoughts!</p>
						</div>
					)}
					{comments.map((comment) => (
						<div key={comment._id} className="flex items-start gap-4 p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors duration-300">
							{comment.userPhotoURL ? (
								<div className="avatar"><div className="w-10 h-10 rounded-full"><img src={comment.userPhotoURL} alt={comment.userName} /></div></div>
							) : (
								<div className="avatar placeholder"><div className="bg-neutral text-neutral-content rounded-full w-10"><span className="text-lg">{comment.userName ? comment.userName[0] : "?"}</span></div></div>
							)}
							<div className="flex-1">
								<div className="flex items-baseline gap-2 mb-1">
									<h4 className="font-bold text-sm">{comment.userName}</h4>
									<span className="text-xs text-base-content/30">just now</span>
								</div>
								<p className="text-base-content/60 text-sm leading-relaxed">{comment.text}</p>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* Lightbox Modal */}
			{selectedImage && (
				<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedImage(null)}></div>
					<div className="relative z-10 max-w-5xl w-full">
						<button className="btn btn-circle btn-sm bg-white/10 border-white/20 text-white absolute -top-12 right-0 hover:bg-white/20" onClick={() => setSelectedImage(null)}>
							<X size={18} />
						</button>
						<img src={selectedImage} alt="Enlarged view" className="max-h-[85vh] rounded-xl shadow-2xl mx-auto" />
					</div>
				</div>
			)}
		</div>
	);
};

export default Post;
