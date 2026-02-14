import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

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
						<p className="text-primary font-semibold tracking-widest uppercase text-sm mb-4">✈️ Your Travel Companion</p>
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
									<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
									Share Your Journey
								</Link>
							) : (
								<Link to="/register" className="btn btn-lg btn-gradient btn-glow gap-2 px-8 shadow-2xl shadow-primary/20">
									Get Started Free
								</Link>
							)}
							<a href="#feed" className="btn btn-lg btn-outline border-white/10 hover:bg-white/5 gap-2">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-7.5 7.5-7.5-7.5m15 6l-7.5 7.5-7.5-7.5" /></svg>
								Explore Feed
							</a>
						</div>
					</div>

					{/* Stats Row */}
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
						{[
							{ label: "Travelers", value: "2K+", icon: "🌍" },
							{ label: "Adventures", value: `${posts.length || "50"}+`, icon: "📸" },
							{ label: "Countries", value: "30+", icon: "🗺️" },
							{ label: "5-Star Reviews", value: "500+", icon: "⭐" },
						].map((stat, i) => (
							<div key={i} className="stat-card rounded-2xl">
								<span className="text-2xl">{stat.icon}</span>
								<span className="text-2xl font-bold gradient-text">{stat.value}</span>
								<span className="text-xs text-base-content/50 uppercase tracking-wider">{stat.label}</span>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Features Section */}
			<section className="px-4 py-16">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="section-title">Why Choose Trippy?</h2>
						<p className="text-base-content/50 text-lg">Everything you need for the perfect travel experience</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{[
							{ icon: "👥", title: "Travel Community", desc: "Connect with like-minded travelers, share stories, and build lasting friendships across the globe." },
							{ icon: "🚗", title: "Car Rentals", desc: "Seamlessly rent vehicles from local providers. Browse, book, and hit the road in minutes." },
							{ icon: "🤖", title: "AI Travel Guide", desc: "Get personalized recommendations and real-time suggestions from our intelligent chatbot assistant." },
						].map((feature, i) => (
							<div key={i} className="glass-card p-8 text-center group cursor-default" style={{ animationDelay: `${i * 0.1}s` }}>
								<div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
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
												<span className="text-6xl font-display font-bold text-white/10 group-hover:text-white/20 transition-colors duration-500">✈️</span>
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
												<p className="font-bold text-sm">{post.userName}</p>
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
							<span className="text-6xl mb-4 block">🏖️</span>
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
