import express from "express";
import { makeRemoveFollow } from "../controllers/follow.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getSuggestedUsers } from '../controllers/follow.controller.js';

const router = express.Router();

router.use(protectRoute);

router.post('/make-remove-follow/:id',  makeRemoveFollow );
router.get('/who-to-follow', getSuggestedUsers );



export default router;