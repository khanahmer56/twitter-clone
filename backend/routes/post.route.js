import express from "express";
import { protectedRoute } from "../middleware/protectedRoute.js";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllPosts,
  likeUnlikePost,
} from "../controllers/post.controller.js";

const router = express.Router();
router.get("/all", protectedRoute, getAllPosts);
router.post("/create", protectedRoute, createPost);
router.post("/comment/:id", protectedRoute, commentOnPost);
router.get("/like/:id", protectedRoute, likeUnlikePost);
router.delete("/delete/:id", protectedRoute, deletePost);

export default router;
