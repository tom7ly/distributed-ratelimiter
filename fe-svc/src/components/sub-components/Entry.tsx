// InfoDisplay.tsx
import { Box, Divider, Typography } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import theme from "../../theme/theme";
import { RateLimitEntry } from "../SocketProvider";
import { useEntryContext } from "./EntryProvider";
export enum RateLimitStatus {
    APPROVED = "FORWARDING",
    REJECTED = "BLOCKING",
}

export const InfoDisplay: React.FC<{ info: any }> = ({ info }) => {
    const [timeRemaining, setTimeRemaining] = useState(info.data.timeRemainingMs / 1000);
    const timeRemainingRef = useRef(timeRemaining);
    const { setRlStates } = useEntryContext();
    useEffect(() => {
        timeRemainingRef.current = timeRemaining;
    }, [timeRemaining]);
    useEffect(() => {
        setTimeRemaining(info.data.timeRemainingMs / 1000);
        const interval = setInterval(() => {
            setTimeRemaining((prevTime) => {
                return prevTime - 0.1 > 0 ? prevTime - 0.1 : 0;
            });
            if (timeRemainingRef.current <= 0) {
                // use the ref here
                setRlStates((prevStates) => {
                    const newStates = new Map(prevStates);
                    newStates.set(info.rlKey, RateLimitStatus.APPROVED);
                    return newStates;
                });
                clearInterval(interval);
            }
        }, 100);
        if (info.data.currentCount >= info.data.limit) {
            setRlStates((prevStates) => {
                const newStates = new Map(prevStates);
                newStates.set(info.rlKey, RateLimitStatus.REJECTED);
                return newStates;
            });
        }
        return () => {
            clearInterval(interval);
        };
    }, [info]);
    return (
        <Box display={"flex"} flexDirection={"column"} justifyContent={"flex-start"} borderRadius={2} width={"100%"}>
            <Box display={"flex"} justifyContent={"space-between"}>
                <Typography fontSize={"0.8rem"} fontWeight={"bold"} width={200}>Ratelimitter</Typography>
                <Typography fontSize={"0.8rem"} fontWeight={"bold"}>{info.rlKey}</Typography>
            </Box>
            {timeRemaining ? (
                <Box>
                    <Box display={"flex"} justifyContent={"space-between"}>
                        <Typography fontSize={"0.8rem"} width={200}>
                            quota
                        </Typography>
                        <Typography fontSize={"0.8rem"}>
                            {info.data.currentCount}/{info.data.limit}
                        </Typography>
                    </Box>
                    <Box display={"flex"} justifyContent={"space-between"}>
                        <Typography fontSize={"0.8rem"} width={200}>
                            time remaining
                        </Typography>
                        <Typography fontSize={"0.8rem"}>{timeRemainingRef.current.toFixed(1)}s</Typography>
                    </Box>
                    <Box display={"flex"} justifyContent={"space-between"}>
                        <Typography fontSize={"0.8rem"} width={200}>
                            Status
                        </Typography>
                        <Typography
                            fontSize={"0.8rem"}
                            color={info.data.currentCount >= info.data.limit ? theme.palette.error.main : theme.palette.success.main}
                        >
                            {info.data.currentCount >= info.data.limit ? "Exceeded" : " Within Limit"}
                        </Typography>
                    </Box>
                </Box>
            ) : null}
        </Box>
    );
};

// Entry.tsx

export const Entry: React.FC<{ entry: RateLimitEntry }> = (props) => {
    const { entry } = props;
    const { rlStates } = useEntryContext();
    const blocking = entry.info.some((info) => rlStates.get(info.rlKey) === RateLimitStatus.REJECTED);
    useEffect(() => {
        console.log("Entry: ", entry);
    }, [entry]);
    return (
        <Box
            borderRadius={2}
            padding={1}
            border={1}
            borderColor={theme.palette.divider}

>
            <Box display={"flex"} flexDirection={"column"} gap={1} justifyContent={"center"} borderRadius={2}>
                <Box display={"flex"} justifyContent={"center"}>
                    <Typography fontSize={"0.8rem"} fontWeight={"bold"} width={200}>
                        Client{" "}
                    </Typography>
                    <Typography fontSize={"0.8rem"} fontWeight={"bold"} >{entry.clientId}</Typography>
                </Box>
                <Divider />
                {entry.info.map((info, index) => (
                    <Box display={"flex"} key={index}>
                        <InfoDisplay info={info} /> {/* Use InfoDisplay component */}
                    </Box>
                ))}
            </Box>
            <Box display={"flex"} justifyContent={"center"} alignItems={"center"} padding={1} borderRadius={2} width={"100%"}>
                <Typography fontSize={"0.8rem"} color={blocking ? theme.palette.error.main : theme.palette.success.main}>
                    {blocking ? "BLOCKING" : "FORWARDING"}
                </Typography>
            </Box>
        </Box>
    );
};

export default Entry;
