import express from "express";
import {user_create, all_users, remove_admin_user} from "../controllers/admin_user.Controller.js"
const router = express.Router();

router.post('/create',user_create);
router.get('/all-users',all_users);
router.post('/remove',remove_admin_user);


export default router;