import axios from "axios";
import Redis from "ioredis";
import { MongoClient } from "mongodb";
import { config, svcConfig } from "src/config";
import { createClient } from 'redis';
import amqp from 'amqplib';
import mongoose from "mongoose";
// Function to ping Redis
const internalServices = [...svcConfig.RATELIMITERS, svcConfig.LOGGER_URL, svcConfig.PHONEBOOK_URL, svcConfig.REDIS_HOST, svcConfig.MONGODB_URL, svcConfig.AMPQ_URL];


// Call the function to
const checkRedis = async (redisClinet: Redis) => {
    try {
        redisClinet.set('healthcheck', 'OK');
        redisClinet.del('healthcheck');
        return true;
    } catch (err) {
        return false;
    }

}
const checkMongoDB = async () => {
    try {
        await mongoose.connect(svcConfig.MONGODB_URL.url);
        await mongoose.connection.close();
        return true;
    } catch (error) {
        return false;
    }
}


const checkRabbitMQ = async () => {
    try {
        const connection = await amqp.connect(svcConfig.AMPQ_URL.url);
        await connection.close();
        return true;

    } catch (error) {
        return false;
    }
}

class HealthCheck {
    upServices: Record<string, boolean> = {};
    downServices: Record<string, boolean> = {};
    redisClient: Redis
    constructor() {
        this.downServices = Object.fromEntries(internalServices.map(service => [service.serviceName, false]));
        this.redisClient = new Redis(
            {
                host: svcConfig.REDIS_HOST.url,
                port: 6379,
                retryStrategy: (times) => {
                    if (times > 60) {
                        return null
                    }
                    return; // retry every 2 seconds
                }
            }
        );

    }
    async check() {
        const services = [...internalServices]
        const checks = await Promise.all(services.map(service => { return this.checkService(service) }));

        checks.forEach((isUp, index) => {
            const service = services[index];
            if (isUp) {
                delete this.downServices[service.serviceName];
                this.upServices[service.serviceName] = true;
            } else {
                delete this.upServices[service.serviceName];
                this.downServices[service.serviceName] = false;
            }
        });
    }

    async checkService(service: { serviceName: string; url: string }) {
        try {
            if (service.serviceName === svcConfig.REDIS_HOST.serviceName) {
                return await checkRedis(this.redisClient);
            } else
                if (service.serviceName === svcConfig.MONGODB_URL.serviceName) {
                    return await checkMongoDB();
                } else if (service.serviceName === svcConfig.AMPQ_URL.serviceName) {
                    return await checkRabbitMQ();
                } else {
                    const response = await axios.get(`${service.url}/healthcheck`)
                    return response.status === 200;
                }
        } catch (error) {
            return false;
        }
    }


    async poll(interval = 5000) {
        setInterval(async () => {
            await this.check();
            console.log('Up services:', this.upServices);
            console.log('Down services:', this.downServices);
        }, interval);
    }
    getCurrentState() {
        return {
            upServices: this.upServices,
            downServices: this.downServices
        };
    }
    waitForAllUp = async (timeout = 60000, interval = 5000) => {

        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            await this.check();
            console.log('Up services:', this.upServices);
            console.log('Down services:', this.downServices);

            if (Object.keys(this.downServices).length === 0) {
                console.log('All services are up');
                return;
            }

            await new Promise(resolve => setTimeout(resolve, interval));
        }

        console.log('Timeout reached, not all services are up');
        console.log('Up services:', this.upServices);
        console.log('Down services:', this.downServices);
    }
}
export const healthCheck = new HealthCheck();
healthCheck.waitForAllUp();