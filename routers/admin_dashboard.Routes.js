import express from "express";
import {get_dashboard_info} from "../controllers/admin_dashboard.Controller.js"
const router = express.Router();

router.get('/get-details',get_dashboard_info);

export default router;