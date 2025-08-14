import express from "express";
import { connect_db } from "./models/index.js";
import user_auth_router from "./routers/user_auth.Route.js";
import user_roles_router from "./routers/user_roles.Route.js";
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
app.use("/admin/api/user-roles", user_roles_router);

export default app;
