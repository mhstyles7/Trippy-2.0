import React, { useState, useEffect } from "react";
import axios from "axios";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]); // Stores the search results
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user._id;
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    } else {
      fetchReceivedRequests();
      fetchSentRequests();
      fetchFriends();
    }
  }, [userId]);

  const fetchReceivedRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/received-requests/${userId}`
      );
      setReceivedRequests(res.data);
    } catch (err) {
      setErrorMessage("Error fetching received requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchSentRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://localhost:3000/sent-requests/${userId}`
      );
      setSentRequests(res.data);
    } catch (err) {
      setErrorMessage("Error fetching sent requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/friends/${userId}`);
      setFriends(res.data);
    } catch (err) {
      setErrorMessage("Error fetching friends");
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (receiverId) => {
    setLoading(true);
    try {
      await axios.post("http://localhost:3000/friend-request", {
        senderId: userId,
        receiverId,
      });
      setSuccessMessage("Friend request sent");
      handleSearch(); // Refetch the search results after sending a friend request
    } catch (err) {
      setErrorMessage("Error sending friend request");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    if (!searchQuery.trim()) {
      setErrorMessage("Please enter a valid search query");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`http://localhost:3000/search-users`, {
        params: { name: searchQuery }, // Searching by name only
      });
      setSearchResults(res.data);
      setErrorMessage("");
    } catch (err) {
      setErrorMessage("Error searching users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 936, margin: "auto", overflow: "hidden" }}>
      <AppBar
        position="static"
        color="default"
        elevation={0}
        sx={{ borderBottom: "1px solid rgba(0, 0, 0, 0.12)" }}
      >
        <Toolbar>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <SearchIcon color="inherit" sx={{ display: "block" }} />
            </Grid>
            <Grid item xs>
              <TextField
                fullWidth
                placeholder="Search by name"
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: "default" },
                }}
                variant="standard"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Grid>
            <Grid item>
              <Button variant="contained" sx={{ mr: 1 }} onClick={handleSearch}>
                Search
              </Button>
              <Tooltip title="Reload">
                <IconButton onClick={handleSearch}>
                  <RefreshIcon color="inherit" sx={{ display: "block" }} />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>

      {loading && (
        <Typography sx={{ my: 5, mx: 2 }} color="text.secondary" align="center">
          <CircularProgress />
        </Typography>
      )}

      {errorMessage && (
        <Typography color="error" align="center">
          {errorMessage}
        </Typography>
      )}

      {successMessage && (
        <Typography color="success" align="center">
          {successMessage}
        </Typography>
      )}

      {/* Display search results only when there's a search query */}
      {searchResults.length > 0 && (
        <>
          <Typography sx={{ my: 5, mx: 2 }} color="text.secondary" align="center">
            Found {searchResults.length} user(s)
          </Typography>

          <Grid container spacing={2} sx={{ p: 2 }}>
            {searchResults.map((user) => (
              <Grid item xs={12} md={6} lg={4} key={user._id}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar
                          alt={user.name}
                          src={user.photoURL || "https://via.placeholder.com/150"}
                        />
                      </Grid>
                      <Grid item xs>
                        <Typography>{user.name}</Typography>
                        <Typography variant="body2">{user.email}</Typography>
                      </Grid>
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => sendFriendRequest(user._id)}
                        >
                          Add Friend
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Display received friend requests */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Received Friend Requests
      </Typography>
      <Grid container spacing={2}>
        {receivedRequests.map((request) => (
          <Grid item xs={12} key={request._id}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      alt={request.name}
                      src={request.photoURL || "https://via.placeholder.com/150"}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography>{request.name}</Typography>
                    <Typography variant="body2">{request.email}</Typography>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="success">
                      Accept
                    </Button>
                    <Button variant="contained" color="error" sx={{ ml: 1 }}>
                      Reject
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Display friends */}
      <Typography variant="h6" sx={{ mt: 4 }}>
        Friends
      </Typography>
      <Grid container spacing={2}>
        {friends.map((friend) => (
          <Grid item xs={12} key={friend._id}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      alt={friend.name}
                      src={friend.photoURL || "https://via.placeholder.com/150"}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography>{friend.name}</Typography>
                    <Typography variant="body2">{friend.email}</Typography>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="error">
                      Remove
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}
