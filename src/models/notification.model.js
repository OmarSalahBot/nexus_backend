import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['follow', 'comment', 'like'], // الـ enum بيضمن إن مفيش قيم غلط تدخل
        required: true 
    },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' }, // مهم جداً عشان لما اليوزر يدوس على النوتيفيكشن يروح للبوست
    read: { type: Boolean, default: false }, // عشان تعرف اليوزر شافها ولا لأ (النقطة الحمراء)
}, { timestamps: true });


const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;