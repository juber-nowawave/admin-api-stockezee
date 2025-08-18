import express from "express";
import {get_all_user} from "../controllers/app_user.Controller.js"
const router = express.Router();

router.get('/get-user-list',get_all_user);

export default router;