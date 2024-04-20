import { Box, Divider } from "@mui/material";
import { isEmpty } from "lodash";
import theme from "../theme/theme";
import { useSocketContext } from "./SocketProvider";
import { Log } from "./sub-components/Log";

const LogsComponent = () => {
    const { logs } = useSocketContext();

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
                Logs
                <Divider orientation="vertical" flexItem />
            </Box>
            <Box
                display={"flex"}
                flexDirection={"column"}
                justifyContent={"flex-start"}
                bgcolor={theme.palette.background.paper}
                overflow={"auto"}
                textOverflow={"ellipsis"}
                padding={2}
            >
                {!isEmpty(logs) ? logs.map((log) => (

                    <Box key={log.uuid}>
                        <Log log={log} />
                        <Divider />
                    </Box>
                )) :
                    <Box
                        padding={2}
                        display={"flex"}
                        justifyContent={"center"}
                        alignItems={"center"}
                        height={"100%"}
                    >
                        No logs to display
                    </Box>
                }
            </Box>
        </Box>
    );
};

export default LogsComponent;
