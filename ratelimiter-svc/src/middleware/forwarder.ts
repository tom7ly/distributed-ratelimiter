import axios from "axios";
import { Request, Response } from "express";
import { config } from "src/config";

export const forwarder = async (req: Request, res: Response, next: Function) => {
    try {
        const url = config.PHONEBOOK_URL.concat(req.originalUrl);
        const { method, originalUrl, headers, body } = req;
        const clientID = headers['x-client-id'];
        const response = await axios(url,{
            method: req.method,
            headers:{
                'Content-Type': 'application/json',
                'x-client-id': clientID
            },
            data: req.body
        });
        res.send(response.data);
    } catch (error) {
        if (error.response) {
            return res.status(error.response.status).send(error.response.data);
        }
        return res.status(500).send(error.message);
    }
}