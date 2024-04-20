import { Box, Divider } from "@mui/material";
import { isEmpty } from "lodash";
import theme from "../theme/theme";
import { useSocketContext } from "./SocketProvider";
import Entry from "./sub-components/Entry";
import { EntryContextProvider } from "./sub-components/EntryProvider";

const RatelimitEntriesComponent = () => {
    const {  rlEntries } = useSocketContext();
    const entries = Array.from(rlEntries.values());
    return (
        <Box
            margin={2}
            border={1}
            justifyContent={"flex-start"}
            bgcolor={theme.palette.background.paper}
            borderColor={theme.palette.divider}
            borderRadius={2}
        >
            <Box
                display={"flex"}
                flexDirection={"row"}
                alignItems={"center"}
                gap={2}
                padding={1}
                borderBottom={1}
                overflow={"hidden"}
                borderColor={theme.palette.background.default}
            >
                Ratelimit Entries
                <Divider orientation="vertical" flexItem />
            </Box>
            <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"center"}
                bgcolor={theme.palette.background.paper}
                overflow={"auto"}
                textOverflow={"ellipsis"}
                padding={2}
                gap={2}
            >
                {!isEmpty(entries) ? entries.map((entry, index) => (

                    <Box key={index}>
                        <EntryContextProvider>
                            <Entry entry={entry} />
                        </EntryContextProvider>
                    </Box>
                )) :
                    <Box
                        padding={2}
                        display={"flex"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        height={"100%"}
                    >
                        No entries available
                    </Box>
                }
            </Box>
        </Box>
    );
};

export default RatelimitEntriesComponent;