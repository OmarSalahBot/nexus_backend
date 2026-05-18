import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { generateToken} from '../config/jwt.js';
import cloudinary from "../config/cloudinary.js";

export const register = async (req,res) => {
    try{

    const{ fullname , username , email , password } = req.body;

    // Make sure all the field are full
    if(!fullname || !username || !email || !password){
        console.log("1 ");
        return res.status(400).json({message: "All fields are required" });
    }
        

    // Checking if the password is valid
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;
    if(!passwordRegex.test(password)){
        return res.status(400).json({errType:"Password",message : "Password must contain capital and small letter and numbers and should be longer than 6 items"})
    }

     // Checking the email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({errType:"email", message: "Enter a vaild email please "})
        }

    // unique username and email 
    const newUsername = await User.findOne({ username: username.toLowerCase() }).lean();
    const newUserEmail = await User.findOne({ email: email.toLowerCase() }).lean();

    // Make sure that email is unique
    if(newUserEmail) return res.status(400).json({message : "Email is already exist"});

    // Make sure that username is unique
    if(newUsername) return res.status(400).json({message : "Username is already exists"});

    // Make incrypting the password 
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt);

    const newUser = await User.create({ 
        fullname: fullname , 
        username: username.toLowerCase() , 
        email: email.toLowerCase() , 
        password: hashPassword 
    });


    
    
    generateToken(newUser._id , res);

    // removing the password
    const user = newUser.toObject();
    delete user.password;
    // Sending The User Data 
    return res.status(201).json( user );


    }catch(err){
        console.error("signup Error:", err.message);
        return res.status(500).json({message: 'Server Error'});
    }

}

export const login = async (req , res) => {
    try{

        const { email , password } = req.body;

        // make sure all the fields are full
        if(!email || !password) {
            return res.status(404).json({ message: "All fields are required "});
        }

        const user = await User.findOne({ email:email.toLowerCase()}).lean();
        
        // check if user is exist 
        if(!user) return res.status(400).json({ message: "invalid information" });

        // checking if the password is correct 
        const isPasswordCorrect = await bcrypt.compare(password , user.password);
        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid information"});

        generateToken(user._id , res);

        delete user.password;
        

        return res.status(200).json( user );

    }catch(err){
        console.error("Login Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}

export const logout = (_,res) => {
    res.cookie("jwt","",{maxAge:0});
    res.status(200).json({message : "Logout successfully"})
};



export const editProfile = async (req ,res) => {
    try{
        const userId = req.user._id;
        const { fullname , username , bio , location ,  profilePic  } = req.body;

        // make sure all the fields are full
        if(!fullname && !username && !location && !bio && !website && !profilePic) 
            return res.status(400).json({message:"You Have To Change Any Data"});

        // Storing the New Data
        const updates = {};
        if (fullname) updates.fullname = fullname;
        if (username) updates.username = username;
        if (bio) updates.bio = bio;
        if( location ) updates.location = location;
        if(profilePic){
            const uploadResponse = await cloudinary.uploader.upload(profilePic);
            updates.profilePic = uploadResponse.secure_url;
        }

        // Updating User
        const UpdatedUser = await User.findByIdAndUpdate(userId, 
            { $set: updates} , {new:true , runValidators: true } ).select("-password") ;

        return res.status(200).json(UpdatedUser);

    }catch(err){
        console.error("Edit Profile Error:", err.message);
        return res.status(500).json({ message:"Server Err"});
    }
}

