import { Request, Response } from "express";
import { config } from "src/config";
import sendLog, { LogMessage, LogType } from "src/services/logger-service";
export const authMiddleware = (req: Request, res: Response, next: Function) => {
    const clientId = req.headers["x-client-id"];
    if (!clientId) {
        sendLog(new LogMessage({
            type: LogType.GATEWAY_ERROR,
            message: `MISSING x-client-id header!`,

        }));
        return res.status(401).send(`x-client-id header is required, check logs for more info`);
    }
    next();
};