import React, { createContext, useContext, useEffect,  useState } from "react";
import { Socket, io } from "socket.io-client";
import { LogMessage, createLogMessage, createRateLimitEntry } from "../utils/logger";
const SERVER_URL = "http://localhost:4500"; 
export interface RateLimitEntry {
    clientId: string;
    info: RateLimitInfo[];
}

export interface RateLimitInfo {
    rlKey: string;
    data: {
        currentCount: number;
        limit: number;
        timeRemainingMs: number;
        resetTime: number;
        approved: boolean;
    };
}

export type SocketContextType = {
    logs: LogMessage[];
    rlEntries: Map<string, RateLimitEntry>;
    setLogs: React.Dispatch<React.SetStateAction<LogMessage[]>>;
    setRlEntries: React.Dispatch<React.SetStateAction<Map<string, RateLimitEntry>>>;
    timeoutsMap: Map<string, NodeJS.Timeout>;
    setTimeoutsMap: React.Dispatch<React.SetStateAction<Map<string, NodeJS.Timeout>>>;
    emitMessage: (event: string, data: any) => void;
};

export const SocketContext = createContext<SocketContextType | null>(null);
export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if (context === null) {
        throw new Error("useSchemaContext must be used within a SchemaProvider");
    }
    return context;
};
export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [logs, setLogs] = React.useState<LogMessage[]>([]);
    const [rlEntries, setRlEntries] = React.useState<Map<string, RateLimitEntry>>(new Map());
    const [timeoutsMap, setTimeoutsMap] = useState<Map<string, NodeJS.Timeout>>(new Map());
    const [socket, setSocket] = useState<Socket | null>(null);
    const emitMessage = (event: string, message: any) => {
        if (socket) {
            socket.emit(event, message);
        }
    };
    useEffect(() => {
        const socketIO = io(SERVER_URL);
        setSocket(socketIO);
        socketIO.on("connect", () => {
            console.log("Connected to server");
        });
        socketIO.on("error", (error) => {
            console.error("Error occurred with socket:", error);
        });
        socketIO.on("message", (data) => {
            console.log("Message from server:", data);
            const message = createLogMessage(data);
            const rlEntry = createRateLimitEntry(data);
            setLogs((prevLogs) => [message, ...prevLogs]);
            if (rlEntry) {
                setRlEntries((prevEntries) => {
                    const newEntries = new Map(prevEntries);
                    const existingEntry = newEntries.get(rlEntry.clientId) || { clientId: rlEntry.clientId, info: [] };
                    existingEntry.info=rlEntry.info;

                    newEntries.set(rlEntry.clientId, existingEntry);

                    //manageTimeout(rlEntry.info[0].rlKey, rlEntry.info[0].data.timeRemainingMs, newEntries, existingEntry);
                    return newEntries;
                });
            }
        });
        return () => { socketIO.disconnect(); };
    }, []);
    // Manage timeout logic encapsulated in a function
    /*
        function manageTimeout(rlKey: string, duration: number, entriesMap: Map<string, RateLimitEntry>, entry: RateLimitEntry) {
            if (timeouts.current.has(rlKey)) {
                const timeout = timeouts.current.get(rlKey);
                clearTimeout(timeout);
            }
            const timeout = setTimeout(() => {
                const updatedEntry = entriesMap.get(entry.clientId);
                if (updatedEntry) {
                    updatedEntry.info = updatedEntry.info.filter(info => info.rlKey !== rlKey);
                    entriesMap.set(entry.clientId, updatedEntry);
                    setRlEntries(new Map(entriesMap));
                }
            }, duration);
            timeouts.current.set(rlKey, timeout);
    
            // Update timeoutsMap state
            setTimeoutsMap(new Map(timeouts.current));
        }
    */
    return (
        <SocketContext.Provider value={{
            logs,
            rlEntries,
            setLogs,
            setRlEntries,
            timeoutsMap,
            setTimeoutsMap,
            emitMessage
        }}>
            {children}
        </SocketContext.Provider>
    );
};
