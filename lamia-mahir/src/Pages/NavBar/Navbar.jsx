import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
	// eslint-disable-next-line no-unused-vars
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const navigate = useNavigate();

	useEffect(() => {
		if (user && user._id) {
			setIsLoggedIn(true);
		} else {
			setIsLoggedIn(false);
		}
	}, [user]);

	return (
		<div className="navbar bg-base-100">
			<div className="flex-1">
				<a
					className="btn btn-ghost text-xl"
					onClick={() => navigate("/")}
				>
					Trippy | Your Travel Companion
				</a>
			</div>
			<div className="flex-none">
				<ul className="menu menu-horizontal px-1">
					<li className="">
						<NavLink to="/">Home</NavLink>
					</li>
					{!isLoggedIn ? (
						<li className="">
							<NavLink to="/login">Login</NavLink>
						</li>
					) : (
						""
					)}
					{!isLoggedIn ? (
						<li className="">
							<NavLink to="/register">Register</NavLink>
						</li>
					) : (
						""
					)}
					{isLoggedIn ? (
						<li className="">
							<NavLink to="/profile">Profile</NavLink>{" "}
						</li>
					) : (
						""
					)}
					{!isLoggedIn ? (
						<li className="">
							<NavLink to="/ocr">Verification OCR</NavLink>{" "}
						</li>
					) : (
						""
					)}
					{isLoggedIn ? (
						<li className="">
							<NavLink
								onClick={() => {
									localStorage.removeItem("user");
								}}
								to="/logout"
							>
								Logout
							</NavLink>
						</li>
					) : (
						""
					)}
					{isLoggedIn ? (
						<li className="">
							<NavLink to="/friends">Friends</NavLink>
						</li>
					) : (
						""
					)}
					{isLoggedIn ? (
						<li className="">
							<NavLink to="/create">Create Post</NavLink>
						</li>
					) : (
						""
					)}
				</ul>
			</div>
		</div>
	);
};

export default Navbar;
