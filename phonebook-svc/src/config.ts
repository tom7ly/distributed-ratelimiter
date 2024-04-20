export const config = {
    HOSTNAME: process.env.HOSTNAME || 'localhost',
    PORT: Number(process.env.PORT) || 5000,
    SERVICE_ID: process.env.SERVICE_ID || 'phonebook-svc',
    HOST_URL:`${process.env.HOSTNAME || 'http://localhost'}:${Number(process.env.PORT) || 5000}`
}
export const svcConfig = {
    AMPQ_URL: process.env.AMPQ_URL || 'amqp://localhost',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
}