import express from "express";
import {get_all_admin_pages} from "../controllers/admin_pages.Controller.js"
const router = express.Router();

router.get('/all',get_all_admin_pages);

export default router;