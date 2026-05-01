import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Users, Camera, Plane, X, CheckCircle, Car, Backpack } from 'lucide-react';

const TABS = ['posts', 'people', 'trips'];

const Explore = () => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [activeTab, setActiveTab] = useState('posts');
    const [results, setResults] = useState({ posts: [], people: [], trips: [] });
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Debounce: wait 350ms after user stops typing before searching
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 350);
        return () => clearTimeout(timer);
    }, [query]);

    // Fetch from backend whenever debouncedQuery changes
    useEffect(() => {
        fetchResults(debouncedQuery);
    }, [debouncedQuery]);

    const fetchResults = async (q) => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3000/search`, {
                params: { q, type: 'all' }
            });
            const data = res.data;
            // Filter yourself out of people results
            if (user._id && data.people) {
                data.people = data.people.filter(p => p._id !== user._id && p._id?.toString() !== user._id);
            }
            setResults({ posts: data.posts || [], people: data.people || [], trips: data.trips || [] });
        } catch (e) {
            console.error('Search error:', e);
        } finally {
            setLoading(false);
        }
    };

    const counts = {
        posts: results.posts.length,
        people: results.people.length,
        trips: results.trips.length,
    };

    const tabIcons = { posts: <Camera size={14} />, people: <Users size={14} />, trips: <MapPin size={14} /> };

    return (
        <div className="min-h-screen p-4 md:p-8 animate-slide-up">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="section-title mb-2">Explore</h1>
                    <p className="text-base-content/50 text-lg">Discover posts, travelers, and open trips</p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-8">
                    <div className="relative">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30 pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search posts, people, destinations..."
                            className="input input-bordered input-glass w-full pl-12 pr-12 h-14 text-lg rounded-2xl"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => setQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-xs opacity-40 hover:opacity-100"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    {query && !loading && (
                        <p className="text-center text-xs text-base-content/30 mt-2">
                            {counts.posts + counts.people + counts.trips} results for &quot;{query}&quot;
                        </p>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex justify-center gap-2 mb-8 flex-wrap">
                    {TABS.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`btn btn-sm rounded-full gap-2 capitalize ${activeTab === tab
                                ? 'btn-primary'
                                : 'btn-ghost border border-white/[0.08] text-base-content/60 hover:bg-white/5'
                            }`}
                        >
                            {tabIcons[tab]}
                            {tab}
                            <span className={`badge badge-xs ${activeTab === tab ? 'badge-primary-content bg-white/20' : 'badge-ghost'}`}>
                                {counts[tab]}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <span className="loading loading-infinity loading-lg text-primary"></span>
                    </div>
                ) : (
                    <>
                        {/* ── POSTS TAB ── */}
                        {activeTab === 'posts' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {results.posts.length === 0 ? (
                                    <EmptyState icon={<Camera size={48} />} text={query ? `No posts found for "${query}"` : 'No posts yet'} />
                                ) : results.posts.map(post => (
                                    <Link key={post._id} to={`/post/${post.post_id || post._id}`} className="glass-card group overflow-hidden">
                                        <figure className="relative h-44 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                                            {post.images?.[0] ? (
                                                <img
                                                    src={post.images[0]}
                                                    alt={post.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    onError={e => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Plane size={40} className="opacity-20" />
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent" />
                                        </figure>
                                        <div className="p-5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="avatar">
                                                    <div className="w-6 h-6 rounded-full overflow-hidden">
                                                        <img
                                                            src={post.userPhotoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.userName}`}
                                                            alt=""
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-xs text-base-content/50">{post.userName}</span>
                                                {post.userVerified && <CheckCircle size={12} className="text-success" />}
                                            </div>
                                            <h3 className="font-bold line-clamp-1 group-hover:text-primary transition-colors">{post.title}</h3>
                                            <p className="text-xs text-base-content/40 line-clamp-2 mt-1">{post.description}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {/* ── PEOPLE TAB ── */}
                        {activeTab === 'people' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.people.length === 0 ? (
                                    <EmptyState icon={<Users size={48} />} text={query ? `No people found for "${query}"` : 'No users yet'} />
                                ) : results.people.map(person => (
                                    <div key={person._id} className="glass-card p-5 flex items-center gap-4 transition-all">
                                        <div className="avatar">
                                            <div className="w-14 h-14 rounded-full ring-2 ring-white/[0.08] overflow-hidden">
                                                <img
                                                    src={person.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${person.name}`}
                                                    alt={person.name}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <h3 className="font-bold text-sm truncate">{person.name}</h3>
                                                {person.verifyOCR && <CheckCircle size={13} className="text-success shrink-0" />}
                                            </div>
                                            <p className="text-xs text-base-content/40 truncate mb-1.5">{person.bio || person.email}</p>
                                            <span className="badge badge-ghost badge-xs gap-1">
                                                {person.role === 'carRentalUser'
                                                    ? <><Car size={9} /> Provider</>
                                                    : <><Backpack size={9} /> Traveler</>
                                                }
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ── TRIPS TAB ── */}
                        {activeTab === 'trips' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {results.trips.length === 0 ? (
                                    <EmptyState icon={<MapPin size={48} />} text={query ? `No trips found for "${query}"` : 'No open trips'} />
                                ) : results.trips.map(trip => (
                                    <div key={trip._id} className="glass-card p-6 transition-all hover:border-primary/20">
                                        <div className="flex items-start justify-between mb-3 gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <MapPin size={18} className="text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg leading-tight">{trip.destination}</h3>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        {trip.travelerPhoto && (
                                                            <div className="avatar">
                                                                <div className="w-4 h-4 rounded-full overflow-hidden">
                                                                    <img src={trip.travelerPhoto} alt="" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <p className="text-xs text-base-content/40">by {trip.travelerName}</p>
                                                        {trip.travelerVerified && <CheckCircle size={10} className="text-success" />}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge badge-primary badge-sm shrink-0">Open</span>
                                        </div>
                                        <p className="text-sm text-base-content/60 mb-4 line-clamp-2">{trip.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="badge badge-ghost badge-sm">📅 {trip.dates}</span>
                                            <span className="badge badge-ghost badge-sm">👥 {trip.groupSize} pax</span>
                                            <span className="badge badge-ghost badge-sm">💰 ৳{trip.budget}</span>
                                            {trip.vehicleType && (
                                                <span className="badge badge-ghost badge-sm gap-1">
                                                    <Car size={10} /> {trip.vehicleType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Reusable empty state
const EmptyState = ({ icon, text }) => (
    <div className="col-span-full text-center py-20 glass-panel rounded-3xl">
        <div className="text-base-content/20 mb-4 flex justify-center">{icon}</div>
        <p className="text-base-content/40">{text}</p>
    </div>
);

export default Explore;
