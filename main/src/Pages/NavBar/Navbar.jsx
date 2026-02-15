import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const Navbar = ({ isSidebar = false }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const user = JSON.parse(localStorage.getItem("user") || "{}");

	useEffect(() => {
		if (user && user._id) {
			setIsLoggedIn(true);
			setIsVerified(user.verifyOCR === true);
		} else {
			setIsLoggedIn(false);
			setIsVerified(false);
		}
	}, [user]);

	const linkClass = ({ isActive }) =>
		`${isActive ? "bg-primary/20 text-primary font-bold" : "text-base-content/70 hover:text-primary hover:bg-primary/10"} transition-all duration-200 rounded-lg`;

	const navItems = (
		<>
			<li><NavLink to="/" className={linkClass}>🏠 Home</NavLink></li>
			{!isLoggedIn && (
				<>
					<li><NavLink to="/login" className={linkClass}>🔑 Login</NavLink></li>
					<li><NavLink to="/register" className={linkClass}>📝 Register</NavLink></li>
				</>
			)}
			{isLoggedIn && (
				<>
					<li><NavLink to="/friends" className={linkClass}>👥 Friends</NavLink></li>
					<li><NavLink to="/create" className={linkClass}>✍️ Create</NavLink></li>
					<li>
						<NavLink to={user.role === 'carRentalUser' ? "/provider-dashboard" : "/traveler-dashboard"} className={linkClass}>
							{user.role === 'carRentalUser' ? '💼 Business' : '✈️ Trips'}
						</NavLink>
					</li>
					<li><NavLink to="/profile" className={linkClass}>👤 Profile</NavLink></li>
					{!isVerified && (
						<li>
							<NavLink to="/ocr" className={linkClass}>
								<span className="relative">
									🪪 Verify
									<span className="absolute -top-1 -right-3 w-2 h-2 bg-warning rounded-full animate-pulse"></span>
								</span>
							</NavLink>
						</li>
					)}
					{isVerified && (
						<li>
							<span className="text-success/60 text-xs flex items-center gap-1 px-3 py-2" title="Identity Verified">
								✅ Verified
							</span>
						</li>
					)}
					<li>
						<NavLink
							onClick={() => localStorage.removeItem("user")}
							to="/login"
							className="text-error/70 hover:text-error hover:bg-error/10 transition-all duration-200 rounded-lg"
						>
							🚪 Logout
						</NavLink>
					</li>
				</>
			)}
		</>
	);

	if (isSidebar) return <>{navItems}</>;

	return (
		<ul className="menu menu-horizontal gap-1 px-1">
			{navItems}
		</ul>
	);
};

export default Navbar;
