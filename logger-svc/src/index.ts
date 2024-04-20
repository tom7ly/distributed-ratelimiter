import axios from "axios";
import express, { Request, Response } from "express";
import Redis from "ioredis";
import { config } from "./config";
import sendLog, { LogMessage, LogType, startConsumer } from "./services/logger";
import http from "http";
import cors from "cors";
import { Server as IOServer } from "socket.io";
import { connect } from "socket.io-client";
import { EventEmitter } from 'events';
export const eventEmitter = new EventEmitter();
const app = express();
app.use(cors());

const server = http.createServer(app);
export const io = new IOServer(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
const main = async () => {
    io.on("connection", (socket) => {
        console.log("A user connected");

        eventEmitter.on('message', (data) => {
            socket.emit('message', data);
        });

        socket.on("disconnect", () => {
            console.log("A user disconnected");
        });
        socket.on("message", (msg: LogMessage) => {
            console.log("Message:", msg);
        });
    });
    app.use("/healthcheck", (req, res) => { res.status(200).send("OK"); })
    server.listen(config.PORT, () => {
        sendLog({
            type: LogType.LOGGER_INFO,
            message: `Server started on port ${config.PORT}`,
            data: { port: config.PORT, serviceId: config.HOSTNAME, url: config.HOSTNAME },
        });
        io.emit("message", "asfosaf");
        connect("http://localhost:4500");
    });
    startConsumer().catch(console.error);
};

main();
