import express from "express";
import Redis from "ioredis";
import { config, rlConfig1, rlConfig2, svcConfig } from "./config";
import { authMiddleware } from "./middleware/auth";
import { forwarder } from "./middleware/forwarder";
import { rateLimitMiddleware, ratelimiter } from "./middleware/rate-limiter";
import sendLog, { LogType } from "./services/logger";
const app = express();
const redisClient = new Redis(
    {
        host: svcConfig.REDIS_HOST,
        port: 6379,
        retryStrategy: (times) => {
            if (times > 60) {
                throw new Error("Retry attempts exhausted");
            }
            return 5000; 
        }
    }
);

const rateLimiter1 = ratelimiter({ redisClient: redisClient, config: rlConfig1 });
const rateLimiter2 = ratelimiter({ redisClient: redisClient, config: rlConfig2 });


const main = async () => {
    app.use(express.json());
    app.use("/healthcheck", (req, res) => { res.status(200).send("OK"); })
    app.use('/api/*', authMiddleware)
    app.use('/api/*', rateLimitMiddleware([rateLimiter1, rateLimiter2]));
    app.all('/api/*', forwarder);



    app.listen(config.PORT);
    sendLog({
        type: LogType.RATE_LIMIT_INFO,
        message: `Server started on port ${config.PORT}`,
        data: { port: config.PORT, serviceId: config.SERVICE_ID, url: config.HOSTNAME },
    });

};

main();
