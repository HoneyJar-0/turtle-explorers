// theme.ts
import { createTheme } from '@mui/material/styles';

export enum useStyles{
    inventory = "inventory",
    inventoryItem = "inventoryItem",
    selected = "selected"
}

const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '.inventory': {
            position: 'absolute',
            top: 100,
            left: 0,
            background: '#252525',
            height: 200,
            width: 200,
            zIndex: 10,
            borderRadius: 5,
            overflow: 'hidden'
        },
        '.inventoryItem':{
            width: '25%',
            height: '25%'
        },
        '.MuiPaper-root': {
                height: '100%',
                width: '100%',
                border: '2px solid transparent'
        },
        '.selected': {
            borderColor: 'white'
        }
      },
    },
  },
});

export default theme;
