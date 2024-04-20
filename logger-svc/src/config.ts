export const config = {
    HOSTNAME: process.env.HOSTNAME || 'localhost',
    PORT: Number(process.env.PORT) || 4500,
    SERVICE_ID: process.env.SERVICE_ID || 'logger-svc',
    HOST_URL:`${process.env.HOSTNAME || 'http://localhost'}:${Number(process.env.PORT) || 4500}`

}

export const svcConfig = {
    AMPQ_URL: process.env.AMPQ_URL || 'amqp://localhost',
}