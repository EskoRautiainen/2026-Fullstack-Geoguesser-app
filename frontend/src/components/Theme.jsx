// --------------------------------------------------------------------------------------------------------------------}
//        APP THEME (dark, yellow accent)
//  -------------------------------------------------------------------------------------------------------------------}
import { createTheme } from "@mui/material/styles";

const Theme = createTheme({
    palette: {
        mode: "dark",
        primary: { main: "#facc15" },
        background: { default: "#141518", paper: "#1d1f24" },
    },
    shape: { borderRadius: 10 },
    typography: {
        fontFamily: "system-ui, 'Segoe UI', Roboto, sans-serif",
        button: { textTransform: "none", fontWeight: 600 },
    },
    components: {
        MuiPaper: { styleOverrides: { root: { backgroundImage: "none" } } },
    },
});

export default Theme;
