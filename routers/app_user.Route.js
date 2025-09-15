import express from "express";
import {get_all_user, get_specific_user, get_all_orders, get_specific_order} from "../controllers/app_user.Controller.js"
const router = express.Router();

router.get('/get-user-list',get_all_user);
router.get('/get-details',get_specific_user);
router.get('/get-order-list',get_all_orders);
router.get('/get-order-details',get_specific_order);


export default router;