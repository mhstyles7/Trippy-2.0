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
				navigate("/");
				if (res.data.role == "carRentalUser") {
					if (res.data.verifyOCR == true) {
						loginUser(`${res.data}`);
					} else {
						navigate("/verifyOCR");
					}
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
						<div className="form-control mt-8">
							<button className={`btn btn-gradient btn-glow w-full text-lg shadow-lg ${loading ? 'loading' : ''}`} disabled={loading}>
								{loading ? 'Signing in...' : 'Sign In'}
							</button>
						</div>

						<div className="divider text-base-content/20">OR</div>

						<Link to="/ocr" className="btn btn-outline border-white/10 btn-block gap-2 group hover:border-primary/30 hover:bg-primary/5">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
							</svg>
							Continue with NID / License
						</Link>
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
