import express from "express";
import dotenv from "dotenv";
import {connect_db} from "./models/index.js";
const app = express();
connect_db();
//
app.use(express.urlencoded());
app.use(express.json());

export default app;