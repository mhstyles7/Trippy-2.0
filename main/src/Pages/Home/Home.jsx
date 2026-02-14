import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/get-posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Grid container spacing={3} sx={{ padding: 3 }}>
      {posts.map((post) => (
        <Grid item xs={12} md={6} lg={4} key={post.post_id}>
          <Paper
            component={Link}
            to={`/post/${post.post_id}`}
            sx={{
              padding: 2,
              display: 'flex',
              flexDirection: 'column',
              textDecoration: 'none',
              ':hover': {
                boxShadow: 4,
                transform: 'scale(1.02)',
              },
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
            }}
          >
            <Box display="flex" alignItems="center" mb={2}>
              {post.userPhotoURL ? (
                <Avatar
                  src={post.userPhotoURL}
                  alt={post.userName}
                  sx={{
                    width: 56,
                    height: 56,
                    marginRight: 2,
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                />
              ) : (
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    marginRight: 2,
                    bgcolor: 'primary.main',
                  }}
                >
                  {post.userName[0]}
                </Avatar>
              )}
              <Typography variant="h6" color="textPrimary">
                {post.userName}
              </Typography>
            </Box>
            <Typography variant="h5" color="primary" gutterBottom>
              {post.post_title}
            </Typography>
            {/* Check if post_content exists before using substring */}
            <Typography variant="body1" color="textSecondary">
              {post.post_content ? post.post_content.substring(0, 100) + "..." : ""}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default Home;
