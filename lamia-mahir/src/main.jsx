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
				element: <Friends></Friends>,
			},
			{
				path: "/create",
				element: <CreatePage></CreatePage>,
			},
			{
				path: "/post/:id",
				element: <Post></Post>,
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
