import express from "express";
import {user_login, reset_pass} from "../controllers/user_auth.Controller.js"
const router = express.Router();

router.post('/login',user_login);
router.post('/reset-pass',reset_pass);

export default router;