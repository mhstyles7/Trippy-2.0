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

	const convertToBase64 = (file, index) => {
		const reader = new FileReader();
		reader.onloadend = () => {
			const newImages = [...images];
			newImages[index].base64 = reader.result;
			setImages(newImages);
		};
		reader.readAsDataURL(file);
	};

	const handleImageChange = (e, index) => {
		const file = e.target.files[0];
		if (file) convertToBase64(file, index);
	};

	const addImageInput = () => {
		setImages([...images, { id: images.length + 1, base64: "" }]);
	};

	const removeImageInput = (index) => {
		setImages(images.filter((_, i) => i !== index));
	};

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
			await axios.post("http://localhost:3000/create-post", {
				userId,
				title,
				description,
				images: images.filter((img) => img.base64).map((img) => img.base64),
			});
			setSuccessMessage("🎉 Post published successfully!");
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
		<div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 animate-slide-up">
			<div className="w-full max-w-3xl">
				{/* Header */}
				<div className="text-center mb-10">
					<h1 className="section-title">Share Your Adventure</h1>
					<p className="text-base-content/50 text-lg">Tell the world about your latest journey</p>
				</div>

				<div className="glass-panel rounded-3xl p-8 md:p-12">
					{errorMessage && (
						<div className="alert alert-error mb-6 border-error/20">
							<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							<span>{errorMessage}</span>
						</div>
					)}
					{successMessage && (
						<div className="alert alert-success mb-6 border-success/20">
							<svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
							<span>{successMessage}</span>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title */}
						<div className="form-control">
							<label className="label"><span className="label-text font-bold text-base-content/70">Post Title</span></label>
							<input
								type="text"
								className="input input-bordered input-glass w-full text-lg"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="Give your adventure a name..."
								required
							/>
						</div>

						{/* Description */}
						<div className="form-control">
							<label className="label"><span className="label-text font-bold text-base-content/70">Your Story</span></label>
							<textarea
								rows="5"
								className="textarea textarea-bordered input-glass h-32 w-full text-base resize-none"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder="Share the details of your trip..."
								required
							/>
						</div>

						{/* Image Uploads */}
						<div className="form-control">
							<label className="label"><span className="label-text font-bold text-base-content/70">📸 Photos</span></label>
							<div className="space-y-3">
								{images.map((image, index) => (
									<div key={image.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
										<input
											type="file"
											accept="image/*"
											className="file-input file-input-bordered file-input-primary file-input-sm w-full max-w-xs bg-transparent"
											onChange={(e) => handleImageChange(e, index)}
										/>
										{image.base64 && (
											<div className="relative group">
												<img src={image.base64} alt={`Preview ${index}`} className="w-14 h-14 object-cover rounded-lg ring-1 ring-white/10" />
											</div>
										)}
										{images.length > 1 && (
											<button
												type="button"
												className="btn btn-ghost btn-circle btn-sm text-error/60 hover:text-error ml-auto"
												onClick={() => removeImageInput(index)}
												title="Remove"
											>
												<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
											</button>
										)}
									</div>
								))}
							</div>
							<button type="button" className="btn btn-outline btn-sm mt-4 gap-2 border-white/10 hover:bg-white/5" onClick={addImageInput}>
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
								Add Another Photo
							</button>
						</div>

						{/* Submit */}
						<div className="form-control mt-10">
							<button
								type="submit"
								className={`btn btn-gradient btn-glow w-full text-lg shadow-2xl shadow-primary/20 ${loading ? 'loading' : ''}`}
								disabled={loading}
							>
								{loading ? "Publishing..." : "✈️ Publish Post"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
