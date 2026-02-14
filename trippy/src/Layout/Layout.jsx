import { Outlet, Link } from "react-router-dom";
import Navbar from "../Pages/NavBar/Navbar";
import VoiceFlowChat from "../Pages/AI/VoiceFlowChat";

const Layout = () => {
	return (
		<div className="drawer">
			<input id="my-drawer-3" type="checkbox" className="drawer-toggle" />
			<div className="drawer-content flex flex-col min-h-screen">
				{/* Navbar */}
				<div className="w-full navbar glass-nav px-4 lg:px-8">
					<div className="flex-none lg:hidden">
						<label htmlFor="my-drawer-3" aria-label="open sidebar" className="btn btn-square btn-ghost">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-6 h-6 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
						</label>
					</div>
					<div className="flex-1 px-2 mx-2">
						<Link to="/" className="flex items-center gap-2 group">
							<span className="text-2xl">✈️</span>
							<span className="text-2xl font-bold gradient-text font-display group-hover:text-glow transition-all">Trippy</span>
						</Link>
					</div>
					<div className="flex-none hidden lg:block">
						<Navbar />
					</div>
				</div>

				{/* Page Content */}
				<main className="flex-grow animate-fade-in">
					<Outlet />
				</main>

				{/* Footer */}
				<footer className="footer footer-center p-10 glass-panel border-t border-white/[0.06] mt-auto">
					<aside>
						<p className="font-display text-xl font-bold gradient-text mb-2">Trippy</p>
						<p className="text-base-content/50 max-w-md">
							Your one-stop solution for social travel connectivity and efficient tour management. Connect, explore, and share your adventures.
						</p>
						<p className="text-base-content/30 text-sm mt-4">© {new Date().getFullYear()} Trippy. All rights reserved.</p>
					</aside>
					<nav>
						<div className="grid grid-flow-col gap-6">
							<a className="link link-hover text-base-content/50 hover:text-primary transition-colors" href="#">About</a>
							<a className="link link-hover text-base-content/50 hover:text-primary transition-colors" href="#">Privacy</a>
							<a className="link link-hover text-base-content/50 hover:text-primary transition-colors" href="#">Terms</a>
							<a className="link link-hover text-base-content/50 hover:text-primary transition-colors" href="#">Contact</a>
						</div>
					</nav>
				</footer>

				<VoiceFlowChat />
			</div>

			{/* Drawer Sidebar */}
			<div className="drawer-side z-50">
				<label htmlFor="my-drawer-3" aria-label="close sidebar" className="drawer-overlay"></label>
				<div className="w-80 min-h-full bg-base-100/95 backdrop-blur-2xl border-r border-white/[0.06]">
					<div className="p-6">
						<div className="flex items-center gap-2 mb-8">
							<span className="text-2xl">✈️</span>
							<span className="text-2xl font-bold gradient-text font-display">Trippy</span>
						</div>
						<ul className="menu gap-1">
							<Navbar isSidebar={true} />
						</ul>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Layout;
