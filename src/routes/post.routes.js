import express from "express";
import { createPost, getAllPosts , deletePost , addOrRemoveLike , getUserPostsAndData } from '../controllers/post.controller.js';
import { optionalAuth , protectRoute  } from '../middleware/auth.middleware.js';
import { addComment , getComments } from "../controllers/comment.controller.js";



const router = express.Router();

router.use(protectRoute);


router.get('/all-posts',  getAllPosts );
router.post('/create-post' , createPost) ;
router.post('/delete-post/:postid', deletePost );
router.post('/like/:postid', addOrRemoveLike );

router.post('/add-comment/:postid', addComment);
router.get('/get-comments/:id', getComments);
router.get('/user-posts/:username',getUserPostsAndData);



export default router;