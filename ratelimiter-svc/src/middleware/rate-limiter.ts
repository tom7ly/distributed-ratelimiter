import { Request } from "express";
import rateLimit from "express-rate-limit";
import Redis from "ioredis";
import RedisStore from "rate-limit-redis";
import { getRateLimitEntry, sendApprovedLog, sendRejectedLog } from "./rate-limiter-logger";
import { RateLimitConfig, config } from "src/config";
import sendLog, { LogType } from "src/services/logger";
import { get } from "lodash";

export enum RLPrefix {
    RL1 = 'seconds',
    RL2 = 'miniutes'

}
export interface RateLimitOptions {
    redisClient: Redis;
    config: RateLimitConfig;
}

export const ratelimiter = (options: RateLimitOptions) => {
    const { redisClient, config } = options;
    const limiter = rateLimit({
        store: new RedisStore({
            // in ioredis types (known issue from ioredis library owner)
            // @ts-expect-error - i'm ignoring call as it is not present 
            sendCommand: (...args: any) => redisClient.call(...args),
            prefix: config.id,
        },
        ),
        windowMs: (config.window as number) * 1000,
        max: (config.max as number),
        standardHeaders: true,
        legacyHeaders: false,

        keyGenerator: function keyGenerator(req: Request): string {
            const clientID = req.headers["x-client-id"];
            const key = `${config.id}:${clientID}`
            console.log("Client ID: ", clientID)
            req.headers["x-rl-key"] = key;
            return clientID ? clientID.toString() : req.ip.toString();
        },
        handler: async function handler(req: Request, res: any, next: any) {
            console.log("Rate limit exceeded for client id: ", req.headers["x-client-id"]);
            getRateLimitEntry(req);
            next({
                status: 429,
                message: "Rate limit exceeded",
            })
        }
    });
    return limiter;
}

const handleRateLimit = (req, res, next, rateLimiter) => {
    rateLimiter(req, res, (err) => {
        if (err) {
            // err contains the result from the handler function
            console.log(err.message); // Log the message from the handler function
            next(err);
        } else {
            const rlKey = req.headers["x-rl-key"] as string;
            const info = req.rateLimit as { limit: number, remaining: number, resetTime: number };
            const rateLimitInfo = { limit: info.limit, timeRemaining: info.resetTime, currentCount: info.limit - info.remaining, rlKey };
            getRateLimitEntry(req);
            if (!req.rateLimitInfo) {
                req.rateLimitInfo = [rateLimitInfo];
            } else {
                req.rateLimitInfo.push(rateLimitInfo);
            }

            next();
        }
    });
};

export const rateLimitMiddleware = (rateLimiters) => {
    return async (req, res, next) => { // Make the middleware function async
        let approvedCount = 0;
        let rejectedCount = 0;

        const handleRateLimits = async (index) => { // Make handleRateLimits async
            return new Promise<void>((resolve, reject) => { // Return a Promise
                if (index >= rateLimiters.length) {
                    resolve();
                } else {
                    handleRateLimit(req, res, (err) => {
                        if (err) {
                            rejectedCount++;
                        } else {
                            approvedCount++;
                        }
                        handleRateLimits(index + 1).then(resolve).catch(reject); // Wait for the next rate limiter
                    }, rateLimiters[index]);
                }
            });
        };

        await handleRateLimits(0); // Wait for all rate limiters to finish processing

        if (rejectedCount > 0) {
            await sendRejectedLog(req, res);
            const rateLimitInfo = req['rl-svc']
            res.status(429).json({
                message: "Rate limit exceeded",
                rateLimitInfo,
            });
        } else {
            await sendApprovedLog(req, res);
            next(); // Proceed with the next middleware
        }
    };
};
