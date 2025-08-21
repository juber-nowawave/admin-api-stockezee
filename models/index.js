// models/index.js
import { Sequelize } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db_config = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/db_config.json"), "utf-8"));
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

// Load all models
const db = {};
fs.readdirSync(__dirname)
  .filter(file => file !== path.basename(__filename) && file.endsWith(".js"))
  .forEach(file => {
    import(path.join(__dirname, file)).then(module => {
      const model = module.default(sequelize, Sequelize.DataTypes);
      db[model.name] = model;
    });
  });

export const connect_db = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected successfully.");
    await sequelize.sync({ alter: true });
  } catch (error) {
    console.error("Error connecting to DB:", error);
  }
};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

export { sequelize };
export default db;
