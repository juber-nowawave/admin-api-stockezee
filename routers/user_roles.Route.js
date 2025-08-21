import express from "express";
import {create_user_role, get_all_user_roles, remove_user_roles} from "../controllers/user_roles.Controller.js"
const router = express.Router();

router.post('/create',create_user_role);
router.get('/all',get_all_user_roles);
router.post('/delete',remove_user_roles);

export default router;