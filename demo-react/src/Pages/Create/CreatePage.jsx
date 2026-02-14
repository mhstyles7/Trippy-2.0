import React, { useState } from "react";
import axios from "axios";

export default function CreatePage() {
	const user = JSON.parse(localStorage.getItem("user") || "{}");
	const userId = user._id;

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [images, setImages] = useState([{ id: 1, base64: "" }]);
	const [errorMessage, setErrorMessage] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);

	// Convert image to base64
	const convertToBase64 = (file, index) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const newImages = [...images];
			newImages[index].base64 = reader.result;
			setImages(newImages);
		};
		reader.readAsDataURL(file);
	};

	// Handle image change
	const handleImageChange = (e, index) => {
		const file = e.target.files[0];
		if (file) {
			convertToBase64(file, index);
		}
	};

	// Add new image input field
	const addImageInput = () => {
		setImages([...images, { id: images.length + 1, base64: "" }]);
	};

	// Remove image input field
	const removeImageInput = (index) => {
		const newImages = images.filter((_, i) => i !== index);
		setImages(newImages);
	};

	// Handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!title || !description) {
			setErrorMessage("Title and description are required");
			return;
		}

		setLoading(true);
		setErrorMessage("");
		setSuccessMessage("");

		try {
			const res = await axios.post("http://localhost:3000/create-post", {
				userId,
				title,
				description,
				images: images
					.filter((img) => img.base64)
					.map((img) => img.base64),
			});

			setSuccessMessage("Post created successfully!");
			setTitle("");
			setDescription("");
			setImages([{ id: 1, base64: "" }]);
		} catch (error) {
			setErrorMessage("Error creating post. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
			<div className="bg-white p-8 rounded shadow-lg w-full max-w-3xl">
				<h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
					Create a New Post
				</h1>

				{errorMessage && (
					<div className="bg-red-100 text-red-700 p-2 mb-4 rounded">
						{errorMessage}
					</div>
				)}
				{successMessage && (
					<div className="bg-green-100 text-green-700 p-2 mb-4 rounded">
						{successMessage}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Title Input */}
					<div>
						<label
							htmlFor="title"
							className="block text-lg font-medium text-gray-700"
						>
							Post Title
						</label>
						<input
							type="text"
							id="title"
							className="mt-1 p-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							required
						/>
					</div>

					{/* Description Input */}
					<div>
						<label
							htmlFor="description"
							className="block text-lg font-medium text-gray-700"
						>
							Post Description
						</label>
						<textarea
							id="description"
							rows="4"
							className="mt-1 p-2 w-full border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-indigo-200"
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							required
						/>
					</div>

					{/* Images Input */}
					<div>
						<label className="block text-lg font-medium text-gray-700">
							Images
						</label>
						{images.map((image, index) => (
							<div
								key={image.id}
								className="flex items-center space-x-4 mt-2"
							>
								<input
									type="file"
									accept="image/*"
									className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
									onChange={(e) =>
										handleImageChange(e, index)
									}
								/>

								{/* Preview and Remove Button */}
								{image.base64 && (
									<div className="flex items-center space-x-2">
										<img
											src={image.base64}
											alt={`Preview ${index}`}
											className="w-16 h-16 object-cover rounded-lg shadow-sm"
										/>
										<button
											type="button"
											className="text-red-500 hover:text-red-700"
											onClick={() =>
												removeImageInput(index)
											}
										>
											Remove
										</button>
									</div>
								)}
							</div>
						))}

						{/* Add another image */}
						<button
							type="button"
							className="mt-3 text-indigo-600 hover:text-indigo-800 focus:outline-none"
							onClick={addImageInput}
						>
							+ Add Another Image
						</button>
					</div>

					{/* Submit Button */}
					<div className="flex justify-center">
						<button
							type="submit"
							className={`px-6 py-2 rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 ${
								loading ? "opacity-50 cursor-not-allowed" : ""
							}`}
							disabled={loading}
						>
							{loading ? "Creating Post..." : "Create Post"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
