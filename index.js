import express from "express";
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();
const port = 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`Admin server is running on port ${port}`);
});
