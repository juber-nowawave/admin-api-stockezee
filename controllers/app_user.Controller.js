import api_response from "../utils/api_response.js";
import { encode_bcrypt, decode_bcrypt } from "../utils/bcrypt.js";
import { generate_token, verify_token } from "../utils/jwt.js";
import { sequelize } from "../models/index.js";
import db from "../models/index.js";
import { where } from "sequelize";
import { types } from "pg";

export const get_all_user = async (req, res) => {
  try {
    const { page_number, page_size, search_keyword, order_by, order_dir } =
      req.query;

    if (!page_number || !page_size || !order_by || !order_dir) {
      return api_response(res, 401, 0, "Missing parameters!", null);
    }

    let data;
    const offset_value = Number(page_size) * (Number(page_number) - 1);
    const valid_dirs = ["asc", "desc"];

    if (!valid_dirs.includes(order_dir.toLowerCase())) {
      return api_response(res, 400, 0, "Invalid order_dir value", null);
    }

    const [total_records] = await db.sequelize.query(`select count(id) from app_users`,{
        type:db.Sequelize.QueryTypes.SELECT
    });
    
    if (search_keyword.trim() != "") {
      data = await db.sequelize.query(
        `
        select * from 
        (select * from app_users where user_name like '%${search_keyword}%' order by id asc limit :page_size offset :offset_value)
        order by ${order_by} ${order_dir};    
      `,
        {
          replacements: {
            page_size: Number(page_size),
            search_keyword: search_keyword.trim(),
            offset_value,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
    } else {
      data = await db.sequelize.query(
        `
        select * from 
        (select * from app_users order by id asc limit :page_size offset :offset_value) 
        order by ${order_by} ${order_dir};    
      `,
        {
          replacements: {
            page_size: Number(page_size),
            offset_value,
          },
          type: db.Sequelize.QueryTypes.SELECT,
        }
      );
    }
    const response = {
      total_items: total_records.count,
      page_number: page_number,
      page_size: page_size,
      items: data,
    };
    return api_response(
      res,
      200,
      1,
      "user data fetched successfully!",
      response
    );
  } catch (error) {
    return api_response(res, 500, 0, "Internal server error", null);
  }
};
