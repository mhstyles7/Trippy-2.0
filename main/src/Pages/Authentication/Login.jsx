/* eslint-disable no-unused-vars */

import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthProvider";
import axios from "axios";

const Login = () => {
	const { loginUser } = useContext(AuthContext);
	const navigate = useNavigate();
	const handleUserLogin = async (e) => {
		e.preventDefault();
		console.log("Login form submitted");
		const form = e.target;
		const email = form.email.value;
		const password = form.password.value;
		const credentials = { email, password };

		try {
			const res = await axios.post(
				"http://localhost:3000/login",
				credentials
			);
			if (res.status === 200) {
				console.log("Login successful");
				loginUser(res.data);
				navigate("/");
				if (res.data.role == "carRentalUser") {
					if (res.data.verifyOCR == true) {
						loginUser(`${res.data}`);
					} else {
						navigate("/verifyOCR");
					}
				}
				// reload the page
				window.location.reload();
			} else {
				console.log("Login Failed");
			}
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="px-6 my-52 rounded-xl bg-gradient-to-tr from-[#000080] to-[#0DD3FA] py-3">
			<h1 className="text-center text-[#FFE72F] my-10 text-5xl font-bold">
				Login your account
			</h1>
			<div className="my-12">
				<form onSubmit={handleUserLogin} className="md:w-3/4 mx-auto">
					<h1 className="mb-4 text-lg text-white">Your Email</h1>
					<input
						className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#0DD3FA]"
						type="email"
						name="email"
						id="1"
						placeholder="Enter email..."
						required
					/>
					<h1 className="mb-4 text-lg text-white">Your Password</h1>
					<input
						className="mb-4 rounded-lg px-6 py-3 w-full border border-solid border-[#0DD3FA]"
						type="password"
						name="password"
						id="2"
						placeholder="Enter password..."
						required
					/>
					<div className="form-control mt-4">
						<button className="btn btn-primary text-white font-semibold text-lg bg-[#FFE72F] border-none">
							Login
						</button>
					</div>

					<div className="flex mt-6 flex-col items-center text-white">
						<p className="mb-2 text-base font-medium">
							Dont Have Any Account?
							<Link to="/register">
								<span className="text-[#FFE72F] underline font-bold">
									{" "}
									Click Here to Register!
								</span>
							</Link>
						</p>
						{/* The "or" portion*/}
						<div>
							<div className="flex flex-row items-center w-full">
								<div className="border border-solid border-white w-48"></div>
								<p className="mx-4">or</p>
								<div className="border border-solid border-white w-48"></div>
							</div>
						</div>
						<Link to="/ocr">
							<div
								className="flex flex-row gap-4 my-2 w-72 items-center px-4 py-2 rounded-l-full rounded-r-full border border-solid border-[#FFE72F]"
								style={{ cursor: "pointer" }}
							>
								{/* <img src="https://img.icons8.com/color/48/000000/google-logo.png" alt="google" className="w-8 h-8"/> */}
								<p className="text-base font-medium">
									Continue with Your NID/ Driver License
								</p>
							</div>
						</Link>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
