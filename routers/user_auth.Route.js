import express from "express";
import {user_login,user_create,all_users} from "../controllers/user_auth.Controller.js"
const router = express.Router();

router.post('/login',user_login);
router.post('/create',user_create);
router.get('/all-users',all_users);


export default router;