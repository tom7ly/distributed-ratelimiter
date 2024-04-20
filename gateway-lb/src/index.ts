import express, { Request, Response } from "express";
import { LoadBalancer } from "./services/loadbalancer-service";
import { config } from "./config";
import { healthCheck } from "./services/healthcheck";
import { authMiddleware } from "./middleware/auth";
const loadBalancer = new LoadBalancer(60000);

const forwardMiddleware = (req, res, next) => {
    loadBalancer
        .forwardRequest(req)
        .then((response) => {
            res.status(response.status).json(response.data);
        })
        .catch((error) => {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            return res.status(500).json(error.message);
        });
};

const healthCheckMiddleware = (req: Request, res: Response, next: Function) => {
    const { upServices, downServices } = healthCheck.getCurrentState();
    if (Object.keys(downServices).length > 0) {
        return res.status(500).json({ message: 'Please wait for all services to be up', downServices });
    }
    next();
}

const main = async () => {
    const app = express();
    app.use(express.json());
    app.use(healthCheckMiddleware);
    app.use('/api/*', authMiddleware);
    app.use('/api/*',forwardMiddleware);
    app.listen(config.PORT, () => console.log(`Server running on ${config.HOSTNAME}:${config.PORT}`));
}
main()