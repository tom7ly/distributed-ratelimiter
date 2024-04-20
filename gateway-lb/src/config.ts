export const config = {
    HOSTNAME: process.env.HOSTNAME || 'http://localhost',
    RATELIMITERS: process.env.RATELIMITERS ? process.env.RATELIMITERS.split(',') : ['http://localhost:4000'],
    PORT: Number(process.env.PORT) || 3000,
    SERVICE_ID: process.env.SERVICE_ID || 'gateway-lb-svc',
    HOST_URL:`${process.env.HOSTNAME || 'http://localhost'}:${Number(process.env.PORT) || 3000}`

}

export const svcConfig = {
    AMPQ_URL: { url: process.env.AMPQ_URL || 'amqp://localhost', serviceName: 'rabbitmq-svc' },
    RATELIMITERS: (process.env.RATELIMITERS ? process.env.RATELIMITERS.split(',') : ['http://localhost:4000']).map((url: string, index) => ({
        url, serviceName: `ratelimiter-svc${index+1}`
    })),
    REDIS_HOST:{url: process.env.REDIS_HOST || 'localhost', serviceName: 'redis-svc'},
    MONGODB_URL: { url: process.env.MONGODB_URL || 'mongodb://localhost:27017', serviceName: 'mongodb-svc'},
    LOGGER_URL: { url: process.env.LOGGER_URL || 'http://localhost:4500', serviceName: 'logger-svc'},
    PHONEBOOK_URL: { url: process.env.PHONEBOOK_URL || 'http://localhost:5000', serviceName: 'phonebook-svc'},
}