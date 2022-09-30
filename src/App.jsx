import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';

import './App.css'
import InputText from './components/InputText'

export default function App() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Noun-ify!
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ flexGrow: 1 }}>
          <Typography variant="subtitle2" component="div" sx={{ flexGrow: 1 }}>
            <i>version: 2022_sep14_rebuild2_app</i>
          </Typography>
          <InputText />
      </Box>
    </Box>
  );
}
