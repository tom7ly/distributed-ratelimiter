import { Box } from "@mui/material";
import LogsComponent from "./components/LogsComponent";
import RatelimitEntriesComponent from "./components/RatelimitEntriesComponent";
import { SocketProvider } from "./components/SocketProvider";
import { SplitPane } from "./components/SplitPane";
import theme from "./theme/theme";

function App() {
  return (
    <Box
      overflow={"auto"}
      bgcolor={theme.palette.background.default}
    >
      <SocketProvider>
        <SplitPane leftComponent={<LogsComponent />} rightComponent={<RatelimitEntriesComponent />} />
      </SocketProvider>
    </Box>
  )
}
export default App;