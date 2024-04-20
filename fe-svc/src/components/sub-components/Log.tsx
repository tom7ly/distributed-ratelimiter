import { ContentCopy, ExpandLess } from "@mui/icons-material";
import { Box, BoxProps, Collapse, Tooltip, Typography } from "@mui/material";
import { isEmpty } from "lodash";
import React from "react";
import theme from "../../theme/theme";
import { LogMessage, LogType } from "../../utils/logger";
const getColorForLogType = (type: LogType) => {
    switch (type) {
        case LogType.DEFAULT:
            return "white";
        case LogType.RATE_LIMIT_INFO:
            return theme.palette.success.main;
        case LogType.RATE_LIMIT_ERROR:
            return theme.palette.error.main;
        case LogType.GATEWAY_INFO:
            return "lightgreen";
        case LogType.GATEWAY_ERROR:
            return "darkgreen";
        case LogType.SERVICE_INFO:
            return "orange";
        case LogType.SERVICE_ERROR:
            return "orange";

        default:
            return "white";
    }
};
export const Log: React.FC<{ log: LogMessage }> = (props) => {
    const { log } = props;
    const [open, setOpen] = React.useState(false);

    interface EntryComponentProps extends BoxProps {
        name: string;
        value: any;
        valueColor?: string;
    }

    const KeyValueComponent: React.FC<EntryComponentProps> = ({ name, value, valueColor, ...boxProps }) => {
        return (
            <Box display={"flex"} flexDirection={"row"} {...boxProps}>
                <Typography fontSize={"0.8rem"}  sx={{ userSelect: "none" }} width={200}>
                    {name}
                </Typography>
                <Typography fontSize={"0.8rem"}  color={valueColor}>{value}</Typography>
            </Box>
        );
    };
    const CopyButton: React.FC<{ value: any }> = (props) => {
        const { value } = props;
        const [copied, setCopied] = React.useState(false);
        const handleCopy = () => {
            navigator.clipboard.writeText(JSON.stringify(value));
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        };
        return (
            <Tooltip title={copied ? "Copied!" : "Copy"} arrow>
                <ContentCopy 
                    onClick={handleCopy}
                    sx={{
                        fontSize: "1rem",
                        color: theme.palette.secondary.main,
                        "&:hover": {
                            transform: "scale(1.2)",
                            transition: "transform 0.2s",
                            color: theme.palette.primary.main,
                            cursor: "pointer",
                        },
                    }}
                />
            </Tooltip>
        );
    };
    const CollapseIcon: React.FC = () => {
        return (
            <ExpandLess
                onClick={() => setOpen(!open)}
                sx={{
                    color: theme.palette.secondary.main,
                    "&:hover": {
                        transform: "scale(1.2)",
                        transition: "transform 0.2s",
                        color: theme.palette.primary.main,
                        cursor: "pointer",
                    },
                }}
            />
        );
    };
    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"center"}
            borderColor={theme.palette.border.main}
        >
            <Box
                padding={1}
                sx={{
                    "&:hover": {
                        cursor: "pointer",
                        backgroundColor: theme.palette.action.hover,
                    },
                }}
                display={"flex"}
                bgcolor={theme.palette.background.paper}
                alignItems={"center"}
                flexDirection={"row"}
                onClick={() => setOpen(!open)}
                borderBottom={1}
                borderColor={theme.palette.divider}
            >
                <Typography width={100} minWidth={100} fontSize={"0.8rem"} color={getColorForLogType(log.type)} sx={{ userSelect: "none" }}>
                    {log.serviceId}
                </Typography>
                <Typography fontSize={"0.7rem"} sx={{ userSelect: "none" }}>{log.message}</Typography>
            </Box>
            <Collapse in={open}>
                <Box pl={2} pb={2}                 >
                    <Box
                        display={"flex"}
                        mt={2}
                        pr={3}
                        flexDirection={"row"}
                        justifyContent={"flex-end"}
                        alignItems={"center"}
                        width={"100%"}
                    >
                        <CollapseIcon />
                    </Box>
                    <Box pb={0} pt={0}>
                        <Typography fontSize={"1rem"}  variant="h5" paddingBottom={1} sx={{ userSelect: "none" }}>
                            Metadata
                        </Typography>
                        <KeyValueComponent pl={2} name="Type" value={log.type} />
                        <KeyValueComponent pl={2} name="Origin URL" value={log.originUrl} />
                        <KeyValueComponent valueColor={getColorForLogType(log.type)} pl={2} name="Service ID" value={log.serviceId} />
                    </Box>
                    <Box pb={0} pl={2} pt={2} display={"flex"} flexDirection={"column"} height={300}>
                        <Box display={"flex"} gap={2} pl={1} justifyContent={"flex-start"} alignItems={"center"} pb={1} flexDirection={"row"}>
                            <CopyButton value={log.data} />

                            <Typography fontSize={"1rem"}  display={"flex"} width={100} variant="h5" sx={{ userSelect: "none" }}>Data</Typography>
                        </Box>
                        <Box
                            display={"flex"}
                            flexDirection={"column"}
                            justifyContent={"flex-start"}
                            alignItems={"flex-start"}
                            border={1}
                            borderColor={theme.palette.divider}
                            borderRadius={2}
                            padding={2}
                            bgcolor={theme.palette.background.paper}
                            overflow={"auto"}
                        >

                            <Box width={"100%"}>

                                <Typography
                                fontSize={"0.8rem"} 
                                    overflow={"auto"}
                                    style={{
                                        whiteSpace: "pre-wrap",
                                    }}
                                >
                                    {isEmpty(log.data) ? "No data" : JSON.stringify(log.data, null, 2)}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Collapse>
        </Box>
    );
};
