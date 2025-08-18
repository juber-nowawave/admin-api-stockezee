import express from "express";
import { connect_db } from "./models/index.js";
import user_auth_router from "./routers/user_auth.Route.js";
import user_roles_router from "./routers/user_roles.Route.js";
import admin_user_router from "./routers/admin_user.Route.js";
import app_user_router from "./routers/app_user.Route.js"
import cors from "cors";

const app = express();
app.use(cors({
  origin: '*',
}))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connect_db();

app.get("/admin", (req, res) => {
  res.send("Hello Admin!");
});

app.use("/admin/api/user-auth", user_auth_router);
app.use("/admin/api/admin-user", admin_user_router);
app.use("/admin/api/user-roles", user_roles_router);
app.use("/admin/api/app-user",app_user_router);

export default app;
