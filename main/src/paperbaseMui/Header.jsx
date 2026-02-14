import * as React from 'react';
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import HelpIcon from '@mui/icons-material/Help';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

const lightColor = 'rgba(255, 255, 255, 0.7)';

function Header(props) {
  const { onDrawerToggle, selectedTab, onTabChange } = props;

  return (
    <React.Fragment>
      <AppBar color="primary" position="sticky" elevation={0} sx = {{width: '100%', margin: 'auto', overflow: 'hidden'}}>
        <Toolbar >
          <Grid container spacing={12} alignItems="center" >
            <Grid sx={{ display: { sm: 'none', xs: 'block' } }} item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Link
                href="/"
                variant="body1"
                sx={{
                  mx: 10,
                  textDecoration: 'none',
                  color: '#ffffff',
                  '&:hover': {
                    color: 'common.white',
                  },
                }}
                rel="noopener noreferrer"
                target="_blank"
              >
                Trippy!
              </Link>
            </Grid>
            <Grid item>
              <Tooltip title="Alerts • No alerts">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <IconButton color="inherit" sx={{ p: 0.5 }}>
                <Avatar src="/static/images/avatar/1.jpg" alt="My Avatar" />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        color="primary"
        position="static"
        elevation={0}
        sx={{ zIndex: 0, width: '100%', margin: 'auto', overflow: 'hidden'}}
      >
        <Toolbar>
          <Grid container alignItems="center" spacing={10} >
            <Grid item xs>
              <Typography color="inherit" variant="header" component="h2">
                Your Tripping Community</Typography>
            </Grid>
            <Grid item>
              <Button
                sx={{ borderColor: lightColor, xs: 2}}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Logout
              </Button>
            </Grid>
            <Grid item>
              <Tooltip title="Help">
                <IconButton color="inherit">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar component="div" position="static" elevation={0} sx={{ zIndex: 0,  }}>
      <Tabs value={selectedTab} onChange={onTabChange} textColor="inherit" centered>
          <Tab label="Community Feed" />
          <Tab label="Post"/>
          <Tab label="Add friends" />
          <Tab label="Favourtie Locations" />
          <Tab label="Rent a car" />
        </Tabs>
      </AppBar>
    </React.Fragment>
  );
}

Header.propTypes = {
  onDrawerToggle: PropTypes.func.isRequired,
};

export default Header;
