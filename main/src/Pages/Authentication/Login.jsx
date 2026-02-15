/* eslint-disable no-unused-vars */
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import axios from "axios";

const Login = () => {
	const { loginUser } = useContext(AuthContext);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleUserLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		const form = e.target;
		const email = form.email.value;
		const password = form.password.value;
		const credentials = { email, password };

		try {
			const res = await axios.post("http://localhost:3000/login", credentials);
			if (res.status === 200) {
				loginUser(res.data);
				if (res.data.verifyOCR !== true) {
					navigate("/ocr");
				} else {
					navigate("/");
				}
				window.location.reload();
			} else {
				setError("Invalid credentials. Please try again.");
			}
		} catch (error) {
			setError("Login failed. Check your email and password.");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleLogin = () => {
		// Google OAuth — requires VITE_GOOGLE_CLIENT_ID in .env
		const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
		if (!clientId) {
			setError("Google login is not configured yet. Please use email/password.");
			return;
		}
		// Initialize Google Identity Services
		if (window.google && window.google.accounts) {
			window.google.accounts.id.initialize({
				client_id: clientId,
				callback: async (response) => {
					try {
						// Decode JWT to get user info
						const payload = JSON.parse(atob(response.credential.split('.')[1]));
						const googleUser = {
							email: payload.email,
							name: payload.name,
							photoURL: payload.picture,
							role: "traveler",
							googleAuth: true,
							verifyOCR: false,
						};
						let userData;
						// Try login first, then signup if not found
						try {
							const loginRes = await axios.post("http://localhost:3000/login", {
								email: payload.email,
								password: payload.sub, // Use Google ID as password
							});
							userData = loginRes.data;
						} catch {
							// User doesn't exist — create account
							await axios.post("http://localhost:3000/signup", {
								...googleUser,
								password: payload.sub,
							});
							const loginRes = await axios.post("http://localhost:3000/login", {
								email: payload.email,
								password: payload.sub,
							});
							userData = loginRes.data;
						}
						loginUser(userData);
						if (userData.verifyOCR !== true) {
							navigate("/ocr");
						} else {
							navigate("/");
						}
						window.location.reload();
					} catch (err) {
						setError("Google login failed. Please try email/password.");
						console.error(err);
					}
				},
			});
			window.google.accounts.id.prompt();
		} else {
			setError("Google login service is loading. Please try again in a moment.");
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-10">
			{/* Background Blobs */}
			<div className="floating-blob bg-primary w-96 h-96 top-[-15%] left-[-10%]"></div>
			<div className="floating-blob bg-secondary w-80 h-80 bottom-[-15%] right-[-10%]"></div>
			<div className="floating-blob bg-accent w-64 h-64 top-[50%] right-[20%] opacity-10"></div>

			<div className="card lg:card-side glass-panel max-w-4xl w-full shadow-2xl overflow-hidden animate-scale-in">
				{/* Left Panel */}
				<div className="w-full lg:w-1/2 p-10 lg:p-14 flex flex-col justify-center bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 relative">
					<div className="z-10">
						<span className="text-6xl mb-4 block">✈️</span>
						<h1 className="text-5xl font-display font-bold mb-4 gradient-text">
							Welcome<br />Back!
						</h1>
						<p className="text-lg text-base-content/50 mb-8 font-light leading-relaxed">
							Ready to explore the world? Sign in to continue your journey with Trippy.
						</p>
						<div className="hidden lg:block">
							<p className="text-sm text-base-content/30">
								Don't have an account? <br />
								<Link to="/register" className="link link-primary font-bold hover:text-glow">
									Join the community →
								</Link>
							</p>
						</div>
					</div>
				</div>

				{/* Right Panel — Form */}
				<div className="card-body w-full lg:w-1/2 bg-base-100/30 backdrop-blur-xl p-8 lg:p-12 flex flex-col justify-center">
					<h2 className="text-2xl font-bold mb-8 text-center lg:text-left">Sign In</h2>

					{error && (
						<div className="alert alert-error mb-6 text-sm">
							<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							<span>{error}</span>
						</div>
					)}

					<form onSubmit={handleUserLogin} className="space-y-5">
						<div className="form-control">
							<label className="label">
								<span className="label-text font-bold text-base-content/70">Email</span>
							</label>
							<input
								type="email"
								name="email"
								placeholder="your@email.com"
								className="input input-bordered input-glass w-full"
								required
							/>
						</div>
						<div className="form-control">
							<label className="label">
								<span className="label-text font-bold text-base-content/70">Password</span>
							</label>
							<input
								type="password"
								name="password"
								placeholder="••••••••"
								className="input input-bordered input-glass w-full"
								required
							/>
							<label className="label">
								<a href="#" className="label-text-alt link link-hover text-base-content/40 hover:text-primary">Forgot password?</a>
							</label>
						</div>
						<div className="form-control mt-6">
							<button className={`btn btn-gradient btn-glow w-full text-lg shadow-lg ${loading ? 'loading' : ''}`} disabled={loading}>
								{loading ? 'Signing in...' : 'Sign In'}
							</button>
						</div>

						<div className="divider text-base-content/20 text-xs">OR CONTINUE WITH</div>

						{/* Google Login */}
						<button
							type="button"
							onClick={handleGoogleLogin}
							className="btn btn-outline border-white/10 btn-block gap-3 group hover:border-primary/30 hover:bg-primary/5"
						>
							<svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
								<path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
								<path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
								<path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
								<path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
							</svg>
							Sign in with Google
						</button>
					</form>

					<div className="text-center mt-6 lg:hidden">
						<p className="text-base-content/50 text-sm">
							No account? <Link to="/register" className="link link-primary font-bold">Register here</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
