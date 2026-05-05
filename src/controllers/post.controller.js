import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Follow from '../models/follow.model.js';
import cloudinary from "../config/cloudinary.js";
import Notification from "../models/notification.model.js";
import Comment from "../models/comment.model.js";

export const getAllPosts = async(req , res) => {
    try{
        const userId = req.user?._id;
        if(!userId) {
            // geting all the posts because he is not logged in
            const posts = await Post.find().sort({ createdAt: -1 }).limit(20).populate("userId","username fullname profilePic themeColor").lean();
            return res.status(200).json( posts );
        }

        // getting the follows the user did
        const userFollowing = await Follow.find({ followerId: userId });
        // هجيب ليس فيها الايديز بتاع كل الناس اللى هو عاملها فولوز 
        const followingIds = userFollowing.map((e)=> e.followingId.toString() );


        // getting posts from the people he follows 
        const followingPosts = await Post.find({
            userId:{
                $in: followingIds
            }
        }).sort({ createdAt: -1 }).populate("userId","username fullname profilePic themeColor").lean();

        // getting more Posts for Unknown people 
        const otherPosts = await Post.find({
            $and:[
                { userId:{   $nin: followingIds  }},
            ]
        }).sort({ createdAt: -1 }).limit(20).populate("userId","username fullname profilePic themeColor").lean();

        // merging all the posts
        const mergedPosts = [...followingPosts,...otherPosts];

        const finalPosts = mergedPosts.map(post=>(
            {
            ...post,
            isLiked: post.likes ? post.likes.some(id => id.toString() === userId.toString()) : false,
        }
        ))

        return res.status(200).json( finalPosts );

        
    }catch(err){
        console.error("GetAllPosts Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}

export const createPost = async( req , res )=>{
    try{
        const { text , image } = req.body;
        let profliePic;
        const postCreator = req.user._id;

        // make sure all the fields are full 
        if(!text && !image) return res.status(200).json({message:"All fields are required"});

        // uploading image if it is exist
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image);
            profliePic = await uploadResponse.secure_url;
        }

        const newPost = await Post.create({
            userId: postCreator ,
            text: text ,
            image: profliePic
        });
        
        await newPost.populate("userId", "username fullname profilePic themeColor");

        return res.status(201).json( newPost );

    }catch(err){
        console.error("createPost Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }

}

export const deletePost = async( req , res )=>{
    try{
        const postId = req.params.postid;
        const userId = req.user._id;

        // finding the post and trying to delete it 
        const deletedPost = await Post.findOneAndDelete({ _id: postId , userId:userId }).lean();

        // checking if the post is exist or the user can delete it 
        if(!deletedPost){
            return res.status(400).json({ message: "You Cant Delete this Post" });
        }

        return res.status(200).json({ message: "Post deleted successfully" });

    }catch(err){
        console.error("deletePost Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}


export const addOrRemoveLike = async( req , res )=>{
    try{
        const { postid: postId } = req.params;
        const userId = req.user._id;

        // getting the post -- find output => [{}] and this can make problems
        const post = await Post.findById(postId).lean();

        // check if the post is exist
        if(!post) return res.status(400).json({ message: "This Post is not exist " });
        
        const isLiked = post.likes?.map(id => id.toString()).includes(userId.toString());

        if(!isLiked){
            // making the like 
            await Post.findByIdAndUpdate(postId , { $addToSet:{likes: userId} , $inc:{ likeCounter:1 }});

            if( userId.toString() !== post.userId.toString() ){
                const newNotification = await Notification.create({
                    senderId: userId,
                    receiverId: post.userId,
                    type: "like",
                    postId: postId
                });
            }


            return res.status(200).json({ message:"Added Like"});
        }

        // removing Like
        await Post.findByIdAndUpdate(postId , { $pull:{likes: userId} , $inc:{ likeCounter:-1 }});
        return res.status(200).json({ message:"remove Like"});
        

    }catch(err){
        console.error("createLike Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}

export const getUserPostsAndData = async( req , res ) => {
    try{
        const profileUsername = req.params.username;
        const userId = req.user.id;

        //getting the user from the database
        const profileOwner = await User.findOne({ username: profileUsername });

        // check if it is not exist 
        if(!profileOwner) return res.status(200).json({ message:"This user is not found" });

        //getting the post
        const posts = await Post.find({userId:profileOwner}).populate("userId",'fullname username profilePic themeColor').lean();


        // check if he is following the other user 
        const follow = await Follow.findOne({ followerId: userId  , followingId: profileOwner._id});
        const isFollowed = follow ? true : false;

        const finalposts = posts.map(post=>(
            {
            ...post,
            isLiked: post.likes ? post.likes.some(id => id.toString() === userId.toString()) : false,
        }
        ));

        return res.status(200).json( {profileOwner:{profileOwner , isFollowed:isFollowed} , posts: finalposts} );

    }catch(err){
        console.error("getUserPosts Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}

