import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, LogIn, UserPlus, Users, PenSquare, ShoppingBag, Car, User, IdCard, CheckCircle, LogOut, Compass } from "lucide-react";

// eslint-disable-next-line react/prop-types
const Navbar = ({ isSidebar = false }) => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isVerified, setIsVerified] = useState(false);
	const [userRole, setUserRole] = useState('');
	const location = useLocation();

	// Re-read auth state on every route change (covers post-login redirect)
	useEffect(() => {
		const raw = localStorage.getItem("user");
		const user = raw ? JSON.parse(raw) : null;
		if (user && user._id) {
			setIsLoggedIn(true);
			setIsVerified(user.verifyOCR === true);
			setUserRole(user.role || '');
		} else {
			setIsLoggedIn(false);
			setIsVerified(false);
			setUserRole('');
		}
	}, [location.pathname]);

	const linkClass = ({ isActive }) =>
		`${isActive ? "bg-primary/20 text-primary font-bold" : "text-base-content/70 hover:text-primary hover:bg-primary/10"} transition-all duration-200 rounded-lg flex items-center gap-2`;

	const navItems = (
		<>
			<li><NavLink to="/" className={linkClass}><Home size={18} /> Home</NavLink></li>
			<li><NavLink to="/explore" className={linkClass}><Compass size={18} /> Explore</NavLink></li>
			{!isLoggedIn && (
				<>
					<li><NavLink to="/login" className={linkClass}><LogIn size={18} /> Login</NavLink></li>
					<li><NavLink to="/register" className={linkClass}><UserPlus size={18} /> Register</NavLink></li>
				</>
			)}
			{isLoggedIn && (
				<>
					<li><NavLink to="/friends" className={linkClass}><Users size={18} /> Friends</NavLink></li>
					<li><NavLink to="/create" className={linkClass}><PenSquare size={18} /> Create</NavLink></li>
					<li>
						<NavLink
							to={userRole === 'carRentalUser' ? "/provider-dashboard" : "/traveler-dashboard"}
							className={linkClass}
						>
							{userRole === 'carRentalUser' ? <Car size={18} /> : <ShoppingBag size={18} />}
							{userRole === 'carRentalUser' ? 'My Rentals' : 'Marketplace'}
						</NavLink>
					</li>
					<li><NavLink to="/profile" className={linkClass}><User size={18} /> Profile</NavLink></li>
					{!isVerified && (
						<li>
							<NavLink to="/ocr" className={linkClass}>
								<span className="relative flex items-center gap-2">
									<IdCard size={18} /> Verify
									<span className="absolute -top-1 -right-1 w-2 h-2 bg-warning rounded-full animate-pulse"></span>
								</span>
							</NavLink>
						</li>
					)}
					{isVerified && (
						<li>
							<span className="text-success/60 text-xs flex items-center gap-1 px-3 py-2" title="Identity Verified">
								<CheckCircle size={14} /> Verified
							</span>
						</li>
					)}
					<li>
						<NavLink
							onClick={() => {
								localStorage.removeItem("user");
								setIsLoggedIn(false);
							}}
							to="/login"
							className="text-error/70 hover:text-error hover:bg-error/10 transition-all duration-200 rounded-lg flex items-center gap-2"
						>
							<LogOut size={18} /> Logout
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
