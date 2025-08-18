import express from "express";
import {user_login} from "../controllers/user_auth.Controller.js"
const router = express.Router();

router.post('/login',user_login);

export default router;