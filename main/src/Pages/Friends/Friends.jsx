import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Friends() {
	const [suggestions, setSuggestions] = useState([]);
	const [receivedRequests, setReceivedRequests] = useState([]);
	const [sentRequests, setSentRequests] = useState([]);
	const [friends, setFriends] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const userId = user._id;
	const navigate = useNavigate();

	const fetchSuggestions = async () => {
		setLoading(true);
		try {
			const res = await axios.get(`http://localhost:3000/friend-suggestions/${userId}`);
			setSuggestions(res.data);
		} catch (err) {
			setErrorMessage("Error fetching suggestions");
		} finally {
			setLoading(false);
		}
	};

	const fetchReceivedRequests = async () => {
		try {
			const res = await axios.get(`http://localhost:3000/received-requests/${userId}`);
			setReceivedRequests(res.data);
		} catch (err) {
			setErrorMessage("Error fetching received requests");
		}
	};

	const fetchSentRequests = async () => {
		try {
			const res = await axios.get(`http://localhost:3000/sent-requests/${userId}`);
			setSentRequests(res.data);
		} catch (err) {
			setErrorMessage("Error fetching sent requests");
		}
	};

	const fetchFriends = async () => {
		try {
			const res = await axios.get(`http://localhost:3000/friends/${userId}`);
			setFriends(res.data);
		} catch (err) {
			setErrorMessage("Error fetching friends");
		}
	};

	const sendFriendRequest = async (receiverId) => {
		try {
			await axios.post("http://localhost:3000/friend-request", { senderId: userId, receiverId });
			setSuccessMessage("Friend request sent! 🎉");
			fetchSuggestions();
			fetchSentRequests();
		} catch (err) {
			setErrorMessage("Error sending friend request");
		}
	};

	const acceptRequest = async (senderId) => {
		try {
			await axios.post("http://localhost:3000/accept-request", { userId, senderId });
			setSuccessMessage("Friend request accepted! 🤝");
			fetchReceivedRequests();
			fetchFriends();
		} catch (err) {
			setErrorMessage("Error accepting request");
		}
	};

	const rejectRequest = async (requesterId) => {
		try {
			await axios.post("http://localhost:3000/reject-request", { userId, requesterId });
			setSuccessMessage("Request declined");
			fetchReceivedRequests();
		} catch (err) {
			setErrorMessage("Error rejecting request");
		}
	};

	const removeFriend = async (friendId) => {
		try {
			await axios.post("http://localhost:3000/remove-friend", { userId, friendId });
			setSuccessMessage("Friend removed");
			fetchFriends();
		} catch (err) {
			setErrorMessage("Error removing friend");
		}
	};

	useEffect(() => {
		if (!userId) {
			navigate("/login");
		} else {
			fetchSuggestions();
			fetchReceivedRequests();
			fetchSentRequests();
			fetchFriends();
		}
	}, [userId]);

	useEffect(() => {
		if (successMessage || errorMessage) {
			const timer = setTimeout(() => { setSuccessMessage(""); setErrorMessage(""); }, 3000);
			return () => clearTimeout(timer);
		}
	}, [successMessage, errorMessage]);

	return (
		<div className="min-h-screen p-4 md:p-8 animate-slide-up">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="section-title">Friends Dashboard</h1>
					<p className="text-base-content/50 text-lg">Connect with travelers around the globe</p>
				</div>

				{/* Alerts */}
				{errorMessage && (
					<div className="alert alert-error mb-6 animate-slide-down glass-panel border-error/20">
						<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span>{errorMessage}</span>
					</div>
				)}
				{successMessage && (
					<div className="alert alert-success mb-6 animate-slide-down glass-panel border-success/20">
						<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
						<span>{successMessage}</span>
					</div>
				)}

				{/* Suggestions */}
				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
						<span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-lg">✨</span>
						People You May Know
					</h2>
					<div className="glass-panel p-6 rounded-2xl">
						{loading && <div className="flex justify-center py-8"><span className="loading loading-infinity loading-lg text-primary"></span></div>}
						{suggestions.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{suggestions.map((s) => (
									<div key={s._id} className="glass-card p-5 flex flex-col items-center text-center group">
										<div className="avatar mb-3">
											<div className="w-20 h-20 rounded-full ring-2 ring-primary/30 ring-offset-base-100 ring-offset-2 group-hover:ring-primary transition-all">
												<img src={s.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={s.name} />
											</div>
										</div>
										<h3 className="font-bold text-sm mb-1">{s.name}</h3>
										<p className="text-xs text-base-content/40 mb-4">Traveler</p>
										<button className="btn btn-primary btn-sm btn-gradient btn-block" onClick={() => sendFriendRequest(s._id)}>
											Add Friend
										</button>
									</div>
								))}
							</div>
						) : !loading && (
							<div className="text-center py-12">
								<span className="text-4xl block mb-3">🌐</span>
								<p className="text-base-content/40">No suggestions available at the moment.</p>
							</div>
						)}
					</div>
				</section>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
					{/* Received Requests */}
					<section>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
							<span className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center text-lg">📩</span>
							Received Requests
							{receivedRequests.length > 0 && <span className="badge badge-secondary badge-sm">{receivedRequests.length}</span>}
						</h2>
						<div className="glass-panel p-6 rounded-2xl min-h-[280px]">
							{receivedRequests.length > 0 ? (
								<div className="space-y-3">
									{receivedRequests.map((r) => (
										<div key={r._id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
											<div className="flex items-center gap-4">
												<div className="avatar">
													<div className="w-12 h-12 rounded-full ring-1 ring-white/10">
														<img src={r.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={r.name} />
													</div>
												</div>
												<span className="font-bold text-sm">{r.name}</span>
											</div>
											<div className="flex gap-2">
												<button className="btn btn-success btn-circle btn-sm text-white hover:shadow-lg hover:shadow-success/20" onClick={() => acceptRequest(r._id)} title="Accept">
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
												</button>
												<button className="btn btn-error btn-circle btn-sm text-white hover:shadow-lg hover:shadow-error/20" onClick={() => rejectRequest(r._id)} title="Reject">
													<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full py-10">
									<span className="text-3xl mb-2">📭</span>
									<p className="text-base-content/40 text-sm">No pending requests</p>
								</div>
							)}
						</div>
					</section>

					{/* Friends List */}
					<section>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
							<span className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-lg">👥</span>
							Your Friends
							{friends.length > 0 && <span className="badge badge-accent badge-sm">{friends.length}</span>}
						</h2>
						<div className="glass-panel p-6 rounded-2xl min-h-[280px]">
							{friends.length > 0 ? (
								<div className="space-y-3">
									{friends.map((f) => (
										<div key={f._id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors">
											<div className="flex items-center gap-4">
												<div className="avatar">
													<div className="w-12 h-12 rounded-full ring-1 ring-accent/30">
														<img src={f.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={f.name} />
													</div>
												</div>
												<div>
													<span className="font-bold text-sm block">{f.name}</span>
													<span className="text-xs text-base-content/30">Online</span>
												</div>
											</div>
											<button className="btn btn-ghost btn-xs text-error/60 hover:text-error hover:bg-error/10" onClick={() => removeFriend(f._id)}>Unfriend</button>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full py-10">
									<span className="text-3xl mb-2">🌏</span>
									<p className="text-base-content/40 text-sm">Start connecting with travelers!</p>
								</div>
							)}
						</div>
					</section>
				</div>

				{/* Sent Requests */}
				<div className="collapse collapse-arrow glass-panel rounded-2xl border border-white/[0.06]">
					<input type="checkbox" />
					<div className="collapse-title text-lg font-bold flex items-center gap-3">
						📤 Sent Requests
						<span className="badge badge-outline badge-sm">{sentRequests.length}</span>
					</div>
					<div className="collapse-content">
						{sentRequests.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
								{sentRequests.map((r) => (
									<div key={r._id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
										<div className="avatar">
											<div className="w-8 h-8 rounded-full">
												<img src={r.photoURL || "https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"} alt={r.name} />
											</div>
										</div>
										<span className="text-sm font-medium">{r.name}</span>
										<span className="ml-auto text-xs text-base-content/30">Pending</span>
									</div>
								))}
							</div>
						) : (
							<p className="text-sm text-base-content/40 mt-2">No pending sent requests.</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
