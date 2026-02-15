import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Profile() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user || !user._id) {
            navigate("/login");
        } else {
            fetchUserPosts();
        }
    }, []);

    const fetchUserPosts = async () => {
        setLoading(true);
        try {
            const res = await axios.get("http://localhost:3000/get-posts");
            const userPosts = res.data.filter(post => post.userId === user._id);
            setPosts(userPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!user || !user._id) return null;

    return (
        <div className="min-h-screen p-4 md:p-8 animate-slide-up">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Profile Hero */}
                <div className="glass-panel p-10 rounded-3xl relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="avatar">
                            <div className="w-32 h-32 rounded-full ring-2 ring-primary/40 ring-offset-base-100 ring-offset-4 shadow-2xl shadow-primary/10">
                                <img src={user.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={user.name} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                                {user.name} {user.verifyOCR && <span className="text-2xl" title="Verified Identity">✅</span>}
                            </h1>
                            <p className="text-base-content/40 text-lg mb-6">{user.email}</p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="stat-card rounded-2xl px-6 py-3 min-w-[100px]">
                                    <span className="text-2xl font-bold gradient-text">{posts.length}</span>
                                    <span className="text-xs text-base-content/40 uppercase tracking-wider">Posts</span>
                                </div>
                                <div className="stat-card rounded-2xl px-6 py-3 min-w-[100px]">
                                    <span className="text-sm font-bold text-secondary">{user.role === "carRentalUser" ? "🚗 Provider" : "🎒 Traveler"}</span>
                                    <span className="text-xs text-base-content/40 uppercase tracking-wider">Role</span>
                                </div>
                                <div className="stat-card rounded-2xl px-6 py-3 min-w-[100px]">
                                    <span className={`text-sm font-bold ${user.verifyOCR ? 'text-success' : 'text-warning'}`}>{user.verifyOCR ? '✅ Verified' : '⚠️ Unverified'}</span>
                                    <span className="text-xs text-base-content/40 uppercase tracking-wider">Status</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3">
                            <Link to="/create" className="btn btn-gradient btn-glow gap-2 shadow-lg shadow-primary/20">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                New Post
                            </Link>
                            <Link to="/friends" className="btn btn-outline btn-sm border-white/10 hover:bg-white/5 gap-2">
                                👥 Friends
                            </Link>
                        </div>
                    </div>
                </div>

                {/* User Posts */}
                <div>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg">📸</span>
                        My Journeys
                    </h2>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <span className="loading loading-infinity loading-lg text-primary"></span>
                        </div>
                    ) : posts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {posts.map((post) => (
                                <Link key={post._id || post.post_id} to={`/post/${post.post_id || post._id}`} className="glass-card group overflow-hidden">
                                    <figure className="relative h-48 overflow-hidden">
                                        {post.images && post.images.length > 0 ? (
                                            <img src={post.images[0]} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                <span className="text-4xl opacity-30">✈️</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent"></div>
                                    </figure>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2 group-hover:gradient-text transition-all line-clamp-1">{post.title}</h3>
                                        <p className="text-sm text-base-content/40 line-clamp-2">{post.description}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-card p-16 text-center max-w-lg mx-auto">
                            <span className="text-6xl mb-4 block">🏖️</span>
                            <h3 className="text-2xl font-bold mb-2">No journeys yet</h3>
                            <p className="text-base-content/40 mb-6">Share your first adventure with the community!</p>
                            <Link to="/create" className="btn btn-gradient">Create Your First Post</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
