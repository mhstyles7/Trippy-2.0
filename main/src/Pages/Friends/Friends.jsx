import API_BASE from '../../api';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Sparkles, Globe, Mail, Inbox, Users, Send, Check, X, AlertCircle, CheckCircle2, MessageCircle } from "lucide-react";
import FriendChatModal from "./FriendChatModal";

export default function Friends() {
	const [suggestions, setSuggestions] = useState([]);
	const [receivedRequests, setReceivedRequests] = useState([]);
	const [sentRequests, setSentRequests] = useState([]);
	const [friends, setFriends] = useState([]);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [activeChatFriend, setActiveChatFriend] = useState(null);
	const [unreadCounts, setUnreadCounts] = useState({});
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const userId = user._id;
	const navigate = useNavigate();

	const fetchSuggestions = async () => {
		setLoading(true);
		try {
			const res = await axios.get(`${API_BASE}/friend-suggestions/${userId}`);
			setSuggestions(res.data);
		} catch { setErrorMessage("Error fetching suggestions"); }
		finally { setLoading(false); }
	};

	const fetchReceivedRequests = async () => {
		try {
			const res = await axios.get(`${API_BASE}/received-requests/${userId}`);
			setReceivedRequests(res.data);
		} catch { setErrorMessage("Error fetching received requests"); }
	};

	const fetchSentRequests = async () => {
		try {
			const res = await axios.get(`${API_BASE}/sent-requests/${userId}`);
			setSentRequests(res.data);
		} catch { setErrorMessage("Error fetching sent requests"); }
	};

	const fetchFriends = async () => {
		try {
			const res = await axios.get(`${API_BASE}/friends/${userId}`);
			setFriends(res.data);
		} catch { setErrorMessage("Error fetching friends"); }
	};

	const fetchUnread = async () => {
		try {
			const res = await axios.get(`${API_BASE}/friend-chat/unread/${userId}`);
			setUnreadCounts(res.data);
		} catch { /* silent */ }
	};

	const sendFriendRequest = async (receiverId) => {
		try {
			await axios.post(`${API_BASE}/friend-request`, { senderId: userId, receiverId });
			setSuccessMessage("Friend request sent!");
			fetchSuggestions(); fetchSentRequests();
		} catch { setErrorMessage("Error sending friend request"); }
	};

	const acceptRequest = async (senderId) => {
		try {
			await axios.post(`${API_BASE}/accept-request`, { userId, senderId });
			setSuccessMessage("Friend request accepted!");
			fetchReceivedRequests(); fetchFriends();
		} catch { setErrorMessage("Error accepting request"); }
	};

	const rejectRequest = async (requesterId) => {
		try {
			await axios.post(`${API_BASE}/reject-request`, { userId, requesterId });
			setSuccessMessage("Request declined");
			fetchReceivedRequests();
		} catch { setErrorMessage("Error rejecting request"); }
	};

	const removeFriend = async (friendId) => {
		try {
			await axios.post(`${API_BASE}/remove-friend`, { userId, friendId });
			setSuccessMessage("Friend removed");
			fetchFriends();
		} catch { setErrorMessage("Error removing friend"); }
	};

	useEffect(() => {
		if (!userId) {
			navigate("/login");
		} else {
			fetchSuggestions();
			fetchReceivedRequests();
			fetchSentRequests();
			fetchFriends();
			fetchUnread();
			const interval = setInterval(fetchUnread, 5000);
			return () => clearInterval(interval);
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
					<div className="alert alert-error mb-6 animate-slide-down glass-panel border-error/20 flex items-center gap-3">
						<AlertCircle size={20} className="text-error" />
						<span>{errorMessage}</span>
					</div>
				)}
				{successMessage && (
					<div className="alert alert-success mb-6 animate-slide-down glass-panel border-success/20 flex items-center gap-3">
						<CheckCircle2 size={20} className="text-success" />
						<span>{successMessage}</span>
					</div>
				)}

				{/* Suggestions */}
				<section className="mb-10">
					<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
						<span className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
							<Sparkles size={20} className="text-primary" />
						</span>
						People You May Know
					</h2>
					<div className="glass-panel p-6 rounded-2xl">
						{loading && <div className="flex justify-center py-8"><span className="loading loading-infinity loading-lg text-primary"></span></div>}
						{suggestions.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
								{suggestions.map((s) => (
									<div key={s._id} className="glass-card p-5 flex flex-col items-center text-center group">
										<div className="avatar mb-3">
											<div className="w-20 h-20 rounded-full ring-2 ring-primary/30 ring-offset-base-100 ring-offset-2 group-hover:ring-primary transition-all overflow-hidden">
												<img src={s.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.name}`} alt={s.name} />
											</div>
										</div>
										<h3 className="font-bold text-sm mb-1">{s.name}</h3>
										<p className="text-xs text-base-content/40 mb-4">{s.role === 'carRentalUser' ? 'Provider' : 'Traveler'}</p>
										<button className="btn btn-primary btn-sm btn-gradient btn-block" onClick={() => sendFriendRequest(s._id)}>
											Add Friend
										</button>
									</div>
								))}
							</div>
						) : !loading && (
							<div className="text-center py-12 flex flex-col items-center">
								<Globe size={48} className="text-primary/20 mb-3" />
								<p className="text-base-content/40">No suggestions available at the moment.</p>
							</div>
						)}
					</div>
				</section>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
					{/* Received Requests */}
					<section>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
							<span className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
								<Mail size={20} className="text-secondary" />
							</span>
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
													<div className="w-12 h-12 rounded-full ring-1 ring-white/10 overflow-hidden">
														<img src={r.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.name}`} alt={r.name} />
													</div>
												</div>
												<span className="font-bold text-sm">{r.name}</span>
											</div>
											<div className="flex gap-2">
												<button className="btn btn-success btn-circle btn-sm text-white hover:shadow-lg hover:shadow-success/20 flex items-center justify-center" onClick={() => acceptRequest(r._id)} title="Accept">
													<Check size={16} />
												</button>
												<button className="btn btn-error btn-circle btn-sm text-white hover:shadow-lg hover:shadow-error/20 flex items-center justify-center" onClick={() => rejectRequest(r._id)} title="Reject">
													<X size={16} />
												</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full py-10 text-center">
									<Inbox size={48} className="text-secondary/20 mb-2" />
									<p className="text-base-content/40 text-sm">No pending requests</p>
								</div>
							)}
						</div>
					</section>

					{/* Friends List */}
					<section>
						<h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
							<span className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
								<Users size={20} className="text-accent" />
							</span>
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
													<div className="w-12 h-12 rounded-full ring-1 ring-accent/30 overflow-hidden">
														<img src={f.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${f.name}`} alt={f.name} />
													</div>
												</div>
												<div>
													<span className="font-bold text-sm block">{f.name}</span>
													<span className="text-xs text-base-content/30">{f.role === 'carRentalUser' ? 'Provider' : 'Traveler'}</span>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<button
													className="relative btn btn-ghost btn-circle btn-sm text-primary/60 hover:text-primary hover:bg-primary/10"
													onClick={() => setActiveChatFriend(f)}
													title="Send Message"
												>
													<MessageCircle size={16} />
													{unreadCounts[f._id] > 0 && (
														<span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary rounded-full text-[9px] text-white flex items-center justify-center font-bold">
															{unreadCounts[f._id]}
														</span>
													)}
												</button>
												<button className="btn btn-ghost btn-xs text-error/60 hover:text-error hover:bg-error/10" onClick={() => removeFriend(f._id)}>Unfriend</button>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center h-full py-10 text-center">
									<Globe size={48} className="text-accent/20 mb-2" />
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
						<Send size={20} className="text-primary" />
						Sent Requests
						<span className="badge badge-outline badge-sm">{sentRequests.length}</span>
					</div>
					<div className="collapse-content">
						{sentRequests.length > 0 ? (
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mt-4">
								{sentRequests.map((r) => (
									<div key={r._id} className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl">
										<div className="avatar">
											<div className="w-8 h-8 rounded-full overflow-hidden">
												<img src={r.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.name}`} alt={r.name} />
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

			{/* Friend DM Chat Modal */}
			{activeChatFriend && (
				<FriendChatModal
					friend={activeChatFriend}
					currentUser={user}
					onClose={() => {
						setActiveChatFriend(null);
						fetchUnread();
					}}
				/>
			)}
		</div>
	);
}
