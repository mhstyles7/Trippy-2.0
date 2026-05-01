import API_BASE from '../../api';
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { CheckCircle, Car, Backpack, AlertTriangle, Plus, Users, Camera, Plane, Palmtree, Loader, Pencil } from "lucide-react";

export default function Profile() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

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
            const res = await axios.get(`${API_BASE}/get-posts`);
            const userPosts = res.data.filter(post => post.userId === user._id);
            setPosts(userPosts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("Image too large. Please use an image under 2MB.");
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result;
            try {
                const res = await axios.patch(`${API_BASE}/update-profile/${user._id}`, {
                    photoURL: base64,
                });
                const updated = { ...user, photoURL: base64 };
                localStorage.setItem("user", JSON.stringify(updated));
                setUser(updated);
            } catch (err) {
                alert("Failed to update photo");
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    if (!user || !user._id) return null;

    return (
        <div className="min-h-screen p-4 md:p-8 animate-slide-up">
            <div className="max-w-5xl mx-auto space-y-10">
                {/* Profile Hero */}
                <div className="glass-panel p-10 rounded-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        {/* Avatar with upload overlay */}
                        <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                            <div className="avatar">
                                <div className="w-32 h-32 rounded-full ring-2 ring-primary/40 ring-offset-base-100 ring-offset-4 shadow-2xl shadow-primary/10 overflow-hidden">
                                    <img
                                        src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.name}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            {/* Hover overlay */}
                            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                {uploading
                                    ? <Loader size={24} className="text-white animate-spin" />
                                    : <Camera size={24} className="text-white" />
                                }
                            </div>
                            {/* Edit badge */}
                            <div className="absolute bottom-1 right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-base-100">
                                <Pencil size={12} className="text-white" />
                            </div>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handlePhotoChange}
                            />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2 flex items-center justify-center md:justify-start gap-2">
                                {user.name} {user.verifyOCR && <CheckCircle className="text-success" size={24} title="Verified Identity" />}
                            </h1>
                            <p className="text-base-content/40 text-lg mb-1">{user.email}</p>
                            {user.bio && <p className="text-base-content/60 text-sm mb-6 max-w-md">{user.bio}</p>}

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-4">
                                <div className="stat-card rounded-2xl px-6 py-3 min-w-[100px]">
                                    <span className="text-2xl font-bold gradient-text">{posts.length}</span>
                                    <span className="text-xs text-base-content/40 uppercase tracking-wider">Posts</span>
                                </div>
                                <div className="stat-card rounded-2xl px-6 py-3 min-w-[100px]">
                                    <span className="text-sm font-bold text-secondary flex items-center gap-2">
                                        {user.role === "carRentalUser" ? <Car size={16} /> : <Backpack size={16} />}
                                        {user.role === "carRentalUser" ? "Provider" : "Traveler"}
                                    </span>
                                    <span className="text-xs text-base-content/40 uppercase tracking-wider">Role</span>
                                </div>
                                <div className="stat-card rounded-2xl px-6 py-3 min-w-[100px]">
                                    <span className={`text-sm font-bold ${user.verifyOCR ? 'text-success' : 'text-warning'} flex items-center gap-2`}>
                                        {user.verifyOCR ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                                        {user.verifyOCR ? 'Verified' : 'Unverified'}
                                    </span>
                                    <span className="text-xs text-base-content/40 uppercase tracking-wider">Status</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link to="/create" className="btn btn-gradient btn-glow gap-2 shadow-lg shadow-primary/20">
                                <Plus size={18} /> New Post
                            </Link>
                            <Link to="/friends" className="btn btn-outline btn-sm border-white/10 hover:bg-white/5 gap-2">
                                <Users size={16} /> Friends
                            </Link>
                        </div>
                    </div>
                </div>

                {/* User Posts */}
                <div>
                    <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Camera size={20} className="text-primary" />
                        </span>
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
                                                <Plane size={48} className="opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent" />
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
                            <Palmtree size={64} className="mx-auto mb-4 text-primary/40" />
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
