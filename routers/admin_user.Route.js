import express from "express";
import {user_create, all_users, remove_admin_user, update_admin_user, get_specific_admin_user } from "../controllers/admin_user.Controller.js"
const router = express.Router();

router.post('/create',user_create);
router.get('/all-users',all_users);
router.post('/delete',remove_admin_user);
router.post('/edit',update_admin_user);
router.get('/get-details',get_specific_admin_user);

export default router;