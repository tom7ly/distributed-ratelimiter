import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { config } from 'src/config';
export class LoadBalancer {
    private rateLimiters: string[] = [];
    private currentIndex: number = 0;

    constructor(private updateInterval: number) {
        this.updateRateLimiters();
    }

    private async updateRateLimiters() {
        this.rateLimiters = [...config.RATELIMITERS];
    }

    public async forwardRequest(req: Request): Promise<AxiosResponse> {
        if (this.rateLimiters.length === 0) {
            console.error('No rate limiters available.');
            return;
        }

        const url = this.rateLimiters[this.currentIndex].concat(req.originalUrl);
        const clientId= req.headers['x-client-id'];
        this.currentIndex = (this.currentIndex + 1) % this.rateLimiters.length;
        try {
            const response = await axios({
                url,
                method: req.method,
                headers: {
                    'Content-Type': 'application/json',
                    'x-client-id': clientId,
                },
                data: req.body,
            });
            return response;
        } catch (error) {
            if (error.response) {
                return error.response;
            } else {
                console.error('Error:', error.message);
            }
        }
    }
}
