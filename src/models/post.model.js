import mongoose from "mongoose";

const postschema = new mongoose.Schema(
    {
    userId: { type : mongoose.Schema.Types.ObjectId , ref:"User" , required:true },
    text: { type : String },
    image: { type : String },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    commentsCount: { type: Number, default: 0 },
    } 
    , { timestamps: true });

postschema.index({ userId:1 });
const Post = mongoose.model("Post",postschema);

export default Post;