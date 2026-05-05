import mongoose from "mongoose";


const userSchema = new  mongoose.Schema({
    fullname : { type: String , required: true },
    username:{ type : String , required:true , unique : true } ,
    email : { type : String , required : true , unique : true},
    password : { type : String , required : true , minlength:6} ,

    profilePic: {type : String  , default:""} , 
    bio: { type: String , default : ""},
    location : { type : String , default :""},

    themeColor: {
        type: String,
        enum: ["emerald", "blue", "purple", "orange", "teal"],
        default: function() {
            const colors = ["emerald", "blue", "purple", "orange", "teal"];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    },

    // Follows Counters
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },

}, { timestamps: true } );


const User = mongoose.model("User" , userSchema); 


export default User; 