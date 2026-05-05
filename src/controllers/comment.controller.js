import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Follow from '../models/follow.model.js';
import Comment from "../models/comment.model.js";
import Notification from "../models/notification.model.js";

export const addComment = async ( req , res )=>{
    try{
        const { text } = req.body;
        const postId  = req.params.postid;
        const userId = req.user._id;

        // making sure the comment is not empty 
        if(!text) return res.status(400).json({message:"You Cant Make an empty comment "});

        const post = await Post.findById(postId).lean();

        if(!post) return res.status(404).json({ message:"Post Not Found" });

        // Creating the comment 
        const newComment = await Comment.create({
            userId,
            postId,
            text
        });

        // Creating notification if the user it not the author 
        if( userId.toString() !== post.userId.toString() ){

            const newNotification = await Notification.create({
            senderId: userId,
            receiverId: post.userId,
            type: "comment",
            postId: postId
        });
        
        }
            
        const finalComment = await newComment.populate("userId" , "fullname username profilePic themeColor");


        return res.status(201).json( finalComment );

    }catch(err){
        console.error("addComment Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}

export const getComments = async(req , res ) =>{
    try{
        const postId = req.params.id;

        const postComments = await Comment.find({ postId: postId }).populate("userId",'fullname username profilePic themeColor');

        if(!postComments) return res.status(404).json({ message:"This post is not exist"});


        return res.status(200).json( postComments );
    }catch(err){
        console.error("getComments err ",err)
    }
}