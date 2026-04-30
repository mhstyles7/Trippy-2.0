import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Plane, Plus, ChevronDown, Globe, Camera, Map, Star, Users, Car, Bot, CheckCircle, Palmtree } from "lucide-react";

const Home = () => {
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(true);
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const isLoggedIn = user && user._id;

	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const response = await axios.get("http://localhost:3000/get-posts");
				setPosts(response.data);
			} catch (error) {
				console.error("Error fetching posts:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchPosts();
	}, []);

	return (
		<div className="min-h-screen">
			{/* Hero Section — Full Width */}
			<section className="relative overflow-hidden px-4 py-20 md:py-32 lg:py-40">
				{/* Animated Background Blobs */}
				<div className="floating-blob bg-primary w-96 h-96 top-[-10%] left-[-5%]"></div>
				<div className="floating-blob bg-secondary w-80 h-80 top-[20%] right-[-5%] animation-delay-2000"></div>
				<div className="floating-blob bg-accent w-72 h-72 bottom-[-10%] left-[30%] animation-delay-4000"></div>

				<div className="relative z-10 max-w-6xl mx-auto text-center">
					<div className="animate-slide-up">
						<p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4 flex items-center justify-center gap-2">
							<Plane size={16} /> Your Travel Companion
						</p>
						<h1 className="hero-title mb-6">
							Explore the<br />
							<span className="text-glow">World Together</span>
						</h1>
						<p className="text-xl md:text-2xl text-base-content/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
							Connect with travelers, share adventures, rent vehicles, and discover breathtaking destinations — all in one place.
						</p>

						<div className="flex flex-wrap justify-center gap-4 mb-16">
							{isLoggedIn ? (
								<Link to="/create" className="btn btn-lg btn-gradient btn-glow gap-2 px-8 shadow-2xl shadow-primary/20">
									<Plus size={20} />
									Share Your Journey
								</Link>
							) : (
								<Link to="/register" className="btn btn-lg btn-gradient btn-glow gap-2 px-8 shadow-2xl shadow-primary/20">
									Get Started Free
								</Link>
							)}
							<a href="#feed" className="btn btn-lg btn-outline border-white/10 hover:bg-white/5 gap-2">
								<ChevronDown size={20} />
								Explore Feed
							</a>
						</div>
					</div>

					{/* Stats Row */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
						{[
							{ label: "Travelers", value: "2K+", icon: <Globe size={24} className="text-primary" /> },
							{ label: "Adventures", value: `${posts.length || "50"}+`, icon: <Camera size={24} className="text-secondary" /> },
							{ label: "Countries", value: "30+", icon: <Map size={24} className="text-accent" /> },
							{ label: "5-Star Reviews", value: "500+", icon: <Star size={24} className="text-warning" /> },
						].map((stat, i) => (
							<div key={i} className="stat-card rounded-2xl flex flex-col items-center gap-2 p-4">
								<div className="mb-1">{stat.icon}</div>
								<span className="text-2xl font-bold gradient-text">{stat.value}</span>
								<span className="text-xs text-base-content/50 uppercase tracking-wider text-center">{stat.label}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="section-title">Why Choose Trippy 2.0?</h2>
						<p className="text-base-content/50 text-lg">Everything you need for the perfect travel experience</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ icon: <Users size={40} className="text-primary" />, title: "Travel Community", desc: "Connect with like-minded travelers, share stories, and build lasting friendships across the globe." },
							{ icon: <Car size={40} className="text-secondary" />, title: "Car Rentals", desc: "Seamlessly rent vehicles from local providers. Browse, book, and hit the road in minutes." },
							{ icon: <Bot size={40} className="text-accent" />, title: "AI Travel Guide", desc: "Get personalized recommendations and real-time suggestions from our intelligent chatbot assistant." },
						].map((feature, i) => (
							<div key={i} className="glass-card p-8 text-center group cursor-default flex flex-col items-center" style={{ animationDelay: `${i * 0.1}s` }}>
								<div className="mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
								<h3 className="text-xl font-bold mb-3">{feature.title}</h3>
								<p className="text-base-content/50 leading-relaxed text-sm">{feature.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Feed Section */}
			<section id="feed" className="px-4 py-16 scroll-mt-20">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="section-title">Latest Adventures</h2>
						<p className="text-base-content/50 text-lg">Discover stories from travelers around the world</p>
					</div>

					{loading ? (
						<div className="flex justify-center py-20">
							<span className="loading loading-infinity loading-lg text-primary"></span>
						</div>
					) : posts.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
							{posts.map((post, index) => (
								<Link
									key={post.post_id}
									to={`/post/${post.post_id}`}
									className="glass-card group overflow-hidden animate-slide-up"
									style={{ animationDelay: `${index * 0.05}s` }}
								>
									<figure className="relative h-56 overflow-hidden">
										{post.images && post.images.length > 0 ? (
											<img
												src={post.images[0]}
												alt={post.post_title}
												className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
											/>
										) : (
											<div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-secondary/20 flex items-center justify-center">
												<Plane size={64} className="opacity-10 group-hover:opacity-20 transition-opacity duration-500" />
											</div>
										)}
										<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
									</figure>

									<div className="p-6">
										<div className="flex items-center gap-3 mb-4">
											{post.userPhotoURL ? (
												<div className="avatar">
													<div className="w-10 h-10 rounded-full ring-2 ring-primary/50">
														<img src={post.userPhotoURL} alt={post.userName} />
													</div>
												</div>
											) : (
												<div className="avatar placeholder">
													<div className="bg-gradient-to-br from-primary to-secondary text-white rounded-full w-10">
														<span className="text-lg font-bold">{post.userName ? post.userName[0] : "?"}</span>
													</div>
												</div>
											)}
											<div>
												<div className="flex items-center gap-1">
													<p className="font-bold text-sm">{post.userName}</p>
													{post.userVerified && <CheckCircle size={12} className="text-success" title="Verified" />}
												</div>
												<p className="text-xs text-base-content/40">Traveler</p>
											</div>
										</div>

										<h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all duration-300 line-clamp-2">
											{post.post_title}
										</h3>
										{post.description && (
											<p className="text-sm text-base-content/40 line-clamp-2">{post.description}</p>
										)}
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="glass-card p-16 text-center max-w-lg mx-auto">
							<Palmtree size={64} className="mx-auto mb-4 text-primary/40" />
							<h3 className="text-2xl font-bold mb-2">No adventures yet</h3>
							<p className="text-base-content/50 mb-6">Be the first to share your travel story!</p>
							{isLoggedIn && (
								<Link to="/create" className="btn btn-gradient">Create Your First Post</Link>
							)}
						</div>
					)}
				</div>
			</section>
		</div>
	);
};

export default Home;
