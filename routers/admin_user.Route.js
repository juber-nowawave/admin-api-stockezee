import express from "express";
import {user_create,all_users} from "../controllers/admin_user.Controller.js"
const router = express.Router();

router.post('/create',user_create);
router.get('/all-users',all_users);

export default router;