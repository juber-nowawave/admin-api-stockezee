import express from "express";
import {create_admin_role, get_all_admin_roles, remove_admin_roles, update_admin_roles, get_specific_admin_roles} from "../controllers/admin_roles.Controller.js"
const router = express.Router();

router.post('/create',create_admin_role);
router.get('/all',get_all_admin_roles);
router.post('/delete',remove_admin_roles);
router.post('/edit',update_admin_roles);
router.get('/get-details',get_specific_admin_roles);
export default router;