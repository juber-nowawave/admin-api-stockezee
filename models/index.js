import { Sequelize } from "sequelize";
import dotEnv from "dotenv";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
dotEnv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db_config = JSON.parse(
  readFileSync(path.join(__dirname, "../config/db_config.json"), "utf-8")
);
const production = db_config.development;
const sequelize = new Sequelize(
  production.database,
  production.username,
  production.password,
  {
    host: production.host,
    port: production.port,
    dialect: production.dialect,
    dialectOptions: production.dialectOptions,
    timezone: "+05:30",
    logging: false,
  }
);

export const connect_db = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected successfully.");
  } catch (error) {
    console.log("Error occured during connect db");
  }
};
export { sequelize };
