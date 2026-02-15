import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Registration = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState("traveler");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [photoPreview, setPhotoPreview] = useState(null);
    const [photoBase64, setPhotoBase64] = useState("");

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setError("Photo must be less than 2MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoBase64(reader.result);
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        const name = form.name.value;
        const photoURL = photoBase64 || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(name)}`;
        const credentials = { email, password, photoURL, name, role };

        try {
            const res = await axios.post('http://localhost:3000/signup', credentials);
            if (res.status === 201 || res.status === 200) {
                navigate("/login");
            } else {
                setError('Registration failed. Please try again.');
            }
        } catch (error) {
            console.error(error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Registration failed. Please check your details.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10 px-4">
            {/* Background Blobs */}
            <div className="floating-blob bg-secondary w-96 h-96 top-[-10%] right-[-10%]"></div>
            <div className="floating-blob bg-primary w-80 h-80 bottom-[-10%] left-[-10%]"></div>
            <div className="floating-blob bg-accent w-64 h-64 top-[40%] left-[50%] opacity-10"></div>

            <div className="card lg:card-side glass-panel max-w-5xl w-full shadow-2xl overflow-hidden animate-scale-in">
                {/* Left Panel */}
                <div className="w-full lg:w-5/12 p-10 lg:p-14 flex flex-col justify-center bg-gradient-to-br from-secondary/10 via-transparent to-primary/10 relative">
                    <div className="z-10 relative">
                        <span className="text-6xl mb-4 block">🌍</span>
                        <h1 className="text-5xl font-display font-bold mb-4 gradient-text">
                            Join<br />Trippy
                        </h1>
                        <p className="text-lg text-base-content/50 mb-8 font-light leading-relaxed">
                            Your journey begins here. Connect with travelers or manage your rental fleet.
                        </p>

                        <div className="mockup-code bg-base-300/50 text-base-content text-sm opacity-90 backdrop-blur-sm shadow-xl border border-white/[0.06]">
                            <pre data-prefix="$"><code>init traveler_profile</code></pre>
                            <pre data-prefix=">"><code>loading adventures...</code></pre>
                            <pre data-prefix="✔" className="text-success"><code>Welcome aboard!</code></pre>
                        </div>
                    </div>
                </div>

                {/* Right Panel — Form */}
                <div className="card-body w-full lg:w-7/12 bg-base-100/30 backdrop-blur-xl p-8 lg:p-12">
                    <h2 className="text-3xl font-bold mb-8 text-center">Create Account</h2>

                    {error && (
                        <div className="alert alert-error mb-4 text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        {/* Role Selection */}
                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-base-content/70">I am a...</span></label>
                            <div className="grid grid-cols-2 gap-4">
                                <div
                                    className={`cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all duration-300 ${role === 'traveler' ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10' : 'border-white/[0.08] hover:border-primary/30 hover:bg-white/[0.03]'}`}
                                    onClick={() => setRole("traveler")}
                                >
                                    <span className="text-4xl">🎒</span>
                                    <span className="font-bold text-sm">Traveler</span>
                                    <span className="text-[10px] text-center text-base-content/40">Explore & connect</span>
                                </div>
                                <div
                                    className={`cursor-pointer border-2 rounded-2xl p-5 flex flex-col items-center gap-2 transition-all duration-300 ${role === 'carRentalUser' ? 'border-secondary bg-secondary/10 shadow-lg shadow-secondary/10' : 'border-white/[0.08] hover:border-secondary/30 hover:bg-white/[0.03]'}`}
                                    onClick={() => setRole("carRentalUser")}
                                >
                                    <span className="text-4xl">🚗</span>
                                    <span className="font-bold text-sm">Rental Provider</span>
                                    <span className="text-[10px] text-center text-base-content/40">Offer vehicles</span>
                                </div>
                            </div>
                            <input type="hidden" name="status" value={role} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-bold text-base-content/70">Full Name</span></label>
                                <input className="input input-bordered input-glass w-full" type="text" name="name" placeholder="John Doe" required />
                            </div>
                            {/* Profile Photo Upload */}
                            <div className="form-control">
                                <label className="label"><span className="label-text font-bold text-base-content/70">Profile Photo</span></label>
                                <div className="flex items-center gap-3">
                                    {photoPreview ? (
                                        <div className="relative group">
                                            <img src={photoPreview} alt="Preview" className="w-12 h-12 rounded-full object-cover ring-2 ring-primary/40" />
                                            <button
                                                type="button"
                                                onClick={() => { setPhotoPreview(null); setPhotoBase64(""); }}
                                                className="absolute -top-1 -right-1 w-5 h-5 bg-error rounded-full text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                            >×</button>
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-base-content/30">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-[180px] bg-transparent"
                                    />
                                </div>
                                <label className="label"><span className="label-text-alt text-base-content/30">Optional • Max 2MB</span></label>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-base-content/70">Email</span></label>
                            <input className="input input-bordered input-glass w-full" type="email" name="email" placeholder="your@email.com" required />
                        </div>

                        <div className="form-control">
                            <label className="label"><span className="label-text font-bold text-base-content/70">Password</span></label>
                            <input className="input input-bordered input-glass w-full" type="password" name="password" placeholder="••••••••" required />
                        </div>

                        <div className="form-control mt-8">
                            <button className={`btn btn-gradient btn-glow w-full text-lg shadow-lg ${loading ? 'loading' : ''}`} disabled={loading}>
                                {loading ? 'Creating account...' : 'Start My Journey →'}
                            </button>
                        </div>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-base-content/40 text-sm">
                            Already a traveler? <Link to="/login" className="link link-primary font-bold">Sign In</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Registration;