import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Home from "./Pages/Home/Home";
import Login from "./Pages/Authentication/Login";
import Layout from "./Layout/Layout";
import Registration from "./Pages/Authentication/Registration";
import AuthOCR from "./Pages/Authentication/AuthOCR";
import AuthProvider from "./Pages/Authentication/AuthProvider";
import Friends from "./Pages/Friends/Friends";
import CreatePage from "./Pages/Create/CreatePage";
import Post from "./Pages/Home/Post";
import Profile from "./Pages/Profile/Profile";
import ProviderDashboard from "./Pages/Marketplace/ProviderDashboard";
import TravelerDashboard from "./Pages/Marketplace/TravelerDashboard";
import PrivateRoute from "./Pages/Authentication/PrivateRoute";
import Explore from "./Pages/Explore/Explore";
const router = createBrowserRouter([
	{
		path: "/",
		element: <Layout></Layout>,
		children: [
			{
				path: "/",
				element: <Home></Home>,
			},
			{
				path: "/ocr",
				element: <AuthOCR></AuthOCR>,
			},
			{
				path: "/login",
				element: <Login></Login>,
			},
			{
				path: "/register",
				element: <Registration></Registration>,
			},
			{
				path: "/friends",
				element: <PrivateRoute><Friends></Friends></PrivateRoute>,
			},
			{
				path: "/create",
				element: <PrivateRoute><CreatePage></CreatePage></PrivateRoute>,
			},
			{
				path: "/profile",
				element: <PrivateRoute><Profile></Profile></PrivateRoute>,
			},
			{
				path: "/post/:id",
				element: <PrivateRoute><Post></Post></PrivateRoute>,
			},
			{
				path: "/provider-dashboard",
				element: <PrivateRoute><ProviderDashboard></ProviderDashboard></PrivateRoute>,
			},
			{
				path: "/traveler-dashboard",
				element: <PrivateRoute><TravelerDashboard></TravelerDashboard></PrivateRoute>,
			},
			{
				path: "/explore",
				element: <Explore></Explore>,
			},
		],
	},
]);

ReactDOM.createRoot(document.getElementById("root")).render(
	<React.StrictMode>
		<AuthProvider>
			<RouterProvider router={router} />
		</AuthProvider>
	</React.StrictMode>
);
