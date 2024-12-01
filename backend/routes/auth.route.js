import express from "express";
import {
  getUser,
  login,
  logout,
  signup,
} from "../controllers/auth.controller.js";
import { proectedRoute } from "../middleware/protectedRoute.js";

const router = express.Router();

router.get("/me", proectedRoute, getUser);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
