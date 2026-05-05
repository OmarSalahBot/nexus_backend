import express from 'express';
import { register , login, logout , editProfile  } from '../controllers/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/register', register);

router.post('/login',login);
router.post('/logout', logout);
router.put('/edit-profile', protectRoute , editProfile);
router.get('/check',protectRoute,(req,res) => res.status(200).json(req.user));

export default router;
