//Add Location Page basically

import * as React from 'react';
import { useRef } from 'react';
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
import useScript from '../useScript';
import addMarker from '../Googlemaps';

//const GOOGLE_MAPS_API_KEY = 'AIzaSyBqrs-129j8wgl9PH0bDr67r91fAS_3a7I';

    //On click button function (needs more testing)
// function addMarker(){
//   var destination = document.getElementById('to').value;
      
//   let destiMarkers = new AdvancedMarkerElement({
//           map,
//           position: destination,
//           icon: "https://img.icons8.com/nolan/2x/marker.png"
//       });
//   }
//   //End of button function
//                <SearchIcon color="inherit" sx={{ display: 'block', my: 5 }} />


export default function Content() {
  const mapRef = useRef(null);

  const handleAddLocation = (event) => {
    event.preventDefault();
    const input = document.getElementById('to').value;
    if (input && mapRef.current) {
      mapRef.current.addMarker(input);
      document.getElementById('to').value = '';
    }
  };

  const handleRefresh = () => {
    document.getElementById('to').value = '';
  };

  return (
    <>
      <Paper sx={{width: '100%', margin: 'auto', overflow: 'hidden'}}>        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{ borderBottom: '1px solid rgba(0, 0, 0, 0.12)',  mx: 1, my: 2 }}
        >
          <Toolbar>
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
              <SearchIcon color="inherit" sx={{ display: 'block', my: 4, mx: 1 }} />
              </Grid>
              
              <Grid item xs>
              <form onSubmit={handleAddLocation}>
                  <TextField
                    id="to"
                    label="Where to go?"
                    InputProps={{
                      disableUnderline: true,
                      sx: { fontSize: 'default',  },
                    }}
                    helperText="The locations chosen here will guide your Community Feed experience"
                    variant="outlined"
                  />
                  <Button type="submit" variant="contained" sx={{ mr: 1, mx: 2, my: 1 }}>
                    Add location
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
          No current locations set
        </Typography>
      </Paper>
      <Paper sx={{ width: '100%', margin: 'auto', overflow: 'hidden', my: 2, mx: 2 }}>
        <Typography color="text.secondary" align="left" sx={{ mx: 2, my: 2 }}>Your next trips:</Typography>
        <GoogleMap sx={{ my: 5 }} />
      </Paper>
    </>
  );
}
/*
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField id="from" label="Your location" variant="outlined" fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField id="too" label="Where to go?" variant="outlined" fullWidth />
          </Grid>
        </Grid>
*/