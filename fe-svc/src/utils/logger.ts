import { RateLimitEntry } from "../components/SocketProvider";

export enum LogType {
    RATE_LIMIT_INFO = 'RATE_LIMIT_INFO',
    RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
    GATEWAY_INFO = 'GATEWAY_INFO',
    GATEWAY_ERROR = 'GATEWAY_ERROR',
    SERVICE_INFO = 'SERVICE_INFO',
    SERVICE_ERROR = 'SERVICE_ERROR',
    DATABASE_INFO = 'DATABASE_INFO',
    DATABASE_ERROR = 'DATABASE_ERROR',
    LOGGER_INFO = 'LOGGER_INFO',
    LOGGER_ERROR = 'LOGGER_ERROR',
    DEFAULT = 'DEFAULT'
}
export interface LogMessageOptions {
    type: LogType;
    message: string;
    data?: any;
}
export class LogMessage {
    type: LogType;
    serviceId: string;
    message: string;
    data?: any;
    originUrl: string;
    uuid: string = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    constructor(options: LogMessageOptions, serviceId: string, originUrl: string) {
        this.serviceId = serviceId;
        this.type = options.type;
        this.message = options.message;
        this.serviceId = serviceId
        this.originUrl = originUrl ?? 'unknown-url';
        if (options.data) {
            this.data = options.data;
        }
    }
}


export function createLogMessage(incomingMessage: any): LogMessage {
    const type = incomingMessage.type ?? LogType.DEFAULT;
    const message = incomingMessage.message ?? 'Default message';
    const data = incomingMessage.data ?? {};
    const serviceId = incomingMessage.serviceId ?? 'unknown-service'
    const originUrl = incomingMessage.originUrl ?? 'unknown-url'
    return new LogMessage({ type, message, data }, serviceId, originUrl);
}

export function createRateLimitEntry(incomingMessageData: any): RateLimitEntry | null {
    if (incomingMessageData.type !== LogType.RATE_LIMIT_INFO && incomingMessageData.type !== LogType.RATE_LIMIT_ERROR) {
        return null;
    }
    const data = incomingMessageData.data as RateLimitEntry;
    if (data) {
        return data;
    };
    return null;
}