import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { Router } from "express";
import routes from "./routes/routes";
import { config, svcConfig } from "./config";
import sendLog, { LogType } from "./services/logger";
import { authMiddleware } from "./middleware/auth";
const port = process.env.PORT || 5000;
const router = Router();

export const connectToMongoDB = async () => {
    const mongoUrl = svcConfig.MONGO_URL;
    mongoose
        .connect(mongoUrl, { dbName: "test" })
        .then(() => console.log("MongoDB connected successfully"))
        .catch((err) => {
            console.error("MongoDB connection error:", err);
            throw new Error("Failed to connect to MongoDB");
        })

};

export const main = async () => {
    await connectToMongoDB();
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use('/api/*', authMiddleware);
    app.use("/api", routes);
    app.use("/healthcheck", (req, res) => { res.status(200).send("OK"); })
    app.listen(config.PORT, () => {
        // sendLog({
        //     type: LogType.SERVICE_INFO,
        //     message: `Server started on port ${config.PORT}`,
        //     data: { port: config.PORT, serviceId: config.SERVICE_ID, url: config.HOSTNAME },
        // });
    });
};

main();
