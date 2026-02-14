import * as React from 'react';
import { useRef, useState } from 'react';
import axios from 'axios';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import GoogleMap from '../Googlemaps';

export default function RentACar() {
  const [distance, setDistance] = useState('');
  const [cost, setCost] = useState('');
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    days: '',
    distanceInKm: 0,
    calculatedCost: 0,
  });

  const mapRef = useRef(null);
  const directionsRenderer = useRef(null); // Ref for the directions renderer

  const handleAddLocation = (event) => {
    event.preventDefault();

    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const days = parseInt(document.getElementById('days').value, 10);

    if (mapRef.current && from && to) {
      const service = new window.google.maps.DistanceMatrixService();
      service.getDistanceMatrix(
        {
          origins: [from],
          destinations: [to],
          travelMode: 'DRIVING',
        },
        (response, status) => {
          if (status === 'OK') {
            const distanceInKm = response.rows[0].elements[0].distance.value / 1000;
            const calculatedCost = 2 * (distanceInKm * 10) + (days * 1000);

            setDistance(`Distance: ${distanceInKm.toFixed(2)} km`);
            setCost(`Total Cost: ${calculatedCost.toFixed(2)} TK`);

            // Store the data for submission
            setFormData({
              from,
              to,
              days,
              distanceInKm: distanceInKm.toFixed(2),
              calculatedCost: calculatedCost.toFixed(2),
            });

            setIsSubmitEnabled(true); // Enable submit button

            // Call the function to render the directions on the map
            renderDirections(from, to);
          } else {
            setDistance('Could not retrieve distance');
            setCost('');
            setIsSubmitEnabled(false); // Disable submit button on error
          }
        }
      );
    }
  };

  const renderDirections = (origin, destination) => {
    const directionsService = new window.google.maps.DirectionsService();

    directionsService.route(
      {
        origin: origin,
        destination: destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          if (directionsRenderer.current) {
            directionsRenderer.current.setMap(null); // Clear any previous directions
          }
          directionsRenderer.current = new window.google.maps.DirectionsRenderer();
          directionsRenderer.current.setDirections(response);
          directionsRenderer.current.setMap(mapRef.current); // Set the map for directions
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  const handleRefresh = () => {
    document.getElementById('to').value = '';
    document.getElementById('from').value = '';
    document.getElementById('days').value = '';
    setDistance('');
    setCost('');
    setIsSubmitEnabled(false);

    // Clear the directions from the map
    if (directionsRenderer.current) {
      directionsRenderer.current.setMap(null);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      const response = await axios.post('http://localhost:3000/rent-request', formData);
      alert('Request submitted successfully!');
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request.');
    }
  };

  return (
    <>
      <Paper sx={{ width: '100%', margin: 'auto', overflow: 'hidden' }}>
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)', mx: 1, my: 2 }}
        >
          <Toolbar>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <SearchIcon color="inherit" sx={{ display: 'block', my: 4, mx: 1 }} />
              </Grid>
              <Grid item xs>
                <form onSubmit={handleAddLocation}>
                  <TextField
                    id="from"
                    label="Pickup Point"
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: 'default' },
                    }}
                    variant="outlined"
                  />
                  <TextField
                    id="to"
                    label="Where to go?"
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: 'default' },
                    }}
                    variant="outlined"
                  />
                  <TextField
                    id="days"
                    label="Days of Rent"
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: 'default' },
                    }}
                    variant="outlined"
                  />
                  <Button type="submit" variant="contained" sx={{ mr: 1, mx: 2, my: 1 }}>
                    Calculate Fees
                  </Button>
                  <Tooltip title="Reload">
                    <IconButton onClick={handleRefresh}>
                      <RefreshIcon color="inherit" sx={{ display: 'block' }} />
                    </IconButton>
                  </Tooltip>
                </form>
              </Grid>
            </Grid>
          </Toolbar>
        </AppBar>
        <Typography sx={{ my: 5, mx: 2 }} color="text.secondary" align="center">
          {distance} <br /> {cost}
        </Typography>

        {/* Submit Request Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitRequest}
          disabled={!isSubmitEnabled}
          sx={{ display: 'block', mx: 'auto', my: 2 }}
        >
          Submit Request
        </Button>
      </Paper>

      <Paper sx={{ width: '100%', margin: 'auto', overflow: 'hidden', my: 2, mx: 2 }}>
        <GoogleMap
          onMapLoad={(map) => {
            mapRef.current = map;
          }}
        />
      </Paper>
    </>
  );
}
