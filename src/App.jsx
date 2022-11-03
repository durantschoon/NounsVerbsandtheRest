import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';

import './App.css'
import PoemView from './components/PoemView'

const theme = createTheme({
    palette: {
        primary: {
            main: '#807b67',
        },
        secondary: {
            main: '#f8f7f6',
        },
    }, 
    components: {
        MuiFormControl: {
            styleOverrides: {
                // Name of the slot
                root: {
                    // Some CSS
                    margin: '4px'
                }
            }
        }
      }
    });

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              Nouns, Verbs and the Rest
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flexGrow: 1 }}>
          <PoemView />
        </Box>
      </Box>
    </ThemeProvider>
  );
}
