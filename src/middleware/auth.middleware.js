import jwt from "jsonwebtoken";
import User from '../models/user.model.js';
import "dotenv/config";

export const protectRoute = async (req , res , next) => {
    try{
        let token = req.cookies.jwt;

        // check if the token it already exist 
        if(!token) return res.status(400).json({ message: "Unauthorized - No token" });

        // check if the token is valid 
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        if(!decoded) return res.status(400).json({ message:" Unauthorized- Invalid token "});

        // geting the user
        const user = await User.findById(decoded.userId);

        req.user = user;
        next();

    }catch(err){
        console.error( "Auth middleware err" , err.message );
        return res.status(500).json({ message: "Server Err" });
    }
    
}

export const optionalAuth = async (req, res, next) => {
    try {
        const token = req.cookies.jwt; // أو الطريقة اللي بتجيب بيها التوكن
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select("-password");
        }
        next(); // بيكمل في كل الأحوال سواء فيه يوزر أو لأ
    } catch (error) {
        next(); // حتى لو التوكن غلط كمل كأنك Guest
    }
};