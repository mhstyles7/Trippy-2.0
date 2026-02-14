import App from './App'
import './index.css'
import Paperbase from './paperbaseMui/Paperbase.jsx'
import React from 'react';
import ReactDOM from 'react-dom/client';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Layout from './Layout/Layout.jsx';
import { BrowserRouter } from 'react-router-dom';

const theme = createTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
    <Paperbase/>
    </BrowserRouter>
  </ThemeProvider>
  </React.StrictMode>,
)


