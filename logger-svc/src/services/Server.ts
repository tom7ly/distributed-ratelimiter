
import { Server as IOServer } from 'socket.io';
import { Server as HttpServer } from 'http';
import { LogMessage, startConsumer } from './logger';
import http from 'http';
import express from 'express';
export class EmitterProvider {
    io: IOServer;
    constructor(private server: HttpServer) {
        this.io = new IOServer(this.server);
        this.io.on('connection', (socket) => {
            console.log('a user connected');
            socket.on('message', (msg) => {
                console.log('message: ' + msg);
                this.io.emit('message', msg);
            });
            socket.on('disconnect', () => {
                console.log('user disconnected');
            }
            )
        })
    }

    emitLogMessage(logMessage: LogMessage) {
        this.io.emit('message','asfosaf')
        this.io.emit('message', JSON.stringify(logMessage));
    }
}
export class Provider {
    server: HttpServer;
    emitter: EmitterProvider;
    constructor() {
        this.server = http.createServer(express());
        this.emitter = new EmitterProvider(this.server);
        startConsumer().catch((err) => {
            throw new Error(err);
        })

    }

}
const server = new Provider();

export const Server = server.server
export const Emitter = server.emitter   