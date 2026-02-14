import React, { useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Avatar,
  IconButton,
  CircularProgress,
} from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";

// Dummy data for posts, would typically come from a server
const initialPosts = [
  {
    id: 1,
    title: "Sample Post 1",
    description: "This is the first sample post.",
    images: [],
    author: "John Doe",
  },
  {
    id: 2,
    title: "Sample Post 2",
    description: "This is the second sample post.",
    images: [],
    author: "Jane Smith",
  },
];

export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id || "1"; // Default to 1 for demo

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([{ id: 1, base64: "" }]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState(initialPosts);

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
        images: images.filter((img) => img.base64).map((img) => img.base64),
      });

      const newPost = {
        id: posts.length + 1,
        title,
        description,
        images: images.filter((img) => img.base64),
        author: user.name || "You",
      };

      setPosts([newPost, ...posts]); // Add new post to the feed
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
    <Box display="flex" flexDirection="column" alignItems="center" p={2}>
      {/* Post Creation Section */}
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 600, mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Create a New Post
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Post Title"
            variant="outlined"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextField
            label="Post Description"
            variant="outlined"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          {images.map((image, index) => (
            <Box key={image.id} display="flex" alignItems="center" mt={2}>
              <Button
                variant="contained"
                component="label"
                startIcon={<AddPhotoAlternateIcon />}
              >
                Add Image
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageChange(e, index)}
                />
              </Button>
              {image.base64 && (
                <>
                  <img
                    src={image.base64}
                    alt={`Preview ${index}`}
                    style={{ width: "60px", height: "60px", marginLeft: "16px" }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeImageInput(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              )}
            </Box>
          ))}
          <Button color="primary" onClick={addImageInput}>
            + Add Another Image
          </Button>

          {errorMessage && (
            <Typography color="error" mt={2}>
              {errorMessage}
            </Typography>
          )}
          {successMessage && (
            <Typography color="success" mt={2}>
              {successMessage}
            </Typography>
          )}

          <Box mt={2} textAlign="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? "Creating Post..." : "Create Post"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
