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
			const res = await axios.get(
				`http://localhost:3000/friend-suggestions/${userId}`
			);
			setSuggestions(res.data);
		} catch (err) {
			setErrorMessage("Error fetching suggestions");
		} finally {
			setLoading(false);
		}
	};

	const fetchReceivedRequests = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`http://localhost:3000/received-requests/${userId}`
			);
			setReceivedRequests(res.data);
		} catch (err) {
			setErrorMessage("Error fetching received requests");
		} finally {
			setLoading(false);
		}
	};

	const fetchSentRequests = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`http://localhost:3000/sent-requests/${userId}`
			);
			setSentRequests(res.data);
		} catch (err) {
			setErrorMessage("Error fetching sent requests");
		} finally {
			setLoading(false);
		}
	};

	const fetchFriends = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`http://localhost:3000/friends/${userId}`
			);
			setFriends(res.data);
		} catch (err) {
			setErrorMessage("Error fetching friends");
		} finally {
			setLoading(false);
		}
	};

	const sendFriendRequest = async (receiverId) => {
		setLoading(true);
		try {
			await axios.post("http://localhost:3000/friend-request", {
				senderId: userId,
				receiverId,
			});
			setSuccessMessage("Friend request sent");
			fetchSuggestions();
			fetchSentRequests();
		} catch (err) {
			setErrorMessage("Error sending friend request");
		} finally {
			setLoading(false);
		}
	};

	const acceptRequest = async (senderId) => {
		setLoading(true);
		try {
			await axios.post("http://localhost:3000/accept-request", {
				userId,
				senderId,
			});
			setSuccessMessage("Friend request accepted");
			fetchReceivedRequests();
		} catch (err) {
			setErrorMessage("Error accepting request");
		} finally {
			setLoading(false);
		}
	};

	const rejectRequest = async (requesterId) => {
		setLoading(true);
		try {
			await axios.post("http://localhost:3000/reject-request", {
				userId,
				requesterId,
			});
			setSuccessMessage("Friend request rejected");
			fetchReceivedRequests();
		} catch (err) {
			setErrorMessage("Error rejecting request");
		} finally {
			setLoading(false);
		}
	};

	const removeFriend = async (friendId) => {
		setLoading(true);
		try {
			await axios.post(`http://localhost:3000/remove-friend`, {
				userId,
				friendId,
			});
			setSuccessMessage("Friend removed");
			fetchFriends();
		} catch (err) {
			setErrorMessage("Error removing friend");
		} finally {
			setLoading(false);
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

	return (
		<div className="min-h-screen bg-gray-100 p-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold text-center text-indigo-600 mb-4">
					Friends Dashboard
				</h1>

				{errorMessage && (
					<div className="bg-red-100 text-red-600 p-2 rounded mb-4">
						{errorMessage}
					</div>
				)}

				{successMessage && (
					<div className="bg-green-100 text-green-600 p-2 rounded mb-4">
						{successMessage}
					</div>
				)}

				<div className="bg-white p-4 rounded-lg shadow-md mb-6">
					<h2 className="text-xl font-semibold text-indigo-600 mb-2">
						Friend Suggestions
					</h2>
					{loading && <div>Loading...</div>}
					{suggestions.length > 0 ? (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							{suggestions.map((suggestion) => (
								<div
									key={suggestion._id}
									className="bg-gray-50 p-4 rounded-lg shadow"
								>
									<div className="text-center mb-2">
										<img
											src={
												suggestion.photoURL ||
												"https://via.placeholder.com/150"
											}
											alt={suggestion.name}
											className="w-16 h-16 rounded-full mx-auto mb-2"
										/>
										<p className="text-gray-700 font-semibold">
											{suggestion.name}
										</p>
									</div>
									<button
										className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
										onClick={() =>
											sendFriendRequest(suggestion._id)
										}
									>
										Send Friend Request
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-gray-600">
							No suggestions available
						</p>
					)}
				</div>

				<div className="bg-white p-4 rounded-lg shadow-md mb-6">
					<h2 className="text-xl font-semibold text-indigo-600 mb-2">
						Received Friend Requests
					</h2>
					{loading && <div>Loading...</div>}
					{receivedRequests.length > 0 ? (
						receivedRequests.map((request) => (
							<div
								key={request._id}
								className="flex justify-between items-center p-4 border-b"
							>
								<div className="flex items-center space-x-4">
									<img
										src={
											request.photoURL ||
											"https://via.placeholder.com/150"
										}
										alt={request.name}
										className="w-12 h-12 rounded-full"
									/>
									<p className="text-gray-700 font-semibold">
										{request.name}
									</p>
								</div>
								<div>
									<button
										className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600"
										onClick={() =>
											acceptRequest(request._id)
										}
									>
										Accept
									</button>
									<button
										className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
										onClick={() =>
											rejectRequest(request._id)
										}
									>
										Reject
									</button>
								</div>
							</div>
						))
					) : (
						<p className="text-gray-600">No received requests</p>
					)}
				</div>

				<div className="bg-white p-4 rounded-lg shadow-md mb-6">
					<h2 className="text-xl font-semibold text-indigo-600 mb-2">
						Sent Friend Requests
					</h2>
					{loading && <div>Loading...</div>}
					{sentRequests.length > 0 ? (
						sentRequests.map((request) => (
							<div
								key={request._id}
								className="flex items-center p-4 border-b"
							>
								<div className="flex items-center space-x-4">
									<img
										src={
											request.photoURL ||
											"https://via.placeholder.com/150"
										}
										alt={request.name}
										className="w-12 h-12 rounded-full"
									/>
									<p className="text-gray-700 font-semibold">
										{request.name}
									</p>
								</div>
							</div>
						))
					) : (
						<p className="text-gray-600">No sent requests</p>
					)}
				</div>

				<div className="bg-white p-4 rounded-lg shadow-md mb-6">
					<h2 className="text-xl font-semibold text-indigo-600 mb-2">
						Your Friends
					</h2>
					{loading && <div>Loading...</div>}
					{friends.length > 0 ? (
						friends.map((friend) => (
							<div
								key={friend._id}
								className="flex items-center p-4 border-b"
							>
								<div className="flex items-center space-x-4">
									<img
										src={
											friend.photoURL ||
											"https://via.placeholder.com/150"
										}
										alt={friend.name}
										className="w-12 h-12 rounded-full"
									/>
									<p className="text-gray-700 font-semibold">
										{friend.name}
									</p>
								</div>
								<button
									className="ml-auto bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
									onClick={() => removeFriend(friend._id)}
								>
									Remove Friend
								</button>
							</div>
						))
					) : (
						<p className="text-gray-600">You have no friends yet</p>
					)}
				</div>
			</div>
		</div>
	);
}
