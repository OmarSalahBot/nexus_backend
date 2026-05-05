import express from "express";
import { getNotifications } from '../controllers/notification.controller.js';
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();


router.use(protectRoute);

router.get('/get-notifications', getNotifications );


export default router;