import express from "express";
import dotenv from "dotenv";

import connectDB from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";

dotenv.config();
const app = express();

const PORT = process.env.APP_PORT;

app.use(express.json());
app.use('/api/auth', authRoutes);

app.listen(PORT, error => {
    if (error) {
        console.log(`Error to start server: ${error}`);
        return;
    }

    console.log(`Server is running on port: ${PORT}`);
    connectDB();
});