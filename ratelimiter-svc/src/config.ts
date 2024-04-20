export const config = {
    PHONEBOOK_URL: process.env.PHONEBOOK_URL || 'http://localhost:5000',
    HOSTNAME: process.env.HOSTNAME || 'localhost',
    PORT: Number(process.env.PORT) || 4000,
    SERVICE_ID: process.env.SERVICE_ID || 'ratelimiter-svc',
    HOST_URL: `${process.env.HOSTNAME || 'localhost'}:${Number(process.env.PORT) || 4000}`
}
export const svcConfig = {
    AMPQ_URL: process.env.AMPQ_URL || 'amqp://localhost',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
}
export interface RateLimitConfig {
    id: string;
    window: number | string;
    max: number | string;
}
export const rlConfig1: RateLimitConfig = {
    id: 'RL1',
    window: process.env.RATELIMITER_RL1_WINDOW || 15,
    max: process.env.RATELIMITER_RL1_MAX || 4,
}
export const rlConfig2: RateLimitConfig = {
    id: 'RL2',
    window: process.env.RATELIMITER_RL2_WINDOW || 30,
    max: process.env.RATELIMITER_RL2_MAX || 2,
}

