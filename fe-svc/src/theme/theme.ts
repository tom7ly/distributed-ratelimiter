import { ThemeOptions, createTheme } from "@mui/material/styles";
declare module "@mui/material/styles" {
  interface Palette {
    backgroundBlack?: Palette['primary'];
    border: Palette['primary'];
    primaryAlt: Palette['primary'];
    textPlaceHolder: Palette['primary'];
  }
  interface PaletteOptions {
    backgroundBlack: PaletteOptions['primary'];
    border: PaletteOptions['primary'];
    primaryAlt: PaletteOptions['primary'];
    textPlaceHolder: PaletteOptions['primary'];
  }
}
const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#7ec5ff",
    },
    secondary: {
      main: "#c7e6ff",
    },
    background: {
      default: "#323232ff",
      paper: "#212121a3",
    },
    success: {
      main: "#00ffcc",
    },
    info:{
      main: "#424242"
    },
    error: {
      main: "#ff5aaa",
    },
    backgroundBlack: {
      main: "#111111a3",
    },
    border: {
      main: "#424242",
    },
    primaryAlt:{
      main: "#233a4c"
    },
    textPlaceHolder: {
      main: "#5c5c5c",
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: "#212121a3",
          color: "#7ec5ff",
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "#7ec5ff",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: `
        *::-webkit-scrollbar {
          width: 6px; 
          border-radius: 6px;
        }
        *::-webkit-scrollbar-thumb {
          background-color: #757575; 
          border-radius: 6px;
          background-clip: padding-box;
          background-origin: content-box;
          backgroundColor:"transparent";

        }

        *::-webkit-scrollbar-track {
          border-radius: 6px;
        }
      `,
    },
  },
};
const theme = createTheme(themeOptions);

export default theme;
