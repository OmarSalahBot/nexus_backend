import mongoose from "mongoose";

const connectDB = async () => {
    try {
        const {MONGO_URI} = process.env;
        if(!MONGO_URI) throw new Error('MONGO_URI is not defined in environment variables');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
}

export default connectDB; 