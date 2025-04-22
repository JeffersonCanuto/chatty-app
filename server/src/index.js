import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import connectDB from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();
const app = express();

const PORT = process.env.APP_PORT;

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/message', messageRoutes);

app.listen(PORT, error => {
    if (error) {
        console.log(`Error to start server: ${error}`);
        return;
    }

    console.log(`Server is running on port: ${PORT}`);
    connectDB();
});