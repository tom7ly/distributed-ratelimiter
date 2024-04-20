import amqp from 'amqplib';
import { config, svcConfig } from 'src/config';
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
    originUrl: any;
    constructor(options: LogMessageOptions) {
        this.type = options.type;
        this.message = options.message;
        this.serviceId = config.SERVICE_ID;
        this.originUrl = config.HOST_URL;
        if (options.data) {
            this.data = options.data;
        }
    }
}


async function sendLog(options: LogMessageOptions) {
    let conn: amqp.Connection | null = null;
    let retries = 60;
    while(!conn && retries > 0){
        try {
            conn = await amqp.connect(svcConfig.AMPQ_URL);
        } catch (err) {
            retries--;
            if (!retries) {
                throw new Error('Failed to connect to AMPQ server');
            }
            console.log('Retrying connection to AMPQ server');
            await new Promise(resolve => setTimeout(resolve, 5000)); // delay 5 seconds before next retry
        }
    }
    if (!conn) {
        throw new Error('Failed to connect to AMPQ server after 5 retries');
    }
    const channel = await conn.createChannel();

    const queue = 'logQueue';
    await channel.assertQueue(queue, { durable: false });
    const messageString = JSON.stringify(new LogMessage(options))

    channel.sendToQueue(queue, Buffer.from(messageString));
    console.log('Log sent:', messageString);

    await channel.close();
    await conn.close();
}

export default sendLog;
