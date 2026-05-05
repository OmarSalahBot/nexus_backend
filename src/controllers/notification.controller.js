import Notification from "../models/notification.model.js";


export const getNotifications = async (req , res ) =>{
    try{
        const userId = req.user._id;

        // getting all the notifications for the user 
        const userNotifications = await Notification.find({ receiverId : userId }).sort({ createdAt: -1}).populate("senderId","fullname");

        res.status(200).json( userNotifications );

    }catch(err){
        console.error("getNotifications Error:", err.message);
        return res.status(500).json({ message: "Server Err" });
    }
}