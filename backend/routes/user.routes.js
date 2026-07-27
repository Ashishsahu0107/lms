import { Router } from "express";

import { createUser, getUsers } from "../controllers/user.controller.js";

const router = Router();

// Create User
router.post("/", createUser);

// Get All Users
router.get("/", getUsers);

export default router;
