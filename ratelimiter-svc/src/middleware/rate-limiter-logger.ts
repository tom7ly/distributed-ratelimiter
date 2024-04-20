import { Request, Response } from "express";
import { isEmpty } from "lodash";
import sendLog, { LogMessage, LogType } from "src/services/logger";
import { config } from "src/config";

export interface RateLimitEntry {
    clientId: string;
    info: RateLimitInfo[];
}

export interface RateLimitInfo {
    rlKey: string;
    data: {
        currentCount: number;
        limit: number;
        timeRemainingMs: number;
        resetTime: number;
    };
}


export const getRateLimitEntry = (req: Request): RateLimitEntry => {
    const clientId = req.headers["x-client-id"] as string || "unknown";
    const info = getRateLimitInfo(req);

    if (req["rl-svc"]) {
        const existingInfoIndex = req["rl-svc"].info.findIndex((i: RateLimitInfo) => i.rlKey === info.rlKey);
        if (existingInfoIndex !== -1) {
            req["rl-svc"].info[existingInfoIndex] = info;
        } else {
            req["rl-svc"].info.push(info);
        }
    } else {
        req["rl-svc"] = { clientId, info: [info] };
    }

    return req["rl-svc"];
}
export const getRateLimitInfo = (req: Request): RateLimitInfo => {
    const result = req["rateLimit"] as { limit: number, remaining: number, resetTime: string };
    const currTime = new Date().getTime();
    const resetTime = new Date(result.resetTime).getTime()
    const timeRemaining = resetTime - currTime;
    const currentCount = result.limit - result.remaining;
    const limit = result.limit;
    const rlKey = req.headers["x-rl-key"] as string;
    return { rlKey, data: { currentCount, limit, timeRemainingMs: timeRemaining, resetTime } };
}

const generateAndSendLog = async (req: Request, res: Response, logType: LogType, status: string): Promise<string> => {
    const rateLimitEntry = req["rl-svc"] as RateLimitEntry;
    const clientId = rateLimitEntry.clientId;
    const info = rateLimitEntry.info;
    const message = `[ ${clientId} ] ---> [ ${config.HOSTNAME} ] || ${info.map((i) => `${i.rlKey} ${i.data.currentCount}/${i.data.limit} TTL=${i.data.timeRemainingMs}ms`).join(' | ')} --> ${status}`;
    sendLog({ type: logType, message, data: { info, clientId, approved:status==="APPROVED" } });
    return message;
}

export const sendApprovedLog = (req: Request, res: Response): Promise<string> => {
    return generateAndSendLog(req, res, LogType.RATE_LIMIT_INFO, 'APPROVED');
}

export const sendRejectedLog = (req: Request, res: Response): Promise<string> => {
    return generateAndSendLog(req, res, LogType.RATE_LIMIT_ERROR, 'REJECTED');
}

