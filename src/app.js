import express from "express";
import "dotenv/config";
import cors from 'cors';
import cookieParser from "cookie-parser";
import authRouter from './routes/auth.routes.js';
import postRouter from './routes/post.routes.js';
import notificationRouter from './routes/notification.routes.js';
import followRouter from './routes/follow.routes.js';
import connectDB from "./config/db.js";


const app = express();

const PORT = process.env.PORT || 5000;

// middleware
app.use(express.json({ limit: "10mb"}));
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true ,
}));
app.use(cookieParser());


app.use('/api/auth' , authRouter);
app.use('/api/post', postRouter);
app.use('/api/follow', followRouter);
app.use('/api/notifications' , notificationRouter );

app.listen (PORT , () =>{
    console.log(`Server is Running on PORT: ${PORT}`);
    connectDB();
});