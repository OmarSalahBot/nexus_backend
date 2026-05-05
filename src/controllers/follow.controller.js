import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import Notification from "../models/notification.model.js";


export const makeRemoveFollow = async (req, res) => {
    try {
        const userId = req.user._id; // ده الشخص اللي ضغط على الزرار (المتابع)
        const followingId = req.params.id; // ده الشخص اللي هيتعمل له فولو (المحبوب)

        if (userId.toString() === followingId.toString()) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        // 1. التأكد إذا كان الفولو موجود أصلاً (عشان الـ Remove)
        const existingFollow = await Follow.findOne({ 
            followerId: userId, 
            followingId: followingId 
        });

        if (existingFollow) {
            // --- عملية الـ Unfollow ---
            await Follow.findByIdAndDelete(existingFollow._id);
            
            // تنقيص العدادات
            await User.findByIdAndUpdate(userId, { $inc: { followingCount: -1 } });
            await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });

            return res.status(200).json({ message: "Unfollowed successfully" });
        }

        // --- عملية الـ Follow الجديدة ---
        // لاحظ هنا استخدمت followerId عشان تطابق الـ Schema
        await Follow.create({
            followerId: userId, 
            followingId: followingId
        });

        // creating notification
        await Notification.create({
            senderId: userId,
            receiverId: followingId,
            type: "follow",
        });

        // زيادة العدادات
        await User.findByIdAndUpdate(userId, { $inc: { followingCount: 1 } });
        await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });

        return res.status(201).json({ message: "Followed successfully" });

    } catch (err) {
        console.error("makeRemoveFollow Error:", err.message);
        return res.status(500).json({ message: "Server Err" });
    }
}

import mongoose from "mongoose";

export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. نجيب الناس اللي أنا عاملهم فولو
    const userFollowing = await Follow.find({ followerId: userId });
    
    // 2. تحويل الـ IDs لمصفوفة من الـ ObjectIds الحقيقية (مهم جداً للـ aggregate)
    const followingIds = userFollowing.map((e) => e.followingId);

    // إضافة الـ userId الخاص بي للمصفوفة عشان مستبعدش نفسي بالـ String
    const excludedIds = [...followingIds, userId];

    // 3. الاستعلام باستخدام aggregate
    const suggestions = await User.aggregate([
      {
        $match: {
          // المونجو هيقارن ObjectId بـ ObjectId فالموضوع هيبقى دقيق 100%
          _id: { $nin: excludedIds }
        }
      },
      { $sample: { size: 3 } },
      { 
        $project: { 
          password: 0, 
          email: 0, 
          createdAt: 0, 
          updatedAt: 0, 
          __v: 0 
        } 
      }
    ]);

    res.status(200).json(suggestions);
  } catch (err) {
    console.error("Error in getSuggestedUsers:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


