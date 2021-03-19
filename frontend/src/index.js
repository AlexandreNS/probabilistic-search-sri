import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom'

import CssBaseline from '@material-ui/core/CssBaseline';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline />
      <App />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

