import { Outlet } from "react-router-dom";
import Navbar from "../Pages/NavBar/Navbar";
import VoiceFlowChat from "../Pages/AI/VoiceFlowChat";

const Layout = () => {
	return (
		<div>
			<Navbar></Navbar>
			<VoiceFlowChat />
			<Outlet></Outlet>
		</div>
	);
};

export default Layout;
