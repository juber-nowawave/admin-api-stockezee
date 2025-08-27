import express from "express";
import {get_all_user, get_specific_user, get_all_orders} from "../controllers/app_user.Controller.js"
const router = express.Router();

router.get('/get-user-list',get_all_user);
router.get('/get-details',get_specific_user);
router.get('/get-order-list',get_all_orders);

export default router;