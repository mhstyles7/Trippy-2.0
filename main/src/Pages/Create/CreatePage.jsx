import React, { useState } from "react";
import axios from "axios";
import { AlertCircle, CheckCircle, Camera, Trash2, Plus, Send } from "lucide-react";

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
			setSuccessMessage("Post published successfully!");
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
						<div className="alert alert-error mb-6 border-error/20 flex items-center gap-2">
							<AlertCircle size={20} />
							<span>{errorMessage}</span>
						</div>
					)}
					{successMessage && (
						<div className="alert alert-success mb-6 border-success/20 flex items-center gap-2">
							<CheckCircle size={20} />
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
							<label className="label">
								<span className="label-text font-bold text-base-content/70 flex items-center gap-2">
									<Camera size={18} /> Photos
								</span>
							</label>
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
												<Trash2 size={18} />
											</button>
										)}
									</div>
								))}
							</div>
							<button type="button" className="btn btn-outline btn-sm mt-4 gap-2 border-white/10 hover:bg-white/5" onClick={addImageInput}>
								<Plus size={16} />
								Add Another Photo
							</button>
						</div>

						{/* Submit */}
						<div className="form-control mt-10">
							<button
								type="submit"
								className={`btn btn-gradient btn-glow w-full text-lg shadow-2xl shadow-primary/20 flex items-center justify-center gap-2 ${loading ? 'loading' : ''}`}
								disabled={loading}
							>
								{!loading && <Send size={20} />}
								{loading ? "Publishing..." : "Publish Post"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
